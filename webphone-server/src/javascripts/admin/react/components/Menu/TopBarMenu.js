import { connect } from 'react-redux'
import { array, object } from 'prop-types'
import {
  Container,
  Menu,
  Icon,
  Image,
  Popup
} from 'semantic-ui-react'
import css from './TopBarMenu.scss'

class TopBarMenu extends React.Component {
  constructor(props) {
    super(props)
  }

  state = {
    filter: {
      role: 'all',
      meetingId: 'all',
      conferenceId: 'all'
    }
  }

  render() {
    const { meetings, users, socket } = this.props;
    const distinctConferences = [...new Set(users.map(x => x.meetingID))];
    const connected = users.filter(x => x.connected)
    const hasWaiting = connected.length < users.length;
    const connectionState = socket.active ? "green" : socket.reconnecting ? "orange" : "grey";

    return (
      <Menu fixed="top"
        inverted
        pointing
        stackable
        fluid
        size='large'
      >
        <Menu.Menu position='left'>
          <Image className={css.barLogo} src='/images/logo.png' avatar />
        </Menu.Menu>
        <Container>
          <Menu.Item as='a' href='/admin' >Meeting form</Menu.Item>
          <Menu.Item as='a' href='/connect?skipBrowserID=true'>User form</Menu.Item>
          <Menu.Item as='a' href='/connect/interpreter?skipBrowserID=true'>Interpreter form</Menu.Item>
          <Menu.Item as='a' href='/connect/coordinator?skipBrowserID=true'>Coordinator form</Menu.Item>
          <Menu.Item as='a' href='/admin/monitor' active>Monitor</Menu.Item>
          <Menu.Item as='a' href='/admin/switcher'>Switcher</Menu.Item>
        </Container>
        <Menu.Menu position='right'>
          <span className={css.barConnection}>
            <Icon name='circle' color={connectionState} />
          </span>
          <Popup
            content="Number of meetings"
            mouseEnterDelay={500}
            trigger={<span className={css.barItem}><Icon className={css.barIcon} name='clipboard outline' /><span className={css.barValue}>{Object.keys(meetings).length}</span></span>}
          />
          <Popup
            content="Number of active meetings"
            mouseEnterDelay={500}
            trigger={<span className={css.barItem}><Icon className={css.barIcon} name='unmute' /><span className={css.barValue}>{distinctConferences.length}</span></span>}
          />
          <Popup
            content="Number of active sessions"
            mouseEnterDelay={500}
            trigger={<span className={users.length > 0 ? css.barItemWide : css.barItem}><Icon className={css.barIcon} name='user' /><span className={hasWaiting ? css.barValueYellow : css.barValue}>{users.length > 0 ? ` ${connected.length} / ${users.length}` : `0`}</span></span>}
          />
        </Menu.Menu>
      </Menu >
    )
  }
}

TopBarMenu.propTypes = {
  meetings: object.isRequired,
  users: array.isRequired,
  socket: object.isRequired
}

const mapStateToProps = state => ({
  meetings: state.meetings,
  users: state.users,
  socket: state.socket
})

export default connect(mapStateToProps)(TopBarMenu)