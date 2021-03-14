import React from "react";
import css from "./MeetingPlaceHolder.scss";
import { Icon, Header } from 'semantic-ui-react'

function MeetingPlaceHolder() {
  return (
    <div className={css.area}>
      <Header as='h2' icon textAlign='center'>
        <Icon name='users' circular />
        <Header.Content>It's quiet here!</Header.Content>
        <Header.Subheader>There is no ongoing meeting at this time</Header.Subheader>
      </Header>
    </div>
  )
}

export default MeetingPlaceHolder;