import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { object, string } from 'prop-types'
import { Button, Form, Select, Icon } from 'semantic-ui-react'
import { Sender } from '../../socket'
import * as AppActions from '../../reducers/app'
import Messages from '../Messages'
import css from './Chat.scss'

class Chat extends React.Component {
  state = {
    loading: false,
    message: '',
  }

  onLanguageChange = (e, { value }) => {
    const { appActions } = this.props
    appActions.updateLang(value)
  }

  msgOnChange = (e, { name, value }) => this.setState({ [name]: value })

  msgOnKeyDown = (e) => {
    let handled = false

    if (e.keyCode === 13 && !e.shiftKey) {
      handled = true
      this.onSubmit()
    }
    if (handled) e.preventDefault()
  }

  onSubmit = () => {
    const { currentUser, lang, app } = this.props
    const { message } = this.state
    Sender.messageSend({
      text: message,
      userId: currentUser.id,
      meetingId: currentUser.meeting.id,
      sendTo: app.sendTo,
      lang,
    })
    this.setState({ message: '' })
  }

  render() {
    const { lang, currentUser } = this.props
    const { message, loading } = this.state
    const submitDisabled = !message
    const { conferences } = currentUser.meeting
    const options = helpers.langOptions(conferences)
    const value = lang || options[0].value

    return (
      <Form className={css.holder} loading={loading} onSubmit={this.onSubmit}>
        <Form.Field
          control={Select}
          value={value}
          onChange={this.onLanguageChange}
          options={options}
          placeholder="Select language"
        />
        <Messages />
        <Form.Group>
          <Form.TextArea
            value={message}
            name="message"
            onChange={this.msgOnChange}
            onKeyDown={this.msgOnKeyDown}
            placeholder="Enter message"
            className={css.textarea}
            autoHeight
          />
          <Button
            type="submit"
            size="large"
            primary
            icon
            disabled={submitDisabled}
          >
            <Icon name="send" />
          </Button>
        </Form.Group>
      </Form>
    )
  }
}

Chat.propTypes = {
  appActions: object.isRequired,
  currentUser: object.isRequired,
  lang: string.isRequired,
}

const mapStateToProps = (state) => ({
  currentUser: state.currentUser,
  lang: state.app.lang,
  app: state.app
})

const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(AppActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(Chat)
