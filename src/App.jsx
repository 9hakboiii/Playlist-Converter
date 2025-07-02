import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import HomePage from './pages/HomePage'
import SpotifyCallback from './components/SpotifyCallback'

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/callback" element={<SpotifyCallback />} />
        </Routes>
        <ToastContainer theme="dark" />
      </div>
    </Router>
  )
}

export default App
