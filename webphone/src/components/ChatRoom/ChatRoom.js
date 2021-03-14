import React from 'react';
import classnames from 'classnames';
import clonedeep from 'lodash.clonedeep';
import axios from 'axios';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as AppActions from '../../reducers/app';
import * as MeetingActions from '../../reducers/meeting';
import * as TextchatAppActions from '../../reducers/textchatApp';
import { Sender } from '../../socketTextchat';
import gcss from '../App/App.scss';
import ChatRoomMessageList from '../ChatRoomMessageList/ChatRoomMessageList';
import css from './ChatRoom.scss';
import Title from '../ConversationTitle';
import { EN, ES, FR, IT } from './translateConstant';
import Popover from '../../fragments/Popover';
import Modal from '../../fragments/Modal';
import translator from '../../utilities/translator';
import { langGenerator } from '../../Languages/constant';
import { DELETE_CHAT_SUCCESS } from '../../socketTextchat/constants';
import BadgeButton from '../ChatRoomMessageList/BadgeButton';
import LinkIcon from '../../fragments/SVGs/Link';
import { generateName } from '../../utilities/configFileName';
import Emoji from './Emoji';
import {bytesToSize} from '../../utilities/bytesConvert';
import browser from 'browser-detect';

const popoverStyle = {
  flex: 1,
  textAlign: 'end',
};

const modifyPatternMsg = (patternMsgClone) => {
  patternMsgClone.id = 'autoId';
  patternMsgClone.user.id = 'autoId';
  patternMsgClone.user.department = 'system';
  patternMsgClone.user.isTechAssistant = true;
  const modifyMsgContent = (theObj) => {
    Object.keys(theObj).forEach((key) => {
      switch (key) {
        case 'EN':
          theObj[key] = EN;
          break;
        case 'ES':
          theObj[key] = ES;
          break;
        case 'FR':
          theObj[key] = FR;
          break;
        case 'IT':
          theObj[key] = IT;
          break;
        default:
          theObj[key] = EN;
          break;
      }
    });
  };
  modifyMsgContent(patternMsgClone.text);
};

class ChatRoom extends React.Component {
  state = {
    message: '',
    selectedFile: null,
    previewFile: null,
    isLoading: false,
    openEmoji: false,
  };

  constructor(props) {
    super(props);
    this.textAreaRef = React.createRef();
    this.inputRef = React.createRef();
    this.previewRef = React.createRef();
    this.emojiRef = React.createRef();
    this.iconEmojiRef = React.createRef();
  }

  componentDidUpdate(prevProps, prevState) {
    if (this.textAreaRef.current) {
      this.textAreaRef.current.style.height = 'inherit';
      this.textAreaRef.current.style.height = this.textAreaRef.current.scrollHeight + 'px';
    }
    if (
      (this.props.meeting && this.props.meeting.currentMeeting && this.props.meeting.currentMeeting.id) !==
      (prevProps.meeting && prevProps.meeting.currentMeeting && prevProps.meeting.currentMeeting.id)
    ) {
      const { messages, meeting, meetingActions } = this.props;
      const messagesClone = [
        ...messages.filter((m) => m.meeting.id == (meeting && meeting.currentMeeting && meeting.currentMeeting.id)),
      ];
      const revMsgs = messagesClone.reverse();
      meetingActions.updateLatestMsg(revMsgs[0]);
    }
    const { appActions } = this.props;
    if (
      prevProps.app.loading != this.props.app.loading &&
      !this.props.app.loading &&
      this.props.app.message == DELETE_CHAT_SUCCESS
    ) {
      appActions.toggleDrawer();
    }
    if (prevState.previewFile !== this.state.previewFile) {
      if (this.state.previewFile) {
        this.previewRef.current.style.height = '100px';
        this.previewRef.current.style.padding = '5px';
        this.previewRef.current.style.transition = 'height 0.35s ease-in';
        this.previewRef.current.style.borderBottom = '1px solid #a8a8a8';
      }
      if (!this.state.previewFile) {
        this.previewRef.current.style.height = '0px';
        this.previewRef.current.style.transition = 'height 0.15s ease-in';
        this.previewRef.current.style.overflow = 'hidden';
        this.previewRef.current.style.padding = '0px';
        this.previewRef.current.style.borderBottom = '';
      }
    }
  }

  handleLinkClick = () => {
    this.inputRef.current.click();
  };

  openEmoji = () => {
    this.setState((prevState) => ({ openEmoji: !prevState.openEmoji }));
  };

  getEmoji = (emoji) => {
    if (!emoji) return this.setState({ openEmoji: false });
    this.setState((prevState) => ({ message: `${prevState.message} ${emoji}`, openEmoji: false }));
  };

  handleInputChange = (e) => {
    if (!e.target.files.length) return;
    this.setState({ selectedFile: e.target.files[0] });
    const fileReader = new FileReader();
    fileReader.onload = () => {
      this.setState({ previewFile: fileReader.result });
    };
    fileReader.readAsDataURL(e.target.files[0]);
  };

