import { connect } from 'react-redux'
import { object } from 'prop-types'
import {
  Message,
  Button,
  Icon
} from 'semantic-ui-react'

class ConnectionPopup extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const attemptsAborted = this.props.socket.aborted;
    return (
      <Message icon negative>
        {attemptsAborted && (
          <Icon name='exclamation triangle' />
        )}
        {!attemptsAborted && (
          <Icon name='spinner' loading />
        )}
        <Message.Content>
          <Message.Header>{attemptsAborted ? "Can't connect to the server" : "Connection in progress..."}</Message.Header>
          {attemptsAborted ? "Either the monitoring has a network issue or the server is down" : "Please wait! Monitoring is disconnected and new attempts to connect are in progress during 30s."}
        </Message.Content>
        {attemptsAborted && (
          <Button negative onClick={() => window.location.reload()}>
            Reload Monitoring
          </Button>
        )}
      </Message>
    )
  }
}

ConnectionPopup.propTypes = {
  socket: object.isRequired
}

const mapStateToProps = state => ({
  socket: state.socket
})

export default connect(mapStateToProps)(ConnectionPopup)