export interface InitData {
  tools: {
    name: string
    label: string
  }[]
}

export interface StateContext {
  text?: {
    input?: string
    taskType?: string
    tasks?: TextTaskItem[]
  }
}

export interface TextTaskItem {
  id: string
  type: string
  input: string
  at: string
  pending?: boolean
  output?: string
  error?: string
}

export enum WebMsgType {
  ONLOAD,
  RELOAD,
  TEXT_TASK,
}

export type WebMsgEventData =
  {type: WebMsgType.ONLOAD}
  | { type: WebMsgType.RELOAD }
  | { type: WebMsgType.TEXT_TASK; data: TextTaskItem }

export enum ExtMsgType {
  CHANGE,
  TEXT_CLEAN_STATE,
  TEXT_TASK_RESULT,
}

export type ExtMsgEventData =
  {type: ExtMsgType.CHANGE; data: any}
  | {type: ExtMsgType.TEXT_CLEAN_STATE}
  | {type: ExtMsgType.TEXT_TASK_RESULT; data: TextTaskItem}
