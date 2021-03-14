import { connect } from "react-redux";
import { bindActionCreators } from "redux";
import { array, object } from "prop-types";
import * as Sender from "../../socket/sender";
import React from "react";
import css from "./UserOratorInfo.scss";
import * as CurrentUserActions from "../../reducers/currentUser";
import * as MediaSettingsActions from "../../reducers/mediaSettings";
import translator from "../../utilities/translator"

class UserOratorInfo extends React.Component {
  constructor(props) {
    super(props);
  }

  orators() {
    const { members } = this.props;
    return members.filter(
      (m) => (m.user.isRegular || m.user.isSwitcher) && m.talking
    );
  }

  oratorTitle = (orator) => {
    const { user } = this.props
    let text;
    if (!orator) {
      text = translator('orator_no_speaking', user.language)
    } else if (orator.user.isSwitcher) {
      text = translator('orator_stage_speaking', user.language)
    } else {
      text = orator.user.displayName;
    }
    return text;
  };

  oratorRoom = (orator) => {
    if (!orator || orator.user.isSwitcher) return null;

    const { user, mediaSettings } = this.props;
    // const { outputVolumeOrator } = mediaSettings;
    const { roomId } = orator;
    const roomTitle = user.titlesMap[roomId].code;

    if(orator.user.isRegular && orator.user.useFloor)
      return orator.user.titlesMap[parseInt(orator.user.speakRoomId)].code;

    if (
      user.isRegular ||
      roomId === user.rooms.first ||
      roomId === user.rooms.second
    ) {
      return roomTitle;
    }

    return roomTitle;
  };

  render() {
    const orators = this.orators();
    const orator = orators[0];
    const oratorTitle = this.oratorTitle(orator);
    const oratorRoom = this.oratorRoom(orator);
    const {user} = this.props
    return (
      <div className={css.userContainer}>
        <div>
         <h1 className={css.userName} title={oratorTitle}>{oratorTitle}</h1> 
        {/* {!user.isTechAssistant && !user.isModerator ?<h1 className={css.userName} title={oratorTitle}>{translator('parcitipant_audiodesk', user.language)}</h1>:null} */}
        {/* {user.isTechAssistant ? <h1 className={css.userName} title={oratorTitle} style={{fontSize:'19px'}}>{translator('tech_assits_audiodesk', user.language)}</h1>:null} */}
        {/* {user.isTechAssistant ? <h1 className={css.userName}>{`Audiodesk ${(user.displayName).replace("Techassist","techassist").replace("Ibp","").replace("techassist","techassist ")}`}</h1>:null} */}
        {/* {user.isModerator ? <h1 className={css.userName} title={oratorTitle}>{translator('interpreter_audiodesk', user.language)}</h1>:null} */}
        </div>
        <p className={oratorRoom ? css.userLanguage : css.transparentNoOrator}>
          {oratorRoom ? oratorRoom : " | "}
        </p>
      </div>
    );
  }
}

UserOratorInfo.propTypes = {
  adjustments: object.isRequired,
  currentUserActions: object.isRequired,
  mediaSettings: object.isRequired,
  mediaSettingsActions: object.isRequired,
  members: array.isRequired,
  user: object.isRequired,
};

const mapStateToProps = (state) => ({
  adjustments: state.adjustments,
  mediaSettings: state.mediaSettings,
  members: state.members,
  user: state.currentUser,
});

const mapDispatchToProps = (dispatch) => ({
  currentUserActions: bindActionCreators(CurrentUserActions, dispatch),
  mediaSettingsActions: bindActionCreators(MediaSettingsActions, dispatch),
});

export default connect(mapStateToProps, mapDispatchToProps)(UserOratorInfo);
