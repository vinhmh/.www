import PropTypes from 'prop-types'
import * as Sender from '../../socket/sender'
import css from './UserControls.scss'

export default class RegularControls extends React.Component {
  onRoomChange = (e) => {
    const { user, currentUserUpdate } = this.props;
    if (!user.connected) return;
    currentUserUpdate({connected: false});
    Sender.changeRegularRoom(user.id, e.target.value);
  };

  render() {
    const { user } = this.props;

    const selectProps = {
      onChange: this.onRoomChange,
      defaultValue: user.rooms.first
    }
    if (!user.connected) selectProps.disabled = true;

    return (
      <div className={css.confBtn}>
        <span>{user.titlesMap[user.rooms.first].title}</span>
        <select {...selectProps}>
          {user.roomsList.map(item => (
            <option key={item} value={item}>{user.titlesMap[item].title}</option>
          ))}
        </select>
      </div>
    )
  }
}

RegularControls.propTypes = {
  user: PropTypes.object.isRequired,
  currentUserUpdate: PropTypes.func.isRequired
};
