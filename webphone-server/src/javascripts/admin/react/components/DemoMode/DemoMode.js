import { connect } from 'react-redux'
import { Icon, Confirm } from 'semantic-ui-react'
import classNames from 'classnames'
import * as Sender from '../../socket/sender'
import { ADJUSTMENTS } from '../../middleware/common'
import css from './DemoMode.scss'

class DemoMode extends React.Component {
  initialState = {
    confirmContent: 'Are you sure?',
    confirmOpen: false,
    handleCancel: null,
    handleConfirm: null,
  }

  state = this.initialState

  setConfirm = ({ confirmContent = 'Are you sure?', confirmOpen = false, handleCancel = null, handleConfirm = null }) => {
    this.setState({ confirmContent, confirmOpen, handleCancel, handleConfirm })
  }

  render() {
    const { adjustments } = this.props
    const { } = this.props
    const { demoMode } = adjustments
    const { confirmOpen, confirmContent, handleCancel, handleConfirm } = this.state

    const propsAll = {
      onClick: () => this.setConfirm({
        confirmOpen: true,
        confirmContent: `Are you sure you want to ${demoMode ? 'desactivate' : 'activate'} the listen only mode? Be careful, this will affect all meetings`,
        handleCancel: () => this.setConfirm({}),
        handleConfirm: () => {
          Sender.toggleAdjustments(ADJUSTMENTS.DEMOMODE)
          this.setConfirm({})
        }
      }),
      className: classNames({ red: demoMode }),
    }

    return (
      <>
        <span className={css.icon}><Icon name="microphone slash" {...propsAll} /></span>
        <Confirm
          open={confirmOpen}
          content={confirmContent}
          onCancel={handleCancel}
          onConfirm={handleConfirm}
        />
      </>
    )
  }
}

const mapStateToProps = state => ({
  adjustments: state.adjustments,
})

const mapDispatchToProps = () => ({
})

export default connect(mapStateToProps, mapDispatchToProps)(DemoMode)
