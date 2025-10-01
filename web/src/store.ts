import { createContext, useContext } from 'react'
import debounce from 'lodash.debounce'
import type { ImmerReducer } from 'use-immer'
import { current } from 'immer'
import { createVSCode } from './utils/vscode'
import * as shared from '../../src/views/shared'
import logger from './logger'

export const vscode = createVSCode<shared.StateContext, shared.WebMsgEventData>()
const updateVSCodeState = debounce((state: shared.StateContext) => {
  vscode.set(state)
}, 150)

window.addEventListener('load', () => {
  logger.log('web onload')
  vscode.send({type: shared.WebMsgType.ONLOAD})
})

export enum ActionType {
  Hello
}

export type Action = 
  {type: ActionType.Hello; data: string}


export function initState(): shared.StateContext {
  // Restore from vscode state
  const v = vscode.get()
  if (v) return v as shared.StateContext

  const doc = document.getElementById('doc')
  let state = {
    doc: {}
  }
  if (doc) {
    try {
      state = JSON.parse(doc!.textContent || '')
    } catch (err) {
      console.error(err)
    }
  }
  if (!state.doc) {
    state.doc = {}
  }
  // Save immediately after initialization
  vscode.set(state)
  return state
}

export const storeReducer: ImmerReducer<shared.StateContext, Action & {update?: boolean}> = (state, action) => {
  logger.log('dispatch', ActionType[action.type], action)

  updateVSCodeState(current(state))
  // if (action.update) {
  //   vscode.send({
  //     type: shared.WebMsgType.UPDATE,
  //     data: current(state.doc)
  //   })
  // }
  return state
}

export const Context = createContext<[shared.StateContext, React.Dispatch<Action & {update?: boolean}>]>([initState(), () => {}])

export function useStore() {
  return useContext(Context)
}
