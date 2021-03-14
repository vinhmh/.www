import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { bool, object, array, number } from 'prop-types'
import classnames from 'classnames'
import Slider from 'react-rangeslider'
import * as Sender from '../../socket/sender'
import * as MediaSettingsActions from '../../reducers/mediaSettings'
import AudioMeter from './../MediaSettings/AudioMeter';
import css from './../MediaSettings/MediaSettings.scss'

let inputLevelTimer = null

class AudioInput extends React.Component {
  constructor(props) {
    super(props)

    this.inputMeterRef = React.createRef()
    this.inputMeter = null
  }

  componentDidMount() {
    this.startAudioMeter()
  }

  componentDidUpdate(prevProps) {
    if (this.props.audioInputId !== prevProps.audioInputId) this.resetAudioMeter()
  }

  componentWillUnmount() {
    this.stopAudioMeter()
  }

//   static getDerivedStateFromProps(nextProps, prevState) {
//     const state = {}
//     if (!nextProps.showHelp) {
//       if (prevState.helpActive) state.helpActive = false
//       if (prevState.lockActive) state.lockActive = false
//     }
//     if (Object.keys(state).length) return { ...prevState, ...state }
//     return null
//   }

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


  renderInputMeter = () => {
    if (helpers.isMobileDevice() && helpers.BrowserType.safari) return false
    return <canvas className={css.inputMeter} ref={this.inputMeterRef} />
  }

  render() {
    const { permitted, showGuide } = this.props

    return (
        permitted ? this.renderInputMeter()
        : ""
    )
  }
}

AudioInput.propTypes = {
  permitted: bool.isRequired,
  show: bool.isRequired,
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
