import PropTypes, { object } from 'prop-types'
import classnames from 'classnames'
import * as Sender from '../../socket/sender'
import RegularControls from './RegularControls'
import ModeratorControlsNew from './ModeratorControlsNew'
import ModeratorControls from './ModeratorControls'
import css from './UserControls.scss'

const UP = 38
const DOWN = 40
const SPACE = 32

export default class UserControls extends React.Component {
  state = {
    peekedOn: true,
  }

  componentDidMount() {
    document.addEventListener('keyup', this.keypress)
  }

  componentWillUnmount() {
    document.removeEventListener('keyup', this.keypress)
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (nextProps.user.hearBoth === prevState.peekedOn) return null
    return { peekedOn: nextProps.user.hearBoth }
  }

  keypress = (e) => {
    if (e.keyCode === UP) {
      const { user } = this.props
      const { floor } = user.rooms
      if (!user.isModerator || !(user.useFloor || user.useSwitcher)) return
      const member = user.members.find(m => m.roomId === floor)
      if (!member) return
      if (member.hear) { return }
      Sender.toggleHearMember(user.id, member.id, member.roomId)
    }

    if (e.keyCode === DOWN) {
      const disabled = this.noClick()
      const { user } = this.props
      const { floor } = user.rooms
      const hear = !!user.members.find(m => m.hear && m.roomId !== floor)
      if (disabled) return
      if (hear) { return }
      this.onToggleHear()
    }

    if (e.keyCode === SPACE) {
      e.preventDefault()
      e.stopPropagation()
      this.onToggleSpeak()
    }
  }

  noClick = () => {
    const { user } = this.props
    return !user.connected
  }

  hearBtn = () => {
    const { user } = this.props
    const { floor } = user.rooms
    const hear = !!user.members.find(m => m.hear && (m.roomId !== floor || !user.isModerator))
    let title = user.hearRoomId ? user.titlesMap[user.hearRoomId].code : null
    if (user.inOratorRoom) {
      title = user.titlesMap[user.rooms.orator].code
    }
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

  speakBtn = () => {
    const { adjustments, user } = this.props
    if (user.isRegular && adjustments.demoMode) return

    const allHearMuted = !user.members.filter(m => m.hear).length
    const speak = !!user.members.find(m => m.speak)

    const disabled = this.noClick() || ((user.useFloor || user.useSwitcher) && user.isModerator && allHearMuted)
    const speakBtnProps = {
      className: classnames(css.btn, {
        [css.modBtn]: speak,
        [css.btnPassive]: disabled
      }),
      onClick: () => {
        if (disabled) return

        this.onToggleSpeak()
      }
    }
    return (
      <button {...speakBtnProps}>
        <i className="fa fa-microphone" />
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
    if (!user.isModerator || !(user.useFloor || user.useSwitcher)) return

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
    const { adjustments, user, members, noticeActions, currentUserUpdate, mediaSettings, mediaSettingsActions } = this.props
    const params = new URLSearchParams(window.location.search)
    if (user.isModerator && params.get('new_controls')) {
      return (
        <ModeratorControlsNew
          adjustments={adjustments}
          user={user}
          members={members}
          currentUserUpdate={currentUserUpdate}
          noticeActions={noticeActions}
        />
      )
    }
    return (
      <div className={classnames(css.controlsHolder, { [css.disconnected]: !user.connected })}>
        {this.speakBtn()}
        {this.hearBtn()}
        {this.floorBtn()}
        {this.peekBtn()}
        {user.isRegular
        && (
          <RegularControls
            user={user}
            currentUserUpdate={currentUserUpdate}
          />
        )}
        {/* {user.isModerator
        && (
          <ModeratorControls
            user={user}
            members={members}
            mediaSettings={mediaSettings}
            mediaSettingsActions={mediaSettingsActions}
            currentUserUpdate={currentUserUpdate}
            noticeActions={noticeActions}
          />
        )} */}
      </div>
    )
  }
}

UserControls.propTypes = {
  adjustments: PropTypes.object.isRequired,
  currentUserUpdate: PropTypes.func.isRequired,
  mediaSettings: object.isRequired,
  mediaSettingsActions: object.isRequired,
  members: PropTypes.array.isRequired,
  noticeActions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
}
