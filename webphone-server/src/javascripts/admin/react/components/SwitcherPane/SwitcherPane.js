import { connect } from 'react-redux'
import { bool } from 'prop-types'
import { Popup } from 'semantic-ui-react'
import css from './SwitcherPane.scss'

const name = 'Switcher'

const SWITCHER_STATE = {
  ACTIVE: 'active',
  NOT_CONFIGURED: 'not configured'
}

const getState = (configured) => {
  return configured ? SWITCHER_STATE.ACTIVE : SWITCHER_STATE.NOT_CONFIGURED
}

const getStyleFromState = (state) => {
  switch (state) {
    case SWITCHER_STATE.ACTIVE:
      return css.featureOn
    case SWITCHER_STATE.NOT_CONFIGURED:
      return css.featureOff
    default:
      return css.featureOff
  }
}

const getIconFromState = (state) => {
  switch (state) {
    case SWITCHER_STATE.ACTIVE:
      return "fa-toggle-on"
    case SWITCHER_STATE.NOT_CONFIGURED:
      return "fa-toggle-off"
    default:
      return "fa-toggle-off"
  }
}


class SwitcherPane extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { switcher } = this.props
    const state = getState(switcher)

    return (
      <Popup
        trigger={<div className={getStyleFromState(state)}>
          <span><i className={`fa ${getIconFromState(state)} `}></i>&nbsp;&nbsp;{name}</span>
        </div>}
        content={`Switcher is ${state} for this meeting`}
      />
    )
  }
}

SwitcherPane.propTypes = {
  switcher: bool.isRequired
}

const mapStateToProps = () => ({
})

export default connect(mapStateToProps)(SwitcherPane)
