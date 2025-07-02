import { useEffect, useRef } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { getAccessToken } from '../services/spotifyService'
import { storeSpotifyToken } from '../services/converterService'
import { toast } from 'react-toastify'

const SpotifyCallback = () => {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const hasProcessed = useRef(false) // 중복 처리 방지

  useEffect(() => {
    const handleCallback = async () => {
      // 이미 처리된 경우 리턴
      if (hasProcessed.current) {
        console.log('🔄 이미 처리된 콜백입니다. 중복 실행 방지.')
        return
      }

      // 디버깅: 현재 URL과 파라미터 정보 로깅
      console.log('🔍 SpotifyCallback 정보:')
      console.log('현재 URL:', window.location.href)
      console.log('URL 파라미터:', Object.fromEntries(searchParams))

      const code = searchParams.get('code')
      const error = searchParams.get('error')
      const state = searchParams.get('state')

      console.log('인증 코드:', code)
      console.log('오류:', error)
      console.log('상태:', state)

      if (error) {
        hasProcessed.current = true
        toast.error('Spotify 인증이 취소되었습니다')
        navigate('/')
        return
      }

      if (code) {
        // 처리 시작 표시
        hasProcessed.current = true

        try {
          // 인증 코드로 액세스 토큰 획득
          console.log('🚀 토큰 요청 시작...')
          const tokenData = await getAccessToken(code)

          // 토큰 저장
          storeSpotifyToken(tokenData)

          // 로그인 페이지를 별도로 분리하여 관리 (로그인을 통해 access token 획득 > mainpage로 rediect)
          toast.success('Spotify 계정에 성공적으로 로그인되었습니다!')
          
          // 인증 완료 신호와 함께 홈페이지로 리디렉션
          navigate('/?spotify=connected')
        } catch (error) {
          console.error('토큰 획득 실패:', error)
          toast.error('Spotify 로그인 중 오류가 발생했습니다')
          navigate('/')
        }
      } else {
        hasProcessed.current = true
        toast.error('인증 코드가 없습니다')
        navigate('/')
      }
    }

    handleCallback()
  }, [searchParams, navigate])

  // Cleanup function으로 중복 실행 방지
  useEffect(() => {
    return () => {
      console.log('🧹 SpotifyCallback cleanup')
    }
  }, [])

  return (
    <div className="min-vh-100 bg-spotify-dark d-flex align-items-center justify-content-center">
      <div className="text-center">
        <div className="mb-4">
          <div className="bg-spotify-green rounded-circle d-flex align-items-center justify-content-center mx-auto mb-4 shadow-lg animate__animated animate__pulse" 
               style={{width: '120px', height: '120px'}}>
            <i className="fab fa-spotify text-dark" style={{fontSize: '4rem'}}></i>
          </div>
        </div>
        <h1 className="h3 fw-bold text-white mb-3">Spotify 인증 처리 중...</h1>
        <p className="text-spotify-light-gray fs-5 mb-4">계정 연결을 완료하고 있습니다</p>
        <div className="mt-4">
          <div className="spinner-border text-spotify-green" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <div className="mt-4">
          <small className="text-spotify-light-gray">
            <i className="fas fa-shield-alt me-2"></i>
            안전한 OAuth 2.0 인증 처리 중
          </small>
        </div>
      </div>
    </div>
  )
}

export default SpotifyCallback
