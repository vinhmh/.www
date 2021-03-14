import React from 'react'
import classNames from 'classnames'
import PropTypes, { object } from 'prop-types'
import css from './MicroHandRaised.scss'
import gcss from '../App/App.scss'
import * as Sender from '../../socket/sender'
import hasAdministrator from '../../HOCs/hasAdministrator'
import { toggleMuteApp } from '../../utilities/appMute'

class MicroHandRaised extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      userIsTalking: false,
    }
    this.handRaisedIconRef = React.createRef()
    this.microIconRef = React.createRef()
  }

  componentDidUpdate(prevProps, prevState) {
    this.handleMicroHalo()
    if (
      prevProps.user.isSpeak != this.props.user.isSpeak &&
      this.props.user.isSpeak &&
      this.props.user.raiseHandTime !== null
    ) {
      this.handDown(this.handRaisedIconRef)
    }
  }

  noClick = () => {
    const { user } = this.props
    return !user.connected || user.inLoungeRoom
  }

  getRaiseHandPos = () => {
    const { members, user } = this.props;
    const handRaisedMembers = this.props.members.filter(m => (!!m.user.raiseHandTime && m.roomId === user.cf1));
    handRaisedMembers.sort((a, b) => (
      a.user.raiseHandTime - b.user.raiseHandTime
    ))
    const index = handRaisedMembers.findIndex(m => m.user.id === this.props.user.id)
    return (index >= 0 ? index + 1 : null)
  }

  handDown(iconRef) {
    const { user } = this.props
    this.setState({ raiseHandPos: null });
    Sender.toggleRaiseHand({ userId: user.id, forceCancel: true })
  }

  raiseHand(iconRef) {
    const { user, members } = this.props
    Sender.toggleRaiseHand({ userId: user.id, forceCancel: false })
  }

  handleMicroHalo() {
    const { user, members } = this.props
    const userIsTalking = !!members.find((m) => m.talking && m.userId === user.id)
    if (userIsTalking !== this.state.userIsTalking) {
      this.setState({ userIsTalking });
    }
  }

  onToggleSpeak = () => {
    const { user, noticeActions } = this.props
    noticeActions.hide()
    Sender.toggleSpeakSelf(user.id)
  }

  render() {
    const { user, hasAdministrator, appMuted, appActions, members } = this.props
    let handRaisedBtnProps = {
      className: classNames(css.handRaisedBtn, gcss.noOutline, {
        [css.handRaisedNotAllowed]: user.isSpeak || user.startHandRaised == false && user.startStopHandRaised,
      }),
    }

    let microBtnProps = {
      className: classNames({
        [css.microBtnDisable]: !user.isAdministrator,
        [gcss.noOutline]: true,
        [css.microBtn]: !user.isModerator,
        [css.noBorderBtn]: user.isModerator,
        [gcss.blue]: user.isSpeak,
        [gcss.blob]: this.state.userIsTalking,
        [css.microActivated]: user.isSpeak,
      }),
    }
    const isLockMike = members.some(m => m.user.isAdministrator && m.user.isLockMike)
    return (
      <div className={css.mhrContainer}>      
      {this.props.hearBtnHandler}
        <button
          {...microBtnProps}
          type="button"
          onClick={() => {
            if (!user.isSpeak && appMuted) {
              toggleMuteApp()
              appActions.setMute(false)
            }
            this.onToggleSpeak()
          }}
          disabled={hasAdministrator && !user.isAdministrator && !user.isSpeak && !user.isTechAssistant && isLockMike}
          ref={this.microIconRef}
        >
          <img
            src={user.isSpeak ? 'assets/images/micro_blanc.svg' : 'assets/images/micro_off.svg'}
            alt="micro icon"
            style={{ height: '5vh', width: '5hv' }}
          />
        </button>
        {user.isModerator ? (
          ''
        ) : (
          this.props.user.raiseHandTime ?
          <button
            type="button"
            className={css.handRaisedBtn + " " + gcss.noOutline}
            onClick={() => this.handDown()}
            disabled={user.isSpeak || user.startHandRaised == false && user.startStopHandRaised}
          >
            <img
              src={"assets/images/main_on.svg"}
              alt="hand icon"
              width="35"
              height="35"
              data-hand="on"
              ref={this.handRaisedIconRef}
            />
            {this.state.raiseHandPos !== null && <p className={css.raiseHandPos}>{this.getRaiseHandPos()}</p>}
          </button>
          :
          <button
            className={css.handRaisedBtn + " " + gcss.noOutline}
            {...handRaisedBtnProps}
            type="button"
            onClick={() => this.raiseHand(this.handRaisedIconRef)}
            disabled={user.isSpeak || user.startHandRaised == false && user.startStopHandRaised}
          >
            <img
              src={'assets/images/main_off.svg'}
              alt="hand icon"
              width="35"
              height="35"
              data-hand="off"
              ref={this.handRaisedIconRef}
            />
          </button>
        )}
      </div>
    )
  }
}

MicroHandRaised.propTypes = {
  appActions: PropTypes.object.isRequired,
  appMuted: PropTypes.bool.isRequired,
  adjustments: PropTypes.object.isRequired,
  currentUserUpdate: PropTypes.func.isRequired,
  mediaSettings: object.isRequired,
  mediaSettingsActions: object.isRequired,
  members: PropTypes.array.isRequired,
  noticeActions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
}

export default hasAdministrator(MicroHandRaised)
