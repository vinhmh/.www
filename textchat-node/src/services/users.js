import Message from '../models/message'
import { Sender } from '../socket'

export const load = (user, deeplLangsSupport) => {
  const { meeting } = user
  const messages = Message.byMeeting(meeting)
  Sender.userChange(user.channel, user)
  Sender.messagesUpdateUser(meeting.channel, user)
  Sender.messagesChange(user.channel, messages)
  Sender.appLoaded(user.channel, deeplLangsSupport)
}

export const disable = (user, channel) => {
  Sender.messagesUpdateUser(channel, user)
}
