import Socket from '.'

export const newUser = (channel, data) => {
  Socket.broadcast(channel, Socket.NEW_USER, data)
}

export const updateProfile = (channel, data) => {
  Socket.broadcast(channel, Socket.PROFILE_UPDATE, data)
}

export const changeMembers = (channel, data) => {
  Socket.broadcast(channel, Socket.MEMBERS_CHANGE, data)
}

export const addMember = (channel, data) => {
  Socket.broadcast(channel, Socket.MEMBER_ADD, data)
}

export const delMember = (channel, data) => {
  Socket.broadcast(channel, Socket.MEMBER_DEL, data)
}

export const updateMember = (channel, data) => {
  Socket.broadcast(channel, Socket.MEMBER_UPDATE, data)
}

export const firstLineCall = (channel, data) => {
  Socket.broadcast(channel, Socket.FIRST_LINE_CALL, data)
}

export const secondLineCall = (channel, data) => {
  Socket.broadcast(channel, Socket.SECOND_LINE_CALL, data)
}

export const floorLineCall = (channel, data) => {
  Socket.broadcast(channel, Socket.FLOOR_LINE_CALL, data)
}

export const loungeLineCall = (channel, data) => {
  Socket.broadcast(channel, Socket.LOUNGE_LINE_CALL, data)
}

export const oratorLineCall = (channel, data) => {
  Socket.broadcast(channel, Socket.ORATOR_LINE_CALL, data)
}

export const langbLineCall = (channel, data) => {
  Socket.broadcast(channel, Socket.LANGB_LINE_CALL, data)
}

export const makeRelay = (channel, data) => {
  Socket.broadcast(channel, Socket.MAKE_RELAY, data)
}

export const notify = (channel, data) => {
  Socket.broadcast(channel, Socket.NOTIFY, data)
}

export const closeWindow = (channel) => {
  Socket.broadcast(channel, Socket.CLOSE_WINDOW)
}

export const adjustments = (channel, data) => {
  Socket.broadcast(channel, Socket.ALL_ADJUSTMENTS, data)
}
