import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_TRANSACTIONS_SUCCESS,
  FETCH_TRANSACTIONS_FAILURE,
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

export const transactionsReducer = (state = initialState, action) => {
  switch (action.type) {
    case FETCH_TRANSACTIONS_REQUEST:
      return { ...state, loading: true, error: null }
    case FETCH_TRANSACTIONS_SUCCESS:
      return {
        ...state,
        items: action.payload,
        pagination: action.pagination || state.pagination,
        loading: false,
      }
    case FETCH_TRANSACTIONS_FAILURE:
      return { ...state, loading: false, error: action.payload }
    default:
      return state
  }
}
