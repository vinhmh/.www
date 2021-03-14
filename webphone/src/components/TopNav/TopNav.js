import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { array, object } from 'prop-types'
import classnames from 'classnames'
import * as AppActions from '../../reducers/app'
import * as CurrentUserActions from '../../reducers/currentUser'
import * as MediaSettingsActions from '../../reducers/mediaSettings'
import Socket from '../../socket'
import * as Sender from '../../socket/sender'
import Lounge from './Lounge'
import css from './TopNav.scss'

class TopNav extends React.Component {
  bbbTimer = null

  constructor(props) {
    super(props)
    this.state = {
      bbbWindow: props.bbbWindow,
      unreadMessage: false,
    }
  }


  componentDidMount() {
    window.onbeforeunload = this.disconnect
    window.addEventListener('message', this.onMessage)
  }

  componentDidUpdate(prevProps) {
    const { bbbWindow, user } = this.props
    if (prevProps.bbbWindow !== bbbWindow) {
      this.setState({ bbbWindow })
      this.bbbTimer = setInterval(() => {
        if (bbbWindow.closed) {
          clearInterval(this.bbbTimer)
          this.bbbTimer = null
          bbbWindow.close()
          Sender.bbbOff(user.id)
          this.setState({ bbbWindow: null })
        }
      }, 500)
    }
  }

  componentWillUnmount() {
    window.removeEventListener('message', this.onMessage)
  }

  joinBbb = () => {
    const { user } = this.props
    let { bbbWindow } = this.state
    const { joinUrl } = user.bbb
    if (!joinUrl) return null
    if (bbbWindow) {
      bbbWindow.focus()
    } else {
      bbbWindow = window.open(joinUrl, '_blank', 'width=1000,height=800,left=244,top=0')

      this.bbbTimer = setInterval(() => {
        if (bbbWindow.closed) {
          clearInterval(this.bbbTimer)
          this.bbbTimer = null
          bbbWindow.close()
          Sender.bbbOff(user.id)
          this.setState({ bbbWindow: null })
        }
      }, 500)
      Sender.bbbOn(user.id)
      this.setState({ bbbWindow })
    }
    return false
  }

  joinCustom(url) {
    window.open(url, "_blank");
  }

  join = () => {
    const { user } = this.props;
    const { joinUrl } = user.bbb;
    const { platformUrl } = user;

    if (platformUrl) {
      this.joinCustom(platformUrl);
    } else if (joinUrl) {
      this.joinBbb();
    }
  };

  disconnect = () => {
    Socket.close()
    const { bbbWindow } = this.state
    if (bbbWindow && !window.RECONNECT_USER) bbbWindow.close()
  }

  onMessage = (e) => {
    const { app } = this.props
    const message = e.data

    switch (message) {
      case 'BBB_CLOSED':
        return this.setState({ bbbWindow: null })
      case 'CHAT:NEW_MESSAGE':
        if (app.displayTextchat) return
        return this.setState({ unreadMessage: true })
      default:
    }
  }

  showMediaSettings = () => {
    const { mediaSettingsActions } = this.props
    mediaSettingsActions.show()
  }

  hideMediaSettings = () => {
    const { mediaSettingsActions } = this.props
    mediaSettingsActions.hide()
  }

  showTextChat = () => {
    const { appActions } = this.props
    this.setState({ unreadMessage: false })
    appActions.displayTextChat()
  }

  renderJoinBtn() {
    const { user } = this.props
    const { joinUrl } = user.bbb
    const { platformUrl } = user
    const { bbbWindow } = this.state
    if (!joinUrl && !platformUrl) return null
    const props = {
      className: classnames(css.joinBtn, {
        [css.active]: !!bbbWindow
      }),
      onClick: this.join
    }

    return (
      <button {...props}>
        <i className="fa fa-television" />
      </button>)
  }

  renderTextChatBtn = () => {
    const { adjustments, user } = this.props
    const { unreadMessage } = this.state
    if (user.isRegular && adjustments.demoMode) return null

    return (
      <span className={classnames(css.textChat, { [css.unread]: unreadMessage })} onClick={this.showTextChat}>
        <i className="fa fa-comments" aria-hidden="true" />
      </span>)
  }

  renderSwitcherNav = () => {
    const { user } = this.props

    return (
      <div className={css.switcherHolder}>
        <i className={`${css.mediaSettings} fa fa-cog`} onClick={this.showMediaSettings} />
        <div className={css.userBox}>
          <div className={css.userName}>{user.username}</div>
          <div className={css.userMeetingID}>{user.meetingID}</div>
        </div>
      </div>
    )
  }

  render() {
    const { user, members, currentUserActions } = this.props
    const joinBtn = this.renderJoinBtn()
    const textChatBtn = this.renderTextChatBtn()

    if (user.isSwitcher) return this.renderSwitcherNav()

    return (
      <div className={css.topNavHolder}>
        <div className={css.bar}>
          {(!helpers.isMobileDevice() || helpers.isTabletDevice()) && joinBtn}
          {
            user.isModerator
            && <Lounge user={user} members={members} currentUserActions={currentUserActions} />
          }
        </div>
        <div className={css.pic}>
          <i className={`${css.mediaSettings} fa fa-cog`} onClick={this.showMediaSettings} />
          {textChatBtn}
        </div>
      </div>
    )
  }
}

TopNav.propTypes = {
  adjustments: object.isRequired,
  currentUserActions: object.isRequired,
  mediaSettingsActions: object.isRequired,
  members: array.isRequired,
  user: object.isRequired
}

const mapStateToProps = state => ({
  app: state.app,
  adjustments: state.adjustments,
  members: state.members,
  user: state.currentUser,
})

const mapDispatchToProps = dispatch => ({
  appActions: bindActionCreators(AppActions, dispatch),
  currentUserActions: bindActionCreators(CurrentUserActions, dispatch),
  mediaSettingsActions: bindActionCreators(MediaSettingsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(TopNav)
