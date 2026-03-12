import { applyMiddleware, combineReducers, compose, createStore } from 'redux'
import { thunk } from 'redux-thunk'
import { cariReducer } from './cari/reducer'
import { authReducer } from './auth/reducer'
import { transactionsReducer } from './transactions/reducer'

const rootReducer = combineReducers({
  cari: cariReducer,
  auth: authReducer,
  transactions: transactionsReducer,
})

const composeEnhancers =
  window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose

export const store = createStore(
  rootReducer,
  composeEnhancers(applyMiddleware(thunk)),
)

