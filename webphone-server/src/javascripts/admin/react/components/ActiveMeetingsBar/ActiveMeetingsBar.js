import { connect } from 'react-redux'
import { array, func, object, string } from 'prop-types'
import { Accordion, Icon, Label } from 'semantic-ui-react'
import MeetingSelector from '../MeetingSelector'
import { filterInactiveMeetings, filtersUserForMeeting } from '../../middleware/meetings'
import css from './ActiveMeetingsBar.scss'

const COMPONENT = {
  TITLE: 'Ongoing',
  NONE: 'None',
  ACTIVE_MEETING: 'Ongoing',
  OTHER_MEETING: 'Others',
  SEE_ALL: 'See all',
  SEE_ACTIVE: 'Hide inactive meetings',
  NO_MEETING: 'No meeting in that section'
}

const renderNone = () => {
  return (
    <span className={css.none}>{COMPONENT.NO_MEETING}</span>
  )
}

const renderMeetingsList = (meetings, users, displayedMeeting, callback) => {
  const hasAtLeastAMeeting = Object.keys(meetings).length > 0
  const hasAtLeastAUser = users.length > 0

  if (hasAtLeastAMeeting) {
    return (Object.keys(meetings).map(meetingId => {
      const usersInMeeting = hasAtLeastAUser ? filtersUserForMeeting(users, meetingId) : []

      return (
        <MeetingSelector key={meetingId} meetingId={meetingId} users={usersInMeeting} onMeetingSelected={(selectedMeeting) => {
          callback(selectedMeeting)
        }} selected={meetingId === displayedMeeting} />
      )
    }))
  } else {
    return renderNone()
  }
}

const renderUsersNumber = (nbUsers, nbConnecting) => {

  if (nbConnecting === 0) {
    return <Label circular color='grey' size='mini'>{nbUsers}</Label>
  }

  return <span><Label circular color='orange'>{nbConnecting}</Label> / {nbUsers}</span>
}

class ActiveMeetingsBar extends React.Component {

  constructor(props) {
    super(props)

    this.state = {
      activeIndex: [0],
      height: 0
    }
  }

  fireOnSizeChange() {
    const { onSizeChanged } = this.props
    const updatedHeight = document.getElementById('acc').clientHeight
    if (updatedHeight !== this.state.height) {
      this.setState({ height: updatedHeight })
      onSizeChanged(updatedHeight)
    }
  }

  componentDidMount() {
    this.fireOnSizeChange()
  }

  componentDidUpdate() {
    this.fireOnSizeChange()
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state

    const isDisplayed = activeIndex.includes(index);
    if (isDisplayed) {
      this.setState({ activeIndex: activeIndex.filter((item) => (item != index)) })
    } else {
      this.setState({ activeIndex: [...activeIndex, index] })
    }
  }

  render() {

    const { all, actives, users, selected, onSelected } = this.props
    const { allMeetings, activeIndex } = this.state
    const inactives = filterInactiveMeetings(actives, all)
    const nbActiveMeetings = Object.keys(actives).length
    const nbPassiveMeetings = Object.keys(inactives).length
    let nbConnectingUsers = users.filter(user => (!user.connected)).length

    return (
      <Accordion exclusive={true} ref={this.ref} id='acc'>
        <div className={allMeetings ? css.height_full : css.height_normal}>
          <div className={css.bar}>
            <Accordion.Title
              active={activeIndex.includes(0)}
              index={0}
              onClick={this.handleClick}
              className={css.title}
            >
              <Icon name='dropdown' />
              <span className={css.meetingsTitle}>{COMPONENT.ACTIVE_MEETING}</span>
              <Label.Group circular className={css.numbers} size='tiny'>
                <span className={css.meetings}><Icon name="clipboard outline" />{nbActiveMeetings}</span>
                <span className={css.users}><Icon name='user' />{renderUsersNumber(users.length, nbConnectingUsers)}</span>
              </Label.Group>
            </Accordion.Title>
            <Accordion.Content active={activeIndex.includes(0)} className={css.list}>
              {renderMeetingsList(actives, users, selected, onSelected)}
            </Accordion.Content>
            <Accordion.Title
              active={activeIndex.includes(1)}
              index={1}
              onClick={this.handleClick}
              className={css.title}
            >
              <Icon name='dropdown' />
              <span className={css.meetingsTitle}>{COMPONENT.OTHER_MEETING}</span>
              <Label.Group circular className={css.numbers} size='tiny'>
                <span className={css.meetings}><Icon name="clipboard outline" />{nbPassiveMeetings}</span>
              </Label.Group>
            </Accordion.Title>
            <Accordion.Content active={activeIndex.includes(1)} className={css.list}>
              {renderMeetingsList(inactives, [], selected, onSelected)}
            </Accordion.Content>
          </div>
        </div>
      </Accordion >
    )
  }
}

ActiveMeetingsBar.propTypes = {
  actives: object.isRequired,
  all: object.isRequired,
  users: array.isRequired,
  selected: string,
  onSelected: func.isRequired,
  onSizeChanged: func.isRequired
}

const mapStateToProps = () => ({
})

export default connect(mapStateToProps)(ActiveMeetingsBar)
