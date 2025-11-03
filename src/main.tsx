import { StrictMode } from 'react'
import { ClickToComponent } from 'click-to-react-component';
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './styles/global.css'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    
    <App />
    <ClickToComponent />
  </StrictMode>,
)
