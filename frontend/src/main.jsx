import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import './index.css'
import App from './App.jsx'

import {QueryClient, QueryClientProvider} from "@tanstack/react-query"
import { store } from './store/store'
import SocketProvider from './components/SocketProvider'

const client = new QueryClient();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Provider store={store}>
      <QueryClientProvider client={client}>
        <SocketProvider>
          <App />
        </SocketProvider>
      </QueryClientProvider>
    </Provider>
  </StrictMode>,
)
