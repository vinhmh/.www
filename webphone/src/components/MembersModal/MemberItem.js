import React, { Fragment } from 'react'
import classnames from 'classnames'
import { connect } from 'react-redux'
import css from './MemberItem.scss'
import Modal from '../../fragments/Modal'
import { Sender } from '../../socketTextchat'
import * as AppActions from '../../reducers/app'
import { bindActionCreators } from 'redux'
import translator from '../../utilities/translator'
import { REMOVE_USER } from '../../socketTextchat/constants'
import { langGenerator } from '../../Languages/constant'

const statusGenerator = (meetingTitle = null, memberId, participants = []) => {
  const checkHaveInParticipants = participants.findIndex((id) => id == memberId)
  if (!meetingTitle) {
    switch (true) {
      case checkHaveInParticipants > -1:
        return 'check-circle'
      default:
        return 'plus-circle'
    }
  }
  if (meetingTitle == 'Demo') return 'check-circle'
  const checkHaveInMeetingTitle = meetingTitle.split(',').findIndex((id) => id == memberId)
  if (checkHaveInMeetingTitle > -1 || checkHaveInParticipants > -1) return 'check-circle'
  return 'plus-circle'
}

class MemberItem extends React.Component {
  componentDidUpdate(prevProps, prevState) {
    const {appActions} = this.props
    if (
      prevProps.app.loading != this.props.app.loading &&
      !this.props.app.loading &&
      this.props.app.message == REMOVE_USER
    ) {
      appActions.toggleDrawer()
    }
  }

  add = () => {
    const { member } = this.props
    this.props.handleAdd(member.user.id)
  }

  handleRemoveUser = () => {
    // const {meeting, member, appActions} = this.props
    // const {currentMeeting} = meeting
    // Sender.removeUser({
    //   meetingId: currentMeeting.id,
    //   userIdToRemove: member.user.id
    // })
    const {appActions,member} = this.props
    appActions.toggleDrawer(`remove-user${member.user.id}`)
    // const {handleRemoveUser} = this.props
    // handleRemoveUser(member.user.id)
  }

  handleConfirmRemoveUser = () => {
    const {meeting, member, appActions} = this.props
    const {currentMeeting} = meeting
    Sender.removeUser({
      meetingId: currentMeeting.id,
      userIdToRemove: member.user.id
    })
    appActions.setLoading({ status: true, message: null })
  }

  render() {
    const { member, user, meeting, participants, roomId, app, currentUserLanguage } = this.props
    const finalLang = langGenerator(currentUserLanguage)
    const isOpen = app.drawer == `remove-user${member.user.id}`
    const isShowRemoveIcon = meeting.currentMeeting && meeting.currentMeeting.title.split(',').length > 2
    const { displayName } = member.user
    const { currentMeeting } = meeting
    const status = statusGenerator(currentMeeting && currentMeeting.title, member.user.id, participants)
    if (user.useFloor) {
      if (user.titlesMap[roomId] && user.titlesMap[roomId].title !== "Floor" && !member.user.isModerator) return null;
    } else {
      if (user.titlesMap[roomId] && user.titlesMap[roomId].title === "Floor") return null;
    }
    let langCode = null
    if (user.isRegular && user.useFloor) langCode = user.titlesMap[parseInt(user.speakRoomId)] && user.titlesMap[parseInt(user.speakRoomId)].code
    else langCode = user.titlesMap[member.roomId] && user.titlesMap[member.roomId].code
    if (user.id == member.user.id) return null
    return (
      <Fragment>
         {this.props.fragment == 'members-modal' && isOpen &&
         (<Modal
            isOpen={isOpen}
            handleConfirm={this.handleConfirmRemoveUser}
            // content={`${translator('confirm_remove_remove_user', finalLang)}`}
            content={`Do you want to remove ${member.user.displayName} from this conversation ?`}
            title={translator('delete_chat', finalLang)}
          />)}
           <div className={css.memberItemContainer}>
        <p className={css.memberItemName} title={displayName}>
          {displayName}
        </p>
        <div className={css.memberLangCodeContainer + ' mr-1'}>
          <p className={css.memberLangCode + ' m-0'}>{langCode}</p>
          {(currentMeeting && currentMeeting.title.split(',').findIndex((id) => id == member.user.id) > -1) ||
          (currentMeeting && currentMeeting.title == 'Demo') ? (
            <React.Fragment>
            <span>
              <i style={{ color: '#D5F5E3' }} className={`fa fa-check-circle`} />
            </span>
            {isShowRemoveIcon && (<span>
              <i style={{ color: "black" }} className={`fa fa-times-circle`} onClick={this.handleRemoveUser} />
            </span>)}
            </React.Fragment>
          ) : (
            <span style={{ cursor: 'pointer' }} onClick={this.add}>
              <i style={{ color: status == 'check-circle' ? 'green' : 'black' }} className={`fa fa-${status}`} />
            </span>
          )}
        </div>
      </div>
      </Fragment>
    )
  }
}

const mapStateToProps = (state) => ({
  meeting: state.meeting,
  app: state.app,
  currentUserLanguage: state.currentUser.language,
})

const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(AppActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(MemberItem)
