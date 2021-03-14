import PropTypes, { node } from 'prop-types'
import _ from 'lodash'
import React from 'react'
import { bindActionCreators } from 'redux'
import Select from 'react-select'
import * as AppActions from '../../reducers/app/reducer'
import * as MeetingActions from '../../reducers/meeting/reducer'
import { connect } from 'react-redux'
// import css from './InterpretersList.scss'
import css from '../UsersListFilterByLang/UsersListFilterByLang.scss'
import MemberItem from '../MemberItem/MemberItem'
import { filterAllIntepreters, filterRaisedHandMembers, filterAllRegulars, filterParticipant } from '../../utilities/filters'
import { Sender } from '../../socketTextchat'
import { sortByUser } from '../../utilities/sorts'

const categories = {
  INTERPRETERS: 'Int',
  HANDS_RAISED: 'Speakers',
  PARTICIPANTS: 'Participants',
}

class InterpretersList extends React.Component {
  constructor(props) {
    super(props)
    this.filterHeaderRef = React.createRef();
    this.state = {
      selected: categories.INTERPRETERS,
      filter: null,
    }
  }

  goToPublicInterpreter = () => {
    const { appActions, meetingActions, meeting } = this.props
    const targetMeeting = meeting.meetings.find((m) => m.type == 'InterpreterPublic')
    if (!targetMeeting) return
    meetingActions.updateCurrentMeeting(targetMeeting)
    appActions.updateSwitchChat(false)
    appActions.scrollToChat()
  }

  goToPrivateInterpreter = (id) => {
    const { user, meeting, meetingActions, appActions } = this.props
    const { meetings } = meeting
    const meetingsClone = _.cloneDeep(meetings.filter((m) => m.type == 'Private'))
    const code = [user.id, id].sort().join(',')
    const targetMeeting = meetingsClone.find((m) => {
      const titleCode = m.title
        .split(',')
        .map((id) => parseInt(id))
        .sort()
        .join(',')
      return code == titleCode
    })
    if (!targetMeeting) {
      Sender.meetingNew({
        title: user.meetingID,
        role: user.role,
        createdById: user.id,
        userInvitedId: [id],
        meetingType: 'Private',
        meetingHash: null,
      })
      return
    }
    meetingActions.updateCurrentMeeting(targetMeeting)
    appActions.updateSwitchChat(false)
    appActions.scrollToChat()
  }

  handleNext = () => {
    this.filterHeaderRef.current.scrollLeft += 60
  }

  handlePrev = () => {
    this.filterHeaderRef.current.scrollLeft -= 60
  }

  setFilter = ({ value }) => {
    this.setState({ filter: value });
  }

  render() {
      const { user, members } = this.props;
      const lists = {
        [categories.INTERPRETERS]: members.filter(filterAllIntepreters),
        [categories.HANDS_RAISED]: members.filter(filterRaisedHandMembers),
        [categories.PARTICIPANTS]: members.filter(filterParticipant),
      }
      const languages = [
        { value: null, label: 'All' },
        ...user.roomsList.map((roomId) => {
          if (user.titlesMap[roomId] && user.titlesMap[roomId].code) {
            return {
              value: user.titlesMap[roomId].code,
              label: user.titlesMap[roomId].code,
            }
          }
        }),
      ]

      return (
        <div className={css.filteredConferenceContainer}>
          {/*Header*/}
          <div className={css.filterHeaderContainer}>
            <div className={css.filterHeader}>
              <span onClick={this.handlePrev} className={`${css.angleIcon} ${css.left}`}>
                <i className="fa fa-angle-left" />
              </span>

              <ul ref={this.filterHeaderRef} className={css.filterLanguageBar}>
                {Object.values(categories).map((code) => (
                  <li
                    className={this.state.selected === code ? css.activeLanguage : null}
                    key={code}
                    onClick={() => this.setState({ selected: code })}
                  >
                    {code}
                  </li>
                ))}
              </ul>

              <span onClick={this.handleNext} className={`${css.angleIcon} ${css.right}`}>
                <i className="fa fa-angle-right" />
              </span>
            </div>
            <Select
              defaultValue={languages[0]}
              onChange={this.setFilter}
              options={languages}
              placeholder={'Filter...'}
              styles={{
                container: (base) => ({
                  ...base,
                  width: '30%',
                }),
                control: (base) => ({
                  ...base,
                  '&:hover': { borderColor: 'gray' },
                  border: '1px solid lightgray',
                  boxShadow: 'none',
                }),
                menu: (base) => ({
                  ...base,
                  marginTop: 0
                }),
                menuList: (base) => ({
                  ...base,
                  padding: 0,
                  height: '90px'
                }),
                option: (base) => ({
                  ...base,
                  fontSize: '0.9em'
                })
              }}
            />
          </div>

          <div className={css.filterConferenceUsersContainer}>
            {lists[this.state.selected]
              .filter(m => (!this.state.filter || user.titlesMap[m.user.speakRoomId]?.code === this.state.filter))
              .map((member, i) => (
                <div style={{ position: 'relative' }} key={member.id}>
                  <MemberItem
                    goToPrivateInterpreter={this.goToPrivateInterpreter}
                    pos={i}
                    member={member}
                    user={user}
                    roomId={member.roomId}
                    withBlob={true}
                    onMessage={(this.state.selected !== categories.HANDS_RAISED) && (member.user.id != user.id) ? () => this.goToPrivateInterpreter(member.user.id) : null}
                  />
                </div>
            ))}
          </div>
        </div>
      )
  }
}

InterpretersList.propTypes = {
  adjustments: PropTypes.object.isRequired,
  members: PropTypes.array.isRequired,
  user: PropTypes.object.isRequired,
}

const mapStateToProps = (state) => ({
  meeting: state.meeting,
})

const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(AppActions, dispatch),
  meetingActions: bindActionCreators(MeetingActions, dispatch),
})

export default connect(mapStateToProps, mapDispatchToProps)(InterpretersList)
