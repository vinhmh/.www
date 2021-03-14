import EventEmitter from 'events'
import config from '../../config'
import SocketSerializer from '../serializers/socket'
import * as constants from './constants'
import Admin from './admin'
import Client from './client'

let id = 0

export default class Socket extends EventEmitter {
  constructor(connection) {
    super()
    this.id = ++id
    this.connection = connection
    this.channels = new Set()
    this.user = null
    this.observer = new Set()
    this.connection.on('message', this.onMessage)
    this.connection.on('close', this.onClose)
  }

  trigger = (event, data) => {
    this.observer.add(event)
    this.emit(event, data)
  }

  addCallback(event, callback) {
    if (this.observer.has(event)) return callback.call()
    this.once(event, callback)
  }

  onMessage = (message) => {
    try {
      const msg = JSON.parse(message.utf8Data)
      this.handler(msg.event, this, msg.data)
      this.onMessageCallback(msg.event, msg.data)
    } catch (e) {
      console.error(`Error receiving message: ${e}`)
    }
  }

  onMessageCallback(event, data) {
    //callback
  }

  onClose = () => {
    this.cleanUpSocket()
    this.trigger(Socket.CLOSED)
    // Let time for socket to trigger the event and delete the user before removing listeners
    setTimeout(this.removeAllListeners, 5000)
  }

  send(data) {
    try {
      this.connection.sendUTF(JSON.stringify(data))
    } catch (e) {
      console.error(`Error sending message: ${e}`)
    }
  }

  close() {
    console.log('Closing socket')
    this.onClose()
    if (this.connection) {
      this.connection.close()
      this.connection = null
    }
  }

  cleanUpSocket() {
    let socketIds
    const Class = this.constructor
    const index = Class.all.indexOf(this)
    if (index !== -1) Class.all.splice(index, 1) // remove from sockets list

    this.channels.forEach((item) => { // remove id from channels obj
      socketIds = Class.channels[item]
      if (!socketIds) return
      socketIds.delete(this.id)
      if (!socketIds.size) delete Class.channels[item]
    })
  }

  addChannel(...channel) {
    const Class = this.constructor
    const add = (channel) => {
      if (channel instanceof Array || channel instanceof Set) {
        channel.forEach(item => add(item))
        return
      }
      Class.channels[channel] || (Class.channels[channel] = new Set())
      Class.channels[channel].add(this.id)
      this.channels.add(channel)
    }
    add(channel)
  }

  toJSON() {
    return SocketSerializer(this)
  }

  static broadcast(channel, event, data) {
    let socket
    let ids
    const socketIds = new Set()

    const bc = (channel) => {
      if (Array.isArray(channel)) return channel.forEach(item => bc(item))
      ids = this.channels[channel]
      if (!ids) return
      ids.forEach(id => socketIds.add(id))
    }

    bc(channel)

    socketIds.forEach((id) => {
      socket = this.find(id)
      if (socket) socket.send({ event, data })
    })

    this.onBroadcastCallback(event, data)
  }

  static onBroadcastCallback(event, data) {
    //callback
  }

  static find(id) {
    return this.all.find(socket => socket.id === id)
  }

  static byUser(userId) {
    return this.all.find(socket => socket.user && socket.user.id === userId)
  }

  static create(connection, options = {}) {
    let Class = Client
    const { secretToken } = options.query || {}
    if (secretToken) {
      if (secretToken !== config.secretToken) return connection.close()
      Class = Admin
    }
    return new Class(connection, options)
  }
}

for (const c in constants) Socket[c] = constants[c]
