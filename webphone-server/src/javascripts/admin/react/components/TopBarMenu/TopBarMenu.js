import { connect } from 'react-redux'
import { array, object } from 'prop-types'
import { Container, Menu, Icon, Image } from 'semantic-ui-react'
import LinkForm from '../LinkForm/'
import DemoMode from '../DemoMode'
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
    const { socket, meetings } = this.props;
    const connectionState = socket.active ? "olive" : socket.reconnecting ? "orange" : "grey";

    return (
      <Menu fixed="top"
        inverted
        pointing
        stackable
        fluid
        size='large'
        className={css.height}
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
          <Menu.Item><DemoMode /></Menu.Item>
          <Menu.Item><LinkForm meetings={meetings} meetingsMap={CONF_MAP.meetings} /></Menu.Item>
          <Menu.Item><span className={css.barConnection}><Icon name='wifi' color={connectionState} /></span></Menu.Item>
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
