import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import { WebviewProvider } from 'src/contexts/WebviewContext'

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <WebviewProvider>
      <App />
    </WebviewProvider>
  </React.StrictMode>
)
