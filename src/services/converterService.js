import { 
  extractPlaylistId, 
  getPlaylistInfo, 
  getPlaylistItems, 
  extractVideoId, 
  getVideoInfo, 
  getUrlType,
  findPlaylistFromVideo,
  extractVideoChapters
} from './youtubeService'
import { 
  getSpotifyAuthUrl, 
  searchTrack, 
  createPlaylist, 
  addTracksToPlaylist,
  getUserProfile 
} from './spotifyService'

// 개별 YouTube 동영상을 Spotify로 변환
export const convertVideo = async (youtubeUrl, spotifyAccessToken) => {
  try {
    // 1. YouTube 동영상 ID 추출
    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      throw new Error('올바른 YouTube 동영상 URL이 아닙니다')
    }

    // 2. YouTube 동영상 정보 가져오기
    const videoInfo = await getVideoInfo(videoId)

    // 3. Spotify 사용자 정보 가져오기
    const userProfile = await getUserProfile(spotifyAccessToken)

    // 4. Spotify에서 곡 검색
    const spotifyTrack = await searchTrack(
      spotifyAccessToken, 
      videoInfo.artist, 
      videoInfo.song
    )

    if (!spotifyTrack) {
      throw new Error(`'${videoInfo.title}' 곡을 Spotify에서 찾을 수 없습니다`)
    }

    // 5. 단일 곡으로 플레이리스트 생성
    const playlistName = `${videoInfo.title} (YouTube에서 변환됨)`
    const playlistDescription = `원본 YouTube 동영상: ${youtubeUrl}`
    
    const newPlaylist = await createPlaylist(
      spotifyAccessToken,
      userProfile.id,
      playlistName,
      playlistDescription
    )

    // 6. 곡을 플레이리스트에 추가
    await addTracksToPlaylist(spotifyAccessToken, newPlaylist.id, [spotifyTrack.uri])

    return {
      success: true,
      playlist: newPlaylist,
      stats: {
        total: 1,
        matched: 1,
        unmatched: 0,
        matchRate: 100
      },
      matchedTracks: [{
        youtube: videoInfo,
        spotify: spotifyTrack,
        uri: spotifyTrack.uri
      }],
      unmatchedTracks: []
    }

  } catch (error) {
    console.error('동영상 변환 실패:', error)
    throw error
  }
}

