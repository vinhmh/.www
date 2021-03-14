import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { array, bool, object } from 'prop-types'
import Slider from 'react-rangeslider'
import classnames from 'classnames'
import css from './MediaSettings.scss'
import * as MediaSettingsActions from '../../reducers/mediaSettings/reducer'

class AudioOutput extends React.Component {
  constructor(props) {
    super(props)
    this.sound = new Audio('assets/audio/check_sound.mp3')
    this.audioOutputRef = React.createRef()
  }

  state = {
    helpActive: false,
    playSound: false,
  }

  componentDidMount() {
    this.updateSinkId()
  }

  componentDidUpdate(prevProps) {
    if (this.props.audioOutputId !== prevProps.audioOutputId) this.updateSinkId()
  }

  static getDerivedStateFromProps(nextProps, prevState) {
    if (!nextProps.showHelp && prevState.helpActive) return { ...prevState, helpActive: false }
    return null
  }

  async updateSinkId() {
    const { actions, audioOutputId } = this.props
    if (!this.isAvailable() || !audioOutputId) return

    try {
      await this.sound.setSinkId(audioOutputId)
    } catch (e) {
      actions.permit(false, e, false)
      Logger.error(e)
      return
    }
    document.querySelectorAll('#sip-audio audio').forEach(audio => audio.setSinkId(audioOutputId))
  }

  isAvailable = () => {
    if (helpers.isMobileDevice() && helpers.BrowserType.safari) return false
    return typeof document.createElement('audio').setSinkId === 'function'
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
          If you use external speakers (f.e. a headphone) and they have
          a specific hardware control of the volume, please configure it too.
        </p>
      </div>)

    if (!permitted) {
      content = (
        <div className={css.helpText}>
          <p>No speakers detected</p>
          <p>You need a speaker to get into a conference</p>
          <p>
            1. Disconnect the AudioDesk
            <br />
            2. Plug or activate a speaker. We strongly recommend a headphone.
            <br />
            3. Reconnect the AudioDesk
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

  playBtn = () => {
    const { outputVolume } = this.props
    const { playSound } = this.state

    const start = () => {
      this.sound.volume = outputVolume
      this.sound.play()
      this.sound.onended = () => this.setState({ playSound: false })
      this.setState({ playSound: true })
    }

    const stop = () => {
      this.sound.pause()
      this.sound.currentTime = 0
      this.setState({ playSound: false })
    }

    const className = `fa ${playSound ? 'fa-stop-circle' : 'fa-play-circle'}`
    const onClick = playSound ? stop : start

    return <i className={className} onClick={onClick} />
  }

  deviceLabel = (device = {}) => {
    let { label } = device
    if (label === null || label === undefined || label === '') label = device.deviceId
    return label
  }

  onSelectChange = (e) => {
    const { actions } = this.props
    const deviceId = e.target.value
    const success = (devices) => {
      const device = devices.find(d => (d.deviceId === deviceId && d.kind === "audiooutput"))
      if (device) actions.setAudioOutputId(deviceId)
    }

    actions.obtainDevices({ success })
  }

  renderSelect = () => {
    const { audioOutputId, devices, permitted } = this.props
    if (!permitted) return null

    if (!this.isAvailable()) return null

    const audioOutputDevices = devices.filter(device => (device.kind === "audiooutput"))
    const value = audioOutputId || undefined
    const device = audioOutputDevices.find(d => (d.deviceId === value))

    return (
      <div className="select-box">
        <span>{this.deviceLabel(device)}</span>
        <select ref={this.audioOutputRef} onChange={this.onSelectChange} value={value}>
          {audioOutputDevices.map(device => (
            <option key={device.deviceId} value={device.deviceId}>
              {this.deviceLabel(device)}
            </option>))}
        </select>
      </div>
    )
  }

  onSliderChange = (volume) => {
    const { actions } = this.props
    actions.setOutputVolume(volume)
    document.querySelectorAll('#sip-audio audio').forEach(audio => audio.volume = volume)
  }

  renderSlider = () => {
    if (!this.isAvailable()) return false
    const { outputVolume } = this.props
    return <Slider min={0} max={1} step={0.004} value={outputVolume} tooltip={false} onChange={this.onSliderChange} />
  }

  render() {
    const { showGuide, permitted } = this.props

    return (
      <div className={css.audioOutputBox}>
        <div className={css.deviceBar}>
          {this.playBtn()}
          {this.helpIcon()}
        </div>
        {this.renderSelect()}
        {this.renderSlider()}
        {!permitted && <p className={css.textLg}>Access to device is blocked in browser settings</p>}
        {permitted && showGuide &&
          <p className={css.descTip}>If you use external speakers and they have
          a specific hardware control of the volume, please configure it too.
        </p>}
      </div>
    )
  }
}

AudioOutput.propTypes = {
  actions: object.isRequired,
  devices: array.isRequired,
  permitted: bool.isRequired,
  showGuide: bool.isRequired,
  showHelp: bool.isRequired,
}

const mapStateToProps = state => ({
  ...state.mediaSettings,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(MediaSettingsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(AudioOutput)
