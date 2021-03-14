import React from 'react';
import css from './AutomaticTranscription.scss';

export default class AutomaticTranscription extends React.Component {

  render() {
    return (
      <div className={css.transcriptionContainer}>
          <p className={css.transcriptionInfo}>Automatic Transcription</p>
      </div>
    );
  }
}