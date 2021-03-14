import React, { createRef } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { changeCurrentUserLanguage } from '../../reducers/currentUser'
import * as AppActions from '../../reducers/app'
// import { languages } from '../../utilities/constants'
import css from './ChatRoomHeader.scss'
import gcss from '../App/App.scss'
import Toast from '../Toast/Toast'
import HandraisedControl from '../HandraisedControl/HandraisedControl'
import browser from 'browser-detect'
import ControlMikes from '../ControlMikes/ControlMikes'
import MembersModal from '../MembersModal'

class ChatRoomHeader extends React.Component{
  constructor(props){
    super(props)
    this.state = {
      isDisplayMenuDropdown: false
    }
    this.dropdownRef = createRef()
  }

  componentDidMount(){
    document.addEventListener('click', this.handleClickOutside, false)
  }

  componentWillUnmount(){
    document.removeEventListener('click', this.handleClickOutside, false)
  }

  handleClickOutside = (e) => {

    if(this.dropdownRef&& this.dropdownRef.current && !this.dropdownRef.current.contains(e.target)){
      this.setState({isDisplayMenuDropdown: false})
    }
  }

  handleClickLanguage = (code) => {
    this.setState({
      isDisplayMenuDropdown: false
    })

    this.props.changeCurrentUserLanguage(code)
  }

  render() {
    const {
      currentUserLanguage,
      changeCurrentUserLanguage,
      appActions,
      isTechAssistant,
      currentMeeting,
      currentUserTitlesMap,
      isModerator
    } = this.props

  const {isDisplayMenuDropdown} = this.state

  const languages = Object.values(currentUserTitlesMap).filter(l => !!l.code)
  const currentLanguageObj = languages.find((l) => l.code === currentUserLanguage)
  const LanguageTitle = currentLanguageObj ? currentLanguageObj.title : currentUserLanguage
  const isTechnicalChat = !!currentMeeting && currentMeeting.type == 'Technical'
  const result = browser();
  return (
    <div className={css.chatRoomHeaderContainer}>
      {!!currentMeeting || isModerator ? null : (
        <button
          type="button"
          className={css.addChatGroupBtn + ' ' + gcss.noOutline}
          aria-haspopup="true"
          aria-expanded="false"
          onClick={() => appActions.toggleDrawer('members-modal')}
        >
          <img
            className={css.plusIcon}
            src={'assets/images/nouveau_message.svg'}
            alt="plus icon"
            width="30"
            height="30"
          />
        </button>
      )}
      <MembersModal/>
      <Toast/>
      <div
        className={css.chatMenuDropdown + ' d-block'}
        ref={this.dropdownRef}
      >
        <button
          type="button"
          className={
            gcss.ibpBtn + ' ' + gcss.ibpBtnSelect + ' ' + gcss.noOutline + ' d-block px-3 ml-auto mr-auto'
          }
          aria-haspopup="true"
          aria-expanded="false"
          // onMouseOver = {()=> this.setState({isDisplayMenuDropdown: true})}
          onClick = {() => {
            this.setState(() => ({isDisplayMenuDropdown: !isDisplayMenuDropdown}))}}
        >
          {LanguageTitle}
          <img className="ml-2" src="assets/images/icon_fleche_filtre.png" alt="select icon" />
        </button>
          {
            isDisplayMenuDropdown?
            <div className = {css.chatMenuDropdownContent}>
              <div className={css.chatMenuDropdownBtns} >
                {languages.map((lng) => (
                  <button
                    key={lng.code}
                    className={css.chatMenuBtn + ' ' + gcss.noOutline}
                    type="button"
                    onClick={() => this.handleClickLanguage(lng.code)}
                  >
                    {lng.title}
                  </button>
                ))}
              </div>
            </div>
              :
              null
          }
      </div>
      {/* <HandraisedControl/>
      <ControlMikes/> */}
      

      { result.mobile ? null :  <div className={this.props.btnspeakClass}>{this.props.btnSpeak}</div>}
    </div>
    )
  }
}
const mapStateToProps = (state) => ({
  currentUserLanguage: state.currentUser.language,
  isTechAssistant: state.currentUser.isTechAssistant,
  isModerator: state.currentUser.isModerator,
  currentMeeting: state.meeting.currentMeeting,
  currentUserTitlesMap: state.currentUser.titlesMap
})

const mapDispatchToProps = (dispatch) => ({
  changeCurrentUserLanguage: bindActionCreators(changeCurrentUserLanguage, dispatch),
  appActions: bindActionCreators(AppActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(ChatRoomHeader)
