import React from 'react'
import ReactJson from 'react-json-view'
import { Button, Modal } from 'semantic-ui-react'
import { object, bool } from 'prop-types'
import { Sender } from '../../socket'

export default class ModalUserState extends React.Component {

  componentDidMount() {
    this.refresh()
  }

  onClose = () => {
    const { onClose } = this.props
    onClose()
  }

  refresh = () => {
    const { user } = this.props
    Sender.getUserState(user.id)
  }

  render() {
    const { user, open } = this.props

    return (
      <Modal open={open} centered={false} onClose={this.onClose}>
        <Modal.Header>{user.displayName}</Modal.Header>
        <Modal.Content scrolling>
          <Modal.Description>
            <ReactJson src={user.userState} collapsed />
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={this.refresh}>Refresh</Button>
        </Modal.Actions>
      </Modal>)
  }
}

ModalUserState.propTypes = {
  open: bool.isRequired,
  user: object.isRequired,
}
