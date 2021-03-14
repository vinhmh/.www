import React from "react";
import css from "./Footer.scss";
import { Container } from 'semantic-ui-react'

function Footer() {
  return (
    <footer className={css.area}>
      <Container textAlign='center'>
        <span className={css.copyright}>Copyright 2020 - ibridgepeople</span>
      </Container >
    </footer >
  )
}

export default Footer;