import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { bool, object, array, number } from 'prop-types'
import classnames from 'classnames'
import Slider from 'react-rangeslider'
import * as Sender from '../../socket/sender'
import * as MediaSettingsActions from '../../reducers/mediaSettings'
import AudioMeter from './AudioMeter'
import css from './MediaSettings.scss'

let inputLevelTimer = null

class AudioInput extends React.Component {
  constructor(props) {
    super(props)
    this.audioInputRef = React.createRef()
    this.inputMeterRef = React.createRef()
    this.inputMeter = null
  }

  state = {
    helpActive: false,
    membersSnap: [],
    lockActive: false,
  }

  componentDidMount() {
    this.startAudioMeter()
  }

  componentDidUpdate(prevProps) {
    if (this.props.audioInputId !== prevProps.audioInputId) this.resetAudioMeter()
  }

  componentWillUnmount() {
    this.stopAudioMeter()
    this.stopEchoTest()
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    const state = {}
    if (!nextProps.showHelp) {
      if (prevState.helpActive) state.helpActive = false
      if (prevState.lockActive) state.lockActive = false
    }
    if (Object.keys(state).length) return { ...prevState, ...state }
    return null
  }

  startAudioMeter() {
    // do not show for mobile safari
    if (helpers.isMobileDevice() && helpers.BrowserType.safari) return
    const { audioInputId, actions } = this.props
    this.inputMeter = new AudioMeter(audioInputId, this.inputMeterRef.current, actions.permit)
  }

  stopAudioMeter() {
    if (!this.inputMeter) return
    this.inputMeter.stop()
  }

  resetAudioMeter() {
    this.stopAudioMeter()
    this.startAudioMeter()
  }

  startEchoTest() {
    const { actions, user } = this.props

    this.setState({ membersSnap: user.members })
    user.members.forEach((m) => {
      if (m.hear) Sender.muteHear(m.id, m.roomId)
      if (m.speak) Sender.muteSpeak(m.id, m.roomId)
    })
    actions.echoTest()
  }

  stopEchoTest() {
    const { actions, user } = this.props
    const { membersSnap } = this.state
    if (!user.echoUuid) return

    membersSnap.forEach((m) => {
      if (m.hear) Sender.unmuteHear(m.id, m.roomId)
      if (m.speak) Sender.unmuteSpeak(m.id, m.roomId)
    })
    actions.echoTest(false)
  }

  onEchoClick = () => {
    const { echoTest } = this.props
    if (echoTest) {
      this.stopEchoTest()
    } else {
      this.startEchoTest()
    }
  }

  echoBtn = () => {
    const { echoTest, permitted, user, sip } = this.props
    const btnProps = {}

    if (!permitted) return null

    let disabled = false
    if (!user.connected && sip.onConnection) disabled = true

    let classname = 'fa-play-circle'
    if (user.echoUuid) {
      classname = 'fa-stop-circle'
    } else if (echoTest) {
      classname = `fa-refresh fa-spin ${css.cursorDefault}`
    }

    btnProps.className = classnames(
      `fa ${classname}`,
      { [css.disabled]: disabled }
    )

    if (!disabled) btnProps.onClick = this.onEchoClick
    return <i {...btnProps} />
  }

  helpIcon = () => {
    const { actions, permitted, showHelp, showGuide } = this.props
    const { helpActive } = this.state
    if (showGuide && permitted) return null

    const spanProps = {
      className: classnames(css.helpIcon, { [css.helpActive]: helpActive })
    }

    const iconProps = {
      className: `fa ${showHelp ? 'fa-question-circle' : 'fa-question-circle-o'}`,
      onClick: () => {
        this.setState({ helpActive: true })
        actions.showHelp(!showHelp)
      }
    }

    let content = (
      <div className={css.helpText}>
        <p>
          If the level bar remains low or high when you speak normally, please
          change the microphone position or try to configure your microphone level
          (from your operating system or directly from your microphone if possible)
        </p>
      </div>)

    if (!permitted) {
      content = (
        <div className={css.helpText}>
          <p>The microphone is not allowed or enabled.</p>
          <p>If you want to participate</p>
          <p>
            1. Disconnect the AudioDesk
            <br />
            2. Plug or activate a microphone
            <br />
            3. Reconnect the AudioDesk and allow the access if asked
          </p>
          <p>If you want to hear the conference</p>
          <p>
            1. Check if speaker device is detected
            <br />
            2. Click on « OK »
          </p>
        </div>
      )
    }

    return (
      <span {...spanProps}>
        <i {...iconProps} />
        {content}
      </span>
    )
  }

