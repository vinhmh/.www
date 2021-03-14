import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import { Sender } from '../../socketTextchat'
import * as AppActions from '../../reducers/app'
import css from '../ChatRoomHeader/ChatRoomHeader.scss'

class DropDown extends React.Component {
  state = {
    displayMenu: false,
    participants: [],
  }

  showDropdownMenu = (event) => {
    const { appActions } = this.props
    event.preventDefault()
    appActions.toggleDrawer('members')
    this.setState({ displayMenu: true })
  }

  hideDropdownMenu = () => {
    const { appActions } = this.props
    appActions.toggleDrawer()
    this.setState({ displayMenu: false, participants: [] })
  }

  add = (id) => {
    const newParticipants = [...this.state.participants, id]
    this.setState({ participants: newParticipants })
  }

  invite = () => {
    const { currentUser, meeting } = this.props
    const { participants } = this.state
    const userInCurrentMeeting =
      meeting &&
      meeting.currentMeeting &&
      meeting.currentMeeting.title &&
      meeting.currentMeeting.title.split(',').map((id) => parseInt(id))
    const configUserExceptCurrentUser = [...participants, ...(userInCurrentMeeting ? userInCurrentMeeting : [])].filter(
      (id) => id != currentUser.id,
    )
    // console.log("configUserExceptCurrentUser", configUserExceptCurrentUser)
    const finalConfig = [...new Set(configUserExceptCurrentUser)]

    Sender.meetingNew({
      title: currentUser.meetingID,
      role: currentUser.role,
      createdById: currentUser.id,
      userInvitedId: finalConfig,
      meetingType:
        meeting && meeting.currentMeeting && meeting.currentMeeting.type ? meeting.currentMeeting.type : 'Public',
      meetingHash:
        meeting && meeting.currentMeeting && meeting.currentMeeting.hash ? meeting.currentMeeting.hash : null,
    })
    this.setState({ participants: [], displayMenu: false })
  }

  render() {
    const { participants } = this.state
    const { currentUser, meeting } = this.props
    const isInclude = (id) => {
      if (
        !participants.every((p) => p !== id) ||
        currentUser.id == id ||
        (meeting && meeting.currentMeeting && meeting.currentMeeting.title == 'Demo') ||
        (meeting && meeting.currentMeeting && !meeting.currentMeeting.title.split(',').every((t) => t != id))
      )
        return true
      return false
    }
    return (
      <div className="dropdown">
        <div className="button" onClick={this.state.displayMenu ? this.hideDropdownMenu : this.showDropdownMenu}>
          <button type="button" className={css.addChatGroupBtn} aria-haspopup="true" aria-expanded="false">
            <img
              // className={css.plusIcon}
              src={'assets/images/nouveau_message.svg'}
              alt="plus icon"
              width="30"
              height="30"
            />
          </button>
        </div>
        {this.state.displayMenu ? (
          <ul>
            {this.props.members.map(({ user }) => {
              return (
                <li
                  style={isInclude(user.id) ? { textDecorationLine: 'line-through' } : null}
                  onClick={() => (isInclude(user.id) ? null : this.add(user.id))}
                  key={user.id}
                >
                  {user.displayName}
                </li>
              )
            })}
          </ul>
        ) : null}
        {participants.length ? <button onClick={this.invite}>Invite</button> : null}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  app: state.app,
  currentUser: state.currentUser,
  meeting: state.meeting,
  messages: state.messages,
  members: state.members,
})

const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(AppActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(DropDown)
