import { useState } from 'react'
import Sidebar from '../components/Sidebar'
import HeroSection from '../components/HeroSection'
import RecentConversions from '../components/RecentConversions'
import HowItWorks from '../components/HowItWorks'
import PlayerBar from '../components/PlayerBar'
import MobileHeader from '../components/MobileHeader'
import { 
  convertYouTubeContent, 
  isSpotifyAuthenticated, 
  getStoredSpotifyToken,
  startSpotifyAuth 
} from '../services/converterService'
import { toast } from 'react-toastify'

const HomePage = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [conversions, setConversions] = useState([
    {
      id: 1,
      title: "Summer Vibes 2023",
      songCount: 24,
      convertedDate: "3 days ago",
      imageUrl: null // CSS placeholder 사용
    },
    {
      id: 2,
      title: "Workout Mix",
      songCount: 45,
      convertedDate: "1 week ago",
      imageUrl: null // CSS placeholder 사용
    },
    {
      id: 3,
      title: "Chill Lofi Beats",
      songCount: 120,
      convertedDate: "2 weeks ago",
      imageUrl: null // CSS placeholder 사용
    }
  ])

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen)
  }

  const handleConvert = async (youtubeUrl) => {
    try {
      // Spotify 인증 확인
      if (!isSpotifyAuthenticated()) {
        toast.info('Spotify 계정에 로그인이 필요합니다')
        startSpotifyAuth()
        return
      }

      const spotifyToken = getStoredSpotifyToken()
      
      // 변환 프로세스 시작
      toast.info('YouTube 콘텐츠 변환을 시작합니다...')
      
      const result = await convertYouTubeContent(youtubeUrl, spotifyToken)
      
      if (result.success) {
        // 성공 메시지
        toast.success(
          `변환 완료! ${result.stats.matched}/${result.stats.total}곡이 매치되었습니다 (${result.stats.matchRate}%)`
        )
        
        // 새로운 변환 결과를 목록에 추가
        const newConversion = {
          id: Date.now(),
          title: result.playlist.name,
          songCount: result.stats.matched,
          convertedDate: "방금 전",
          imageUrl: result.playlist.images?.[0]?.url || null, // CSS placeholder 사용
          spotifyUrl: result.playlist.external_urls.spotify
        }
        
        setConversions(prev => [newConversion, ...prev])
        
        // 매치되지 않은 곡이 있다면 알림
        if (result.stats.unmatched > 0) {
          toast.warning(
            `${result.stats.unmatched}곡을 찾을 수 없어 플레이리스트에 추가되지 않았습니다`
          )
        }
      }
      
    } catch (error) {
      console.error('변환 오류:', error)
      toast.error(`변환 중 오류가 발생했습니다: ${error.message}`)
    }
  }

  return (
    <div className="min-vh-100 bg-spotify-dark">
      {/* Desktop Layout */}
      <div className="d-flex">
        {/* Sidebar */}
        <Sidebar />
        
        {/* Main Content */}
        <div className="main-content w-100" style={{background: 'linear-gradient(to bottom, var(--spotify-dark), var(--spotify-dark), black)'}}>
          {/* Mobile Header */}
          <MobileHeader onToggleMenu={toggleMobileMenu} />
          
          {/* Mobile Menu Overlay */}
          {mobileMenuOpen && (
            <div className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-75 d-md-none" style={{zIndex: 1050}}>
              <div className="p-4">
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h1 className="h5 fw-bold text-white d-flex align-items-center">
                    <i className="fab fa-spotify text-spotify-green me-2 fs-4"></i>
                    Playlist Converter
                  </h1>
                  <button 
                    onClick={toggleMobileMenu}
                    className="btn btn-link text-white p-0"
                  >
                    <i className="fas fa-times fs-4"></i>
                  </button>
                </div>
                
                <ul className="list-unstyled">
                  <li className="mb-4">
                    <a href="#" className="d-flex align-items-center text-white text-decoration-none fs-5">
                      <i className="fas fa-home me-3 fs-5"></i>
                      Home
                    </a>
                  </li>
                  <li className="mb-4">
                    <a href="#" className="d-flex align-items-center text-white text-decoration-none fs-5">
                      <i className="fas fa-search me-3 fs-5"></i>
                      Search
                    </a>
                  </li>
                  <li className="mb-4">
                    <a href="#" className="d-flex align-items-center text-white text-decoration-none fs-5">
                      <i className="fas fa-bookmark me-3 fs-5"></i>
                      Your Library
                    </a>
                  </li>
                  <li className="mb-4 border-top border-spotify-gray pt-3">
                    <a href="#" className="d-flex align-items-center text-white text-decoration-none fs-5">
                      <i className="fas fa-plus-square me-3 fs-5"></i>
                      Create Playlist
                    </a>
                  </li>
                  <li className="mb-4">
                    <a href="#" className="d-flex align-items-center text-white text-decoration-none fs-5">
                      <i className="fas fa-heart me-3 fs-5"></i>
                      Liked Songs
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          )}

          {/* Hero Section with Gradient */}
          <section className="position-relative overflow-hidden">
            <div 
              className="position-absolute top-0 start-0 w-100 h-100" 
              style={{
                background: 'linear-gradient(135deg, rgba(128, 0, 128, 0.2), rgba(29, 185, 84, 0.1), transparent)',
                pointerEvents: 'none',
                zIndex: 1
              }}
            ></div>
            <div style={{position: 'relative', zIndex: 2}}>
              <HeroSection onConvert={handleConvert} />
            </div>
          </section>

          {/* Recent Conversions Section */}
          <section className="px-3 px-md-5 py-5">
            <RecentConversions conversions={conversions} />
          </section>

          {/* How It Works Section */}
          <section className="px-3 px-md-5 py-5">
            <HowItWorks />
          </section>

          {/* Footer Section */}
          <footer className="px-3 px-md-5 py-5 border-top border-spotify-gray mt-5">
            <div className="container">
              <div className="row justify-content-between align-items-center">
                <div className="col-12 col-md-6 mb-3 mb-md-0">
                  <div className="d-flex align-items-center">
                    <i className="fab fa-spotify text-spotify-green me-2 fs-2"></i>
                    <span className="h5 fw-bold text-white mb-0">Playlist Converter</span>
                  </div>
                </div>
                <div className="col-12 col-md-6">
                  <div className="d-flex flex-wrap gap-4 text-spotify-light-gray justify-content-md-end">
                    <a href="#" className="text-decoration-none text-spotify-light-gray">개인정보처리방침</a>
                    <a href="#" className="text-decoration-none text-spotify-light-gray">이용약관</a>
                    <a href="#" className="text-decoration-none text-spotify-light-gray">문의하기</a>
                  </div>
                </div>
              </div>
              <div className="text-center mt-4">
                <small className="text-spotify-light-gray">
                  &copy; 2024 Playlist Converter. YouTube와 Spotify는 각각의 소유주의 상표입니다.
                </small>
              </div>
            </div>
          </footer>
        </div>
      </div>

      {/* Player Bar */}
      <PlayerBar />
    </div>
  )
}

export default HomePage 