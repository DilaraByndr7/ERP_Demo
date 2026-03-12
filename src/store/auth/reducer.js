import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT } from './types'

const initialState = {
  token: null,
  user: null,
  loading: false,
  error: null,
  isAuthenticated: false,
}

export const authReducer = (state = initialState, action) => {
  switch (action.type) {
    case LOGIN_REQUEST:
      return { ...state, loading: true, error: null }
    case LOGIN_SUCCESS:
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
        loading: false,
        error: null,
        isAuthenticated: true,
      }
    case LOGIN_FAILURE:
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false,
      }
    case LOGOUT:
      return {
        ...state,
        token: null,
        user: null,
        isAuthenticated: false,
        error: null,
      }
    default:
      return state
  }
}
