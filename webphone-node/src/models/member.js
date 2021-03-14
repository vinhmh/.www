import Esl from '../esl'
import Record from './record'
import User from './user'
import RemoteUser from './user/remote'
import MemberSerializer from '../serializers/member'
import MembersService from '../services/members'
import Freeswitch from '../services/freeswitch'
import UsersService from '../services/users'


export default class Member extends Record {
  constructor(data) {
    super(data)
    this.id = data.id
    this.roomId = data.roomId
    this.nameId = data.nameId
    this.speak = data.speak
    this.hear = data.hear
    this.talking = false
    this.user = null
    this.persisted = false
    this.moderatorStatus = data.moderatorStatus || "OFFLINE"
    this.isStartTime = true
    this.startStopTime = null 
    this.isResetTime = false
    this.lastInterpreterSessionTime = null
    this.startMeeting = false,
    this.startHandRaised = true,
    this.startStopHandRaised = null,
    this.startOnMikes = true,
    this.startStopMikes = null
    this.slowSpeak = null
  }

  destroy(o = {}) {
    const index = Member.all.indexOf(this)
    if (index !== -1) Member.all.splice(index, 1)
    this.user.removeMember(this)
    if (!o.skip_hup) Esl.hupMember(this.id, this.roomId)
    MembersService.delMember(this)
    Freeswitch.handleSwitcher(this.roomId)
    console.log(`Destroy member ${this.id}, user: ${this.user.username}`)
  }

  onUpdate() {
    if (!this.speak) this.talking = false
  }

  toJSON() {
    return MemberSerializer(this)
  }

  isFloor() {
    const { rooms, useFloor, useSwitcher } = this.user
    return this.roomId === rooms.floor && (useFloor || useSwitcher)
  }

  static all = [];

  static add = async ({ id, roomId, nameId, speak, hear }) => {
    const member = new Member({ id, roomId, nameId, speak, hear })
    const oldMember = Member.find({ nameId, roomId })

    if (oldMember) oldMember.destroy()

    Member.all.push(member)
    User.addMember(member)
    Member.onJoin(member)
    member.persisted = true

    // Floor
    const { user } = member
    if(user.useFloor) {
      Freeswitch.handleFloor(roomId === user.rooms.floor ? user.hearRoomId : roomId)
    }

    MembersService.addMember(member)
  };

  static remove = (id) => {
    const member = Member.find(id)
    if (!member) return
    member.destroy({ skip_hup: true })
    UsersService.update(member.user)
  };

  static update = (id, data) => {
    const member = Member.find(id)
    if (!member) return
    member.update(data)
    MembersService.updateMember(member)
  };

  static updateIsStartTime = (data) => {
    let member = Member.find(data.id)
    if(!member) return
    member.startMeeting=data.startMeeting
    member.user.startMeeting=data.startMeeting
    member.isStartTime = data.isStartTime
    member.startStopTime = data.startStopTime
    member.isResetTime = data.isResetTime
    member.user.isStartTime = data.isStartTime
    member.user.startStopTime = data.startStopTime
    member.user.isResetTime = data.isResetTime
    member.user.lastInterpreterSessionTime = data.lastInterpreterSessionTime
    member.lastInterpreterSessionTime = data.lastInterpreterSessionTime
    MembersService.updateMember(member)
  }
   
  static uploadHandRaised = (data) => {
    let member = Member.find(data.id)
    if(!member) return
    member.startMeeting = data.startMeeting
    member.user.startMeeting = data.startMeeting
    member.startHandRaised = data.startHandRaised
    member.startStopHandRaised = data.startStopHandRaised
    member.user.startHandRaised = data.startHandRaised
    member.user.startStopHandRaised = data.startStopHandRaised
    MembersService.updateMember(member)
  }
  
  static uploadControlMikes = (data) => {
    let member = Member.find(data.id)
    if(!member) return
    member.startMeeting = data.startMeeting
    member.user.startMeeting = data.startMeeting
    member.startOnMikes = data.startOnMikes
    member.startStopMikes = data.startStopMikes
    member.user.startOnMikes = data.startOnMikes
    member.user.startStopMikes = data.startStopMikes
    MembersService.updateMember(member)
  }
  
  static slowSpeak = (data) => {
    let member = Member.find(data.id)
    if(!member) return
    member.startMeeting = data.startMeeting
    member.user.startMeeting = data.startMeeting
    member.slowSpeak = data.slowSpeak
    member.user.slowSpeak = data.slowSpeak
    MembersService.updateMember(member)
  }

  static byRoom(...rooms) {
    return Member.all.filter(m => rooms.indexOf(m.roomId) !== -1)
  }

  static onJoin(member) {
    const { id, roomId, user } = member
    const { orator, lounge, floor } = user.rooms

    // switcher member
    if (user.isSwitcher()) return Member.onSwitcherJoin(member)

    // regular
    if (user.isRegular()) return

    UsersService.update(user)
    return Member.onModeratorJoin(member)
  }

  static onSwitcherJoin(member) {
    const { roomId } = member
    const moderatorSpeaking = Member.byRoom(roomId).filter(m => m.user.isModerator() && m.speak).length
    if (moderatorSpeaking) {
      Esl.muteSpeak(member.id, roomId)
    } else {
      Esl.unmuteSpeak(member.id, roomId)
    }
    return Esl.muteHear(member.id, roomId)
  }

  static onModeratorJoin(member) {
    const { id, roomId, user } = member
    const { hearRoomId, speakRoomId, rooms, useFloor, useSwitcher } = user
    const { first, second } = rooms
    const promises = []

    if (!hearRoomId && roomId === first) user.hearRoomId = roomId
    if (!speakRoomId && roomId === second) user.speakRoomId = roomId

    if (roomId === user.rooms.floor)
      promises.push(Esl.muteHear(id, roomId))

    if (roomId !== user.speakRoomId)
      promises.push(Esl.muteSpeak(id, roomId))

    return Promise.all(promises)
  }
}
