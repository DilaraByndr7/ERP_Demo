import { LOGIN_REQUEST, LOGIN_SUCCESS, LOGIN_FAILURE, LOGOUT } from './types'
import { apiClient, getStoredToken, setAuthToken } from '../../lib/apiClient'
import { ApiActionError } from '../../lib/ApiActionError'

export const login = (username, password) => async (dispatch) => {
  dispatch({ type: LOGIN_REQUEST })

  try {
    const response = await apiClient.post('/auth/login', {
      username,
      password,
    })

    const { token, user } = response.data

    // The token is being saved to localStorage
    localStorage.setItem('token', token)
    localStorage.setItem('user', JSON.stringify(user))

    // Add the token to the API client header
    setAuthToken(token)

    dispatch({ type: LOGIN_SUCCESS, payload: { token, user } })
    return { success: true, user }
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Giriş yapılırken bir hata oluştu'
    dispatch({ type: LOGIN_FAILURE, payload: errorMessage })
    throw new ApiActionError(errorMessage)
  }
}

//This function handles the output operation
export const logout = () => (dispatch) => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
  setAuthToken(null)
  dispatch({ type: LOGOUT })
}

// Check the token and add it to the header
export const checkAuth = () => (dispatch) => {
  const token = getStoredToken()
  const userStr = localStorage.getItem('user')

  if (token && userStr) {
    try {
      const user = JSON.parse(userStr)
      setAuthToken(token)
      dispatch({ type: LOGIN_SUCCESS, payload: { token, user } })
    } catch (error) {
      // Invalid user data, clear storage
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }
  }
}
