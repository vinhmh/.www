import Record from '../record'
import Socket, { Sender, AdminSender } from '../../socket'
import User, { RemoteUser } from './index'
import { shortName } from '../../helpers/userHelper'
import config from '../../../config'

let id = 0

export default class BaseUser extends Record {
  static ROLES = {
    INTERPRETER: 'interpreter',
    MODERATOR: 'moderator',
    REGULAR: 'regular',
    TECH_ASSISTANT: 'tech_assistant',
    SWITCHER: 'switcher',
  };

  constructor(data) {
    super(data)
    this.id = ++id
    this.userState = { mediaSettings: {}, debugInfo: { browserData: {}, errors: [], janusLog: [], turnStun: [] }, activeChannel: Socket.PUBLIC_CHANNEL }
    this.role = 'regular'
  }

  isModerator() {
    return this.role === BaseUser.ROLES.INTERPRETER
  }

  isRegular() {
    return this.role === BaseUser.ROLES.REGULAR
  }

  isTechAssistant() {
    return !!this.usernameInput?.match(/^_ibp_techassist/)
  }

  isAdministrator() {
    return !!this.isModeratorEndUser
  }

  isSwitcher() {
    return this.role === BaseUser.ROLES.SWITCHER
  }

  isHear() {
    return !!this.members.find(m => m.hear)
  }

  isSpeak() {
    return !!this.members.find(m => m.speak)
  }

  shortName() {
    return shortName(this.displayName)
  }

  destroy() {
    let memberIndex = this.members.length - 1
    while (memberIndex >= 0) {
      const member = this.members[memberIndex]
      member.destroy()
      memberIndex -= 1
    }
    const index = this.constructor.all.indexOf(this)
    if (index !== -1) {
      this.constructor.all.splice(index, 1)
      console.log('Destroy user', this.id)
    }
    AdminSender.removeUser(this.id)
  }

  memberByRoomId(roomId) {
    return this.members.find(m => m.roomId === roomId)
  }

  removeMember(member) {
    const index = this.members.findIndex(m => m.id === member.id)
    if (index === -1) return

    this.members.splice(index, 1)
    this.onMemberRemove(member)
  }

  onMemberAdd(/* member */) {
    // overwrite in inherited class
  }

  onMemberRemove(/* member */) {
    // overwrite in inherited class
  }

  static makeUniq(user) {
    if (user.browserID) { // make only one tab opened with the same browserID
      User.all
        .filter(u => u.browserID === user.browserID && u.id !== user.id)
        .forEach(u => Sender.closeWindow(u.channels.self))
    }

    if (user.isSwitcher()) {
      // allow one switcher per meeting
      const swithcers = User.all.filter(u => u.meetingID === user.meetingID && u.role === BaseUser.ROLES.SWITCHER && u.id !== user.id)
      swithcers.forEach(sw => sw.destroy())
    }

    const oldUser = this.find({ username: user.username })
    if (!oldUser) return

    if (oldUser.client) {
      Sender.closeWindow(oldUser.channels.self)
    } else {
      oldUser.destroy()
    }
  }

  static onRegister() {
    // overwrite in inherited class
  }

  static addMember(member) {
    const { nameId, roomId } = member
    let user = User.find({ username: nameId })
    if (!user) user = RemoteUser.findOrCreate({ nameId, roomId })

    member.user = user
    user.members.push(member)
    user.onMemberAdd(member)
  }
}
