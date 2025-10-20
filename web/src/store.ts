import { createContext, useContext } from 'react'
import debounce from 'lodash.debounce'
import type { ImmerReducer } from 'use-immer'
import { current } from 'immer'
import { createVSCode } from './utils/vscode'
import * as shared from '../../src/views/shared'
import logger from './utils/logger'
import initdata from './utils/initdata'

export const vscode = createVSCode<shared.StateContext, shared.WebMsgEventData>()
const updateVSCodeState = debounce((state: shared.StateContext) => {
  vscode.set(state)
}, 150)

window.addEventListener('load', () => {
  logger.log('web onload')
  vscode.send({type: shared.WebMsgType.ONLOAD})
})

export enum ActionType {
  Hello,
  Clean,
  TextTaskType,
  TextTaskInput,
  TextTaskSubmit,
  TextTaskResult,
}

export type Action = 
  {type: ActionType.Hello; data: string}
  | {type: ActionType.Clean; }
  | {type: ActionType.TextTaskType; data: string}
  | {type: ActionType.TextTaskInput; data: string}
  | {type: ActionType.TextTaskSubmit; data: string}
  | {type: ActionType.TextTaskResult; data: shared.TextTaskItem}

export function initState(): shared.StateContext {
  // Restore from vscode state
  const vsState = vscode.get()
  logger.info('vscode init state', vsState)

  const state: shared.StateContext = {
    ...vsState
  }

  if (!state.text) state.text = {}
  if (!state.text.taskType) {
    state.text!.taskType = initdata.tools?.[0]?.name || ''
  }
  // Save immediately after initialization
  vscode.set(state)
  return state
}

export const storeReducer: ImmerReducer<shared.StateContext, Action & {update?: boolean}> = (state, action) => {
  logger.log('dispatch', ActionType[action.type], action)

  switch (action.type) {
    case ActionType.Clean:
      for (const key in state) {
        // @ts-expect-error
        delete state[key]
      }
      // if (state.text) {
      //   state.text.tasks = []
      // }
      setTimeout(() => {
        vscode.send({
          type: shared.WebMsgType.RELOAD,
        })
      }, 200)
      break
    case ActionType.TextTaskType:
      if (!state.text) state.text = {}
      state.text!.taskType = action.data
      break
    case ActionType.TextTaskInput:
      if (!state.text) state.text = {}
      state.text!.input = action.data
      break
    case ActionType.TextTaskSubmit:
      if (!action.data) break
      if (!state.text) state.text = {}
      if (!state.text.tasks) state.text.tasks = []
      const task = {
        id: `text:${state.text.tasks.length}`,
        type: state.text.taskType!,
        input: action.data,
        at: new Date().toISOString(),
        pending: true,
      }
      state.text.tasks.push(task)
      // Keep at most 50 tasks
      if (state.text.tasks.length > 50) {
        state.text.tasks.shift()
      }
      state.text.input = ''
      vscode.send({
        type: shared.WebMsgType.TEXT_TASK,
        data: task,
      })
      break
    case ActionType.TextTaskResult:
      const taskIndex = state.text!.tasks!.findIndex(t => t.id === action.data.id)
      if (taskIndex < 0) break
      state.text!.tasks![taskIndex] = {
        ...action.data,
        pending: false,
      }
      break
  }

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
