import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import translator from '../../utilities/translator'
import css from './Popover.scss'
import classNames from 'classnames'

class Popover extends React.Component {
  state = {
    show: false,
  }

  myRef = React.createRef();

  componentDidMount() {
    document.addEventListener("mousedown", this.handleClickOutside);
  }

  componentWillUnmount() {
    document.removeEventListener("mousedown", this.handleClickOutside);
  }

  handleClickOutside = e => {
    if (!this.myRef.current.contains(e.target)) {
      this.closeItems()
    }
  };

  closeItems = () => {
    this.setState({ show: false })
  }

  renderItems = () => {
    const { items } = this.props
    if (!items.length) return
    return items.map(({ label, icon, handle }) => {
      return (
        <React.Fragment key={label}>
          <span
            onClick={() => {
              handle()
              this.closeItems()
            }}
            className="dropdown-item"
            style={{display: 'flex', justifyContent:'space-between'}}
          >
            <span className={css.itemText}>{label}</span>

            <span className={css.icon}>{icon}</span>
          </span>
        </React.Fragment>
      )
    })
  }

  render() {
    const { show } = this.state
    const {applyStyle, mainIcon} = this.props
    const itemsContent = this.renderItems()
    return (
      <div ref={this.myRef} style={ applyStyle ? applyStyle : { position: 'absolute', right: 0, top: 0, zIndex: 5 }}>
        <div className="btn-group dropleft">
          <button
            onClick={() => this.setState(({ show }) => ({ show: !show }))}
            type="button"
            className="btn btn-outline-light text-dark"
          >
            <i className={`fa fa-${mainIcon}`} aria-hidden="true"></i>
          </button>
          {show && <div className={classNames('dropdown-menu', 'show', css.itemsWrapper)}>{itemsContent}</div>}
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  currentUserLanguage: state.currentUser.language,
})

const mapDispatchToProps = (dispatch) => ({})

export default connect(mapStateToProps, mapDispatchToProps)(Popover)
