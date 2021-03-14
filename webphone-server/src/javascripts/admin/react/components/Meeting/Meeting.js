import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { Button, Confirm, Table } from 'semantic-ui-react'
import User from '../User'
import Placeholder from "../PlaceHolder/PlaceHolder"
import css from './Meeting.scss'
import ModalUserMessage from '../ModalUserMessage'
import MeetingMenu from '../MeetingMenu'
import ParticipantsMenu from '../ParticipantsMenu'
import DetailsUser from '../DetailsUser'
import DetailsUserBar from '../DetailsUserBar'
import ModalUserState from '../ModalUserState'
import FilterUsers from '../FilterUsers'
import ModalDevicesList from '../ModalDevicesList'
import { hasAudioDevice, hasOnlyHostCandidate, ISSUES_FILTER, ROLES_FILTER } from '../../middleware/common'
import { reconnectAListOfUsers, muteAListOfUsers, disconnectAListOfUsers, toggleFloor } from '../../middleware/actions'
import { saveToFile } from '../../middleware/logger'
import { orderByDisplayName } from '../../middleware/users'

const DIMENSION = {

  SIDEBAR_WIDTH: 400,
  TOPBAR_HEIGHT: 60,
  MEETING_BAR_HEIGHT: 50,
  DELTA: 24
}

class Meeting extends React.Component {
  state = {
    confirmContent: 'Are you sure?',
    confirmOpen: false,
    handleCancel: null,
    handleConfirm: null,
    modalUserMessage: false,
    modalUserState: false,
    modalDevicesList: false,
    users: this.props.users,
    kind: "participants",
    details: false,
    selectedUserId: null,
    selectedUserDevices: [],
    meetingOnly: false
  }

  componentDidUpdate(prevProps) {

    if (prevProps.meetingId !== this.props.meetingId) {
      this.setState({ details: false, selectedUserId: null, selectedUserDevices: [] })
    }
  }

  isFloorDisabled = (meetingID, adjustments) => (!!(adjustments.meetings && adjustments.meetings[meetingID] && adjustments.meetings[meetingID].floorDisabled))

  filterUsers(users, filter) {

    let arr = users

    if (filter.role !== ROLES_FILTER.ALL) {
      arr = arr.filter(u => u.role === filter.role)
    }

    if (filter.issue !== ISSUES_FILTER.NO_FILTER) {
      arr = arr.filter(user => {
        const { userState } = user
        const { debugInfo, mediaSettings } = userState
        const { turnStun } = debugInfo

        const hasNetworkIssue = hasOnlyHostCandidate(turnStun)
        const hasDeviceIssue = !hasAudioDevice(mediaSettings)
        const hasAConnectionIssue = !user.connected && hasNetworkIssue

        return (hasDeviceIssue || hasAConnectionIssue)
      })
    }

    return arr
  }

  setConfirm = ({ confirmContent = 'Are you sure?', confirmOpen = false, handleCancel = null, handleConfirm = null }) => {
    this.setState({ confirmContent, confirmOpen, handleCancel, handleConfirm })
  }

  groupByBooth = moderators => _.groupBy(moderators, moderator => {
    const { cf1, cf2 } = moderator
    return [cf1, cf2].sort().join()
  })

  floorDisableBtn = (meetingID, meeting) => {
    const { adjustments } = this.props

    if (!meeting.useFloor) return;

    const floorDisabled = this.isFloorDisabled(meetingID, adjustments);

    return (
      <>
        <Button icon={!floorDisabled ? "stop" : "play"} color={floorDisabled ? 'blue' : 'orange'} compact size='small' content={floorDisabled ? "Enable floor" : "Disable floor"} onClick={() => { toggleFloor(meetingID) }} />
        <span className={css.info_separator}>&nbsp;|&nbsp;</span>
      </>);
  }

  doActions = (actionText, targetedUsers, fct) => {

    const moreThanOneUser = targetedUsers.length > 1
    const nbUsers = targetedUsers.length

    this.setConfirm({
      confirmOpen: true,
      confirmContent: `There ${moreThanOneUser ? "are" : "is"} ${nbUsers} attendee(s). Are you sure you want to ${actionText} ${moreThanOneUser ? "them" : "him"}?`,
      handleCancel: () => this.setConfirm({}),
      handleConfirm: () => {
        fct(targetedUsers)
        this.setConfirm({})
      }
    })
  }

  reconnectAll = (users) => {
    this.doActions('reconnect', users, reconnectAListOfUsers)
  }

  muteAll = (users) => {
    this.doActions('mute', users, muteAListOfUsers)
  }

  disconnectAll = (users) => {
    this.doActions('disconnect', users, disconnectAListOfUsers)
  }

  sendMessageToAllInterpreters = (interpreters) => {
    this.setState({ users: interpreters, kind: "interpreters", modalUserMessage: true })
  }

