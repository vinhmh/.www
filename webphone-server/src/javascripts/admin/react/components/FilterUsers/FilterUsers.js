import { connect } from 'react-redux'
import { string, func } from 'prop-types'
import { Icon, Dropdown } from 'semantic-ui-react'
import { ISSUES_FILTER, ROLES_FILTER, ROLES_DISPLAY_TYPE } from '../../middleware/common'
import css from './FilterUsers.scss'

const COMPONENT = {
  ROLE: 'Role',
  ISSUES: 'Issues'
}

const FILTER_COLOR = {
  ACTIVE: 'blue',
  PASSIVE: 'grey'
}

const issueOptions = () => {
  const options = [];

  Object.keys(ISSUES_FILTER).forEach(key => {
    const issue = ISSUES_FILTER[key];
    options.push({ key: issue, text: issue, value: issue });
  })
  return options;
}

const roleOptions = () => {

  const getRoleNameFromRole = (role) => {
    if (role === ROLES_FILTER.MODERATOR) {
      return ROLES_DISPLAY_TYPE.INTERPRETER
    }
    if (role === ROLES_FILTER.REGULAR) {
      return ROLES_DISPLAY_TYPE.PARTICIPANT
    }

    return role
  }

  const options = [];

  Object.keys(ROLES_FILTER).forEach(key => {
    const role = ROLES_FILTER[key]
    options.push({ key: role, text: getRoleNameFromRole(role), value: role });
  })
  return options;
}

class FilterUsers extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {

    const { role, issue, onFilterChange } = this.props

    return (
      <>
        <span>
          <Icon name="filter" color={role !== ROLES_FILTER.ALL ? FILTER_COLOR.ACTIVE : FILTER_COLOR.PASSIVE} />
          {COMPONENT.ROLE}: &nbsp;
          <Dropdown
            inline
            placeholder={ROLES_FILTER.ALL}
            options={roleOptions()}
            value={role}
            onChange={(e, data) => onFilterChange('role', data.value)}
          />
        </span>
        <span style={{ "marginLeft": "16px" }}>
          <Icon name="filter" color={issue !== ISSUES_FILTER.NO_FILTER ? FILTER_COLOR.ACTIVE : FILTER_COLOR.PASSIVE} />
          {COMPONENT.ISSUES}: &nbsp;
          <Dropdown
            inline
            placeholder={ISSUES_FILTER.NO_FILTER}
            options={issueOptions()}
            value={issue}
            onChange={(e, data) => onFilterChange('issue', data.value)}
          />
        </span>
      </>
    )
  }
}

FilterUsers.propTypes = {
  role: string.isRequired,
  issue: string.isRequired,
  onFilterChange: func.isRequired
}

const mapStateToProps = () => ({
})

export default connect(mapStateToProps)(FilterUsers)
