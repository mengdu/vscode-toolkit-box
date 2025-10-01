import type { WebviewApi } from 'vscode-webview'

export class VSCodeApi<T = unknown, A = unknown> {
  vscode: WebviewApi<T>
  constructor () {
    this.vscode = acquireVsCodeApi<T>()
  }
  set (state: T) {
    this.vscode.setState(state)
  }

  get () {
    return this.vscode.getState()
  }

  update (handler: (state: T) => T | void) {
    const state = this.get() || {} as T
    const result = handler(state)
    this.set(result === undefined ? state : result)
  }

  send (data: A) {
    this.vscode.postMessage(data)
  }
}

let api: VSCodeApi<unknown, unknown> | null = null

export function createVSCode<A, B>() {
  if (!api) {
    api = new VSCodeApi<A, B>()
  }
  return api as VSCodeApi<A, B>
}
