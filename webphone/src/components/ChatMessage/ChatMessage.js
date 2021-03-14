import React from "react";
import css from "./ChatMessage.scss";

export default function ChatMessage(props) {
  return (
    <div
      className={
        props.isSend
          ? css.chatMessageContainer + ' ' + css.userMessage
          : css.chatMessageContainer
      }
    >
      <div className={css.messageContainer}>
        <p className={css.chatMessageName}>Bradi Maxime</p>
        <p className={css.chatMessage}>
          Where is the nearest place Where is the nearest place
        </p>
      </div>
    </div>
  )
}
