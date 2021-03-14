import React from 'react';
import classnames from 'classnames';
import css from './ChatRoomMessageList.scss';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import * as TextchatAppActions from '../../reducers/textchatApp/reducer';
import axios from 'axios';
import base64 from 'base-64';
import { OK_MSG } from '../Notice';
import { getOriginFileName } from '../../utilities/configFileName';
import DownloadIcon from '../../fragments/SVGs/DowloadIcon';
class Message extends React.Component {
  constructor(props) {
    super(props);
    this.msgRef = React.createRef();
  }

  state = {
    seen: this.props.haveScroll,
  };

  componentDidMount() {
    const { seen } = this.state;
    const { textchatAppActions } = this.props;
    if (!seen) {
      textchatAppActions.updateMsgUnread(1);
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevProps.scrolledHeight != this.props.scrolledHeight &&
      this.props.scrolledHeight > this.msgRef.current.offsetTop + this.msgRef.current.clientHeight &&
      !this.state.seen
    ) {
      this.props.textchatAppActions.updateMsgUnread(-1);
      this.setState({ seen: true });
    }
  }

  render() {
    const { currentUser, username, content, receivedAt, m, urlFile } = this.props;
    const originalName = getOriginFileName(urlFile);
    return (
      <div
        className={classnames({
          [css.currentUser]: currentUser.id === m.user.id,
          [css.messageWrapper]: true,
        })}
        key={m.id}
        id={m.id}
        ref={this.msgRef}
      >
        <div className={css.username}>{username}</div>
        <div className={css.message}>
          {content}
          {urlFile && (
            <div className={css.downloadBtnWrapper} onClick={() => window.open(urlFile)}>
              <div className={css.downloadIconWrapper}>
                <i className="fa fa-file" aria-hidden="true"></i>
              </div>
              <div className={css.originalName}>{originalName}</div>
            </div>
          )}
        </div>
        <div className={css.receivedAt}>{receivedAt}</div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  // msgUnreadNumber: state.textchatApp.msgUnreadCounter,
});

const mapDispatchToProps = (dispatch) => ({
  textchatAppActions: bindActionCreators(TextchatAppActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(Message);
