import PropTypes from 'prop-types'
import Sip from '../../sip'
import Socket from '../../socket'

export default class SipControls extends React.Component {
  render() {
    const { user, socket } = this.props
    const callBtnProps = {
      className: 'btn btn-sm btn-success',
      onClick: () => Sip.makeCall(user)
    }
    callBtnProps.disabled = true

    const hangupBtnProps = {
      className: 'btn btn-sm btn-danger',
      onClick: () => Socket.close()
    }
    if (!user.members.length) {
      hangupBtnProps.disabled = true
    }

    return (
      <div>
        <p>Socket Active: <i className={`fa  ${socket.active ? 'fa-check-square-o' : 'fa-square-o'} `} /></p>
        <p>Current User: {user.displayName}</p>
      </div>
    )
  }
}

SipControls.propTypes = {
  user: PropTypes.object.isRequired,
  socket: PropTypes.object.isRequired
}
