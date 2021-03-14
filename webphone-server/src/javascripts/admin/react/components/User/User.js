import _ from 'lodash'
import { object, func, bool } from 'prop-types'
import classnames from 'classnames'
import { Table, Icon, Label, Popup, Loader, Button } from 'semantic-ui-react'
import css from './User.scss'
import { isBrowserSupported, hasAudioDevice, hasOnlyHostCandidate, isSystemSupported, ROLES_FILTER, BROWSER_NAME, isOnTabletOrPhone, isCollaborationUsed } from '../../middleware/common'
import { reconnectAListOfUsers, switchRoom, toggleMicrophone, toggleSpeaker, peekOff, peekOn } from '../../middleware/actions'
import { getConferenceRoomNameById } from '../../middleware/meetings'

export default class User extends React.Component {
  state = {
    modalUserState: false
  }

  noClick = () => {
    const { user } = this.props
    return !user.connected || user.inLoungeRoom
  }

  memberByRoomId(roomId) {
    const { user } = this.props
    return user.members.find(m => m.roomId === roomId)
  }

  renderSwitchBtn() {
    const { user } = this.props
    if (user.role !== ROLES_FILTER.MODERATOR) return null

    const member = this.memberByRoomId(user.rooms.orator || user.hearRoomId)
    const memberFloor = this.memberByRoomId(user.rooms.floor)
    const disabled = this.noClick() || !((memberFloor && memberFloor.hear) || (member && member.hear))
    let iconClass = (user.speakRoomId === user.rooms.first) ? 'left' : 'right'

    const onClick = (event) => {
      event.stopPropagation()
      switchRoom(user.id)
    }
    return (<Button basic icon circular compact size="small" onClick={onClick} disabled={disabled}><Icon name={`long arrow alternate ${iconClass}`} color="grey" /></Button>)
  }

  renderDebugBtn() {
    const onClick = (event) => {
      event.stopPropagation()
      this.setState({ modalUserState: true })
    }
    return <Button basic compact size="small" circular icon="bug" onClick={onClick} />
  }

  renderDetailsBtn() {
    const onClick = (event) => {
      event.stopPropagation
      this.props.onSelected(this.props.user)
    }
    return <Button basic compact size="small" circular icon="ellipsis horizontal" onClick={onClick} />
  }

  renderMsgBtn() {
    const onClick = (event) => {
      event.stopPropagation()
      this.props.onMessage([this.props.user], this.props.kind)
    }
    return (<Button basic icon circular compact size="small" onClick={onClick}><Icon name='comment' color="blue" /></Button>)
  }

  renderMicBtn() {
    const { user } = this.props
    const { isSpeak } = user
    const color = isSpeak ? 'blue' : 'grey'
    const name = classnames('microphone', { slash: !isSpeak })
    const onClick = (event) => {
      event.stopPropagation()
      toggleMicrophone(user.id)
    }
    return (<Button basic icon circular compact size="small" onClick={onClick}><Icon name={name} color={color} /></Button>)
  }

  renderAudioBtn() {
    const { user } = this.props
    const { isHear } = user
    const name = `volume ${isHear ? 'up' : 'off'}`
    const color = isHear ? 'blue' : 'grey'
    const onClick = (event) => {
      event.stopPropagation()
      toggleSpeaker(user.id)
    }
    return (<Button basic icon circular compact size="small" onClick={onClick}><Icon name={name} color={color} /></Button>)
  }

  renderPeekBtn() {
    const { user } = this.props
    if (user.role !== ROLES_FILTER.MODERATOR) return null
    const { hearBoth } = user
    const onClick = (event) => {
      event.stopPropagation()
      if (hearBoth) {
        peekOff(user.id)
      } else {
        peekOn(user.id)
      }
    }
    return (
      <Button basic icon circular compact size="small" onClick={onClick}>
        <Icon name={`volume ${hearBoth ? 'up' : 'off'}`} color={hearBoth ? 'blue' : 'grey'} />&nbsp;
        &nbsp;<Icon name={`volume ${hearBoth ? 'up' : 'off'}`} color={hearBoth ? 'blue' : 'grey'} className="fa-flip-horizontal" />
      </Button>
    )
  }

  renderReconnectBtn() {
    const { user, setConfirm } = this.props
    const handleCancel = () => setConfirm({})
    const handleConfirm = () => {
      reconnectAListOfUsers([user])
      setConfirm({})
    }

    const onClick = (event) => {
      event.stopPropagation()
      setConfirm({
        confirmOpen: true,
        confirmContent: `Are you sure you want to reconnect ${user.displayName}?`,
        handleCancel,
        handleConfirm
      })
    }

    return (<Button basic icon circular compact size="small" onClick={onClick}><Icon name='remove user' color="blue" /></Button>)
  }

  renderActions = () => {
    const { user } = this.props
    if (user.isSwitcher) {
      return (
        <Table.Cell className={css.actionsCell}>
          {this.renderDebugBtn()}
        </Table.Cell>
      )
    }

    return (
      <Table.Cell className={css.actionsCell}>
        {this.renderMsgBtn()}
        <span className={css.info_separator} >&nbsp;|&nbsp;</span >
        {this.renderSwitchBtn()}
        {this.renderMicBtn()}
        {this.renderAudioBtn()}
        <span className={css.info_separator} >&nbsp;|&nbsp;</span >
        {this.renderReconnectBtn()}
      </Table.Cell>)
  }

