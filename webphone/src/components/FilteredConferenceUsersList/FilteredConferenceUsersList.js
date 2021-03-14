import PropTypes from "prop-types";
import React from "react";
import css from "./FilteredConferenceUsersList.scss";
import MemberItem from "../MemberItem/MemberItem";

const ALL = "All";

export default class FilteredConferenceUsersList extends React.Component {
  state = {
    filterCode: ALL,
  };

  /**
   * Change the selected code to filter the members of the list
   * @param {string} code
   */
  handleCodeChange(code) {
    const { filterCode } = this.state;
    if (code === ALL && filterCode === ALL) this.setState({ filterCode: null });
    else this.setState({ filterCode: code });
  }

  render() {
    const { members, user } = this.props;
    const { filterCode } = this.state;

    const list = {};
    const mapCodes = [];

    user.roomsList.forEach((roomId) => {
      mapCodes.push(user.titlesMap[roomId].code);
    });

    members.forEach((member) => {
      if (member.user.isModerator || member.user.isSwitcher) return;
      // if (member.user.isRegular && member.user.useFloor) {
      //   // If the floor is used we also want to display the member as speaking if speaking to the floor
      //   const memberUserFloorMember = member.user.members
      //     .map((mid) => members.find((m) => m.id === mid))
      //     .find((m) => m.roomId === member.user.rooms.floor);
      //   if (memberUserFloorMember && memberUserFloorMember.speak)
      //     member = { ...member, speak: true };
      // }
      const { roomId } = member;
      if (user.titlesMap[member.roomId].code === filterCode) {
        list[roomId] || (list[roomId] = []);
        list[roomId].push(member);
      } else if (filterCode === ALL) {
        list[roomId] || (list[roomId] = []);
        list[roomId].push(member);
      }
    });

    const roomsArr = Object.keys(list);
    // console.log("roomsArr: ", roomsArr);
    if (user.isRegular) {
      const index = roomsArr.indexOf(user.rooms.first);
      if (index !== -1) {
        roomsArr.splice(index, 1);
        roomsArr.unshift(user.rooms.first);
      }
    }

    return (
      <div className={css.filteredConferenceContainer}>
        <div className={css.filterHeader}>
          <ul className={css.filterLanguageBar}>
            <li
              className={filterCode === ALL ? css.activeLanguage : null}
              onClick={() => this.handleCodeChange(ALL)}
            >
              {ALL}
            </li>
            {mapCodes.map((code) => (
              <li
                className={filterCode === code ? css.activeLanguage : null}
                key={code}
                onClick={() => this.handleCodeChange(code)}
              >
                {code}
              </li>
            ))}
          </ul>
        </div>
        <div className={css.filterConferenceUsersContainer}>
          {roomsArr.map((roomId) =>
            list[roomId].map((member, i) => {
              return (
                <MemberItem
                  key={member.id}
                  pos={i}
                  member={member}
                  user={user}
                  roomId={roomId}
                  isHandRaised={true}
                  withBlob={true}
                />
              );
            })
          )}
        </div>
      </div>
    );
  }
}

FilteredConferenceUsersList.propTypes = {
  adjustments: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
};
