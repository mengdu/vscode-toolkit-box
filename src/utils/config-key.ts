import * as vscode from 'vscode'

export class ConfigKey<T = unknown> {
  constructor (private context: vscode.ExtensionContext, readonly key: string, private defaultValue: T) {}

  async get() {
    return vscode.workspace.getConfiguration().get<T>(this.key) || this.defaultValue
  }

  async set(fn: (v: T) => T, target?: vscode.ConfigurationTarget | boolean | null, override?: boolean) {
    const v = fn(await this.get())
    vscode.workspace.getConfiguration().update(this.key, v, target, override)
  }

  async onChange(fn: () => void) {
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(this.key)) {
        fn()
      }
    }, this.context.subscriptions)
  }
}
