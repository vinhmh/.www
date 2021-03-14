import Socket from '../socket'
import Freeswitch from '../../services/freeswitch'
import Adjustments from '../../libs/adjustments'
import User from '../../models/user'
import Client, { Sender as ClientSender } from '../client'
import UserService from '../../services/users'

export default (event, client, data) => {
  try {
    switch (event) {
      // TODO: Add admin namespace to events
      case Socket.TOGGLE_SPEAK_SELF:
        Freeswitch.toggleSpeakSelf(data)
        break
      case Socket.TOGGLE_HEAR_SELF:
        Freeswitch.toggleHearSelf(data)
        break
      case Socket.TOGGLE_ADJUSTMENTS:
        Adjustments.toggle(typeof data == 'string' ? data : data.name)
        break
      case Socket.TOGGLE_MEETING_ADJUSTMENTS:
        Adjustments.toggleMeeting(data.name, data.meetingId)
        break
      case Socket.USER_PEEK_ON:
        Freeswitch.peekOn(data)
        break
      case Socket.USER_PEEK_OFF:
        Freeswitch.peekOff(data)
        break
      case Socket.ADMIN_DISCONNECT_USER: {
        const socket = Client.byUser(data.userId)
        socket.send({ event: Socket.DISABLE_RECONNECT })
        socket.close()
        break
      }
      case Socket.ADMIN_RECONNECT_USER: {
        const socket = Client.byUser(data.userId)
        socket.send({ event: Socket.RECONNECT_USER })
        socket.close()
        break
      }
      case Socket.ADMIN_GET_USER_STATE: {
        const user = User.find(data)
        const { userState } = user
        client.send({ event: Socket.ADMIN_SET_USER_STATE, data: { userId: user.id, userState } })
        break
      }
      case Socket.ADMIN_NOTIFY_USER: {
        const user = User.find(data.userId)
        ClientSender.notify(user.channels.self, data.message)
        break
      }
      case Socket.SWITCH_ROOMS: {
        Freeswitch.switchRooms(data)
        const user = User.find(data.userId)
        UserService.update(user)
        break
      }
      default:
        console.log('Socket, no such event: ', event)
    }
  } catch (e) {
    console.error(`Error: ${e}`)
  }
}
