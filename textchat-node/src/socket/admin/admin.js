import Client from '../client'
import Socket from '../socket'
import handler from './handler'
import * as Sender from './sender'

const subscribedClientEvents = [
  // Socket.USER_NEW,
  // Socket.USER_UPDATE
]

export default class Admin extends Socket {
  constructor(props) {
    super(props)
    this.handler = handler
  }

  static all = [] // array of all socket instances

  static channels = {} // {channel_name: Set [ instanceId ]}

  static add(connection) {
    const socket = new Admin(connection)
    Admin.all.push(socket)
    Sender.usersAll()
    return socket
  }

  static transmit(event, data) {
    if (!subscribedClientEvents.some(e => e === event)) return
    Admin.broadcast(event, data)
  }

  static broadcast(event, data) {
    Admin.all.forEach(socket => socket.send({ event, data }))
  }
}
