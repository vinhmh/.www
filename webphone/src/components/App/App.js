import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { object, func, array, bool } from 'prop-types'
import classnames from 'classnames'
import Socket from '../../socket'
import * as Sender from '../../socket/sender'
import { Sender as TextChatSender } from '../../socketTextchat'
import * as MembersActions from '../../reducers/members/reducer'
import * as CurrentUserActions from '../../reducers/currentUser/reducer'
import * as MediaSettingsActions from '../../reducers/mediaSettings/reducer'
import * as NoticeActions from '../../reducers/notice/reducer'
import * as MeetingActions from '../../reducers/meeting/reducer'
import * as AppActions from '../../reducers/app/reducer'
import * as ModeratorsActions from '../../reducers/moderators/reducer'
import GetParams from '../GetParams'
import SipControls from '../SipControls'
import Notice from '../Notice'
import ConferenceForm from '../ConferenceForm'
import CurrentOrator from '../CurrentOrator'
import UserControls from '../UserControls'
import MembersList from '../MembersList'
import TopNav from '../TopNav'
import SocketTextchat from '../../socketTextchat'
import SplashScreen from '../SplashScreen'
import MediaSettings from '../MediaSettings'
import TextChatScreen from '../TextChatScreen'
import SwitcherMembers from '../SwitcherMembers'
import JoinModale from '../JoinModale/JoinModale'
import Iframe from 'react-iframe'
import NavBarIBP from '../NavBarIBP/NavBarIBP'
import UserOratorInfo from '../UserOratorInfo/UserOratorInfo'
import WaveSoundVisualizer from '../WaveSoundVisualizer/WaveSoundVisualizer'
import AutomaticTranscription from '../AutomaticTranscription/AutomaticTranscription'
import MicroHandRaised from '../MicroHandRaised/MicroHandRaised'
import ConferenceUsersList from '../ConferenceUsersList/ConferenceUsersList'
import UsersListFilterByLang from '../UsersListFilterByLang/UsersListFilterByLang'
import ChatRoomHeader from '../ChatRoomHeader/ChatRoomHeader'
import ChatRoomItem from '../ChatRoomItem/ChatRoomItem'
import ListenLines from '../ListenLines/ListenLines'
import InterpreterWaveSound from '../InterpreterWaveSound/InterpreterWaveSound'
import InterpretersList from '../InterpretersList/InterpretersList'
import ModeratorLanguageSwitcher from '../ModeratorLanguageSwitcher/ModeratorLanguageSwitcher'
import ChatRoom from '../ChatRoom/ChatRoom'
import ModeratorControls from '../UserControls/ModeratorControls'
import css from './App.scss'
import { filterAllowToShow } from '../../utilities/filters'
import { uniqueMaker } from '../../utilities/uniqueMaker'
import translator from '../../utilities/translator'
import Toast from '../Toast/Toast'
import ModalWrapper from '../../HOCs/modalWrapper'
import { WORKING, START_TIME_USER } from '../../utilities/noticeTypes'
import { getDifferentTime } from '../../utilities/time'
import MuteIcon from '../Icons/MuteIcon'
import { toggleMuteApp } from '../../utilities/appMute'
import Timer from '../Timer/Timer'
import AudioHeader from '../AudioHeader/AudioHeader'
import { getOriginFileName } from '../../utilities/configFileName';
import browser from 'browser-detect';

import * as TextchatAppActions from '../../reducers/textchatApp/reducer'

const LANGUAGES_SUPPORT = ['EN', 'NL', 'FR', 'IT', 'PT', 'ES', 'PL', 'RU', 'DE']
let interpreterInterval = null
var totalSecond = 0
const randomItem = (items) => items[Math.floor(Math.random() * items.length)]
const orderMeeting = (meetings, currentUser) => {
  const meetingsClone = [...meetings]
  if (currentUser.isTechAssistant) return meetingsClone
  const techMeeting = meetingsClone.filter((m) => m.type == 'Technical')
  const meetingsWithoutTech = meetingsClone.filter((m) => m.type != 'Technical')
  if (!techMeeting.length) return meetingsClone
  return [...techMeeting, ...meetingsWithoutTech]
}

const departmentGenerator = (user) => {
  if (!user) return
  const { isTechAssistant, isModerator } = user
  switch (true) {
    case !!isTechAssistant:
      return 'technical'
    case !!isModerator:
      return 'moderator'
    default:
      return 'participant'
  }
}

const LEFT = 'L'
const RIGHT = 'R'

class App extends React.Component {
  state = {
    debugMode: false,
    showRelay: false,
    // switchChat: true,
    isMenuOpen: false,
    bbbWindow: null,
    isUnreadChat: false,
    isSpeakSide: false,
    distanceTimeStop: 0.0,
    timer: '00:00:00',
    multimediaOpen: false,
    audioView: true,
    tchatView: false,
    mediaView: false,
    checkcountMsg: 0
  }

  constructor(props) {
    super(props)
    this.messBtnRef = React.createRef()
    this.chatView = React.createRef()
    this.speakersView = React.createRef()
  }

