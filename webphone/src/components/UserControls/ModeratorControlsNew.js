import PropTypes from 'prop-types'
import classnames from 'classnames'
import * as Sender from '../../socket/sender'
import css from './UserControls.scss'

export default class ModeratorControlsNew extends React.Component {
  state = {
    peekedOn: true,
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.user.hearBoth === prevState.peekedOn) return null
    return { peekedOn: nextProps.user.hearBoth }
  }

  memberByRoomId(roomId) {
    const { user } = this.props
    return user.members.find(m => m.roomId === roomId)
  }

  defineRoom = (roomId) => {
    const { user } = this.props
    const member = this.memberByRoomId(roomId)
    const floorMember = this.memberByRoomId(user.rooms.floor)
    const memberHear = member && member.hear
    const showFloor = floorMember && floorMember.hear && user.speakRoomId !== roomId

    let props = null

    if (user.rooms.orator && user.hearRoomId === roomId) {
      props = {
        className: css.textBtn,
        onClick: () => this.onPickHearRoom(roomId)
      }
      if (!user.connected) props.disabled = true
    }

    props = props || {
      className: classnames(
        css.label,
        {
          [css.hearLabel]: memberHear || showFloor,
          [css.speakLabel]: member && member.speak
        }
      )
    }

    if (showFloor) roomId = floorMember.roomId

    return <div {...props}>{user.titlesMap[roomId].title}</div>
  };

  switchBtn = () => {
    const { user } = this.props
    const member = this.memberByRoomId(user.rooms.orator || user.hearRoomId)
    const memberFloor = this.memberByRoomId(user.rooms.floor)
    const disabled = this.noClick() || !((memberFloor && memberFloor.hear) || (member && member.hear))
    const props = {
      className: classnames(css.controlBtn, {
        [css.btnPassive]: disabled
      }),
      onClick: () => {
        if (disabled) return
        Sender.switchRooms(user.id)
      }
    }

    let iconClass = 'fa fa-long-arrow-'
    iconClass += (user.speakRoomId === user.rooms.first) ? 'left' : 'right'

    return (
      <button {...props}>
        <i className={iconClass} aria-hidden="true" />
      </button>
    )
  };

  onPickHearRoom = (roomId) => {
    const { user } = this.props
    if (this.noClick()) return
    //Sender.pickHearRooms(user.id, roomId)
  }

  noClick = () => {
    const { user } = this.props
    return !user.connected || user.inLoungeRoom
  }

  hearBtn = () => {
    const { user } = this.props
    const { floor } = user.rooms
    const hear = !!user.members.find(m => m.hear && m.roomId !== floor)
    const title = user.hearRoomId ? user.titlesMap[user.hearRoomId].code : null
    const disabled = this.noClick()
    const hearBtnProps = {
      className: classnames(css.controlBtn, css.floorBtn, {
        [css.modBtn]: hear && !user.hearBoth,
        [css.btnPassive]: disabled,
      }),
      onClick: () => {
        if (disabled) return

        this.onToggleHear()
      }
    }


    return (
      <button {...hearBtnProps}>
        <i className={`fa fa-volume${hear ? '-up' : '-off'}`} />
        {!user.inLoungeRoom && <span>{title}</span>}
      </button>
    )
  }

  speakBtn = roomId => {
    const { user } = this.props

    const allHearMuted = !user.members.filter(m => m.hear).length
    const userSpeak = !!user.members.find(m => m.speak)
    const member = this.memberByRoomId(roomId)
    const { speak } = (member || {})

    const disabled = this.noClick() || ((user.userFloor || user.useSwitcher) && user.isModerator && allHearMuted)
    const speakBtnProps = {
      className: classnames(css.btn, css.controlBtn, {
        [css.modBtn]: speak,
        [css.btnPassive]: disabled
      }),
      onClick: () => {
        // todo refactor and move to webphone-node
        if (disabled || !member) return
        if (!speak && !userSpeak) {
          if (user.hearRoomId && user.hearRoomId === roomId) {
            Sender.switchRooms(user.id)
          }
          Sender.toggleSpeakMember(user.id, member.id, roomId)
          return
        }

        if (speak) {
          Sender.toggleSpeakMember(user.id, member.id, roomId)
          return
        }

        Sender.switchRooms(user.id)
      }
    }
    return (
      <button {...speakBtnProps}>
        <i className={`fa fa-microphone${speak ? '' : '-slash'}`} />
        <span>{user.titlesMap[roomId].code}</span>
      </button>
    )
  }

  peekBtn = () => {
    const { user } = this.props
    const { peekedOn } = this.state
    if (!user.isModerator) return

    const { hearBoth } = user
    const disabled = user.inLoungeRoom || this.noClick()
    const props = {
      className: classnames(
        css.controlBtn, css.peekBtn,
        {
          [css.modBtn]: peekedOn,
          [css.btnPassive]: disabled
        }
      ),
      onClick: e => {
        if (disabled) return

        this.onPeek(e)
      }
    }
    return (
      <button {...props}>
        <i className={`fa fa-volume${hearBoth ? '-up' : '-off'}`} />
        <i className={`fa fa-volume${hearBoth ? '-up' : '-off'} fa-flip-horizontal`} />
      </button>
    )
  }

  floorBtn = () => {
    const { user } = this.props
    const { floor } = user.rooms
    if (!user.isModerator || !(user.useFloor || user.userSwitcher)) return

    const member = user.members.find(m => m.roomId === floor)
    const hear = member && member.hear
    const disabled = !member
    const props = {
      className: classnames(
        css.controlBtn, css.floorBtn,
        {
          [css.modBtn]: hear,
          [css.btnPassive]: disabled
        }
      ),
      onClick: () => {
        if (disabled) return

        Sender.toggleHearMember(user.id, member.id, member.roomId)
      }
    }

    return (
      <button {...props}>
        <i className={`fa fa-volume${hear ? '-up' : '-off'}`} />
        <span>Floor</span>
      </button>
    )
  }

  onToggleSpeak = () => {
    const { user, noticeActions } = this.props
    noticeActions.hide()
    Sender.toggleSpeakSelf(user.id)
  }

  onToggleHear = () => {
    const { user } = this.props
    Sender.toggleHearSelf(user.id)
  }

  onPeek = (e) => {
    const { user } = this.props
    const { peekedOn } = this.state
    const on = !peekedOn
    if (on) {
      e.currentTarget.classList.remove(css.inactive)
      //Sender.userPeekOn(user.id)
    } else {
      e.currentTarget.classList.add(css.inactive)
      //Sender.userPeekOff(user.id)
    }
    this.setState({ peekedOn: on })
  }

  render() {
    const { user } = this.props
    const firstRoom = this.defineRoom(user.rooms.first)
    const switchBtn = this.switchBtn()
    const secondRoom = this.defineRoom(user.rooms.second)

    return (
      <div className={classnames(css.controlsHolder, css.moderatorControls, { [css.disconnected]: !user.connected })}>
        <div className={css.hearControls}>
          {this.floorBtn()}
          {this.hearBtn()}
        </div>
        <div>
          {this.speakBtn(user.rooms.first)}
          {this.speakBtn(user.rooms.second)}
        </div>
        {/* <div className={css.moderatorRoomControl}>
          <div className={css.controlRow}>
            <div className={css.labelBoxLeft}>
              {firstRoom}
            </div>
            {switchBtn}
            <div className={css.labelBoxRight}>
              {secondRoom}
            </div>
          </div>
        </div>*/}
      </div>
    )
  }
}

ModeratorControlsNew.propTypes = {
  currentUserUpdate: PropTypes.func.isRequired,
  members: PropTypes.array.isRequired,
  noticeActions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired
}
