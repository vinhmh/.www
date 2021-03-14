import platform from 'platform';
import * as Sender from '../../socket/sender'

export const JANUS_LOG = 'DEBUG_INFO:JANUS_LOG'
export const ERRORS = 'DEBUG_INFO:CLIENT_ERRORS'
export const TURN_STUN = 'DEBUG_INFO:TURN_STUN'

const getMajorNumberFromVersion = (version) => {
  if (!(typeof version === "string")) {
    return version
  }
  return version.split('.')[0]
}

const initialState = {
  browserData: {
    browser: {
      major: getMajorNumberFromVersion(platform.version),
      name: platform.name || "",
      version: platform.version || "",
    },
    cpu: {
      architecture: navigator.platform || "",
      type: platform.os ? platform.os.architecture || "" : "",
    },
    engine: {
      name: platform.layout || "",
    },
    device: {
      model: platform.product || "",
      vendor: platform.manufacturer || ""
    },
    screen: {
      height: window.screen ? window.screen.height || "" : "",
      width: window.screen ? window.screen.width || "" : "",
    },
    os: {
      name: platform.os ? platform.os.family || "" : "",
      version: platform.os ? platform.os.version || "" : ""
    },
    ua: platform.ua
  },
  janusLog: [],
  errors: [],
  turnStun: []
}

export default function (debugInfo = initialState, { type, payload }) {
  let state = helpers.deepCopy(debugInfo)

  switch (type) {
    case JANUS_LOG: {
      state.janusLog.push(payload)
      Sender.updateUserState('debugInfo.janusLog', payload)
      return state
    }
    case ERRORS: {
      state.errors.push(payload)
      Sender.updateUserState('debugInfo.errors', payload)
      return state
    }
    case TURN_STUN: {
      state.turnStun = payload
      Sender.updateUserState('debugInfo.turnStun', payload)
      return state
    }
    default:
      return state
  }
}

export const janusLog = payload => ({
  type: JANUS_LOG,
  payload,
})


export const errors = payload => ({
  type: ERRORS,
  payload,
})

export const turnStun = payload => ({
  type: TURN_STUN,
  payload,
})
