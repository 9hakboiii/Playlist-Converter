import axios from 'axios'

const YOUTUBE_API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY

// YouTube 플레이리스트 ID 추출 (개선된 버전)
export const extractPlaylistId = (url) => {
  // 기본 list= 파라미터 체크
  const listRegex = /[&?]list=([^&]+)/
  const listMatch = url.match(listRegex)
  if (listMatch) {
    return listMatch[1]
  }
  
  // 다른 형태의 플레이리스트 URL 체크
  const playlistPatterns = [
    /playlist\?list=([^&]+)/, // playlist?list=...
    /watch\?.*list=([^&]+)/, // watch?v=...&list=...
  ]
  
  for (const pattern of playlistPatterns) {
    const match = url.match(pattern)
    if (match) {
      return match[1]
    }
  }
  
  return null
}

// URL에서 숨겨진 플레이리스트 정보 추출 시도
export const extractHiddenPlaylistInfo = (url) => {
  // YouTube 공유 링크에서 플레이리스트 힌트 찾기
  const patterns = [
    /si=([^&]+)/, // si 파라미터 (공유 식별자)
    /t=([^&]+)/,  // 시간 파라미터
  ]
  
  const info = {}
  for (const pattern of patterns) {
    const match = url.match(pattern)
    if (match) {
      info.shareId = match[1]
    }
  }
  
  return Object.keys(info).length > 0 ? info : null
}

// YouTube 비디오 ID 추출
export const extractVideoId = (url) => {
  const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/
  const match = url.match(regex)
  return match ? match[1] : null
}

