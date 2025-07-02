import { useState } from 'react'

const PlayerBar = () => {
  const [isPlaying, setIsPlaying] = useState(true)
  const [volume, setVolume] = useState(70)

  const togglePlay = () => {
    setIsPlaying(!isPlaying)
  }

  return (
    <div className="position-fixed bottom-0 start-0 end-0 bg-spotify-light border-top border-spotify-gray p-3 d-flex align-items-center">
      {/* Currently Playing */}
      <div className="d-flex align-items-center" style={{width: '25%'}}>
        <img 
          src="https://via.placeholder.com/56x56" 
          alt="Now Playing" 
          className="rounded me-3"
          style={{width: '56px', height: '56px'}}
        />
        <div className="me-3">
          <h6 className="fw-bold small mb-0 text-white">변환된 플레이리스트</h6>
          <small className="text-spotify-light-gray">Playlist Converter</small>
        </div>
        <div className="d-flex">
          <button className="btn btn-link text-spotify-light-gray p-1 border-0">
            <i className="far fa-heart"></i>
          </button>
        </div>
      </div>
      
      {/* Player Controls */}
      <div className="d-flex flex-column align-items-center" style={{width: '50%'}}>
        <div className="d-flex align-items-center mb-2">
          <button className="btn btn-link text-spotify-light-gray p-1 mx-2 border-0">
            <i className="fas fa-random"></i>
          </button>
          <button className="btn btn-link text-spotify-light-gray p-1 mx-2 border-0">
            <i className="fas fa-step-backward"></i>
          </button>
          <button 
            onClick={togglePlay}
            className="btn btn-light rounded-circle d-flex align-items-center justify-content-center mx-2 border-0"
            style={{
              width: '32px', 
              height: '32px',
              transition: 'transform 0.2s ease'
            }}
          >
            <i className={`fas ${isPlaying ? 'fa-pause' : 'fa-play'} text-dark`}></i>
          </button>
          <button className="btn btn-link text-spotify-light-gray p-1 mx-2 border-0">
            <i className="fas fa-step-forward"></i>
          </button>
          <button className="btn btn-link text-spotify-light-gray p-1 mx-2 border-0">
            <i className="fas fa-redo"></i>
          </button>
        </div>
        <div className="w-100 d-flex align-items-center">
          <small className="text-spotify-light-gray me-2">1:23</small>
          <div className="progress-bar flex-grow-1 rounded-pill">
            <div className="progress rounded-pill"></div>
          </div>
          <small className="text-spotify-light-gray ms-2">3:45</small>
        </div>
      </div>
      
      {/* Volume and Additional Controls */}
      <div className="d-flex justify-content-end align-items-center" style={{width: '25%'}}>
        <button className="btn btn-link text-spotify-light-gray p-1 mx-2 border-0">
          <i className="fas fa-list"></i>
        </button>
        <button className="btn btn-link text-spotify-light-gray p-1 mx-2 border-0">
          <i className="fas fa-laptop"></i>
        </button>
        <div className="d-flex align-items-center ms-3">
          <button className="btn btn-link text-spotify-light-gray p-1 border-0">
            <i className="fas fa-volume-up"></i>
          </button>
          <div className="progress-bar ms-2 rounded-pill" style={{width: '80px'}}>
            <div 
              className="progress rounded-pill" 
              style={{ width: `${volume}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PlayerBar 