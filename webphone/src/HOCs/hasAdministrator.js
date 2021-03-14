import React, { Fragment } from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { compose } from 'redux'
import classnames from 'classnames'
import * as AppActions from '../reducers/app'
import * as MeetingActions from '../reducers/meeting/reducer'
const hasAdministrator = (WrappedComponent) => {
  return class extends React.Component {
    render() {
      const { members } = this.props
      const hasAdministrator = members.findIndex((m) => m.user.isAdministrator) > -1
      return (
        <Fragment>
          <WrappedComponent {...this.props} hasAdministrator={hasAdministrator} />
        </Fragment>
      )
    }
  }
}

const mapStateToProps = (state) => ({
  members: state.members,
  moderators: state.moderators,
  meeting: state.meeting,
})

const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(AppActions, dispatch),
  meetingActions: bindActionCreators(MeetingActions, dispatch)
})

const composeHasAdministrator = compose(connect(mapStateToProps, mapDispatchToProps), hasAdministrator)

export default composeHasAdministrator
