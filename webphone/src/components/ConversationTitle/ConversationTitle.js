import React, { Component, Fragment } from 'react'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import { connect } from 'react-redux'
import css from './ConversationTitle.scss'
import { uniqueMaker } from '../../utilities/uniqueMaker'
import translator from '../../utilities/translator'
import { nameRefact } from '../../utilities/nameRefact'

const namesStr = (arr, ids, currentUserId = null, type = null) => {
  const uniqueArr = uniqueMaker(arr, 'userId')
  if (type == 'Technical')
    return uniqueArr
      .filter(
        (m) => ids.findIndex((id) => id == m.user.id) > -1 && m.user.id != currentUserId && !m.user.isTechAssistant,
      )
      .map((m) => nameRefact(m.user.displayName))
  return uniqueArr
    .filter((m) => ids.findIndex((id) => id == m.user.id) > -1 && m.user.id != currentUserId)
    .map((m) => nameRefact(m.user.displayName))
}

const findNamesByIds = (allMembers = [], allMembersOff = [], ids, currentUserId, type = null) => {
  const membersOnline = ['You', ...namesStr(allMembers, ids, currentUserId, type)].join(', ')
  const filteredMembersOffline = allMembersOff.filter(
    (mOff) => allMembers.findIndex((mOn) => mOn.userId == mOff.userId) == -1,
  )
  const membersOffline = namesStr(filteredMembersOffline, ids, type).join(', ')
  return {
    membersOnline,
    membersOffline,
  }
}

class ConversationTitle extends Component {
  titleGenerator = () => {
    const { meetingFocus, members, membersOff, currentUser, inChatRoom } = this.props
    if (!meetingFocus) return null
    const { type } = meetingFocus
    if (type == 'TechnicalPublic') {
      return (
        <p className={inChatRoom ? css.onChatRoom : css.online}>
          {translator('chat_general_technical', currentUser.language)}
        </p>
      )
    }
    if (type == 'InterpreterPublic') {
      return (
        <p className={inChatRoom ? css.onChatRoom : css.online}>
          {translator('chat_general_moderator', currentUser.language)}
        </p>
      )
    }
    if (type == 'InterpreterCabin') {
      return (
        <p className={inChatRoom ? css.onChatRoom : css.online}>
          {translator('chat_cabin_moderator', currentUser.language)}
        </p>
      )
    }
    if (type == 'Public') {
      return (
        <p className={inChatRoom ? css.onChatRoom : css.online}>{translator('chat_general', currentUser.language)}</p>
      )
    }
    if (type == 'Technical') {
      if (!currentUser.isTechAssistant) {
        return (
          <Fragment>
            <p className={inChatRoom ? css.onChatRoom : css.online}>
              {translator('chat_technical', currentUser.language)}
            </p>
          </Fragment>
        )
      }
      const uniqueArrMembers = uniqueMaker(members, 'userId')
      const userServe = uniqueArrMembers.find(
        (m) =>
          meetingFocus.title.split(',').findIndex((id) => id == m.user.id) > -1 &&
          m.user.id != currentUser.id &&
          !m.user.isTechAssistant,
      )
      const userServeOff = uniqueMaker(membersOff, 'userId').find(
        (m) =>
          meetingFocus.title.split(',').findIndex((id) => id == m.user.id) > -1 &&
          m.user.id != currentUser.id &&
          !m.user.isTechAssistant,
      )
      return (
        <Fragment>
          <span className={inChatRoom ? css.onChatRoom : css.online}>
            {userServe ? userServe.user && nameRefact(userServe.user.displayName) : null}
          </span>
          <span className={inChatRoom ? css.offChatRoom : css.offline}>
            {userServeOff && !userServe ? userServeOff.user && nameRefact(userServeOff.user.displayName) : (userServe ? null : nameRefact(meetingFocus.createdBy.username))}
          </span>
        </Fragment>
      )
    }
    if (type == 'Private' || type == 'Group') {
      const title = findNamesByIds(members, membersOff, meetingFocus.title.split(','), currentUser.id)
      const { membersOnline, membersOffline } = title
      return (
        <Fragment>
          <span className={inChatRoom ? css.onChatRoom : css.online}>
            {type == 'Private' && !inChatRoom
              ? membersOnline.replace(membersOnline.split(',').length == 1 ? 'You' : 'You, ', '')
              : membersOnline}
          </span>
          {membersOffline && inChatRoom && <span>{', '}</span>}
          {membersOffline && type == 'Group' && !inChatRoom && <span>{', '}</span>}
          <span className={inChatRoom ? css.offChatRoom : css.offline}>{membersOffline}</span>
        </Fragment>
      )
    }
  }
  render() {
    const { inChatRoom } = this.props
    const title = this.titleGenerator()
    return <div id="conversation-title" className={classNames({ [css.wrapper]: !inChatRoom, [css.inChatRoom]: inChatRoom })}>{title}</div>
  }
}

ConversationTitle.propTypes = {
  members: PropTypes.array.isRequired,
  membersOff: PropTypes.array.isRequired,
  currentUser: PropTypes.object.isRequired,
  meetingFocus: PropTypes.object,
  inChatRoom: PropTypes.bool,
}

const mapStateToProps = (state) => ({
  currentUser: state.currentUser,
  membersOff: state.membersOff,
  members: state.members,
})

const mapDispatchToProps = (dispatch) => ({
  //   appActions: bindActionCreators(AppActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(ConversationTitle)
