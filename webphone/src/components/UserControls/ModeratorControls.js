import PropTypes, { object } from "prop-types";
import classnames from "classnames";
import { RELAY_ACTIONS } from "../Notice";
// import Notice from "../Notice";
import * as Sender from "../../socket/sender";
import css from "./ModeratorControls.scss";
import {
  WORKING,
  OFFLINE,
  REJECTED,
  SOS_HANDOVER,
  ALL_REJECTED,
  ASK_HANDOVER,
  WAITING_CONFIRM,
  ACCEPTED,
  OPEN_YOUR_MICS,
  BACK_WAITING_CONFIRM
} from '../../utilities/noticeTypes';
// const LEFT = 37
// const RIGHT = 39

export default class ModeratorControls extends React.Component {
  state = {
    relayClicked: "",
  };

  componentDidUpdate(prevProps, prevState) {
    const {user} = this.props
    const haveMemberWorking = this.props.moderators.members.findIndex(m => m.status == ASK_HANDOVER) > -1
    if (prevProps.moderators.members.length != this.props.moderators.members.length && !haveMemberWorking) {
      this.props.moderatorsActions.resetReconnect()
    }
  }
  componentDidMount(){
    const memberStatus = this.props.members.filter( m => m.moderatorStatus === 'OFFLINE')
    if(memberStatus && this.props.moderators.mySession.isAskHandover) {
      this.props.notice.message === null
    }
  }

  switchIcon = () => {
    const {user, moderators, notice } = this.props
    const {
      isWorking,
      isAskHandover,
      isSOSHandover,
      isRejected,
      isAccepted,
      isWaitingConfirm,
      isOpenYourMics,
    } = moderators.mySession
    const { relayClicked } = this.state;
    const finalMessage = notice.message || relayClicked;
    const notActive = !isWorking || (isWorking && isSOSHandover) || (isWorking && !isAskHandover)
    const switchActive = finalMessage === RELAY_ACTIONS.TAKE_OVER_MSG;
    const props = {
      className: classnames(css.switchIcon, {
        [css.switchIconActive]: !notActive,
        [css.circle]: !notActive
      }),
    };

    return (
      <svg
        {...props}
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        width="35"
        height="35"
        viewBox="0 0 145.3 133.3"
        // style="enable-background:new 0 0 145.3 133.3;"
      >
        <g>
          <circle cx="34.9" cy="81.8" r="15.6" />
          <path
            d="M57.2,116.4c1.8-5.2-11.7-12.6-17-13.8c-2.6-0.6-7.9-0.6-10.5,0c-5.3,1.2-18.8,8.6-17,13.8
		C16.4,126.8,53.5,126.8,57.2,116.4z"
          />
        </g>
        <g>
          <circle cx="109.3" cy="24.7" r="15.6" />
          <path
            d="M131.5,59.3c1.8-5.2-11.7-12.6-17-13.8c-2.6-0.6-7.9-0.6-10.5,0c-5.3,1.2-18.8,8.6-17,13.8
		C90.8,69.8,127.8,69.8,131.5,59.3z"
          />
        </g>
        <path
          d="M88.5,36.3c1.5-0.7,1.8-2.6,0.7-3.8L72.9,14.3c-1.3-1.5-3.7-0.8-4.1,1.1l-1.1,5.7c-16.2-1.8-31.4,9.1-34.5,25.5
	c-0.8,4.2-0.7,8.2,0,12.1c0.5,2.6,4.2,2.6,4.7-0.1l0-0.1C40.5,46,52,37.5,64.4,38.6l-1.1,5.9C63,46.5,65,48,66.8,47.1L88.5,36.3z"
        />
        <path
          d="M60,103.2c-1.4,0.9-1.5,2.7-0.3,3.8l18.1,16.4c1.4,1.4,3.8,0.4,4-1.5l0.5-5.8c16.3,0.2,30.3-12.2,31.7-28.8
	c0.4-4.2-0.1-8.2-1.3-12.1c-0.8-2.5-4.4-2.1-4.7,0.5l0,0.1c-1.1,12.8-11.7,22.4-24.2,22.5l0.5-6c0.2-2-2-3.3-3.7-2.2L60,103.2z"
        />
      </svg>
    );
  };

