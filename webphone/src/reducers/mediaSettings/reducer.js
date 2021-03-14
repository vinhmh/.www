import Cookies from 'js-cookie'
import { PASS_INIT_CONFIGURATION } from '../../components/MediaSettings/Steps/IntroStep'
import sip from '../../sip'
import * as SplashScreen from '../splashScreen'

export const CONFIGURED = 'MEDIA_SETTINGS:CONFIGURED'
export const HIDE = 'MEDIA_SETTINGS:HIDE'
export const HINT = 'MEDIA_SETTINGS:HINT'
export const HIDE_GUIDE = 'MEDIA_SETTINGS:HIDE_GUIDE'
export const HIDE_HELP = 'MEDIA_SETTINGS:HIDE_HELP'
export const LOCK_INPUT = 'MEDIA_SETTINGS:LOCK_INPUT'
export const PERMIT = 'MEDIA_SETTINGS:PERMIT'
export const SHOW = 'MEDIA_SETTINGS:SHOW'
export const SHOW_GUIDE = 'MEDIA_SETTINGS:SHOW_GUIDE'
export const SHOW_HELP = 'MEDIA_SETTINGS:SHOW_HELP'
export const SET_AUDIO_INPUT_ID = 'MEDIA_SETTINGS:SET_AUDIO_INPUT_ID'
export const SET_AUDIO_OUTPUT_ID = 'MEDIA_SETTINGS:SET_AUDIO_OUTPUT_ID'
export const SET_DEVICES = 'MEDIA_SETTINGS:SET_DEVICES'
export const SET_INPUT_LEVEL = 'MEDIA_SETTINGS:SET_INPUT_LEVEL'
export const SET_OUTPUT_VOLUME = 'MEDIA_SETTINGS:SET_OUTPUT_VOLUME'
export const SET_OUTPUT_VOLUME_LINE1 = 'MEDIA_SETTINGS:SET_OUTPUT_VOLUME_LINE1'
export const SET_OUTPUT_VOLUME_LINE2 = 'MEDIA_SETTINGS:SET_OUTPUT_VOLUME_LINE2'
export const SET_OUTPUT_VOLUME_ORATOR = 'MEDIA_SETTINGS:SET_OUTPUT_VOLUME_ORATOR'
export const SET_OUTPUT_VOLUME_FLOOR = 'MEDIA_SETTINGS:SET_OUTPUT_VOLUME_FLOOR'
export const SET_OUTPUT_VOLUME_LANGB = 'MEDIA_SETTINGS:SET_OUTPUT_VOLUME_LANGB'
export const SET_OUTPUT_VOLUME_LOUNGE = 'MEDIA_SETTINGS:SET_OUTPUT_VOLUME_LOUNGE'
export const START_ECHO_TEST = 'MEDIA_SETTINGS:START_ECHO_TEST'
export const STOP_ECHO_TEST = 'MEDIA_SETTINGS:STOP_ECHO_TEST'
export const UNLOCK_INPUT = 'MEDIA_SETTINGS:UNLOCK_INPUT'

const AUDIO_INPUT_ID = 'AUDIO_INPUT_ID'
const AUDIO_OUTPUT_ID = 'AUDIO_OUTPUT_ID'

const initialState = {
  audioInputId: null,
  audioOutputId: null,
  microphone: null,
  speaker: null,
  configured: false, // devices are set and ready for use
  devices: [],
  echoTest: false,
  hint: false, // webrtc hint during device access request
  inputLevel: 0,
  inputLocked: true,
  outputVolume: 0.5,
  outputVolumeLine1: 0.5,
  outputVolumeLine2: 0.5,
  outputVolumeOrator: 0.5,
  outputVolumeLangB: 0.5,
  outputVolumeFloor: 0.5,
  outputVolumeLounge: 0.5,
  permitted: false, // user allowance for device usage
  audioInputError: null,
  audioOutputError: null,
  show: false,
  showGuide: false,
  showHelp: false,
}

const getDeviceNameFromId = (id, devicesList, kind) => {
  if (!devicesList) {
    return null
  }
  const deviceFound = devicesList.find((device) => {
    return device.deviceId === id && device.kind === kind;
  });

  if (!deviceFound) {
    return null;
  }

  return deviceFound.label;
}

