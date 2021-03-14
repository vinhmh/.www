import React from 'react'
import { Button, Modal, Icon, Input, Radio, Form, Select, Popup } from 'semantic-ui-react'
import QRCode from 'davidshimjs-qrcodejs'
import css from './ModalQrcode.scss'
import PropTypes from 'prop-types'

export default class ModalQrcode extends React.Component {
  constructor(props) {
    super(props)
    this.qrCodeRef = React.createRef()
    this.qrcode = null
  }

  initialState = {
    page: 'login',
    username: '',
    conference: '',
    open: false
  }

  state = this.initialState

  get url() {
    const { appUrl, webphoneUrl, meetingID } = this.props
    const { page, username, conference } = this.state
    if (page === 'login') return appUrl

    return `${webphoneUrl}?username=${username}&meetingID=${meetingID}&cf1=${conference}`
  }

  onOpen = () => this.setState({ ...this.initialState, open: true })

  onClose = () => {
    this.qrcode = null
    this.setState({ open: false })
  }
  
  generate = () => {
    if (!this.qrcode) {
      return this.qrcode = this.initQrcode()
    }
    this.qrcode.makeCode(this.url)
  }

  initQrcode = () => new QRCode(this.qrCodeRef.current, {
    text: this.url,
    width: 192,
    height: 192,
    colorDark: '#000000',
    colorLight: '#ffffff',
    correctLevel: QRCode.CorrectLevel.H
  })

  handleChange = (e, { name, value }) => {
    if (name === 'page') {
      const img = this.qrCodeRef.current.querySelector('img')
      if (img) img.style.display = 'none'
    }
    this.setState({ [name]: value }, this.generate)
  }

  btnDisabled = () => {
    const { page, conference } = this.state
    if (page === 'login') return false

    return !conference
  }

  render() {
    const { page, username, language } = this.state
    const { meetingsMap, meetingID } = this.props
    const meeting = meetingsMap[meetingID]

    return (
      <>
        <Popup
          trigger={
            <div className={css.featureOn} onClick={() => { this.onOpen() }} >
              <span>
                <Icon name="qrcode" />
                QR Code
              </span>
            </div>}
          content={`Generate a QR Code for this meeting`}
        />
        <Modal open={this.state.open} centered={false} size="small" onOpen={this.onOpen} onClose={this.onClose} closeOnEscape={true}
          closeOnDimmerClick={true}>
        <Modal.Header>QRcode for {meetingID}</Modal.Header>
        <Modal.Content>
          <Modal.Description>
            <div className="ui two column grid container">
              <div className="column">
                <Form error={!meeting}>
                  <Form.Field>
                    <Radio
                      label="Login"
                      name="page"
                      value="login"
                      checked={page === 'login'}
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                  <Form.Field>
                    <Radio
                      label="Audiodesk"
                      name="page"
                      value="webphone"
                      checked={page === 'webphone'}
                      onChange={this.handleChange}
                    />
                  </Form.Field>
                  {
                    page === 'webphone'
                    && (
                      <React.Fragment>
                        <Form.Field
                          control={Input}
                          label="Username"
                          placeholder="Username"
                          name="username"
                          value={username}
                          onChange={this.handleChange}
                        />
                        <Form.Field>
                          <label>Language</label>
                          {
                            meeting ?
                              <Select
                                placeholder="Select your country"
                                value={language}
                                name="conference"
                                onChange={this.handleChange}
                                options={meetingsMap[meetingID].conferences.map(c => ({ key: c.code, value: c.number, text: c.title }))}
                              />
                              :
                              <div className="ui error message">
                                <p>No config map for {meetingID}!</p>
                              </div>
                          }
                        </Form.Field>
                      </React.Fragment>
                    )
                  }
                </Form>
                <Button primary onClick={this.generate} disabled={this.btnDisabled()}>Generate</Button>
              </div>
              <div className="column">
                <div ref={this.qrCodeRef} />
              </div>
            </div>
          </Modal.Description>
        </Modal.Content>
      </Modal>
      </>
    )
  }
}

ModalQrcode.propTypes = {
  appUrl: PropTypes.string.isRequired,
  meetingID: PropTypes.string.isRequired,
  meetingsMap: PropTypes.object.isRequired,
  webphoneUrl: PropTypes.string.isRequired,
}
