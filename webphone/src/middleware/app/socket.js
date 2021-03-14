/* eslint-disable no-restricted-syntax */
/* eslint default-case: 0 */

import sip from '../../sip'
import * as Socket from '../../reducers/socket'
import * as DebugInfo from '../../reducers/debugInfo'
import * as Sender from '../../socket/sender'

export default (type, payload, dispatch, prevState, state) => {
  switch (type) {
    case Socket.OPEN:
      break
    case Socket.CLOSE:
      sip.destroy()
      break
  }
}
