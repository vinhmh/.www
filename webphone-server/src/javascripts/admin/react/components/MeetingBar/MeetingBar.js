import { connect } from 'react-redux'
import { Header, Icon, Divider } from 'semantic-ui-react'
import { array, object, string, func } from 'prop-types'
import SwitcherPane from '../SwitcherPane'
import FloorPane from '../FloorPane'
import BBBPane from '../BBBPane'
import UserCounterPane from '../UserCounterPane'
import ModalQrcode from '../ModalQrcode'
import css from './MeetingBar.scss'

const COMPONENT = {
  PARAMETERS: 'Parameters',
}

class MeetingBar extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      displayInfo: false,
      displayOnlyCurrent: false,
      height: 0
    }
  }

  componentDidUpdate() {
    const { onSizeChanged } = this.props
    const updatedHeight = document.getElementById('bar').clientHeight
    if (updatedHeight !== this.state.height) {
      this.setState({ height: updatedHeight })
      onSizeChanged(updatedHeight)
    }
  }

  isFloorDisabled = (meetingID, adjustments) => (!!(adjustments.meetings && adjustments.meetings[meetingID] && adjustments.meetings[meetingID].floorDisabled))

  render() {

    const { users, meeting, meetingId, adjustments, onMeetingOnlyDisplayed } = this.props
    const platformUrl = meeting?.platformUrl

    const members = users.filter(u => u.members.length !== 0)   // Connected
    const isInfoDisplayed = this.state.displayInfo
    const isDisplayOnlyCurrent = this.state.displayOnlyCurrent
    const icon = isInfoDisplayed ? 'eye slash' : 'eye'
    const secondIcon = isDisplayOnlyCurrent ? 'chevron circle down' : 'chevron circle up'

    return (
      <div id='bar' className={css.meetingFullBar}>
        <Header as='h2' textAlign='center'>
          <Icon size='tiny' name='clipboard outline' circular className={css.icon} />
          <Header.Content className={css.title}>{meetingId}</Header.Content>

          <span className={css.extra} ><Icon name={icon} className={css.see} onClick={() => {
            this.setState({ displayInfo: !isInfoDisplayed })
          }} /><Icon name={secondIcon} className={css.secondSee} onClick={() => {
            this.setState({ displayOnlyCurrent: !isDisplayOnlyCurrent })
            onMeetingOnlyDisplayed(!isDisplayOnlyCurrent)
          }} /></span>
          {isInfoDisplayed && ( 
          <Header.Subheader>
          <Divider horizontal className={css.divider}>{COMPONENT.PARAMETERS}</Divider>
            <div className={css.optionsBar}>
              {platformUrl && (
                <BBBPane platformURL={platformUrl} />
              )}
              <FloorPane floor={meeting?.useFloor || false} disabled={this.isFloorDisabled(meetingId, adjustments)} />
              <SwitcherPane switcher={meeting?.useSwitcher || false} />
              <UserCounterPane users={users} members={members} />
                <ModalQrcode meetingsMap={CONF_MAP.meetings} meetingID={meetingId} webphoneUrl={CONFIG.webphoneUrl} appUrl={CONFIG.appUrl} />
            </div>
          </Header.Subheader>
          )}
        </Header>
      </div>
    )
  }
}

MeetingBar.propTypes = {
  users: array.isRequired,
  meeting: object.isRequired,
  meetingId: string.isRequired,
  onMeetingOnlyDisplayed: func.isRequired,
  onSizeChanged: func.isRequired
}

const mapStateToProps = () => ({
})

export default connect(mapStateToProps)(MeetingBar)
