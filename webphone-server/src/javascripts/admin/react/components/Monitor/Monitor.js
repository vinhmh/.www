import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { func, array, object } from 'prop-types'
import Socket from '../../socket'
import Meeting from '../Meeting'
import TopBarMenu from '../TopBarMenu'
import Footer from '../Footer'
import MeetingPlaceHolder from '../MeetingPlaceHolder'
import ConnectionPopup from '../ConnectionPopup'
import ActiveMeetingsBar from '../ActiveMeetingsBar'
import MeetingBar from '../MeetingBar'
import * as MeetingsActions from '../../reducers/meetings'
import { arrayEquals, filterActiveMeetings, hasUsersForMeeting, filtersUserForMeeting } from '../../middleware/meetings'
import css from './Monitor.scss'
import { ISSUES_FILTER, ROLES_FILTER, BOOTH_TYPE } from '../../middleware/common'

class Monitor extends React.Component {
  constructor(props) {
    super(props)
    this.titlesMap = {}
    this.meetingsMap = CONF_MAP.meetings
    this.meetingIds = []

    this.state = {
      filter: {
        role: ROLES_FILTER.ALL,           // Filter users depending on roles
        issue: ISSUES_FILTER.NO_FILTER,   // Filter users depending on issues
        meetings: {},                     // Filter meetings depending on activity (keep only meetings with at least one person)
        selected: null                    // Filter meetings depending on selection (keep only the meeting displayed on screen)
      },
      confirmContent: 'Are you sure?',
      confirmOpen: false,
      handleCancel: null,
      handleConfirm: null,
      display: {
        onlyMeeting: false,
        activeBarHeight: 0,
        meetingBarHeight: 0,
      }
    }
  }

  static getDerivedStateFromProps(props, state) {

    const newActiveMeetings = filterActiveMeetings(props.users, props.meetings);
    const newActiveMeetingsKeys = Object.keys(newActiveMeetings);
    const currentActiveMeetingsKeys = Object.keys(state.filter.meetings);

    let selected = state.filter.selected;

    let hasUpdate = !arrayEquals(newActiveMeetingsKeys, currentActiveMeetingsKeys);

    if (hasUpdate) {
      let newSelected = selected;

      if (newActiveMeetingsKeys.length === 0) {
        newSelected = null
      } else {
        if (!newSelected || !newActiveMeetingsKeys.includes(selected) || !selected) {
          newSelected = newActiveMeetingsKeys[0]
        }
      }

      let actives = Object.assign({}, newActiveMeetings);
      const filter = { ...state.filter, meetings: actives, selected: newSelected }
      return { ...state, filter };
    }

    return state
  }

  componentDidMount() {
    const { meetingsActions, socketInit } = this.props
    this.meetingIds = Object.keys(this.meetingsMap)

    this.meetingIds.forEach(meetingID => {
      const meeting = this.meetingsMap[meetingID]
      const { floor, lounge } = meeting
      this.titlesMap[meetingID] = {
        [floor]: { title: BOOTH_TYPE.FLOOR },
        [lounge]: { title: BOOTH_TYPE.LOUNGE }
      }
      meeting.conferences.forEach(c => this.titlesMap[meetingID][c.number] = { title: c.title, code: c.code })
    })
    meetingsActions.load(CONF_MAP.meetings)
    socketInit()
  }

  setFilterOption = (prop, value) => {
    const { filter } = this.state
    this.setState({ filter: { ...filter, [prop]: value } }, () => {
    })
  }

  setDisplayOption = (prop, value) => {
    const { display } = this.state
    this.setState({ display: { ...display, [prop]: value } }, () => {
    })
  }

  hideSomeMeetings = (meetings) => {
    let actives = Object.assign({}, this.state.filter.meetings);
    meetings.forEach(meetingId => {
      actives[meetingId].isEmpty = !hasUsersForMeeting(this.props.users, meetingId);
    });
    this.setState({ filter: { ...this.state.filter, ["meetings"]: actives } });
  }

  showSomeMeetings = (meetings, onlyThem = false) => {
    let actives = Object.assign({}, this.state.filter.meetings);
    if (onlyThem) {
      Object.keys(actives).forEach(meetingId => { actives[meetingId].visible = false });
    }
    meetings.forEach(meetingId => {
      if (!actives[meetingId]) {
        actives[meetingId] = this.props.meetings[meetingId] || {};
      } 
    });
    this.setState({ filter: { ...this.state.filter, ["meetings"]: actives } });
  }

  onMeetingSelectionChange = (meetingId) => {
    if (this.state.filter.selected === meetingId) {
      // Remove selected
      this.setFilterOption('selected', null)
    } else {
      this.setFilterOption('selected', meetingId)
    }
  }

  render() {
    const { adjustments, meetings, users } = this.props
    const { filter } = this.state

    const activeMeetings = this.state.filter.meetings

    // Current
    const filteredMeetingId = this.state.filter.selected
    const filteredMeeting = activeMeetings[filteredMeetingId] || {}
    const filteredUsers = filteredMeetingId ? filtersUserForMeeting(users, filteredMeetingId) : []

    return (
      <>
        <TopBarMenu />
        <div className={css.monitorArea}>
          {(this.props.socket.reconnecting || this.props.socket.aborted) && (
            <ConnectionPopup />
          )}

          {!this.state.display.onlyMeeting && (
            <ActiveMeetingsBar all={meetings} actives={activeMeetings} users={users} selected={filteredMeetingId}
              onSelected={this.onMeetingSelectionChange}
              onSizeChanged={(height) => { this.setDisplayOption('activeBarHeight', height) }}
            />
          )}
          {filteredMeetingId && (
            <>
              <MeetingBar users={filteredUsers} meeting={filteredMeeting} meetingId={filteredMeetingId} adjustments={adjustments}
                onSizeChanged={(height) => { this.setDisplayOption('meetingBarHeight', height) }}
                onMeetingOnlyDisplayed={(only => {
                  this.setDisplayOption('onlyMeeting', only)
                })}
              />
            <Meeting adjustments={adjustments} meetingId={filteredMeetingId} users={filteredUsers} filter={filter} meeting={filteredMeeting} meetingsMap={this.meetingsMap} titlesMap={this.titlesMap} onFilterChange={(type, value) => {
              this.setFilterOption(type, value)
              }} display={this.state.display} />
            </>
          )}
          {!filteredMeetingId && (
            <MeetingPlaceHolder />
          )}
          <Footer />
        </div>
      </>
    )
  }
}

Monitor.propTypes = {
  adjustments: object.isRequired,
  meetings: object.isRequired,
  socketInit: func.isRequired,
  users: array.isRequired,
}

const mapStateToProps = state => ({
  adjustments: state.adjustments,
  meetings: state.meetings,
  users: state.users,
  socket: state.socket
})

const mapDispatchToProps = dispatch => ({
  socketInit: () => Socket.init(dispatch),
  meetingsActions: bindActionCreators(MeetingsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Monitor)
