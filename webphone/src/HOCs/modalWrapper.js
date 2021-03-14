import React from 'react'
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'
import { compose } from 'redux'
import classnames from 'classnames'
import * as AppActions from '../reducers/app'

const ModalWrapper = (WrappedComponent) => {
  return class extends React.Component {
    render() {
      const { app } = this.props
      const { drawer } = app
      return (
        <div className={classnames({ 'modal-open': !!drawer && drawer != 'members-modal' })}>
          <WrappedComponent />
          {/* {!!drawer && drawer != 'members-modal' && <div className="modal-backdrop fade show"></div>} */}
        </div>
      )
    }
  }
}

const mapStateToProps = (state) => ({
  app: state.app,
})

const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(AppActions, dispatch),
})

const composeModalWrapper = compose(connect(mapStateToProps, mapDispatchToProps), ModalWrapper)

export default composeModalWrapper
