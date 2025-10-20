import * as vscode from 'vscode'
import { ToolkieBoxView } from './views/toolkitbox'

export function activate(context: vscode.ExtensionContext) {
  ToolkieBoxView.register(context)
}

export function deactivate() {}
