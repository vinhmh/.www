import React from 'react'
import { connect } from 'react-redux'
import Title from '../ConversationTitle'
import * as NotiStyles from './styles.scss'

const DEFAULT_TIMING = 5000

const Item = ({ children, onDismiss, onSubmit, msgId, meetingId, meetings }) => {
  const dismissTiming = () => {
    setTimeout(() => {
      onDismiss(msgId)
    }, DEFAULT_TIMING)
  }

  const meetingFocus = meetings.find((m) => m.id == meetingId)

  return (
    <div className="toast show" role="alert" aria-live="assertive" aria-atomic="true">
      <div className="toast-header">
        <div style={{ cursor: 'pointer', color: "#919191", fontWeight:"bold" }} onClick={onSubmit} className="mr-auto">
          <Title meetingFocus={meetingFocus} />
        </div>
        {/* <small>11 mins ago</small> */}
        <button
          onClick={onDismiss}
          type="button"
          className="ml-2 mb-1 close"
          data-dismiss="toast"
          aria-label="Close"
        >
          <span aria-hidden="true">&times;</span>
        </button>
      </div>
      <div className={`toast-body ${NotiStyles["toast-body"]}`}>
        {dismissTiming()}
        {children}
      </div>
    </div>
  )
}
const mapStateToProps = (state) => ({
  meetings: state.meeting.meetings,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Item)
