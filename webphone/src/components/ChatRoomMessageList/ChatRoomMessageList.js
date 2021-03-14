import React, { Fragment } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import classnames from 'classnames'
import css from './ChatRoomMessageList.scss'
import translator from '../../utilities/translator'
import { formatTimestamp } from '../../utilities/formatTimestamp'
import { nameRefact } from '../../utilities/nameRefact'
import Message from './Message'
import * as TextchatAppActions from '../../reducers/textchatApp'


const ucFirst = (str) => str.charAt(0).toUpperCase() + str.slice(1)
class ChatRoomMessageList extends React.Component {
  constructor(props) {
    super(props)
    this.messagesEnd = React.createRef()
    this.messagesWrapper = React.createRef()
  }

  state = {
    scrolledDistance: 0,
  }

  componentDidMount() {
    this.messagesWrapper.current.addEventListener('scroll', this.handleScroll)
    this.messagesEnd.current.focus()
    this.props.textchatAppActions.clearMsgUnread()
    // this.scrollToBottom()
  }

  componentWillUnmount() {
    this.messagesWrapper.current.removeEventListener('scroll', this.handleScroll)
  }

  handleScroll = () => {
    const { clientHeight, scrollHeight, scrollTop } = this.messagesWrapper.current
    this.setState({ scrolledDistance: scrollTop + clientHeight })
  }

  scrollToBottom = () => {
    const scrollHeight = this.messagesWrapper.current.scrollHeight
    const clientHeight = this.messagesWrapper.current.clientHeight
    if (scrollHeight > clientHeight) {
      this.messagesEnd.current.scrollIntoView({ behavior: 'smooth' })
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevProps.scrollToBottomChat != this.props.scrollToBottomChat) {
      this.scrollToBottom()
    }
  }

  render() {
    const {
      currentUser,
      messages,
      currentUserLanguage,
      members,
      meeting,
      membersOff,
      msgFromTo,
      unreadMsgCounter,
    } = this.props
    const messagesClone = [...messages]
    const targetMsgIndex = msgFromTo ? messages.findIndex((m) => m.id == msgFromTo.id) : -1
    const finalMessages = targetMsgIndex > -1 ? messagesClone.slice(targetMsgIndex + 1) : messagesClone
    return (
      <div className={css.chatRoomMessageListContainer} ref={this.messagesWrapper}>
        {finalMessages.map((m) => {
          const receivedAt = formatTimestamp(m.createdAt)
          const usernameGenerator = () => {
            if (meeting.currentMeeting && meeting.currentMeeting.type == 'Technical') {
              if (currentUser.isTechAssistant) {
                if (m.user.department == 'technical')
                  return m.user.username
                    .split('_')
                    .map((name) => ucFirst(name))
                    .join(' ')
                if (m.user.department == 'system') return translator('auto_technical', currentUserLanguage)
                return nameRefact(m.user.username)
              }
              if (m.user.id == currentUser.id) return nameRefact(m.user.username)
              return translator('technical_username', currentUserLanguage)
            }
            if (meeting.currentMeeting && meeting.currentMeeting.type == 'TechnicalPublic') {
              return m.user.username
                .split('_')
                .map((name) => ucFirst(name))
                .join(' ')
            }
            if (meeting.currentMeeting && meeting.currentMeeting.type == 'Public') {
              if (currentUser.isTechAssistant) {
                if (m.user.department != 'technical') return m.user.username
                return m.user.username
                  .split('_')
                  .map((name) => ucFirst(name))
                  .join(' ')
              }
              if (m.user.department == 'technical') return translator('technical_username', currentUserLanguage)
              return nameRefact(m.user.username)
            }
            return nameRefact(m.user.username)
          }
          // console.log('solo', this.messagesWrapper.current && (this.messagesWrapper.current.scrollHeight == this.messagesWrapper.current.clientHeight))
          return (
            <Fragment key={m.id}>
              <Message
                currentUser={currentUser}
                username={usernameGenerator()}
                content={m.text[currentUserLanguage] ? m.text[currentUserLanguage] : m.text.EN}
                receivedAt={receivedAt}
                urlFile = {m.file}
                m={m}
                parentEntireHeight={this.messagesWrapper.current && this.messagesWrapper.current.scrollHeight}
                scrolledHeight={this.state.scrolledDistance}
                haveScroll={
                  this.messagesWrapper.current &&
                  this.messagesWrapper.current.scrollHeight == this.messagesWrapper.current.clientHeight
                }
              />
            </Fragment>
            // <div
            //   className={classnames({
            //     [css.currentUser]: currentUser.id === m.user.id,
            //     [css.messageWrapper]: true,
            //   })}
            //   key={m.id}
            //   id={m.id}
            // >
            //   <div className={css.username}>{usernameGenerator()}</div>
            //   <div className={css.message}>{m.text[currentUserLanguage] ? m.text[currentUserLanguage] : m.text.EN}</div>
            //   <div className={css.receivedAt}>{receivedAt}</div>
            // </div>
          )
        })}
        {/* {!!unreadMsgCounter && (
          <div style={{ position: 'absolute' }}>
            <BadgeButton count={unreadMsgCounter} />
          </div>
        )} */}

        <div style={{ float: 'left', clear: 'both' }} tabIndex="-1" ref={this.messagesEnd} />
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  currentUserLanguage: state.currentUser.language,
  members: state.members,
  membersOff: state.membersOff,
  unreadMsgCounter: state.textchatApp.msgUnreadCounter,
  scrollToBottomChat: state.textchatApp.scrollToBottomChat,
})

const mapDispatchToProps = (dispatch) => ({
  textchatAppActions: bindActionCreators(TextchatAppActions, dispatch)
})

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomMessageList)
