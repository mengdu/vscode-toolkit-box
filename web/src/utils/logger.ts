import { Logger } from 'delog.js'
import { isDev } from '.'

export default new Logger({
  label: 'web',
  level: isDev() ? 'debug' : 'off'
})
