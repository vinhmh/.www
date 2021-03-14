import PropTypes from 'prop-types'
import Member from './Member'
import css from './MembersList.scss'

const Room = ({ user, members, roomId }) => {
  let list = null

  const onArrowClick = () => {
    $(list).slideToggle(200)
  }

  return (
    members.length > 0
    && (
    <div className={css.roomHolder}>
      <div className={css.roomTitle}>
        <strong>{user.titlesMap[roomId].title}</strong>
        <div className={css.roomSlideArrow} onClick={onArrowClick}>
          <i className="fa fa-chevron-down" />
        </div>
      </div>
      <ul className={css.list} ref={(el) => { list = el }}>
        {members.map((member, i) => <Member key={member.id} pos={i} member={member} user={user} roomId={roomId} />)}
      </ul>
    </div>
    )
  )
}

Room.propTypes = {
  members: PropTypes.array.isRequired,
  roomId: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number,
  ]),
  user: PropTypes.object.isRequired,
}
export default Room
