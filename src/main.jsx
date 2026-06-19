import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import storage from './utils/storage.js'

// Pre-initialize storage before mounting React to guarantee synchronous storage gets work immediately
storage.init().then(() => {
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
}).catch(err => {
  console.error('[Main] Failed to initialize storage:', err);
  // Mount anyway so the app doesn't stay white on failure
  createRoot(document.getElementById('root')).render(
    <StrictMode>
      <App />
    </StrictMode>,
  )
});
