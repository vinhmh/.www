import PropTypes, { object } from 'prop-types'
import classnames from 'classnames'
import * as Sender from '../../../socket/sender'
import Sip from '../../../sip'
import css from './Lounge.scss'

export default class Lounge extends React.Component {
  joinLounge = () => {
    const { user, currentUserActions } = this.props
    const { currentUserUpdate } = currentUserActions

    if (!user.connected) return
    if (user.inLoungeRoom) {
      Sender.leaveLounge(user.id)
    } else {
      currentUserUpdate({ connected: false })
      Sender.joinLounge(user.id)
      Sip.callLounge()
    }
  }

  render() {
    const { user } = this.props
    const btnProps = {
      className: classnames(css.loungeBtn, {
        [css.loungeBtnActive]: user.inLoungeRoom
      }),
      onClick: this.joinLounge
    }

    return (
      <button {...btnProps}>LOUNGE</button>
    )
  }
}

Lounge.propTypes = {
  currentUserActions: object.isRequired,
  user: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired
}
