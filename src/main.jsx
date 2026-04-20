import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { requestPersistentStorage } from './utils/idbStorage.js'

// Ask the browser to mark our storage as persistent.
// On iOS PWA (installed to home screen): this opts out of the
// 7-day inactivity eviction — data is kept like a native app.
requestPersistentStorage();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