// Reducer
export default (state = initialState, { type, payload }) => {
  switch (type) {
    case CONFIGURED:
    case HIDE:
    case HINT:
    case LOCK_INPUT:
    case PERMIT:
    case SHOW:
    case SHOW_GUIDE:
    case SHOW_HELP:
    case HIDE_GUIDE:
    case HIDE_HELP:
    case SET_DEVICES:
    case SET_INPUT_LEVEL:
    case SET_OUTPUT_VOLUME_LINE1:
    case SET_OUTPUT_VOLUME_LINE2:
    case SET_OUTPUT_VOLUME_ORATOR:
    case SET_OUTPUT_VOLUME_FLOOR:
    case SET_OUTPUT_VOLUME_LANGB:
    case SET_OUTPUT_VOLUME_LOUNGE:
    case UNLOCK_INPUT:
      return { ...state, ...payload }
    case SET_OUTPUT_VOLUME: {
      const { outputVolume } = payload
      payload = {
        outputVolume,
        outputVolumeLine1: outputVolume,
        outputVolumeLine2: outputVolume,
        outputVolumeOrator: outputVolume,
        outputVolumeLangB: outputVolume,
        outputVolumeFloor: outputVolume,
        outputVolumeLounge: outputVolume,
      }

      return { ...state, ...payload }
    }
    case SET_AUDIO_INPUT_ID: {
      let name = null;
      if (payload) {
        Cookies.set(AUDIO_INPUT_ID, payload)
        name = getDeviceNameFromId(payload, state.devices, "audioinput");
      } else {
        Cookies.remove(AUDIO_INPUT_ID)
      }

      return { ...state, audioInputId: payload, microphone: name }
    }
    case SET_AUDIO_OUTPUT_ID: {
      let name = null;
      if (payload) {
        Cookies.set(AUDIO_OUTPUT_ID, payload)
        name = getDeviceNameFromId(payload, state.devices, "audiooutput");
      } else {
        Cookies.remove(AUDIO_OUTPUT_ID)
      }
      return { ...state, audioOutputId: payload, speaker: name }
    }
    case START_ECHO_TEST:
      return { ...state, echoTest: true }
    case STOP_ECHO_TEST:
      return { ...state, echoTest: false }
    default:
      return state
  }
}

// Actions
export const show = () => ({ type: SHOW, payload: { show: true } })

export const hide = () => ({ type: HIDE, payload: { show: false } })

export const hint = (hint = true) => ({ type: HINT, payload: { hint } })

export const configure = configured => ({ type: CONFIGURED, payload: { configured } })

export const setDevices = devices => ({ type: SET_DEVICES, payload: { devices } })

export const setInputLevel = inputLevel => ({ type: SET_INPUT_LEVEL, payload: { inputLevel } })

export const lockInput = (inputLocked = true) => {
  const type = inputLocked ? LOCK_INPUT : UNLOCK_INPUT
  return { type, payload: { inputLocked } }
}

export const setOutputVolume = outputVolume => ({ type: SET_OUTPUT_VOLUME, payload: { outputVolume } })

export const setOutputVolumeLine1 = outputVolumeLine1 => ({ type: SET_OUTPUT_VOLUME_LINE1, payload: { outputVolumeLine1 } })

export const setOutputVolumeLine2 = outputVolumeLine2 => ({ type: SET_OUTPUT_VOLUME_LINE2, payload: { outputVolumeLine2 } })

export const setOutputVolumeOrator = outputVolumeOrator => ({ type: SET_OUTPUT_VOLUME_ORATOR, payload: { outputVolumeOrator } })

export const setOutputVolumeFloor = outputVolumeFloor => ({ type: SET_OUTPUT_VOLUME_FLOOR, payload: { outputVolumeFloor } })

export const setOutputVolumeLounge = outputVolumeLounge => ({ type: SET_OUTPUT_VOLUME_LOUNGE, payload: { outputVolumeLounge } })

export const setOutputVolumeLangB = outputVolumeLangB => ({ type: SET_OUTPUT_VOLUME_LANGB, payload: { outputVolumeLangB } })

