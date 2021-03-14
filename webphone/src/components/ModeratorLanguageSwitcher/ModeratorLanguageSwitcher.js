import PropTypes from 'prop-types'
import classNames from 'classnames'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as Sender from '../../socket/sender'
import * as MediaSettingsActions from '../../reducers/mediaSettings'
import * as ModeratorsActions from '../../reducers/moderators'
import React from 'react'
import ReactSlider from 'react-slider' // New one
import css from './ModeratorLanguageSwitcher.scss'
import gcss from '../App/App.scss'
import { WORKING } from '../../utilities/noticeTypes'
import { toggleMuteApp } from '../../utilities/appMute'

const LEFT = 37
const RIGHT = 39

class ModeratorLanguageSwitcher extends React.Component {
  state = {
    relayClicked: null,
  }

  constructor(props) {
    super(props)
  }

  componentDidMount() {
    document.addEventListener('keyup', this.keypress)
  }

  componentDidUpdate() {
    // this.handleMicroHalo();
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keypress)
  }

  switchRooms = (user) => {
    const member = this.memberByRoomId(user.rooms.orator || user.hearRoomId)
    const memberFloor = this.memberByRoomId(user.rooms.floor)
    const disabled = !((memberFloor && memberFloor.hear) || (member && member.hear))
    if (disabled) return
    Sender.switchRooms(user.id)
  }

  keypress = (e) => {
    if (e.keyCode === RIGHT) {
      const { user } = this.props
      if (user.speakRoomId === user.rooms.first) {
        this.switchRooms(user)
      }
    }

    if (e.keyCode === LEFT) {
      const { user } = this.props
      if (user.speakRoomId !== user.rooms.first) {
        this.switchRooms(user)
      }
    }
  }

  memberByRoomId(roomId) {
    const { user } = this.props
    return user.members.find((m) => m.roomId === roomId)
  }

  toggleSpeak = (roomId) => {
    const { user, moderatorsAction, appMuted, appActions } = this.props

    const allHearMuted = !user.members.filter((m) => m.hear).length
    const userSpeak = !!user.members.find((m) => m.speak)
    const member = this.memberByRoomId(roomId)
    const { speak } = member || {}

    const disabled = user.useSwitcher && user.isModerator && allHearMuted

    if (disabled || !member) return
    if (!speak && !userSpeak) {
      if (appMuted) {
        toggleMuteApp()
        appActions.setMute(false)
      }
      if (user.hearRoomId && user.hearRoomId === roomId) {
        Sender.switchRooms(user.id)
      }
      Sender.toggleSpeakMember(user.id, member.id, roomId)
      Sender.relayUser(user.id, WORKING)
      moderatorsAction.update({ data: { userId: user.id, msg: WORKING }, currentUser: user })
      return
    }

    if (speak) {
      Sender.toggleSpeakMember(user.id, member.id, roomId)
      return
    }

    Sender.switchRooms(user.id)
  }

  micro(user, roomId) {
    const member = this.memberByRoomId(roomId)
    let cssBlob = css.microIcon
    if (member && member.speak && member.talking) cssBlob = css.microIcon + ' ' + gcss.blob + ' ' + gcss.blue
    else if (member && member.speak) cssBlob = css.microIcon + ' ' + gcss.blue

    let microBtnProps = {
      className: classNames(css.switcherBtn, {
        [css.microNotAllowed]: user.inLoungeRoom,
        [css.microActivated]: member?.speak && !member.user.inLoungeRoom,
      }),
      disabled: user.inLoungeRoom
    }

    return (
      <>
        <button {...microBtnProps} onClick={(e) => this.toggleSpeak(roomId)}>
          <img
            className={cssBlob}
            src={member?.speak && !member.user.inLoungeRoom ? 'assets/images/micro_blanc.svg' : 'assets/images/micro_off.svg'}
            alt="micro icon"
            width="45"
            height="45"
          />
        </button>
        <span className={css.langCode}>{user.titlesMap[roomId] && user.titlesMap[roomId].code}</span>
      </>
    )
  }

  render() {
    const { user } = this.props
    return (
      <div className={css.switchContainer}>
        <div>
          {this.micro(user, user.rooms.first)}
        </div>
        <div>
          {this.micro(user, user.rooms.second)}
        </div>
      </div>
    )
  }
}

ModeratorLanguageSwitcher.propTypes = {
  appActions: PropTypes.object.isRequired,
  appMuted: PropTypes.bool.isRequired,
  currentUserUpdate: PropTypes.func.isRequired,
  members: PropTypes.array.isRequired,
  noticeActions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  mediaSettings: state.mediaSettings,
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(MediaSettingsActions, dispatch),
  moderatorsAction: bindActionCreators(ModeratorsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(ModeratorLanguageSwitcher)
