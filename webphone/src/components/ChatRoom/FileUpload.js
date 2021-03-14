import React from 'react'
import LinkIcon from '../../fragments/SVGs/Link'
import { Sender } from '../../socketTextchat'

class FileUpload extends React.Component {
  constructor(props) {
    super(props)
    this.inputRef = React.createRef()
    this.state = {
      selectedFile: null,
    }
  }

  onFileChange = async (event) => {
    const { currentMeeting, currentUser, currentUserLanguage } = this.props
    await this.setState({ selectedFile: event.target.files[0] })
    const { selectedFile } = this.state
    let fileReader = new FileReader(),
    slice = selectedFile.slice(0, 100000)

    fileReader.readAsArrayBuffer(slice)
    fileReader.onload = (evt) => {
      let arrayBuffer = fileReader.result
      console.log('arrayBuffer', arrayBuffer)
      Sender.fileUpload({
        info: {
          text: 'File Upload',
          userId: currentUser.id,
          meetingId: currentMeeting.id,
          lang: currentUserLanguage,
        },
        data: {
          name: selectedFile.name,
          type: selectedFile.type,
          size: selectedFile.size,
          data: arrayBuffer,
        },
      })
      
    }
  }

  handleLinkClick = () => {
    this.inputRef.current.click()
  }

  render() {
    return (
      <div>
        <input ref={this.inputRef} type="file" onChange={this.onFileChange} style={{ display: 'none' }} />
        <div onClick={this.handleLinkClick}>
          <LinkIcon />
        </div>
      </div>
    )
  }
}

export default FileUpload
