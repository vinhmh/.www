import Socket from './index'

export const userNew = (data) => {
  Socket.send({ event: Socket.NEW_USER, data })
}

export const messageSend = (data) => {
  Socket.send({ event: Socket.MESSAGE_SEND, data })
}