  exclIcon() {
    const {user, moderators, notice } = this.props
    const {
      isWorking,
      isSOSHandover,
      isAskHandover
    } = moderators.mySession
    const { relayClicked } = this.state;
    const finalMessage = notice.message || relayClicked;
    const exclActive = finalMessage === RELAY_ACTIONS.HELP_MSG;
    const notActive = !isWorking || (isWorking && isAskHandover) || (isWorking && !isSOSHandover)
    const props = {
      className: classnames(css.exclIcon, {
        [css.exclIconActive]: !notActive,
        [css.circle]: !notActive
      }),
    };
    return (
      <svg
        {...props}
        width="35"
        height="35"
        version="1.1"
        xmlns="http://www.w3.org/2000/svg"
        x="0px"
        y="0px"
        viewBox="0 0 50.4 133.3"
      >
        <g>
          <path
            d="M25.3,90.7c5.7,0,10.7,4.4,10.7,10.1s-4.8,10.4-10.7,10.4c-5.6,0-10.7-4.4-10.7-10.1S19.5,90.7,25.3,90.7z M33.4,80.8h-16
		V15.9h16V80.8z"
          />
        </g>
      </svg>
    );
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
    const { user } = this.props;
    return user.members.find((m) => m.roomId === roomId);
  }

  onPickHearRoom = (roomId) => {
    const { user } = this.props;
    if (this.noClick()) return;
    //Sender.pickHearRooms(user.id, roomId);
  };

  relayBtn = (img, msg, id) => {
    const {user, moderators} = this.props
    const {
      isWorking,
      isAskHandover,
      isSOSHandover
    } = moderators.mySession
    // const disabled = () => {
    //   const { relayClicked } = this.state;
    //   // return this.noClick();
      //  return this.noClick()
    //    //return (isWorking && isAskHandover) || (isWorking && isSOSHandover) || this.noClick() || this.oneInBoothTeam();
    // };
    const clicked = this.state.relayClicked === msg;

    const props = {
      //  disabled: disabled(),
      className: classnames(css.relayBtn, {
        // [css.btnPassive]: disabled(),
      }),
      onClick: () => {
        //  if (disabled()) return;
        this.onRelayClick(msg);
      },
    };

    return (
      <button {...props}>
        {/* <i className={klass} aria-hidden="true" /> */}
        {/* <img src={img} id={id} alt="lounge" width="25" height="25" /> */}
        {id === "switch" ? this.switchIcon() : this.exclIcon()}
      </button>
    );
  };

  oneInBoothTeam = () => {
    const { user, members } = this.props;
    const { first, second } = user.rooms;

    return !members.filter(
      (m) =>
        m.user.isModerator &&
        // English/French equals French/English
        [m.user.rooms.first, m.user.rooms.second].sort().join() ===
          [first, second].sort().join() &&
        m.user.id !== user.id
    ).length;
  };

  onRelayClick = (msg) => {
    const { user, noticeActions, moderatorsActions } = this.props;

    noticeActions.hide();
    this.setState({ relayClicked: msg });
    // setTimeout(() => {
    //   this.setState({ relayClicked: null });
    // }, 1000);
    const finalMsg = msg == RELAY_ACTIONS.HELP_MSG ? SOS_HANDOVER : ASK_HANDOVER
    Sender.relayUser(user.id, finalMsg);
    moderatorsActions.update({ data: { userId: user.id, msg: finalMsg }, currentUser: user })
  };

  noClick = () => {
    const { user } = this.props;
    return !user.connected || user.inLoungeRoom || !user.isSpeak;
  };

  // setVolumeLine1 = e => {
  //   const { mediaSettingsActions } = this.props
  //   mediaSettingsActions.setOutputVolumeLine1(e.target.value / 10)
  // }

  // setVolumeLine2 = e => {
  //   const { mediaSettingsActions } = this.props
  //   mediaSettingsActions.setOutputVolumeLine2(e.target.value / 10)
  // }

