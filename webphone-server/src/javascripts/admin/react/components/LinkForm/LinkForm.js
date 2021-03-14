import PropTypes from 'prop-types'
import { BitlyClient } from 'bitly'
import css from './LinkForm.scss'
import { Button, Dropdown, Icon, Input, Modal, Header, Checkbox, Form, Radio, Select } from 'semantic-ui-react'

const bitly = new BitlyClient('2dcba636e27167543ea42fb15aa7a2d197c7556b', {})

export default class LinkForm extends React.Component {
  initialState = {
    meetingOption: 'custom',
    meetingID: '',
    language1: '',
    language2: '',
    password: '',
    name: '',
    isModerator: false,
    link: null,
  }

  state = this.initialState

  copyToClipboard = () => {
    const el = document.createElement('textarea')
    el.value = this.state.link
    document.body.appendChild(el)
    el.select()
    document.execCommand('copy')
    document.body.removeChild(el)
  };

  handleChange = (e, { name, value }) => {
    this.setState({ [name]: value, link: null }, this.generate)
  }

  toggleModerator = () => {
    const { isModerator } = this.state
    const state = {
      isModerator: !isModerator,
      link: null,
    }
    if (isModerator) {
      state.language2 = ''
    }
    this.setState(state)
  }

  clearState = () => this.setState(this.initialState)

  generateLink = async () => {
    let url = window.location.origin
    const { meetingID, language1, language2, password, isModerator, name } = this.state
    const params = $.param({ meetingID, language1, language2, password, name })
    url += isModerator ? '/connect/interpreter' : '/connect'
    url += `?${params}`
    const response = await bitly.shorten(url)
    this.setState({ link: response.link })
  }

  render() {
    const { meetingOption, meetingID, language1, language2, password, isModerator, link, name } = this.state
    const { meetingsMap } = this.props

    const button = (
      <Icon name="linkify" className={css.action} />
    )
    const meeting = meetingsMap[meetingID]

    return (
      <Modal trigger={button} size="tiny" centered={false} onClose={this.clearState}>
        <Header icon="linkify" content="Generate link" />
        <Modal.Content>
          <Form>
            <Form.Field>
              <Checkbox
                label="Moderator"
                name="moderator"
                onChange={this.toggleModerator}
                checked={isModerator}
              />
            </Form.Field>
            <Form.Field>
              <Radio
                label="Custom meeting"
                name="meetingOption"
                value="custom"
                checked={meetingOption === 'custom'}
                onChange={this.handleChange}
              />
            </Form.Field>
            <Form.Field>
              <Radio
                label="Select meeting from config"
                name="meetingOption"
                value="selected"
                checked={meetingOption === 'selected'}
                onChange={this.handleChange}
              />
            </Form.Field>
            {meetingOption === 'custom' && (
              <Form.Field
                control={Input}
                label="Meeting"
                placeholder="Meeting"
                name="meetingID"
                value={meetingID}
                onChange={this.handleChange}
              />
            )}
            {meetingOption === 'selected' && (
              <Form.Field>
                {
                  <Select
                    placeholder="Choose meeting"
                    value={meetingID}
                    name="meetingID"
                    onChange={this.handleChange}
                    options={Object.keys(meetingsMap).map(m => ({ key: m, value: m, text: m }))}
                  />
                }
              </Form.Field>
            )}
            {meeting && (
              <Form.Field>
                <label>Language 1</label>
                <Dropdown
                  clearable
                  onChange={this.handleChange}
                  options={meetingsMap[meetingID].conferences
                    .filter(c => c.number !== language2)
                    .map(c => ({ key: c.code, value: c.number, text: c.title }))}
                  placeholder="Select language1"
                  name="language1"
                  selection
                  value={language1}
                />
              </Form.Field>
            )}
            {meeting && isModerator && (
              <Form.Field>
                <label>Language 2</label>
                <Dropdown
                  clearable
                  onChange={this.handleChange}
                  options={meetingsMap[meetingID].conferences
                    .filter(c => c.number !== language1)
                    .map(c => ({ key: c.code, value: c.number, text: c.title }))}
                  placeholder="Select language2"
                  selection
                  name="language2"
                  value={language2}
                />
              </Form.Field>
            )}
            {
              isModerator && (
                <Form.Field
                  control={Input}
                  label="Name"
                  placeholder="Name"
                  name="name"
                  value={name}
                  onChange={this.handleChange}
                />
              )
            }
            {
              isModerator && (
                <Form.Field
                  control={Input}
                  label="Password"
                  placeholder="Password"
                  name="password"
                  value={password}
                  onChange={this.handleChange}
                />
              )
            }
          </Form>
          {!link && <Button type="button" primary onClick={this.generateLink}>Get Link</Button>}
          {
            link && (
              <Input
                value={link}
                action={{ icon: 'copy outline', color: 'blue', onClick: this.copyToClipboard }}
              />
            )}
        </Modal.Content>
      </Modal>

    )
  }
}

LinkForm.propTypes = {
  meetings: PropTypes.object.isRequired,
  meetingsMap: PropTypes.object.isRequired,
}
