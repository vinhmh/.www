import PropTypes from 'prop-types'
import React, { Fragment } from 'react'
import MemberItem from '../MemberItem/MemberItem'
import ModalMemberItem from '../MembersModal/MemberItem'
import css from './UsersListFilterByLang.scss'

const globalIcon = () => (
  <img src={"assets/images/World_participants__grey.svg"} width="20" height="20" alt="World icon" />
)
const ALL = 'ALL'

export default class UsersListFilterByLang extends React.Component {
  constructor(props) {
    super(props)
    this.listLangRef = React.createRef()
  }

  state = {
    selectedLanguage: ALL,
  }

  handleCodeChange(code) {
    const { selectedLanguage } = this.state
    if (code === ALL && selectedLanguage === ALL) this.setState({ selectedLanguage: null })
    else this.setState({ selectedLanguage: code })
  }

  handleNext = () => {
    this.listLangRef.current.scrollLeft += 60
  }


  handlePrev = () => {
    this.listLangRef.current.scrollLeft -= 60
  }

  render() {
    const { members, user, fragment } = this.props
    const { selectedLanguage } = this.state

    const list = {}
    const mapCodes = []

    user.roomsList.forEach((roomId) => {
      if (user.titlesMap[roomId] && user.titlesMap[roomId].code) {
        mapCodes.push(user.titlesMap[roomId].code)
      }
    })

    members.forEach((member) => {
      if (
        member.user.isModerator ||
        member.user.isSwitcher ||
        ((user.titlesMap[member.roomId] && user.titlesMap[member.roomId].code) !== selectedLanguage &&
          selectedLanguage !== ALL)
      )
        return

      const { roomId } = member
      if (!list[roomId]) {
        list[roomId] = []
      }
      if (member.roomId === member.user.speakRoomId) {
        list[roomId].push(member)
      }
    })

    const roomsArr = Object.keys(list)
    if (user.isRegular) {
      const index = roomsArr.indexOf(user.rooms.first)
      if (index !== -1) {
        roomsArr.splice(index, 1)
        roomsArr.unshift(user.rooms.first)
      }
    }

    return (
      <div className={css.filteredConferenceContainer}>
        <div className={css.filterHeader}>

          <span onClick={this.handlePrev} className={`${css.angleIcon} ${css.left}`}>
            <i className="fa fa-angle-left" />
          </span>


          <ul ref={this.listLangRef} className={css.filterLanguageBar}>
            <li
              className={selectedLanguage === ALL ? css.globalIconActive : null}
              onClick={() => this.handleCodeChange(ALL)}
            >
              {globalIcon()}
            </li>
            {mapCodes.map((code) => (
              <li
                className={selectedLanguage === code ? css.activeLanguage : null}
                key={code}
                onClick={() => this.handleCodeChange(code)}
              >
                {code}
              </li>
            ))}
          </ul>

          <span onClick={this.handleNext} className={`${css.angleIcon} ${css.right}`}>
            <i className="fa fa-angle-right" />
          </span>
        </div>

        <div className={css.filterConferenceUsersContainer}>
          {roomsArr.map((roomId) =>
            list[roomId].map((member, i) => {
              if (member.user.isTechAssistant) return null
              if (fragment == 'members-modal') {
                return (
                  <ModalMemberItem
                    key={member.id}
                    pos={i}
                    member={member}
                    user={user}
                    roomId={roomId}
                    isHandRaised={true}
                    withBlob={false}
                    handleAdd={this.props.handleAdd}
                    participants={this.props.participants}
                    fragment={this.props.fragment}
                  />
                )
              }
              return (
                <MemberItem
                  key={member.id + Math.random().toString()}
                  pos={i}
                  member={member}
                  user={user}
                  roomId={roomId}
                  isHandRaised={true}
                  withBlob={false}
                />
              )
            }),
          )}
        </div>
      </div>
    )
  }
}

UsersListFilterByLang.propTypes = {
  adjustments: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
  fragment: PropTypes.string,
}
