import { Logger } from 'delog.js'
import { isDev } from './utils'

export default new Logger({
  label: 'web',
  level: isDev() ? 'debug' : 'off'
})
