import React from "react";
import { Button, Dropdown, Icon } from 'semantic-ui-react'

function MeetingMenu({
  hasUsers,
  hasInterpreters,
  hasParticipants,
  onMuteAll,
  onReconnectAll,
  onDisconnectAll,
  onSendMessageToAll,
  onSendMessageToAllInterpreters }) {

  return (
    <Button.Group color='blue' size='small' compact>
      <Dropdown
        disabled={!hasUsers}
        text="Meeting&nbsp;"
        floating
        button
        className='icon'>

        <Dropdown.Menu>
          <Dropdown.Header>Participants and Interpreters</Dropdown.Header>
          <Dropdown.Item onClick={onSendMessageToAll}><Icon name='chat' color='olive' />Send message</Dropdown.Item>
          <Dropdown.Item onClick={onMuteAll}><Icon name='mute' color='orange' />Mute all</Dropdown.Item>
          <Dropdown.Item onClick={onReconnectAll}><Icon name='user times' color='blue' />Reconnect all</Dropdown.Item>
          <Dropdown.Item onClick={onDisconnectAll}><Icon name='user times' color='red' />Disconnect All</Dropdown.Item>
          <Dropdown.Divider />
          <Dropdown.Header>Interpreters only</Dropdown.Header>
          <Dropdown.Item onClick={onSendMessageToAllInterpreters} disabled={!hasInterpreters}><Icon name='chat' color='green' />Send message to all</Dropdown.Item>

        </Dropdown.Menu>
      </Dropdown>
    </Button.Group>
  )
}

export default MeetingMenu;