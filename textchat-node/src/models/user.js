import { UserSerializer } from '../serializers'
import { UsersService, MeetingsService } from '../services'
import Record from './record'
import Meeting from './meeting'
import Socket from '../socket'

export default class User extends Record {
  constructor(client, data) {
    super()
    this.id = data.currentUserId
    this.username = data.username
    this.meeting = null
    this.meetings = []
    this.channel = Math.random().toString(36).substr(2)
    this.setupClient(client)
    this.department = data.department || 'participant'
  }

  setupClient(client) {
    this.client = client
    this.client.user = this
    this.client.addChannel(this.channel)
    this.client.addChannel(this.meetings.map(m => m.channel))
    this.client.addCallback(Socket.CLOSED, () => this.disable())
  }

  disable() {
    const listMeeting = this.meetings;
    this.meetings = []
    this.meeting = null
    for (const meeting of listMeeting) {
      if (!meeting) return
      // if there are some other other users in the meeting
      if (meeting.users.some(u => {
        return u.meetings && (u.meetings.findIndex(m => m.id === meeting.id) > -1)
      })) {
        UsersService.disable(this, meeting.channel)
      } else {
        meeting.destroy()
      }
    }
    // const meeting = this.meeting //  eslint-disable-line  prefer-destructuring
  }

  destroy() {
    this.client && this.client.close()
    this.client = null
    const index = User.all.indexOf(this)
    if (index !== -1) {
      User.all.splice(index, 1)
      console.log('Destroy user', this.id)
    }
  }

  findMeeting(meeting) {
    return this.meetings.find(m => m.id === meeting.id)
  }

  addMeeting(meeting) {
    this.meeting = meeting
    if (this.findMeeting(meeting.id)) return
    this.meetings.push(meeting)
    this.client.addChannel(meeting.channel)
  }

  removeMeeting(meeting) {
    const index = this.meetings.indexOf(meeting)
    if (index !== -1) this.meetings.splice(index, 1)
    this.client && this.client.removeChannel(meeting.channel)
    if (this.meetings.length) return
    this.destroy()
  }

  toJSON() {
    return UserSerializer(this)
  }

  static all = [];

  static async add(client, data) {
    const meeting = await Meeting.findOrCreate({ title: data.meetingID, role: data.role, type: 'Public' })
    if (!meeting || !client || (typeof data.currentUserId === 'undefined')) return client.close()
    // TODO find user by uniq  data.token
    const user = new User(client, data, meeting)
    User.all.push(user)
    meeting.addUser(user)
    user.addMeeting(meeting)
    const deepLSupports = client.getDeepLSupports(user.id)
    UsersService.load(user, deepLSupports.deepLSupports)
    MeetingsService.add(meeting)
    if(data.department == 'technical') {
      const techPublicMeeting = await Meeting.findOrCreateForTechnicalTeam({ title: data.meetingID, role: data.role, type: 'TechnicalPublic' })
      techPublicMeeting.addUser(user)
      user.addMeeting(techPublicMeeting)
      MeetingsService.add(techPublicMeeting)
      MeetingsService.messagesChangeToNewUser(techPublicMeeting, [user.id])
      const listTechMeeting = Meeting.all.filter(m => m.type == 'Technical')
      for(const techMeeting of listTechMeeting) {
        techMeeting.addUser(user)
        user.addMeeting(techMeeting)
        MeetingsService.add(techMeeting)
        MeetingsService.messagesChangeToNewUser(techMeeting, [user.id])
      }
    }
    if(data.department == 'moderator') {
      const moderatorPublicMeeting = await Meeting.findOrCreateForModeratorTeam({ title: data.meetingID, role: data.role, type: 'InterpreterPublic' })
      moderatorPublicMeeting.addUser(user)
      user.addMeeting(moderatorPublicMeeting)
      MeetingsService.add(moderatorPublicMeeting)
      MeetingsService.messagesChangeToNewUser(moderatorPublicMeeting, [user.id])
      const {speakRoomId, hearRoomId} = data
      const moderatorCabinMeeting = await Meeting.findOrCreateForModeratorTeamSameCabin({title: data.meetingID, role: data.role, type: 'InterpreterCabin', speakRoomId, hearRoomId })
      moderatorCabinMeeting.addUser(user)
      user.addMeeting(moderatorCabinMeeting)
      MeetingsService.add(moderatorCabinMeeting)
      MeetingsService.messagesChangeToNewUser(moderatorCabinMeeting, [user.id])
    }
  }
}