  renderConferences = () => {
    const { user, titlesMap } = this.props
    const name = m => classnames('microphone', { slash: !m.speak })
    const klass = m => classnames([css.item], {
      [css.switcher]: user.isSwitcher,
      [css.talking]: m.talking,
      [css.speakRoom]: user.speakRoomId === m.roomId && user.isModerator,
      [css.hearRoom]: user.hearRoomId === m.roomId && user.isModerator,
    })

    if (!user.connected) {
      return <span className={css.participantError}><Loader size='mini' active inline indeterminate></Loader>&nbsp;Waiting...</span>
    }

    return user.members.map(m => {
      const meeting = titlesMap[user.meetingID]
      const roomTitle = getConferenceRoomNameById(meeting, m.roomId)
      return (
        <div key={m.id} className={klass(m)}>
          <Icon name={name(m)} />
          <span>{roomTitle}</span>
        </div>)
    })
  }

  renderName = (displayName, role, isTechAssistant, isOnMobileOrTablet, useCollaboration) => {
    const isStaff = displayName.toLowerCase().includes("ibp") || isTechAssistant;
    return (<span>
      <i className={`fa ${role === ROLES_FILTER.MODERATOR ? `fa-user-tie ${css.boothUserColor}` : `fa-user ${isStaff ? css.staffUserColor : css.regularUserColor}`}`} />
      &nbsp;<Icon name='desktop' className={useCollaboration ? css.collaborationEnabled : css.collaborationDisabled} />
      {displayName.trim()}&nbsp;
      {isOnMobileOrTablet && (<Icon name="mobile alternate" color="orange" />)}
    </span>);
  }

  render() {
    const { user } = this.props

    const rowClassName = (user) => {

      if (!user) return ''
      const { role, userState } = user
      const { debugInfo } = userState
      const { browser } = debugInfo.browserData

      if (!browser) return ''
      let red = role === ROLES_FILTER.MODERATOR && (browser.name === BROWSER_NAME.SAFARI)
      if (user.isSwitcher) {
        if (_.every(user.members, m => !m.speak)) { red = true }
        if (_.filter(user.members, m => m.speak).length >= 3) { red = true }
        if (_.every(user.members, m => m.speak)) { red = false }
      }
      return classnames({
        [css.redRow]: red,
        [css.speaking]: user.isSpeak,
      })
    }

    const computeError = (user) => {
      const { userState } = user
      const { debugInfo, mediaSettings } = userState
      const { browser, os } = debugInfo.browserData
      const { turnStun } = debugInfo

      const browserSupported = isBrowserSupported(browser)
      const hasDevice = hasAudioDevice(mediaSettings)
      const isWaiting = !user.connected ? true : false
      const networkIssue = hasOnlyHostCandidate(turnStun)
      const systemSupported = isSystemSupported(os)
      const onTabletOrPhone = isOnTabletOrPhone(os)
      const useCollab = isCollaborationUsed(user)

      let error = {
        hasError: false,
        hasWarning: !browserSupported || !systemSupported,
        code: "ok",
        description: "",
        level: "success",
        hasNetworkError: networkIssue,
        hasDeviceError: !hasDevice,
        hasBrowserError: !browserSupported,
        hasSystemError: !systemSupported,
        hasTabletOrPhone: onTabletOrPhone,
        hasCollaborationToolOpened: useCollab
      }

      if (networkIssue && isWaiting) {
        return { ...error, hasError: true, code: "network", description: "Network condition seems to block the connection to the conference system. Only host candidates have been gathered.", level: "error", title: "Network error!" }
      } else if (!hasDevice) {
        return { ...error, hasError: true, code: "device", description: "No device detected or no permission granted", level: "error", title: "Device error!" }
      }
      return error
    }

    const error = computeError(user)

    return (
      <Table.Row active={this.props.selected} className={rowClassName(user)} onClick={() => {
        this.props.onSelected(user);
      }}>
        <Table.Cell className={css.username}>{error.hasError && (
          <Popup
            trigger={<Label className={css.errorUser} color='red'><i className="fas fa-exclamation-circle"></i>&nbsp;{error.code}</Label>}
            header={error.title}
            mouseEnterDelay={500}
            content={error.description} />
        )}
          {this.renderName(user.displayName, user.role, user.isTechAssistant, error.hasTabletOrPhone, error.hasCollaborationToolOpened)}
        </Table.Cell>
        <Table.Cell className={css.conferencesList}>
          {this.renderConferences()}
        </Table.Cell>
        {this.renderActions()}
      </Table.Row>
    )
  }
}

User.propTypes = {
  setConfirm: func.isRequired,
  titlesMap: object.isRequired,
  user: object.isRequired,
  selected: bool.isRequired,
  onMessage: func.isRequired,
  onSelected: func.isRequired,
}
