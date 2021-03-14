import Socket from '.'

export const userChange = (channel, data) => {
  Socket.broadcast(channel, Socket.USER_CHANGE, data)
}

export const userUpdate = (channel, data) => {
  Socket.broadcast(channel, Socket.USER_UPDATE, data)
}

export const messagesChange = (channel, data) => {
  Socket.broadcast(channel, Socket.MESSAGES_CHANGE, data)
}

export const messagesUpdateUser = (channel, data) => {
  Socket.broadcast(channel, Socket.MESSAGES_UPDATE_USER, data)
}

export const appLoaded = (channel, data) => {
  Socket.broadcast(channel, Socket.APP_LOADED, data)
}

export const messagesAdd = (channel, data) => {
  Socket.broadcast(channel, Socket.MESSAGES_ADD, data)
}

export const meetingsAdd = (channel, data) => {
  Socket.broadcast(channel, Socket.MEETINGS_ADD, data)
}

export const deleteChatSuccess = (channel, data) => {
  Socket.broadcast(channel, Socket.DELETE_CHAT_SUCCESS, data)
}

export const removeUser = (channel, data) => {
  Socket.broadcast(channel, Socket.REMOVE_USER, data)
} 