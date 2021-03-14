import Socket from '../socket'

export default (event, client, data) => {
  try {
    switch (event) {
      // case Socket.TOGGLE_SPEAK_SELF:
      //   Freeswitch.toggleSpeakSelf(data)
      //   break
      default:
        console.log('Socket, no such event: ', event)
    }
  } catch (e) {
    console.log('Error:', e)
  }
}
