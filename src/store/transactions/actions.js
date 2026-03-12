import {
  FETCH_TRANSACTIONS_REQUEST,
  FETCH_TRANSACTIONS_SUCCESS,
  FETCH_TRANSACTIONS_FAILURE,
} from './types'
import { apiClient } from '../../lib/apiClient'

export const fetchTransactionList = (
  page = 1,
  limit = 50,
  filters = {},
  sort = 'date',
  order = 'desc',
) => async (dispatch) => {
  dispatch({ type: FETCH_TRANSACTIONS_REQUEST })

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      order,
    })

    Object.entries(filters).forEach(([key, value]) => {
      if (value != null && value !== '') {
        params.append(key, value)
      }
    })

    const response = await apiClient.get(`/transactions?${params}`)
    const { data = [], pagination } = response.data

    dispatch({
      type: FETCH_TRANSACTIONS_SUCCESS,
      payload: data,
      pagination: pagination || {
        page: 1,
        limit: 50,
        total: 0,
        totalPages: 0,
      },
    })
  } catch (error) {
    dispatch({
      type: FETCH_TRANSACTIONS_FAILURE,
      payload: error.response?.data?.error || error.message || 'İşlem listesi çekilirken bir hata oluştu',
    })
  }
}
