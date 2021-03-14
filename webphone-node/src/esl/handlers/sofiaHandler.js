import User from '../../models/user'

const REGISTER_USER = 'REGISTER_USER'

export default class SofiaHandler {
  constructor(esl) {
    this.esl = esl
    this.subscribe()
  }

  subscribe() {
    this.esl
      .on(REGISTER_USER, User.onRegister)
  }

  process(e) {
    const eventSubclass = e.getHeader('Event-Subclass')
    if (eventSubclass !== 'sofia::register') return

    const username = e.getHeader('username')
    this.esl.emit(REGISTER_USER, { username })
  }
}
