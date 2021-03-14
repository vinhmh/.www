import { Sender } from '../socket'

// TODO get rid of class
export default class MembersService {
  static addMember = (member) => {
    Sender.addMember(member.roomId, member)
    Sender.updateProfile(member.user.channels.self, member.user)
  };

  static delMember = (member) => {
    Sender.delMember(member.roomId, member)
    Sender.updateProfile(member.user.channels.self, member.user)
  };

  static updateMember = (member) => {
    if (!member.persisted) return
    Sender.updateMember(member.roomId, member)
    Sender.updateProfile(member.user.channels.self, member.user)
  };
}
