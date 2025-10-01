import { useEffect, type ReactNode } from 'react'
import { useImmerReducer } from 'use-immer'
import { initState, storeReducer, Context, ActionType } from './store'
import * as shared from '../../src/views/shared'

export function StoreContext(props: {
  children: ReactNode
}) {
  const [state, dispatch] = useImmerReducer(storeReducer, initState())
  const handleMessage = (e: MessageEvent<shared.ExtMsgEventData>) => {
    console.log('message', shared.ExtMsgType[e.data.type], e.data)
    switch (e.data.type) {
      // case shared.ExtMsgType.CHANGE:
      //   dispatch({
      //     type: ActionType.SET_CHANGE,
      //     data: e.data.data,
      //   })
      //   break
    }
  }
  useEffect(() => {
    window.addEventListener('message', handleMessage, false)
    return () => {
      window.removeEventListener('message', handleMessage, false)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return (
    <Context.Provider value={[state, dispatch]}>{props.children}</Context.Provider>
  )
}
