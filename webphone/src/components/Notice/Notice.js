import { object, bool } from 'prop-types'
import classnames from 'classnames'
import css from './Notice.scss'

export const RELAY_ACTIONS = {
  TAKE_OVER_MSG: 'Take over?',
  OK_MSG: 'Ok',
  NOT_YET_MSG: 'Not yet',
  HELP_MSG: 'Help! Now please',
};

class Notice extends React.Component {
  closeBtn = () => (
    <i className={`fa fa-times-circle ${css.closeBtn}`} onClick={this.props.noticeActions.hide} />
  )

  render() {
    let { message } = this.props.notice
    const { hide } = this.props.noticeActions

    if (!message) return null

    const className = classnames(css.noticeHolder, {
      [css.relayMsg]: message.msg,
    })

    if (message.msg) {
      if (Object.keys(RELAY_ACTIONS).includes(message.msg)) {
        message = RELAY_ACTIONS[message.msg]
      } else {
        message = message.msg
      }
    }

    return (
      <div className={className}>
        <div className={css.messageBox} onClick={hide}>
          {message.split('\n').map((line, i) => (
            <p key={i} className={css.messageLine}>{line}</p>
          ))}
          {this.closeBtn()}
        </div>
      </div>
    );
  }
}

Notice.propTypes = {
  notice: object.isRequired,
  noticeActions: object.isRequired,
}

export default Notice
