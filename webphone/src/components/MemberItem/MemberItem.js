import PropTypes from 'prop-types'
import React from 'react'
import css from './MemberItem.scss'
import gcss from '../App/App.scss'
import * as Sender from '../../socket/sender'
import hasAdministrator from '../../HOCs/hasAdministrator'
import { WORKING } from '../../utilities/noticeTypes'
import { getDifferentTime } from '../../utilities/time'
import { getDifferentTimeInterpreter } from '../Timer/TimerInterpreter'
let interpreterIntervalList = null;
class MemberItem extends React.Component {
  state = {
    raiseHand: '0s',
    handInterval: null,
    interpreterInterval: null,
    interpreterTime: '0s',
    lastInterpreterSessionDateTime: new Date(),
  }

  componentDidMount() {
    const { raiseHandTime } = this.props

    if (raiseHandTime) {
      this.setState({
        handInterval: setInterval(() => this.raiseHandTimeConverter(), 200),
      })
    }
  }

  componentDidUpdate(prevProps) {
    const { raiseHandTime } = this.props
    const { handInterval, interpreterInterval } = this.state

    const { moderators } = this.props
    const currentInterpreter = moderators.members.find((interpreter) => interpreter.status == WORKING)
    const lastInterpreter = prevProps.moderators.members.find((interpreter) => interpreter.status == WORKING)
    if(!currentInterpreter) return
    // if(currentInterpreter != lastInterpreter) {
    //   this.setState({lastInterpreterSessionTime: new Date()})
    //   interpreterInterval1 = setInterval(() => this.interpreterTimeConverter(), 1000);
    // }
    if(lastInterpreter) {
      if(lastInterpreter.userId === currentInterpreter.userId) return
    } 
    if(lastInterpreter==currentInterpreter) return
    
    this.setState({lastInterpreterSessionTime: new Date()})
    interpreterIntervalList = setInterval(() => this.interpreterTimeConverter(), 1000);

    if (lastInterpreter && currentInterpreter) {
      if (lastInterpreter.userId === currentInterpreter.userId) return
    }
    if (lastInterpreter == currentInterpreter) return

    this.setState({
      lastInterpreterSessionTime: new Date(),
      interpreterInterval: setInterval(() => this.interpreterTimeConverter(), 200),
    })

    if (raiseHandTime && handInterval === null) {
      this.setState({
        handInterval: setInterval(() => this.raiseHandTimeConverter(), 200),
      })
    }
  }

  componentWillUnmount() {
    const { handInterval, interpreterInterval } = this.state
    if (handInterval !== null) clearInterval(handInterval)
    if (interpreterInterval !== null) clearInterval(interpreterInterval)
    if (interpreterIntervalList !== null) clearInterval(interpreterIntervalList);
  }

  toggleSpeak = () => {
    const { user, member, roomId } = this.props
    // if (member.user.inLoungeRoom) return;
    if (member.user.inLoungeRoom) {
      Sender.toggleSpeakMember(user.id, member.id, member.user.rooms.lounge)
      return
    }

    Sender.toggleSpeakMember(user.id, member.id, roomId)
  }

