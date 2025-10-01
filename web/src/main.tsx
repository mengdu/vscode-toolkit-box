import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { StoreContext } from './StateContext.tsx'
import App from './App.tsx'
import './var.less'
import './common.less'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <StoreContext>
      <App />
    </StoreContext>
  </StrictMode>,
)
