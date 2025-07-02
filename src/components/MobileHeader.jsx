const MobileHeader = ({ onToggleMenu }) => {
  return (
    <div className="d-md-none sticky-top w-100 border-bottom border-spotify-gray" 
         style={{
           background: 'linear-gradient(to right, black, var(--spotify-dark), black)',
           backdropFilter: 'blur(12px)',
           zIndex: 1030
         }}>
      <div className="d-flex justify-content-between align-items-center p-3">
        {/* Logo Section */}
        <div className="d-flex align-items-center">
          <div className="bg-spotify-green rounded d-flex align-items-center justify-content-center me-3 shadow" 
               style={{width: '40px', height: '40px'}}>
            <i className="fab fa-spotify text-dark fs-5"></i>
          </div>
          <div>
            <h1 className="h6 fw-bold text-white mb-0">Playlist Converter</h1>
            <small className="text-spotify-light-gray">YouTube to Spotify</small>
          </div>
        </div>

        {/* Menu Button */}
        <button 
          onClick={onToggleMenu}
          className="btn bg-spotify-light d-flex align-items-center justify-content-center border-0"
          style={{width: '48px', height: '48px'}}
          aria-label="메뉴 열기"
        >
          <i className="fas fa-bars text-white fs-5"></i>
        </button>
      </div>

      {/* Animated Bottom Border */}
      <div style={{
        height: '2px',
        background: 'linear-gradient(to right, transparent, var(--spotify-green), transparent)'
      }}></div>
    </div>
  )
}

export default MobileHeader 