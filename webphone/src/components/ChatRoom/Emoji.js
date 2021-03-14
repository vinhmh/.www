import React, { Component } from 'react';
import 'emoji-mart/css/emoji-mart.css';
import { Picker } from 'emoji-mart';

class Emoji extends Component {
  constructor(props) {
    super(props);
    this.emojiRef = React.createRef();
  }

  componentDidMount() {
    document.body.addEventListener('click', this.emojiModalControl);
  }

  componentWillUnmount() {
    document.body.removeEventListener('click', this.emojiModalControl);
  }

  emojiModalControl = (e) => {
    if (
      !this.emojiRef.current.contains(e.target) &&
      this.props.iconEmojiRef.current &&
      !this.props.iconEmojiRef.current.contains(e.target)
    ) {
      const { getEmoji } = this.props;
      getEmoji();
    }
  };

  addEmoji = (e) => {
    let emoji = e.native;
    const { getEmoji } = this.props;
    getEmoji(emoji);
  };
  render() {
    return (
      <div ref={this.emojiRef}>
        <Picker style={{ width: '100%' }} onSelect={this.addEmoji} />
      </div>
    );
  }
}

export default Emoji;
