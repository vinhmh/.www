import axios from 'axios'
import config from '../../../config'
import Socket, { Sender } from '../../socket'
import UserSerializer from '../../serializers/user'
import UsersService from '../../services/users'
import { displayName, getBoolean } from '../../helpers/userHelper'
import BaseUser from './base'
import Freeswitch from '../../services/freeswitch'
import Esl from '../../esl'
import Adjustments from '../../libs/adjustments'

export default class User extends BaseUser {
  constructor(client, data) {
    super(data)
    this.client = client
    this.host = data.host
    this.bbb = data.bbb || {}
    this.platformUrl = null
    this.password = data.password || config.defaultVoipPassword
    this.members = []
    this.role = data.role || this.role
    this.echoUuid = null
    this.browserID = null
    this.meetingID = data.meetingID
    this.registered = false
    this.valid = true
    this.setupUserData(data)
    this.setupRooms(data)
    this.validate(data)
    this.setupChannels(data)
    this.raiseHandTime = null
    this.isStartTime=true
    this.startStopTime= null
    this.isResetTime = false
    this.lastInterpreterSessionTime = null
    this.startMeeting=false
    this.startHandRaised = true,
    this.startStopHandRaised = null,
    this.startOnMikes = true,
    this.startStopMikes = null  
    this.slowSpeak = null
  
  }

  setupUserData(data) {
    if (data.browserID && data.browserID.length) {
      this.browserID = data.browserID
    }
    this.usernameInput = data.username
    this.isModeratorEndUser = data.coordinator
    if (data.coordinator) {
      this.isLockMike = true
    }
    if (this.isModerator() || data.userAuth) {
      this.username = data.username
      this.displayName = displayName(data.username)
      return
    }

    if (this.isSwitcher()) {
      this.password = config.switcherPassword
      this.generateName('switcher_user_')
      return
    }

    // regular
    this.generateName('fixeduser_', data)
  }

  generateName(prefix, data = {}) {
    let username
    let i = 1

    while (i < 500) {
      username = `${prefix}${i}`
      const user = User.find({ username })
      if (!user) {
        this.username = username
        const name = data.displayName || data.username || username
        this.displayName = name.match(/^_ibp_$/) ? data.username : displayName(name)
        return
      }
      i++
    }
    this.valid = false
  }

  setupRooms(data) {
    const { meeting } = data
    const { conferences, useSwitcher, useFloor, platformUrl } = meeting

    this.cf1 = data.cf1 ? `${data.cf1}` : null;
    this.cf2 = data.cf2 ? `${data.cf2}` : null;
    const first = this.cf1
    const second = this.cf2
    const lounge = meeting.lounge ? `${meeting.lounge}` : null;
    const floor = meeting.floor ? `${meeting.floor}` : null;
    const babel = meeting.babel ? `${meeting.babel}` : null;

    this.rooms = {}
    this.useSwitcher = getBoolean(useSwitcher)
    this.useFloor = getBoolean(useFloor)
    this.roomsList = conferences.filter(c => data.role !== 'regular' || c.accessible).map(c => `${c.number}`)
    this.titlesMap = {};
    if(lounge) this.titlesMap[lounge] = { title: 'Lounge' };
    if(floor) this.titlesMap[floor] = { title: 'Floor' };
    if(babel) this.titlesMap[babel] = { title: 'Babel' };
    conferences.forEach(c => this.titlesMap[`${c.number}`] = { title: c.title, code: c.code || c.deepl })

    if (platformUrl) {
      this.platformUrl = platformUrl
    }

    if (this.isSwitcher()) {
      this.activeLines = conferences.length + 1
      this.rooms.floor = floor
      // switcher logic goes here
      return
    }

    if (this.isModerator()) {
      this.rooms = { first, second, lounge, floor, babel, orator: null, langb: null }
      this.hearRoomId = null
      this.speakRoomId = null
      this.activeLines = this.useFloor || this.useSwitcher ? 3 : 2
      return
    }

    // regular
    this.rooms = { first, floor, babel }
    this.hearRoomId = first
    this.speakRoomId = first
    this.activeLines = this.useFloor ? 2 : 1
  }

  validate(data) {
    if (!this.valid) return

    if (this.isSwitcher()) {
      const { secretToken } = config
      if (data.secretToken !== secretToken || !data.meeting.useSwitcher) {
        this.valid = false
        return
      }

      const user = User.find({ meetingID: this.meetingID, role: this.role })
      this.valid = !user
      return
    }

    let valid = true
    if (
      (Object.values(User.ROLES).indexOf(this.role) === -1)
      || (!this.rooms.first)
      || (this.rooms.first === this.rooms.second)
    ) valid = false
    this.valid = this.valid && valid
  }

