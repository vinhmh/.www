import PropTypes from "prop-types";
import React from "react";

export default class UseFloorCode extends React.Component {
  orators() {
    const { members } = this.props;
    return members.filter(
      (m) => (m.user.isRegular || m.user.isSwitcher) && m.talking
    );
  }

  render() {
    const { user } = this.props;
    const orators = this.orators();
    const orator = orators[0];

    const showCode =
      orator &&
      orator.roomId !== user.rooms.first &&
      orator.roomId !== user.rooms.second &&
      user.titlesMap[orator.roomId]?.code;
    return <>{showCode ? user.titlesMap[orator.roomId]?.code : "-"}</>;
  }
}

UseFloorCode.propTypes = {
  user: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
};
