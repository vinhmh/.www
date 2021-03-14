import React, { Component } from 'react'
import css from './ChatRoomMessageList.scss'

class BadgeButton extends Component {
  render() {
    const { count, scrollToBottom } = this.props
    return (
      <div onClick={scrollToBottom} className={css.badgeButtonContainer}>
        <span onClick={this.handlePrev} className={css.angleIcon}>
          <i className="fa fa-angle-down" />
        </span>
        <div className={css.badgeCounter}>{count || 0}</div>
      </div>
    )
  }
}

export default BadgeButton
