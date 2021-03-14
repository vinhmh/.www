import { connect } from 'react-redux'
import { bool } from 'prop-types'
import { Popup } from 'semantic-ui-react'
import css from './FloorPane.scss'

const name = 'Floor'

const FLOOR_STATE = {
  ACTIVE: 'active',
  DISABLED: 'disabled',
  NOT_CONFIGURED: 'not configured'
}

const getState = (configured, disabled) => {
  if (configured) {
    return disabled ? FLOOR_STATE.DISABLED : FLOOR_STATE.ACTIVE
  }
  return FLOOR_STATE.NOT_CONFIGURED
}

const getStyleFromState = (state) => {
  switch (state) {
    case FLOOR_STATE.ACTIVE:
      return css.featureOn
    case FLOOR_STATE.DISABLED:
      return css.featureDisabled
    case FLOOR_STATE.NOT_CONFIGURED:
      return css.featureOff
    default:
      return css.featureOff
  }
}

const getIconFromState = (state) => {
  switch (state) {
    case FLOOR_STATE.ACTIVE:
      return "fa-toggle-on"
    case FLOOR_STATE.DISABLED:
      return "fa-stop"
    case FLOOR_STATE.NOT_CONFIGURED:
      return "fa-toggle-off"
    default:
      return "fa-toggle-off"
  }
}

class FloorPane extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { floor, disabled } = this.props
    const state = getState(floor, disabled)

    return (
      <Popup
        trigger={<div className={getStyleFromState(state)}>
          <span><i className={`fa ${getIconFromState(state)} `}></i>&nbsp;&nbsp;{name}</span>
        </div>}
        content={`Floor is ${state} for this meeting`}
      />
    )
  }
}

FloorPane.propTypes = {
  floor: bool.isRequired,
  disabled: bool.isRequired
}

const mapStateToProps = () => ({
})

export default connect(mapStateToProps)(FloorPane)