  renderStatus = (type = null) => {
    const {user, moderators } = this.props
    const {
      isWorking,
      isAskHandover,
      isSOSHandover,
      isRejected,
      isAccepted,
      isWaitingConfirm,
      isOpenYourMics
    } = moderators.mySession
    //at least one member accept => ACCEPTED
    const hasAccepted = moderators.members.findIndex(m => m.status == ACCEPTED) > -1
    //all members rejected => REJECTED
    const hasRejected = moderators.members.length > 1 && moderators.members.filter(m => m.status != ASK_HANDOVER).findIndex(m => m.status != REJECTED) == -1
    const hasRejectedSOS = moderators.members.length > 1 && moderators.members.filter(m => m.status != SOS_HANDOVER).findIndex(m => m.status != REJECTED) == -1
    const askOrSOS = moderators.members.findIndex(m => m.status == ASK_HANDOVER) > -1
    const SOSOrAsk = moderators.members.findIndex(m => m.status == SOS_HANDOVER) > -1
    if (user.inLoungeRoom && !user.isSpeak || isWorking && !user.isSpeak) return type == 'status' ? 'OFFLINE' : '1'
    if (isAskHandover && !hasAccepted && !hasRejected) return type == 'status' ? 'ASKING FOR HANDOVER' : '2'
    if (isSOSHandover && !hasAccepted && !hasRejectedSOS) return type == 'status' ? 'HANDOVER HELP NOW' : '2'
    if ((isAskHandover || isSOSHandover) && hasAccepted) return type == 'status' ? 'READY' : '3'
    if ((isAskHandover && hasRejected) || (isSOSHandover && hasRejectedSOS)) return type == 'status' ? 'NOT READY' : '2'
    if (isWaitingConfirm && askOrSOS) return type == 'status' ? 'READY FOR \nHANDOVER?' : '2'
    if (isWaitingConfirm && SOSOrAsk) return type == 'status' ? 'HANDOVER HELP NOW!' : '2'
    if (isAccepted && !isOpenYourMics) return type == 'status' ?'PLEASE OPEN YOUR MIC' : '3'
    if (isAccepted && isOpenYourMics) return type == 'status' ? 'PLEASE OPEN YOUR MIC' : '2'
    if (isRejected) return type == 'status' ? 'I\'M NOT READY' : '2'
    if (moderators.mySession.isWorking && !moderators.mySession.isAsHandover && !moderators.mySession.isSOSHandover) return type == 'status' ? 'ON AIR' : '2'
    return type == 'status' ? 'OFFLINE' : '1'
  }

  renderActionLeft = () => {
    const {user, moderators } = this.props
    const {
      isWorking,
      isAskHandover,
      isSOSHandover,
      isRejected,
      isAccepted,
      isWaitingConfirm,
      isOpenYourMics
    } = moderators.mySession

    if (isWaitingConfirm || isAccepted || isRejected) {
      if (isOpenYourMics) {
        return <div/>
      }
      return (
        <div className={css.hover} onClick= {() => {
          if (isWaitingConfirm || isRejected){
           return this.onAccept()
          }
          this.onOpenYourMics()
        }}>
          <img
            src={"assets/images/like.svg"}
            alt="like icon"
            width="35"
            height="35"
          />
        </div>
      )
    }
    // if (isRejected) {
    //   return (
    //     <div onClick={this.onBackWaitingConfirm}>
    //         <img
    //         src={"assets/images/reply.svg"}
    //         alt="reply icon"
    //         width="35"
    //         height="35"
    //       />
    //     </div>
    //   )
    // }
    return this.relayBtn("assets/images/switch.svg", RELAY_ACTIONS.TAKE_OVER_MSG, "switch")
  }

  onAccept = () => {
    const { user, moderatorsActions } = this.props;
    Sender.relayUser(user.id, ACCEPTED);
    moderatorsActions.update({ data: { userId: user.id, msg: ACCEPTED }, currentUser: user })
  }

  onOpenYourMics = () => {
    const { user, moderatorsActions } = this.props;
    moderatorsActions.update({ data: { userId: user.id, msg: OPEN_YOUR_MICS }, currentUser: user })
  }

  onBackWaitingConfirm = () => {
    const { user, moderatorsActions } = this.props;
    Sender.relayUser(user.id, BACK_WAITING_CONFIRM);
    moderatorsActions.update({ data: { userId: user.id, msg: BACK_WAITING_CONFIRM }, currentUser: user })
  }

