import { Sender } from '../socket'
import Meeting from '../models/meeting'

export const add = (message = {}) => {
  if (typeof message.meeting === 'undefined') return 
  Sender.messagesAdd(message.meeting.channel, message)
}


export const deleteChatSuccess = ({meetingId}) => {
  const meeting = Meeting.find({id: meetingId})
  Sender.deleteChatSuccess(meeting.channel, meetingId)
}

