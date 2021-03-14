import classNames from 'classnames'
import PropTypes from 'prop-types'
import css from './SwitcherMembers.scss'

export default class SwitcherMembers extends React.Component {
  indicator = (member) => {
    const props = {
      className: classNames({
        [css.indicatorActive]: member.speak,
        [css.indicatorTalking]: member.talking
      })
    }
    return <span {...props} />
  }

  render() {
    const { user } = this.props
    const members = user.members.filter(m => m.roomId !== user.rooms.floor)
    const floorMember = user.members.find(m => m.roomId === user.rooms.floor)

    return (
      <div className={css.switcher}>
        {floorMember && (
          <div className={`${css.item} ${css.floorItem}`}>
            <p>{user.titlesMap[floorMember.roomId].title}</p>
            {this.indicator(floorMember)}
          </div>
        )}
        {members.map(member => (
          <div key={member.id} className={css.item}>
            <p>{user.titlesMap[member.roomId].title}</p>
            {this.indicator(member)}
          </div>
        ))}
      </div>
    )
  }
}

SwitcherMembers.propTypes = {
  user: PropTypes.object.isRequired
}
