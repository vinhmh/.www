import Socket from '.'
import User from '../../models/user'
import Message from '../../models/message'
import Meeting from '../../models/meeting'

export default (event, client, data) => {
  try {
    switch (event) {
      case Socket.NEW_USER:
        User.add(client, data)
        break
      case Socket.NEW_MEETING:
        Meeting.addNew(client, data)
        break
      case Socket.MESSAGE_SEND:
        Message.add(client, data)
        break
      case Socket.REMOVE_USER:
        Meeting.removeUser(client, data)  
        break
      case Socket.DELETE_CHAT:
        Message.removeMessagesByMeeting(data)
        break
      default:
        console.log('Socket, no such event: ', event)
    }
  } catch (e) {
    console.log('Error:', e)
  }
}
