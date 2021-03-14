import { object, bool } from 'prop-types'
import cs from 'classnames'
import logo from './logo.png'
import css from './JoinMeeting.scss'
import * as Sender from '../../socket/sender'

class JoinMeeting extends React.Component {
  joinBbb = () => {
    const { user, onOpenBBB } = this.props
    const { joinUrl } = user.bbb
    const bbbWindow = window.open(joinUrl, '_blank', 'width=1000,height=800,left=224,top=0')

    this.bbbTimer = setInterval(() => {
      if (bbbWindow.closed) {
        clearInterval(this.bbbTimer)
        this.bbbTimer = null
        bbbWindow.close()
        Sender.bbbOff(user.id)
      }
    }, 500)
    Sender.bbbOn(user.id)
    onOpenBBB(bbbWindow)
    return false
  }

  joinCustom(url) {
    window.open(url, '_blank')
  }

  join = () => {
    const { user } = this.props
    const { joinUrl } = user.bbb

    if (user.platformUrl) {
      this.joinCustom(user.platformUrl)
    } else if (joinUrl) {
      this.joinBbb()
    }
  }

  render() {
    const { show, user } = this.props
    const missingExternal = !user.platformUrl && !user.bbb.joinUrl
    if (!show || missingExternal) { return null }

    return (
      <div className={css.overlay}>
        <div className={css.modal}>
          <div className={css.body}>
            <div className={css.logo}><img src={logo} /></div>
            <div className={css.title}>
              You're going to join your meeting
            </div>
            <div className={css.instruction} />
          </div>
          <div className={css.footer}>
            <div className={css.btn} onClick={this.join}>Join the Meeting</div>
          </div>
        </div>
      </div>

    )
  }
}

export default JoinMeeting
