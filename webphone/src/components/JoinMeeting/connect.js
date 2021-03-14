import { connect } from 'react-redux'

const mapStateToProps = state => ({
  user: state.currentUser,
})

const mapDispatchToProps = () => ({
})

export default connect(mapStateToProps, mapDispatchToProps)
