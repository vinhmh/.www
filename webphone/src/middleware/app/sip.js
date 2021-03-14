/* eslint-disable no-restricted-syntax */
/* eslint default-case: 0 */

import sip from '../../sip'
import * as Sip from '../../reducers/sip'

export default (type, payload, dispatch, prevState, state) => {
  switch (type) {
    case Sip.START:
      if (state.sip.ready && sip.user) sip.attachLines()
      break
    case Sip.READY:
      if (state.sip.started) sip.attachLines()
      break
  }
}
