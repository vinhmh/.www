import * as Sender from '../socket/sender'

const usersWhoSpeak = (list) => (list.filter(user => user.isSpeak))
const usersWhoHear = (list) => (list.filter(user => user.isHear))

// reconnect a list of users
export const reconnectAListOfUsers = (list) => {
  list.forEach(user => {
    Sender.reconnectUser(user.id)
  })
}

// mute microphone of a list of users
export const muteAListOfUsers = (list) => {
  usersWhoSpeak(list).forEach(user => {
    Sender.toggleSpeakSelf(user.id)
  })
}

// mute speaker of a list of users
export const muteSpeakerOfAListOfUsers = (list) => {
  usersWhoHear(list).forEach(user => {
    Sender.toggleHearSelf(user.id)
  })
}

// disconnect a list of users
export const disconnectAListOfUsers = (list) => {
  list.forEach(user => {
    Sender.disconnectUser(user.id)
  })
}

// toggle on/off the floor
export const toggleFloor = (meetingID) => {
  Sender.toggleMeetingAdjustments('floorDisabled', meetingID)
}

// toggle microphone on/off of a user
export const toggleMicrophone = (userID) => {
  Sender.toggleSpeakSelf(userID)
}

// toggle speaker on/off of a user
export const toggleSpeaker = (userID) => {
  Sender.toggleHearSelf(userID)
}

// switch room for a user
export const switchRoom = (userID) => {
  Sender.switchRooms(userID)
}

// peek off
export const peekOff = (userID) => {
  Sender.userPeekOff(userID)
}

// peek on
export const peekOn = (userID) => {
  Sender.userPeekOn(userID)
}