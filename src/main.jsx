import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import 'antd/dist/reset.css'
import './index.css'
import App from './App.jsx'
import { store } from './store/store'
import { checkAuth } from './store/auth/actions'


store.dispatch(checkAuth())

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </Provider>
  </StrictMode>,
)
