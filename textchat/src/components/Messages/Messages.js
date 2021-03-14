import { connect } from 'react-redux'
import { object, array, string } from 'prop-types'
import PerfectScrollbar from 'perfect-scrollbar'
import Message from './Message'
import css from './Messages.scss'

class Messages extends React.Component {
  constructor(props) {
    super(props)
    this.holderRef = React.createRef()
    this.listRef = React.createRef()
  }

  componentDidMount() {
    const holder = this.holderRef.current
    this.ps = new PerfectScrollbar(holder, {
      suppressScrollX: true,
    })
    this.scrollBottoms()
    window.addEventListener('resize', () => this.ps.update())
  }

  getSnapshotBeforeUpdate() {
    const holder = this.holderRef.current
    const list = this.listRef.current
    return {
      diff: list.scrollHeight - (holder.offsetHeight + holder.scrollTop),
    }
  }

  componentDidUpdate(prevProps, prevState, snapshot) {
    this.ps.update()
    if (snapshot.diff <= 0) this.scrollBottoms()
  }

  scrollBottoms() {
    const ps = this.holderRef.current
    const list = this.listRef.current
    ps.scrollTop = list.scrollHeight - ps.offsetHeight
  }

  render() {
    const { currentUser, lang, messages, app } = this.props
    // let allMessage = messages
    // eslint-disable-next-line radix,max-len
    const allMessage = messages.filter(
      (m) =>
        // (m.sendTo
        //   .split(',')
        //   .map((m) => parseInt(m))
        //   .includes(parseInt(currentUser.audioDeskUId)) 
        //   ||
        //   parseInt(currentUser.audioDeskUId) === parseInt(m.user.audioDeskUId) 
        //   ||
        //   m.sendTo === app.sendTo) 
        //   &&
        m.meeting.id == currentUser.meeting.id
    )
    return (
      <div className={css.holder} ref={this.holderRef}>
        <div className={css.list} ref={this.listRef}>
          {allMessage.map((m) => (
            <Message
              key={m.id}
              currentUser={currentUser}
              lang={lang}
              message={m}
            />
          ))}
        </div>
      </div>
    )
  }
}

Messages.propTypes = {
  currentUser: object.isRequired,
  lang: string.isRequired,
  messages: array.isRequired,
}

const mapStateToProps = (state) => ({
  currentUser: state.currentUser,
  lang: state.app.lang,
  messages: state.messages,
  app: state.app,
})

export default connect(mapStateToProps)(Messages)
