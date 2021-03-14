import { object } from 'prop-types'
import classnames from 'classnames'
import { Table, Icon } from 'semantic-ui-react'
import css from './SwitcherList.scss'

export default class Switcher extends React.Component {
  state = {}

  noClick = () => {
    const { user } = this.props
    return !user.connected || user.inLoungeRoom
  }

  renderConferences = () => {
    const { user, titlesMap } = this.props
    const name = m => classnames('microphone', { slash: !m.speak })
    const klass = m => classnames([css.item], {
      [css.talking]: m.talking,
      [css.speakRoom]: user.speakRoomId === m.roomId && user.isModerator
    })

    return user.members.map(m => {
      const meeting = titlesMap[user.meetingID]
      const room = (meeting && meeting[m.roomId]) || { title: m.roomId }
      return (
        <div key={m.id} className={klass(m)}>
          <Icon name={name(m)} />
          <span>{room.title}</span>
        </div>)
    })
  }

  render() {
    const { user } = this.props
    return (
      <Table.Row>
        <Table.Cell className={css.username}>{user.username}</Table.Cell>
        <Table.Cell className={css.conferencesList}>{this.renderConferences()}</Table.Cell>
        <Table.Cell className={css.actionsCell}></Table.Cell>
      </Table.Row>
    )
  }
}

Switcher.propTypes = {
  user: object.isRequired,
  titlesMap: object.isRequired
}

