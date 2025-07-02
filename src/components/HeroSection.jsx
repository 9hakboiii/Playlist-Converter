import { useState, useEffect } from 'react'
import { toast } from 'react-toastify'
import { 
  isSpotifyAuthenticated, 
  startSpotifyAuth, 
  getStoredSpotifyToken,
  logoutSpotify 
} from '../services/converterService'

const HeroSection = ({ onConvert }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isSpotifyConnected, setIsSpotifyConnected] = useState(false)
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)

  // Spotify 인증 상태 확인
  useEffect(() => {
    const checkSpotifyAuth = () => {
      const isAuthenticated = isSpotifyAuthenticated()
      console.log('Spotify 인증 상태:', isAuthenticated)
      setIsSpotifyConnected(isAuthenticated)
      setIsCheckingAuth(false)
      
      // 인증 완료 후 URL 파라미터 정리
      const urlParams = new URLSearchParams(window.location.search)
      if (urlParams.get('spotify') === 'connected' && isAuthenticated) {
        // URL에서 파라미터 제거
        window.history.replaceState({}, document.title, window.location.pathname)
        toast.success('🎵 Spotify 계정 연결이 완료되었습니다!')
      }
    }

    // 초기 인증 상태 확인
    checkSpotifyAuth()

    // URL 파라미터로 인증 완료 신호 감지
    const urlParams = new URLSearchParams(window.location.search)
    if (urlParams.get('spotify') === 'connected') {
      console.log('🎉 Spotify 인증 완료 신호 감지!')
      // 약간의 지연 후 상태 확인 (토큰 저장 완료 대기)
      setTimeout(checkSpotifyAuth, 500)
    }

    // Window focus 이벤트 (백업 방법)
    const handleUrlChange = () => {
      setTimeout(checkSpotifyAuth, 1000)
    }

    // Storage 이벤트 감지 (다른 탭에서 로그인 완료 시)
    const handleStorageChange = (e) => {
      if (e.key === 'spotify_token' && e.newValue) {
        console.log('🔄 Storage 변경 감지 - Spotify 토큰 업데이트')
        setTimeout(checkSpotifyAuth, 500)
      }
    }

    window.addEventListener('focus', handleUrlChange)
    window.addEventListener('storage', handleStorageChange)
    
    return () => {
      window.removeEventListener('focus', handleUrlChange)
      window.removeEventListener('storage', handleStorageChange)
    }
  }, [])

  const handleInputChange = (e) => {
    const value = e.target.value
    console.log('Input 변경됨:', value)
    setYoutubeUrl(value)
  }

  const handleSpotifyConnect = () => {
    console.log('Spotify 연결 시작...')
    toast.info('Spotify로 리디렉션됩니다...')
    startSpotifyAuth()
  }

  const handleSubmit = async (e) => {
    if (e) {
      e.preventDefault()
    }
    
    console.log('handleSubmit 호출됨:', { youtubeUrl, isLoading })
    
    if (!youtubeUrl.trim()) {
      toast.error('YouTube 플레이리스트 URL을 입력해주세요')
      return
    }

    // URL 검증을 더 관대하게 변경 (테스트용)
    if (!youtubeUrl.includes('youtube.com') && !youtubeUrl.includes('youtu.be')) {
      toast.error('올바른 YouTube URL을 입력해주세요')
      return
    }

    setIsLoading(true)
    
    try {
      console.log('onConvert 호출 중...')
      await onConvert(youtubeUrl)
      toast.success('플레이리스트 변환이 시작되었습니다! 완료되면 알려드리겠습니다.')
      setYoutubeUrl('')
    } catch (error) {
      console.error('변환 오류:', error)
      toast.error('변환 중 오류가 발생했습니다. 다시 시도해주세요.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-spotify-gray p-4 p-md-5" style={{background: 'linear-gradient(to bottom, var(--spotify-gray), var(--spotify-dark))'}}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12">
            <h1 className="display-3 display-md-1 fw-bold mb-4 text-white">YouTube를 Spotify로 변환</h1>
            <p className="fs-4 fs-md-3 mb-5 text-spotify-light-gray">
              좋아하는 플레이리스트를 YouTube에서 Spotify로 쉽게 이전하세요
            </p>
            
            {/* Conditional Content Based on Spotify Authentication */}
            <div className="bg-spotify-light p-4 p-md-5 rounded shadow-lg">
              <div className="row">
                <div className="col-12 col-lg-8 mx-auto">
                  {isCheckingAuth ? (
                    // 인증 상태 확인 중
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <i className="fas fa-spinner fa-spin text-spotify-green fs-1"></i>
                      </div>
                      <h3 className="h4 text-white mb-3">연결 상태 확인 중...</h3>
                      <p className="text-spotify-light-gray">
                        Spotify 계정 연결 상태를 확인하고 있습니다.
                      </p>
                    </div>
                  ) : !isSpotifyConnected ? (
                    // Spotify 계정 연결 필요
                    <div className="text-center py-5">
                      <div className="mb-4">
                        <div className="bg-spotify-green rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow-lg" 
                             style={{width: '100px', height: '100px'}}>
                          <i className="fab fa-spotify text-dark" style={{fontSize: '3rem'}}></i>
                        </div>
                      </div>
                      <h2 className="h3 fw-bold mb-3 text-white">Spotify 계정 연결</h2>
                      <p className="text-spotify-light-gray mb-4 fs-5">
                        YouTube 플레이리스트를 Spotify로 변환하려면<br/>
                        먼저 Spotify 계정에 연결해주세요
                      </p>
                      
                      <button 
                        onClick={handleSpotifyConnect}
                        className="btn fw-bold text-dark d-flex align-items-center justify-content-center mx-auto px-5 py-3"
                        style={{
                          backgroundColor: 'var(--spotify-green)',
                          border: 'none',
                          borderRadius: '2rem',
                          fontSize: '1.1rem',
                          cursor: 'pointer',
                          pointerEvents: 'auto',
                          position: 'relative',
                          zIndex: 10,
                          boxShadow: '0 8px 25px rgba(29, 185, 84, 0.3)',
                          transition: 'all 0.3s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.target.style.transform = 'translateY(-2px)'
                          e.target.style.boxShadow = '0 12px 35px rgba(29, 185, 84, 0.4)'
                        }}
                        onMouseLeave={(e) => {
                          e.target.style.transform = 'translateY(0px)'
                          e.target.style.boxShadow = '0 8px 25px rgba(29, 185, 84, 0.3)'
                        }}
                      >
                        <i className="fab fa-spotify me-3 fs-4"></i>
                        Spotify 계정 연결하기
                      </button>
                      
                      <div className="mt-4">
                        <small className="text-spotify-light-gray">
                          <i className="fas fa-lock me-2"></i>
                          안전한 OAuth 2.0 인증을 통해 연결됩니다
                        </small>
                      </div>
                      
                      {/* 기능 안내 */}
                      <div className="row mt-5 g-4">
                        <div className="col-12 col-md-4">
                          <div className="text-center">
                            <i className="fab fa-youtube text-danger fs-2 mb-2"></i>
                            <h6 className="text-white mb-1">YouTube 플레이리스트</h6>
                            <small className="text-spotify-light-gray">URL만 붙여넣기</small>
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div className="text-center">
                            <i className="fas fa-magic text-warning fs-2 mb-2"></i>
                            <h6 className="text-white mb-1">자동 매칭</h6>
                            <small className="text-spotify-light-gray">AI 기반 곡 검색</small>
                          </div>
                        </div>
                        <div className="col-12 col-md-4">
                          <div className="text-center">
                            <i className="fab fa-spotify text-spotify-green fs-2 mb-2"></i>
                            <h6 className="text-white mb-1">Spotify 플레이리스트</h6>
                            <small className="text-spotify-light-gray">자동 생성 완료</small>
                          </div>
                        </div>
                      </div>
                    </div>
                  ) : (
                    // Spotify 연결됨 - URL 입력 폼 표시
                    <>
                      <div className="d-flex justify-content-between align-items-center mb-4">
                        <h2 className="h3 fw-bold mb-0 text-white">YouTube 플레이리스트 URL 입력</h2>
                        <div className="d-flex align-items-center gap-3">
                          <div className="d-flex align-items-center">
                            <i className="fas fa-check-circle text-success me-2"></i>
                            <small className="text-spotify-light-gray">Spotify 연결됨</small>
                          </div>
                          <button
                            onClick={() => {
                              logoutSpotify()
                              setIsSpotifyConnected(false)
                              toast.info('Spotify 계정 연결이 해제되었습니다')
                            }}
                            className="btn btn-outline-light btn-sm"
                            style={{fontSize: '0.8rem'}}
                          >
                            <i className="fas fa-sign-out-alt me-1"></i>
                            연결 해제
                          </button>
                        </div>
                      </div>
                      
                      <form onSubmit={handleSubmit}>
                        <div className="row g-3">
                          <div className="col-12 col-md-8">
                            <input 
                              type="text" 
                              value={youtubeUrl}
                              onChange={handleInputChange}
                              onClick={(e) => {
                                e.stopPropagation()
                                console.log('Input 클릭됨!')
                              }}
                              onFocus={() => console.log('Input 포커스됨!')}
                              placeholder="https://www.youtube.com/playlist?list=..." 
                              className="form-control text-white border-0"
                              style={{
                                padding: '1rem',
                                backgroundColor: 'var(--spotify-gray)',
                                color: 'white !important',
                                cursor: 'text',
                                pointerEvents: 'auto',
                                position: 'relative',
                                zIndex: 10
                              }}
                              disabled={isLoading}
                              autoComplete="off"
                            />
                          </div>
                          <div className="col-12 col-md-4">
                            <button 
                              type="submit"
                              disabled={isLoading}
                              onClick={(e) => {
                                e.stopPropagation()
                                console.log('변환 버튼 클릭됨!')
                              }}
                              className="btn w-100 fw-bold text-dark d-flex align-items-center justify-content-center"
                              style={{
                                backgroundColor: 'var(--spotify-green)',
                                border: 'none',
                                padding: '1rem',
                                borderRadius: '0.5rem',
                                cursor: isLoading ? 'not-allowed' : 'pointer',
                                pointerEvents: 'auto',
                                position: 'relative',
                                zIndex: 10
                              }}
                            >
                              {isLoading ? (
                                <>
                                  <i className="fas fa-spinner fa-spin me-2"></i> 
                                  변환 중...
                                </>
                              ) : (
                                <>
                                  <i className="fab fa-spotify me-2"></i> 
                                  변환하기
                                </>
                              )}
                            </button>
                          </div>
                        </div>
                      </form>
                      
                      <div className="mt-4">
                        <small className="text-spotify-light-gray">
                          플레이리스트를 분석하여 Spotify 계정에 일치하는 플레이리스트를 생성합니다.
                        </small>
                      </div>
                      
                      {/* 개발용 테스트 버튼들 - 개발 환경에서만 표시 */}
                      {process.env.NODE_ENV === 'development' && (
                        <div className="mt-3 d-flex gap-2 flex-wrap" style={{zIndex: 10, position: 'relative'}}>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log('테스트 URL 설정 클릭됨!')
                              setYoutubeUrl('https://www.youtube.com/playlist?list=test')
                              toast.success('테스트 URL이 설정되었습니다!')
                            }}
                            className="btn btn-outline-warning btn-sm"
                            style={{cursor: 'pointer', pointerEvents: 'auto', fontSize: '0.75rem'}}
                          >
                            🎯 DEV: 테스트 URL
                          </button>
                          <button 
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation()
                              console.log('인증 상태 재확인!')
                              const authStatus = isSpotifyAuthenticated()
                              setIsSpotifyConnected(authStatus)
                              toast.info(`Spotify 연결: ${authStatus ? '✅' : '❌'}`)
                            }}
                            className="btn btn-outline-info btn-sm"
                            style={{cursor: 'pointer', pointerEvents: 'auto', fontSize: '0.75rem'}}
                          >
                            🔄 DEV: 상태 새로고침
                          </button>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HeroSection 