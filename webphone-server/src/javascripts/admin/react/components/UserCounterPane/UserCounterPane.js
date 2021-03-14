import { connect } from 'react-redux'
import { array } from 'prop-types'
import { Popup } from 'semantic-ui-react'
import css from './UserCounterPane.scss'

const COMPONENT = {
  WAITING: 'waiting',
  SESSIONS: 'sessions',
  SESSION: 'session'
}

class UserCounterPane extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { users, members } = this.props
    const nbMembers = members.length
    const nbUsers = users.length
    const nbWaiting = nbUsers - nbMembers.length
    const hasUsers = nbUsers > 0
    const hasAtLeastOneUser = nbUsers > 1

    const popupText = hasUsers ? `${nbMembers} connected ${hasAtLeastOneUser ? 'sessions' : 'session'} out of ${nbUsers}` : 'No session'

    return (
      <Popup
        trigger={<div className={css.participantsCount}>
      <span className={hasUsers ? nbMembers === nbUsers ? css.participantCountHighlight : css.participantCountWarning : css.noparticipant}>{nbMembers}</span>
      {nbWaiting > 0 && (
        <span className={css.participantError}>(+{nbWaiting} {COMPONENT.WAITING})</span>
      )}
      <span>/ {nbUsers}&nbsp;</span>
      <span>{hasAtLeastOneUser ? COMPONENT.SESSIONS : COMPONENT.SESSION}</span>
        </div>}
        content={popupText}
      />
    )
  }
}

UserCounterPane.propTypes = {
  users: array.isRequired,
  members: array.isRequired
}

const mapStateToProps = () => ({
})

export default connect(mapStateToProps)(UserCounterPane)
