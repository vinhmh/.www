import BaseUser from './base'
import RemoteUserSerializer from '../../serializers/user/remote'
import { displayName } from '../../helpers/userHelper'

export default class RemoteUser extends BaseUser {
  constructor(data) {
    super(data)
    this.username = data.nameId
    this.displayName = displayName(data.nameId)
    this.members = []
    this.role = RemoteUser.ROLES.REGULAR
    this.hearRoomId = data.roomId
    this.speakRoomId = data.roomId
    this.meetingID = null
    this.useFloor = false
    this.useSwitcher = false
    this.registered = true
    this.cf1 = data.roomId
    this.cf2 = null
    this.rooms = {
      first: data.roomId,
      second: null,
      orator: null
    }
    this.roomsList = [data.roomId]
    this.channels = {
      self: '__remote__'
    }
    this.isStartTime=true
    this.startStopTime= null
    this.isResetTime = false
    this.lastInterpreterSessionTime = null
    this.startMeeting=false,
    this.startHandRaised = true,
    this.startStopHandRaised = null,
    this.startOnMikes = true,
    this.startStopMikes = null
    this.slowSpeak = null
  }

  connected() {
    return this.members.length > 1
  }

  onMemberRemove(/* member */) {
    if (!this.members.length) this.destroy()
  }

  toJSON() {
    return RemoteUserSerializer(this)
  }

  static all = []

  static add = (data) => {
    const user = new RemoteUser(data)
    RemoteUser.makeUniq(user)
    RemoteUser.all.push(user)
    console.log(`Create remote user ${user.id}`)
    return user
  }

  static findOrCreate = (data) => {
    const user = RemoteUser.find(data.nameId)
    if (user) return user
    return RemoteUser.add(data)
  }
}
