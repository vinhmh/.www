import Socket from '.'
import User from '../../models/user'
import UserService from '../../services/users'
import Freeswitch from '../../services/freeswitch'
import Esl from '../../esl'
import * as Sender from '../admin/sender'
import Member from '../../models/member'

export default (event, client, data) => {
  // TODO add pundut style authorization
  try {
    switch (event) {
      case Socket.NEW_USER:
        User.add(client, data)
        break
      case Socket.MUTE_SPEAK: {
        const { memberId, roomId } = data
        Esl.muteSpeak(memberId, roomId)
        break
      }
      case Socket.UNMUTE_SPEAK: {
        const { memberId, roomId } = data
        Esl.unmuteSpeak(memberId, roomId)
        break
      }
      case Socket.MUTE_HEAR: {
        const { memberId, roomId } = data
        Esl.muteHear(memberId, roomId)
        break
      }
      case Socket.UNMUTE_HEAR: {
        const { memberId, roomId } = data
        Esl.unmuteHear(memberId, roomId)
        break
      }
      case Socket.TOGGLE_SPEAK_SELF:
        Freeswitch.toggleSpeakSelf(data)
        break
      case Socket.TOGGLE_HEAR_SELF:
        Freeswitch.toggleHearSelf(data)
        break
      case Socket.TOGGLE_SPEAK_MEMBER:
        Freeswitch.toggleSpeakMember(data)
        break
      case Socket.TOGGLE_HEAR_MEMBER:
        Freeswitch.toggleHearMember(data)
        break
      case Socket.CHANGE_CURRENT_ROOM:
        Freeswitch.changeRegularRoom(data)
        break
      case Socket.SWITCH_ROOMS:
        Freeswitch.switchRooms(data)
        break
      case Socket.JOIN_LOUNGE:
        Freeswitch.joinLounge(data)
        break
      case Socket.LEAVE_LOUNGE:
        Freeswitch.leaveLounge(data)
        break
      case Socket.PICK_RELAY:
        Freeswitch.pickRelay(data)
        break
      case Socket.PICK_FLOOR:
        Freeswitch.pickFloor(data)
        break
      case Socket.PICK_LANGB:
        Freeswitch.pickLangb(data)
        break
      case Socket.PICK_ORATOR:
        Freeswitch.pickOrator(data)
        break
      case Socket.RELAY_USER:
        UserService.relayUser(data)
        break
      case Socket.START_TIME_USER:
        Member.updateIsStartTime(data)
        break
      case Socket.START_HANDRAISED_USER:
        Member.uploadHandRaised(data)
        break  
      case Socket.CONTROL_MIKES:
        Member.uploadControlMikes(data)
      case Socket.SLOW_SPEAK:
        Member.slowSpeak(data)
        break  
      case Socket.BBB_ON:
        Sender.bbbOn(data)
        break
      case Socket.BBB_OFF:
        Sender.bbbOff(data)
        break
      case Socket.SET_VOLUME_IN:
        Freeswitch.setVolumeIn(data)
        break
      case Socket.UPDATE_USER_STATE: {
        const user = User.find(client.user.id)
        user.updateUserState(data)
        const { prop } = data
        switch (prop) {
          case 'mediaSettings':
            Sender.informChangeOnMediaSettings(user.id, user.userState.mediaSettings)
            break;
        }
        break
      }
      case Socket.TOGGLE_RAISE_HAND: {
        const user = User.find(client.user.id)
        user.toggleRaiseHand(data)
        break
      }
      case Socket.TOGGLE_CONTROL_MIKE: {
        const user = User.find(client.user.id)
        user.toggleControlMike()
        break
      }
      default:
        console.log(`Socket: no such event: ${event}`)
    }
  } catch (e) {
    console.error(`Error: ${e}`)
  }
}
