import store from '../store'
import * as MediaSettings from '../reducers/mediaSettings'
import * as SplashScreenActions from '../reducers/splashScreen/reducer'

import Socket from '../socket'
import { FIRST_LINE, SECOND_LINE, ORATOR_LINE, LANGB_LINE, FLOOR_LINE, LOUNGE_LINE } from './SipClient'

export default class Line {
  constructor(sip, name) {
    this.sip = sip
    this.name = name
    this.handle = null
    this.active = false
    this.registered = false
    this.closed = true
    this.room = null
    this.attach()
  }

  toString = () => this.name

  attach() {
    this.closed = false
    const handleRemoteJsep = (jsep) => {
      if (jsep === null || jsep === undefined) return
      this.handle.handleRemoteJsep({ jsep, error: this.handle.hangup })
    }

    this.sip.janus.attach({
      plugin: 'janus.plugin.sip',
      opaqueId: this.opaqueId, // or Janus.randomString(12)
      success: (pluginHandle) => {
        this.handle = pluginHandle
        this.register()
        Janus.vdebug({ topic: 'JANUS', level: 'SUCCESS', content: `Plugin attached for line ${this.name}! (${this.handle.getPlugin()}, id=${this.handle.getId()})` })
      },
      error: cause => {
        Janus.vdebug({ topic: 'JANUS', level: 'ERROR', content: `Can't attach plugin for line ${this.name} with cause '${cause}'` })
      },
      onmessage: (msg, jsep) => {
        const { result } = msg
        if (result !== null && result !== undefined && result.event !== undefined && result.event !== null) {
          const { event } = result
          if (event === 'registration_failed') {
            Janus.vdebug({ topic: 'SIP', level: 'ERROR', content: `Registration failed for line ${this.name} with ${result.code}/${result.reason}` })
            store.dispatch(SplashScreenActions.auth_error())
            // Socket.close()
          } else if (event === 'registered') {
            this.onRegister(result)
          } else if (event === 'progress') {
            // Call can start already: handle the remote answer
            Janus.vdebug({ topic: 'SIP', level: 'INFO', content: `There's early media from ${result.username} for line ${this.name}, waiting for the call!` })
            handleRemoteJsep(jsep)
          } else if (event === 'accepted') {
            // Call can start, now: handle the remote answer
            Janus.vdebug({ topic: 'SIP', level: 'SUCCESS', content: `${result.username} 'accepted' received for line ${this.name}!` })
            handleRemoteJsep(jsep)
          } else if (event === 'hangup') {
            Janus.vdebug({ topic: 'SIP', level: 'INFO', content: `Call hung up for line ${this.name} with reason ${result.code}/${result.reason}` })
            this.closed = true
            // this.reload()
            // this.handle.hangup()
          }
        } else {
          const { error, error_code } = msg
          if (error && error_code) {
            Janus.vdebug({ topic: 'SIP', level: 'ERROR', content: `Cant't update the call with reason ${error_code}/${error}` })
          }
        }
      },
      onlocalstream: (stream) => {
        Janus.vdebug({ topic: 'WEBRTC', level: 'INFO', content: `Got a local stream for line ${this.name}` })
        Janus.debug(stream)
      },
      onremotestream: async (stream) => {
        Janus.vdebug({ topic: 'WEBRTC', level: 'INFO', content: `Got a remote stream ${this.name}` })
        Janus.debug(stream)

        if (this.sip.user.isSwitcher && this.name !== 'echoTestLine') return

        const memdiaDomId = `audio-${this}`
        let media = document.getElementById(memdiaDomId)
        const {
          audioOutputId,
          outputVolume,
          outputVolumeLine1,
          outputVolumeLine2,
          outputVolumeOrator,
          outputVolumeFloor,
          outputVolumeLangB,
          outputVolumeLounge,
        } = store.getState().mediaSettings

        if (!media) {
          media = document.createElement('audio')
          media.id = memdiaDomId
          media.autoplay = true

          let volume = outputVolume
          switch (this.name) {
            case FIRST_LINE:
              volume = outputVolumeLine1
              break
            case SECOND_LINE:
              volume = outputVolumeLine2
              break
            case ORATOR_LINE:
              volume = outputVolumeOrator
              break
            case LANGB_LINE:
              volume = outputVolumeLangB
              break
            case FLOOR_LINE:
              volume = outputVolumeFloor
              break
            case LOUNGE_LINE:
              volume = outputVolumeLounge
              break
            default:
              console.log('Unknown line')
          }
          media.volume = volume

          try {
            if (media.setSinkId && audioOutputId) await media.setSinkId(audioOutputId)
          } catch (e) {
            store.dispatch(MediaSettings.permit(false, e, false))
            Janus.vdebug({ topic: 'WEBRTC', level: 'ERROR', content: `Can't assign media to device ${audioOutputId}` })
            Janus.error(e)
            store.dispatch(MediaSettings.permit(false))
          }
          document.querySelector('#sip-audio').appendChild(media)
        }
        Janus.attachMediaStream(media, stream)
      },
      iceState: (state) => {
        Janus.vdebug({ topic: 'WEBRTC', level: 'INFO', content: `ICE State for line ${this.name} goes to ${state}` })
      },
      mediaState: (medium, on) => {
        Janus.vdebug({ topic: 'WEBRTC', level: 'INFO', content: `Line ${this.name} has ${on ? "started" : "stopped"} receiving ${medium}` })
      },
      webrtcState: (on) => {
        Janus.vdebug({ topic: 'WEBRTC', level: 'INFO', content: `State for line ${this.name} changed to ${on ? "up" : "down"}` })
      },
      slowLink: (uplink, lost) => {
        Janus.vdebug({ topic: 'WEBRTC', level: 'WARNING', content: `Slow link for line ${this.name} on ${uplink ? "sending" : "receiving"} with ${lost} packets lost` })
      },
      oncleanup: () => {
        Janus.vdebug({ topic: 'WEBRTC', level: 'INFO', content: `PeerConnection closed for line ${this.name}` })
        this.room = null
        this.active = false
        this.registered = false
        this.closed = true
      },
      detached: () => {
        Janus.vdebug({ topic: 'JANUS', level: 'INFO', content: `Plugin detached for line ${this.name}!` })
      }
    })
  }

