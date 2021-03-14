import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as NotificationActions from '../../reducers/msgNotification'
import * as MeetingActions from '../../reducers/meeting'
import Item from './Item'
import { langGenerator } from '../../Languages/constant'
import { nameRefact } from '../../utilities/nameRefact'
import * as NotiStyles from './styles.scss'

class Toast extends Component {
  onToastSubmit = (msgId = null, meetingId = null, isNavigate = false, notiId) => () => {
    const { notificationActions, meetings, meetingActions, messages } = this.props
    notificationActions.remove(notiId)
    if (isNavigate) {
      const target = meetings.find((m) => m.id == meetingId)
      meetingActions.updateCurrentMeeting(target)
      if (msgId) { 
        const targetMsg = messages.find((m) => m.id == msgId)
        meetingActions.updateLatestMsg(targetMsg)
      }
    }
  }

  render() {
    const { notis, currentLang } = this.props

    return (
      <div className={NotiStyles["toasts-wrapper"]}>
        {/* <div style={{flex: 1}}></div> */}
        <div>
          {notis.map((noti) => {
            const { noti_type, id, meeting, user, text, notiId } = noti

            switch (noti_type) {
              case NotificationActions.types.added_to_a_meeting:
                return (
                  <Item
                    msgId={id}
                    key={id}
                    meetingId={id}
                    onSubmit={this.onToastSubmit(null, id, true, notiId)}
                    onDismiss={this.onToastSubmit(null, id, false, notiId)}
                    {...notis}
                  >
                    You have been added to a new conversation
                  </Item>
                )

              case NotificationActions.types.new_message:
              default:
                return (
                  <Item
                    msgId={id}
                    key={id}
                    meetingId={meeting.id}
                    onSubmit={this.onToastSubmit(id, meeting.id, true, notiId)}
                    onDismiss={this.onToastSubmit(id, meeting.id, false, notiId)}
                    {...notis}
                  >
                    {user.username.match(/^_ibp_techassist/) ? nameRefact(user.username) : user.username} &mdash; {text[langGenerator(currentLang)]}
                  </Item>
                )
            }
          }
          )}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  currentLang: state.currentUser.language,
  notis: state.msgNotification,
  meetings: state.meeting.meetings,
  messages: state.messages,
})

const mapDispatchToProps = (dispatch) => ({
  notificationActions: bindActionCreators(NotificationActions, dispatch),
  meetingActions: bindActionCreators(MeetingActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Toast)
