import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import 'bootstrap/dist/css/bootstrap.min.css'
import './index.css'
import App from './App.jsx'

createRoot(document.getElementById('root')).render(
  // StrictMode를 일시적으로 비활성화 (Spotify 인증 문제 해결을 위해)
  // <StrictMode>
    <App />
  // </StrictMode>,
)