  // By default, the SIP plugin tries to extract the username part from the SIP
  // identity to register; if the username is different, you can provide it here
  // let authuser = data.username;
  // register.authuser = authuser;
  // The display name is only needed when you want a friendly name to appear when you call someone
  // let displayname = data.username
  // The display name is only needed when you want a friendly name to appear when you call someone
  // register.display_name = displayname;
  register() {
    const { handle } = this
    if (!handle || handle.detached) return

    const { host, username, password } = this.sip.user
    Janus.vdebug({ topic: 'SIP', level: 'INFO', content: `Register as sip:${username}@${host} for line ${this.name}!` })
    const register = {
      request: 'register',
      username: `sip:${username}@${host}`,
      secret: password,
      proxy: `sip:${host}`,
    }
    handle.send({ message: register })
  }

  onRegister(result) {
    Janus.vdebug({ topic: 'SIP', level: 'SUCCESS', content: `Registered as ${result.username} for line ${this.name}!` })
    this.registered = true
    this.sip.onLineRegistered(this)
  }

  makeCall(room) {
    this.active = true
    let firstAttempt = true
    let audioSend = true

    const { handle } = this
    const { host } = this.sip.user
    const { audioInputId, devices } = store.getState().mediaSettings
    const body = { request: 'call', uri: `sip:${room}@${host}` }
    const echoCancellation = ['switcher', 'moderator', 'interpreter'].indexOf(this.sip.user.role) === -1

    const invoke = () => {
      Janus.vdebug({ topic: 'WEBRTC', level: 'INFO', content: `Create offer for line ${this.name} and device ${audioInputId}` })
      handle.createOffer({
        media: {
          audioRecv: true,
          audioSend,
          videoRecv: false,
          videoSend: false,
          audio: { deviceId: { exact: audioInputId }, echoCancellation },
          // video: { deviceId: { exact: devices.find((d) => (d.kind === 'videoinput')).deviceId }},
        },
        success: (jsep) => {
          Janus.vdebug({ topic: 'WEBRTC', level: 'SUCCESS', content: `Offer created for line ${this.name}!` })
          Janus.debug(jsep)
          this.room = room
          Janus.vdebug({ topic: 'SIP', level: 'INFO', content: `Call SIP URI '${body.uri}' (in room ${room})` })
          handle.send({ message: body, jsep })
        },
        error: (err) => {
          Janus.vdebug({ topic: 'WEBRTC', level: 'ERROR', content: `Can't create offer for line ${this.name}...` })
          Janus.debug(err)
          if (firstAttempt && audioSend) {
            Janus.vdebug({ topic: 'WEBRTC', level: 'INFO', content: `Retry for line ${this.name}` })
            audioSend = false
            firstAttempt = false
            return invoke()
          }
        }
      })
    }

    invoke()
  }

  changeInput() {
    const { handle } = this
    if (!handle || !this.active) return

    const body = { audio: true, video: false, request: 'update' }
    const { audioInputId } = store.getState().mediaSettings
    const echoCancellation = ['switcher', 'moderator', 'interpreter'].indexOf(this.sip.user.role) === -1

    Janus.vdebug({ topic: 'WEBRTC', level: 'INFO', content: `Change microphone to '${audioInputId}' for line ${this.name}` })

    return handle.createOffer({
      media: {
        data: false,  // Let's negotiate data channels as well || WE DO NOT USE DATACHANNELS
        replaceAudio: true,
        audioRecv: true,
        audioSend: true,
        videoRecv: false,
        videoSend: false,
        audio: { deviceId: { exact: audioInputId }, echoCancellation },
      },
      success: (jsep) => {
        Janus.vdebug({ topic: 'WEBRTC', level: 'SUCCESS', content: `Successfully renegociated for '${audioInputId}' for line ${this.name}` })
        handle.send({ message: body, jsep })
      },
      error: (error) => {
        Janus.vdebug({ topic: 'WEBRTC', level: 'ERROR', content: `Can't renegotiate device '${audioInputId}' for line ${this.name}:`, error })
      }
    })
  }

  reload() {
    // line is not used
    if (this.closed) return this.attach()

    // line is in register process
    if (!this.registered) return

    // line is active
    this.registered = false
    this.handle.detach()
    this.attach()
  }

  hangup() {
    this.handle.send({ message: { request: 'hangup' } })
  }

  isFree() {
    return (this.registered && !this.active && !this.handle.webrtcStuff.pc)
  }
}