  sendMessageToAll = (users) => {
    this.setState({ users: users, kind: "users", modalUserMessage: true })
  }

  sendMessageToAllParticipants = (participants) => {
    this.setState({ users: participants, kind: "participants", modalUserMessage: true, })
  }

  disconnectSelectedUser = (user) => {
    if (user.id === this.state.selectedUserId) {
      this.setState({ selectedUserId: null, selectedUserDevices: [], details: false })
      this.disconnectAll([user])
    }
  }

  renderList = (meetingID, users, meeting, display) => {
    const { titlesMap, filter, onFilterChange } = this.props

    orderByDisplayName(users)

    const switchers = _.filter(users, 'isSwitcher')
    const moderators = _.filter(users, 'isModerator')
    const boothTeams = this.groupByBooth(moderators)
    const regularUsers = _.filter(users, 'isRegular')

    const selectedUserId = this.state.selectedUserId
    const selectedUser = !!selectedUserId ? users.find(user => user.id === selectedUserId) : null

    let table_less_height = DIMENSION.DELTA + DIMENSION.TOPBAR_HEIGHT + (display.onlyMeeting ? 0 : display.activeBarHeight) + display.meetingBarHeight + DIMENSION.MEETING_BAR_HEIGHT

    return (
      <>
        <div key={meetingID}>
          <div className={css.meetingBar}>
            <FilterUsers role={filter.role} issue={filter.issue} onFilterChange={(type, value) => {
              onFilterChange(type, value)
            }} />
            <div className={css.externalUrl} />
            {this.floorDisableBtn(meetingID, meeting)}
            <MeetingMenu
              hasUsers={!!users.length}
              hasParticipants={!!regularUsers.length}
              hasInterpreters={!!moderators.length}
              onMuteAll={() => this.muteAll(users)}
              onDisconnectAll={() => { this.disconnectAll(users) }}
              onReconnectAll={() => { this.reconnectAll(users) }}
              onSendMessageToAll={() => { this.sendMessageToAll(users) }}
              onSendMessageToAllInterpreters={() => { this.sendMessageToAllInterpreters(moderators) }}
              onSendMessageToAllParticipants={() => { this.sendMessageToAllParticipants(regularUsers) }}
              onMuteAllParticipants={() => this.muteAll(regularUsers)}
              onDisconnectAllParticipants={() => { this.disconnectAll(regularUsers) }}
              onReconnectAllParticipants={() => { this.reconnectAll(regularUsers) }}
            />
          </div>
          {users.length > 0 && (
            <div className={css.grid}>
              <div style={{ height: `calc(100% - ${table_less_height}px)` }}>
                <div className={css.gridParticipants} style={{ width: this.state.details ? `calc(100% - ${DIMENSION.SIDEBAR_WIDTH}px)` : '100%', display: 'inline-block' }}>
                <div key={meetingID} className={css.tableHolder}>
                  <Table fixed singleLine striped compact className={css.table}>
                    <Table.Header>
                      <Table.Row>
                        <Table.HeaderCell width={6}>Name</Table.HeaderCell>
                        <Table.HeaderCell width={5}>Conference</Table.HeaderCell>
                        <Table.HeaderCell width={5}>Actions</Table.HeaderCell>
                      </Table.Row>
                    </Table.Header>
                    {
                      !!switchers.length && (
                        <Table.Body>
                          {switchers.map((user) => <User key={user.id} user={user} setConfirm={this.setConfirm} titlesMap={titlesMap} onMessage={(users, kind) => this.setState({ users: users, kind: kind, modalUserMessage: true, })} kind="participant" onSelected={(user) => {
                            this.setState({ selectedUserId: user.id, details: true })
                          }} />)}
                        </Table.Body>
                      )
                    }
                    {
                      Object.keys(boothTeams).map(booth => {
                        const [cf1, cf2] = booth.split(',')
                        const meeting = titlesMap[meetingID]
                        const title = id => (meeting && id in meeting ? meeting[id].title : id)
                        return (
                          <Table.Body key={booth}>
                            <Table.Row className={css.boothBackgroundRow}>
                              <Table.Cell colSpan={2}>
                                <label className={css.boothTitle} >Booth {title(cf1)} - {title(cf2)} &nbsp;<span className={css.bootUserNumber}><i className="fa fa-user-tie" />&nbsp;{boothTeams[booth].length}</span></label>
                              </Table.Cell>
                              <Table.Cell colSpan={1} className={css.alignRight} style={{ overflow: "visible" }}>
                                <ParticipantsMenu
                                  color='brown'
                                  title="For All interpreters in that booth"
                                  hasUsers={!!users.length}
                                  hasParticipants={!!boothTeams[booth].length}
                                  onSendMessageToAllParticipants={() => { this.sendMessageToAllInterpreters(boothTeams[booth]) }}
                                  onMuteAllParticipants={() => this.muteAll(boothTeams[booth])}
                                  onDisconnectAllParticipants={() => { this.disconnectAll(boothTeams[booth]) }}
                                  onReconnectAllParticipants={() => { this.reconnectAll(boothTeams[booth]) }}
                                />
                              </Table.Cell>
                            </Table.Row>
                            {boothTeams[booth].map(user => <User key={user.id} selected={user.id === selectedUserId} user={user} setConfirm={this.setConfirm} titlesMap={titlesMap} onMessage={(users, kind) => this.setState({ users: users, kind: kind, modalUserMessage: true, })} kind="interpreter" onSelected={(user) => {
                              this.setState({ selectedUserId: user.id, details: true })
                            }} />)}
                          </Table.Body>
                        )
                      })
                    }
                    {
                      !!regularUsers.length && (
                        <Table.Body>
                          <Table.Row className={css.regularBackgroundRow}>
                            <Table.Cell colSpan={2}>
                              <label className={css.regularTitle}>Participants &nbsp;<span className={css.regularUserNumber}><i className="fa fa-user" />&nbsp;{regularUsers.length}</span></label>
                            </Table.Cell>
                            <Table.Cell colSpan={1} className={css.alignRight} style={{ overflow: "visible" }}>
                              <ParticipantsMenu
                                color='grey'
                                title="For All participants"
                                hasUsers={!!users.length}
                                hasParticipants={!!regularUsers.length}
                                onSendMessageToAllParticipants={() => { this.sendMessageToAllParticipants(regularUsers) }}
                                onMuteAllParticipants={() => this.muteAll(regularUsers)}
                                onDisconnectAllParticipants={() => { this.disconnectAll(regularUsers) }}
                                onReconnectAllParticipants={() => { this.reconnectAll(regularUsers) }}
                              />
                            </Table.Cell>
                          </Table.Row>
                          {regularUsers.map((user) => <User key={user.id} selected={user.id === selectedUserId} user={user} setConfirm={this.setConfirm} titlesMap={titlesMap} onMessage={(users, kind) => {
                            this.setState({ users: users, kind: kind, modalUserMessage: true, })
                          }
                          } kind="participants" onSelected={(user) => {
                            this.setState({ selectedUserId: user.id, details: true })
                          }} />)}
                        </Table.Body>
                      )
                    }
                  </Table>
                </div>
                </div>
                {this.state.details && selectedUser && (
                  <div className={css.gridDetails} style={{ width: `${DIMENSION.SIDEBAR_WIDTH}px`, display: 'inline-block' }}>
                  <div className={css.gridTitle}>
                    <DetailsUserBar
                      user={selectedUser}
                      onClose={() => { this.setState({ details: false }) }}
                        onDisconnect={(user) => { this.disconnectSelectedUser(user) }} />
                  </div>
                  <DetailsUser
                      user={selectedUser}
                      onClose={() => { this.setState({ details: false }) }}
                      onDebug={() => { this.setState({ modalUserState: true }) }}
                      onDevices={(devices) => { this.setState({ modalDevicesList: true, selectedUserDevices: devices }) }}
                      onSaveJanus={(janusLog, id) => { saveToFile(janusLog, id) }} />
                  </div>
              )}
              </div>
            </div>
        )}
        {users.length === 0 && (
          <Placeholder />
        )}
      </div>
      </>
    )
  }

