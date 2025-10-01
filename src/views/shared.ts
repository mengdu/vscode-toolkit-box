export interface StateContext {
  
}

export enum WebMsgType {
  ONLOAD,
  RELOAD,
}

export type WebMsgEventData =
  {type: WebMsgType.ONLOAD}
  | { type: WebMsgType.RELOAD }

export enum ExtMsgType {
  CHANGE
}

export type ExtMsgEventData =
  {type: ExtMsgType.CHANGE; data: any}
