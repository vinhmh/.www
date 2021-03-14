import UserSerializer from './user'
import RemoteUserSerializer from './user/remote'

export default (member) => {
  const serializeUser = (user) => {
    const remote = user.constructor.name === 'RemoteUser'
    if (remote) {
      return RemoteUserSerializer(user, { memberIds: true })
    }
    return UserSerializer(user, { memberIds: true })
  }

  return {
    id: member.id,
    user: serializeUser(member.user),
    roomId: member.roomId,
    nameId: member.nameId,
    speak: member.speak,
    hear: member.hear,
    talking: member.talking,
    userId: member.user.id,
    moderatorStatus: member.moderatorStatus,
    isStartTime: member.isStartTime,
    startStopTime: member.startStopTime,
    isResetTime: member.isResetTime,
    lastInterpreterSessionTime: member.lastInterpreterSessionTime,
    startMeeting: member.startMeeting,
    startHandRaised: member.startHandRaised,
    startStopHandRaised: member.startStopHandRaised,
    startOnMikes : member.startOnMikes,
    startStopMikes : member.startStopMikes,
    slowSpeak: member.slowSpeak
  }
}
