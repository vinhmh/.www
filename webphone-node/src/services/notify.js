import { Sender } from '../socket'

export const toggleSpeak = (member, user) => {
  if (member.user.id === user.id) return
  const action = member.speak ? 'has unmuted' : 'has muted'
  Sender.notify(member.user.channels.self, `${user.displayName} ${action} you`)
}
