import PropTypes from 'prop-types'
import React from 'react'
import css from './ConferenceUsersList.scss'
import MemberItem from '../MemberItem/MemberItem'
import { sortByUser } from '../../utilities/sorts'

export default class ConferenceUsersList extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { user, members } = this.props

    const list = members.filter((m) => (
      m.user.isRegular &&
      (m.talking || m.user.raiseHandTime) &&
      m.roomId === m.user.speakRoomId
    )) // orator list with users having their hand raised

    return (
      <div className={css.conferenceContainer}>
        {list
          .sort(sortByUser('isSpeak'))
          .sort(sortByUser('raiseHandTime'))
          .map((member, i) => (
            <MemberItem
              key={member.id}
              pos={i}
              member={member}
              user={user}
              roomId={member.roomId}
              raiseHandTime={member.user.raiseHandTime}
              showHand={true}
              withBlob={true}
            />
          ))}
      </div>
    )
  }
}

ConferenceUsersList.propTypes = {
  adjustments: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
}
