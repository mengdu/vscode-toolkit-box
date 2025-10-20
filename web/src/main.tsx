import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StoreContext } from './StateContext.tsx'
import App from './App.tsx'
import './tailwind.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreContext>
      <App />
    </StoreContext>
  </StrictMode>,
)
