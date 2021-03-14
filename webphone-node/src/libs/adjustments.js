import User from '../models/user'
import Freeswitch from '../services/freeswitch'
import Socket, { Sender, AdminSender } from '../socket'

class Adjustments {
  static instance

  constructor() {
    if (Adjustments.instance) {
      return Adjustments.instance
    }
    this.demoMode = false
    this.meetings = {}
    Adjustments.instance = this
  }

  toggle(name) {
    const previous = !!this[name]
    this[name] = !this[name]
    switch (name) {
      case 'demoMode':
        if (!previous) {
          User.all
            .filter(user => user.isRegular() && user.isSpeak())
            .forEach(user => Freeswitch.muteSpeakRegular(user))
        }
        break
      default:
        console.log('No Adjustments to toggle')
        return
    }
    this.notify()
  }

  toggleMeeting(name, meetingId) {
    if(!this.meetings[meetingId]) this.meetings[meetingId] = {};
    const meeting = this.meetings[meetingId]
    const previous = !!meeting[name]
    meeting[name] = !meeting[name]
    switch (name) {
      case 'floorDisabled':
        User.all
          .filter(user => user.isModerator() && (user.isFloorHear() || user.inOratorRoom()))
          .forEach(user => Freeswitch.pickState(user, 'RELAY'))
        Freeswitch.handleFloorForMeeting(meetingId)
        break
      default:
        console.log('No Adjustments to toggle')
        return
    }
    this.notify()
  }


  notify() {
    Sender.adjustments(Socket.PUBLIC_CHANNEL, this)
    AdminSender.adjustments(this)
  }

  toJSON() {
    return {
      demoMode: this.demoMode,
      meetings: this.meetings
    }
  }
}

export default new Adjustments()