  setupChannels(data) {
    if (!this.valid) return
    const { meeting } = data
    const lounge = `${meeting.lounge}`
    const floor = `${meeting.floor}`
    const rooms = [...this.roomsList, lounge, floor]
    this.channels = {
      self: Math.random().toString(36).substr(2),
      public: Socket.PUBLIC_CHANNEL,
      rooms
    }
    this.client.user = this
    this.client.addChannel(Object.values(this.channels))
    this.client.addCallback(Socket.CLOSED, () => this.destroy())
  }

  connected() {
    return this.members.length >= this.activeLines
  }

  onMemberAdd(member) {
    // Initial mute/unmute logic is done in member.onModeratorJoin()
  }

  onMemberRemove(member) {
    this.handleConnectionLost(member)
  }

  inLoungeRoom() {
    return !!this.memberByRoomId(this.rooms.lounge)
  }

  inOratorRoom() {
    return !!this.memberByRoomId(this.rooms.orator)
  }

  inLangbRoom() {
    return !!this.memberByRoomId(this.rooms.langb)
  }

  isFloorHear() {
    const member = this.memberByRoomId(this.rooms.floor)
    return member && member.hear
  }

  isFloorSpeak() {
    const member = this.memberByRoomId(this.rooms.floor)
    return member && member.speak
  }

  isFloorEnabled() {
    if (!this.useFloor) return false
    const meetingAdjustments = Adjustments.meetings[this.meetingID]
    return !(meetingAdjustments && meetingAdjustments.floorDisabled)
  }

  inBoothTeam(user) {
    const { first, second } = this.rooms
    return [first, second].sort().join() === [user.rooms.first, user.rooms.second].sort().join()
  }

  boothTeam() {
    return User.all.filter(u => u.id !== this.id && u.isModerator() && this.inBoothTeam(u))
  }

  hearBoth() {
    if (this.isRegular()) return false
    const hearMember = this.memberByRoomId(this.hearRoomId)
    const speakMember = this.memberByRoomId(this.speakRoomId)
    return hearMember && speakMember && hearMember.hear && speakMember.hear
  }

  handleConnectionLost(member) {
    if (this.skipReconnect) return

    if (member.roomId === this.cf1) {
      return Sender.firstLineCall(this.channels.self, this.cf1)
    }

    if (member.roomId === this.cf2) {
      return Sender.secondLineCall(this.channels.self, this.cf2)
    }
  }

  toggleRaiseHand(data) {
    if (data.forceCancel) {
       // Cancel raise hand
      this.raiseHandTime = null;
    } else if (this.raiseHandTime === null) {
      // Raise hand now
      this.raiseHandTime = Date.now();
    } else {
      // Cancel raise hand
      this.raiseHandTime = null;
    }
    UsersService.update(this);
  }

  toggleControlMike() {
    this.isLockMike = !this.isLockMike
    UsersService.update(this);
  }

  updateUserState({ prop, data }) {
    // eslint-disable-next-line default-case
    switch (prop) {
      case 'mediaSettings':
        this.userState.mediaSettings = data
        break
      case 'debugInfo.browserData': {
        this.userState.debugInfo.browserData = data
        break
      }
      case 'debugInfo.errors': {
        this.userState.debugInfo.errors.push(data)
        break
      }
      case 'debugInfo.janusLog': {
        this.userState.debugInfo.janusLog.push(data)
        break
      }
      case 'debugInfo.turnStun': {
        this.userState.debugInfo.turnStun = data
        break
      }
      case 'activeChannel': {
        this.userState.activeChannel = data
      }
    }
  }

  toJSON() {
    return UserSerializer(this)
  }

  static all = []

  static async add(client, data) {
    try {
      await this.fetchMeetingInfo(data)
    } catch (e) {
      console.error(`Error: fetchMeetingInfo failed: ${e}`)
      return client.close()
    }
    const user = new User(client, data)
    if (!user.valid) return client.close()

    User.makeUniq(user)
    User.all.push(user)
    UsersService.add(user)
  }

  static byMeeting(meetingID) {
    return User.all.filter(u => u.meetingID === meetingID)
  }

  static async fetchMeetingInfo(data) {
    const { meetingID, username } = data
    const { secretToken } = config
    const params = { meetingID, username, secretToken }
    const response = await axios.get(`${config.webphoneServer}/getMeetingData`, { params })
    const { meeting, bbb } = response.data
    if (!meeting) throw new Error('No Meeting')

    data.meeting = meeting
    data.bbb = bbb
  }

  static onRegister({ username }) {
    const user = User.find({ username })
    if (!user || user.registered) return
    user.registered = true
    UsersService.update(user)
  }

  static onEchoTest(data) {
    const { nameId, uuid, start } = data
    const user = User.find({ username: nameId })
    if (!user) return
    user.echoUuid = start ? uuid : null
    UsersService.update(user)
  }
}
