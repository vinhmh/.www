import store from '../../store'
import * as DebugInfo from '../../reducers/debugInfo'

const dispatch = (func, msg) => {
  if (!CONFIG.sendLogs) return
  store.dispatch(func(msg))
}

const JSONIFY = (content, date = new Date().toJSON(), level = "INFO", topic = "JANUS") => {

  let log = {
    timestamp: date,
    topic: topic,
    level: level,
  }

  if (typeof (content) === 'object') {
    Object.assign(log, content)
  } else {
    log.content = content
  }

  return log
}

export default class Logger {
  static setJanus() {
    ['trace', 'vdebug', 'log', 'warn', 'error'].forEach(item => {
      const origin = Janus[item]
      Janus[item] = function (msg) {
        Logger.janus(msg)
        origin(msg)
      }
    })
  }

  static log(msg) {
    console.log(msg)
  }

  static error(msg) {
    console.error(msg)
    dispatch(DebugInfo.errors, msg)
  }

  static janus(msg) {
    const JSONMsg = JSONIFY(msg)
    dispatch(DebugInfo.janusLog, JSONMsg)
  }
}
