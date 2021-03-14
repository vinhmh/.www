import {
  WORKING,
  OFFLINE,
  REJECTED,
  SOS_HANDOVER,
  ALL_REJECTED,
  ASK_HANDOVER,
  WAITING_CONFIRM,
  ACCEPTED,
  OPEN_YOUR_MICS,
  BACK_WAITING_CONFIRM,
  START_TIME_USER,
  START_HANDRAISED_USER,
  SLOW_SPEAK
} from '../../utilities/noticeTypes'
import _ from 'lodash'
export const ADD = 'MODERATOR:ADD'
export const UPDATE = 'MODERATOR:UPDATE'
export const CHANGE = 'MODERATOR:CHANGE'
export const DEL = 'MODERATOR:DEL'
export const UPDATE_LATE_COMER = 'MODERATOR:UPDATE_LATE_COMER'
export const RESET_RECONNECT = 'MODERATOR:RESET_RECONNECT'

const initialState = {
  members: [],
  mySession: {
    isWorking: false,
    isAskHandover: false,
    isSOSHandover: false,
    isRejected: false,
    isAccepted: false,
    isWaitingConfirm: false,
    isOpenYourMics: false,
    isStartTime: false,
    startHandRaised: false,
    slowSpeak:false
  },
}

const resetProperties = (theObj, keyNeedKeep = null) => {
  for (const key of Object.keys(theObj)) {
    if (key != keyNeedKeep) {
      theObj[key] = false
    }
  }
}

const resetMembers = (theMembers = []) => {
  theMembers.forEach((m, i) => {
    m.status == OFFLINE
  })
}

const editMembers = (members, payload) => {
  const { data } = payload
  members.forEach((member) => {
    if (data.msg == WORKING) {
      if (member.userId == data.userId) {
        member.status = WORKING
      } else {
        member.status = OFFLINE
      }
    }
    if (data.msg == ASK_HANDOVER) {
      if (member.userId == data.userId) {
        member.status = ASK_HANDOVER
      } else {
        member.status = WAITING_CONFIRM
      }
    }
    if (data.msg == SOS_HANDOVER) {
      if (member.userId == data.userId) {
        member.status = SOS_HANDOVER
      } else {
        member.status = WAITING_CONFIRM
      }
    }
    if (data.msg == ACCEPTED) {
      if (member.userId == data.userId) {
        member.status = ACCEPTED
      }
    }
    if (data.msg == REJECTED) {
      if (member.userId == data.userId) {
        member.status = REJECTED
      }
    }
    if (data.msg == BACK_WAITING_CONFIRM) {
      if (member.userId == data.userId) {
        member.status = WAITING_CONFIRM
      }
    }
  })
}

const editMySession = (mySession, payload) => {
  const { data, currentUser } = payload
  if (data.msg == WORKING) {
    if (data.userId == currentUser.id) {
      mySession.isWorking = true
      resetProperties(mySession, 'isWorking')
    } else {
      resetProperties(mySession)
    }
  }
  if(data.msg == START_TIME_USER){
    if (data.userId == currentUser.id) {
      mySession.isStartTime = data.isStartTime
      resetProperties(mySession, 'isStartTime')
    }
  }
  if(data.msg == START_HANDRAISED_USER ){
    if(data.userId == currentUser.id) {
      mySession.startHandRaised = data.startHandRaised
      resetProperties(mySession, 'isStartHandRaised')
    }
  }
  if(data.msg == SLOW_SPEAK ){
    if(data.userId == currentUser.id) {
      mySession.slowSpeak = data.slowSpeak
      resetProperties(mySession, 'isSlowSpeak')
    }
  }
  if (data.msg == ASK_HANDOVER) {
    if (data.userId == currentUser.id) {
      mySession.isAskHandover = true
      mySession.isSOSHandover = false
    } else {
      mySession.isWaitingConfirm = true
      resetProperties(mySession, 'isWaitingConfirm')
    }
  }
  if (data.msg == SOS_HANDOVER) {
    if (data.userId == currentUser.id) {
      mySession.isSOSHandover = true
      mySession.isAskHandover = false
    } else {
      mySession.isWaitingConfirm = true
      resetProperties(mySession, 'isWaitingConfirm')
    }
  }
  if (data.msg == ACCEPTED) {
    if (data.userId == currentUser.id) {
      mySession.isAccepted = true
      resetProperties(mySession, 'isAccepted')
      // mySession.isWaitingConfirm = false
    }
  }
  if (data.msg == OPEN_YOUR_MICS) {
    if (data.userId == currentUser.id) {
      mySession.isOpenYourMics = true
    }
  }
  if (data.msg == REJECTED) {
    if (data.userId == currentUser.id) {
      mySession.isRejected = true
      resetProperties(mySession, 'isRejected')
    }
  }
  if (data.msg == BACK_WAITING_CONFIRM) {
    if (data.userId == currentUser.id) {
      mySession.isWaitingConfirm = true
      resetProperties(mySession, 'isWaitingConfirm')
    }
  }
}

export default function (state = initialState, { type, payload }) {
  const stateClone = _.cloneDeep(state)
  switch (type) {
    case ADD:
      const isDuplicate = state.members.findIndex((m) => m.userId == payload.user.id) > -1
      if (isDuplicate) return state
      const newMember = {
        userId: payload.user.id,
        status: OFFLINE,
      }
      return { ...state, members: [...state.members, newMember] }
    case DEL:
      const membersAfterDel = state.members.filter((m) => m.userId != payload.user.id)
      return { ...state, members: membersAfterDel }
    case CHANGE:
      return { ...state, members: [...state.members, ...payload] }
    case UPDATE_LATE_COMER:

    case UPDATE:
      const membersUpdated = stateClone.members
      const mySessionUpdated = stateClone.mySession
      editMembers(membersUpdated, payload)
      editMySession(mySessionUpdated, payload)
      return { ...state, members: membersUpdated, mySession: mySessionUpdated }
    case RESET_RECONNECT:
      const membersReset = stateClone.members
      const mySessionReset = stateClone.mySession
      resetMembers(membersReset)
      // resetProperties(mySessionReset)
      return { ...state, members: membersReset, mySession: initialState.mySession }
    default:
      return state
  }
}

export const add = (payload) => ({ type: ADD, payload })
export const update = (payload) => ({ type: UPDATE, payload })
export const updateLateComer = (payload) => ({ type: UPDATE_LATE_COMER, payload })
export const change = (payload) => ({ type: CHANGE, payload })
export const del = (payload) => ({ type: DEL, payload })
export const resetReconnect = () => ({ type: RESET_RECONNECT })
