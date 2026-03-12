import {
  FETCH_CARI_REQUEST,
  FETCH_CARI_SUCCESS,
  FETCH_CARI_FAILURE,
  CREATE_CARI_REQUEST,
  CREATE_CARI_SUCCESS,
  CREATE_CARI_FAILURE,
  UPDATE_CARI_REQUEST,
  UPDATE_CARI_SUCCESS,
  UPDATE_CARI_FAILURE,
  DELETE_CARI_REQUEST,
  DELETE_CARI_SUCCESS,
  DELETE_CARI_FAILURE,
} from './types'

const initialState = {
  items: [],
  loading: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },
}

export const cariReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_CARI_REQUEST:
      return { ...state, loading: true, error: null }
    case FETCH_CARI_SUCCESS:
      return { 
        ...state, 
        items: action.payload, 
        pagination: action.pagination || state.pagination,
        loading: false 
      }
    case FETCH_CARI_FAILURE:
      return { ...state, loading: false, error: action.payload }
    case CREATE_CARI_REQUEST:
      return { ...state, loading: true, error: null }
    case CREATE_CARI_SUCCESS:
      return { ...state, loading: false }
    case CREATE_CARI_FAILURE:
      return { ...state, loading: false, error: action.payload }
    case UPDATE_CARI_REQUEST:
      return { ...state, loading: true, error: null }
    case UPDATE_CARI_SUCCESS:
      return { ...state, loading: false }
    case UPDATE_CARI_FAILURE:
      return { ...state, loading: false, error: action.payload }
    case DELETE_CARI_REQUEST:
      return { ...state, loading: true, error: null }
    case DELETE_CARI_SUCCESS:
      return { ...state, loading: false }
    case DELETE_CARI_FAILURE:
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}