// 동영상에서 플레이리스트 정보 찾기 (단순화된 버전)
export const findPlaylistFromVideo = async (videoId, originalUrl = null) => {
  try {
    console.log(`🔍 동영상 ${videoId}의 플레이리스트 검색 중...`)
    
    // 1단계: 동영상의 상세 정보 가져오기
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          part: 'snippet,statistics',
          id: videoId,
          key: YOUTUBE_API_KEY
        }
      }
    )
    
    if (response.data.items.length === 0) {
      console.log('❌ 동영상을 찾을 수 없음')
      return null
    }
    
    const video = response.data.items[0]
    const channelId = video.snippet.channelId
    const videoTitle = video.snippet.title
    
    console.log(`📹 동영상: ${videoTitle}`)
    console.log(`📺 채널 ID: ${channelId}`)
    
    // 2단계: 채널의 모든 플레이리스트 가져오기
    const playlistsResponse = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlists`,
      {
        params: {
          part: 'snippet,contentDetails',
          channelId: channelId,
          maxResults: 50,
          key: YOUTUBE_API_KEY
        }
      }
    )
    
    console.log(`📋 채널의 플레이리스트 수: ${playlistsResponse.data.items.length}`)
    
    // 3단계: 각 플레이리스트에서 해당 동영상이 포함된 것을 찾기
    // 곡 수가 많은 순으로 정렬하되, 필터링은 하지 않음
    const sortedPlaylists = playlistsResponse.data.items.sort((a, b) => {
      const aCount = a.contentDetails?.itemCount || 0
      const bCount = b.contentDetails?.itemCount || 0
      return bCount - aCount // 곡 수가 많은 순으로 정렬
    })
    
    for (const playlist of sortedPlaylists) {
      try {
        const itemCount = playlist.contentDetails?.itemCount || 0
        console.log(`🎵 플레이리스트 검색 중: "${playlist.snippet.title}" (${itemCount}곡)`)
        
        const playlistItems = await getPlaylistItems(playlist.id)
        const foundVideo = playlistItems.find(item => item.id === videoId)
        
        if (foundVideo) {
          console.log(`✅ 플레이리스트 발견: "${playlist.snippet.title}" (${playlistItems.length}곡)`)
          console.log(`🎯 모든 곡을 변환합니다!`)
          
          // 첫 번째로 찾은 플레이리스트를 바로 반환 (필터링 없음)
          return {
            playlistId: playlist.id,
            playlistInfo: playlist,
            playlistItems: playlistItems
          }
        } else {
          console.log(`❌ 동영상이 이 플레이리스트에 없음`)
        }
      } catch (error) {
        console.log(`⚠️ 플레이리스트 검색 실패 (무시): ${playlist.snippet.title}`)
        continue
      }
    }
    
    console.log('❌ 어떤 플레이리스트에서도 동영상을 찾을 수 없음')
    return null
    
  } catch (error) {
    console.error('플레이리스트 검색 실패:', error)
    return null
  }
}

// 동영상 챕터/타임라인 정보 추출
export const extractVideoChapters = async (videoId) => {
  try {
    console.log(`🎬 동영상 ${videoId}의 챕터 정보 분석 중...`)
    
    // 동영상 상세 정보 가져오기 (description 포함)
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          part: 'snippet',
          id: videoId,
          key: YOUTUBE_API_KEY
        }
      }
    )
    
    if (response.data.items.length === 0) {
      throw new Error('동영상을 찾을 수 없습니다')
    }
    
    const video = response.data.items[0]
    const title = video.snippet.title
    const description = video.snippet.description || ''
    
    console.log(`📹 동영상 제목: ${title}`)
    console.log(`📝 설명 길이: ${description.length}자`)
    
    // 디버깅: 설명 내용을 일부 출력하여 챕터 형식 확인
    console.log('📝 설명 내용 (처음 500자):')
    console.log(description.substring(0, 500))
    if (description.length > 500) {
      console.log('📝 설명 내용 (끝 200자):')
      console.log(description.substring(Math.max(0, description.length - 200)))
    }
    
    // 설명에서 타임라인 챕터 추출
    const chapters = parseTimelineFromDescription(description)
    
    if (chapters.length === 0) {
      console.log('⚠️ 챕터 정보를 찾을 수 없습니다. 개별 동영상으로 처리합니다.')
      return null
    }
    
    console.log(`🎵 발견된 챕터 수: ${chapters.length}개`)
    
    return {
      videoId: videoId,
      title: title,
      chapters: chapters,
      totalChapters: chapters.length
    }
    
  } catch (error) {
    console.error('챕터 정보 추출 실패:', error)
    return null
  }
}

// 설명에서 타임라인 정보 파싱
const parseTimelineFromDescription = (description) => {
  const chapters = []
  
  // 타임라인 패턴들 (다양한 형식 지원)
  const timelinePatterns = [
    // 1. 00:00 Artist - Song Title 형식 (가장 일반적)
    { name: '00:00 Artist - Song', pattern: /(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*(.+?)(?=\n|\d{1,2}:\d{2}|$)/g },
    
    // 2. 00:00 - Artist - Song Title 형식 
    { name: '00:00 - Artist - Song', pattern: /(\d{1,2}:\d{2}(?::\d{2})?)\s*[-–—]\s*(.+?)\s*[-–—]\s*(.+?)(?=\n|\d{1,2}:\d{2}|$)/g },
    
    // 3. 1. 00:00 Artist - Song Title 형식
    { name: '1. 00:00 Artist - Song', pattern: /\d+\.\s*(\d{1,2}:\d{2}(?::\d{2})?)\s*(.+?)(?=\n|\d+\.|$)/g },
    
    // 4. [00:00] Artist - Song Title 형식
    { name: '[00:00] Artist - Song', pattern: /\[(\d{1,2}:\d{2}(?::\d{2})?)\]\s*(.+?)(?=\n|\[|$)/g },
    
    // 5. 00:00:00 Artist - Song Title 형식
    { name: '00:00:00 Artist - Song', pattern: /(\d{1,2}:\d{2}:\d{2})\s*(.+?)(?=\n|\d{1,2}:\d{2}:\d{2}|$)/g },
    
    // 6. 단순 타임스탬프만 있는 경우
    { name: '00:00 텍스트', pattern: /(\d{1,2}:\d{2}(?::\d{2})?)\s+(.+?)(?=\n|\d{1,2}:\d{2}|$)/g },
    
    // 7. 괄호로 둘러싸인 타임스탬프
    { name: '(00:00) 텍스트', pattern: /\((\d{1,2}:\d{2}(?::\d{2})?)\)\s*(.+?)(?=\n|\(|$)/g },
    
    // 8. 단순 줄바꿈으로 구분된 형식
    { name: '줄바꿈 형식', pattern: /(\d{1,2}:\d{2}(?::\d{2})?)\s*(.+?)(?=\n|$)/g }
  ]
  
  console.log('🔍 타임라인 패턴 검사를 시작합니다...')
  
  for (let i = 0; i < timelinePatterns.length; i++) {
    const { name, pattern } = timelinePatterns[i]
    console.log(`📋 패턴 ${i + 1} (${name}) 검사 중...`)
    
    const matches = [...description.matchAll(pattern)]
    
    if (matches.length > 0) {
      console.log(`✅ 패턴 ${i + 1} (${name})에서 ${matches.length}개 매치 발견!`)
      
      // 매치된 내용들을 로그로 출력
      matches.forEach((match, idx) => {
        console.log(`  매치 ${idx + 1}: ${match[1]} -> "${match[2]}"`)
      })
      
      for (const match of matches) {
        const timestamp = match[1]
        let trackInfo = match[2]
        
        // 3번째 그룹이 있으면 (Artist - Song 형식) 합치기
        if (match[3]) {
          trackInfo = `${match[2]} - ${match[3]}`
        }
        
        trackInfo = trackInfo.trim()
        
        // 빈 텍스트나 너무 짧은 제목 건너뛰기
        if (trackInfo.length < 3) {
          console.log(`⚠️ 텍스트가 너무 짧아서 건너뜀: "${trackInfo}"`)
          continue
        }
        
        // 아티스트와 곡명 분리
        const [artist, song] = extractArtistAndSong(trackInfo)
        
        chapters.push({
          timestamp: timestamp,
          rawText: trackInfo,
          artist: artist,
          song: song,
          timeInSeconds: convertTimestampToSeconds(timestamp)
        })
      }
      
      // 첫 번째로 매치된 패턴 사용
      if (chapters.length > 0) {
        console.log(`🎯 패턴 ${i + 1} (${name})을 사용합니다.`)
        break
      }
    } else {
      console.log(`❌ 패턴 ${i + 1} (${name})에서 매치 없음`)
    }
  }
  
  // 시간순으로 정렬
  chapters.sort((a, b) => a.timeInSeconds - b.timeInSeconds)
  
  console.log('🎵 추출된 챕터들:')
  chapters.forEach((chapter, index) => {
    console.log(`  ${index + 1}. ${chapter.timestamp} - ${chapter.artist} - ${chapter.song}`)
  })
  
  return chapters
}

// 타임스탬프를 초로 변환
const convertTimestampToSeconds = (timestamp) => {
  const parts = timestamp.split(':').map(Number)
  
  if (parts.length === 2) {
    // MM:SS 형식
    return parts[0] * 60 + parts[1]
  } else if (parts.length === 3) {
    // HH:MM:SS 형식
    return parts[0] * 3600 + parts[1] * 60 + parts[2]
  }
  
  return 0
}

// URL 타입 판별 수정 (챕터 우선 확인)
export const getUrlType = async (url) => {
  console.log('🔍 URL 분석 중:', url)
  
  // 먼저 명시적인 플레이리스트 ID 확인
  const playlistId = extractPlaylistId(url)
  if (playlistId) {
    console.log('✅ 플레이리스트 ID 발견:', playlistId)
    return 'playlist'
  }
  
  // 개별 동영상인 경우, 챕터 정보 우선 확인
  const videoId = extractVideoId(url)
  if (videoId) {
    console.log('🎬 동영상 ID 발견:', videoId)
    
    // 먼저 챕터 정보 확인
    console.log('📋 챕터 정보 확인 중...')
    const chapterInfo = await extractVideoChapters(videoId)
    
    if (chapterInfo && chapterInfo.chapters.length > 0) {
      console.log(`🎵 ${chapterInfo.chapters.length}개 챕터 발견! 챕터 기반 변환을 진행합니다.`)
      return 'video_with_chapters'
    }
    
    // 챕터가 없으면 플레이리스트 소속인지 확인
    console.log('📁 플레이리스트 소속 확인 중...')
    const playlistInfo = await findPlaylistFromVideo(videoId)
    if (playlistInfo) {
      console.log(`🎵 ${playlistInfo.playlistItems.length}곡 플레이리스트 발견!`)
      return 'playlist_from_video'
    }
    
    console.log('📹 개별 동영상으로 처리')
    return 'video'
  }
  
  return 'unknown'
}

// YouTube 비디오 정보 가져오기
export const getVideoInfo = async (videoId) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/videos`,
      {
        params: {
          part: 'snippet',
          id: videoId,
          key: YOUTUBE_API_KEY
        }
      }
    )
    
    if (response.data.items.length === 0) {
      throw new Error('동영상을 찾을 수 없습니다')
    }
    
    const video = response.data.items[0]
    const title = video.snippet.title
    const [artist, song] = extractArtistAndSong(title)
    
    return {
      id: videoId,
      title: title,
      artist: artist,
      song: song,
      thumbnail: video.snippet.thumbnails.default.url,
      channelTitle: video.snippet.channelTitle
    }
  } catch (error) {
    console.error('동영상 정보 가져오기 실패:', error)
    throw error
  }
}

