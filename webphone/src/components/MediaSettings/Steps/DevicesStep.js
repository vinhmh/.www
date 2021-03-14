import { object } from 'prop-types'
import AudioOutput from '../AudioOutput'
import AudioInput from '../AudioInput'
import css from '../MediaSettings.scss'

export default class DevicesStep extends React.Component {
  constructor() {
    super()
    this.inputBoxRef = React.createRef()
    this.outputTextRef = React.createRef()
    this.nextBtnRef = React.createRef()
    this.next = this.next.bind(this)
  }

  state = {
    nextStep: false,
  }

  componentDidMount() {
    this.loadDevices()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.state.nextStep && !prevState.nextStep) {
      this.inputBoxRef.current.velocity({ opacity: 1 })
    }
  }

  loadDevices() {
    const { actions } = this.props
    const final = () => {
      actions.setupDevices()
      actions.hint(false)
    }
    actions.hint()
    actions.obtainDevices({ final })
  }

  async next() {
    const complete = () => this.setState({ nextStep: true })
    this.outputTextRef.current
      .velocity({ opacity: 0 })
      .velocity({ height: 0 }, { complete })

    this.nextBtnRef.current
      .velocity({ opacity: 0, display: 'none' })
  }

  done = () => {
    const { actions } = this.props
    actions.echoTest(false)
    actions.configure(true)
    actions.hideGuide()
  }

  renderOutputTip = () => (
    <div ref={this.outputTextRef}>
      <div className={css.whiteTextTip}>
        <p>First, please configure the volume of your speakers</p>
      </div>
    </div>)


  renderAudioOutput = () => (
    <div>
      {this.renderOutputTip()}
      <AudioOutput />
      <button ref={this.nextBtnRef} className={css.btnBig} onClick={this.next}>NEXT</button>
    </div>
  )

  renderInputTip = () => (
    <div className={css.whiteTextTip}>
      <p>Now please check your microphone. the level bar changes depending on
        your speech. You can also hear yourself thanks to the play button.
      </p>
    </div>)

  renderInputDevice = () => {
    if (!this.state.nextStep) return null
    return (
      <div ref={this.inputBoxRef} style={{ opacity: 0 }}>
        {this.renderInputTip()}
        <AudioInput />
        <button className={css.btnBig} onClick={this.done}>Ok</button>
      </div>
    )
  }

  render() {
    return (
      <div>
        {this.renderAudioOutput()}
        {this.renderInputDevice()}
      </div>
    )
  }
}

DevicesStep.propTypes = {
  actions: object.isRequired,
}
