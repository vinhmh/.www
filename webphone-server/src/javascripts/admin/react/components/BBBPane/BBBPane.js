import { connect } from 'react-redux'
import { string } from 'prop-types'
import { Popup } from 'semantic-ui-react'
import css from './BBBPane.scss'

const PLATFORM_NAME = {
  ZOOM: 'Zoom',
  BBB: 'BBB',
  OTHER: 'Other'
}

const getBBBOrPlatformShortName = (link) => {
  if (link.match(/zoom/)) {
    return PLATFORM_NAME.ZOOM
  }
  if (link.match(/bigbluebutton/)) {
    return PLATFORM_NAME.BBB
  }
  return PLATFORM_NAME.OTHER
}

class BBBPane extends React.Component {
  constructor(props) {
    super(props)
  }

  render() {
    const { platformURL } = this.props
    const shortName = getBBBOrPlatformShortName(platformURL)

    return (
      <div className={css.platformURL}>
        <Popup content={platformURL} pinned on='click' trigger={<span><i className="fa fa-tv"></i>&nbsp;&nbsp;{shortName}</span>} />
      </div>
    )
  }
}

BBBPane.propTypes = {
  platformURL: string.isRequired,
}

const mapStateToProps = () => ({
})

export default connect(mapStateToProps)(BBBPane)