// YouTube 플레이리스트 정보 가져오기
export const getPlaylistInfo = async (playlistId) => {
  try {
    const response = await axios.get(
      `https://www.googleapis.com/youtube/v3/playlists`,
      {
        params: {
          part: 'snippet,contentDetails',
          id: playlistId,
          key: YOUTUBE_API_KEY
        }
      }
    )
    
    if (response.data.items.length === 0) {
      throw new Error('플레이리스트를 찾을 수 없습니다')
    }
    
    return response.data.items[0]
  } catch (error) {
    console.error('플레이리스트 정보 가져오기 실패:', error)
    throw error
  }
}

// YouTube 플레이리스트의 곡 목록 가져오기
export const getPlaylistItems = async (playlistId) => {
  try {
    let allItems = []
    let nextPageToken = null
    
    do {
      const response = await axios.get(
        `https://www.googleapis.com/youtube/v3/playlistItems`,
        {
          params: {
            part: 'snippet',
            playlistId: playlistId,
            maxResults: 50,
            pageToken: nextPageToken,
            key: YOUTUBE_API_KEY
          }
        }
      )
      
      allItems = [...allItems, ...response.data.items]
      nextPageToken = response.data.nextPageToken
    } while (nextPageToken)
    
    // 비디오 제목에서 곡 정보 추출
    return allItems.map(item => {
      const title = item.snippet.title
      const [artist, song] = extractArtistAndSong(title)
      
      return {
        id: item.snippet.resourceId.videoId,
        title: title,
        artist: artist,
        song: song,
        thumbnail: item.snippet.thumbnails.default.url
      }
    })
  } catch (error) {
    console.error('플레이리스트 항목 가져오기 실패:', error)
    throw error
  }
}

// 비디오 제목에서 아티스트와 곡명 추출
const extractArtistAndSong = (title) => {
  // 일반적인 패턴들 처리
  const patterns = [
    /^(.+?)\s*-\s*(.+)$/, // "Artist - Song"
    /^(.+?)\s*–\s*(.+)$/, // "Artist – Song" (다른 대시)
    /^(.+?)\s*\|\s*(.+)$/, // "Artist | Song"
    /^(.+?)\s*by\s*(.+)$/i, // "Song by Artist"
  ]
  
  for (const pattern of patterns) {
    const match = title.match(pattern)
    if (match) {
      if (pattern.source.includes('by')) {
        return [match[2].trim(), match[1].trim()] // Artist, Song
      } else {
        return [match[1].trim(), match[2].trim()] // Artist, Song
      }
    }
  }
  
  // 패턴이 매치되지 않으면 전체를 곡명으로 사용
  return ['Unknown Artist', title.trim()]
} 