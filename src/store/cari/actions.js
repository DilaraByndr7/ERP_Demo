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
import { apiClient } from '../../lib/apiClient'
import { ApiActionError } from '../../lib/ApiActionError'

export const fetchCariList = (page = 1, limit = 50, filters = {}, sort = 'createdAt', order = 'desc') => async (dispatch) => {
  dispatch({ type: FETCH_CARI_REQUEST })

  try {
    const params = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
      sort,
      order,
      ...filters,
    })
    
    const response = await apiClient.get(`/cari-accounts?${params}`)
    
    if (Array.isArray(response.data)) {
      dispatch({ 
        type: FETCH_CARI_SUCCESS, 
        payload: response.data,
        pagination: { page: 1, limit: response.data.length, total: response.data.length, totalPages: 1 }
      })
    } else {
      dispatch({ 
        type: FETCH_CARI_SUCCESS, 
        payload: response.data.data || [],
        pagination: response.data.pagination || { page: 1, limit: 50, total: 0, totalPages: 0 }
      })
    }
  } catch (error) {
    dispatch({
      type: FETCH_CARI_FAILURE,
      payload: error.message || 'Cari listesi çekilirken bir hata oluştu',
    })
  }
}

export const createCari = (payload) => async (dispatch) => {
  dispatch({ type: CREATE_CARI_REQUEST })

  try {
    const response = await apiClient.post(
      '/cari-accounts',
      payload,
    )
    dispatch({ type: CREATE_CARI_SUCCESS, payload: response.data })
    dispatch(fetchCariList())
    return { success: true, data: response.data }
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Cari kaydedilirken bir hata oluştu'
    const errorDetails = error.response?.data?.details || []
    
    dispatch({
      type: CREATE_CARI_FAILURE,
      payload: errorMessage,
    })
    

    throw new ApiActionError(errorMessage, errorDetails)
  }
}

export const updateCari = (id, payload) => async (dispatch) => {
  dispatch({ type: UPDATE_CARI_REQUEST })

  try {
    const response = await apiClient.put(
      `/cari-accounts/${id}`,
      payload,
    )
    dispatch({ type: UPDATE_CARI_SUCCESS, payload: response.data })
    dispatch(fetchCariList())
    return { success: true, data: response.data }
  } catch (error) {
    const errorMessage = error.response?.data?.error || error.message || 'Cari güncellenirken bir hata oluştu'
    const errorDetails = error.response?.data?.details || []
    
    dispatch({
      type: UPDATE_CARI_FAILURE,
      payload: errorMessage,
    })
    
    
    throw new ApiActionError(errorMessage, errorDetails)
  }
}

export const deleteCari = (id) => async (dispatch) => {
  dispatch({ type: DELETE_CARI_REQUEST })

  try {
    await apiClient.delete(`/cari-accounts/${id}`)
    dispatch({ type: DELETE_CARI_SUCCESS, payload: id })
    dispatch(fetchCariList())
  } catch (error) {
    dispatch({
      type: DELETE_CARI_FAILURE,
      payload: error.message || 'Cari silinirken bir hata oluştu',
    })
  }
}

export const addDocumentToCari = (cariId, file, documentData) => async (dispatch) => {
  try {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('name', documentData.name)
    formData.append('type', documentData.type)

    const response = await apiClient.post(
      `/cari-accounts/${cariId}/documents`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      },
    )
    
    dispatch(fetchCariList())
    return response.data
  } catch (error) {
    throw new Error(error.message || 'Doküman eklenirken bir hata oluştu')
  }
}

export const deleteDocumentFromCari = (cariId, documentId) => async (dispatch) => {
  try {
    await apiClient.delete(`/cari-accounts/${cariId}/documents/${documentId}`)
    dispatch(fetchCariList())
  } catch (error) {
    throw new Error(error.message || 'Doküman silinirken bir hata oluştu')
  }
}
