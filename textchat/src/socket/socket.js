import EventEmitter from 'events'
import { onOpen, onClose, onMessage } from '../reducers/socket'
import * as constants from './constants'
import * as sender from './sender'

class Socket extends EventEmitter {
  constructor() {
    super()
    this.sender = sender
    this.observer = new Set()
    this.dispatch = null
    // load constants as props for handy access
    Object.keys(constants).forEach(c => this[c] = constants[c])
  }

  init = (dispatch, data) => {
    this.dispatch = dispatch
    this.connection = new WebSocket(CONFIG.wsUrl)
    this.connection.onopen = () => this.onOpen(data)
    this.connection.onclose = () => this.onClose()
    this.connection.onmessage = msg => this.onMessage(msg)
  };

  addCallback(event, callback) {
    if (this.observer.has(event)) return callback.call()
    this.once(event, callback)
  }

  onOpen(data) {
    this.dispatch(onOpen(data))
  }

  onClose() {
    this.dispatch(onClose())
  }

  onMessage(msg) {
    try {
      const data = JSON.parse(msg.data)
      this.dispatch(onMessage(data))
    } catch (e) {
      console.error(e.stack)
    }
  }

  send(data) {
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