// 동영상에서 발견된 플레이리스트 변환
export const convertPlaylistFromVideo = async (youtubeUrl, spotifyAccessToken, playlistInfo) => {
  try {
    console.log(`🎵 플레이리스트 변환 시작: ${playlistInfo.playlistInfo.snippet.title}`)
    console.log(`📊 총 ${playlistInfo.playlistItems.length}곡`)

    // Spotify 사용자 정보 가져오기
    const userProfile = await getUserProfile(spotifyAccessToken)

    // Spotify에서 각 곡 검색
    const matchedTracks = []
    const unmatchedTracks = []
    const totalTracks = playlistInfo.playlistItems.length
    
    for (let i = 0; i < playlistInfo.playlistItems.length; i++) {
      const item = playlistInfo.playlistItems[i]
      
      console.log(`🔍 곡 검색 중 (${i + 1}/${totalTracks}): ${item.title}`)
      
      // 진행률 업데이트를 위한 콜백 (선택사항)
      if (window.updateProgress) {
        window.updateProgress({
          current: i + 1,
          total: totalTracks,
          status: `곡 검색 중: ${item.title}`
        })
      }

      const spotifyTrack = await searchTrack(
        spotifyAccessToken, 
        item.artist, 
        item.song
      )

      if (spotifyTrack) {
        matchedTracks.push({
          youtube: item,
          spotify: spotifyTrack,
          uri: spotifyTrack.uri
        })
        console.log(`✅ 매치: ${item.title}`)
      } else {
        unmatchedTracks.push(item)
        console.log(`❌ 미매치: ${item.title}`)
      }

      // API 제한을 위한 지연
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // Spotify 플레이리스트 생성
    const playlistName = `${playlistInfo.playlistInfo.snippet.title} (YouTube에서 변환됨)`
    const playlistDescription = `원본 YouTube 플레이리스트: ${youtubeUrl}\n변환된 곡: ${matchedTracks.length}/${totalTracks}`
    
    const newPlaylist = await createPlaylist(
      spotifyAccessToken,
      userProfile.id,
      playlistName,
      playlistDescription
    )

    // 매치된 곡들을 플레이리스트에 추가
    if (matchedTracks.length > 0) {
      const trackUris = matchedTracks.map(track => track.uri)
      await addTracksToPlaylist(spotifyAccessToken, newPlaylist.id, trackUris)
    }

    console.log(`🎉 변환 완료! ${matchedTracks.length}/${totalTracks}곡 성공`)

    return {
      success: true,
      playlist: newPlaylist,
      stats: {
        total: totalTracks,
        matched: matchedTracks.length,
        unmatched: unmatchedTracks.length,
        matchRate: Math.round((matchedTracks.length / totalTracks) * 100)
      },
      matchedTracks,
      unmatchedTracks
    }

  } catch (error) {
    console.error('플레이리스트 변환 실패:', error)
    throw error
  }
}

// 동영상 챕터 기반 변환 (새로운 핵심 기능)
export const convertVideoChapters = async (youtubeUrl, spotifyAccessToken) => {
  try {
    console.log('🎬 동영상 챕터 기반 변환 시작...')
    
    // 1. YouTube 동영상 ID 추출
    const videoId = extractVideoId(youtubeUrl)
    if (!videoId) {
      throw new Error('올바른 YouTube 동영상 URL이 아닙니다')
    }

    // 2. 동영상 챕터 정보 가져오기
    const chapterInfo = await extractVideoChapters(videoId)
    if (!chapterInfo || chapterInfo.chapters.length === 0) {
      throw new Error('동영상에서 챕터(타임라인) 정보를 찾을 수 없습니다')
    }

    console.log(`🎵 총 ${chapterInfo.chapters.length}개 챕터 발견`)
    console.log(`📹 동영상 제목: ${chapterInfo.title}`)

    // 3. Spotify 사용자 정보 가져오기
    const userProfile = await getUserProfile(spotifyAccessToken)

    // 4. 각 챕터별로 Spotify에서 곡 검색
    const matchedTracks = []
    const unmatchedTracks = []
    const totalChapters = chapterInfo.chapters.length
    
    for (let i = 0; i < chapterInfo.chapters.length; i++) {
      const chapter = chapterInfo.chapters[i]
      
      console.log(`🔍 챕터 검색 중 (${i + 1}/${totalChapters}): ${chapter.timestamp} - ${chapter.artist} - ${chapter.song}`)
      
      // 진행률 업데이트를 위한 콜백 (선택사항)
      if (window.updateProgress) {
        window.updateProgress({
          current: i + 1,
          total: totalChapters,
          status: `곡 검색 중: ${chapter.artist} - ${chapter.song}`
        })
      }

      const spotifyTrack = await searchTrack(
        spotifyAccessToken, 
        chapter.artist, 
        chapter.song
      )

      if (spotifyTrack) {
        matchedTracks.push({
          chapter: chapter,
          spotify: spotifyTrack,
          uri: spotifyTrack.uri
        })
        console.log(`✅ 매치 성공: ${chapter.artist} - ${chapter.song}`)
      } else {
        unmatchedTracks.push(chapter)
        console.log(`❌ 매치 실패: ${chapter.artist} - ${chapter.song}`)
      }

      // API 제한을 위한 지연
      await new Promise(resolve => setTimeout(resolve, 200))
    }

    // 5. Spotify 플레이리스트 생성 (동영상 제목 사용)
    const playlistName = chapterInfo.title
    const playlistDescription = `YouTube 동영상 챕터에서 변환됨\n원본: ${youtubeUrl}\n변환된 곡: ${matchedTracks.length}/${totalChapters}`
    
    const newPlaylist = await createPlaylist(
      spotifyAccessToken,
      userProfile.id,
      playlistName,
      playlistDescription
    )

    // 6. 매치된 곡들을 플레이리스트에 추가 (타임라인 순서대로)
    if (matchedTracks.length > 0) {
      const trackUris = matchedTracks.map(track => track.uri)
      await addTracksToPlaylist(spotifyAccessToken, newPlaylist.id, trackUris)
    }

    console.log(`🎉 챕터 변환 완료! ${matchedTracks.length}/${totalChapters}곡 성공`)

    return {
      success: true,
      playlist: newPlaylist,
      stats: {
        total: totalChapters,
        matched: matchedTracks.length,
        unmatched: unmatchedTracks.length,
        matchRate: Math.round((matchedTracks.length / totalChapters) * 100)
      },
      matchedTracks,
      unmatchedTracks,
      originalVideo: {
        title: chapterInfo.title,
        url: youtubeUrl
      }
    }

  } catch (error) {
    console.error('챕터 변환 실패:', error)
    throw error
  }
}

// 통합 변환 함수 (챕터 우선 처리)
export const convertYouTubeContent = async (youtubeUrl, spotifyAccessToken) => {
  try {
    console.log('🚀 YouTube 콘텐츠 분석 시작...')
    
    // 비동기 URL 타입 감지
    const urlType = await getUrlType(youtubeUrl)
    console.log(`📝 감지된 URL 타입: ${urlType}`)
    
    switch (urlType) {
      case 'video_with_chapters':
        console.log('🎵 동영상 챕터 발견! 챕터 기반 변환을 진행합니다.')
        return await convertVideoChapters(youtubeUrl, spotifyAccessToken)
        
      case 'playlist':
        console.log('📁 명시적 플레이리스트로 처리')
        return await convertPlaylist(youtubeUrl, spotifyAccessToken)
        
      case 'playlist_from_video':
        console.log('🎵 동영상에서 플레이리스트 발견! 전체 플레이리스트로 변환합니다.')
        const videoId = extractVideoId(youtubeUrl)
        const playlistInfo = await findPlaylistFromVideo(videoId)
        
        if (!playlistInfo) {
          throw new Error('플레이리스트 정보를 가져올 수 없습니다')
        }
        
        return await convertPlaylistFromVideo(youtubeUrl, spotifyAccessToken, playlistInfo)
        
      case 'video':
        console.log('📹 개별 동영상으로 처리')
        return await convertVideo(youtubeUrl, spotifyAccessToken)
        
      default:
        throw new Error('올바른 YouTube URL이 아닙니다. 플레이리스트나 동영상 링크를 입력해주세요.')
    }
  } catch (error) {
    console.error('YouTube 콘텐츠 변환 실패:', error)
    throw error
  }
}

// 전체 변환 프로세스
export const convertPlaylist = async (youtubeUrl, spotifyAccessToken) => {
  try {
    // 1. YouTube 플레이리스트 ID 추출
    const playlistId = extractPlaylistId(youtubeUrl)
    if (!playlistId) {
      throw new Error('올바른 YouTube 플레이리스트 URL이 아닙니다')
    }

    // 2. YouTube 플레이리스트 정보 가져오기
    const playlistInfo = await getPlaylistInfo(playlistId)
    const playlistItems = await getPlaylistItems(playlistId)

    // 3. Spotify 사용자 정보 가져오기
    const userProfile = await getUserProfile(spotifyAccessToken)

    // 4. Spotify에서 각 곡 검색
    const matchedTracks = []
    const unmatchedTracks = []
    const totalTracks = playlistItems.length
    
    for (let i = 0; i < playlistItems.length; i++) {
      const item = playlistItems[i]
      
      // 진행률 업데이트를 위한 콜백 (선택사항)
      if (window.updateProgress) {
        window.updateProgress({
          current: i + 1,
          total: totalTracks,
          status: `곡 검색 중: ${item.title}`
        })
      }

      const spotifyTrack = await searchTrack(
        spotifyAccessToken, 
        item.artist, 
        item.song
      )

      if (spotifyTrack) {
        matchedTracks.push({
          youtube: item,
          spotify: spotifyTrack,
          uri: spotifyTrack.uri
        })
      } else {
        unmatchedTracks.push(item)
      }

      // API 제한을 위한 지연
      await new Promise(resolve => setTimeout(resolve, 100))
    }

    // 5. Spotify 플레이리스트 생성
    const playlistName = `${playlistInfo.snippet.title} (YouTube에서 변환됨)`
    const playlistDescription = `원본 YouTube 플레이리스트: ${youtubeUrl}\n변환된 곡: ${matchedTracks.length}/${totalTracks}`
    
    const newPlaylist = await createPlaylist(
      spotifyAccessToken,
      userProfile.id,
      playlistName,
      playlistDescription
    )

    // 6. 매치된 곡들을 플레이리스트에 추가
    if (matchedTracks.length > 0) {
      const trackUris = matchedTracks.map(track => track.uri)
      await addTracksToPlaylist(spotifyAccessToken, newPlaylist.id, trackUris)
    }

    return {
      success: true,
      playlist: newPlaylist,
      stats: {
        total: totalTracks,
        matched: matchedTracks.length,
        unmatched: unmatchedTracks.length,
        matchRate: Math.round((matchedTracks.length / totalTracks) * 100)
      },
      matchedTracks,
      unmatchedTracks
    }

  } catch (error) {
    console.error('플레이리스트 변환 실패:', error)
    throw error
  }
}

// Spotify 인증 확인
export const isSpotifyAuthenticated = () => {
  const token = localStorage.getItem('spotify_access_token')
  const expiry = localStorage.getItem('spotify_token_expiry')
  
  if (!token || !expiry) {
    return false
  }
  
  return Date.now() < parseInt(expiry)
}

// Spotify 액세스 토큰 저장
export const storeSpotifyToken = (tokenData) => {
  localStorage.setItem('spotify_access_token', tokenData.access_token)
  localStorage.setItem('spotify_refresh_token', tokenData.refresh_token)
  
  // 만료 시간 계산 (현재 시간 + expires_in 초 - 60초 버퍼)
  const expiryTime = Date.now() + (tokenData.expires_in - 60) * 1000
  localStorage.setItem('spotify_token_expiry', expiryTime.toString())
}

// Spotify 액세스 토큰 가져오기
export const getStoredSpotifyToken = () => {
  return localStorage.getItem('spotify_access_token')
}

// Spotify 로그아웃 및 로컬 스토리지 초기화
export const logoutSpotify = () => {
  localStorage.removeItem('spotify_access_token')
  localStorage.removeItem('spotify_refresh_token')
  localStorage.removeItem('spotify_token_expiry')
  console.log('🧹 Spotify 토큰 초기화 완료')
}

// 강제 로그아웃 및 새로운 인증 시작
export const forceNewAuth = () => {
  console.log('🔄 강제 새로운 인증 시작...')
  logoutSpotify()
  startSpotifyAuth()
}

// Spotify 인증 시작
export const startSpotifyAuth = () => {
  const authUrl = getSpotifyAuthUrl()
  window.location.href = authUrl
} 