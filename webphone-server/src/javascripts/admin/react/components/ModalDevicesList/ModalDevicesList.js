import React from 'react'
import { Button, Modal, Table, Label, Header } from 'semantic-ui-react'
import { bool, array } from 'prop-types'
import { DEVICE_TYPE, getDeviceType } from '../../middleware/common'
import css from './ModalDevicesList.scss'

const COLOR = {
  MICROPHONE_COLOR: 'teal',
  SPEAKER_COLOR: 'olive',
  CAMERA_COLOR: 'yellow',
  DEFAULT_COLOR: 'grey'
}

const getDeviceColor = (type) => {
  switch (type) {
    case DEVICE_TYPE.MICROPHONE:
      return COLOR.MICROPHONE_COLOR
    case DEVICE_TYPE.SPEAKER:
      return COLOR.SPEAKER_COLOR
    case DEVICE_TYPE.CAMERA:
      return COLOR.CAMERA_COLOR
    default:
      return COLOR.DEFAULT_COLOR
  }
}

export default class ModalDevicesList extends React.Component {

  onClose = () => {
    const { onClose } = this.props
    onClose()
  }

  renderDevice = (device, key) => {
    const type = getDeviceType(device.kind)
    const color = getDeviceColor(type)
    const isShared = !!device.label && !!device.deviceId
    const label = isShared ? device.label : "** Device not authorized **"

    return (
      <Table.Row key={key}>
        <Table.Cell>
          <span className={isShared ? css.label : css.errorLabel}>{label}</span>
        </Table.Cell>
        <Table.Cell textAlign='center'>
          <Label color={isShared ? color : null} size='small'>{type.toUpperCase()}</Label>
        </Table.Cell>
      </Table.Row>
    )
  }

  renderNone = () => {
    return (
      <Table.Row>
        <Table.Cell colSpan={2}>
          <span className={css.errorLabel}>No devices have been detected!</span>
        </Table.Cell>
      </Table.Row>
    )
  }

  render() {
    const { devices, open } = this.props
    const hasDevices = !!devices.length

    return (
      <Modal open={open} centered={false} onClose={this.onClose}>
        <Modal.Header>Devices found</Modal.Header>
        <Modal.Content scrolling>
          <Modal.Description>
            <p>Here is the complete list of devices found for that user</p>
            <Table singleLine fixed compact>
              <Table.Header>
                <Table.Row>
                  <Table.HeaderCell>Label</Table.HeaderCell>
                  <Table.HeaderCell textAlign='center'>Type</Table.HeaderCell>
                </Table.Row>
              </Table.Header>
              <Table.Body>
                {hasDevices ? devices.map((device, key) => (this.renderDevice(device, key))) : this.renderNone()}
              </Table.Body>
            </Table>
            <p className={css.note}>Note: Be careful, depending on the browser used, the list can be incomplete (no audio output)</p>
          </Modal.Description>
        </Modal.Content>
        <Modal.Actions>
          <Button primary onClick={this.onClose}>Close</Button>
        </Modal.Actions>
      </Modal>)
  }
}

ModalDevicesList.propTypes = {
  open: bool.isRequired,
  devices: array.isRequired,
}
