/* eslint-disable no-restricted-syntax */
/* eslint default-case: 0 */

import * as Socket from '../../reducers/socket'
import { Sender } from '../../socket'

export default (type, payload, dispatch, prevState, state) => {
  switch (type) {
    case Socket.OPENED: {
      Sender.userNew(payload)
      break
    }
    case Socket.CLOSED:
      // some action
      break
  }
}
