import { useState } from 'react'

const PlaylistCard = ({ playlist }) => {
  const [imageError, setImageError] = useState(false)
  
  const handleClick = () => {
    if (playlist.spotifyUrl) {
      window.open(playlist.spotifyUrl, '_blank')
    }
  }

  const handleImageError = () => {
    setImageError(true)
  }

  return (
    <div 
      className="bg-spotify-light p-3 rounded playlist-card cursor-pointer position-relative"
      onClick={handleClick}
      style={{transition: 'all 0.3s ease'}}
    >
      <div className="position-relative mb-3 overflow-hidden rounded">
        {!imageError && playlist.imageUrl ? (
          <img 
            src={playlist.imageUrl} 
            alt={playlist.title}
            className="w-100 object-fit-cover rounded"
            style={{aspectRatio: '1/1', transition: 'transform 0.3s ease'}}
            onError={handleImageError}
          />
        ) : (
          <div className="w-100 bg-spotify-gray rounded d-flex align-items-center justify-content-center flex-column text-center p-3 position-relative overflow-hidden"
               style={{aspectRatio: '1/1', background: 'linear-gradient(135deg, var(--spotify-light), var(--spotify-gray))'}}>
            {/* Background Pattern */}
            <div className="position-absolute top-0 start-0 w-100 h-100 opacity-25">
              <div className="position-absolute border border-spotify-green rounded-circle" 
                   style={{top: '8px', left: '8px', width: '32px', height: '32px'}}></div>
              <div className="position-absolute border border-spotify-green rounded-circle" 
                   style={{bottom: '8px', right: '8px', width: '24px', height: '24px'}}></div>
              <div className="position-absolute top-50 start-50 translate-middle border border-spotify-green rounded-circle" 
                   style={{width: '48px', height: '48px'}}></div>
            </div>
            
            {/* Main Content */}
            <div className="position-relative">
              <div className="bg-spotify-green rounded-circle d-flex align-items-center justify-content-center mb-3 mx-auto shadow" 
                   style={{width: '64px', height: '64px'}}>
                <i className="fas fa-music text-dark fs-4"></i>
              </div>
              <div className="text-white fw-semibold small text-center px-2"
                   style={{
                     display: '-webkit-box',
                     WebkitLineClamp: 2,
                     WebkitBoxOrient: 'vertical',
                     overflow: 'hidden'
                   }}>
                {playlist.title}
              </div>
            </div>
          </div>
        )}
        <div className="position-absolute bottom-0 end-0 p-2">
          <div className="bg-spotify-green rounded-circle d-flex align-items-center justify-content-center shadow" 
               style={{width: '40px', height: '40px', transition: 'all 0.3s ease'}}>
            <i className="fas fa-play text-dark small"></i>
          </div>
        </div>
      </div>
      
      <div className="mb-3">
        <h3 className="fw-bold h6 text-white mb-1"
            style={{
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden'
            }}>
          {playlist.title}
        </h3>
        <small className="text-spotify-light-gray">
          {playlist.songCount}곡 • YouTube에서 변환됨
        </small>
      </div>
      
      <div className="d-flex align-items-center justify-content-between mt-3 pt-2 border-top" 
           style={{borderColor: 'rgba(83, 83, 83, 0.3)'}}>
        <div className="d-flex align-items-center gap-2">
          <div className="rounded-circle bg-danger d-flex align-items-center justify-content-center" 
               style={{width: '24px', height: '24px'}}>
            <i className="fab fa-youtube text-white" style={{fontSize: '10px'}}></i>
          </div>
          <i className="fas fa-arrow-right text-spotify-light-gray" style={{fontSize: '10px'}}></i>
          <div className="rounded-circle bg-spotify-green d-flex align-items-center justify-content-center" 
               style={{width: '24px', height: '24px'}}>
            <i className="fab fa-spotify text-dark" style={{fontSize: '10px'}}></i>
          </div>
        </div>
        <small className="text-spotify-light-gray">
          {playlist.convertedDate}
        </small>
      </div>
    </div>
  )
}

const RecentConversions = ({ conversions }) => {
  return (
    <div className="container">
      <div className="mb-5">
        <h2 className="display-5 fw-bold text-white mb-2">최근 변환된 플레이리스트</h2>
        <p className="text-spotify-light-gray">YouTube에서 Spotify로 성공적으로 변환된 플레이리스트들을 확인하세요</p>
      </div>
      
      {conversions.length === 0 ? (
        <div className="text-center py-5">
          <div className="bg-spotify-light rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4" 
               style={{width: '96px', height: '96px'}}>
            <i className="fas fa-music text-spotify-light-gray fs-1"></i>
          </div>
          <h3 className="h4 fw-semibold text-white mb-2">아직 변환된 플레이리스트가 없습니다</h3>
          <p className="text-spotify-light-gray mb-4">YouTube 플레이리스트 URL을 입력하여 첫 번째 변환을 시작해보세요!</p>
          <button 
            onClick={() => document.querySelector('input[type="text"]')?.focus()}
            className="btn bg-spotify-green text-dark fw-semibold px-4 py-2 rounded-pill"
          >
            변환 시작하기
          </button>
        </div>
      ) : (
        <div className="row g-4">
          {conversions.map((playlist) => (
            <div key={playlist.id} className="col-12 col-sm-6 col-lg-4 col-xl-3">
              <PlaylistCard playlist={playlist} />
            </div>
          ))}
        </div>
      )}
      
      {conversions.length > 0 && (
        <div className="text-center mt-5">
          <button className="btn btn-link text-spotify-light-gray text-decoration-none fw-semibold">
            모든 플레이리스트 보기
            <i className="fas fa-chevron-right ms-2"></i>
          </button>
        </div>
      )}
    </div>
  )
}

export default RecentConversions 