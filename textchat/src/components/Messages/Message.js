import { object, string } from 'prop-types'
import classnames from 'classnames'
import moment from 'moment'
import css from './Messages.scss'

class Message extends React.Component {
  shouldComponentUpdate(nextProps) {
    const { message, lang } = this.props
    return (message.user.meeting !== nextProps.message.user.meeting)
      || (lang !== nextProps.lang)
  }

  render() {
    const { currentUser, lang, message } = this.props
    const isMe = currentUser.id === message.user.id
    const props = { className: classnames(css.message, { [css.me]: isMe }) }

    return (
      <div {...props}>
        <div className={css.bar}>
          <div className={css.username}>
            {message.user.username}
          </div>
          <div className={css.timestamp}>
            {moment(message.createdAt).format('HH:mm')}
          </div>
        </div>
        <div className={css.text}>
          {message.text[lang]}
        </div>
      </div>)
  }
}

Message.propTypes = {
  currentUser: object.isRequired,
  lang: string.isRequired,
  message: object.isRequired,
}

export default Message
