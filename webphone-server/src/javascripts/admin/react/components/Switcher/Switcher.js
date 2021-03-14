import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { func, array, object } from 'prop-types'
import { Button, Dropdown } from 'semantic-ui-react'
import classNames from 'classnames'
import Socket from '../../socket'
import * as Sender from '../../socket/sender'
import * as MeetingsActions from '../../reducers/meetings'
import SwitcherForm from './SwitcherForm'
import SwitcherList from './SwitcherList'
import css from './Switcher.scss'

const defaultOption = {
  key: 'all',
  text: 'all',
  value: 'all'
}

class Switcher extends React.Component {
  constructor(props) {
    super(props)
    this.titlesMap = {}
    this.meetingsMap = CONF_MAP.meetings
    this.meetingIds = []
  }

  state = {
    filter: {
      meetingId: 'all',
    }
  }

  componentDidMount() {
    const { meetingsActions, socketInit } = this.props
    this.meetingIds = Object.keys(this.meetingsMap)
    this.meetingIds.forEach(meetingID => {
      const meeting = this.meetingsMap[meetingID]
      const { floor, lounge } = meeting
      this.titlesMap[meetingID] = {
        [floor]: { title: 'Floor' },
        [lounge]: { title: 'Lounge' }
      }
      meeting.conferences.forEach(c => this.titlesMap[meetingID][c.number] = { title: c.title, code: c.code })
    })
    meetingsActions.load(CONF_MAP.meetings)
    socketInit()
  }

  meetingOptions() {
    const { meetings } = this.props
    const options = [defaultOption]

    Object.keys(meetings).forEach(meetingID => {
      if (options.some(option => option.key === meetingID)) return

      options.push({
        key: meetingID,
        text: meetingID,
        value: meetingID
      })
    })
    return options
  }

  setFilterOption = (prop, data) => {
    const { filter } = this.state
    this.setState({ filter: { ...filter, [prop]: data.value } })
  }

  render() {
    const { meetings, users } = this.props
    const { filter } = this.state
    const conferenceVisible = filter.meetingId !== 'all'

    return (
      <div>
        <div className={css.switcherLauncher}>
          <SwitcherForm users={users} meetingsMap={this.meetingsMap} />
        </div>
        <div className={css.switcherBar}>
          <span>
            Meeting: &nbsp;
            <Dropdown
              inline
              placeholder="Select meeting"
              options={this.meetingOptions()}
              value={filter.meetingId}
              onChange={(e, data) => this.setFilterOption('meetingId', data)}
            />
          </span>
        </div>
        <SwitcherList users={users} filter={filter} meetings={meetings} meetingsMap={this.meetingsMap} titlesMap={this.titlesMap} />
      </div>
    )
  }
}

Switcher.propTypes = {
  adjustments: object.isRequired,
  meetings: object.isRequired,
  socketInit: func.isRequired,
  users: array.isRequired,
}

const mapStateToProps = state => ({
  adjustments: state.adjustments,
  meetings: state.meetings,
  users: state.users,
})

const mapDispatchToProps = dispatch => ({
  socketInit: () => Socket.init(dispatch),
  meetingsActions: bindActionCreators(MeetingsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Switcher)
