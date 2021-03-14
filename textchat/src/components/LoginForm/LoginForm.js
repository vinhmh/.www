import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { func, string } from 'prop-types'
import { Button, Form, Input, Select, Header, Icon } from 'semantic-ui-react'
import Socket from '../../socket'
import * as AppActions from '../../reducers/app'

import css from './LoginForm.scss'

class LoginForm extends React.Component {
  state = {
    loading: false,
    username: '',
    meetingID: '',
  }

  onLangChange = (e, { value }) => {
    const { appActions } = this.props
    appActions.updateLang(value)
  }

  onInputChange = (e, { name, value }) => this.setState({ [name]: value })

  onSubmit = () => {
    const { socketInit } = this.props
    const { username, meetingID } = this.state
    this.setState({ loading: true })

    socketInit({ username, meetingID })
  }

  render() {
    const { lang, socket } = this.props
    const { loading, username, meetingID } = this.state
    const submitDisabled = !(lang && username && meetingID)
    const options = helpers.langOptions()
    return (
      <div className={css.loginHolder}>
        <Header as="h1" className={css.header}>
          Audiobridge TextChat
          <Icon name="wechat" />
        </Header>
        <br />
        <Form className={css.loginForm} loading={loading && socket.active} onSubmit={this.onSubmit}>
          <Form.Field control={Select} value={lang} onChange={this.onLangChange} options={options} label="Language" placeholder="Select language" />
          <Form.Field control={Input} value={username} name="username" onChange={this.onInputChange} label="User Name" placeholder="Enter a name" />
          <Form.Field control={Input} value={meetingID} name="meetingID" onChange={this.onInputChange} label="Meeting" placeholder="Enter a Meeting" />
          <div className={css.btnBar}>
            <Button primary size="large" type="submit" disabled={submitDisabled}>START</Button>
          </div>
        </Form>
      </div>
    )
  }
}

LoginForm.propTypes = {
  lang: string,
  socketInit: func.isRequired,
}

const mapStateToProps = state => ({
  lang: state.app.lang,
  currentUser: state.currentUser,
  socket: state.socket,
})

const mapDispatchToProps = dispatch => ({
  appActions: bindActionCreators(AppActions, dispatch),
  socketInit: data => Socket.init(dispatch, data),
})

export default connect(mapStateToProps, mapDispatchToProps)(LoginForm)
