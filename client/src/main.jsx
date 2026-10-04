import { BrowserRouter } from 'react-router'
import { createRoot } from 'react-dom/client'
import {Provider} from 'react-redux'
import store from './store'
import App from './App.jsx'
import './index.css'

createRoot(document.getElementById('root')).render(
  <BrowserRouter>
    <Provider store = {store}>
      <App />
    </Provider>
  </BrowserRouter>,
)