  componentDidMount() {
    this.socketSubscribe()
    this.loadByParams()
    this.setCache()
    this.props.textchatAppActions.clearMsgUnread()
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.props.splashScreen.status == "LOADING" && prevProps.currentUser?.bbb != this.props.currentUser?.bbb) {
      this.setMultiMediaState(true)
    }
    this.updateCache()
    const { socketTextchatInit, currentUser, messages } = this.props
    if (prevProps.currentUser.id !== currentUser.id) {
      socketTextchatInit({
        lang: (currentUser.titlesMap[currentUser.cf1] && currentUser.titlesMap[currentUser.cf1].code) || 'EN',
        username: currentUser.usernameInput,
        meetingID: currentUser.meetingID,
        role: currentUser.role,
        currentUserId: currentUser.id,
        department: departmentGenerator(currentUser),
        speakRoomId: currentUser.cf1,
        hearRoomId: currentUser.cf2,
        languagesConfig: Object.values(currentUser.titlesMap),
      })
    }
    if (prevProps.messages.length !== messages.length) {
      this.setState({ isUnreadChat: true })
    }
    if (
      (prevProps.meeting.newTechnical && prevProps.meeting.newTechnical.id) !=
      (this.props.meeting.newTechnical && this.props.meeting.newTechnical.id) &&
      !this.props.currentUser.isTechAssistant
    ) {
      this.props.meetingActions.updateCurrentMeeting(this.props.meeting.newTechnical)
    }
    if (prevProps.app.scrollToChat != this.props.app.scrollToChat) {
      // this.chatView.current.scrollIntoView({ behavior: 'smooth' })
      this.messBtnRef.current.click()
    }
  }

  componentWillReceiveProps(nextProps) {
    if (
      (this.props.currentUser.bbb && this.props.currentUser.bbb.joinUrl) !==
      (nextProps.currentUser.bbb && nextProps.currentUser.bbb.joinUrl)
    ) {
      this.setState({ isMenuOpen: true })
    }

    if (
      this.props.currentUser.platformUrl &&
      this.props.currentUser.platformUrl !== nextProps.currentUser.platformUrl
    ) {
      this.setState({ isMenuOpen: true })
    }
  }

  componentWillUnmount() {
    localStorage.clear()
  }

  setCache() {
    // if (localStorage.getItem('isMenuOpen') === null) {
    //   localStorage.setItem('isMenuOpen', this.state.isMenuOpen)
    // } else
    //   this.setState({
    //     isMenuOpen: this.toBool(localStorage.getItem('isMenuOpen')),
    //   })
    // if (localStorage.getItem('bbbWindow') === null) {
    //   localStorage.setItem('bbbWindow', this.state.bbbWindow)
    // } else this.setState({ bbbWindow: localStorage.getItem('bbbWindow') })
  }

  updateCache() {
    // if (localStorage.getItem('bbbWindow') !== this.state.bbbWindow)
    //   localStorage.setItem('bbbWindow', this.state.bbbWindow)
    if (localStorage.getItem('isMenuOpen') !== this.state.isMenuOpen)
      localStorage.setItem('isMenuOpen', this.state.isMenuOpen)
  }

  getbbbWindowValue = (bbbWindow) => {
    this.setState({ bbbWindow })
  }

  toBool(string) {
    if (string === 'true') return true
    else return false
  }

  // removeSwipeDetection() {
  //   if (this.speakersView.current.event)
  // }

  // TODO: move to store and middleware
  socketSubscribe = () => {
    Socket.on(Socket.MAKE_RELAY, () => this.makeRelay())
  }

  /**
   * Get the URL parameters and initialise the connection to the server
   */
  loadByParams = () => {
    const data = GetParams()
    if (data.debug === 'true') {
      this.setState({ debugMode: true })
      return
    }
    this.initConnection(data)
  }

  onOpenBBB = (bbbWindow) => {
    this.setState({ bbbWindow })
  }

  /**
   * Init the connection with the server with the parameters available in the URL
   * @param {object} data
   */
  initConnection = (data) => {
    const { socketInit } = this.props
    socketInit(data)
  }

  makeRelay = () => {
    this.setState({ showRelay: true })
    const interval = setInterval(() => {
      const { showRelay } = this.state
      this.setState({ showRelay: !showRelay })
    }, 200)
    setTimeout(() => {
      clearInterval(interval)
      this.setState({ showRelay: false })
    }, 1000)
  }

  /**
   * Toggle the chat UI
   */
  handleChatRoomSwitch(meeting, latestMsg = null) {
    // const { switchChat } = this.props
    const { meetingActions, appActions } = this.props
    meetingActions.updateCurrentMeeting(meeting)
    meetingActions.updateLatestMsg(latestMsg)
    appActions.updateSwitchChat()
    this.setState({ isUnreadChat: false })
  }

  handleChatRoomSwitchWithTechnical = () => {
    // const { switchChat } = this.state
    const { members, currentUser, meeting, meetingActions, appActions } = this.props
    const { meetings, meetingsOff } = meeting
    const technicalChatInMeetings = meetings.find((m) => m.type == 'Technical')
    const technicalChatInMeetingsOff = meetingsOff.find((m) => m.type == 'Technical')

    const hasTechnicalChat = !!technicalChatInMeetings || !!technicalChatInMeetingsOff
    if (hasTechnicalChat) {
      if (!!technicalChatInMeetings) {
        meetingActions.updateCurrentMeeting(technicalChatInMeetings)
        meetingActions.removeMeetingOff(technicalChatInMeetings)
      }
      meetingActions.updateCurrentMeeting(technicalChatInMeetingsOff)
      meetingActions.removeMeetingOff(technicalChatInMeetingsOff)
      appActions.updateSwitchChat()
      return this.setState({ isUnreadChat: false })
    }
    const techListId = members.filter((m) => m.user.isTechAssistant).map((m) => m.userId)
    // const randomTechnical = randomItem(techList)
    TextChatSender.meetingNew({
      title: currentUser.meetingID,
      role: currentUser.role,
      createdById: currentUser.id,
      //  userInvitedId: [randomTechnical.user.id],
      userInvitedId: techListId,
      meetingType: 'Technical',
      meetingHash:
        meeting && meeting.currentMeeting && meeting.currentMeeting.hash ? meeting.currentMeeting.hash : null,
    })
    appActions.updateSwitchChat()
    this.setState({ isUnreadChat: false })
  }

  toggleMenu() {
    const { isMenuOpen } = this.state
    this.setState((prevState) => ({ isMenuOpen: !prevState.isMenuOpen }))
  }

  renderDevContent = () => {
    const { debugMode } = this.state
    const { currentUser, socket } = this.props
    if (!debugMode) return null
    return (
      <div>
        {!socket.active && <ConferenceForm initConnection={this.initConnection} />}
        <br />
        <SipControls user={currentUser} socket={socket} makeCall={this.makeCall} />
      </div>
    )
  }

  /**
   * Renders the content of the conference on site
   */
  renderSwitcherContent = () => {
    const { bbbWindow } = this.state
    const { currentUser, mediaSettings, socket } = this.props

    const showContent = socket.active && currentUser.registered
    if (!showContent) return null
    return (
      <div className={css.contentBox}>
        <TopNav bbbWindow={bbbWindow} />
        <SwitcherMembers user={currentUser} />
        {mediaSettings.show && <MediaSettings />}
        <div className={css.logo} />
      </div>
    )
  }

  renderHelpOverlay = () => {
    const { mediaSettingsActions } = this.props
    const onClick = () => mediaSettingsActions.showHelp(false)
    return <div className={css.helpOverlay} onClick={onClick} />
  }

  onToggleHear = () => {
    const { appActions } = this.props
    let isMuted = toggleMuteApp();
    appActions.setMute(isMuted)
  }

  hearBtn = () => {
    const { appMuted } = this.props.app;
    const { currentUser } = this.props;
    return (
      <button type="button" className={'btn ' + ' ' + css.noOutline + ' ' + css.hearBtn} onClick={() => this.onToggleHear()}>
        {appMuted ?
          <svg className={css.svgIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" clipRule="evenodd" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2" />
          </svg>
        :
          <svg className={css.svgIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        }
      </button>
    )
  }

  messbtn = () => {
    let countMsg = 0
    const {currentUser} = this.props
    const {meetings , meetingsOff} = this.props.meeting
    const activeMeetings = meetings.filter((m) => meetingsOff.findIndex((mOff) => mOff.id == m.id) == -1)
    const filterMessOfMeeting =  orderMeeting(activeMeetings,currentUser).map(singleMeeting => {
      const currentMessages = this.props.messages.filter(({ meeting: { id } }) => id == singleMeeting.id)
      if(singleMeeting.latestMsg == undefined){
        return currentMessages.length
      }
      if (currentMessages.length) {
        currentMessages.forEach(mess => {
          if (singleMeeting.latestMsg && singleMeeting.latestMsg.id < mess.id) {
            countMsg++
          }
        });
      }
      return countMsg
    })
    const allMessUnRead = filterMessOfMeeting.reduce((a,b) => {
      return a + b
    },0)
    return (
      <button
        ref={this.messBtnRef}
        type="button"
        className={`btn ${css.menuBtn} ${css.noOutline} ${css.notification}`}
        onClick={() => this.chatView.current.scrollIntoView({ behavior: 'smooth' })}
      >
        <svg className={css.svgIcon} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
        </svg>
        <span className={allMessUnRead > 0 && css.badge}>{allMessUnRead > 0 && allMessUnRead}</span>
      </button>
    )
  }

  messbtnSpeak = () => {
    const { appActions, meeting } = this.props
    return (
      <button
        type="button"
        className={`btn ${css.menuBtn} ${css.noOutline}`}
        onClick={() => {
          appActions.updateSwitchChat(true)
          this.speakersView.current.scrollIntoView({ behavior: 'smooth' })
        }}
      >
        {/* <img src="assets/images/headphones.svg" alt="mute" width="30" height="30" /> */}

        <div className="flex-center">
          <svg className={css.svgIconMin} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
          |
          <svg className={css.svgIconMin} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
          </svg>
        </div>

      </button>
    )
  }

  // Application render
  renderContent = () => {
    const { showRelay, isMenuOpen, bbbWindow } = this.state
    const {
      switchChat,
      adjustments,
      app,
      appActions,
      currentUser,
      currentUserActions,
      mediaSettings,
      mediaSettingsActions,
      members,
      notice,
      noticeActions,
      socket,
      currentUserLanguage,
      messages,
      meeting,
      moderators,
      moderatorsActions,
    } = this.props
    const { currentUserUpdate } = currentUserActions
    const { meetings, meetingsOff } = meeting
    const activeMeetings = meetings.filter((m) => meetingsOff.findIndex((mOff) => mOff.id == m.id) == -1)
    const showContent = socket.active && currentUser.registered
    const finalLanguage =
      LANGUAGES_SUPPORT.findIndex((sl) => sl == currentUserLanguage) > -1 ? currentUserLanguage : 'EN'
    const technicalChatConfig = () => {
      const technicalMeetingIndex = meeting.meetings.findIndex((m) => m.type == 'Technical')
      const technicalMeetingIndexInMeetingsOff = meetingsOff.findIndex((m) => m.type == 'Technical')
      if (technicalMeetingIndex != -1 || technicalMeetingIndexInMeetingsOff != -1) return true
      if (technicalMeetingIndex == -1 || technicalMeetingIndexInMeetingsOff > -1) return false
      const userIdsMeeting = meeting.meetings.find((m) => m.type == 'Technical').title.split(',')
      let technicalId = null
      for (const id of userIdsMeeting) {
        const user = members.find((m) => m.user.id == id)
        if (user && user.user && user.user.isTechAssistant) {
          technicalId = true
        }
      }
      //  const technicalHasOnline = members.findIndex(m => m.user.id == technicalId)
      if (technicalId) return true
      return false
    }

    if (!showContent) return null
    const currentInterpreter = moderators.members.find((interpreter, index) => interpreter.userId == this.props.members[index]?.user?.id)
    const isInterpreting = currentInterpreter && currentInterpreter.status == WORKING

    const result = browser();

    if (result.mobile) {
      return (
        // Mobile version
        <div>
          <Notice notice={notice} noticeActions={noticeActions} />
          {!!isMenuOpen && (
            <JoinModale
              onJoinMeetingMenu={() => this.toggleMenu()}
              currentUserUpdate={currentUserUpdate}
              user={currentUser}
              mediaSettings={mediaSettings}
              mediaSettingsActions={mediaSettingsActions}
            />
          )}

            <div className={css.mobileView}>
              <div className={css.switchableViews}>
                <div className={css.view} id="audio" style={ this.state.audioView ? null : {display: 'none'}}>
                  <div className={classnames(css.speakersContainer)} ref={this.speakersView} >
                    <AudioHeader
                      appCSS={css}
                      menuTogglerHandler={() => this.toggleMenu()}
                      currentUser={currentUser}
                      user={currentUser}
                      messBtnHandler={this.messbtn()}
                    />
                    <UserOratorInfo
                      adjustments={adjustments}
                      user={currentUser}
                      members={members}
                      currentUserUpdate={currentUserUpdate}
                      noticeActions={noticeActions}
                      mediaSettings={mediaSettings}
                      mediaSettingsActions={mediaSettingsActions}
                    />
                    <WaveSoundVisualizer notice={notice} brokenWave={true} />
                    {currentUser.isModerator ? (
                      <React.Fragment>
                        <InterpreterWaveSound adjustments={adjustments} user={currentUser} members={members} />
                        <ListenLines
                          adjustments={adjustments}
                          user={currentUser}
                          mediaSettings={mediaSettings}
                          members={members}
                          mediaSettingsActions={mediaSettingsActions}
                        />
                        <ModeratorLanguageSwitcher
                          appActions={appActions}
                          appMuted={app.appMuted}
                          user={currentUser}
                          members={members}
                          currentUserUpdate={currentUserUpdate}
                          noticeActions={noticeActions}
                        />
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <InterpreterWaveSound />
                        {/* <AutomaticTranscription /> */}
                      </React.Fragment>
                    )}
                    {!currentUser.isModerator ? (
                      <MicroHandRaised
                        appActions={appActions}
                        appMuted={app.appMuted}
                        adjustments={adjustments}
                        user={currentUser}
                        members={members}
                        currentUserUpdate={currentUserUpdate}
                        noticeActions={noticeActions}
                        mediaSettings={mediaSettings}
                        mediaSettingsActions={mediaSettingsActions}
                        timer={this.state.timer}
                        hearBtnHandler={this.hearBtn()}
                      />
                    ) : (
                      ''
                    )}
                    {currentUser.isModerator ? (
                      <React.Fragment>
                        <ModeratorControls
                          user={currentUser}
                          members={members}
                          mediaSettings={mediaSettings}
                          mediaSettingsActions={mediaSettingsActions}
                          currentUserUpdate={currentUserUpdate}
                          noticeActions={noticeActions}
                          notice={notice}
                          showRelay={showRelay}
                          moderators={moderators}
                          moderatorsActions={moderatorsActions}
                        />
                        <InterpretersList adjustments={adjustments} user={currentUser} members={members} />
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <ConferenceUsersList adjustments={adjustments} user={currentUser} members={members} />
                        {currentUser.isTechAssistant && (
                          <InterpretersList adjustments={adjustments} user={currentUser} members={members} />
                        )}
                        <UsersListFilterByLang
                          adjustments={adjustments}
                          user={currentUser}
                          members={members.filter(filterAllowToShow(currentUser))}
                        />
                      </React.Fragment>
                    )}
                  </div>
                </div>
                <div className={css.view} id="tchat" style={ this.state.tchatView ? null : {display: 'none'}}>
                  <div className={classnames(css.chatContainer)} ref={this.chatView} style={this.state.multimediaOpen ? null : { width: '100%' }}>
                    <ChatRoomHeader
                      btnspeakClass={css.mobile}
                      btnSpeak={this.messbtnSpeak()}
                      />
                    {/** Chat Room Items */}
                    {switchChat ? (
                      <React.Fragment>
                        {/** Technical chat */}
                        {
                          // currentUser.isModerator ||
                          currentUser.isTechAssistant ||
                          members.findIndex((m) => m.user.isTechAssistant) == -1 ||
                          technicalChatConfig() ? (
                            // (meeting.meetings.findIndex(m => m.type == 'Technical') > -1 )
                            ''
                          ) : (
                            <div onClick={this.handleChatRoomSwitchWithTechnical} className={css.technicalContainer}>
                              <div className={css.technicalChatContainer}>
                                {/* <img
                                  className={css.technicChatIcon}
                                  src={'assets/images/chat_technique.svg'}
                                  alt="technic chat icon"
                                  width="30"
                                  height="30"
                                /> */}
                                <p className={css.technicalChatTitle}>{translator('chat_technical', currentUser.language)}</p>
                              </div>
                              <p className={css.technicalChatInfo}>{translator('support_title', currentUser.language)}</p>
                              <div className={css.bottomGreyBar}></div>
                            </div>
                          )
                        }
                        <div className={css.chatItemsContainer}>
                          {orderMeeting(activeMeetings, currentUser).map((singleMeeting) => {
                            const currentMessages = messages.filter(({ meeting: { id } }) => id == singleMeeting.id)
                            // const titleGenerator = (membersArr = []) => {
                            //   const filteredUser = uniqueMaker(
                            //     members.filter((m) => membersArr.findIndex((id) => id == m.user.id) > -1 && m.user.isTechAssistant),
                            //     'userId',
                            //   )
                            //   return (
                            //     filteredUser
                            //       // .filter((u) => u.user.id != currentUser.id)
                            //       .map((m) => m.user.displayName).length
                            //   )
                            // }
                            // if (singleMeeting.type == 'Technical' && titleGenerator(singleMeeting.title.split(',')) == 0) {
                            //   // this.props.meetingActions.deleteMeeting(singleMeeting)
                            //   return null
                            // }

                            return (
                              <React.Fragment key={singleMeeting.id}>
                                <ChatRoomItem
                                  // title={singleMeeting.type == 'TechnicalPublic' ? translator('chat_general_technical', currentUser.language) :
                                  //   singleMeeting.title == 'Demo'
                                  //     ? translator('chat_general', currentUser.language)
                                  //     : titleGenerator(singleMeeting.title.split(','))
                                  // }
                                  latestMsg={
                                    currentMessages[currentMessages.length - 1] && currentMessages[currentMessages.length - 1]
                                  }
                                  message={
                                    currentMessages.length !== 0
                                      ? currentMessages[currentMessages.length - 1] &&
                                        currentMessages[currentMessages.length - 1].text[finalLanguage]
                                      : translator('chat_init', currentUser.language)
                                  }
                                  defaultMessage={translator('chat_init', currentUser.language)}
                                  onHandleChatRoomSwitch={() =>
                                    this.handleChatRoomSwitch(
                                      singleMeeting,
                                      currentMessages.length !== 0
                                        ? currentMessages[currentMessages.length - 1] &&
                                            currentMessages[currentMessages.length - 1]
                                        : null,
                                    )
                                  }
                                  isUnread={
                                    (currentMessages.length !== 0 &&
                                      currentMessages[currentMessages.length - 1] &&
                                      currentMessages[currentMessages.length - 1].id) !=
                                    (singleMeeting.latestMsg && singleMeeting.latestMsg.id)
                                  }
                                  meeting={meeting}
                                  isTechnicalChat={singleMeeting.type == 'Technical'}
                                  meetingFocus={singleMeeting}
                                  language={currentUser.language}
                                  currentMessages={currentMessages}
                                  isTechAssistant={currentUser.isTechAssistant}
                                />
                              </React.Fragment>
                            )
                          })}
                        </div>
                      </React.Fragment>
                    ) : (
                      <ChatRoom onHandleChatRoomSwitch={() => this.handleChatRoomSwitch()} />
                    )}
                  </div>

                </div>
                { this.props.currentUser.bbb.joinUrl || this.props.currentUser?.platformUrl  ?
                  <div className={css.view} id="media" style={ this.state.mediaView ? null : {display: 'none'}}>
                    <Iframe
                      className={css.bbbIframe}
                      allow="camera;microphone"
                      src={this.props.currentUser?.platformUrl ? this.props.currentUser?.platformUrl : this.props.currentUser.bbb.joinUrl}
                      sandbox="allow-same-origin allow-top-navigation allow-scripts"
                    />
                  </div>
                  : null }
              </div>
              <div className={css.bottomNav}>
                <button className={css.navBtnDouble} id="audioBtn" onClick={() => this.toggleSwitchView('audio')}>
                    <svg className={css.svgIconMenu} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                    </svg>
                    |
                    <svg className={css.svgIconMenu} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
                    </svg>
                </button>
                <button className={css.navBtn} id="tchatBtn" onClick={() => this.toggleSwitchView('tchat')}>
                  <svg className={css.svgIconMenu} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </button>
                {this.props.currentUser.bbb.joinUrl || this.props.currentUser?.platformUrl   ?
                <button className={css.navBtn} id="mediaBtn" onClick={() => this.toggleSwitchView('media')}>
                  <svg className={css.svgIconMenu} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </button>
                : null }
              </div>
            </div>
        </div>
      )
    } else {
      return (
            // Desktop version
            <div className={css.contentBox + ' ' + css.bgContent}>
              <div className={css.App} style={this.state.multimediaOpen ? null : { width: '100%', height: '100vh' }}>
                {/* {mediaSettings.showHelp && this.renderHelpOverlay()} */}
                <Notice notice={notice} noticeActions={noticeActions} />
                {!!isMenuOpen && (
                  <JoinModale
                    onJoinMeetingMenu={() => this.toggleMenu()}
                    currentUserUpdate={currentUserUpdate}
                    user={currentUser}
                    mediaSettings={mediaSettings}
                    mediaSettingsActions={mediaSettingsActions}
                  />
                )}
                <div className={css.ibpContainer}>
                  <div className={classnames(css.speakersContainer)} ref={this.speakersView} >
                    <AudioHeader
                      appCSS={css}
                      menuTogglerHandler={() => this.toggleMenu()}
                      currentUser={currentUser}
                      user={currentUser}
                      // hearBtnHandler={this.hearBtn()}
                      messBtnHandler={this.messbtn()}
                    />
                    <UserOratorInfo
                      adjustments={adjustments}
                      user={currentUser}
                      members={members}
                      currentUserUpdate={currentUserUpdate}
                      noticeActions={noticeActions}
                      mediaSettings={mediaSettings}
                      mediaSettingsActions={mediaSettingsActions}
                    />
                    <WaveSoundVisualizer notice={notice} brokenWave={true} />
                    {currentUser.isModerator ? (
                      <React.Fragment>
                        <InterpreterWaveSound adjustments={adjustments} user={currentUser} members={members} />
                        <ListenLines
                          adjustments={adjustments}
                          user={currentUser}
                          mediaSettings={mediaSettings}
                          members={members}
                          mediaSettingsActions={mediaSettingsActions}
                        />
                        <ModeratorLanguageSwitcher
                          appActions={appActions}
                          appMuted={app.appMuted}
                          user={currentUser}
                          members={members}
                          currentUserUpdate={currentUserUpdate}
                          noticeActions={noticeActions}
                          />
                        </React.Fragment>
                      ) : (
                          <React.Fragment>
                            <InterpreterWaveSound />
                            {/* <AutomaticTranscription /> */}
                          </React.Fragment>
                        )}
                      {!currentUser.isModerator ? (
                        <MicroHandRaised
                          appActions={appActions}
                          appMuted={app.appMuted}
                          adjustments={adjustments}
                          user={currentUser}
                          members={members}
                          currentUserUpdate={currentUserUpdate}
                          noticeActions={noticeActions}
                          mediaSettings={mediaSettings}
                          mediaSettingsActions={mediaSettingsActions}
                          timer={this.state.timer}
                          hearBtnHandler={this.hearBtn()}
                        />
                      ) : (
                          ''
                        )}
                      {currentUser.isModerator ? (
                        <React.Fragment>
                          <ModeratorControls
                          user={currentUser}
                          members={members}
                          mediaSettings={mediaSettings}
                          mediaSettingsActions={mediaSettingsActions}
                          currentUserUpdate={currentUserUpdate}
                          noticeActions={noticeActions}
                          notice={notice}
                          showRelay={showRelay}
                          moderators={moderators}
                          moderatorsActions={moderatorsActions}
                        />
                        <InterpretersList adjustments={adjustments} user={currentUser} members={members} />
                      </React.Fragment>
                    ) : (
                      <React.Fragment>
                        <ConferenceUsersList adjustments={adjustments} user={currentUser} members={members} />
                        {currentUser.isTechAssistant && (
                          <InterpretersList adjustments={adjustments} user={currentUser} members={members} />
                        )}
                        <UsersListFilterByLang
                          adjustments={adjustments}
                          user={currentUser}
                          members={members.filter(filterAllowToShow(currentUser))}
                        />
                      </React.Fragment>
                    )}
                  </div>


                  <div className={classnames(css.chatContainer)} ref={this.chatView} style={this.state.multimediaOpen ? null : { width: '100%' }}>
                    {/* <div className={css.mobile}>{this.messbtnSpeak()}</div> */}
                    <ChatRoomHeader
                      btnspeakClass={css.mobile}
                      btnSpeak={this.messbtnSpeak()}/>
                    {/** Chat Room Items */}
                    {switchChat ? (
                      <React.Fragment>
                        {/** Technical chat */}
                        {
                          // currentUser.isModerator ||
                          currentUser.isTechAssistant ||
                          members.findIndex((m) => m.user.isTechAssistant) == -1 ||
                          technicalChatConfig() ? (
                            // (meeting.meetings.findIndex(m => m.type == 'Technical') > -1 )
                            ''
                          ) : (
                            <div onClick={this.handleChatRoomSwitchWithTechnical} className={css.technicalContainer}>
                              <div className={css.technicalChatContainer}>
                                {/* <img
                                  className={css.technicChatIcon}
                                  src={'assets/images/chat_technique.svg'}
                                  alt="technic chat icon"
                                  width="30"
                                  height="30"
                                /> */}
                                <p className={css.technicalChatTitle}>{translator('chat_technical', currentUser.language)}</p>
                              </div>
                              <p className={css.technicalChatInfo}>{translator('support_title', currentUser.language)}</p>
                              <div className={css.bottomGreyBar}></div>
                            </div>
                          )
                        }
                        <div className={css.chatItemsContainer}>
                          {orderMeeting(activeMeetings, currentUser).map((singleMeeting) => {
                            const currentMessages = messages.filter(({ meeting: { id } }) => id == singleMeeting.id)
                            // const titleGenerator = (membersArr = []) => {
                            //   const filteredUser = uniqueMaker(
                            //     members.filter((m) => membersArr.findIndex((id) => id == m.user.id) > -1 && m.user.isTechAssistant),
                            //     'userId',
                            //   )
                            //   return (
                            //     filteredUser
                            //       // .filter((u) => u.user.id != currentUser.id)
                            //       .map((m) => m.user.displayName).length
                            //   )
                            // }
                            // if (singleMeeting.type == 'Technical' && titleGenerator(singleMeeting.title.split(',')) == 0) {
                            //   // this.props.meetingActions.deleteMeeting(singleMeeting)
                            //   return null
                            // }

                            return (
                              <React.Fragment key={singleMeeting.id}>
                                <ChatRoomItem
                                  // title={singleMeeting.type == 'TechnicalPublic' ? translator('chat_general_technical', currentUser.language) :
                                  //   singleMeeting.title == 'Demo'
                                  //     ? translator('chat_general', currentUser.language)
                                  //     : titleGenerator(singleMeeting.title.split(','))
                                  // }
                                  latestMsg={
                                    currentMessages[currentMessages.length - 1] && currentMessages[currentMessages.length - 1]
                                  }
                                  message={
                                    currentMessages.length !== 0
                                      ? currentMessages[currentMessages.length - 1] &&
                                        currentMessages[currentMessages.length - 1].text[finalLanguage]
                                      : translator('chat_init', currentUser.language)
                                  }
                                  defaultMessage={translator('chat_init', currentUser.language)}
                                  onHandleChatRoomSwitch={() =>
                                    this.handleChatRoomSwitch(
                                      singleMeeting,
                                      currentMessages.length !== 0
                                        ? currentMessages[currentMessages.length - 1] &&
                                            currentMessages[currentMessages.length - 1]
                                        : null,
                                    )
                                  }
                                  isUnread={
                                    (currentMessages.length !== 0 &&
                                      currentMessages[currentMessages.length - 1] &&
                                      currentMessages[currentMessages.length - 1].id) !=
                                    (singleMeeting.latestMsg && singleMeeting.latestMsg.id)
                                  }
                                  meeting={meeting}
                                  isTechnicalChat={singleMeeting.type == 'Technical'}
                                  meetingFocus={singleMeeting}
                                  language={currentUser.language}
                                  currentMessages={currentMessages}
                                  isTechAssistant={currentUser.isTechAssistant}
                                />
                              </React.Fragment>
                            )
                          })}
                        </div>
                      </React.Fragment>
                    ) : (
                      <ChatRoom onHandleChatRoomSwitch={() => this.handleChatRoomSwitch()} />
                    )}
                  </div>

                {/* TOTO */}
                </div>


              </div>
              {this.state.multimediaOpen && (this.props.currentUser.bbb.joinUrl || this.props.currentUser?.platformUrl) ?
                <>
                  <Iframe
                    className={css.bbbIframe}
                    allow="camera;microphone"
                    src={this.props.currentUser?.platformUrl ? this.props.currentUser?.platformUrl : this.props.currentUser.bbb.joinUrl}
                    sandbox="allow-same-origin allow-top-navigation allow-scripts"
                  />
                  <span
                    className={css.mediaBtn}
                    onClick={()=> this.setMultiMediaState(!this.state.multimediaOpen)}
                  >
                    x
                  </span>
                </>
              :
                this.props.currentUser?.bbb?.joinUrl || this.props.currentUser?.platformUrl ?
                  <span
                  className={css.mediaBtnOpen}
                  onClick={()=> this.setMultiMediaState(!this.state.multimediaOpen)}
                  >
                    <svg className={css.videoSvg} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </span>
                  : null
              }
            </div>
      )
    }
  }

  toggleSwitchView = (view) => {
    switch (view) {
      case "audio":
        this.setState({...this.state, audioView: true, tchatView: false, mediaView: false})
        break;
      case "tchat":
        this.setState({...this.state, audioView: false, tchatView: true, mediaView: false})
        break;
      case "media":
        this.setState({...this.state, audioView: false, tchatView: false, mediaView: true})
        break;
    }
  }

  setMultiMediaState = (bool) => {
    if (bool === true && !(this.props.currentUser?.bbb?.joinUrl|| this.props.currentUser?.platformUrl)) {
      this.setState({...this.state, multimediaOpen: false});
      this.resizeWindow(bool)
    } else {
      this.setState({...this.state, multimediaOpen: bool});
      this.resizeWindow(bool)
    }
  }

  resizeWindow = (arg) => {
    const result = browser();
    if (arg === true && (this.props.currentUser?.bbb?.joinUrl || this.props.currentUser?.platformUrl)) {
      window.resizeTo(screen.width-((screen.width*15)/100), screen.height-((screen.height*15)/100));
    } else {
      window.resizeTo(400, screen.height-((screen.height*15)/100));
    }
  }

  render() {
    const { socketInit, splashScreen, currentUser, app } = this.props
    const { debugMode } = this.state
    const devContent = this.renderDevContent()
    let content

    if (currentUser.isSwitcher) {
      content = this.renderSwitcherContent()
    } else if (splashScreen.status || !currentUser.connected) {
      content = <SplashScreen socketInit={socketInit} />
    } else {
      content = this.renderContent()
    }
    // let switcher = this.renderSwitcherContent(); // for dev purpose
    // const currentInterpreter = this.props.moderators.members.find((interpreter,index) => interpreter.userId == this.props.members[index].user.id)
    // const isInterpreting = currentInterpreter && currentInterpreter.status == WORKING
    return (
      <div>
        {debugMode ? devContent : ''}
        <div>{content}</div>
        {/* <div>{switcher}</div> */}
      </div>
    )
  }
}

App.propTypes = {
  adjustments: object.isRequired,
  app: object.isRequired,
  currentUser: object.isRequired,
  currentUserActions: object.isRequired,
  mediaSettings: object.isRequired,
  mediaSettingsActions: object.isRequired,
  members: array.isRequired,
  notice: object.isRequired,
  noticeActions: object.isRequired,
  socket: object.isRequired,
  socketInit: func.isRequired,
  splashScreen: object.isRequired,
}

const mapStateToProps = (state) => ({
  switchChat: state.app.switchChat,
  adjustments: state.adjustments,
  app: state.app,
  currentUser: state.currentUser,
  mediaSettings: state.mediaSettings,
  members: state.members,
  notice: state.notice,
  socket: state.socket,
  splashScreen: state.splashScreen,
  meeting: state.meeting,
  messages: state.messages,
  currentUserLanguage: state.currentUser.language,
  moderators: state.moderators,
  textchatApp: state.textchatApp
})

const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(AppActions, dispatch),
  membersActions: bindActionCreators(MembersActions, dispatch),
  currentUserActions: bindActionCreators(CurrentUserActions, dispatch),
  mediaSettingsActions: bindActionCreators(MediaSettingsActions, dispatch),
  noticeActions: bindActionCreators(NoticeActions, dispatch),
  socketInit: (data) => Socket.init(dispatch, data),
  socketTextchatInit: (data) => SocketTextchat.init(dispatch, data),
  meetingActions: bindActionCreators(MeetingActions, dispatch),
  moderatorsActions: bindActionCreators(ModeratorsActions, dispatch),
  textchatAppActions: bindActionCreators(TextchatAppActions, dispatch),
})

export default ModalWrapper(connect(mapStateToProps, mapDispatchToProps)(App))
