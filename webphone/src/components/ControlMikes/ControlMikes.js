// This component handle the padlock button

import React, { Component } from 'react';
import * as Sender from '../../socket/sender';
import { connect } from 'react-redux';
import css from './ControlMikes.scss';
class ControlMikes extends Component {
  constructor(props) {
    super(props);
    this.state = {
      microphoneIcon: true,
    };
  }

  handleToggleMike = () => {
    const { id } = this.props.currentUser;
    Sender.toggleControlMike({ userId: id });
  };

  render() {
    const { currentUser } = this.props;
    const { isLockMike } = currentUser;
    const status = this.state.microphoneIcon ? 'stop' : 'start';
    return (
      <div>
        {this.props.currentUser.isAdministrator && (
          <button className={css.btnMicrophone} onClick={this.handleToggleMike}>
            <img
              src={isLockMike ? 'assets/images/lock.svg' : 'assets/images/open-lock.svg'}
              alt="hand icon"
              width="30"
              height="30"
              data-hand="on"
              ref={this.handRaisedIconRef}
            />
          </button>
        )}
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  currentUser: state.currentUser,
  members: state.members,
  moderators: state.moderators,
});

export default connect(mapStateToProps, null)(ControlMikes);
