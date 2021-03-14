import Adjustments from '../libs/adjustments'
import User from '../models/user'
import Member from '../models/member'
import { Sender } from '../socket'

// TODO get rid of class
export default class UsersService {
  static add = (user) => {
    Sender.newUser(user.channels.self, user)
    Sender.changeMembers(user.channels.self, Member.byRoom(...user.channels.rooms))
    Sender.adjustments(user.channels.self, Adjustments)
  }

  static update = (user) => {
    UsersService.updateProfile(user)
    user.members.forEach((member) => {
      Sender.updateMember(member.roomId, member)
    })
  }

  static updateProfile = (user) => {
    Sender.updateProfile(user.channels.self, user)
  }

  static relayUser = ({ userId, msg }) => {
    const user = User.find(userId)
    Member.all.forEach(m => {
      if (m.user.id == userId) {
        m.moderatorStatus = msg
      }
    })
    const { first, second } = user.rooms
    const list = User.all.filter(u => u.id !== user.id
      && ([u.rooms.first, u.rooms.second].sort().join() === [first, second].sort().join()))
    list.forEach((u) => {
      Sender.makeRelay(u.channels.self)
      Sender.notify(u.channels.self, {msg, userId })
    })
  }
}
