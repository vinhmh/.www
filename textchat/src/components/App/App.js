import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { object, func } from 'prop-types'
import { Loader } from 'semantic-ui-react'
import * as AppActions from '../../reducers/app'
import Socket from '../../socket'
import LoginForm from '../LoginForm'
import GetParam from '../GetParams'
import Chat from '../Chat'
import css from './App.scss'

class App extends React.Component {
  state = { show: false }

  componentDidMount() {
    const { appActions, socketInit } = this.props
    const params = GetParam()
    const { lang, meetingID, username, toChannel } = params
    if (lang && meetingID && username) {
      appActions.update({ loading: true, lang, sendTo: toChannel })
      socketInit(params)
    }
    const show = () => this.setState({ show: true })
    setTimeout(show) // prevent css flickiring
  }

  static defineScreen(screen) {
    switch (screen) {
      case AppActions.CHAT_SCREEN:
        return <Chat />
      default:
        return <LoginForm />
    }
  }

  render() {
    const { app } = this.props
    const { show } = this.state
    if (!show) return null

    let screen = (
      <Loader active inline="centered">
        Loading
      </Loader>
    )
    if (!app.loading) screen = App.defineScreen(app.screen)

    return <div className={css.container}>{screen}</div>
  }
}

App.propTypes = {
  app: object.isRequired,
  appActions: object.isRequired,
  socketInit: func.isRequired,
}

const mapStateToProps = (state) => ({
  app: state.app,
})

const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(AppActions, dispatch),
  socketInit: (data) => Socket.init(dispatch, data),
})

export default connect(mapStateToProps, mapDispatchToProps)(App)
