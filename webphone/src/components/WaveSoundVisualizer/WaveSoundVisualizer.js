import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { array, object, bool } from "prop-types";
import React from "react";
import css from "./WaveSoundVisualizer.scss";
import * as CurrentUserActions from "../../reducers/currentUser";
import * as MediaSettingsActions from "../../reducers/mediaSettings";
import AudioMeter from "../MediaSettings/AudioMeter";
import AudioIbpAnalyser from "./AudioIbpAnalyser";
import * as Sender from '../../socket/sender'
class WaveSoundVisualizer extends React.Component {
  constructor(props) {
    super(props);

    this.inputMeterRef = React.createRef();
    this.inputMeter = null;
    this.state = {
      SlowSpeak: true,
      showSlowSpeak: true
    }
  }

  componentDidMount() {
    const { members, brokenWave } = this.props;
    // const isTalking = !!members.find((m) => m.talking);
    // let firstLine = document.getElementById("audio-firstLine");
    if (!brokenWave) this.startAudioMeter();

  }

  componentDidUpdate(prevProps) {
    const { audioInputId, user, members, brokenWave } = this.props;
    const isTalking = !!members.find((m) => m.talking);
    const isTalkingBefore = !!prevProps.members.find((m) => m.talking);
    if (!brokenWave) {
      if (!isTalking) this.stopAudioMeter();
      else if (
        audioInputId !== prevProps.audioInputId ||
        (!isTalkingBefore && isTalking)
      )
        this.resetAudioMeter();
    }
  }

  componentWillUnmount() {
    const { brokenWave } = this.props;
    if (!brokenWave) this.stopAudioMeter();
    //this.stopEchoTest()
  }

  startAudioMeter() {
    // do not show for mobile safari
    // if (helpers.isMobileDevice() && helpers.BrowserType.safari) return null;
    const { mediaSettings, actions, user, members } = this.props;
    const someoneIsTalking = !!members.find(
      (m) => m.talking && m.userId !== user.id
    );
    const userIsTalking = !!members.find(
      (m) => m.talking && m.userId === user.id
    );

    if (userIsTalking) {
      this.inputMeter = new AudioIbpAnalyser(
        mediaSettings.audioInputId,
        this.inputMeterRef.current,
        actions.permit,
        false
      );
    } else if (someoneIsTalking) {
      let outPutStream = document.getElementById("audio-firstLine").srcObject;

      this.inputMeter = new AudioIbpAnalyser(
        null,
        this.inputMeterRef.current,
        actions.permit,
        false,
        outPutStream
      );
    }
    console.log("start Audio meter inputMeter after : " + this.inputMeter);
  }

  stopAudioMeter() {
    if (!this.inputMeter) return;
    this.inputMeter.stop();
    this.inputMeter = null;
  }

  resetAudioMeter() {
    const { user, members } = this.props;
    const isTalking = !!members.find((m) => m.talking);

    console.log("resetAudioMeter speak : " + user.isSpeak);
    if (isTalking) {
      this.stopAudioMeter();
      this.startAudioMeter();
    }
  }

  renderInputMeter = () => {
    const { members, brokenWave } = this.props;
    const isTalking = !!members.find(
      (m) => m.talking && !m.user.isModerator
    );

    // if (helpers.isMobileDevice() && helpers.BrowserType.safari) return null;
    if (brokenWave && isTalking)
      return (
        <img
          src="assets/images/02-blue.gif"
          alt="blue"
          width="30"
          height="100"
          className={css.inputMeter}
        />
      );
    if (!brokenWave)
      return <canvas className={css.inputMeter} ref={this.inputMeterRef} />;
    return null;
  };
  handleUpdateAttributesSlowSpeak(startMeeting, slowSpeak) {
    const { user, members } = this.props;
    members.map(m => {
      if (m.user.meetingID == user.meetingID) {
        const msg = { id: m.id, startMeeting, slowSpeak }
        Sender.slowSpeak(msg)
      }
    })
  }
  handleSlowSpeak = (e) => {
    let startMeeting = this.props.user.startMeeting;
    let slowSpeak = null;
    if (e == 'start') {
      slowSpeak = true
    }
    this.handleUpdateAttributesSlowSpeak(startMeeting, slowSpeak)
    this.setState({
      SlowSpeak: !this.state.SlowSpeak
    })
    setTimeout(() => {
      slowSpeak = null
      this.handleUpdateAttributesSlowSpeak(startMeeting, slowSpeak)
    }, 7000);
  }
  toggleShowSlowSpeak = () => {
    setTimeout(() => {
      // this.props.currentUserActions.showSlowSpeak()
      this.setState({
        showSlowSpeak: false
      })
    }, 7000);

  }
  setTimeNotiSlowSpeak = () => {
    { this.toggleShowSlowSpeak() }
    return (
      <div>
        <div className={css.wsvContainer}>
          <div className={css.slowSpeak}>
            <img src={"assets/images/slow down red.svg"} width="35" height="35" className={css.mr2}/>
            <p className={css.text}>Please slow down</p>
          </div>
        </div>
      </div>)
  }
  render() {
    const { message } = this.props.notice;
    const { isModerator, isRegular, isTechAssistant, slowSpeak } = this.props.user;
    const { SlowSpeak, showSlowSpeak } = this.state;
    return (
      <div>
        {
          this.props.user.slowSpeak
            && isRegular
            && !isTechAssistant
            && !isModerator
            && showSlowSpeak
            ? this.setTimeNotiSlowSpeak() : null
        }
        {isModerator && (<div className={css.wsvContainer}>
          <div className={css.slowSpeak} onClick={() => this.handleSlowSpeak('start')}>
            {/* <img src={SlowSpeak && this.props.user.slowSpeak == null ? "assets/images/slow down grey.svg" : "assets/images/slow down red.svg"} width="35" height="35" className={css.iconSlowSpeak} /> */}
            {/* {this.props.user.slowSpeak == true && !SlowSpeak && <p className={css.text}>Please slow down</p>} */}
          </div>
          {/* <p className={css.txtNotif}>{message == "ASK_HANDOVER" && null}</p> */}
        </div>)}
        <div className={css.wsvContainer}>
          {this.renderInputMeter()}
        </div>
      </div>
    );
  }
}

WaveSoundVisualizer.propTypes = {
  actions: object.isRequired,
  adjustments: object.isRequired,
  brokenWave: bool,
  currentUserActions: object.isRequired,
  mediaSettings: object.isRequired,
  notice: object.isRequired,
  members: array.isRequired,
  user: object.isRequired,
};

const mapStateToProps = (state) => ({
  adjustments: state.adjustments,
  mediaSettings: state.mediaSettings,
  members: state.members,
  user: state.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
  currentUserActions: bindActionCreators(CurrentUserActions, dispatch),
  actions: bindActionCreators(MediaSettingsActions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(WaveSoundVisualizer);
