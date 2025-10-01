import * as vscode from 'vscode'
import logger from './utils/logger'
import { ToolkieBoxView } from './views/toolkitbox'
// import { HTTPEditorProvider } from './editor/http/provider'
// import { GRPCEditorProvider } from './editor/grpc/provider'
// import { ENVEditorProvider } from './editor/env/provider'
// import { EnvironmentTreeView } from './tree-view-environment'
// import { Apimanrc } from './utils/apimanrc'
// import { EnvManager } from './utils/env-manager'

export function activate(context: vscode.ExtensionContext) {
  logger.log('activate')
  logger.log('env:', process.env.NODE_ENV)

  ToolkieBoxView.register(context)

  // const rc = new Apimanrc(context)
  // const env = new EnvManager(context, rc)

  // EnvironmentTreeView.register(context, rc, env)

  // HTTPEditorProvider.register(context, {env})
  // GRPCEditorProvider.register(context, {rc, env})
  // ENVEditorProvider.register(context, {env})

  context.subscriptions.push(vscode.commands.registerCommand('vscode-toolkit-box.cmd.sayHello', async () => {
    vscode.window.showInformationMessage('Hello')
  }))
}

export function deactivate() {}
