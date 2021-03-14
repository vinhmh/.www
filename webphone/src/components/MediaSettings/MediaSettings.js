/* eslint default-case: 0 */
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { bool, object } from 'prop-types'
import * as MediaSettingsActions from '../../reducers/mediaSettings/reducer'
import IntroStep from './Steps/IntroStep'
import DevicesStep from './Steps/DevicesStep'
import AudioOutput from './AudioOutput'
import AudioInput from './AudioInput'
import css from './MediaSettings.scss'

const STEP_INTRO = 'STEP_INTRO'
const STEP_DEVICES = 'STEP_DEVICES'

class MediaSettings extends React.Component {
  state = {
    configStep: STEP_INTRO,
  }

  componentDidMount() {
    document.body.classList.add('no-scroll')
  }

  componentWillUnmount() {
    document.body.classList.remove('no-scroll')
  }

  hide = () => {
    const { actions } = this.props
    actions.hide()
  }

  renderHint = () => (
    <div className={css.webrtcHintBox}>
      <div className={css.whiteTextTip}>
        <p>Your web browser needs some instructions from you</p>
      </div>
      <div className={css.contentBox}>
        <p>
          If you want to speak into the conference, please allow the access to
          your microphone thanks to the popup that your browser is displaying.
        </p>
        <p>If you want to only hear the conference, this is not mandatory.</p>
      </div>
    </div>)

  renderHelpOverlay = () => {
    const { actions } = this.props
    const onClick = () => actions.showHelp(false)
    return <div className={css.helpOverlay} onClick={onClick} />
  }

  renderGuide = () => {
    const { configStep } = this.state
    const { actions } = this.props
    const showDevicesStep = () => this.setState({ configStep: STEP_DEVICES })

    switch (configStep) {
      case STEP_INTRO:
        return <IntroStep actions={actions} next={showDevicesStep} />
      case STEP_DEVICES:
        return <DevicesStep actions={actions} />
    }
    return null
  }

  renderDefault = () => {
    const { user } = this.props
    return (
      <React.Fragment>
        {!user.isSwitcher && <AudioOutput />}
        <AudioInput />
        <button className={css.btnBig} onClick={this.hide}>Ok</button>
      </React.Fragment>
    )
  }

  render() {
    const { hint, showGuide, showHelp } = this.props

    const contentStyle = hint ? { visibility: 'hidden' } : null
    let content
    if (showGuide) {
      content = this.renderGuide()
    } else {
      content = this.renderDefault()
    }

    return (
      <div className={css.wrapper}>
        <div className={css.holder}>
          {hint && this.renderHint()}
          {showHelp && this.renderHelpOverlay()}
          <div style={contentStyle}>
            {content}
          </div>
        </div>
        <div className={css.overlay} />
      </div>
    )
  }
}

MediaSettings.propTypes = {
  actions: object.isRequired,
  hint: bool.isRequired,
  showGuide: bool.isRequired,
  showHelp: bool.isRequired,
}

const mapStateToProps = state => ({
  ...state.mediaSettings,
  user: state.currentUser,
})

const mapDispatchToProps = dispatch => ({
  actions: bindActionCreators(MediaSettingsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(MediaSettings)
