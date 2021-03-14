import React, { Component } from 'react'
import * as Sender from '../../socket/sender'
import { connect } from 'react-redux'
import css from './HandraisedControl.scss'
class HandraisedControl extends Component {
    constructor(props) {
        super(props)
        this.state = {
            handRaisedIcon: true
        }
    }
    handleUpdateAttributesHandRaisedModerator(startMeeting, startHandRaised, startStopHandRaised) {
        const { currentUser, members } = this.props;
        members.map(m => {
            if (m.user.meetingID == currentUser.meetingID) {
                const msg = { id: m.id, startMeeting, startHandRaised, startStopHandRaised }
                Sender.startHandRaisedModertor(msg)
            }
        })
    }
    handleHandraisedModerator(e) {
        let startHandRaised = null
        let startStopHandRaised = null
        let startMeeting = this.props.currentUser.startMeeting
        if (e == 'start') {
            startHandRaised = true
            startStopHandRaised = false
            startMeeting = true
        }
        else if (e == 'stop') {
            startHandRaised = false,
                startStopHandRaised = true
        }
        this.handleUpdateAttributesHandRaisedModerator(startMeeting, startHandRaised, startStopHandRaised)
        this.setState({
            handRaisedIcon: !this.state.handRaisedIcon
        })
    }
    render() {
        const status = this.state.handRaisedIcon ? "stop" : "start"
        return (
            <div>
                {this.props.currentUser.isAdministrator && <button onClick={() => this.handleHandraisedModerator(status)} className={css.btnHandraised}>
                    {this.state.handRaisedIcon ? <img
                        src={"assets/images/main_on.svg"}
                        alt="hand icon"
                        width="30"
                        height="30"
                        data-hand="on"
                        ref={this.handRaisedIconRef}
                    /> : <img
                            src={"assets/images/dont-touch.png"}
                            alt="hand icon"
                            width="30"
                            height="30"
                            data-hand="on"
                            ref={this.handRaisedIconRef}
                        />}
                </button>}
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    currentUser: state.currentUser,
    members: state.members,
    moderators: state.moderators,
});

export default connect(mapStateToProps, null)(HandraisedControl);


