/* eslint-disable implicit-arrow-linebreak */
export default "This is a filter's utlity files"

export const filterRemoveTechAssistMembers = (member) => {
  const name = (m) => m.user.usernameInput || m.user.username
  return !name(member).match(/^_ibp_/)
}

export const filterAllIntepreters = (member) => {
  return member.user.isModerator && member.user.speakRoomId === member.roomId
}
// export const filterAllRegulars = (member) => member.user.isRegular && member.user.speakRoomId === member.roomId
export const filterAllRegulars = (member) => member.user.isRegular

export const filterParticipant = (member) => {
   return member.user.isRegular && !member.user.isModerator && !member.user.isTechAssistant && member.user.speakRoomId === member.roomId
}

export const filterMyBoothIntepreters = (me) => (member) =>
  member.user.isModerator &&
  (member.user.rooms.first === me.rooms.first || member.user.rooms.second === me.rooms.first) &&
  member.user.speakRoomId === me.rooms.first &&
  member.speak &&
  member.roomId === me.rooms.first

export const filterRaisedHandMembers = (member) =>
  member.user.isRegular &&
  member.user.speakRoomId === member.roomId &&
  (member.talking || member.user.raiseHandTime)

// Main filters ***********************************************************

export const filterSearch = (searchTerm) => (member) =>
  member.user.displayName.toLowerCase().indexOf(searchTerm.toLowerCase()) > -1

export const filterAllowToShow = (currentUser) => (member) => {
  // Tech Assist (Admin)
  if (currentUser.isTechAssistant) {
    return true
  }

  // Interpreters
  if (currentUser.isModerator) {
    return filterAllIntepreters(member)
  }

  // Normal Users
  if (currentUser.isRegular) {
    return filterAllRegulars(member)
  }
}
