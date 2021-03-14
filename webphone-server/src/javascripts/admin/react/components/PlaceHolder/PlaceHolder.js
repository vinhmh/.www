import React from "react";
import css from "./PlaceHolder.scss";
import { Segment } from 'semantic-ui-react'

function PlaceHolder() {

  return (
    <Segment className={css.segment}>
      Zzz! - Either this conference is free or some filters hide the users connected
    </Segment>
  );
}

export default PlaceHolder;
