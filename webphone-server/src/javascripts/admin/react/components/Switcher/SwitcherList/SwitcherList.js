import PropTypes from 'prop-types'
import { Confirm, Table } from 'semantic-ui-react'
import classnames from 'classnames'
import Switcher from './Switcher'
import css from './SwitcherList.scss'

export default class SwitcherList extends React.Component {
  state = {}

  filterSwitchers() {
    const { users, filter } = this.props
    if (filter.meetingId !== 'all') {
      return users.filter(u => u.isSwitcher && u.meetingId == filter.meetingId);
    } else {
      return users.filter(u => u.isSwitcher);
    }
  }

  render() {
    const { titlesMap } = this.props
    const switchers = this.filterSwitchers()

    return (
      <div className={css.tableHolder}>
        <Table basic="very">
          <Table.Header>
            <Table.Row>
              <Table.HeaderCell>Username</Table.HeaderCell>
              <Table.HeaderCell>Conferences</Table.HeaderCell>
              <Table.HeaderCell>Actions</Table.HeaderCell>
            </Table.Row>
          </Table.Header>
          <Table.Body>
            {switchers.map((user) => <Switcher key={user.id} user={user} titlesMap={titlesMap} />)}
          </Table.Body>
        </Table>
      </div>
    )
  }
}

SwitcherList.propTypes = {
  filter: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
  titlesMap: PropTypes.object.isRequired,
}
