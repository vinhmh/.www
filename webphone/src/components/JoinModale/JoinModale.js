import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import classnames from 'classnames'
import PropTypes, { bool, object, array, number, string } from 'prop-types'
import React from 'react'
import ReactSlider from 'react-slider'
import * as Sender from '../../socket/sender'
import Socket from '../../socket'
import * as MediaSettingsActions from '../../reducers/mediaSettings'
import AudioInputLevelBar from '../AudioInputLevelBar/AudioInputLevelBar'

import css from './JoinModale.scss'
import gcss from '../App/App.scss'

let inputLevelTimer = null

class JoinModale extends React.Component {
  constructor(props) {
    super(props)

    this.state = {
      helpInputActive: false,
      helpOutputActive: false,
      membersSnap: [],
      playSound: false,
      bbbWindow: null
    }

    this.sound = new Audio('assets/audio/check_sound.mp3')
    this.audioOutputRef = React.createRef()
    this.changeLanguageRef = React.createRef()
    this.changeLanguageDropDownRef = React.createRef()
    this.changeMicroRef = React.createRef()
    this.changeMicroDropDownRef = React.createRef()
    this.changeHeadSetsRef = React.createRef()
    this.changeHeadSetsDropDownRef = React.createRef()
    this.modalContentRef = React.createRef()
  }

  componentDidMount() {
    document.body.addEventListener('click', this.controlModal)
    window.onbeforeunload = this.disconnect
    this.updateSinkId()
  }

  componentDidUpdate(prevProps) {
    const { bbbWindow, user } = this.props

    if (this.props.audioOutputId !== prevProps.audioOutputId) this.updateSinkId()

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
    document.body.removeEventListener('click', this.controlModal)
  }

  controlModal = (e) => {
    if (!this.modalContentRef.current.contains(e.target)) {
      this.props.onJoinMeetingMenu()
    }
  }

  joinBbb = () => {
    const { user } = this.props
    const { joinUrl } = user.bbb
    if (!joinUrl) return null
    let bbbWindow = window.open(joinUrl, '_blank', `width=1000,height=${screen.height},left=825,top=0`)
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
    return false
  }

  joinCustom(url) {
    window.open(url, '_blank')
  }

  join() {
    const { user } = this.props
    const { joinUrl } = user.bbb
    const { platformUrl } = user
    
    if (platformUrl) {
      this.joinCustom(platformUrl)
    } else if (joinUrl) {
      this.joinBbb()
    }
  }

  disconnect = () => {
    Socket.close()
    const { bbbWindow } = this.state
    if (bbbWindow && !window.RECONNECT_USER) bbbWindow.close()
  }

  deviceLabel = (device = {}) => {
    let { label } = device
    if (label === null || label === undefined || label === '') label = device.deviceId
    return label
  }

  onRoomChange = (e) => {
    const { user, currentUserUpdate } = this.props
    if (!user.connected) return
    currentUserUpdate({ connected: false })
    Sender.changeRegularRoom(user.id, e.target.value)
  }

  onAudioOutputChange = (e) => {
    const { actions } = this.props
    const deviceId = e.target.value
    const success = (devices) => {
      const device = devices.find((d) => d.deviceId === deviceId)
      if (device) actions.setAudioOutputId(deviceId)
    }

    actions.obtainDevices({ success })
  }

  onAudioInputChange = (e) => {
    const { actions } = this.props
    const deviceId = e.target.value
    actions.setAudioInputId(deviceId)
  }

