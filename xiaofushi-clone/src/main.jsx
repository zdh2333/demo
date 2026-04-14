import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

const savedTheme = localStorage.getItem('redo-theme') || 'light';
const resolved = savedTheme === 'auto'
  ? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  : savedTheme;
document.documentElement.setAttribute('data-theme', resolved);

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
