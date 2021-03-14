import React from 'react'
import { Button, Modal, Form, TextArea } from 'semantic-ui-react'
import { object, bool, array, func } from 'prop-types'
import { Sender } from '../../socket'

export default class ModalUserMessage extends React.Component {
  constructor(props) {
    super(props)
    this.state = {
      message: "",
    }
  }

  onClose = () => {
    const { onClose } = this.props
    onClose()
  }

  sendMsg = () => {
    const { users, onClose } = this.props
    users.forEach(user => {
      Sender.notify(user.id, `IBP Staff: ${this.state.message}`)
    })
    onClose()
  }

  render() {
    const { users, open, kind } = this.props

    const title = users.length === 1 ? users[0].displayName : `Send to all ${kind}`

    return (
      <Modal closeOnDimmerClick={false} closeOnEscape={false} open={open} centered={false} onClose={this.onClose} size="tiny">
        <Modal.Header>{title}</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <Form style={{ margin: 0 }}>
              <TextArea placeholder="Send message" onChange={(event) => {
                this.setState({ message: event.target.value })
              }} />
            </Form>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button onClick={this.onClose}>Cancel</Button>
          <Button primary onClick={this.sendMsg} disabled={this.state.message.length === 0}>Send</Button>
        </Modal.Actions>
      </Modal>)
  }
}

ModalUserMessage.propTypes = {
  open: bool.isRequired,
  users: array.isRequired,
  onClose: func.isRequired
}
