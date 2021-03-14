/* eslint default-case: 0 */
import sip, { FIRST_LINE, SECOND_LINE, FLOOR_LINE, LOUNGE_LINE, ORATOR_LINE, LANGB_LINE } from '../sip'
import socket from '../socket'
import socketTextchat from '../socketTextchat'
import { memberAdd, memberDel, memberUpdate, membersChange } from '../reducers/members'
import * as App from '../reducers/app'
import * as TextchatApp from '../reducers/textchatApp'
import * as MembersOff from '../reducers/membersOff'
import * as Adjustments from '../reducers/adjustments'
import * as CurrentUser from '../reducers/currentUser'
import * as MediaSettings from '../reducers/mediaSettings'
import * as Notice from '../reducers/notice'
import * as Sip from '../reducers/sip'
import * as SplashScreen from '../reducers/splashScreen'
import * as Socket from '../reducers/socket'
import * as Messages from '../reducers/messages'
import * as Meeting from '../reducers/meeting'
import * as Notification from '../reducers/msgNotification'
import * as Moderators from '../reducers/moderators'
import * as Timeruser from '../reducers/Timer/Timer'
import {uniqueMaker} from '../utilities/uniqueMaker'
import {OFFLINE, ASK_HANDOVER, SOS_HANDOVER, UPDATE_LATE_COMER} from '../utilities/noticeTypes'