export const permit = (permitted = true, error = null, forInput = true) => (dispatch, getState) => {
  const errorName = error ? error.name || null : null
  const state = getState().mediaSettings

  if (forInput) {
    if (state.permitted === permitted && state.audioInputError === errorName) return
    dispatch({ type: PERMIT, payload: { permitted, audioInputError: errorName } })
  } else {
    if (state.permitted === permitted && state.audioOutputError === errorName) return
    dispatch({ type: PERMIT, payload: { permitted, audioOutputError: errorName } })
  }
}

export const obtainDevices = ({ success, error, final } = {}) => async (dispatch, getState) => {
  const state = getState().mediaSettings
  const { configured } = state

  const noop = () => null
  if (typeof success !== 'function') success = noop
  if (typeof error !== 'function') error = noop
  if (typeof final !== 'function') final = noop

  const uniq = (devices) => {
    const arr = []
    devices.forEach((device) => {
      if (arr.find(d => d.deviceId === device.deviceId && d.kind === device.kind)) return
      arr.push(device)
    })
    return arr
  }

  // do not obtain new devices for mobile safari
  if (configured && helpers.isMobileDevice() && helpers.BrowserType.safari) return

  try {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
    let devices = await navigator.mediaDevices.enumerateDevices()
    devices = uniq(devices)

    dispatch(setDevices(devices))
    dispatch(permit())
    success(devices)

    try {
      const tracks = stream.getTracks()
      for (const i in tracks) {
        const mst = tracks[i]
        if (mst !== null && mst !== undefined) mst.stop()
      }
    } catch (e) {
      Logger.error("Can't stop tracks in stream")
    }
  } catch (err) {
    dispatch(permit(false, err, true))
    error(err)
  } finally {
    final()
  }
}

export const showGuide = () => dispatch => {
  dispatch({ type: SHOW_GUIDE, payload: { showGuide: true } })
  dispatch(show())
}

export const hideGuide = () => dispatch => {
  dispatch({ type: HIDE_GUIDE, payload: { showGuide: false } })
  dispatch(hide())
}

export const showHelp = (showHelp = true) => {
  const type = showHelp ? SHOW_HELP : HIDE_HELP
  return { type, payload: { showHelp } }
}

export const echoTest = (start = true) => {
  const type = start ? START_ECHO_TEST : STOP_ECHO_TEST
  return { type }
}

export const setAudioInputId = payload => ({ type: SET_AUDIO_INPUT_ID, payload })

export const setAudioOutputId = payload => ({ type: SET_AUDIO_OUTPUT_ID, payload })

export const setupAudioInputId = () => (dispatch, getState) => {
  const state = getState().mediaSettings
  let audioInputId = state.audioInputId || Cookies.get(AUDIO_INPUT_ID)

  let device = state.devices.find(d => d.deviceId === audioInputId)
  if (device) return dispatch(setAudioInputId(audioInputId))

  audioInputId = null
  device = state.devices.find(d => d.kind === 'audioinput')
  if (device) audioInputId = device.deviceId

  dispatch(setAudioInputId(audioInputId))
}

export const setupAudioOutputId = () => (dispatch, getState) => {
  const state = getState().mediaSettings
  let audioOutputId = state.audioOutputId || Cookies.get(AUDIO_OUTPUT_ID)

  let device = state.devices.find(d => d.deviceId === audioOutputId)
  if (device) return dispatch(setAudioOutputId(audioOutputId))

  audioOutputId = null
  device = state.devices.find(d => d.kind === 'audiooutput')
  if (device) audioOutputId = device.deviceId

  dispatch(setAudioOutputId(audioOutputId))
}

export const setupDevices = () => (dispatch) => {
  // TODO load outputvolume from cookies
  // TODO load inputLevel from cookies
  dispatch(setupAudioInputId())
  dispatch(setupAudioOutputId())
}

export const setup = () => async (dispatch, getState) => {
  const { configured } = getState().mediaSettings
  const passInitConfig = Cookies.get(PASS_INIT_CONFIGURATION)

  dispatch(SplashScreen.hide())

  if (configured) return sip.setConnection()

  // do not show guide for now
  // if (passInitConfig) {
  if (true) {
    await dispatch(obtainDevices())
    dispatch(setupDevices())
    dispatch(configure(true))
    sip.setConnection()
  } else {
    dispatch(showGuide())
  }
}
