import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import * as AppActions from '../../reducers/app/reducer'
import * as Sender from '../../socket/sender'
import * as CurrentUserActions from '../../reducers/currentUser'
import * as MediaSettingsActions from '../../reducers/mediaSettings'
import Timer from '../Timer/Timer'
import gcss from '../App/App.scss'
import LLcss from '../ListenLines/ListenLines.scss'
import LoungeIcon from '../Icons/LoungeIcon'
import { toggleMuteApp } from '../../utilities/appMute'
import browser from 'browser-detect'
import ReactSlider from 'react-slider'
import ControlMikes from '../ControlMikes/ControlMikes'
class AudioHeader extends React.Component {
    constructor(props) {
        super(props)
    }

    loungeBtn() {
        const { actions, user, outputVolumeLounge } = this.props
        const userIsTalking = !!user.members.find((m) => m.talking && m.roomId === user.rooms.lounge)

        let cssBlob
        if (!userIsTalking) cssBlob = LLcss.microIcon + ' ' + gcss.white
        else cssBlob = LLcss.microIcon + ' ' + gcss.blob + ' ' + gcss.white
        return (
            <div className={LLcss.loungeContainer}>
                <div className={LLcss.loungeBtnContainer}>
                  <button className={LLcss.loungeBtn} onClick={() => this.onLoungeClick()}>
                      {<LoungeIcon inLoungeRoom={user.inLoungeRoom}/>}
                  </button>
                  {user.inLoungeRoom && <ReactSlider
                    min={0}
                    max={10}
                    step={0.1}
                    value={outputVolumeLounge * 10}
                    trackClassName={'sliderTrack'}
                    thumbClassName={'sliderThumb'}
                    onChange={(value) => actions.setOutputVolumeLounge(value / 10)}
                  />}
                </div>
                {user.inLoungeRoom ? (
                <img
                    className={cssBlob}
                    src={user.isSpeak ? 'assets/images/micro_on.svg' : 'assets/images/micro_off.svg'}
                    alt="micro icon"
                    width="20"
                    height="20"
                    onClick={() => this.toggleSpeakLoungeRoom()}
                />
                ) : null}
            </div>
        )
    }

    toggleSpeakLoungeRoom = () => {
        const { user } = this.props
        Sender.toggleSpeakSelf(user.id)
    }

    demuteAppIfMuted = () => {
        const { app, appActions } = this.props
        if (app.appMuted) {
            toggleMuteApp()
            appActions.setMute(false)
        }
    }

    toggleMicroIfOn() {
        const { user } = this.props;

        user.members.map(m => {
            if (m.speak)
            Sender.toggleSpeakMember(user.id, m.id, m.roomId)
        })
    }

    onLoungeClick = () => {
        const { user } = this.props
        this.toggleMicroIfOn()
        this.demuteAppIfMuted()
        if (user.inLoungeRoom) Sender.leaveLounge(user.id)
        else Sender.joinLounge(user.id)
    }

    render() {
        const result = browser();
        return (
            <div
                className="d-flex justify-content-between"
                style={{
                    borderBottom: '1px solid blue',
                    padding:'8px 20px', 
                    maxHeight: '61px', // en dessous le code de clement 
                    paddingLeft:'8px',
                    paddingRight: '8px',
                    height: '7vh',
                    display: 'flex',
                    alignItems: 'center'
                }}
            >
                <button
                  type="button"
                  className={'btn ' + this.props.appCSS.menuBtn + ' ' + this.props.appCSS.noOutline}
                  onClick={this.props.menuTogglerHandler}
                >
                    <img src="assets/images/bouton_menu_off.png" alt="close menu button" width="30" height="30" style={{backgroundColor:'#fff',borderRadius:'50%'}}/>
                </button>
                <Timer currentUser={this.props.currentUser}/>
                { this.props.user.isModerator ? this.loungeBtn(): null }
                <ControlMikes/>
                { result.mobile ? null : this.props.messBtnHandler }
              </div>
        )
    }
}

const mapStateToProps = (state) => ({
    app: state.app,
    ...state.mediaSettings,
})

const mapDispatchToProps = (dispatch) => ({
    appActions: bindActionCreators(AppActions, dispatch),
    currentUserActions: bindActionCreators(CurrentUserActions, dispatch),
    actions: bindActionCreators(MediaSettingsActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(AudioHeader)
