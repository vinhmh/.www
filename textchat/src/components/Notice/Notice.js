import { object } from 'prop-types'
import css from './Notice.scss'

class Notice extends React.Component {
  closeBtn = () => (
    <i className={`fa fa-times ${css.closeBtn}`} onClick={this.props.noticeActions.hide} />
  )

  render() {
    const { message } = this.props.notice
    const { hide } = this.props.noticeActions

    if (!message) return null

    return (
      <div className={css.noticeHolder}>
        <div className={css.messageBox}>
          {message}
          {this.closeBtn()}
        </div>
        <div className={css.noticeOver} onClick={hide} />
      </div>
    )
  }
}

Notice.propTypes = {
  notice: object.isRequired,
  noticeActions: object.isRequired,
}

export default Notice

