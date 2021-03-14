import classNames from 'classnames'
import PropTypes from 'prop-types'
import css from './MembersList.scss'
import Member from './Member'
import Room from './Room'

export default class MembersList extends React.Component {
  get members() {
    const { members } = this.props
    const name = m => m.user.usernameInput || m.user.username
    return members.filter(m => !name(m).match(/^_ibp_/))
  }

  getModerators = (filter) => {
    const moderators = []
    const moderatorsIds = new Set()
    this.members
      .filter(filter)
      .forEach((m) => {
        if (moderatorsIds.has(m.user.id)) return
        moderators.push(m.user)
        moderatorsIds.add(m.user.id)
      })
    return moderators
  }

  getModeratorMembers = (filter) => {
    const moderators = this.getModerators(filter)
    const list = []
    moderators.forEach((mod) => {
      const roomId = mod.speakRoomId
      const member = this.members.find(m => m.user.id === mod.id && m.roomId === roomId)
      if (member) list.push(member)
    })
    return list
  }

  membersList = () => {
    const { user } = this.props
    const list = {}

    this.members.forEach((member) => {
      if (member.user.isModerator || member.user.isSwitcher) return
      const { roomId } = member

      if(member.user.isRegular && member.user.useFloor) {
        // Do not display the floor
        if(roomId === member.user.rooms.floor) return

        // If the floor is used we also want to display the member as speaking if speaking to the floor
        const memberUserFloorMember = member.user.members
              .map(mid => this.members.find(m => m.id === mid))
              .find(m => m.roomId === member.user.rooms.floor)
        if(memberUserFloorMember && memberUserFloorMember.speak)
            member = { ...member, speak: true, talking: memberUserFloorMember.talking };
      }

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
      <div className={css.sectionBox}>
        <div className={css.sectionTitle}>
          <span>Participants</span>
        </div>
        {roomsArr.map(roomId => <Room key={roomId} user={user} roomId={roomId} members={list[roomId]} />)}
      </div>
    )
  }

  boothTeam = () => {
    const { user } = this.props
    const filter = m => m.user.id && m.user.isModerator && this.inBoothTeam(m.user, user)
    const list = this.getModeratorMembers(filter)
    return (
      <div className={css.sectionBox}>
        <div className={css.sectionTitle}>
          <span>Booth</span>
        </div>
        {this.renderList(list, css.modBox)}
      </div>
    )
  }

  inBoothTeam = (u1, u2) => (u1.rooms.first === u2.rooms.first && u1.rooms.second === u2.rooms.second)
    || (u1.rooms.first === u2.rooms.second && u1.rooms.second === u2.rooms.first)

  moderatorsList = () => {
    const { user } = this.props
    let filter
    if (user.isModerator) {
      filter = m => m.user.isModerator
        && !this.inBoothTeam(m.user, user)
        && m.user.speakRoomId === m.roomId
        && m.user.id !== user.id
    } else {
      filter = m => m.user.isModerator
        && (m.user.rooms.first === user.rooms.first || m.user.rooms.second === user.rooms.first)
        && m.user.speakRoomId === user.rooms.first
        && m.speak
        && m.roomId === user.rooms.first
    }

    const list = this.getModeratorMembers(filter)
    const label = user.isRegular ? 'Interpreter' : 'Interpreters'

    return (
      <div className={css.sectionBox}>
        <div className={css.sectionTitle}>
          <span>{label}</span>
        </div>
        {this.renderList(list, css.interpretersList)}
      </div>
    )
  }

  oratorsList = () => {
    const list = this.members.filter(m => m.user.isRegular && m.talking
        && !(m.user.id === this.props.user.id && m.roomId === m.user.rooms.floor)) // Do not display self speaking to floor

    return (
      <div className={css.sectionBox}>
        <div className={css.sectionTitle}>
          <span>Speakers</span>
        </div>
        {this.renderList(list, css.oratorsList)}
      </div>
    )
  }

  moderatorContent = () => {
    const boothTeam = this.boothTeam()
    return (
      <div className={css.moderatorContent}>
        {boothTeam}
      </div>)
  }

  renderList(list, ulClassName) {
    const { user } = this.props
    return (
      <div className={ulClassName}>
        <ul className={css.list}>
          {list.map((member, i) => <Member key={member.id} pos={i} member={member} user={user} roomId={member.roomId} />)}
        </ul>
      </div>
    )
  }

  render() {
    const { adjustments, user } = this.props
    const membersList = this.membersList()
    const oratorsList = this.oratorsList()
    const moderatorsList = this.moderatorsList()
    const moderatorContent = user.isModerator ? this.moderatorContent() : null
    const holderClass = classNames(
      css.sectionsHolder,
      { [css.moderatorUser]: user.isModerator }
    )

    if (adjustments.demoMode && user.isRegular) return null

    return (
      <div className={holderClass}>
        {moderatorContent}
        {moderatorsList}
        {oratorsList}
        {membersList}
      </div>
    )
  }
}

MembersList.propTypes = {
  adjustments: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired
}
