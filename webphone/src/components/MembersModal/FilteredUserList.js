import PropTypes from 'prop-types'
import React from 'react'
import css from './FilteredUsersList.scss'
import MemberItem from './MemberItem'

const ALL = 'ALL'

export default class FilteredUsersList extends React.Component {
  state = {
    filterCode: ALL,
  }

  /**
   * Change the selected code to filter the members of the list
   * @param {string} code
   */
  handleCodeChange(code) {
    const { filterCode } = this.state
    if (code === ALL && filterCode === ALL) this.setState({ filterCode: null })
    else this.setState({ filterCode: code })
  }

  render() {
    const { members, user, screen } = this.props
    const { filterCode } = this.state

    const list = {}
    const mapCodes = []

    user.roomsList.forEach((roomId) => {
      mapCodes.push(user.titlesMap[roomId].code)
    })

    members.forEach((member) => {
      if (
        member.user.isModerator ||
        member.user.isSwitcher ||
        user.titlesMap[member.roomId].title === 'Floor' ||
        (user.titlesMap[member.roomId].code !== filterCode && filterCode !== ALL)
      )
        return
      const { roomId } = member
      list[roomId] || (list[roomId] = [])
      list[roomId].push(member)
    })

    const roomsArr = Object.keys(list)
    if (user.isRegular) {
      const index = roomsArr.indexOf(user.rooms.first)
      if (index !== -1) {
        roomsArr.splice(index, 1)
        roomsArr.unshift(user.rooms.first)
      }
    }

    return (
      <div className={css.filteredConferenceContainer}>
        {!(screen === 'members-modal') && (
          <div className={css.filterHeader}>
            <ul className={css.filterLanguageBar}>
              <li className={filterCode === ALL ? css.activeLanguage : null} onClick={() => this.handleCodeChange(ALL)}>
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
        )}
        <div className={css.filterConferenceUsersContainer}>
          {roomsArr.map((roomId) =>
            list[roomId].map((member, i) => (
              <MemberItem
                key={member.id}
                pos={i}
                member={member}
                user={user}
                roomId={roomId}
                isHandRaised={true}
                withBlob={false}
                handleAdd={this.props.handleAdd}
                participants={this.props.participants}
              />
            )),
          )}
        </div>
      </div>
    )
  }
}

FilteredUsersList.propTypes = {
  adjustments: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  screen: PropTypes.string,
}
