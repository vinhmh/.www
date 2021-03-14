/* eslint-disable no-restricted-syntax */
/* eslint default-case: 0 */

import currentUserMdw from './currentUser'
import socketMdw from './socket'

export default ({ dispatch, getState }) => next => action => {
  const { type, payload } = action
  const prevState = getState()
  next(action)
  const state = getState()

  const middlewareMap = {
    'CURRENT_USER:': currentUserMdw,
    'SOCKET:': socketMdw,
  }

  for (const prop in middlewareMap) {
    if (type.indexOf(prop) === 0) {
      middlewareMap[prop].call(this, type, payload, dispatch, prevState, state)
      break
    }
  }
}
