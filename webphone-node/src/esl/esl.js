import util from 'util'
import EventEmitter from 'events'
import config from '../../config'
import ConferenceHandler from './handlers/conferenceHandler'
import SofiaHandler from './handlers/sofiaHandler'
import ChannelExecuteHander from './handlers/channelExecuteHander'

class Esl extends EventEmitter {
  constructor(props) {
    super(props)
    this.conferenceHandler = new ConferenceHandler(this)
    this.sofiaHandler = new SofiaHandler(this)
    this.channelExecuteHander = new ChannelExecuteHander(this)
  }

  init = connection => {
    this.connection = connection
    connection.events('json',
      [
        'CHANNEL_EXECUTE',
        'CHANNEL_EXECUTE_COMPLETE',
        'CUSTOM conference::maintenance sofia::register'
      ].join(' '), (e) => console.log('subscribed on: CUSTOM conference::maintenance'))

    connection.on('esl::**', (e) => {
      if (config.eslDebug) {
        console.log(util.inspect(e, { maxArrayLength: null }))
      }
      if (!e) return

      switch (e.type) {
        case 'CUSTOM':
          this.conferenceHandler.process(e)
          this.sofiaHandler.process(e)
          break
        case 'CHANNEL_EXECUTE':
        case 'CHANNEL_EXECUTE_COMPLETE':
          this.channelExecuteHander.process(e)
          break
      }
    })
  }

  kickMember(memberId, roomId) {
    return this.run(`conference ${roomId} kick ${memberId}`).catch((err) => {
      console.error(`ESL: Unable to kick ${memberId} from ${roomId}: ${err}`);
    });
  }

  hupMember(memberId, roomId) {
    return this.run(`conference ${roomId} hup ${memberId}`).catch((err) => {
      console.error(`ESL: Unable to hup ${memberId} in ${roomId}: ${err}`);
    });
  }

  toggleSpeak(memberId, roomId) {
    return this.run(`conference ${roomId} tmute ${memberId}`).catch((err) => {
      console.error(`ESL: Unable toggle speak for ${memberId} in ${roomId}: ${err}`);
    });
  }

  toggleHear(memberId, roomId, hear) {
    const command = hear ? 'deaf' : 'undeaf'
    return this.run(`conference ${roomId} ${command} ${memberId}`).catch((err) => {
      console.error(`ESL: Unable to toggle hear for ${memberId} in ${roomId}: ${err}`);
    });
  }

  muteSpeak(memberId, roomId) {
    return this.run(`conference ${roomId} mute ${memberId}`).catch((err) => {
      console.error(`ESL: Unable to mute speak for ${memberId} in ${roomId}: ${err}`);
    });
  }

  unmuteSpeak(memberId, roomId) {
    return this.run(`conference ${roomId} unmute ${memberId}`).catch((err) => {
      console.error(`ESL: Unable to unmute speak for ${memberId} in ${roomId}: ${err}`);
    });
  }

  muteHear(memberId, roomId) {
    return this.run(`conference ${roomId} deaf ${memberId}`).catch((err) => {
      console.error(`ESL: Unable to mute hear for ${memberId} in ${roomId}: ${err}`);
    });
  }

  unmuteHear(memberId, roomId) {
    return this.run(`conference ${roomId} undeaf ${memberId}`).catch((err) => {
      console.error(`ESL: Unable to unmute hear for ${memberId} in ${roomId}: ${err}`);
    });
  }

  volumeIn(memberId, roomId, level) {
    return this.run(`conference ${roomId} volume_in ${memberId} ${level}`).catch((err) => {
      console.error(`ESL: Unable to set volume in for ${memberId} in ${roomId}: ${err}`);
    });
  }

  uuid_audio(uuid, command) {
    return this.run(`uuid_audio ${uuid} ${command}`).catch((err) => {
      console.error(`ESL: Unable to run command '${command}' for uuid '${uuid}': ${err}`);
    });
  }

  run(command, callback) {
    return new Promise((resolve, reject) => {
      this.connection.bgapi(command, (res) => {
        if (res.getBody().indexOf('not found') !== -1) return reject(new Error("Not found"))
        if (callback) callback.call()
        resolve(res)
      })
    })
  }
}

export default new Esl()
