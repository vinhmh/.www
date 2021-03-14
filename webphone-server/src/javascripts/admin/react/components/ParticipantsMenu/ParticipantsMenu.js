import React from "react";
import { Button, Dropdown, Icon } from 'semantic-ui-react'

function ParticipantsMenu({
  hasUsers,
  hasParticipants,
  onSendMessageToAllParticipants,
  onMuteAllParticipants,
  onDisconnectAllPartcipants,
  onReconnectAllParticipants,
  title,
  color }) {

  return (
    <Button.Group color={color} size='small' compact>
      <Dropdown
        disabled={!hasUsers}
        text="Actions&nbsp;"
        floating
        button
        className='icon'>

        <Dropdown.Menu>
          <Dropdown.Header>{title}</Dropdown.Header>
          <Dropdown.Divider />
          <Dropdown.Item onClick={onSendMessageToAllParticipants} disabled={!hasParticipants}><Icon name='chat' color='olive' />Send message</Dropdown.Item>
          <Dropdown.Item onClick={onMuteAllParticipants} disabled={!hasParticipants}><Icon name='mute' color='orange' />Mute all</Dropdown.Item>
          <Dropdown.Item onClick={onReconnectAllParticipants} disabled={!hasParticipants}><Icon name='user times' color='blue' />Reconnect all</Dropdown.Item>
          <Dropdown.Item onClick={onDisconnectAllPartcipants} disabled={!hasParticipants}><Icon name='user times' color='red' />Disconnect All</Dropdown.Item>
        </Dropdown.Menu>
      </Dropdown>
    </Button.Group>
  )
}

export default ParticipantsMenu;