import { Button } from 'semantic-ui-react'
import PropTypes from 'prop-types'
import css from './SwitcherForm.scss'

export default class SwitcherForm extends React.Component {
  constructor(props) {
    super(props)
    this.meetingID = React.createRef()
  }

  state = {
    disableBtn: true
  }

  componentDidUpdate(prevProps) {
    if (this.props.users.length !== prevProps.users.length) this.onKeyUp()
  }

  onKeyUp = () => {
    const { users, meetingsMap } = this.props
    const isDisable = (meetingID) => {
      const meeting = meetingsMap[meetingID]
      if (!meeting || !meeting.useSwitcher) return true

      const switcher = users.find(u => u.role === 'switcher' && u.meetingID === meetingID)
      return !!switcher
    }

    const disableBtn = isDisable(this.meetingID.current.value)
    this.setState({ disableBtn })
  }

  onLaunchClick = async () => {
    const meetingID = this.meetingID.current.value
    this.meetingID.current.value = ''
    this.setState({ disableBtn: true })
    const redirectWindow = window.open('', '_blank', 'width=224,height=800,left=0,top=0')
    redirectWindow.location.href = `${CONFIG.webphoneUrl}?meetingID=${meetingID}&role=switcher&secretToken=${CONFIG.secretToken}`
  }

  render() {
    const { disableBtn } = this.state
    return (
      <div className={css.switcherForm}>
        <div className={css.meetingField}>
          <input type="text" ref={this.meetingID} onKeyUp={this.onKeyUp} placeholder="ID Meeting" />
        </div>
        <Button disabled={disableBtn} onClick={this.onLaunchClick}>Launch Switcher</Button>
      </div>
    )
  }
}

SwitcherForm.propTypes = {
  meetingsMap: PropTypes.object.isRequired,
  users: PropTypes.array.isRequired,
}
