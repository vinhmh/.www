import _ from 'lodash'
import axios from 'axios'
import Record from './record'
import Message from './message'
import { MeetingSerializer } from '../serializers'
import { MeetingsService } from '../services'
import config from '../../config'
import User from './user'
import { generateHash } from '../helpers'

let id = 0

const typeCheck = (arr = []) => {
  switch (true) {
    case arr.length == 2:
      return 'Private'
    case arr.length > 2:
      return 'Group'
    default:
      return 'Public'
  }
}

export default class Meeting extends Record {
  constructor(data) {
    super()
    this.id = ++id
    this.title = data.title
    this.conferences = data.conferences || []
    this.channel = Math.random().toString(36).substr(2)
    this.users = []
    this.hash = data.hash || null
    this.prevHash = null
    this.type = data.type || 'Public'
    this.createdBy = data.createdBy || null
    this.cabinCode = data.cabinCode || null
  }

  findUser(userId) {
    return this.users.find((u) => u.id === userId)
  }

  addUser(data = {}) {
    if (typeof data.id === 'undefined') return 
    const user = this.findUser(data.id)
    if (user) return
    this.users.push(data)
  }

  static async removeUser(client, { meetingId, userIdToRemove }) {
    const meeting = Meeting.find({ id: meetingId })
    if (!meeting) return 
    const newUsers = meeting.users.filter(u => u.id != userIdToRemove)
    meeting.users = newUsers
    const newHash = generateHash(newUsers.map(u => u.id).sort().toString())
    meeting.prevHash = meeting.hash
    meeting.hash = newHash
    const user = User.find({id: userIdToRemove }) 
    if(!user) return 
    const newMeetings = user.meetings.filter(m => m.id != meetingId)
    user.meetings = newMeetings
    await MeetingsService.removeUser(meeting, user)
    client.removeUserChannel(meeting.channel, userIdToRemove)
  }


  addUserByIds(data = []) {
    for(const id of data) {
      const user = this.users.find((u) => u.id === id)
      // const user = this.findUser(data.id)
      if (user) return
      const targetUser = User.find({id})
      if (!targetUser) return
      this.users.push(targetUser)
      targetUser.addMeeting(this)
    }
  }

  destroy() {
    Message.byMeeting(this).forEach((m) => m.destroy())
    if (this.type === 'Public') {
      this.users.forEach((u) => u.removeMeeting(this))
    }
    const index = Meeting.all.indexOf(this)
    if (index !== -1) {
      Meeting.all.splice(index, 1)
      console.log('Destroy Meeting', this.id)
    }
  }

  toJSON() {
    return MeetingSerializer(this)
  }

  static all = []

  static add(data) {
    const meeting = new Meeting(data)
    Meeting.all.push(meeting)
    return meeting
  }

  static async findOrCreate({ title, role, type }) {
    const meeting = Meeting.find({ title, type })
    if (meeting) return meeting

    let conferences
    const { webphoneSecretToken } = config
    const params = { meetingID: title, secretToken: webphoneSecretToken }
    try {
      const response = await axios.get(
        `${config.webphoneServer}/getMeetingData`,
        { params }
      )
      conferences = response.data.meeting.conferences.filter(
        (c) => role !== 'regular' || c.accessible
      )
    } catch (error) {
      return null
    }

    return Meeting.add({ title, conferences })
  }

  static async findOrCreateForTechnicalTeam({ title, role, type }) {
    const meeting = Meeting.find({ title, type })
    if (meeting) return meeting
 
    let conferences
    const { webphoneSecretToken } = config
    const params = { meetingID: title, secretToken: webphoneSecretToken }
    try {
      const response = await axios.get(
        `${config.webphoneServer}/getMeetingData`,
        { params }
      )
      conferences = response.data.meeting.conferences.filter(
        (c) => role !== 'regular' || c.accessible
      )
    } catch (error) {
      return null
    }

    return Meeting.add({ title, conferences, type })
  }


  static async findOrCreateForModeratorTeam({ title, role, type }) {
    const meeting = Meeting.find({ title, type })
    if (meeting) return meeting
 
    let conferences
    const { webphoneSecretToken } = config
    const params = { meetingID: title, secretToken: webphoneSecretToken }
    try {
      const response = await axios.get(
        `${config.webphoneServer}/getMeetingData`,
        { params }
      )
      conferences = response.data.meeting.conferences.filter(
        (c) => role !== 'regular' || c.accessible
      )
    } catch (error) {
      return null
    }

    return Meeting.add({ title, conferences, type })
  }
  
  static async findOrCreateForModeratorTeamSameCabin({ title, role, type, speakRoomId, hearRoomId }) {
    const cabinCode = [speakRoomId, hearRoomId].map(id => parseInt(id)).sort().join(',')
    const meeting = Meeting.find({ title, type, cabinCode })
    if (meeting) return meeting
 
    let conferences
    const { webphoneSecretToken } = config
    const params = { meetingID: title, secretToken: webphoneSecretToken }
    try {
      const response = await axios.get(
        `${config.webphoneServer}/getMeetingData`,
        { params }
      )
      conferences = response.data.meeting.conferences.filter(
        (c) => role !== 'regular' || c.accessible
      )
    } catch (error) {
      return null
    }

    return Meeting.add({ title, conferences, type, cabinCode })
  }

  static async addNew(
    client,
    { title, role, createdById, userInvitedId, meetingType, meetingHash, newUsers }
  ) {
    const allUsersInNewMeeting = [...userInvitedId, createdById].filter(userId => User.all.findIndex(u => u.id === userId) > -1)
    if (allUsersInNewMeeting.length < 2) return
    const uIds = [...allUsersInNewMeeting]
    const hash = generateHash(uIds.sort().toString())
    const newTitle = uIds.sort().join(',')
    const meeting = Meeting.find({ hash, type: meetingType ? meetingType : typeCheck(allUsersInNewMeeting) })
    if (meeting) return meeting

    let conferences
    const { webphoneSecretToken } = config
    const params = { meetingID: title, secretToken: webphoneSecretToken }
    try {
      const response = await axios.get(
        `${config.webphoneServer}/getMeetingData`,
        { params }
      )
      conferences = response.data.meeting.conferences.filter(
        (c) => role !== 'regular' || c.accessible
      )
    } catch (error) {
      return null
    }

    if (meetingType !== 'Group') {
      const createdByUser = User.find({ id : createdById })
      const userClone = _.cloneDeep(createdByUser)
      const newMeeting = Meeting.add({
        title: newTitle,
        conferences,
        hash,
        type:
          meetingType == 'Technical'
            ? 'Technical'
            : typeCheck(allUsersInNewMeeting),
        createdBy: userClone
      })
      client.addChannelWhenCreateNewMeeting(
        newMeeting.channel,
        allUsersInNewMeeting
      )
      newMeeting.addUserByIds(allUsersInNewMeeting)
      MeetingsService.add(newMeeting)
    } else {
      let meeting = Meeting.find({ hash: meetingHash })
      if (!meeting) {
        meeting = Meeting.find({ prevHash: meetingHash })
      }
      if (!meeting) return
      meeting.hash = hash
      meeting.prevHash = null
      meeting.title = newTitle
      client.addChannelWhenCreateNewMeeting(
        meeting.channel,
        allUsersInNewMeeting
      )
      meeting.addUserByIds(allUsersInNewMeeting)
      MeetingsService.add(meeting)
      MeetingsService.messagesChangeToNewUser(meeting, newUsers)
    }
  }

}