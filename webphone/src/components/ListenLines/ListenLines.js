import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import classnames from 'classnames'
import React from 'react'
import * as Sender from '../../socket/sender'
import * as CurrentUserActions from '../../reducers/currentUser'
import * as MediaSettingsActions from '../../reducers/mediaSettings'
import * as AppActions from '../../reducers/app/reducer'
import ReactSlider from 'react-slider'
import css from './ListenLines.scss'
import gcss from '../App/App.scss'
import UseFloorCode from '../UseFloorCode'
import { toggleMuteApp } from '../../utilities/appMute'

class ListenLines extends React.Component {
  state = {
    langBMenu: false,
  }

  constructor(props) {
    super(props)

    this.floorBtnRef = React.createRef()
    this.relayBtnRef = React.createRef()
  }

  demuteAppIfMuted = () => {
    const { app, appActions } = this.props
    if (app.appMuted) {
      toggleMuteApp()
      appActions.setMute(false)
    }
  }

  onOratorClick = (orator) => {
    const { user } = this.props
    Sender.pickOrator(user.id, orator.roomId)
    this.setState({ langBMenu: false })
  }

  onFloorClick = () => {
    const { user } = this.props
    Sender.pickFloor(user.id)
    this.setState({ langBMenu: false })
  }

  handleLangB(e) {
    const { user } = this.props
    const roomId = e.target.getAttribute('data-id')
    this.demuteAppIfMuted()
    Sender.pickLangb(user.id, roomId)
    this.setState({ langBMenu: false })
  }

  activateLangBMenu() {
    const { langBMenu } = this.state
    this.setState({ langBMenu: !langBMenu })
  }

  orators() {
    const { members } = this.props
    return members.filter((m) => (m.user.isRegular || m.user.isSwitcher) && m.talking)
  }

  setVolumeLine1 = (value) => {
    const { actions } = this.props
    actions.setOutputVolumeLine1(value / 10)
  }

  setVolumeLine2 = (value) => {
    const { actions } = this.props
    actions.setOutputVolumeLine2(value / 10)
  }

  setVolumeFloor = (value) => {
    const { actions } = this.props
    actions.setOutputVolumeFloor(value / 10)
  }

  setVolumeOrator = (value) => {
    const { actions } = this.props
    actions.setOutputVolumeOrator(value / 10)
  }

  setVolumeLangB = (value) => {
    const { actions } = this.props
    actions.setOutputVolumeLangB(value / 10)
  }

  floorBtn = () => {
    const { user, mediaSettings, members, app, appActions, adjustments } = this.props
    const { outputVolumeOrator, outputVolumeFloor } = mediaSettings
    const oratorMember = user.members.find((m) => m.roomId == user.rooms.orator)
    const isHearOratorRoom = oratorMember && oratorMember.hear
    const floorMember = user.members.find((m) => m.roomId == user.rooms.floor)
    const isHearFloorRoom = floorMember && floorMember.hear
    let [ orator ] = this.orators()
    if (orator && (orator.roomId === user.rooms.first || orator.roomId === user.rooms.second)) {
      orator = null;
    }
    const floorAvailable = user.useSwitcher || (user.useFloor && !adjustments?.meetings[user.meetingID]?.floorDisabled)
    const disabled = (!floorAvailable && !orator && !isHearOratorRoom) || user.inLoungeRoom

    const props = {
      disabled: disabled,
      className: classnames(css.listenLineBtn, {
        [css.listenLineBtnActive]: isHearFloorRoom || isHearOratorRoom,
      }),
      ref: this.floorBtnRef,
      onClick: () => {
        if (disabled) return
        this.demuteAppIfMuted()
        if (floorAvailable) this.onFloorClick()
        else if (orator) this.onOratorClick(orator)
      },
    }

    return (
      <div className={css.btnSliderContainer}>
        <button {...props}>
          {!floorAvailable && !isHearOratorRoom ? (
            <UseFloorCode user={user} members={members} />
          ) : isHearOratorRoom ? (
            user.titlesMap[oratorMember.roomId]?.code
          ) : (
            'Floor'
          )}
        </button>
        {isHearOratorRoom ? (
          <div>
            <ReactSlider
              disabled={user.inLoungeRoom}
              min={0}
              max={10}
              step={0.1}
              value={outputVolumeOrator * 10}
              trackClassName={'sliderTrack'}
              thumbClassName={'sliderThumb'}
              onChange={(value) => this.setVolumeOrator(value)}
            />
          </div>
        ) : (isHearFloorRoom ? (
          <div>
            <ReactSlider
              disabled={user.inLoungeRoom}
              min={0}
              max={10}
              step={0.1}
              value={outputVolumeFloor * 10}
              trackClassName="sliderTrack"
              thumbClassName="sliderThumb"
              onChange={(value) => this.setVolumeFloor(value)}
            />
          </div>
        ) : null)}
      </div>
    )
  }

