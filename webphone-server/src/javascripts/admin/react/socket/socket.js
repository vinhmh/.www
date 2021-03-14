import EventEmitter from 'events'
import { onOpen, onClose, onMessage, onReconnect } from '../reducers/socket'
import * as constants from './constants'
import * as sender from './sender'

const MAX_CONNECTION_ATTEMPTS = 60  // Stop connection attempts after 60s
const ATTEMPT_DELAY_MS = 1000       // Delay before 2 attempts 

class Socket extends EventEmitter {
  constructor() {
    super()
    this.sender = sender
    this.observer = new Set()
    this.dispatch = null
    this.retried = 0
    // load constants as props for handy access
    Object.keys(constants).forEach(c => this[c] = constants[c])
  }

  init = async (dispatch) => {
    this.dispatch = dispatch
    this.connectWebSocket()
  }

  connectWebSocket = () => {
    this.connection = new WebSocket(`${CONFIG.wsUrl}?secretToken=${CONFIG.secretToken}`)
    this.connection.onopen = () => this.onOpen()
    this.connection.onclose = (event) => this.onClose(event)
    this.connection.onmessage = msg => this.onMessage(msg)
    this.connection.onerror = (error) => this.onError(error)
  }

  addCallback(event, callback) {
    if (this.observer.has(event)) return callback.call()
    this.once(event, callback)
  }

  onOpen() {
    console.log(`Connection opened`)
    this.resetAttempt()
    this.dispatch(onOpen())
  }

  onClose(event) {
    if (event.wasClean) {
      console.log(`Connection closed cleanly with code '${event.code}' and reason '${event.reason}'`);
    } else {
      console.log(`Connection died (down: code=1006 or killed) with code '${event.code}' and reason '${event.reason}'`)
    }
    if (this.retried < MAX_CONNECTION_ATTEMPTS) {
      this.dispatch(onReconnect())
      this.reconnectAttempt()
    } else {
      console.log(`Stop attempts`);
      this.resetAttempt();
      this.dispatch(onClose())
    }
  }

  reconnectAttempt() {
    this.retried++
    console.log(`Attempt #${this.retried}`)
    this.connection.close()
    this.connection = null
    setTimeout(() => {
      console.log(`Try to connect`)
      this.connectWebSocket()
    }, ATTEMPT_DELAY_MS)
  }

  resetAttempt() {
    console.log(`Reset attempts`)
    this.retried = 0
  }

  onMessage(msg) {
    try {
      const data = JSON.parse(msg.data)
      this.dispatch(onMessage(data))
    } catch (e) {
      console.error(e.stack)
    }
  }

  onError(error) {
    console.log(`Got a connection error '${JSON.stringify(error)}'`)
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
