/* eslint react/no-array-index-key:0 */
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { array, object } from 'prop-types'
import classnames from 'classnames'
import sip from '../../sip'
import * as Sender from '../../socket/sender'
import * as CurrentUserActions from '../../reducers/currentUser'
import * as MediaSettingsActions from '../../reducers/mediaSettings'
import controlsCss from '../UserControls/UserControls.scss'
import css from './CurrentOrator.scss'
import translator from '../../utilities/translator'

class CurrentOrator extends React.Component {
  noClick = () => {
    const { user } = this.props
    return !user.connected || user.inLoungeRoom
  }

  orators() {
    const { members } = this.props
    return members.filter(m => (m.user.isRegular || m.user.isSwitcher) && m.talking)
  }

  oratorRoom = (orator) => {
    if (!orator || orator.user.isSwitcher) return null

    const { user, mediaSettings } = this.props
    const { outputVolumeOrator } = mediaSettings

    let roomId
    if (user.isRegular && orator.user.isRegular && orator.user.useFloor && orator.roomId === orator.user.rooms.floor) {
      roomId = orator.user.hearRoomId
    } else {
      roomId = orator.roomId
    }

    const roomTitle = user.titlesMap[roomId].title
    let oratorBtnProps = null

    if (user.isRegular
      || roomId === user.rooms.first
      || roomId === user.rooms.second) {
      return <p className={css.roomName}>{roomTitle}</p>
    }

    if (user.rooms.orator === roomId) {
      const member = user.members.find(m => m.roomId === roomId)

      oratorBtnProps = {
        className: classnames(controlsCss.label, {
          [controlsCss.hearLabel]: member && member.hear
        })
      }
    }

    oratorBtnProps = oratorBtnProps || {
      className: classnames(controlsCss.textBtn, {
        [controlsCss.btnPassive]: this.noClick()
      }),
      onClick: () => this.onOratorClick(orator.roomId)
    }
    return (
      <div className={css.oratorBox}>
        <div {...oratorBtnProps}>
          {roomTitle}
        </div>
        <input
          className={css.slider}
          type="range"
          min="0"
          max="10"
          value={outputVolumeOrator * 10}
          step="1"
          onChange={this.setVolume}
        />
      </div>
    )
  }

  setVolume = e => {
    const { mediaSettingsActions } = this.props
    mediaSettingsActions.setOutputVolumeOrator(e.target.value / 10)
  }

  oratorTitle = (orator) => {
    const { user } = this.props
    let text
    if (!orator) {
      text = translator('orator_no_speaking', user.language)
    } else if (orator.user.isSwitcher) {
      text = translator('orator_stage_speaking', user.language)
    } else {
      text = orator.user.displayName
    }
    return <p className={css.oratorTitle}>{text}</p>
  }

  onOratorClick = (roomId) => {
    if (this.noClick()) return
    const { user, currentUserActions } = this.props
    const { currentUserUpdate } = currentUserActions
    currentUserUpdate({ connected: false, rooms: { ...user.rooms, orator: roomId } })
    Sender.pickOrator(user.id, roomId)
  }

  oratorContent = () => {
    const { adjustments, user, members } = this.props
    const filter = m => m.user.isModerator
      && (m.user.rooms.first === user.rooms.first || m.user.rooms.second === user.rooms.first)
      && m.user.speakRoomId === user.rooms.first
      && m.talking
      && m.roomId === user.rooms.first

    const anyInterpreter = !!members.filter(filter).length

    if (adjustments.demoMode && user.isRegular && anyInterpreter) {
      return (
        <div className={css.desc}>
          Translating
        </div>)
    }
    const orators = this.orators()
    const orator = orators[0]
    const oratorRoom = this.oratorRoom(orator)
    const oratorTitle = this.oratorTitle(orator)
    return (
      <div className={css.desc}>
        {oratorTitle}
        {oratorRoom}
      </div>
    )
  }

  render() {
    const { user } = this.props


    const holderProps = {
      className: classnames(css.oratorHolder, {
        [css.moderator]: user.isModerator
      })
    }

    return (
      <div {...holderProps}>
        <div className={css.orator}>
          {this.oratorContent()}
        </div>
      </div>
    )
  }
}

CurrentOrator.propTypes = {
  adjustments: object.isRequired,
  currentUserActions: object.isRequired,
  mediaSettings: object.isRequired,
  mediaSettingsActions: object.isRequired,
  members: array.isRequired,
  user: object.isRequired,
}

const mapStateToProps = state => ({
  adjustments: state.adjustments,
  mediaSettings: state.mediaSettings,
  members: state.members,
  user: state.currentUser,
})

const mapDispatchToProps = dispatch => ({
  currentUserActions: bindActionCreators(CurrentUserActions, dispatch),
  mediaSettingsActions: bindActionCreators(MediaSettingsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(CurrentOrator)