  relayBtn = () => {
    const { mediaSettings, user } = this.props
    const { outputVolumeLine1, outputVolumeLine2 } = mediaSettings

    const disabled = user.inLoungeRoom
    const props = {
      className: classnames(css.listenLineBtn, {
        [css.listenLineBtnActive]: user.hearBoth && !user.inLangbRoom,
      }),
      ref: this.relayBtnRef,
      disabled: disabled,
      onClick: (e) => {
        if (disabled) return
        this.demuteAppIfMuted()
        Sender.pickRelay(user.id)
      },
    }
    return (
      <div className={css.btnSliderContainer}>
        <button {...props}>Relay</button>
        {user.hearBoth && <div className={css.relayVolumeContainer}>
          <ReactSlider
            disabled={user.inLoungeRoom}
            min={0}
            max={10}
            step={0.1}
            value={outputVolumeLine1 * 10}
            trackClassName="sliderTrack"
            thumbClassName="sliderThumb"
            onChange={(value) => this.setVolumeLine1(value)}
          />
          <ReactSlider
            disabled={user.inLoungeRoom}
            min={0}
            max={10}
            step={0.1}
            value={outputVolumeLine2 * 10}
            trackClassName="sliderTrack"
            thumbClassName="sliderThumb"
            onChange={(value) => this.setVolumeLine2(value)}
          />
        </div>}
      </div>
    )
  }

  toggleMicroIfOn() {
    const { user } = this.props;

    user.members.map(m => {
      if (m.speak)
        Sender.toggleSpeakMember(user.id, m.id, m.roomId)
    })
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

  langBButton() {
    const { user, mediaSettings } = this.props
    const { langBMenu } = this.state
    const { outputVolumeLangB } = mediaSettings
    const langBMember = user.members.find((m) => m.roomId == user.rooms.langb)
    const isHearLangBRoom = langBMember && langBMember.hear
    const bLines = user.roomsList.filter((roomId) => roomId !== user.rooms.first && roomId !== user.rooms.second)
    let disabled = user.inLoungeRoom || bLines.length === 0

    return (
      <div className={css.btnSliderContainer}>
        <div className={css.menuDropDown}>
          <button
            disabled={disabled}
            className={isHearLangBRoom ? css.listenLineBtn + ' ' + css.listenLineBtnActive : css.listenLineBtn}
            onClick={() => this.activateLangBMenu()}
          >
            {isHearLangBRoom ? user.titlesMap[langBMember.roomId].code : 'Lang B'}
          </button>
          <div className={langBMenu ? css.menuDropdownContent + ' ' + css.activeMenu : css.menuDropdownContent}>
            {bLines.map((roomId) => (
              <button
                key={roomId}
                className={css.menuBtn + ' ' + gcss.noOutline}
                data-id={roomId}
                value={user.titlesMap[roomId].code}
                onClick={(e) => this.handleLangB(e)}
              >
                {user.titlesMap[roomId].title}
              </button>
            ))}
          </div>
        </div>
        {isHearLangBRoom && <div>
          <ReactSlider
            disabled={user.inLoungeRoom}
            min={0}
            max={10}
            step={0.1}
            value={outputVolumeLangB * 10}
            trackClassName="sliderTrack"
            thumbClassName="sliderThumb"
            onChange={(value) => this.setVolumeLangB(value)}
          />
        </div>}
      </div>
    )
  }

  render() {
    return (
      <div className={css.listenLineContainer}>
        {this.floorBtn()}
        {this.relayBtn()}
        {this.langBButton()}
      </div>
    )
  }
}

ListenLines.propTypes = {
  actions: PropTypes.object.isRequired,
  currentUserActions: PropTypes.object.isRequired,
  appActions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  inputLevel: PropTypes.number.isRequired,
  outputVolume: PropTypes.number.isRequired,
  mediaSettings: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  app: state.app,
  ...state.mediaSettings,
})

const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(AppActions, dispatch),
  currentUserActions: bindActionCreators(CurrentUserActions, dispatch),
  actions: bindActionCreators(MediaSettingsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(ListenLines)