  deviceLabel = (device = {}) => {
    let { label } = device
    if (label === null || label === undefined || label === '') label = device.deviceId
    return label
  }

  onSelectChane = (e) => {
    const { actions } = this.props
    const deviceId = e.target.value
    actions.setAudioInputId(deviceId)
  }

  renderSelect = () => {
    const { audioInputId, devices, echoTest, permitted } = this.props
    const audioInputDevices = devices.filter(device => (device.kind === "audioinput"))
    const disabled = !permitted || echoTest
    const value = audioInputId || undefined
    const device = audioInputDevices.find(d => (d.deviceId === value))

    return (
      <div className={`select-box ${disabled && 'disabled'}`}>
        <span>{this.deviceLabel(device)}</span>
        <select ref={this.audioInputRef} onChange={this.onSelectChane} value={value} disabled={disabled}>
          {audioInputDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {this.deviceLabel(device)}
            </option>))}
        </select>
      </div>)
  }

  renderInputMeter = () => {
    if (helpers.isMobileDevice() && helpers.BrowserType.safari) return false
    return <canvas className={css.inputMeter} ref={this.inputMeterRef} width="500" height="50" />
  }

  lockIcon = () => {
    const { actions, inputLocked, user, showHelp } = this.props
    const { lockActive } = this.state

    const spanProps = {
      className: classnames({ [css.lockActive]: lockActive })
    }

    const iconProps = {
      className: `fa ${inputLocked ? 'fa-lock' : 'fa-unlock-alt'}`,
      onClick: () => {
        if (inputLocked) {
          this.setState({ lockActive: true })
          actions.showHelp(!showHelp)
        } else {
          const level = 0
          actions.lockInput(true)
          actions.setInputLevel(level)
          Sender.setVolumeIn(user.id, level)
        }
      }
    }

    const back = () => actions.showHelp(false)

    const unlock = () => {
      actions.lockInput(false)
      actions.showHelp(false)
    }

    return (
      <span {...spanProps}>
        <i {...iconProps} />
        <div className={css.helpText}>
          <p>Please consider, if you want to unlock the input volume control, it means that:</p>
          <p>- some participants give you the feedbacks that they can't hear you</p>
          <p>- you can't configure by yourself your input volume from your operating system or directly from your microphone.</p>
          <div className={css.btnLine}>
            <button className={css.btn} onClick={back}>BACK</button>
            <button className={css.btn} onClick={unlock}>OK</button>
          </div>
        </div>
      </span>
    )
  }

  onSliderChange = (level) => {
    clearTimeout(inputLevelTimer)
    const { actions } = this.props
    const setVolume = () => actions.setInputLevel(level)
    inputLevelTimer = setTimeout(setVolume, 200)
  }

  renderSlider = () => {
    const { inputLevel, inputLocked, sip, showGuide, permitted } = this.props
    if (showGuide || !permitted) return null
    const onCall = sip.onConnection && sip.started
    const onChange = onCall && !inputLocked ? this.onSliderChange : null
    const className = classnames(css.inputSlider, { [`${css.disabledSlider} disabledSlider`]: inputLocked })
    return (
      <div className={className}>
        {this.lockIcon()}
        <Slider min={-4} max={4} step={1} value={inputLevel} tooltip={false} onChange={onChange} />
      </div>
    )
  }

  render() {
    const { permitted, showGuide } = this.props

    return (
      <div className={css.audioInputBox}>
        <div className={css.deviceBar}>
          {this.echoBtn()}
          {this.helpIcon()}
        </div>
        {permitted &&
          <div>
            {this.renderSelect()}
            {this.renderInputMeter()}
            {this.renderSlider()}
          </div>
        }
        {!permitted && <p className={css.textLg}>Microphone not allowed or not enabled</p>}
        {permitted && showGuide &&
          <p className={css.descTip}>If the level bar remains low or high when you speak normally, please
          change the microphone position or try to configure your microphone level
          (from your operating system or directly from your microphone if possible)
        </p>}
      </div>
    )
  }
}

AudioInput.propTypes = {
  actions: object.isRequired,
  configured: bool.isRequired,
  devices: array.isRequired,
  echoTest: bool.isRequired,
  inputLevel: number.isRequired,
  inputLocked: bool.isRequired,
  permitted: bool.isRequired,
  show: bool.isRequired,
  showGuide: bool.isRequired,
  showHelp: bool.isRequired,
  sip: object.isRequired,
  user: object.isRequired,
}

AudioInput.defaultProps = {}

const mapStateToProps = state => ({
  members: state.members,
  sip: state.sip,
  user: state.currentUser,
  ...state.mediaSettings,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(MediaSettingsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(AudioInput)
