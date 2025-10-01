import * as vscode from 'vscode'
import { homedir } from 'os'

export const sleep = (t: number) => new Promise(r => setTimeout(r, t))
export const isDev = () => process.env.NODE_ENV !== 'production'

export function escapeJson(text: string) {
  return text.replace(/[<>\/\u2028\u2029]/g, e => {
    return  {
        '<': '\\u003C',
        '>': '\\u003E',
        '/': '\\u002F',
        '\u2028': '\\u2028',
        '\u2029': '\\u2029'
    }[e] || e
  })
}

export function dictBy<T> (arr: T[], key: keyof T | ((e: T, i: number) => string)): Record<string, T>;
export function dictBy<T> (arr: T[], key: keyof T | ((e: T, i: number) => string), grouping: boolean): Record<string, T[]>;
export function dictBy<T> (arr: T[], key: keyof T | ((e: T, i: number) => string), grouping?: boolean): Record<string, T | T[]> {
  const isFnKey = typeof key === 'function'
  return arr.reduce((dict: Record<string, T | T[]>, e, i) => {
    const k = String(isFnKey ? key(e, i) : e[key])
    if (grouping) {
      if (!dict[k]) dict[k] = [] as T[]
      (dict[k] as T[]).push(e)
    } else {
      if (!dict[k]) {
        dict[k] = e
      }
    }
    return dict
  }, {})
}

export function resolvePath(path: string) {
  return path.replace(/\$\{(.+)\}/g, (e, w) => {
    if (w === 'HOME' || w === 'home') {
      return homedir()
    } else if (w === 'workspaceFolder') {
      return vscode.workspace.workspaceFolders?.[0].uri.fsPath || ''
    }
    return e
  }).replace(/^~/, homedir())
}
