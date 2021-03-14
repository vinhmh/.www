import axios from 'axios'
import { getId } from '../helpers'
import Record from './record'
import User from './user'
import Meeting from './meeting'
import { MessageSerializer } from '../serializers'
import { MessagesService } from '../services'
import config from '../../config'

// TODO move to redis

let id = 0

export default class Message extends Record {
  constructor(data) {
    super(data)
    this.id = ++id
    this.lang = data.lang
    this.user = User.find(data.userId)
    this.meeting = Meeting.find(data.meetingId)
    this.text = {
      [data.lang]: data.text,
      toString: () => this.originalText()
    }
    this.file = data.file
    this.createdAt = +new Date()
  }

  originalText() {
    return this.text[this.lang]
  }

  destroy() {
    const index = Message.all.indexOf(this)
    if (index !== -1) {
      Message.all.splice(index, 1)
      console.log('Destroy Message', this.id)
    }
  }

  toJSON() {
    return MessageSerializer(this)
  }

  static all = []

  static async add(client, data) {
    const message = new Message(data)
    const languageConfigs = client.getDeepLSupports(message.user.id)
    await Message.translate(message, languageConfigs)
    Message.all.push(message)
    MessagesService.add(message)
  }

  static async translate(message, languageConfigs) {
    const { deepLSupports, languagesConfig } = languageConfigs
    const original = message.originalText()

    const requests = () => languagesConfig.split(',')
      .filter(lang => lang && lang !== message.lang)
      .map((lang) => {
        const callback = (data) => {
          const { text } = data.translations[0]
          message.text = { ...message.text, [lang]: text }
        } 
        return Message.deepl(original, message.lang, lang, callback, deepLSupports)
      })

    return Promise.all(requests())
  }

  static async deepl(text, source, target, callback = null, deepLSupports) {
    const finalSource = deepLSupports.findIndex(l => l.language == source) > -1 ? source : 'EN'
    const finalTarget = deepLSupports.findIndex(l => l.language == target) > -1 ? target : 'EN'
    const url = `${config.apiUrl}?text=${encodeURIComponent(text)}&source_lang=${finalSource}&target_lang=${finalTarget}&auth_key=${config.authKey}`
    try {
      const response = await axios.get(url)
      if (callback) callback(response.data)
      return response
    } catch (error) {
      return null
    }
  }

  static byMeeting(meeting) {
    const meetingId = getId(meeting)
    return Message.all.filter(m => {
      if (typeof m.meeting === 'undefined') return 
     return m.meeting.id === meetingId
    })
  }

  static byUserMeeting(user, meeting) {
    const userId = getId(user)
    const meetingId = getId(meeting)
    return Message.all.filter(m => m.user.id === userId && m.meeting.id === meetingId)
  }

  static removeMessagesByMeeting({meetingId}) {
    if (!meetingId) return 
    const newListMessages = Message.all.filter(m => typeof m.meeting != "undefined" && m.meeting.id != meetingId)
    Message.all = newListMessages
    MessagesService.deleteChatSuccess({meetingId})
  }
}