  raiseHandTimeConverter() {
    const { raiseHandTime } = this.props
    const { handInterval } = this.state
    const startDate = new Date(raiseHandTime).getTime()
    const endDate = new Date().getTime()
    const timeleft = endDate - startDate

    if ((raiseHandTime === null || raiseHandTime === undefined) && handInterval !== null) {
      this.setState({ handInterval: clearInterval(handInterval) })
      return
    }

    var hours = Math.floor((timeleft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    var minutes = Math.floor((timeleft % (1000 * 60 * 60)) / (1000 * 60))
    var seconds = Math.floor((timeleft % (1000 * 60)) / 1000)

    if (seconds <= 60 && !minutes >= 1) {
      this.setState({ raiseHand: `${seconds}s` })
    } else if (minutes >= 1 && hours < 1) {
      this.setState({ raiseHand: `${minutes}min` })
    } else if (hours >= 1) {
      this.setState({ raiseHand: `${hours}h` })
    }
  }

  interpreterTimeConverter() {
    const { lastInterpreterSessionTime } = this.state

    const startDate = lastInterpreterSessionTime
    const endDate = new Date()
    const difference = getDifferentTimeInterpreter(startDate, endDate)

    if (difference.getSeconds() <= 59 && !difference.getMinutes() >= 1 && difference.getHours() <= 1) {
      this.setState({ interpreterTime: `${difference.getSeconds()}s` })
    } else if (difference.getMinutes() >= 1 && !difference.getHours() >= 1) {
      this.setState({ interpreterTime: `${difference.getMinutes()}min` })
    } else {
      this.setState({ interpreterTime: `${difference.getHours()}h` })
    }
  }

  render() {
    const { member, user, raiseHandTime, showHand, withBlob, roomId, hasAdministrator, moderators } = this.props

    const { raiseHand } = this.state
    const { displayName } = member.user
    let langCode = null
    if (member.user.inLoungeRoom && member.user.isModerator) {
      langCode = 'Lounge'
    } else if (user.isRegular && user.useFloor) {
      langCode = user.titlesMap[parseInt(member.roomId)]?.code
    } else {
      langCode = user.titlesMap[member.roomId]?.code
    }

    let cssBlob

    if (withBlob) {
      cssBlob = css.microIcon + ' ' + gcss.blob + ' ' + gcss.white
    } else {
      cssBlob = css.microIcon + ' ' + gcss.white
    }

    const currentInterpreter = moderators.members.find((interpreter) => interpreter.userId == member.user.id)
    const isInterpreting = currentInterpreter && currentInterpreter.status == WORKING
    const canToggleMute = user.isModerator || user.isTechAssistant || user.isAdministrator || !hasAdministrator || (user.isSpeak && user.id === member.user.id)

    return (
      <div className={css.memberItemContainer}>
        <p className={css.memberItemName} title={displayName}>
        {displayName}{isInterpreting && `- ${this.state.interpreterTime}`}
        </p>
        <div className={css.memberLangCodeContainer + ' mr-1'}>
          {!!this.props.onMessage && <span className={css.messageBtn} onClick={this.props.onMessage}>
             <i className={`fa fa-comments`} />
          </span>}
          {!!showHand && (
            <React.Fragment>
              <img
                src={raiseHandTime ? 'assets/images/main_on.svg' : 'assets/images/main_off.svg'}
                alt="hand icon"
                width="18"
                height="18"
              />
              <p
                className={
                  raiseHandTime
                    ? css.memberTimeTxt + ' mb-0 ml-2 mr-1'
                    : css.memberTimeTxt + ' mb-0 ml-2 mr-1 ' + css.invisible
                }
              >
                {raiseHandTime ? raiseHand : ' | '}
              </p>
            </React.Fragment>
          )}
          <p
            className={
              langCode === 'Lounge' ? css.noUpperCaseLounge + css.memberLangCode + ' m-0' : css.memberLangCode + ' m-0'
            }
          >
            {langCode}
          </p>
          <img
            className={(member.talking ? cssBlob : css.microIcon) + ' ' + (canToggleMute ? '' : css.microIconDisabled) + ' ' + gcss.white}
            src={member.speak ? 'assets/images/micro_on.svg' : 'assets/images/micro_off.svg'}
            alt="micro icon"
            width="18"
            height="18"
            onClick={() => canToggleMute && this.toggleSpeak()}
          />
        </div>
      </div>
    )
  }
}

MemberItem.propTypes = {
  member: PropTypes.object.isRequired,
  moderators: PropTypes.object.isRequired,
  pos: PropTypes.number,
  roomId: PropTypes.string.isRequired,
  user: PropTypes.object.isRequired,
  raiseHandTime: PropTypes.number,
  showHand: PropTypes.bool,
  handRaisedTimestamp: PropTypes.object,
  withBlob: PropTypes.bool,
}

export default hasAdministrator(MemberItem)
