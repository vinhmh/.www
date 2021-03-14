import Socket from './index'

export const userNew = (data) => {
  Socket.send({ event: Socket.NEW_USER, data })
}

export const messageSend = (data) => {
  Socket.send({ event: Socket.MESSAGE_SEND, data })
}

export const meetingNew = (data) => {
  Socket.send({ event: Socket.NEW_MEETING, data })
}

export const deleteChat = (data) => {
  Socket.send({ event: Socket.DELETE_CHAT, data })
}

export const removeUser = (data) => {
  Socket.send({ event: Socket.REMOVE_USER, data })
}

export const fileUpload = (data) => {
  Socket.sendArrayBuffer({ event: Socket.FILE_UPLOAD, data })
}