import axios from 'axios'

const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID
const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET
const SPOTIFY_REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URL || 'https://localhost:5173/callback'

// 환경 변수 디버깅 (개발 모드에서만)
if (import.meta.env.DEV) {
  console.log('🔍 Spotify 환경 변수 확인:')
  console.log('VITE_SPOTIFY_CLIENT_ID:', SPOTIFY_CLIENT_ID)
  console.log('VITE_SPOTIFY_REDIRECT_URL:', import.meta.env.VITE_SPOTIFY_REDIRECT_URL)
  console.log('최종 SPOTIFY_REDIRECT_URI:', SPOTIFY_REDIRECT_URI)
}

// Spotify 인증 URL 생성
export const getSpotifyAuthUrl = () => {
  const scopes = ['playlist-modify-public', 'playlist-modify-private', 'user-read-private', 'user-read-email'].join(' ')

  const params = new URLSearchParams({
    response_type: 'code',
    client_id: SPOTIFY_CLIENT_ID,
    scope: scopes,
    redirect_uri: SPOTIFY_REDIRECT_URI,
    state: generateRandomString(16),
  })

  return `https://accounts.spotify.com/authorize?${params.toString()}`
}

// 액세스 토큰 가져오기
export const getAccessToken = async (code) => {
  try {
    const requestData = {
      grant_type: 'authorization_code',
      code: code,
      redirect_uri: SPOTIFY_REDIRECT_URI,
      client_id: SPOTIFY_CLIENT_ID,
      client_secret: SPOTIFY_CLIENT_SECRET, // Traditional Authorization Code Flow에서 필요
    }

    // 디버깅: 요청 데이터 로깅
    console.log('🔍 Spotify 토큰 요청 정보:')
    console.log('코드:', code)
    console.log('리다이렉트 URI:', SPOTIFY_REDIRECT_URI)
    console.log('클라이언트 ID:', SPOTIFY_CLIENT_ID)
    console.log('클라이언트 시크릿:', SPOTIFY_CLIENT_SECRET ? '설정됨' : '누락')
    console.log('요청 데이터 키들:', Object.keys(requestData))

    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      new URLSearchParams(requestData),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    )

    console.log('✅ 토큰 요청 성공!')
    return response.data
  } catch (error) {
    console.error('액세스 토큰 가져오기 실패:', error)
    
    // 400 오류의 상세 정보 로깅
    if (error.response) {
      console.error('📋 오류 상세 정보:')
      console.error('상태 코드:', error.response.status)
      console.error('응답 데이터:', error.response.data)
      console.error('응답 헤더:', error.response.headers)
    }
    
    throw error
  }
}

// 사용자 정보 가져오기
export const getUserProfile = async (accessToken) => {
  try {
    const response = await axios.get('https://api.spotify.com/v1/me', {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    })

    return response.data
  } catch (error) {
    console.error('사용자 정보 가져오기 실패:', error)
    throw error
  }
}

// Spotify에서 곡 검색
export const searchTrack = async (accessToken, artist, song) => {
  try {
    const query = `artist:${artist} track:${song}`
    const response = await axios.get(`https://api.spotify.com/v1/search`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: query,
        type: 'track',
        limit: 1,
      },
    })

    if (response.data.tracks.items.length > 0) {
      return response.data.tracks.items[0]
    }

    // 정확한 매치가 없으면 더 넓은 검색 시도
    const broadQuery = `${artist} ${song}`
    const broadResponse = await axios.get(`https://api.spotify.com/v1/search`, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      params: {
        q: broadQuery,
        type: 'track',
        limit: 1,
      },
    })

    return broadResponse.data.tracks.items.length > 0 ? broadResponse.data.tracks.items[0] : null
  } catch (error) {
    console.error('곡 검색 실패:', error)
    return null
  }
}

// 플레이리스트 생성
export const createPlaylist = async (accessToken, userId, name, description = '') => {
  try {
    // 플레이리스트 이름과 설명에서 문제가 될 수 있는 문자들 제거
    // 1. 이모지와 특수 유니코드 문자 제거
    let cleanName = name
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') // 이모지 제거
      .replace(/[\u{1D400}-\u{1D7FF}]/gu, '') // 수학 기호 (볼드, 이탤릭 등) 제거
      .replace(/[^\w\s\-()가-힣]/g, '') // 기본 특수문자 제거
      .replace(/\s+/g, ' ') // 연속된 공백을 하나로
      .trim()

    // 이름이 비어있거나 너무 짧으면 기본 이름 사용
    if (!cleanName || cleanName.length < 2) {
      cleanName = '새 플레이리스트'
    }
    
    // 길이 제한
    cleanName = cleanName.substring(0, 100)
    
    // 설명 정제 (URL은 유지하되 다른 특수문자 제거)
    let cleanDescription = description
      .replace(/[\u{1F600}-\u{1F64F}]|[\u{1F300}-\u{1F5FF}]|[\u{1F680}-\u{1F6FF}]|[\u{1F1E0}-\u{1F1FF}]|[\u{2600}-\u{26FF}]|[\u{2700}-\u{27BF}]/gu, '') // 이모지 제거
      .replace(/[\u{1D400}-\u{1D7FF}]/gu, '') // 수학 기호 제거
      .replace(/[^\w\s\-().,!?\n가-힣:/=&?%]/g, '') // URL 파라미터를 위해 =, &, ?, % 추가 허용
      .trim()
      .substring(0, 300)
    
    // Spotify API 호환성을 위해 매우 보수적으로 설정
    // 설명을 매우 단순하게 유지
    cleanDescription = 'YouTube에서 변환된 플레이리스트'
    
    const requestData = {
      name: cleanName,
      description: cleanDescription,
      public: false,
    }
    
    // 디버깅: 요청 데이터 로깅
    console.log('🎵 Spotify 플레이리스트 생성 요청:')
    console.log('사용자 ID:', userId)
    console.log('원본 이름:', name)
    console.log('정제된 이름:', cleanName)
    console.log('원본 설명:', description)
    console.log('정제된 설명:', cleanDescription)
    console.log('요청 데이터:', requestData)

    const response = await axios.post(
      `https://api.spotify.com/v1/users/${userId}/playlists`,
      requestData,
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    )

    console.log('✅ 플레이리스트 생성 성공!')
    return response.data
  } catch (error) {
    console.error('플레이리스트 생성 실패:', error)
    
    // 400 오류의 상세 정보 로깅
    if (error.response) {
      console.error('📋 플레이리스트 생성 오류 상세:')
      console.error('상태 코드:', error.response.status)
      console.error('응답 데이터:', error.response.data)
      console.error('요청했던 데이터:', {
        name: name,
        description: description,
        userId: userId
      })
    }
    
    throw error
  }
}

// 플레이리스트에 곡 추가
export const addTracksToPlaylist = async (accessToken, playlistId, trackUris) => {
  try {
    // Spotify API는 한 번에 최대 100곡까지 추가 가능
    const chunkSize = 100
    const chunks = []

    for (let i = 0; i < trackUris.length; i += chunkSize) {
      chunks.push(trackUris.slice(i, i + chunkSize))
    }

    for (const chunk of chunks) {
      await axios.post(
        `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        {
          uris: chunk,
        },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        },
      )
    }

    return true
  } catch (error) {
    console.error('플레이리스트에 곡 추가 실패:', error)
    throw error
  }
}

// 랜덤 문자열 생성 (인증용)
const generateRandomString = (length) => {
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const values = crypto.getRandomValues(new Uint8Array(length))
  return values.reduce((acc, x) => acc + possible[x % possible.length], '')
}
