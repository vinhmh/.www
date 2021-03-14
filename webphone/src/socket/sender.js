import Socket from './index'

export const newUser = (data) => {
  Socket.send({ event: Socket.NEW_USER, data })
}

export const muteSpeak = (memberId, roomId) => {
  Socket.send({ event: Socket.MUTE_SPEAK, data: { memberId, roomId } })
}

export const unmuteSpeak = (memberId, roomId) => {
  Socket.send({ event: Socket.UNMUTE_SPEAK, data: { memberId, roomId } })
}

export const muteHear = (memberId, roomId) => {
  Socket.send({ event: Socket.MUTE_HEAR, data: { memberId, roomId } })
}

export const unmuteHear = (memberId, roomId) => {
  Socket.send({ event: Socket.UNMUTE_HEAR, data: { memberId, roomId } })
}

export const toggleSpeakSelf = (userId) => {
  Socket.send({ event: Socket.TOGGLE_SPEAK_SELF, data: { userId } })
}

export const toggleRaiseHand = ({ userId, forceCancel }) => {
  Socket.send({ event: Socket.TOGGLE_RAISE_HAND, data: { userId, forceCancel } })
}

export const toggleControlMike = ({ userId }) => {
  Socket.send({ event: Socket.TOGGLE_CONTROL_MIKE, data: { userId } })
}

export const toggleHearSelf = (userId) => {
  Socket.send({ event: Socket.TOGGLE_HEAR_SELF, data: { userId } })
}

export const toggleSpeakMember = (userId, memberId, roomId) => {
  Socket.send({ event: Socket.TOGGLE_SPEAK_MEMBER, data: { userId, memberId, roomId } })
}

export const toggleHearMember = (userId, memberId, roomId) => {
  Socket.send({ event: Socket.TOGGLE_HEAR_MEMBER, data: { userId, memberId, roomId } })
}

export const changeRegularRoom = (userId, newRoomId) => {
  Socket.send({ event: Socket.CHANGE_CURRENT_ROOM, data: { userId, newRoomId } })
}

export const switchRooms = (userId) => {
  Socket.send({ event: Socket.SWITCH_ROOMS, data: { userId } })
}

export const joinLounge = (userId) => {
  Socket.send({ event: Socket.JOIN_LOUNGE, data: { userId } })
}

export const leaveLounge = (userId) => {
  Socket.send({ event: Socket.LEAVE_LOUNGE, data: { userId } })
}

export const pickRelay = (userId) => {
  Socket.send({ event: Socket.PICK_RELAY, data: { userId } })
}

export const pickFloor = (userId) => {
  Socket.send({ event: Socket.PICK_FLOOR, data: { userId } })
}

export const pickOrator = (userId, roomId) => {
  Socket.send({ event: Socket.PICK_ORATOR, data: { userId, roomId } })
}

export const pickLangb = (userId, roomId) => {
  Socket.send({ event: Socket.PICK_LANGB, data: { userId, roomId } })
}

export const relayUser = (userId, msg) => {
  Socket.send({ event: Socket.RELAY_USER, data: { userId, msg } })
}

export const startTimeModerator = (msg) => {
  Socket.send({event: Socket.START_TIME_USER, data: msg})
}

export const startHandRaisedModertor = (msg) => {
   Socket.send({event: Socket.START_HANDRAISED_USER, data:msg})
}

export const controlMikesModertor = (msg) => {
  Socket.send({event: Socket.CONTROL_MIKES, data:msg})
}
export const slowSpeak = (msg) => {
   Socket.send({event: Socket.SLOW_SPEAK, data:msg})
}
export const setVolumeIn = (userId, level) => {
  Socket.send({ event: Socket.SET_VOLUME_IN, data: { userId, level } })
}

export const updateUserState = (prop, data) => {
  Socket.send({ event: Socket.UPDATE_USER_STATE, data: { prop, data } })
}

export const bbbOn = (userId) => {
  Socket.send({ event: Socket.BBB_ON, data: { userId } })
}

export const bbbOff = (userId) => {
  Socket.send({ event: Socket.BBB_OFF, data: { userId } })
}

export const toggleTimer = (userId , msg , time) => {
  console.log(userId)
  Socket.send({ event: Socket.TIMER, data: { userId , msg , time } })
}

export const optionTime = (userId , roomId , msg) => {
  Socket.send({ event: Socket.TIMER, data: {userId, roomId , msg}})
}
