/* eslint jsx-a11y/label-has-for: 0 */

import { object, func } from 'prop-types'
import Cookies from 'js-cookie'
import css from '../MediaSettings.scss'

export const PASS_INIT_CONFIGURATION = 'PASS_INIT_CONFIGURATION'

export default class IntroStep extends React.Component {
  skip = () => {
    const { actions } = this.props
    const final = () => {
      actions.setupDevices()
      actions.configure(true)
      actions.hideGuide()
    }
    actions.obtainDevices({ final })
  }

  next = () => this.props.next()

  onChangeInput = (e) => {
    if (e.target.checked) {
      Cookies.set(PASS_INIT_CONFIGURATION, e.target.checked, { expires: 365 })
    } else {
      Cookies.remove(PASS_INIT_CONFIGURATION)
    }
  }

  render() {
    return (
      <div className={css.introStep}>
        <p>Do you want to test your audio devices before your connection?</p>
        <p>This is not mandatory and you still able to configure them later.</p>
        <div className={css.btnLine}>
          <button className={css.btn} onClick={this.skip}>SKIP</button>
          <button className={css.btn} onClick={this.next}>GO</button>
        </div>
        <br />
        <label>
          <input type="checkbox" onChange={this.onChangeInput} />
          <span>Don't ask it anymore the next times at the connection.</span>
        </label>
      </div>
    )
  }
}

IntroStep.propTypes = {
  actions: object.isRequired,
  next: func.isRequired,
}