  render() {
    const { confirmOpen, confirmContent, handleCancel, handleConfirm } = this.state
    const { meetingId, meeting, users, filter, display } = this.props
    const filteredUsers = this.filterUsers(users, filter)

    const selectedUserId = this.state.selectedUserId
    const selectedUser = !!selectedUserId ? users.find(user => user.id === selectedUserId) : null

    return (
      <React.Fragment>
        {this.renderList(meetingId, filteredUsers, meeting, display)}
        <Confirm
          open={confirmOpen}
          content={confirmContent}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
        <ModalUserMessage open={this.state.modalUserMessage} kind={this.state.kind} users={this.state.users} onClose={() => this.setState({ modalUserMessage: false })} />
        {selectedUser && (
          <ModalUserState open={this.state.modalUserState} user={selectedUser} onClose={() => { this.setState({ modalUserState: false }) }} />
        )}
        <ModalDevicesList open={this.state.modalDevicesList} devices={this.state.selectedUserDevices} onClose={() => this.setState({ modalDevicesList: false, selectedUserDevices: [] })} />
      </React.Fragment>
    )
  }
}

Meeting.propTypes = {
  adjustments: PropTypes.object.isRequired,
  filter: PropTypes.object.isRequired,
  meetingId: PropTypes.string.isRequired,
  titlesMap: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  onFilterChange: PropTypes.func.isRequired,
  display: PropTypes.object.isRequired,
}

const mapStateToProps = state => ({
  adjustments: state.adjustments,
})

export default connect(mapStateToProps)(Meeting)
