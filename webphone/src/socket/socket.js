import EventEmitter from 'events'
import { onOpen, onClose, onMessage } from '../reducers/socket'
import * as constants from './constants'
import * as sender from './sender'
import Logger from '../utilities/logger'

class Socket extends EventEmitter {
  constructor() {
    super()
    this.sender = sender
    this.observer = new Set()
    this.dispatch = null
    this.timeout = null
    this.data = null
    // load constants as props for handy access
    Object.keys(constants).forEach(c => this[c] = constants[c])
  }

  init = (dispatch, data) => {
    this.data = data
    this.dispatch = dispatch
    this.connect()
  };

  connect = () =>  {
    this.connection = new WebSocket(CONFIG.wsUrl)
    this.connection.onopen = () => this.onOpen(this.data)
    this.connection.onclose = () => this.onClose()
    this.connection.onmessage = msg => this.onMessage(msg)
  }

  addCallback(event, callback) {
    if (this.observer.has(event)) return callback.call()
    this.once(event, callback)
  }

  onOpen(data) {
    clearTimeout(this.timeout)
    this.sender.newUser(data)
    this.dispatch(onOpen())
  }

  onClose() {
    this.dispatch(onClose())
    if (window.WEBPHONE_DISABLE_RECONNECT) return

    this.timeout = setTimeout(() => window.location.reload(true), 2000)
  }

  onMessage(msg) {
    try {
      const data = JSON.parse(msg.data)
      this.dispatch(onMessage(data))
    } catch (e) {
      Logger.error(e.stack)
    }
  }

  send(data) {
    if (!this.connection) return
    this.connection.send(JSON.stringify(data))
  }

  close() {
    if (this.connection) {
      this.connection.close()
      this.connection = null
    }
  }
}

export default new Socket()
