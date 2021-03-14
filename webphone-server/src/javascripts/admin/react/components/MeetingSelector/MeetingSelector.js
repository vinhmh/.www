import { connect } from 'react-redux'
import { array, bool, func, string } from 'prop-types'
import { Label, Icon } from 'semantic-ui-react'
import { hasAudioDevice, hasOnlyHostCandidate } from '../../middleware/common'
import css from './MeetingSelector.scss'

const MEETING_COLOR = {
  'SELECTED': 'blue',
  'ACTIVE': null,
  'INACTIVE': null
}

const MEETING_ICON = {
  'ERROR': 'exclamation triangle',
  'NORMAL': 'user',
  'EMPTY': 'asexual'
}

const getMeetingIcon = (isOnError, hasUsers) => {
  if (isOnError) {
    return MEETING_ICON.ERROR
  }

  if (hasUsers) {
    return MEETING_ICON.NORMAL
  }

  return MEETING_ICON.EMPTY

}

const getMeetingColor = (isSelected, hasUsers) => {
  if (isSelected) {
    return MEETING_COLOR.SELECTED
  }

  if (hasUsers) {
    return MEETING_COLOR.ACTIVE
  }

  return MEETING_COLOR.INACTIVE
}

const hasAUserInTrouble = (users) => {

  return users.some(user => {
    const { userState } = user
    const { debugInfo, mediaSettings } = userState
    const { turnStun } = debugInfo
    const hasDevice = hasAudioDevice(mediaSettings);
    const isWaiting = !user.connected ? true : false;
    const networkIssue = hasOnlyHostCandidate(turnStun);
    return (!hasDevice || (isWaiting && networkIssue))
  })
}

class MeetingSelector extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {

    const { meetingId, users, onMeetingSelected, selected } = this.props
    const nbUsers = users.length
    const isOnError = hasAUserInTrouble(users)

    return (
      <Label className={css.component} as="a" color={getMeetingColor(selected, isOnError, !!nbUsers)} compact="true" size='tiny' key={meetingId}
        onClick={() => {
          onMeetingSelected(meetingId)
        }}
      >
        <Icon name={getMeetingIcon(isOnError, !!nbUsers)} />
        {meetingId}
        {!!nbUsers && (
          <Label.Detail>{nbUsers}</Label.Detail>
        )}
      </Label>
    )
  }
}

MeetingSelector.propTypes = {
  meetingId: string.isRequired,
  users: array.isRequired,
  onMeetingSelected: func.isRequired,
  selected: bool.isRequired
}

const mapStateToProps = () => ({
})

export default connect(mapStateToProps)(MeetingSelector)
