/* eslint-disable no-restricted-syntax */
/* eslint default-case: 0 */

import sip from '../../sip'
import * as MediaSettings from '../../reducers/mediaSettings'
import * as Sender from '../../socket/sender'

const trackState = (prevState, state) => {
  if (helpers.objChanged(prevState.mediaSettings, state.mediaSettings)) {
    Sender.updateUserState('mediaSettings', state.mediaSettings)
  }
}

export default (type, payload, dispatch, prevState, state) => {
  trackState(prevState, state)

  switch (type) {
    case MediaSettings.SHOW:
      dispatch(MediaSettings.obtainDevices())
      break
    case MediaSettings.HIDE_GUIDE:
      sip.setConnection()
      break
    case MediaSettings.START_ECHO_TEST:
      sip.echoTest()
      break
    case MediaSettings.STOP_ECHO_TEST:
      sip.echoTest(false)
      break
    case MediaSettings.SET_AUDIO_INPUT_ID: {
      if (prevState.mediaSettings.audioInputId === payload) break
      sip.changeInputDevice()
      break
    }
    case MediaSettings.SET_INPUT_LEVEL: {
      const { inputLevel } = payload
      if (prevState.mediaSettings.inputLevel === inputLevel) break
      Sender.setVolumeIn(state.currentUser.id, inputLevel)
      break
    }
    case MediaSettings.SET_OUTPUT_VOLUME_LINE1: {
      const { outputVolumeLine1 } = payload
      const audio = document.getElementById('audio-firstLine')
      audio.volume = outputVolumeLine1
      break
    }
    case MediaSettings.SET_OUTPUT_VOLUME_LINE2: {
      const { outputVolumeLine2 } = payload
      const audio = document.getElementById('audio-secondLine')
      audio.volume = outputVolumeLine2
      break
    }
    case MediaSettings.SET_OUTPUT_VOLUME_ORATOR: {
      const { outputVolumeOrator } = payload
      const audio = document.getElementById('audio-oratorLine')
      audio.volume = outputVolumeOrator
      break
    }
    case MediaSettings.SET_OUTPUT_VOLUME_LANGB: {
      const { outputVolumeLangB } = payload
      const audio = document.getElementById('audio-langbLine')
      audio.volume = outputVolumeLangB
      break
    }
    case MediaSettings.SET_OUTPUT_VOLUME_FLOOR: {
      const { outputVolumeFloor } = payload
      const audio = document.getElementById('audio-floorLine')
      audio.volume = outputVolumeFloor
      break
    }
    case MediaSettings.SET_OUTPUT_VOLUME_LOUNGE: {
      const { outputVolumeLounge } = payload
      const audio = document.getElementById('audio-loungeLine')
      audio.volume = outputVolumeLounge
      break
    }
  }
}
