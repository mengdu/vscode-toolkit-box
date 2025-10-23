import { ActionType, useStore, vscode } from '../store'
import * as shared from '../../../src/views/shared'
import { resolveMediaURL } from '../utils'
import { useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import initdata from '../utils/initdata'
import { IconCopy, IconEdit, IconSend } from '../icons'

const toolsMap = initdata.tools.reduce<Record<string, {label: string}>>((acc, cur) => {
  acc[cur.name] = cur
  return acc
}, {})

function TextTaskInput() {
  const [state, dispatch] = useStore()
  const [focused, setFocused] = useState(false)
  return (
    <div data-focused={focused} className={`bg-[var(--vscode-input-background)] px-[5px] py-[5px] border-[1px] border-[var(--vscode-panel-border)] rounded-[5px] ${focused ? '!border-[var(--vscode-focusBorder)]' : ''}`}>
      <div className="relative text-[13px] leading-[17px] min-h-[65px] max-h-[50vh]">
        <textarea
          className="block w-full h-full absolute top-0 left-0 box-border bg-transparent font-[inherit] [font-size:inherit] [letter-spacing:inherit] overflow-hidden border-none outline-none resize-none placeholder:text-[var(--vscode-input-placeholderForeground)]"
          placeholder="Input string here..."
          value={state.text?.input}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onChange={e => dispatch({
            type: ActionType.TextTaskInput,
            data: e.target.value
          })}
          onKeyDown={e => {
            if (e.key === 'Enter') {
              if (e.shiftKey) return
              // onCompositionStart
              if (e.nativeEvent.isComposing) return

              e.preventDefault()
              dispatch({
                type: ActionType.TextTaskSubmit,
                data: state.text?.input || ''
              })
            }
          }}
          ></textarea>
        <div className="relative box-border w-full text-transparent overflow-hidden whitespace-pre-wrap break-words pointer-events-none"><span className="invisible">{state.text?.input}</span>&nbsp;</div>
      </div>
      <div className="flex items-center">
        <div className="flex-1">
          <select
            className="inline-block w-[150px] border-none outline-none rounded-2xl px-[4px] py-[2px] bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)]"
            value={state.text?.taskType}
            onChange={e => dispatch({type: ActionType.TextTaskType, data: e.target.value})}
          >
            {initdata.tools?.map((e, i) => {
              return (
                <option key={i} value={e.name}>{e.label}</option>
              )
            })}
          </select>
        </div>
        <div>
          <button className={`px-[8px] py-[4px] rounded-[4px] cursor-pointer bg-[var(--vscode-button-background)] text-[var(--vscode-button-foreground)] hover:bg-[var(--vscode-button-hoverBackground)] flex items-center ${!state.text?.input ? 'opacity-80' : ''}`} onClick={() => {
            if (!state.text?.input) return
            dispatch({
              type: ActionType.TextTaskSubmit,
              data: state.text?.input || ''
            })
          }}>Send&nbsp;<IconSend className="w-[16px] h-[16px]" /></button>
        </div>
      </div>
    </div>
  )
}

function TextTaskList(props: {
  onChat: () => void
}) {
  const [state, dispatch] = useStore()

  useEffect(() => {
    props.onChat()
  }, [state.text?.tasks])

  if (!state.text?.tasks?.length) {
    return (
      <div className="w-full h-full flex flex-col justify-center items-center select-none">
        <img className="brightness-0 opacity-30 pointer-events-none" width={80} height={80} src={resolveMediaURL('/media/icon.svg')} />
        <h1 className="mt-[30px] [font-size:30px] font-bold text-black/30 font-mono">TOOLKIT BOX</h1>
      </div>
    )
  }

  return (
    <div>
      <ul className="space-y-4">
        {state.text?.tasks?.map((e, i) => {
          return (
            <li key={i} className="">
              <div className="space-y-2">
                <div data-id={e.id} className="group flex flex-row-reverse">
                  <img className="w-[22px] h-[22px] ml-[10px] mt-[3px] rounded-[4px]" src={resolveMediaURL('/media/me.svg')} />
                  <div className="flex flex-col items-end">
                    <div className="px-[7px] py-[5px] bg-green-400 text-black/90 rounded-[5px] break-all whitespace-pre-wrap relative arrow-right after:border-l-green-400 w-fit">{e.input}</div>
                    <div className="flex flex-row items-center justify-end mt-[5px] h-[16px]">
                      <button
                        className="hidden px-[3px] py-[2px] rounded-[5px] cursor-pointer opacity-80 group-hover:inline-block hover:bg-gray-600/15 active:scale-90"
                        title='Copy'
                        onClick={() => {
                          navigator.clipboard.writeText(e.input || '')
                        }}><IconCopy className="w-[12px] h-[12px]"/></button>
                      <button
                        className="hidden px-[3px] py-[2px] rounded-[5px] cursor-pointer opacity-80 group-hover:inline-block hover:bg-gray-600/15 active:scale-90"
                        title='Edit'
                        onClick={() => {
                          dispatch({
                            type: ActionType.TextTaskInput,
                            data: e.input || ''
                          })
                        }}><IconEdit className="w-[12px] h-[12px]"/></button>
                    </div>
                  </div>
                </div>
                <div data-id={e.id} className="group flex flex-row">
                  <img className="w-[22px] h-[22px] mr-[10px] mt-[3px] rounded-[4px]" src={resolveMediaURL('/media/icon.svg')} />
                  <div>
                    <div className="px-[7px] py-[5px] bg-[#b3b3b3]/15 rounded-[5px] break-all whitespace-pre-wrap relative arrow-left w-fit">
                      {e.pending
                      ? 'pending...'
                      : e.error
                        ? `error: ${e.error}`
                        : e.output || ' '
                      }
                    </div>
                    <div className="flex flex-row items-center justify-end mt-[5px] h-[16px]">
                      <button
                        className="hidden px-[3px] py-[2px] rounded-[5px] cursor-pointer opacity-80 group-hover:inline-block hover:bg-gray-600/15 active:scale-90"
                        title='Copy'
                        onClick={() => {
                          navigator.clipboard.writeText(e.output || '')
                        }}><IconCopy className="w-[12px] h-[12px]"/></button>
                      <button
                        className="hidden px-[3px] py-[2px] rounded-[5px] cursor-pointer opacity-80 group-hover:inline-block hover:bg-gray-600/15 active:scale-90"
                        title='Edit'
                        onClick={() => {
                          dispatch({
                            type: ActionType.TextTaskInput,
                            data: e.output || ''
                          })
                        }}><IconEdit className="w-[12px] h-[12px]"/></button>
                      <span className="px-[5px] inline-block rounded-2xl text-[8px] opacity-50">{toolsMap[e.type]?.label}</span>
                    </div>
                  </div>
                </div>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}

const scrollTopKey = 'chat-record-scroll-top'

export default function TextTools() {
  const ref = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    if (!ref.current) return
    const el = ref.current
    ref.current.scrollTo({
      top: Number(localStorage.getItem(scrollTopKey)) || 0,
      behavior: 'auto'
    })
    return () => {
      localStorage.setItem(scrollTopKey, String(el.scrollTop))
    }
  }, [])
  return (
    <div className="flex flex-col h-full">
      <div ref={ref} className="flex-auto overflow-auto px-[15px] py-[15px]">
        <TextTaskList onChat={() => {
          if (!ref.current) return
          ref.current.scrollTo({
            top: ref.current.scrollHeight,
            behavior: 'smooth'
          })
          localStorage.setItem(scrollTopKey, String(ref.current.scrollHeight))
        }} />
      </div>
      <div className="px-[15px] py-[15px]">
        <TextTaskInput />
      </div>
    </div>
  )
}
