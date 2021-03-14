/* eslint-disable no-restricted-syntax */
/* eslint default-case: 0 */

import * as Sender from '../../socket/sender'
import * as CurrentUser from '../../reducers/currentUser'

export default (type, payload, dispatch, prevState, state) => {
  switch (type) {
    // CurrentUser
    case CurrentUser.CHANGE:
      break
    case CurrentUser.UPDATE:
      break
  }
}
