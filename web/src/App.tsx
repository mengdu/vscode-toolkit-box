import { vscode } from './store'
import * as shared from '../../src/views/shared'

export default function App() {
  return (
    <div>
      <button className="btn" onClick={() => vscode.send({type: shared.WebMsgType.RELOAD})}>Hello</button>
    </div>
  )
}
