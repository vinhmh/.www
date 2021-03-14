import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import translator from '../../utilities/translator'
import css from './Modal.scss'
import classNames from 'classnames'
import * as AppActions from '../../reducers/app'
import gcss from '../../components/App/App.scss'

class Modal extends React.Component {
  state = {
    loading: false,
  }
  modalRef = React.createRef()

  componentDidMount() {
    document.body.addEventListener('click', this.handleClickOutside)
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.handleClickOutside)
  }

  handleClickOutside = (e) => {
    if (!this.modalRef.current.contains(e.target)) {
      this.handleClose()
    }
  }

  confirm = () => {
    this.props.handleConfirm()
  }

  handleClose = () => {
    const { appActions } = this.props
    appActions.toggleDrawer()
    //this.props.handleClose()
  }

  render() {
    const { title, content, loading } = this.props
    return (
      <div className={css.container}>
        <div
          className={classNames('modal fade', { show: true }, { [css.isOpen]: true })}
          id="exampleModal"
          tabIndex="-1"
          role="dialog"
          aria-labelledby="exampleModalLabel"
          aria-hidden="true"
        >
          {loading && (
            <div className={classNames({ [gcss.spinner]: true }, { [css.spinner]: true })}>
              <div className={gcss.bounce1}></div>
              <div className={gcss.bounce2}></div>
              <div className={gcss.bounce3}></div>
            </div>
          )}
          <div ref={this.modalRef} className="modal-dialog" role="document">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title" id="exampleModalLabel">
                  {title}
                </h5>
                <button
                  onClick={this.handleClose}
                  type="button"
                  className="close"
                  data-dismiss="modal"
                  aria-label="Close"
                >
                  <span aria-hidden="true">&times;</span>
                </button>
              </div>
              <div className="modal-body">{content}</div>
              <div className="modal-footer">
                <button onClick={this.handleClose} type="button" className="btn btn-secondary" data-dismiss="modal">
                  Cancel
                </button>
                <button onClick={this.confirm} type="button" className="btn btn-primary">
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  currentUserLanguage: state.currentUser.language,
  drawer: state.app.drawer,
  loading: state.app.loading,
  error: state.app.error,
})

const mapDispatchToProps = (dispatch) => ({
  appActions: bindActionCreators(AppActions, dispatch),
})
export default connect(mapStateToProps, mapDispatchToProps, null, { withRef: true })(Modal)
