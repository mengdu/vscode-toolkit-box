import * as vscode from 'vscode'

export class KeyStore<T = unknown> {
  constructor (private memen: vscode.Memento, readonly key: string, private defaultValue: T) {}
  async get() {
    return await this.memen.get<T>(this.key) || this.defaultValue
  }

  async set(fn: (v: T) => (T | undefined | Promise<T | undefined>)) {
    const v = await this.get()
    const nv = await fn(v)
    await this.memen.update(this.key, nv)
  }

  async clean() {
    await this.memen.update(this.key, undefined)
  }
}