  sendMsg = async () => {
    const { currentUser, meeting, currentUserLanguage } = this.props;
    const { message, selectedFile } = this.state;
    if (!message && !selectedFile) return;
    let url;
    if (selectedFile) {
      // const rename = generateName(selectedFile);
      const newFile = new File([selectedFile], selectedFile.name);
      const form = new FormData();
      form.append('file', newFile);
      try {
        this.setState({ isLoading: true });
        url = await axios.post(`${CONFIG.httpsTextchatNodeUrl}/upload`, form, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
        this.setState({ isLoading: false });
      } catch (error) {
        this.setState({ isLoading: false });
        console.error(error);
      }
    }

    Sender.messageSend({
      file: url && selectedFile ? url.data : null,
      text: message,
      userId: parseInt(currentUser.id),
      meetingId: parseInt(meeting.currentMeeting.id),
      lang: currentUserLanguage,
    });
    this.setState({ message: '', selectedFile: null, previewFile: null });
  };

  handleKeyDown = (e) => {
    if (e.keyCode === 13) {
      e.preventDefault();
      return this.sendMsg();
    }
    // In case you have a limitation
    // e.target.style.height = `${Math.min(e.target.scrollHeight, limit)}px`;
  };

  handleKeyChange = (e) => this.setState({ message: e.target.value });

  renderPreview = () => {
    const { selectedFile, previewFile } = this.state;
    if (!selectedFile) return;
    if (selectedFile.type.startsWith('image')) {
      return (
        <div className={classnames({ [css.previewContent]: true })}>
          <img src={previewFile} alt="Preview" className={css.previewContentImg} />
        </div>
      );
    } else {
      return (
        <div className={classnames({ [css.previewContent]: true, [css.previewContentInfo]: true })}>
          <i className="fa fa-file" aria-hidden="true" />
          <div style={{ overflow: 'hidden', whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}>{selectedFile.name}</div>
          <div>{bytesToSize(selectedFile.size)}</div>
        </div>
      );
    }
  };

  handleSaveChat = () => {
    const { messages, currentMeeting, currentUserLanguage } = this.props;
    const finalLang = langGenerator(currentUserLanguage);
    const messagesClone = [...messages];
    const { msgFromTo } = currentMeeting;
    const allMessages = messagesClone.filter((m) => m.meeting.id == currentMeeting.id);
    const targetMsgIndex = msgFromTo ? allMessages.findIndex((m) => m.id == msgFromTo.id) : -1;
    const finalMessages = targetMsgIndex > -1 ? allMessages.slice(targetMsgIndex + 1) : allMessages;
    let conversationContent = '';
    for (const msg of finalMessages) {
      const { user, text } = msg;
      const { username } = user;
      const displayName = username.match(/^_ibp_techassist/) ? nameRefact(username) : username;
      conversationContent = conversationContent + `${displayName}: ${text[finalLang]} \n`;
    }
    this.downloadTxtFile(conversationContent);
  };

  downloadTxtFile = (content) => {
    const fileName = document.getElementById('conversation-title');
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = `${fileName.textContent}.txt`;
    document.body.appendChild(element);
    element.click();
  };

  handleDeleteChatNew = () => {
    const { appActions, currentMeeting } = this.props;
    appActions.toggleDrawer(`delete-conversation${currentMeeting.id}`);
  };

  handleConfirmDeleteChat = () => {
    const { currentMeeting, appActions } = this.props;
    Sender.deleteChat({
      meetingId: currentMeeting.id,
    });
    appActions.setLoading({ status: true, message: null });
  };

  openAddPanel = () => {
    const { appActions } = this.props;
    appActions.toggleDrawer('members-modal');
  };

  render() {
    const {
      messages,
      meeting,
      members,
      currentUser,
      currentUserLanguage,
      app,
      currentMeeting,
      deeplLangsSupport,
      unreadMsgCounter,
    } = this.props;
    const { openEmoji } = this.state;
    const popoverItems = [
      {
        label: translator('save_chat', currentUserLanguage),
        icon: <i className="fa fa-download" />,
        handle: this.handleSaveChat,
      },
      {
        label: translator('delete_chat', currentUserLanguage),
        icon: <i className="fa fa-trash"/>,
        handle: this.handleDeleteChatNew,
      },
    ];
    if (
      currentMeeting &&
      (currentMeeting.type == 'Private' || currentMeeting.type == 'Group') &&
      !currentUser.isModerator &&
      !currentUser.isTechAssistant
    ) {
      popoverItems.unshift({
        label: translator('add_user', currentUserLanguage),
        icon: <i className="fa fa-users" />,
        handle: this.openAddPanel,
      });
    }
    const isOpen = app.drawer == `delete-conversation${currentMeeting && currentMeeting.id}`;
    const messagesGenerator = () => {
      const messagesClone = [
        ...messages.filter((m) => m.meeting.id == (meeting && meeting.currentMeeting && meeting.currentMeeting.id)),
      ];
      if (
        meeting &&
        meeting.currentMeeting &&
        meeting.currentMeeting.type == 'Technical' &&
        messagesClone.length != 0 &&
        messagesClone[0].user.department !== 'technical'
      ) {
        const patternMsgClone = clonedeep(messagesClone[0]);
        modifyPatternMsg(patternMsgClone);
        messagesClone.splice(1, 0, patternMsgClone);
        return messagesClone;
      }
      return messagesClone;
    };

    const chatPlaceHolderGenerator = () => {
      const lang = deeplLangsSupport.find((lang) => lang.language == currentUserLanguage);
      if (lang) return `Write in ${lang.name} ...`;
      return 'Write in English ...';
    };

    const result = browser()

    return (
      <div className={result.mobile ? css.chatRoomContainerMobile : css.chatRoomContainer}>
        {!!unreadMsgCounter && (
          <div style={{ position: 'absolute', bottom: '10%', right: '5%', zIndex: 1000000000000000 }}>
            <BadgeButton scrollToBottom={this.props.textchatAppActions.scrollToBottomChat} count={unreadMsgCounter} />
          </div>
        )}
        <div className={css.chatRoomMessageHeader}>
          <button
            type="button"
            className={css.backChatItemsBtn + ' ' + gcss.noOutline}
            onClick={() => this.props.onHandleChatRoomSwitch()}
          >
            <img
              className={css.backChatItemsIcon}
              src="assets/images/retour.svg"
              alt="back icon"
              width="30"
              height="30"
            />
          </button>
          {/* <p className={css.chatParticipants}>{title}</p> */}
          <div>
            <Title inChatRoom={true} meetingFocus={meeting && meeting.currentMeeting} />
          </div>
          {isOpen && (
            <Modal
              handleConfirm={this.handleConfirmDeleteChat}
              content={translator('confirm_delete_conversation', currentUserLanguage)}
              title={translator('delete_chat', currentUserLanguage)}
            />
          )}
          <Popover mainIcon="cog" applyStyle={popoverStyle} items={popoverItems} />
        </div>
        <ChatRoomMessageList
          currentUser={currentUser}
          // messages={messages.filter(
          //   (m) => m.meeting.id == (meeting && meeting.currentMeeting && meeting.currentMeeting.id),
          // )}
          messages={messagesGenerator()}
          meeting={meeting}
          msgFromTo={meeting && meeting.currentMeeting && meeting.currentMeeting.msgFromTo}
        />
        {openEmoji && (
          <div>
            <Emoji iconEmojiRef={this.iconEmojiRef} getEmoji={this.getEmoji} />
          </div>
        )}
        <div className={css.inputWrapper}>
          <div className={'input-group ' + css.inputGroup}>
            <div ref={this.previewRef} className={css.previewWrapper}>
              <div onClick={() => this.setState({ selectedFile: null, previewFile: null })} className={css.removeIcon}>
                <i className="fa fa-times-circle" aria-hidden="true" />
              </div>
              {this.renderPreview()}
            </div>
            {/* {selectedFile && <div className={css.previewWrapper}>{this.renderPreview()}</div>} */}
            <textarea
              rows="1"
              ref={this.textAreaRef}
              onKeyDown={this.handleKeyDown}
              className={gcss.noOutline + ' form-control ' + css.formControl + ' ' + css.chatInput}
              placeholder={chatPlaceHolderGenerator()}
              value={this.state.message}
              onChange={this.handleKeyChange}
              style={{ resize: 'none' }}
            />

            <div className={'input-group-append ' + css.inputGroupAppend}>
              {this.state.isLoading ? (
                <div
                  className="spinner-border"
                  style={{ width: 20, height: 20, marginRight: 10, alignSelf: 'center', color: '#fe1b55' }}
                  role="status"
                >
                  <span className="sr-only">Loading...</span>
                </div>
              ) : (
                <button
                  type="submit"
                  className={'input-group-text ' + css.inputGroupText}
                  onClick={(e) =>
                    this.state.message == '' && !this.state.selectedFile ? e.preventDefault() : this.sendMsg(e)
                  }
                >
                  <img
                    className={css.sendIcon}
                    src="assets/images/bouton_envoyer.svg"
                    alt="send icon"
                    width="30"
                    height="30"
                  />
                </button>
              )}
            </div>
            <div className={css.iconUpload}>
              <input ref={this.inputRef} type="file" onChange={this.handleInputChange} style={{ display: 'none' }} />
            </div>
          </div>
          <div onClick={this.handleLinkClick} className={css.linkBtn}>
            <i className="fa fa-file" aria-hidden="true"></i>
          </div>
          <div ref={this.iconEmojiRef} onClick={this.openEmoji} className={css.linkBtn}>
            <i className="fa fa-smile-o" aria-hidden="true"></i>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  app: state.app,
  currentUser: state.currentUser,
  meeting: state.meeting,
  messages: state.messages,
  members: state.members,
  currentUserLanguage: state.currentUser.language,
  currentMeeting: state.meeting.currentMeeting,
  deeplLangsSupport: state.textchatApp.deeplLangsSupport,
  unreadMsgCounter: state.textchatApp.msgUnreadCounter,
});

const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(AppActions, dispatch),
  meetingActions: bindActionCreators(MeetingActions, dispatch),
  textchatAppActions: bindActionCreators(TextchatAppActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoom);
