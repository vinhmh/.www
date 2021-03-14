import Socket from '../socket'
import handler from './handler'
import Admin from '../admin'

export default class Client extends Socket {
  constructor(props) {
    super(props)
    this.handler = handler
    Client.all.push(this)
  }

  onMessageCallback = (event, data) => {
    Admin.transmit(event, data, true)
  }

  static all = []

  static channels = {}

  static onBroadcastCallback(event, data) {
    Admin.transmit(event, data)
  }
}
