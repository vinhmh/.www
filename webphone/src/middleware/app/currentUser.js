/* eslint-disable no-restricted-syntax */
/* eslint default-case: 0 */

import sip from '../../sip'
import * as Sender from '../../socket/sender'
import * as CurrentUser from '../../reducers/currentUser'
import * as DebugInfo from '../../reducers/debugInfo'

export default (type, payload, dispatch, prevState, state) => {
  switch (type) {
    case CurrentUser.ADD: {
      sip.init(payload)
      Sender.updateUserState('debugInfo.browserData', state.debugInfo.browserData)
      TurnStun.start(data => dispatch(DebugInfo.turnStun(data)))
      break
    }
    case CurrentUser.CHANGE:
      sip.user = payload || null
      break
    case CurrentUser.UPDATE: {
      const { currentUser, mediaSettings } = state
      const { echoUuid, inLoungeRoom } = currentUser
      const { echoTest, inputLevel } = mediaSettings
      // echoTest started
      if (echoTest && echoUuid && !prevState.currentUser.echoUuid) {
        Sender.setVolumeIn(currentUser.id, inputLevel)
      }
      $('input[type="range"]').prop('disabled', inLoungeRoom)
      break
    }
  }
}