  isAvailable = () => {
    if (helpers.isMobileDevice() && helpers.BrowserType.safari) return false
    return typeof document.createElement('audio').setSinkId === 'function'
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
    document.querySelectorAll('#sip-audio audio').forEach((audio) => audio.setSinkId(audioOutputId))
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

  /**
   * Set the new Output Volume of user's headset
   * @param {number} level
   */
  onSliderChangeOutputVolume = (volume) => {
    const { actions } = this.props
    actions.setOutputVolume(volume)
    document.querySelectorAll('#sip-audio audio').forEach((audio) => (audio.volume = volume))
  }

  /**
   * Set the new Input Volume of user's microphone
   * @param {number} level
   */
  onSliderChangeInputVolume = (level) => {
    clearTimeout(inputLevelTimer)
    const { actions } = this.props
    const setVolume = () => actions.setInputLevel(level)
    inputLevelTimer = setTimeout(setVolume, 200)
  }

  toggleDropDown(refBtn, refDropDown) {
    this.setState({ helpOutputActive: false, helpInputActive: false })
    if (refDropDown.current.style.display === 'block') refDropDown.current.style.display = 'none'
    else refDropDown.current.style.display = 'block'

    if (refBtn.current.classList.contains(css.activeIbpBtn)) {
      let childNodesBtn = refBtn.current.childNodes
      for (let i = 0; i < childNodesBtn.length; i++) {
        if (childNodesBtn[i].nodeName === 'IMG') childNodesBtn[i].src = 'assets/images/icon_fleche_filtre.png'
      }
      refBtn.current.classList.remove(css.activeIbpBtn)
    } else {
      let childNodesBtn = refBtn.current.childNodes
      for (let i = 0; i < childNodesBtn.length; i++) {
        if (childNodesBtn[i].nodeName === 'IMG') childNodesBtn[i].src = 'assets/images/fleche_bas_blanc.svg'
      }
      refBtn.current.classList.add(css.activeIbpBtn)
    }
  }

  checkIsMicroUsed(deviceId, deviceInput) {
    const { devices } = this.props
    let microUsed
    devices.forEach((device) => {
      if (device.kind === 'audioinput' && device.deviceId === deviceId) {
        microUsed = device
      }
    })
    if (microUsed === deviceInput) return true
    return false
  }

  checkIsHeadsetUsed(deviceId, deviceOutput) {
    const { devices } = this.props
    let headsetUsed

    if ((deviceId === null || deviceId) === undefined && (deviceOutput === null || deviceOutput === undefined))
      return false

    devices.forEach((device) => {
      if (device.kind === 'audiooutput' && device.deviceId === deviceId) {
        headsetUsed = device
      }
    })
    if (headsetUsed.deviceId === deviceOutput.deviceId) return true
    return false
  }

  playTestOutput() {
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

    const onClick = playSound ? stop : start

    onClick()
  }

  helpOutputIcon = () => {
    const { actions, permitted, showHelp, showGuide } = this.props
    const { helpOutputActive } = this.state
    if (showGuide && permitted) return null

    const spanProps = {
      className: classnames(css.helpIcon, {
        [css.helpActive]: helpOutputActive,
      }),
      onClick: () => {
        this.setState({ helpOutputActive: !helpOutputActive })
        // actions.showHelp(!showHelp);
      },
    }

    let content = (
      <div className={css.helpText}>
        <p>
          If you use external speakers (f.e. a headphone) and they have a specific hardware control of the volume,
          please configure it too.
        </p>
      </div>
    )

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
        <img src={'assets/images/bouton_info_volume.png'} alt="info" />
        {content}
      </span>
    )
  }