  renderActionRight = () => {
    const {user, moderators } = this.props
    const {
      isWorking,
      isAskHandover,
      isSOSHandover,
      isRejected,
      isAccepted,
      isWaitingConfirm
    } = moderators.mySession

    if (isWaitingConfirm) {
      return (
        <div className={css.hover} onClick={this.onReject}>
           <img
            src={"assets/images/dislike.svg"}
            alt="like icon"
            width="35"
            height="35"
          />
        </div>
      )
    }
    if (isRejected) {
    return (
    <div>
      <img
        src={"assets/images/dislike.svg"}
        alt="like icon"
        width="35"
        height="35"
      />
      </div>
     )
    }
    if (isAccepted) {
      return (
        <div/>
      )
    }
    return this.relayBtn("assets/images/pointsexcl.svg", RELAY_ACTIONS.HELP_MSG, "exclIcon")
  }

  onReject = () => {
    const { user, moderatorsActions } = this.props;
    Sender.relayUser(user.id, REJECTED);
    moderatorsActions.update({ data: { userId: user.id, msg: REJECTED }, currentUser: user })
  }

  render() {
    const { relayClicked } = this.state;
    const { user, notice, noticeActions, moderators } = this.props;
    const { message } = notice;
    const finalMessage = message || relayClicked;
    const {
      isWorking,
      isAskHandover,
      isSOSHandover,
      isRejected,
      isAccepted,
      isWaitingConfirm,
      isOpenYourMics
    } = moderators.mySession
    const hasAccepted = moderators.members.findIndex(m => m.status == ACCEPTED) > -1
    const askOrSOS = moderators.members.findIndex(m => m.status == ASK_HANDOVER) > -1
    const hasRejected = moderators.members.length > 1 && moderators.members.filter(m => m.status != ASK_HANDOVER).findIndex(m => m.status != REJECTED) == -1
    const hasRejectedSOS = moderators.members.length > 1 && moderators.members.filter(m => m.status != SOS_HANDOVER).findIndex(m => m.status != REJECTED) == -1
    const SOSOrAsk = moderators.members.findIndex(m => m.status == SOS_HANDOVER) > -1
    let relayMsgCss = css.relayMsg;

    if (
      relayClicked === RELAY_ACTIONS.HELP_MSG ||
      relayClicked === RELAY_ACTIONS.TAKE_OVER_MSG ||
      message === RELAY_ACTIONS.HELP_MSG ||
      message === RELAY_ACTIONS.TAKE_OVER_MSG
    )
      relayMsgCss = css.relayMsg + " " + css.relayMsgActive;

    return (
      <div className={css.moderatorRoomControl}>
        <div className={classnames(css.controlRow ,{
          [`${css.active} ${css.fadein} ${css.fadeout_red}`]:(isWaitingConfirm && askOrSOS) || ((isAskHandover && hasRejected) || (isSOSHandover && hasRejectedSOS)) || (isWaitingConfirm && SOSOrAsk),
          [`${css.activeReady} ${css.fadein} ${css.fadeout_green}`]: ((isAskHandover || isSOSHandover) && hasAccepted)
        })}>
          {this.renderActionLeft()}
          <p
            className={
              classnames({
                [css.wraptext]:true,
                [css.offlineOnline]: true,
                [css.offlineOnlineActive]: this.renderStatus() == '2',
                [css.offlineOnlineActive2]: this.renderStatus() == '3'
              })
              // user.isSpeak && !user.inLoungeRoom
              //   ? css.offlineOnline + " " + css.offlineOnlineActive
              //   : css.offlineOnline
            }
          >
            {/* {user.isSpeak && !user.inLoungeRoom ? "ON AIR" : "OFFLINE"} */}
            {this.renderStatus('status')}
          </p>
          {this.renderActionRight()}
        </div>
        {/* <div className={css.messagesContainer}>
          <p className={relayMsgCss}>{finalMessage ? finalMessage : null}</p>
        </div> */}
      </div>
    );
  }
}

ModeratorControls.propTypes = {
  currentUserUpdate: PropTypes.func.isRequired,
  mediaSettings: object.isRequired,
  mediaSettingsActions: object.isRequired,
  members: PropTypes.array.isRequired,
  noticeActions: PropTypes.object.isRequired,
  notice: PropTypes.object.isRequired,
  showRelay: PropTypes.bool.isRequired,
  user: PropTypes.object.isRequired,
};
