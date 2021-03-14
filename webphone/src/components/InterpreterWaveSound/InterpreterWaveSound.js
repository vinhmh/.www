import PropTypes, { array, object } from "prop-types";
import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import React from "react";
import * as CurrentUserActions from "../../reducers/currentUser";
import * as MediaSettingsActions from "../../reducers/mediaSettings";
import AudioIbpAnalyser from "../WaveSoundVisualizer/AudioIbpAnalyser";
import css from "./InterpreterWaveSound.scss";
import gcss from "../App/App.scss";
import translator from "../../utilities/translator";

class InterpreterWaveSound extends React.Component {
  constructor(props) {
    super(props);

    this.inputMeterRef = React.createRef();
    this.inputMeter = null;
  }


  startAudioMeter() {
    // do not show for mobile safari
    // if (helpers.isMobileDevice() && helpers.BrowserType.safari) return null;
    const { audioInputId, actions } = this.props;
    this.inputMeter = new AudioIbpAnalyser(
      audioInputId,
      this.inputMeterRef.current,
      actions.permit,
      true
    );
  }

  stopAudioMeter() {
    if (!this.inputMeter) return;
    this.inputMeter.stop();
  }

  resetAudioMeter() {
    this.stopAudioMeter();
    this.startAudioMeter();
  }

  renderInputMeter = () => {
    // if (helpers.isMobileDevice() && helpers.BrowserType.safari) return null;

    return (
      <>
        <div className={gcss.loaderContainer}>
          <div className={gcss.loader}/>
          <div className={gcss.loader}/>
          <div className={gcss.loader}/>
        </div>
        <p className={css.txtInterpret}>Ongoing interpretation</p>
      </>
    );
  };

  render() {
    const { user, members } = this.props;

    const filter = (m) => (
      m.user.isModerator &&
      m.talking &&
      (m.roomId === user.rooms.first || m.roomId === user.rooms.second || m.user.hearRoomId === user.rooms.first) &&
      (m.user.rooms.first === user.rooms.first || m.user.rooms.second === user.rooms.first) &&
      (m.user.speakRoomId === user.rooms.first || m.user.speakRoomId === user.rooms.second || m.user.hearRoomId === user.rooms.first)
    );

    const anyInterpreter = !!members.filter(filter).length;

    return (
      <div className={css.interpreterWaveSoundContainer}>
        {anyInterpreter ? (
          this.renderInputMeter()
        ) : (
          <div className={css.waitInterpretContainer}>
            <img
              className={css.interpretIcon}
              src={"assets/images/waiting_interpreter.svg"}
              alt="hand icon"
              width="50"
              height="20"
            />
            <p className={css.txtInterpret}>{translator('intepreter_pending', user.language)}</p>
          </div>
        )}
      </div>
    );
  }
}

InterpreterWaveSound.propTypes = {
  actions: object.isRequired,
  adjustments: object.isRequired,
  // mediaSettings: object.isRequired,
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
  actions: bindActionCreators(MediaSettingsActions, dispatch),
});

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(InterpreterWaveSound);
