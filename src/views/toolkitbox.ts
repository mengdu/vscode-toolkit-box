import * as vscode from 'vscode'
import * as utils from '../utils/utils'
import * as consts from '../utils/consts'
import logger from '../utils/logger'
import * as shared from './shared'
import * as text from './text'

export const getWebviewHtml = async (context: vscode.ExtensionContext, webview: vscode.Webview, initData: string) => {
  const resolve = (file: string) => webview.asWebviewUri(vscode.Uri.joinPath(context.extensionUri, file)).toString()
  const mediaBaseURL = JSON.stringify(resolve(''))
  let html = ''
  if (utils.isDev()) {
    const res = await fetch(consts.WEB_DEV_URL)
    html = await res.text()
    html = html.replace(/\/_DIST_/g, consts.WEB_DEV_URL)
  } else {
    const file = vscode.Uri.joinPath(context.extensionUri, 'dist', 'web', 'index.html')
    logger.info(`Reading webview html from ${file}`)
    html = await vscode.workspace.fs.readFile(file).then(buffer => buffer.toString())
    html = html.replace(/\/_DIST_/g, resolve('dist/web'))
  }
  return html.replace('__MEDIA_BASE_URL__', mediaBaseURL).replace('<!-- init-state -->', initData)
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

    const state: shared.InitData = {
      tools: text.router.map(e => {
        return {
          name: e.name,
          label: e.label,
        }
      })
    }
    webviewView.webview.html = await getWebviewHtml(this.context, webviewView.webview, utils.escapeJson(JSON.stringify(state))).catch(err => {
      logger.error('getWebviewHtml err:', err)
      return err.message
    })
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
