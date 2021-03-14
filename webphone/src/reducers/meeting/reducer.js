// const TECH_ASSISTANT_NAME = '_ibp_techassist'
export const ADD = 'MEETING:ADD'
export const UPDATE_CURRENT_MEETING = 'MEETING:UPDATE_CURRENT_MEETING'
export const UPDATE_LATEST_MESSAGE = 'MEETING:UPDATE_LATEST_MESSAGE'
export const UPDATE_LATEST_MESSAGE_WHEN_NEW_MESSAGE = 'MEETING:UPDATE_LATEST_MESSAGE_WHEN_NEW_MESSAGE'
export const ADD_MESSAGE = 'MEETING:ADD_MESSAGE'
export const ADD_MEETING_OFF = 'MEETING:ADD_MEETING_OFF'
export const REMOVE_MEETING_OFF = 'MEETING:REMOVE_MEETING_OFF'
export const UPDATE_MSG_FROM_TO = 'MEETING:UPDATE_MSG_FROM_TO'
export const DELETE_MEETING = 'MEETING:DELETE_MEETING'
export const REMOVE_USER = 'MEETING:REMOVE_USER'
export const REMOVE_MEETING = 'MEETING:REMOVE_MEETING'

const params = new URLSearchParams(window.location.search)
const username = params.get('username')

const initialState = {
  meetings: [],
  currentMeeting: null,
  newTechnical: null,
  meetingsOff: [],
}

export default function (state = initialState, { type, payload }) {
  const { meetings } = state
  const meetingsClone = [...state.meetings]
  const meetingsOffClone = [...state.meetingsOff]
  switch (type) {
    case ADD:
      const existingMeeting = meetings.every((m) => m.id !== payload.id)
      const isReplace = meetings.every((m) => m.hash !== payload.hash || m.title !== payload.title)
      if (!existingMeeting && !isReplace) return { ...state }
      if (!existingMeeting && isReplace) {
        const { meetings } = state
        const newMeetings = [...meetings]
        const index = newMeetings.findIndex((m) => m.id == payload.id)
        newMeetings[index] = payload
        return { ...state, meetings: [...newMeetings] }
      }
      if (payload.type == 'Technical' && !username.match(/^_ibp_techassist/)) {
        const { meetings } = state
        const newMeetings = [...meetings]
        const index = newMeetings.findIndex((m) => m.type == 'Technical')
        if (index == -1) {
          return { ...state, meetings: [...state.meetings, payload], newTechnical: payload }
        }
        newMeetings[index] = payload
        return { ...state, meetings: [...newMeetings], newTechnical: payload }
      }
      return { ...state, meetings: [...state.meetings, payload] }
    case UPDATE_CURRENT_MEETING:
      return { ...state, currentMeeting: payload }
    case ADD_MESSAGE:
      return { ...state, currentMeeting: payload }
    case UPDATE_LATEST_MESSAGE:
      if (!payload) return { ...state }
      const targetMeeting = meetingsClone.find((m) => m.id == payload.meeting.id)
      targetMeeting.latestMsg = payload
      const index = meetingsClone.findIndex((m) => m.id == payload.meeting.id)
      meetingsClone[index] = targetMeeting
      return { ...state, meetings: [...meetingsClone] }
    case UPDATE_LATEST_MESSAGE_WHEN_NEW_MESSAGE:
      const { currentMeeting } = state
      if (!currentMeeting || currentMeeting.id != payload.meeting.id) return { ...state }
      const targetCurrentMeeting = meetingsClone.find((m) => m.id == payload.meeting.id)
      targetCurrentMeeting.latestMsg = payload
      const indexCurrentMeeting = meetingsClone.findIndex((m) => m.id == payload.meeting.id)
      meetingsClone[indexCurrentMeeting] = targetCurrentMeeting
      return { ...state, meetings: [...meetingsClone] }
    case ADD_MEETING_OFF:
      return { ...state, meetingsOff: [...state.meetingsOff, payload] }
    case REMOVE_MEETING_OFF:
      const newMeetingsOff = meetingsOffClone.filter((m) => m.id != payload.id)
      return { ...state, meetingsOff: newMeetingsOff }
    case UPDATE_MSG_FROM_TO:
      const target = meetingsClone.find((m) => m.id == payload.meeting.id)
      target.msgFromTo = payload.message
      const indexTarget = meetingsClone.findIndex((m) => m.id == payload.meeting.id)
      meetingsClone[indexTarget] = target
      return { ...state, meetings: meetingsClone }
    case DELETE_MEETING:
      const newListMeetings = meetingsClone.filter(m => m.id != payload.id)
      const newListMeetingsOff = meetingsOffClone.filter(m => m.id != payload.id)
      return { ...state, meetings: newListMeetings , meetingsOff: newListMeetingsOff}
    case REMOVE_USER: 
      const removeUserMeeting = meetingsClone.find(m => m.title == payload.meeting.title)
      removeUserMeeting.title = removeUserMeeting.title.split(',').filter(id => id != payload.user.id).join(',')
      return { ...state, meetings: meetingsClone}
    case REMOVE_MEETING: 
      const meetingsAfterRemove = meetingsClone.filter(m => m.id != payload.id)
      return {...state, meetings: meetingsAfterRemove}
    default:
      return state
  }
}

export const add = (data) => ({ type: ADD, payload: data })
export const updateCurrentMeeting = (data) => ({ type: UPDATE_CURRENT_MEETING, payload: data })
export const addMessage = (data) => ({ type: ADD_MESSAGE, payload: data })
export const updateLatestMsg = (data) => ({ type: UPDATE_LATEST_MESSAGE, payload: data })
export const updateLatestMsgWhenNewMessage = (data) => ({ type: UPDATE_LATEST_MESSAGE_WHEN_NEW_MESSAGE, payload: data })
export const addMeetingOff = (data) => ({ type: ADD_MEETING_OFF, payload: data })
export const removeMeetingOff = (data) => ({ type: REMOVE_MEETING_OFF, payload: data })
export const updateMsgFromTo = (data) => ({ type: UPDATE_MSG_FROM_TO, payload: data })
export const deleteMeeting = data => ({type: DELETE_MEETING, payload: data})
export const removeUser = data => ({type: REMOVE_USER, payload: data})
export const removeMeeting = data => ({type: REMOVE_MEETING, payload: data})
