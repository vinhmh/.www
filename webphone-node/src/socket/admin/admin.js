import Client from '../client'
import Socket from '../socket'
import User from '../../models/user'
import handler from './handler'
import Adjustments from '../../libs/adjustments'

const clientEvents = [
  Socket.NEW_USER,
  Socket.PROFILE_UPDATE,
  Socket.UPDATE_USER_STATE,
]

const serverEvents = [
]

export default class Admin extends Socket {
  constructor(props) {
    super(props)
    this.handler = handler
    Admin.all.push(this)
    this.onInit()
  }

  onInit() {
    this.send({ event: Socket.ALL_ADJUSTMENTS, data: Adjustments })
    this.send({ event: Socket.ALL_USERS, data: User.all })
  }

  static all = []

  static channels = {}

  static transmit(event, data, inbound = false) {
    const events = inbound ? serverEvents : clientEvents
    if (!events.some(e => e === event)) return
    Admin.broadcast(event, data)
  }

  static broadcast(event, data) {
    Admin.all.forEach(socket => socket.send({ event, data }))
  }
}
