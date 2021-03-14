import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { Sender } from '../../socketTextchat'
import * as AppActions from '../../reducers/app'
import * as MeetingActions from '../../reducers/meeting'
import css from './MembersModal.scss'
import SearchBar from './SearchBar'
import UsersListFilterByLang from '../UsersListFilterByLang/UsersListFilterByLang'
import { filterAllowToShow, filterSearch } from '../../utilities/filters'
import Modal from '../../fragments/Modal'
import translator from '../../utilities/translator'

const SCREEN = 'members-modal'

class MembersModal extends React.Component {
  state = {
    participants: [],
    searchTerm: '',
    removeUserId: null
  }

  myRef = React.createRef();

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = e => {
    if (!this.myRef.current.contains(e.target) && this.props.app.drawer == 'members-modal' ) {
      this.close()
    }
  };


  handleOnChange = (searchTerm) => {
    this.setState({ searchTerm })
  }

  close = () => {
    const { appActions } = this.props
    this.setState({ participants: [], searchTerm: '' })
    appActions.toggleDrawer()
  }

  handleAdd = (id) => {
    const { participants } = this.state
    if (participants.findIndex((pId) => pId == id) > -1) {
      const newParticipants = participants.filter((pId) => pId != id)
      return this.setState({ participants: newParticipants })
    }
    const newParticipants = [...participants, id]
    this.setState({ participants: newParticipants })
  }

  invite = () => {
    const { currentUser, meeting, meetingActions } = this.props
    const { meetingsOff } = meeting
    const { participants } = this.state
    const userInCurrentMeeting =
      meeting &&
      meeting.currentMeeting &&
      meeting.currentMeeting.title &&
      meeting.currentMeeting.title.split(',').map((id) => parseInt(id))
    const configUserExceptCurrentUser = [...participants, ...(userInCurrentMeeting ? userInCurrentMeeting : [])].filter(
      (id) => id != currentUser.id,
    )
    const finalConfig = [...new Set(configUserExceptCurrentUser)]
    const fakeTitle = [...finalConfig, currentUser.id].sort().join(',')
    const fakeMeeting = meetingsOff.find((m) => m.title == fakeTitle)
    if (fakeMeeting) {
      meetingActions.removeMeetingOff(fakeMeeting)
    }
    Sender.meetingNew({
      title: currentUser.meetingID,
      role: currentUser.role,
      createdById: currentUser.id,
      userInvitedId: finalConfig,
      meetingType:
        meeting && meeting.currentMeeting && meeting.currentMeeting.type ? meeting.currentMeeting.type : null,
      meetingHash:
        meeting && meeting.currentMeeting && meeting.currentMeeting.hash ? meeting.currentMeeting.hash : null,
      newUsers: participants,
    })
    this.setState({ participants: [], searchTerm: '' })
    this.close()
  }

  handleConfirmRemoveUser = () => {
    const {meeting} = this.props
    const { removeUserId } = this.state
    const {currentMeeting} = meeting
    Sender.removeUser({
      meetingId: currentMeeting.id,
      userIdToRemove: removeUserId
    })
  }

  handleRemoveUser = (userId) => {
    this.setState({ removeUserId: userId })
    appActions.toggleDrawer('remove-user')
  }

  render() {
    const { currentUser, adjustments, members, app, meeting } = this.props
    const { searchTerm, participants } = this.state
    const { drawer } = app
    const finalMembers = members.filter(filterAllowToShow(currentUser)).filter(filterSearch(searchTerm))

    return (
      <div ref={this.myRef} className={`${css.modal} ${drawer == 'members-modal' ? css.modal__active : ''}`}>
        <div className={css.header}>
          <div className={css.title}>
            {meeting && meeting.currentMeeting && meeting.currentMeeting.id ? 'Add to Group' : 'New Conversation'}
          </div>
          <div style={{ flex: 1 }} />

          {participants.length ? (
            <div onClick={this.invite} className={css.done}>
              Done
            </div>
          ) : (
            <div />
          )}
          <div style={{ width: '10px' }} />
          <div onClick={this.close} className={css.title}>
            <i style={{ fontSize: 20, color: 'black', padding: '0 10px' }} className="fa fa-times" />
          </div>
        </div>
        <div className={css.body}>
          <div className={css.logo}>
            <SearchBar term={searchTerm} handleOnChange={this.handleOnChange} />
          </div>
          <div>
            {/* <FilteredUsersList
                participants={participants}
                handleAdd={this.handleAdd}
                adjustments={adjustments}
                user={currentUser}
                members={finalMembers}
              /> */}
            <UsersListFilterByLang
              adjustments={adjustments}
              user={currentUser}
              members={finalMembers}
              participants={participants}
              handleAdd={this.handleAdd}
              fragment={SCREEN}
            />
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  app: state.app,
  currentUser: state.currentUser,
  members: state.members,
  adjustments: state.adjustments,
  meeting: state.meeting,
  messages: state.messages,
})

const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(AppActions, dispatch),
  meetingActions: bindActionCreators(MeetingActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(MembersModal)
