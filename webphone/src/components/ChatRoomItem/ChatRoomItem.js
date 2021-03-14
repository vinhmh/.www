import React from 'react';
import classNames from 'classnames';
import { bindActionCreators } from 'redux';
import { connect } from 'react-redux';
import css from './ChatRoomItem.scss';
import gcss from '../App/App.scss';
import Title from '../ConversationTitle';
import translator from '../../utilities/translator';
import Popover from '../../fragments/Popover';
import * as MeetingActions from '../../reducers/meeting/reducer';
import * as AppActions from '../../reducers/app/reducer';
import { nameRefact } from '../../utilities/nameRefact';
import { langGenerator } from '../../Languages/constant';
import Modal from '../../fragments/Modal';
import { Sender } from '../../socketTextchat';
import { DELETE_CHAT_SUCCESS } from '../../socketTextchat/constants';

class ChatRoomItem extends React.Component {
  componentDidUpdate(prevProps, prevState) {
    const { appActions } = this.props;
    if (
      prevProps.app.loading != this.props.app.loading &&
      !this.props.app.loading &&
      this.props.app.message == DELETE_CHAT_SUCCESS
    ) {
      appActions.toggleDrawer();
    }
  }

  handleSaveChat = () => {
    const { messages, meetingFocus, language } = this.props;
    const finalLang = langGenerator(language);
    const messagesClone = [...messages];
    const { msgFromTo } = meetingFocus;
    const allMessages = messagesClone.filter((m) => m.meeting.id == meetingFocus.id);
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
    const element = document.createElement('a');
    const file = new Blob([content], { type: 'text/plain;charset=utf-8' });
    element.href = URL.createObjectURL(file);
    element.download = 'myFile.txt';
    document.body.appendChild(element);
    element.click();
  };
  //hanldeDeleteChat handle feature remove conversation from list ChatRoomItem => the conversation was removed will existing in meetingsOff in store
  // handleDeleteChat = () => {
  //   const { meetingFocus, meetingActions, latestMsg } = this.props
  //   meetingActions.addMeetingOff(meetingFocus)
  //   meetingActions.updateMsgFromTo({ meeting: meetingFocus, message: latestMsg ? latestMsg : null })
  // }

  handleDeleteChatNew = () => {
    const { appActions, meetingFocus } = this.props;
    appActions.toggleDrawer(`delete-conversation${meetingFocus.id}`);
  };

  handleConfirmDeleteChat = () => {
    const { meetingFocus, appActions } = this.props;
    Sender.deleteChat({
      meetingId: meetingFocus.id,
    });
    appActions.setLoading({ status: true, message: null });
  };

  generatorIcon = (type) => {
    switch (type) {
      case 'Public':
        return 'public';
      case 'Group':
        return 'group';
      case 'Private':
        return 'user';
      default:
        return 'group';
    }
  };

  render() {
    const {
      app,
      message,
      onHandleChatRoomSwitch,
      isTechnicalChat,
      isUnread,
      meetingFocus,
      defaultMessage,
      language,
      currentMessages,
      isTechAssistant,
      latestMsg,
      isFileWithoutText
    } = this.props;

    const isOpen = app.drawer == `delete-conversation${meetingFocus.id}`;

    const popoverItems = [
      { label: translator('save_chat', language), icon: <i className="fa fa-download" />, handle: this.handleSaveChat },
      {
        label: translator('delete_chat', language),
        icon: <i className="fa fa-times-circle" />,
        handle: this.handleDeleteChatNew,
      },
    ];

    const messageGenerator = () => {
      if (
        meetingFocus.msgFromTo &&
        (meetingFocus.msgFromTo && meetingFocus.msgFromTo.id) == (latestMsg && latestMsg.id)
      )
        return translator('chat_init', language);
      if (currentMessages.length == 1 && currentMessages[0].user.department != 'technical' && isTechnicalChat) {
        return translator('technical_auto_reply', language);
      }
      return message;
    };
    if (isTechnicalChat && !isTechAssistant) {
      return (
        <div className={css.chatRoomItemContainer}>
          {isOpen && (
            <Modal
              isOpen={isOpen}
              handleConfirm={this.handleConfirmDeleteChat}
              content={translator('confirm_delete_conversation', language)}
              title={translator('delete_chat', language)}
            />
          )}
          {/* <div style = {{ position: 'absolute', right: 0, top: 0, zIndex: 999 }}> <img src={`assets/images/${this.generatorIcon(meetingFocus.type)}.svg`} alt="mute" width="14" height="14" /></div> */}
          {/* <Popover items={popoverItems} /> */}
          <div onClick={onHandleChatRoomSwitch} className={css.technicalContainer}>
            <div className={css.technicalChatContainer}>
              <img
                className={css.technicChatIcon}
                src={'assets/images/chat_technique.svg'}
                alt="technic chat icon"
                width="30"
                height="30"
              />
              <p className={css.technicalChatTitle}>
                {isFileWithoutText && <i className="fa fa-file" aria-hidden="true"></i>} {" "}
                {translator('chat_technical', language)}
              </p>
            </div>
            <p className={classNames(css.chatRoomItemLastMessage, { [css.technical]: isTechnicalChat })}>
              {messageGenerator()}
            </p>
            <div className={css.bottomGreyBar} />
            {isUnread && message !== defaultMessage && <div className={css.notification} />}
          </div>
        </div>
      );
    }
    return (
      <div className={classNames({ [css.chatRoomItemContainer]: true })}>
        {app.drawer == `delete-conversation${meetingFocus.id}` && (
          <Modal
            isOpen={isOpen}
            handleConfirm={this.handleConfirmDeleteChat}
            content={translator('confirm_delete_conversation', language)}
            title={translator('delete_chat', language)}
          />
        )}
        {/* <div style = {{ position: 'absolute', right: 0, top: 0, zIndex: 2 }}> <img src={`assets/images/${this.generatorIcon(meetingFocus.type)}.svg`} alt="mute" width="14" height="14" /></div> */}
        {/* <Popover items={popoverItems} /> */}
        <div onClick={onHandleChatRoomSwitch} className={css.chatItemContainer}>
          {/* <p className={css.chatRoomItemTitle}>{title}</p> */}
          <Title meetingFocus={meetingFocus} />
          <p className={css.chatRoomItemLastMessage}>
            {isFileWithoutText && <i className="fa fa-file" aria-hidden="true"></i>} {" "}
            {messageGenerator()}
          </p>
        </div>
        <div className={gcss.bottomGreyBar} />
        {isUnread && message !== defaultMessage && <div className={css.notification} />}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  app: state.app,
  // currentUser: state.currentUser,
  // members: state.members,
  // adjustments: state.adjustments,
  meetings: state.meeting.meetings,
  messages: state.messages,
});

const mapDispatchToProps = (dispatch) => ({
  meetingActions: bindActionCreators(MeetingActions, dispatch),
  appActions: bindActionCreators(AppActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomItem);
