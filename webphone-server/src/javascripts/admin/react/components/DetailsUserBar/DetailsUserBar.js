import React from "react";
import { object, func } from 'prop-types'
import css from './DetailsUserBar.scss'
import { Button, Header, Container, Icon } from 'semantic-ui-react'
import { ROLES_FILTER } from "../../middleware/common";

const getRoleName = (user) => {

  if (user.isAdministrator) {
    return "Coordinator"
  }

  if (user.isModerator && user.role == ROLES_FILTER.MODERATOR) {
    return "Interpreter"
  }

  if (user.isTechAssistant) {
    return "Tech Assistant"
  }

  return "Participant"
}

class DetailsUserBar extends React.Component {

  render = () => {

    const { user, onClose, onDisconnect } = this.props

    return (
      < Container className={css.container}>
        <Header size='medium'>
          {user?.displayName}
          <Header.Subheader></Header.Subheader>
          <Button className={css.header_button} size='mini' color='red' onClick={() => { onDisconnect(user) }}><Icon name="remove user"></Icon>&nbsp;Disconnect</Button>
        </Header>
        <Button basic={true} circular icon='times' size='mini' onClick={() => { onClose() }} className={css.closeButton} />
      </ Container>
    )
  }
}

export default DetailsUserBar;

DetailsUserBar.propTypes = {
  user: object.isRequired,
  onClose: func.isRequired,
  onDisconnect: func.isRequired,
}
