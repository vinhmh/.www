import { Sender } from '../socket'
import User from '../models/user'
import Message from '../models/message'

export const add = (meeting) => {
  Sender.meetingsAdd(meeting.channel, meeting)
}

export const messagesChangeToNewUser = (meeting, newUsers) => {
  const messages = Message.byMeeting(meeting)
  for (const userId of newUsers ) {
    const user = User.find({ id: userId })
    if(!user) return 
    Sender.messagesUpdateUser(meeting.channel, user)
    Sender.messagesChange(user.channel, messages)
  }
}

export const removeUser = (meeting, user) => {
  Sender.removeUser(meeting.channel, {meeting, user})
}
