/* eslint react/no-array-index-key:0 */
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import PropTypes from 'prop-types'
import classnames from 'classnames'
import * as AppActions from '../../reducers/app'
import css from './TextChatScreen.scss'

class TextChatScreen extends React.Component {
  componentDidMount() {
    if (this.props.visible) {
      document.body.classList.add('no-scroll')
    }
  }

  componentDidUpdate() {
    if (this.props.visible) {
      document.body.classList.add('no-scroll')
    } else {
      document.body.classList.remove('no-scroll')
    }
  }


  closeTextChat = () => {
    const { appActions } = this.props
    appActions.displayTextChat(false)
  }

  render() {
    const { user, visible } = this.props
    const { meetingID, displayName, role } = user
    const lang = user.titlesMap[user.hearRoomId || user.rooms.first].code
    const textChatUrl = `${CONFIG.textChatUrl}?lang=${lang}&meetingID=${meetingID}&username=${displayName}&role=${role}`

    return (
      <div className={classnames(css.textchatScreen, { [css.visible]: visible })}>
        <div className={css.bar}>
          <span className={css.closeBtn} onClick={this.closeTextChat}>
            <i className="fa fa-times" />
          </span>
        </div>
        <iframe title="textchat" src={textChatUrl} />
      </div>
    )
  }
}

TextChatScreen.propTypes = {
  appActions: PropTypes.object.isRequired,
  user: PropTypes.object.isRequired,
  visible: PropTypes.bool.isRequired,
}

const mapStateToProps = state => ({
  user: state.currentUser,
})

const mapDispatchToProps = dispatch => ({
  appActions: bindActionCreators(AppActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(TextChatScreen)
