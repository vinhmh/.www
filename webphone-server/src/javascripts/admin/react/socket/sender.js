import Socket from './index'

export const toggleSpeakSelf = (userId) => {
  Socket.send({ event: Socket.TOGGLE_SPEAK_SELF, data: { userId } })
}

export const userPeekOn = (userId) => {
  Socket.send({ event: Socket.USER_PEEK_ON, data: { userId } })
}

export const userPeekOff = (userId) => {
  Socket.send({ event: Socket.USER_PEEK_OFF, data: { userId } })
}

export const toggleHearSelf = (userId) => {
  Socket.send({ event: Socket.TOGGLE_HEAR_SELF, data: { userId } })
}

export const toggleAdjustments = (name) => {
  Socket.send({ event: Socket.TOGGLE_ADJUSTMENTS, data: { name } })
}

export const toggleMeetingAdjustments = (name, meetingId) => {
  Socket.send({ event: Socket.TOGGLE_MEETING_ADJUSTMENTS, data: { name, meetingId } })
}

export const disconnectUser = (userId) => {
  Socket.send({ event: Socket.ADMIN_DISCONNECT_USER, data: { userId } })
}

export const reconnectUser = (userId) => {
  Socket.send({ event: Socket.ADMIN_RECONNECT_USER, data: { userId } })
}

export const getUserState = (data) => {
  Socket.send({ event: Socket.ADMIN_GET_USER_STATE, data })
}

export const notify = (userId, message) => {
  Socket.send({ event: Socket.ADMIN_NOTIFY_USER, data: { userId, message } })
}

export const switchRooms = (userId) => {
  Socket.send({ event: Socket.SWITCH_ROOMS, data: { userId } })
}
