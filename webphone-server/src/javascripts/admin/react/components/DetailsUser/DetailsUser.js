import React from "react";
import { object, func } from 'prop-types'
import css from './DetailsUser.scss'
import { Button, Label, Icon, Grid, Accordion, Container } from 'semantic-ui-react'
import { getEquipmentType, getEquipmentBrowser, getEquipmentSystem, getCollaborationTool, getEquipmentAudio, getPhoneStatus, getNetworkCandidates } from "../../middleware/common";

class DetailsUser extends React.Component {

  state = {
    activeIndex: [0, 1, 2, 3, 4, 5, 6],
  }

  handleClick = (e, titleProps) => {
    const { index } = titleProps
    const { activeIndex } = this.state

    const isDisplayed = activeIndex.includes(index);
    if (isDisplayed) {
      this.setState({ activeIndex: activeIndex.filter((item) => (item != index)) })
    } else {
      this.setState({ activeIndex: [...activeIndex, index] })
    }
  }

  render = () => {

    const { user, onDebug, onDevices, onSaveJanus } = this.props
    const { userState, titlesMap } = user
    const { debugInfo, mediaSettings } = userState
    const { devices } = mediaSettings
    const { browser, os } = debugInfo.browserData
    const { turnStun, janusLog } = debugInfo

    const { activeIndex } = this.state

    const equipmentInfo = getEquipmentType(os)
    const browserInfo = getEquipmentBrowser(browser)
    const systemInfo = getEquipmentSystem(os)
    const collabInfo = getCollaborationTool(user)
    const audioInfo = getEquipmentAudio(mediaSettings)
    const phoneInfo = getPhoneStatus(user)
    const candidates = getNetworkCandidates(turnStun)

    const getRoomNameFromNumber = (number, rooms) => {
      return rooms[number]?.title || number
    }

    return (
      < Container className={css.container}>
        <Accordion exclusive={true} >
          <Accordion.Title
            className={css.category}
            active={activeIndex.includes(0)}
            index={0}
            onClick={this.handleClick}
          >
            <Icon name='dropdown' />
             Audio
          </Accordion.Title>
          <Accordion.Content active={activeIndex.includes(0)}>
            <Grid columns={2}>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Microphone</Grid.Column>
                <Grid.Column width={10}>
                  <Label basic className={css.contentValue} color={audioInfo.supportedIntput ? 'olive' : 'orange'} size='tiny'>{audioInfo.textInput}</Label>
                  <span className={css.contentValueNok} ><Icon name='microphone' color={audioInfo.supportedIntput ? 'olive' : 'grey'} />{`x ${audioInfo.nbInput}`}</span>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Speaker</Grid.Column>
                <Grid.Column width={10}>
                  <Label basic className={css.contentValue} color={audioInfo.supportedOutput ? 'olive' : 'orange'} size='tiny'>{audioInfo.textOutput}</Label>
                  <span className={css.contentValueNok} ><Icon name={audioInfo.supportedOutput ? 'volume up' : 'volume off'} color={audioInfo.supportedOutput ? 'olive' : 'grey'} />{`x ${audioInfo.nbOutput}`}</span>
                </Grid.Column>
              </Grid.Row>

              <Grid.Row className={css.row}>
                <Grid.Column width={6} className={css.label}></Grid.Column>
                <Grid.Column width={10}>
                  <Button icon='list alternate outline' size='mini' content='Full devices list' onClick={() => { onDevices(devices || []) }} />
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Accordion.Content>

          <Accordion.Title
            className={css.category}
            active={activeIndex.includes(1)}
            index={1}
            onClick={this.handleClick}
          >
            <Icon name='dropdown' />
            Equipment
          </Accordion.Title>
          <Accordion.Content active={activeIndex.includes(1)}>
            <Grid columns={2}>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>System</Grid.Column>
                <Grid.Column width={10}>
                  <Label basic className={css.contentValue} color={systemInfo.color} size='tiny'>{systemInfo.text}</Label>
                  {systemInfo.known && (
                    <>
                      <span className={css.contentValueNok}><Icon name={systemInfo.icon} color='grey' />{`${systemInfo.version}`}</span>
                      <span className={css.contentValueNok}><Icon name={equipmentInfo.icon} color='grey' />{`${equipmentInfo.text}`}</span>
                    </>
                  )}
                  {!systemInfo.supported && (
                    <span className={css.contentValueNok} ><Icon name='keyboard' />No information</span>
                  )}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Browser</Grid.Column>
                <Grid.Column width={10}>
                  <Label basic className={css.contentValue} color={browserInfo.color} size='tiny'>{browserInfo.text}</Label>
                  {browserInfo.known && (
                    <span className={css.contentValueNok} ><Icon name={browserInfo.icon} color='grey' />{`${browserInfo.version}`}</span>
                  )}
                  {!browserInfo.supported && (
                    <span className={css.contentValueNok} ><Icon name='window maximize outline' />No information</span>
                  )}
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Accordion.Content>

          <Accordion.Title
            className={css.category}
            active={activeIndex.includes(2)}
            index={2}
            onClick={this.handleClick}
          >
            <Icon name='dropdown' />
            Network
          </Accordion.Title>
          <Accordion.Content active={activeIndex.includes(2)}>
            <Grid columns={2}>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Local</Grid.Column>
                <Grid.Column width={10}>
                  <span className={css.contentValueNok} ><Icon name={candidates.iconHost} color='grey' />{` x ${candidates.nbHost} host`}</span>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Nat</Grid.Column>
                <Grid.Column width={10}>
                  <span className={css.contentValueNok} ><Icon name={candidates.iconStun} color={candidates.hasError ? 'red' : 'grey'} />{` x ${candidates.nbStun} srflx`}</span>
                </Grid.Column>
              </Grid.Row>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Relay</Grid.Column>
                <Grid.Column width={10}>
                  <span className={css.contentValueNok} ><Icon name={candidates.iconTurn} color={candidates.hasError ? 'red' : 'grey'} />{` x ${candidates.nbTurn} relay`}</span>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Accordion.Content>

          <Accordion.Title
            className={css.category}
            active={activeIndex.includes(3)}
            index={3}
            onClick={this.handleClick}
          >
            <Icon name='dropdown' />
            Conference
          </Accordion.Title>
          <Accordion.Content active={activeIndex.includes(3)}>
            <Grid columns={2}>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Freeswitch</Grid.Column>
                <Grid.Column width={10} className={css.contentValue}>{user.username}</Grid.Column>
              </Grid.Row>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Status</Grid.Column>
                <Grid.Column width={10}>
                  {phoneInfo.isConnected && (
                    <span className={css.contentValue}>{phoneInfo.text}</span>
                  )}
                  {!phoneInfo.isConnected && (
                    <span className={css.contentSubValueWarning}><Icon name='exclamation triangle' />{phoneInfo.text}</span>
                  )}
                </Grid.Column>
              </Grid.Row>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Hear room</Grid.Column>
                <Grid.Column width={10} className={css.contentValueNok}>{getRoomNameFromNumber(user.hearRoomId, titlesMap)}</Grid.Column>
              </Grid.Row>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Speak room</Grid.Column>
                <Grid.Column width={10} className={css.contentValueNok}>{getRoomNameFromNumber(user.speakRoomId, titlesMap)}</Grid.Column>
              </Grid.Row>
            </Grid>
          </Accordion.Content>



          <Accordion.Title
            className={css.category}
            active={activeIndex.includes(4)}
            index={4}
            onClick={this.handleClick}
          >
            <Icon name='dropdown' />
            Collaboration
          </Accordion.Title>
          <Accordion.Content active={activeIndex.includes(4)}>
            <Grid columns={2}>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Tool</Grid.Column>
                <Grid.Column width={10}>
                  <Label className={css.contentValue} color={collabInfo.color} size='tiny'>{collabInfo.text.toUpperCase()}</Label>
                  <span className={css.contentValueNok} ><Icon name={collabInfo.icon} color='grey' />{`${collabInfo.supported ? collabInfo.used ? 'In use' : 'Not used' : 'Not configured'}`}</span>
                </Grid.Column>
              </Grid.Row>
            </Grid>
          </Accordion.Content>



          <Accordion.Title
            className={css.category}
            active={activeIndex.includes(5)}
            index={5}
            onClick={this.handleClick}
          >
            <Icon name='dropdown' />
            Additionnal information
          </Accordion.Title>
          <Accordion.Content active={activeIndex.includes(5)}>
            <Grid columns={2}>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Administrator</Grid.Column>
                <Grid.Column width={10} className={user.isAdministrator ? css.contentValueOk : css.contentValueNok}>{user.isAdministrator ? "Yes" : "No"}</Grid.Column>
              </Grid.Row>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Moderator</Grid.Column>
                <Grid.Column width={10} className={user.isModerator ? css.contentValueOk : css.contentValueNok}>{user.isModerator ? "Yes" : "No"}</Grid.Column>
              </Grid.Row>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Participant</Grid.Column>
                <Grid.Column width={10} className={user.isRegular ? css.contentValueOk : css.contentValueNok}>{user.isRegular ? "Yes" : "No"}</Grid.Column>
              </Grid.Row>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>TechAssist</Grid.Column>
                <Grid.Column width={10} className={user.isTechAssistant ? css.contentValueOk : css.contentValueNok} >{user.isTechAssistant ? "Yes" : "No"}</Grid.Column>
              </Grid.Row>
              <Grid.Row className={css.row} stretched>
                <Grid.Column width={6} className={css.label}>Role</Grid.Column>
                <Grid.Column width={10} className={css.contentValueNok}>{user.role}</Grid.Column>
              </Grid.Row>
            </Grid>
          </Accordion.Content>

          <Accordion.Title
            className={css.category}
            active={activeIndex.includes(6)}
            index={6}
            onClick={this.handleClick}
          >
            <Icon name='dropdown' />
            Debug
          </Accordion.Title>
          <Accordion.Content active={activeIndex.includes(6)}>
            <Button icon='bug' size='mini' content='Debug' onClick={() => { onDebug(user) }} />
            <Button icon='download' size='mini' content='Janus' onClick={() => { onSaveJanus(janusLog, user.username) }} />
          </Accordion.Content>
        </Accordion>
      </Container >
    )
  }
}

export default DetailsUser;

DetailsUser.propTypes = {
  user: object.isRequired,
  onClose: func.isRequired,
  onDebug: func.isRequired,
  onDevices: func.isRequired,
  onSaveJanus: func.isRequired
}