  helpInputIcon = () => {
    const { actions, permitted, showHelp, showGuide } = this.props
    const { helpInputActive } = this.state
    if (showGuide && permitted) return null

    const spanProps = {
      className: classnames(css.helpIcon, {
        [css.helpActive]: helpInputActive,
      }),
      onClick: () => {
        this.setState({ helpInputActive: !helpInputActive })
        // actions.showHelp(!showHelp);
      },
    }

    let content = (
      <div className={css.helpText}>
        <p>
          If the level bar remains low or high when you speak normally, please change the microphone position or try to
          configure your microphone level (from your operating system or directly from your microphone if possible)
        </p>
      </div>
    )

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
      <div {...spanProps}>
        <img src={'assets/images/bouton_info_volume.png'} alt="info" />
        {content}
      </div>
    )
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
      `fa fa-3x ${classname}`,
      { [css.disabled]: disabled }
    )
    btnProps.style = {
      color: 'blue',
    }

    if (!disabled) btnProps.onClick = this.onEchoClick
    return <i {...btnProps} />
  }


  render() {
    const {
      onJoinMeetingMenu,
      user,
      audioInputId,
      audioOutputId,
      outputVolume,
      inputLevel,
      devices,
      echoTest,
      permitted,
      showHelp,
    } = this.props

    const microphones = []
    const headsets = []
    devices.forEach((device) => {
      if (device.kind === 'audioinput') microphones.push(device)
      if (device.kind === 'audiooutput') headsets.push(device)
    })
    const disabled = !permitted || echoTest
    const valueInput = audioInputId || undefined
    const deviceInput = devices.find((d) => d.deviceId === valueInput)
    const valueOutput = audioOutputId || undefined
    const deviceOutput = devices.find((d) => d.deviceId === valueOutput)

    return (
      <>
      <div className={css.backDropModal} onClick={() => onJoinMeetingMenu()}></div>
      <div className={css.joinModale}>
        <div className={css.contentModale}>
          <div style={{display:"flex"}}>
          <button
            onClick={() => onJoinMeetingMenu()}
            type="button"
            className={'btn ' + css.menuBtn + ' ' + gcss.noOutline}
          >
            <img src="assets/images/bouton_menu_on.png" alt="open menu" width="30" height="30" />
          </button>
          </div>
          <div className={css.modaleHeader}>
            <img src={'assets/images/logo_ibp.png'} alt="logo" />
            <p className={css.modaleInfo + ' font-weight-bold'}>Welcome {user.displayName}</p>
            <p className={css.modaleTitle}>You're going to join the meeting</p>
            <p className={css.conferenceName}>{user.meetingID}</p>
            <p className={css.modaleInfo}>You can also make some adjustments:</p>
          </div>
          <div className={css.selectBtns}>
            {user.isModerator ? (
              ''
            ) : (
              <div className={css.ibpDropdown}>
                <button
                  ref={this.changeLanguageRef}
                  type="button"
                  className={gcss.ibpBtn + ' ' + gcss.ibpBtnSelect + ' ' + gcss.noOutline + ' w-100'}
                  aria-haspopup="true"
                  aria-expanded="false"
                  onClick={() => this.toggleDropDown(this.changeLanguageRef, this.changeLanguageDropDownRef)}
                >
                  Change your language
                  <img
                    className="ml-2"
                    src={'assets/images/icon_fleche_filtre.png'}
                    alt="select icon"
                    width="14"
                    height="8"
                  />
                </button>
                <div className={css.ibpDropdownContent} ref={this.changeLanguageDropDownRef}>
                  <div className={css.ibpDropdownBtns}>
                    {user.roomsList.map((item) => (
                      <button
                        className={
                          (user.titlesMap[user.hearRoomId] && user.titlesMap[user.hearRoomId].title) ===
                          (user.titlesMap[item] && user.titlesMap[item].title)
                            ? css.ibpDropdownItem + ' ' + gcss.noOutline + ' ' + css.activeSelectedBtn
                            : css.ibpDropdownItem + ' ' + gcss.noOutline
                        }
                        type="button"
                        key={item}
                        value={item}
                        onClick={(e) => this.onRoomChange(e)}
                      >
                        {user.titlesMap[item] && user.titlesMap[item].title}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
            <div className={css.ibpDropdown}>
              <button
                ref={this.changeMicroRef}
                type="button"
                className={gcss.ibpBtn + ' ' + gcss.ibpBtnSelect + ' ' + gcss.noOutline + ' w-100'}
                aria-haspopup="true"
                aria-expanded="false"
                onClick={() => this.toggleDropDown(this.changeMicroRef, this.changeMicroDropDownRef)}
              >
                Check your microphone
                <img
                  className="ml-2"
                  src={'assets/images/icon_fleche_filtre.png'}
                  alt="select icon"
                  width="14"
                  height="8"
                />
              </button>
              <div className={css.ibpDropdownContent} ref={this.changeMicroDropDownRef}>
                <div className={css.ibpDropdownBtns}>
                  {!permitted && <p className={css.textLg}>Microphone not allowed or not enabled</p>}
                  {microphones.map((device) => (
                    <button
                      className={
                        this.checkIsMicroUsed(device.deviceId, deviceInput)
                          ? css.ibpDropdownItem + ' ' + gcss.noOutline + ' ' + css.activeSelectedBtn
                          : css.ibpDropdownItem + ' ' + gcss.noOutline
                      }
                      type="button"
                      key={device.deviceId}
                      value={device.deviceId}
                      onClick={(e) => this.onAudioInputChange(e)}
                    >
                      {this.deviceLabel(device)}
                    </button>
                  ))}
                </div>
                <AudioInputLevelBar />
                {permitted ? (
                  <div className={css.headsetVolume}>
                    <button className={'btn ' + gcss.noOutline} type="button" onClick={() => this.onEchoClick()}>
                      {this.echoBtn()}
                    </button>
                    {/** Microphone */}
                    <div className="w-100">
                      <ReactSlider
                        min={-4}
                        max={4}
                        step={1}
                        value={inputLevel}
                        trackClassName="sliderTrack"
                        thumbClassName="sliderThumb"
                        onChange={(value) => {
                          this.onSliderChangeInputVolume(value)
                        }}
                      />
                    </div>
                    <button className={'btn ' + gcss.noOutline} type="button">
                      {this.helpInputIcon()}
                    </button>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
            <div className={css.ibpDropdown}>
              <button
                ref={this.changeHeadSetsRef}
                type="button"
                className={gcss.ibpBtn + ' ' + gcss.ibpBtnSelect + ' ' + gcss.noOutline + ' w-100'}
                aria-haspopup="true"
                aria-expanded="false"
                onClick={() => this.toggleDropDown(this.changeHeadSetsRef, this.changeHeadSetsDropDownRef)}
              >
                Check your headsets
                <img
                  className="ml-2"
                  src={'assets/images/icon_fleche_filtre.png'}
                  alt="select icon"
                  width="14"
                  height="8"
                />
              </button>
              <div className={css.ibpDropdownContent} ref={this.changeHeadSetsDropDownRef}>
                <div className={css.headsetSettings}>
                  {!permitted && <p className={css.textLg}>Headset not allowed or not enabled</p>}
                  {headsets.map((device) => (
                    <button
                      className={
                        this.checkIsHeadsetUsed(device.deviceId, deviceOutput)
                          ? css.ibpDropdownItem + ' ' + gcss.noOutline + ' ' + css.activeSelectedBtn
                          : css.ibpDropdownItem + ' ' + gcss.noOutline
                      }
                      type="button"
                      key={device.deviceId}
                      value={device.deviceId}
                      onClick={(e) => this.onAudioOutputChange(e)}
                    >
                      {this.deviceLabel(device)}
                    </button>
                  ))}
                </div>
                {permitted ? (
                  <div className={css.headsetVolume}>
                    <button className={'btn ' + gcss.noOutline} type="button" onClick={() => this.playTestOutput()}>
                      <img src={'assets/images/bouton_volume_parametre.png'} alt="play" />
                    </button>
                    {/** Headset */}
                    <div className="w-100">
                      <ReactSlider
                        min={0}
                        max={1}
                        step={0.004}
                        value={outputVolume}
                        trackClassName="sliderTrack"
                        thumbClassName="sliderThumb"
                        onChange={(value) => {
                          this.onSliderChangeOutputVolume(value)
                        }}
                      />
                    </div>
                    <button className={'btn ' + gcss.noOutline} type="button">
                      {this.helpOutputIcon()}
                    </button>
                  </div>
                ) : (
                  ''
                )}
              </div>
            </div>
            <button
              className={css.ibpPrimarySelectBtn + ' ' + gcss.noOutline + ' mt-4 py-1'}
              type="button"
              onClick={() => {
                onJoinMeetingMenu()
              }}
            >
              Join the meeting
            </button>
            <div className={css.demoExitContainer}>
              <button className={css.logoutBtn + ' ' + gcss.noOutline + ' btn'} type="button" onClick={window.close}>
                <img
                  className={css.logoutIcon}
                  src="assets/images/bouton_deconnexion.png"
                  alt="logout icon"
                  width="35"
                  height="35"
                />
                <span className={css.settingsText + ' d-block'}>Logout</span>
              </button>
            </div>
          </div>
        </div>
      </div>
      </>
    )
  }
}

JoinModale.propTypes = {
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
  user: PropTypes.object.isRequired,
  currentUserUpdate: PropTypes.func.isRequired,
  onJoinMeetingMenu: PropTypes.func.isRequired,
}

const mapStateToProps = (state) => ({
  members: state.members,
  sip: state.sip,
  user: state.currentUser,
  ...state.mediaSettings,
})

const mapDispatchToProps = (dispatch) => ({
  actions: bindActionCreators(MediaSettingsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(JoinModale)
