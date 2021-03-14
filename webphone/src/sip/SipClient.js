/* eslint no-underscore-dangle: 0 */
/* eslint no-return-assign: 0 */
import EventEmitter from 'events'
import store from '../store'
import Line from './Line'
import * as Sip from '../reducers/sip'

export const LINES = ['firstLine', 'secondLine', 'oratorLine', 'loungeLine', 'floorLine', 'echoTestLine', 'langbLine']
export const [FIRST_LINE, SECOND_LINE, ORATOR_LINE, LOUNGE_LINE, FLOOR_LINE, ECHO_TEST_LINE, LANGB_LINE] = LINES

const REGISTERED = 'REGISTERED'

class SipClient extends EventEmitter {
  constructor() {
    super()
    this.observer = new Set()
    this.user = null
    this.janus = null
    this.opaqueId = `sip-${Janus.randomString(12)}`
    this.lines = {}
  }

  init(user = null) {
    this.user = user
    Janus.init({
      debug: ['error'],
      callback: () => this.createSession()
    })
    Logger.setJanus()
  }

  createSession() {
    if (!Janus.isWebrtcSupported()) return alert('No WebRTC support... ')

    this.janus = new Janus({
      server: CONFIG.janusEndpoint,
      iceServers: [
        { urls: CONFIG.stunIceUrl },
        { 
          urls:       CONFIG.turnIceUrl, 
          username:   CONFIG.turnUsername, 
          credential: CONFIG.turnCredential
        }
      ],
      success: () => {
        store.dispatch(Sip.start())
      },
      destroyed: () => {
        store.dispatch(Sip.destroy())
        this.lines = {}
        this.observer.clear()
      },
      error: err => Janus.error(err),
    })
  }

  setConnection() {
    if (this.user.isSwitcher) {
      [...this.user.roomsList, this.user.rooms.floor].forEach(item => {
          if (item) this.addCallback(`${REGISTERED}-${item}`, () => this.call(item, item))
      })
      store.dispatch(Sip.connect())
      return
    }

    if (this.user.useFloor || (this.user.isModerator && this.user.useSwitcher)) {
        this.addCallback(`${REGISTERED}-${FLOOR_LINE}`, this.callFloor)
    }

    this.addCallback(`${REGISTERED}-${FIRST_LINE}`, this.callFirst)
    this.addCallback(`${REGISTERED}-${SECOND_LINE}`, this.callSecond)
    store.dispatch(Sip.connect())
  }

  attachLines() {
    const lines = (user) => {
      if (user.isRegular) {
        return [FIRST_LINE, FLOOR_LINE, ECHO_TEST_LINE]
      }

      if (user.isModerator) {
        return LINES
      }

      if (user.isSwitcher) {
        return [...user.roomsList, user.rooms.floor, ECHO_TEST_LINE]
      }
    }

    lines(this.user).forEach(name => this.lines[name] = new Line(this, name))
  }

  onLineRegistered(line) {
    this.addEvent(`${REGISTERED}-${line}`)
  }

  changeInputDevice() {
    Object.keys(this.lines).forEach((name) => {
      const line = this.lines[name]
      line.changeInput()
    })
  }

  call(name, room) {
    this.lines[name].makeCall(room)
  }

  callFirst() {
    this.call(FIRST_LINE, this.user.rooms.first)
  }

  callSecond() {
    this.call(SECOND_LINE, this.user.rooms.second)
  }

  callLounge() {
    this.queueCall(LOUNGE_LINE, this.user.rooms.lounge)
  }

  callFloor() {
    this.call(FLOOR_LINE, this.user.rooms.floor)
  }

  queueCall(lineName, room) {
    const line = this.lines[lineName]
    if (!line) return

    const makeCall = () => line.makeCall(room)
    if (line.isFree()) return makeCall()

    this.removeEvent(`${REGISTERED}-${line}`, makeCall)
    this.once(`${REGISTERED}-${line}`, makeCall)
    line.reload()
  }

  echoTest(run = true) {
    const line = this.lines[ECHO_TEST_LINE]
    if (!run) return line.reload()
    this.queueCall(ECHO_TEST_LINE, CONFIG.echoTestRoom)
  }

  hangup() {
    Object.keys(this.lines).forEach((key) => {
      const line = this.lines[key]
      line.hangup()
    })
  }

  destroy() {
    if(this.janus)
      this.janus.destroy()
  }

  addEvent = (event, data) => {
    this.observer.add(event)
    this.emit(event, data)
  }

  removeEvent = (event) => {
    this.observer.delete(event)
  }

  addCallback = (event, callback) => {
    if (this.observer.has(event)) return callback.call(this)
    return this.once(event, callback)
  }
}

const sipClient = new SipClient()
window.sipClient = sipClient

export default sipClient
