import User from '../../models/user'

const ECHO_TEST = 'ECHO_TEST'

export default class ChannelExecuteHander {
  constructor(esl) {
    this.esl = esl
    this.subscribe()
  }

  subscribe() {
    this.esl
      .on(ECHO_TEST, User.onEchoTest)
  }

  process(e) {
    this.application = e.getHeader('Application')
    switch (e.type) {
      case 'CHANNEL_EXECUTE':
        this.complete = false
        break
      case 'CHANNEL_EXECUTE_COMPLETE':
        this.complete = true
        break
    }
    this.channelExecute(e)
  }

  channelExecute(e) {
    switch (this.application) {
      case 'echo':
        return this.onEchoTest(e)
    }
  }

  onEchoTest(e) {
    const start = !this.complete
    const nameId = e.getHeader('Caller-Caller-ID-Name')
    const uuid = e.getHeader('Channel-Call-UUID')
    this.esl.emit(ECHO_TEST, { nameId, uuid, start })
  }
}
