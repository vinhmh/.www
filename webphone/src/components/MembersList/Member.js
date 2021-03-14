import classNames from 'classnames'
import PropTypes from 'prop-types'
import css from './MembersList.scss'
import * as Sender from '../../socket/sender'

export default class Member extends React.Component {
  constructor(props) {
    super(props)
    this.itemRef = React.createRef()
    this.userIconsRef = React.createRef()
    this.memberNameFull = React.createRef()
  }

  state = {
    disabled: false,
    showShortName: false
  }

  componentDidMount() {
    if (this.memberNameFull.current.offsetWidth
      + this.userIconsRef.current.offsetWidth
      > this.itemRef.current.offsetWidth) {
      this.setState({ showShortName: true })
    }
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const { user, member } = nextProps
    const disabled = !user.connected || member.user.echoUuid
    if (prevState.disabled !== disabled) return { ...prevState, disabled }
    return null
  }

  toggleSpeak = () => {
    const { user, member, roomId } = this.props
    Sender.toggleSpeakMember(user.id, member.id, roomId)
  };

  toggleHear = () => {
    const { user, member, roomId } = this.props
    Sender.toggleHearMember(user.id, member.id, roomId)
  };

  displayIcons = () => {
    const { user, roomId, member } = this.props
    return (user.isModerator || user.isSwitcher || user.rooms.first === roomId || member.user.inLoungeRoom)
  };

  render() {
    const { member, user } = this.props
    const { disabled, showShortName } = this.state
    const { displayName, shortName } = member.user

    const micStyle = member.speak ? '' : '-slash'
    const active = !disabled || (user.isRegular && member.user.isModerator)
    const speakBtnProps = {
      className: classNames('fa', {
        [`fa-microphone${micStyle}`]: true,
        [css.grayedIcon]: !active
      }),
    }

    if (active) speakBtnProps.onClick = this.toggleSpeak

    let memberName
    if (member.user.isSwitcher) {
      memberName = 'Stage'
    } else {
      memberName = showShortName ? shortName : displayName
    }

    let roomLabel
    if (user.isRegular && member.user.isRegular && member.user.useFloor && member.roomId === member.user.rooms.floor) {
      roomLabel = user.titlesMap[member.user.hearRoomId].title // display the hear room name instead of floor
    } else if (member.user.inLoungeRoom) {
      roomLabel = 'Lounge'
    } else {
      roomLabel = user.titlesMap[member.roomId].title
    }

    return (
      <li className={css.itemHolder}>
        <div className={css.item} ref={this.itemRef}>
          <span className={css.memberName}>{memberName}</span>
          <div className={css.userIcons} ref={this.userIconsRef}>
            <span className={css.roomLabel}>{roomLabel}</span>
            <div className={css.micIcons}>
              {this.displayIcons() && <i {...speakBtnProps} />}
              {member.talking && <i className={css.talkingIcon} />}
            </div>
          </div>
        </div>
        <div className={css.memberNameFull}>
          <span ref={this.memberNameFull}>{displayName}</span>
        </div>
      </li>
    )
  }
}

Member.propTypes = {
  member: PropTypes.object.isRequired,
  pos: PropTypes.number.isRequired,
  roomId: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired
}
