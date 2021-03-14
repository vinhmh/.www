import css from './ConferenceForm.scss'

const ROLES = {
  MODERATOR: 'moderator',
  REGULAR: 'regular',
  SWITCHER: 'switcher'
}

export default class ConferenceForm extends React.Component {
  state = {
    isModerator: false,
    error: null
  };

  static rolesOptions = [
    { value: ROLES.REGULAR, label: 'Regular' },
    { value: ROLES.MODERATOR, label: 'Moderator' }
  ];

  static conferencesOptions = ['70001', '70002', '70003', '70004', '70005']
    .map(roomId => ({
      value: roomId,
      label: roomId
    }))

  onRoleChange = (e) => {
    this.setState({ isModerator: e.target.value === ROLES.MODERATOR })
  };

  handleSubmit = () => {
    const data = this.formSerialize()
    if (data.error) {
      return this.setState({ error: data.error })
    }
    this.props.initConnection(data)
  };

  formSerialize() {
    const { isModerator } = this.state
    const result = {
      host: this.hostInput.value,
      username: this.usernameInput.value,
      id: this.usernameInput.value,
      password: this.passwordInput.value,
      isModerator,
      role: this.role.value,
      rooms: {
        first: this.cf1.value
      },
      roomsList: ConferenceForm.conferencesOptions.map(item => item.value),
      lounge: '80000',
      floor: '50000',
      titlesMap: { 70001: 'English', 70002: 'French', 70003: 'Spanish', 70004: 'German', 70005: 'Italian', 50000: 'Floor' },
      meetingID: 'demo',
      useFloor: this.useFloor.checked,
      useSwitcher: this.useSwitcher.checked,
    }
    if (isModerator) {
      result.rooms.second = this.cf2.value
      if (result.rooms.second === result.rooms.first) {
        result.error = 'Rooms should be different'
      }
    }
    return result
  }

  render() {
    const { isModerator, error } = this.state

    return (
      <div className="row">
        <div className="col-xs-6">
          <div className={css.formGroup}>
            <input ref={input => this.hostInput = input} placeholder="sip:host" defaultValue={CONFIG.voipHost} className="form-control" />
          </div>
          <div className={css.formGroup}>
            <input ref={input => this.usernameInput = input} placeholder="Username" className="form-control" defaultValue="user_1000" />
          </div>
          <div className={css.formGroup}>
            <input ref={input => this.passwordInput = input} placeholder="Password" className="form-control" defaultValue="webphone_1234" />
          </div>
          <div className={css.formGroup}>
            <label>
              Use Floor &nbsp;
              <input type="checkbox" ref={input => this.useFloor = input} className="form-control" />
            </label>
          </div>
          <div className={css.formGroup}>
            <label>
              Use Switcher &nbsp;
              <input type="checkbox" ref={input => this.useSwitcher = input} className="form-control" />
            </label>
          </div>
          <div className={css.formGroup}>
            <select ref={input => this.role = input} className="form-control" onChange={this.onRoleChange}>
              {ConferenceForm.rolesOptions.map(role => (
                <option key={role.value} value={role.value}>{role.label}</option>
              ))}
            </select>
          </div>
          <div className={css.formGroup}>
            <div className="col-xs-6">
              <select ref={input => this.cf1 = input} className="form-control" defaultValue="70001">
                {ConferenceForm.conferencesOptions.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            {isModerator
            && (
            <div className="col-xs-6">
              <select ref={input => this.cf2 = input} className="form-control" defaultValue="70002">
                {ConferenceForm.conferencesOptions.map(item => (
                  <option key={item.value} value={item.value}>{item.label}</option>
                ))}
              </select>
            </div>
            )}
          </div>
          {error && <p className="text-danger">{error}</p>}
          <button onClick={this.handleSubmit} className="btn btn-sm btn-primary" type="button">Connect</button>
        </div>
      </div>
    )
  }
}
