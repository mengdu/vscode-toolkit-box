import * as shared from '../shared'
import crypto from 'crypto'
import * as native from './native'
import { Parser as ExprEval } from 'expr-eval'

export const router: {
  name: string
  label: string
  fn: (task: shared.TextTaskItem) => Promise<void>
}[] = []

function define(name: string, label: string, fn: (task: shared.TextTaskItem) => Promise<void>) {
  if (router.find(e => e.name === name)) {
    throw new Error(`Handle "${name}" already exists.`)
  }
  router.push({ name, label, fn })
}

export const handle = async function (task: shared.TextTaskItem) {
  const fn = router.find((e) => e.name === task.type)
  if (fn) {
    return fn.fn(task)
  }
  throw new Error('Unknown task type: ' + task.type)
}

define('base64-encode', 'Base64 Encode', async (task) => {
  task.output = Buffer.from(task.input).toString('base64')
})

define('base64-decode', 'Base64 Decode', async (task) => {
  task.output = Buffer.from(task.input, 'base64').toString('utf8')
})

define('encode-uri', 'URL Encode', async (task) => {
  task.output = encodeURI(task.input)
})

define('decode-uri', 'URL Decode', async (task) => {
  task.output = decodeURI(task.input)
})

define('encode-uri-component', 'URI Component Encode', async (task) => {
  task.output = encodeURIComponent(task.input)
})

define('decode-uri-component', 'URI Component Decode', async (task) => {
  task.output = decodeURIComponent(task.input)
})

define('html-entities-encode', 'HTML Entities Encode', async (task) => {
  task.output = task.input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
})

define('html-entities-decode', 'HTML Entities Decode', async (task) => {
  task.output = task.input
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
})

define('hex-encode', 'Hex Encode', async (task) => {
  task.output = Buffer.from(task.input).toString('hex')
})

define('hex-decode', 'Hex Decode', async (task) => {
  task.output = Buffer.from(task.input, 'hex').toString('utf8')
})

define('native-ascii', 'Native -> ASCII', async (task) => {
  task.output = native.nativeToAscii(task.input)
})

define('ascii-native', 'ASCII -> Native', async (task) => {
  task.output = native.asciiToNative(task.input)
})

define('base-2', 'Number Base-2', async (task) => {
  const n = Number(task.input)
  if (Number.isNaN(n)) {
    task.output = 'NaN'
    return
  }
  task.output = '0b' + n.toString(2)
})

define('base-8', 'Number Base-8', async (task) => {
  const n = Number(task.input)
  if (Number.isNaN(n)) {
    task.output = 'NaN'
    return
  }
  task.output = '0o' + n.toString(8)
})

define('base-16', 'Number Base-16', async (task) => {
  const n = Number(task.input)
  if (Number.isNaN(n)) {
    task.output = 'NaN'
    return
  }
  task.output = '0x' + n.toString(16)
})

define('base-36', 'Number Base-36', async (task) => {
  const n = Number(task.input)
  if (Number.isNaN(n)) {
    task.output = 'NaN'
    return
  }
  task.output = n.toString(36)
})

define('number-parse', 'Number Parse', async (task) => {
  task.output = Number(task.input).toString(10)
})

define('ascii-decimal', 'ASCII Decimal', async (task) => {
  task.output = task.input
    .split('')
    .map((c) => `${c}(${c.charCodeAt(0)})`)
    .join(' ')
})

define('md5', 'MD5', async (task) => {
  task.output = crypto.createHash('md5').update(task.input).digest('hex')
})

define('sha1', 'SHA-1', async (task) => {
  task.output = crypto.createHash('sha1').update(task.input).digest('hex')
})

define('sha256', 'SHA-265', async (task) => {
  task.output = crypto.createHash('sha256').update(task.input).digest('hex')
})

define('jwt-parse', 'JWT Parse', async (task) => {
  const [header, payload, signature] = task.input.split('.')
  task.output = JSON.stringify({
    header: JSON.parse(Buffer.from(header, 'base64').toString('utf8')),
    payload: JSON.parse(Buffer.from(payload, 'base64').toString('utf8')),
    signature: signature
  }, null, 2)
})

define('json-parse', 'JSON Parse', async (task) => {
  task.output = JSON.stringify(JSON.parse(task.input), null, 2)
})

define('json-stringify', 'JSON Stringify', async (task) => {
  task.output = JSON.stringify(JSON.parse(task.input))
})

define('date-parse', 'Date Parse', async (task) => {
  task.output = new Date(/^\d+$/.test(task.input) ? +task.input : task.input).toISOString()
})

define('string-stats', 'String Stats', async (task) => {
  task.output = [
    `Length: ${task.input.length}`,
    `Chars: ${Array.from(task.input).length}`,
    `Bytes: ${Buffer.from(task.input).length}`,
    `Lines: ${task.input.split(/\n/).length}`,
    `Spaces: ${(task.input.match(/\s/g) || []).length}`,
    // `Emojis: ${(task.input.match(/\p{Emoji}/gu) || []).length}`,
    `Leading Spaces: ${(task.input.match(/^\s+/) || [''])[0].length}`,
    `Trailing Spaces: ${(task.input.match(/\s+$/) || [''])[0].length}`,
    `Zero Chars: ${(task.input.match(/[\u200B\u200C\u200D\uFEFF]/g) || []).length}`,
  ].join('\n')
})

// define('uuid-v1', 'UUID v1', async (task) => {
//   task.output = 'todo'
// })

// define('uuid-v2', 'UUID v2', async (task) => {
//   task.output = 'todo'
// })

define('random-bytes', 'Random Bytes', async (task) => {
  const len = Math.min(Math.abs(~~task.input) || 16, 128)
  task.output = crypto.randomBytes(len).toString('base64')
})

// define('totp', 'TOTP', async (task) => {
//   task.output = 'todo'
// })

const parse = new ExprEval({
  operators: {
    add: true,
    subtract: true,
    multiply: true,
    divide: true,
    power: true,
    remainder: false,
    factorial: false,
    logical: false,
    comparison: false,
    concatenate: false,
    conditional: false,
  }
})

define('arithmetic-operations', 'Arithmetic Operations', async (task) => {
  task.output = String(parse.evaluate(task.input))
})
