import { Logger } from 'delog.js'
import { isDev } from './utils'

export default new Logger({
  level: isDev() ? 'debug' : 'off'
})
