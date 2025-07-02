# YouTube to Spotify 플레이리스트 변환기

YouTube 플레이리스트를 Spotify 플레이리스트로 자동 변환하는 웹 애플리케이션입니다.

## 주요 기능

- YouTube 플레이리스트 URL을 입력하여 Spotify 플레이리스트로 변환
- Spotify 스타일의 모던한 UI/UX
- 실시간 변환 진행률 표시
- 매치되지 않은 곡 리포트
- 반응형 디자인 (모바일, 태블릿, 데스크톱 지원)

## 기술 스택

- **Frontend**: React 19, Vite, Tailwind CSS
- **API**: YouTube Data API v3, Spotify Web API
- **상태 관리**: React Hooks
- **알림**: React Toastify
- **HTTP 클라이언트**: Axios

## 설치 및 실행

### 1. 프로젝트 클론

```bash
git clone <repository-url>
cd 채팅
```

### 2. 종속성 설치

```bash
npm install
```

### 3. 환경 변수 설정

프로젝트 루트에 `.env` 파일을 생성하고 다음 내용을 추가하세요:

```env
# YouTube Data API v3 키
REACT_APP_YOUTUBE_API_KEY=your_youtube_api_key_here

# Spotify Web API 키
REACT_APP_SPOTIFY_CLIENT_ID=your_spotify_client_id_here
REACT_APP_SPOTIFY_CLIENT_SECRET=your_spotify_client_secret_here

# Spotify 리다이렉트 URI
REACT_APP_SPOTIFY_REDIRECT_URI=http://localhost:5173/callback
```

### 4. API 키 획득 방법

#### YouTube Data API v3 키

1. [Google Cloud Console](https://console.developers.google.com/)에 접속
2. 새 프로젝트 생성 또는 기존 프로젝트 선택
3. "API 및 서비스" > "라이브러리"에서 "YouTube Data API v3" 활성화
4. "사용자 인증 정보" > "사용자 인증 정보 만들기" > "API 키" 선택
5. 생성된 API 키를 `.env` 파일에 추가

#### Spotify Web API 키

1. [Spotify for Developers](https://developer.spotify.com/dashboard/applications)에 접속
2. "Create an app" 클릭
3. 앱 이름과 설명 입력
4. "Settings"에서 Client ID와 Client Secret 확인
5. "Redirect URIs"에 `http://localhost:5173/callback` 추가
6. Client ID와 Client Secret을 `.env` 파일에 추가

### 5. 개발 서버 실행

```bash
npm run dev
```

애플리케이션이 `http://localhost:5173`에서 실행됩니다.

## 사용 방법

### 1. Spotify 로그인

- 처음 사용 시 Spotify 계정으로 로그인이 필요합니다
- "변환하기" 버튼 클릭 시 자동으로 Spotify 인증 페이지로 이동됩니다

### 2. 플레이리스트 변환

1. YouTube 플레이리스트 URL을 입력 창에 붙여넣기
2. "변환하기" 버튼 클릭
3. 변환 진행률 확인
4. 완료 후 Spotify에서 새 플레이리스트 확인

### 3. 지원되는 URL 형식

- `https://www.youtube.com/playlist?list=PLxxxxxxxxxxxxxxx`
- `https://youtube.com/playlist?list=PLxxxxxxxxxxxxxxx`

## 프로젝트 구조

```
src/
├── components/           # React 컴포넌트들
│   ├── Sidebar.jsx      # 사이드바 네비게이션
│   ├── HeroSection.jsx  # 메인 변환 폼
│   ├── RecentConversions.jsx # 최근 변환 목록
│   ├── HowItWorks.jsx   # 사용 방법 안내
│   ├── PlayerBar.jsx    # 하단 플레이어 바
│   └── MobileHeader.jsx # 모바일 헤더
├── services/            # API 서비스들
│   ├── youtubeService.js    # YouTube API 호출
│   ├── spotifyService.js    # Spotify API 호출
│   └── converterService.js  # 변환 로직 관리
├── App.jsx              # 메인 App 컴포넌트
├── main.jsx            # React 앱 진입점
└── index.css           # 전역 스타일
```

## 특징

### 스마트 곡 매칭

- YouTube 비디오 제목에서 아티스트와 곡명을 자동 추출
- 다양한 제목 형식 지원 ("Artist - Song", "Song by Artist" 등)
- Spotify 검색 API를 통한 최적 매치 찾기

### 사용자 경험

- 실시간 변환 진행률 표시
- 매치 성공률 및 통계 제공
- 매치되지 않은 곡 목록 표시
- 직관적인 Spotify 스타일 UI

### 성능 최적화

- API 호출 제한 준수를 위한 요청 간격 조절
- 대용량 플레이리스트 지원 (100곡씩 배치 처리)
- 로컬 스토리지를 통한 토큰 관리

## 빌드

프로덕션 빌드를 생성하려면:

```bash
npm run build
```

빌드된 파일들은 `dist/` 폴더에 생성됩니다.

## 라이선스

이 프로젝트는 MIT 라이선스 하에 있습니다.

## 기여

1. 이 저장소를 포크하세요
2. 기능 브랜치를 생성하세요 (`git checkout -b feature/AmazingFeature`)
3. 변경사항을 커밋하세요 (`git commit -m 'Add some AmazingFeature'`)
4. 브랜치에 푸시하세요 (`git push origin feature/AmazingFeature`)
5. Pull Request를 열어주세요

## 지원

문제가 발생하거나 제안사항이 있으시면 Issues 탭에서 알려주세요.
