import * as vscode from 'vscode'
import * as utils from '../utils/utils'
import * as consts from '../utils/consts'
import logger from '../utils/logger'
import * as shared from './shared'
import * as text from './text'

export const getWebviewHtml = async (context: vscode.ExtensionContext, webview: vscode.Webview) => {
  const resolve = (file: string) => webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, file)).toString()
  const mediaBaseURL = JSON.stringify(resolve(''))
  const js = utils.isDev()
    ? `<script>window.mediaBaseURL = ${mediaBaseURL}</script>
      <script type="module">
        import RefreshRuntime from "${consts.WEB_HOST}/@react-refresh"
        RefreshRuntime.injectIntoGlobalHook(window)
        window.$RefreshReg$ = () => {}
        window.$RefreshSig$ = () => (type) => type
        window.__vite_plugin_react_preamble_installed__ = true
      </script>
      <script type="module" src="${consts.WEB_HOST}/@vite/client"></script>
      <script type="module" src="${consts.WEB_HOST}/src/main.tsx"></script>`
    : `<script>window.mediaBaseURL = ${mediaBaseURL}</script>
      <script type="module" crossorigin src="${resolve(`dist/web/js/index.js`)}"></script>`
  const css = utils.isDev()
    ? ''
    : `<link rel="stylesheet" crossorigin href="${resolve(`dist/web/assets/common.css`)}">
      <link rel="stylesheet" crossorigin href="${resolve(`dist/web/assets/index.css`)}">`
  
  return `
    <!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        ${css}
        <script type="text/json" id="doc"><!-- init-state --></script>
      </head>
      <body>
        <div id="root"></div>
        ${js}
      </body>
    </html>`
}

export class ToolkieBoxView implements vscode.WebviewViewProvider {
  static register (context: vscode.ExtensionContext) {
		const provider = new ToolkieBoxView(context)
		context.subscriptions.push(vscode.window.registerWebviewViewProvider('vscode-toolkit-box.views.home', provider, {
      webviewOptions: {
        retainContextWhenHidden: true
      }
    }))

    context.subscriptions.push(vscode.commands.registerCommand('vscode-toolkit-box.cmd.reloadWebview', () => {
      vscode.commands.executeCommand('workbench.action.webview.reloadWebviewAction')
    }))

    context.subscriptions.push(vscode.commands.registerCommand('vscode-toolkit-box.cmd.cleanState', () => {
      provider.view.webview.postMessage({
        type: shared.ExtMsgType.TEXT_CLEAN_STATE
      })
    }))
	}

  view!: vscode.WebviewView
  constructor (readonly context: vscode.ExtensionContext) {}

	public async resolveWebviewView (webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken) {
		webviewView.webview.options = {
			enableScripts: true
		}

    let html = await getWebviewHtml(this.context, webviewView.webview).catch(err => {
      logger.error('getWebviewHtml err:', err)
      return err.message
    })
    const state: shared.InitData = {
      tools: text.router.map(e => {
        return {
          name: e.name,
          label: e.label,
        }
      })
    }
    html = html.replace('<!-- init-state -->', utils.escapeJson(JSON.stringify(state)))
    webviewView.webview.html = html
    this.view = webviewView
    this.onDidReceiveMessage(webviewView)
	}

  onDidReceiveMessage (web: vscode.WebviewView) {
    // 监听来自webview的消息
		web.webview.onDidReceiveMessage((e: shared.WebMsgEventData) => {
			logger.log('onDidReceiveMessage:', shared.WebMsgType[e.type], e)
			// web.webview.postMessage({ type: 'pong', value: ['done'] })
      switch (e.type) {
        case shared.WebMsgType.ONLOAD:
          // todo
          break
        case shared.WebMsgType.RELOAD:
          // https://github.com/microsoft/vscode/issues/124212
          vscode.commands.executeCommand('workbench.action.webview.reloadWebviewAction')
          break
        case shared.WebMsgType.TEXT_TASK:
          text.handle(e.data).then(() => {
            web.webview.postMessage({
              type: shared.ExtMsgType.TEXT_TASK_RESULT,
              data: e.data
            })
          }).catch(err => {
            logger.error(err)
            e.data.error = err.message
            web.webview.postMessage({
              type: shared.ExtMsgType.TEXT_TASK_RESULT,
              data: e.data
            })
          })
          break
      }
		})
    web.onDidDispose(() => {
      logger.log('onDidDispose')
    })
  }
}