export default ({ dispatch, getState }) => (next) => (action) => {
  // Process only SOCKET:MESSAGE actions
  if (action.type !== socket.MESSAGE) return next(action)
  const state = getState()
  const { data, event } = action.payload
  switch (event) {
    case socket.OPENED:
      dispatch(Socket.open())
      break
    case socket.CLOSED:
      // dispatch(CurrentUser.currentUserChange())
      dispatch(membersChange([]))
      dispatch(SplashScreen.disconnected())
      dispatch(Socket.close())
      break
    case socket.NEW_USER:
      const cloneData = { ...data }
      data.language =
        (cloneData.titlesMap[cloneData.cf1] && cloneData.titlesMap[cloneData.cf1].code) || 'EN'

      dispatch(CurrentUser.add(data))
      dispatch(MediaSettings.setup())
      dispatch(Sip.ready())
      break
    case socket.FIRST_LINE_CALL:
      sip.queueCall(FIRST_LINE, data)
      break
    case socket.SECOND_LINE_CALL:
      sip.queueCall(SECOND_LINE, data)
      break
    case socket.FLOOR_LINE_CALL:
      sip.queueCall(FLOOR_LINE, data)
      break
     case socket.LOUNGE_LINE_CALL:
      sip.queueCall(LOUNGE_LINE, data)
      break
    case socket.ORATOR_LINE_CALL:
      sip.queueCall(ORATOR_LINE, data)
      break
    case socket.LANGB_LINE_CALL:
      sip.queueCall(LANGB_LINE, data)
      break
    case socket.PROFILE_UPDATE:
      dispatch(CurrentUser.currentUserUpdate(data))
      break
    case socket.MEMBER_ADD:
      dispatch(memberAdd(data))
      if (data.user.isModerator && state.currentUser.isModerator) {
        const { first, second } = state.currentUser.rooms
        if ([data.user.rooms.first, data.user.rooms.second].sort().join() === [first, second].sort().join()) {
          dispatch(Moderators.add(data))
        }
      }
      break
    case socket.MEMBER_DEL:
      dispatch(memberDel(data))
      dispatch(MembersOff.memberAdd(data))
      if (data.user.isModerator && state.currentUser.isModerator) {
        const { first, second } = state.currentUser.rooms
        if ([data.user.rooms.first, data.user.rooms.second].sort().join() === [first, second].sort().join()) {
          dispatch(Moderators.del(data))
        }
      }
      break
    case socket.MEMBER_UPDATE:
      dispatch(memberUpdate(data))
      break
    case socket.MEMBERS_CHANGE:
      dispatch(membersChange(data))
      if (state.currentUser.isModerator) {
        const { first, second } = state.currentUser.rooms
        const listModerator = uniqueMaker(data.filter(m => {
          return m.user.isModerator && [m.user.rooms.first, m.user.rooms.second].sort().join() === [first, second].sort().join()
        }), 'userId').map(m => ({
          userId: m.user.id,
          status: m.moderatorStatus,
        }))
        const haveAsk = listModerator.find(m => m.status == ASK_HANDOVER)
        const haveSOS = listModerator.find(m => m.status == SOS_HANDOVER)
        if (haveAsk || haveSOS) {
          dispatch(Moderators.updateLateComer({ data: { userId: haveAsk ? haveAsk.userId : haveSOS.userId, msg: haveAsk ? ASK_HANDOVER : SOS_HANDOVER }, currentUser: state.currentUser }))
        }
        dispatch(Moderators.change(listModerator))
      }
      break
    case socket.NOTIFY:
      console.log('received message', data)
      dispatch(Moderators.update({ data, currentUser: state.currentUser }))
      dispatch(Notice.show(data))
      break
    case socket.CLOSE_WINDOW:
      window.close()
      break
    case socket.ALL_ADJUSTMENTS:
      dispatch(Adjustments.change(data))
      break
    case socket.DISABLE_RECONNECT:
      window.WEBPHONE_DISABLE_RECONNECT = true
      break
    case socket.RECONNECT_USER:
      window.RECONNECT_USER = true
      break
    case socketTextchat.MESSAGES_CHANGE:
      dispatch(Messages.change(data))
      break
    case socketTextchat.MESSAGES_UPDATE_USER:
      dispatch(Messages.updateUser(data))
      break
    case socketTextchat.APP_LOADED:
      dispatch(TextchatApp.updateDeeplLangsSupport(data))
      break
    case socketTextchat.MESSAGES_ADD:
      const { meeting } = state
      const { meetings, meetingsOff } = meeting
      dispatch(Meeting.updateLatestMsgWhenNewMessage(data))
      dispatch(Messages.add(data))
      if (data.user.id == state.currentUser.id) {
        dispatch(TextchatApp.clearMsgUnread())
        dispatch(TextchatApp.scrollToBottomChat())
      }
      if (meeting && meeting.currentMeeting && meeting.currentMeeting.id != data.meeting.id) {
        dispatch(Notification.add({...data, noti_type: Notification.types.new_message, notiId: state.msgNotification.length + 1}))
      }
      if (meetingsOff.findIndex((mOff) => mOff.id == data.meeting.id) > -1) {
        dispatch(Meeting.removeMeetingOff(data.meeting))
      }
      break
    case socketTextchat.USER_CHANGE:
      break
    case socketTextchat.MEETINGS_ADD:
      if (state.currentUser.isModerator && data.type == 'Private') {
        dispatch(Meeting.updateCurrentMeeting(data))
        dispatch(App.updateSwitchChat(false))
        dispatch(App.scrollToChat())
      }
      if (
        data.type == 'Group' &&
        state.meeting &&
        state.meeting.currentMeeting &&
        state.meeting.currentMeeting.id == data.id
      ) {
        dispatch(Meeting.updateCurrentMeeting(data))
      }
      if ((data.type == "Private" || data.type == 'Group') && data.createdBy.id != state.currentUser.id && !state.meeting.meetings.find(({id}) => id == data.id)) {
        dispatch(Notification.add({...data, noti_type: Notification.types.added_to_a_meeting, notiId: state.msgNotification.length + 1}))
      }

      dispatch(Meeting.add(data))
      break
    case socketTextchat.DELETE_CHAT_SUCCESS:
      dispatch(Messages.deleteChatSuccess(data))
      dispatch(App.setLoading({status: false, message: socketTextchat.DELETE_CHAT_SUCCESS}))
      break
    case socketTextchat.DELETE_CHAT_FAILED:
      dispatch(Messages.deleteChatSuccess(data))
      dispatch(App.setLoading({status: false, message: socketTextchat.DELETE_CHAT_FAILED}))
      break
    case socketTextchat.REMOVE_USER:
      if (state.currentUser.id == data.user.id) {
        dispatch(Meeting.removeMeeting(data.meeting))
        dispatch(Meeting.updateCurrentMeeting(null))
        dispatch(Messages.deleteChatSuccess(data.meeting.id))
        dispatch(App.updateSwitchChat(true))
        break
      }
      dispatch(Meeting.removeUser(data))
      dispatch(App.setLoading({status: false, message: socketTextchat.REMOVE_USER}))
      break
  }
  socket.emit(event, data)
}
