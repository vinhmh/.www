import { DISCONNECTED, LOADING, AUTH_ERROR } from '../../components/SplashScreen'

export const STATUS_UPDATE = 'SPLASH_SCREEN/STATUS_UPDATE'

const initialState = { status: LOADING }

export default function (state = initialState, { type, payload }) {
  switch (type) {
    case STATUS_UPDATE:
      return { ...state, ...payload }
    default:
      return state
  }
}

export const updateStatus = status => ({ type: STATUS_UPDATE, payload: { status } })

export const disconnected = () => dispatch => dispatch(updateStatus(DISCONNECTED))

export const loading = () => dispatch => dispatch(updateStatus(LOADING))

export const auth_error = () => dispatch => dispatch(updateStatus(AUTH_ERROR))

export const hide = () => dispatch => dispatch(updateStatus(null))
