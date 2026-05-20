# 🎵 Suno Music Generator

**AI 기반 대량 음악 생성 플랫폼**

Suno API를 활용하여 대량의 음악을 생성, 관리, 다운로드할 수 있는 웹 서비스입니다.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-brightgreen.svg)
![Status](https://img.shields.io/badge/status-ready-success.svg)

---

## ✨ 주요 기능

### 🎼 음악 생성
- **단일 생성**: 프롬프트를 입력하여 개별 음악 생성
- **대량 생성**: JSON 배열로 한 번에 최대 50곡 생성
- **다양한 장르**: Pop, Rock, Jazz, Classical, Electronic, Hip-Hop, Country, R&B
- **가사 지원**: 가사를 입력하거나 instrumental 모드 선택

### 📊 실시간 모니터링
- **큐 상태**: 대기/진행/완료/실패 작업 실시간 확인
- **진행률 표시**: 각 음악 생성 작업의 진행률 실시간 업데이트
- **WebSocket 알림**: Socket.IO를 통한 실시간 상태 업데이트

### 💾 파일 관리
- **자동 저장**: 생성된 음악 자동 저장 및 관리
- **스트리밍 재생**: 웹 플레이어로 즉시 재생
- **다운로드**: MP3 형식으로 다운로드
- **삭제 기능**: 불필요한 음악 삭제

### 🚀 고급 기능
- **큐 시스템**: Bull + Redis 기반 작업 큐
- **동시 처리**: 설정 가능한 동시 작업 수
- **에러 핸들링**: 자동 재시도 및 에러 복구
- **MongoDB 저장**: 작업 이력 및 메타데이터 저장

---

## 🏗️ 기술 스택

### Backend
- **Node.js** + **Express.js**
- **Bull** (작업 큐)
- **Redis** (큐 저장소)
- **MongoDB** (데이터베이스)
- **Socket.IO** (실시간 통신)
- **Axios** (HTTP 클라이언트)

### Frontend
- **HTML5** + **CSS3** + **Vanilla JavaScript**
- **Socket.IO Client** (실시간 업데이트)
- **Responsive Design** (모바일 지원)

---

## 📋 사전 요구사항

1. **Node.js** 16.0.0 이상
2. **Redis** 서버 (선택사항 - 없으면 in-memory 모드로 동작)
3. **MongoDB** (선택사항 - 없으면 메모리 모드로 동작)
4. **Suno API Key** (필수)

---

## 🚀 빠른 시작

### 1. 설치

```bash
cd /home/user/webapp/suno-music-generator

# 의존성 설치
npm install
```

### 2. 환경 변수 설정

`.env` 파일을 수정하여 Suno API Key를 입력하세요:

```bash
# .env 파일 편집
nano .env
```

```env
# Suno API Key (필수)
SUNO_API_KEY=your_actual_suno_api_key_here

# 서버 포트
PORT=5000

# MongoDB (선택사항)
MONGODB_URI=mongodb://localhost:27017/suno-music-generator

# Redis (선택사항)
REDIS_HOST=localhost
REDIS_PORT=6379

# 설정
MAX_CONCURRENT_JOBS=5
MAX_REQUESTS_PER_HOUR=100
```

### 3. 서버 실행

```bash
# 개발 모드 (nodemon)
npm run server

# 또는 프로덕션 모드
npm start
```

서버가 실행되면:
- **API 서버**: http://localhost:5000
- **웹 UI**: http://localhost:5000 (client/index.html)

---

## 📚 API 문서

### 🎵 음악 생성

#### 단일 음악 생성
```http
POST /api/music/generate
Content-Type: application/json
X-User-ID: user_12345

{
  "title": "Summer Vibes",
  "prompt": "Upbeat pop music with guitar and synth",
  "style": "pop",
  "duration": 30,
  "lyrics": "Optional lyrics here"
}
```

**응답:**
```json
{
  "success": true,
  "message": "Music generation job queued",
  "jobId": "12345",
  "position": 3
}
```

#### 대량 음악 생성
```http
POST /api/music/batch
Content-Type: application/json
X-User-ID: user_12345

{
  "requests": [
    {
      "title": "Song 1",
      "prompt": "Rock music with electric guitar",
      "style": "rock",
      "duration": 45
    },
    {
      "title": "Song 2",
      "prompt": "Calm jazz music",
      "style": "jazz",
      "duration": 60
    }
  ]
}
```

**응답:**
```json
{
  "success": true,
  "message": "Queued 2 jobs, 0 failed",
  "results": [...]
}
```

### 📊 상태 확인

#### 작업 상태 조회
```http
GET /api/queue/status/:jobId
```

**응답:**
```json
{
  "success": true,
  "job": {
    "jobId": "12345",
    "state": "processing",
    "progress": 75,
    "data": {...}
  }
}
```

#### 큐 통계
```http
GET /api/queue/stats
```

**응답:**
```json
{
  "success": true,
  "stats": {
    "waiting": 5,
    "active": 2,
    "completed": 150,
    "failed": 3,
    "total": 160
  }
}
```

### 📜 히스토리 조회
```http
GET /api/music/history?limit=20&skip=0
X-User-ID: user_12345
```

**응답:**
```json
{
  "success": true,
  "jobs": [...],
  "total": 50,
  "limit": 20,
  "skip": 0
}
```

### 🗑️ 작업 삭제
```http
DELETE /api/music/:jobId
X-User-ID: user_12345
```

---

## 🎨 웹 UI 사용법

### 단일 생성
1. **곡 제목** 입력
2. **음악 설명** (프롬프트) 작성
3. **장르** 선택
4. **길이** 설정 (10-180초)
5. **(선택)** 가사 입력
6. **"음악 생성 시작"** 클릭

### 대량 생성
1. **"대량 생성"** 탭 클릭
2. JSON 배열 입력:
```json
[
  {
    "title": "Beach Sunset",
    "prompt": "Relaxing beach music with ocean sounds",
    "style": "pop",
    "duration": 30
  },
  {
    "title": "City Lights",
    "prompt": "Urban electronic music",
    "style": "electronic",
    "duration": 45
  }
]
```
3. **"대량 생성 시작"** 클릭

### 생성 목록 관리
- **재생**: 완료된 음악을 웹 플레이어로 즉시 재생
- **다운로드**: MP3 파일 다운로드
- **삭제**: 불필요한 음악 삭제
- **실시간 진행률**: 생성 중인 음악의 진행률 확인

---

## 🔧 설정

### `.env` 파일 설정

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `SUNO_API_KEY` | Suno API 키 (필수) | - |
| `SUNO_API_BASE_URL` | Suno API URL | `https://api.suno.ai/v1` |
| `PORT` | 서버 포트 | `5000` |
| `MONGODB_URI` | MongoDB 연결 URI | `mongodb://localhost:27017/...` |
| `REDIS_HOST` | Redis 호스트 | `localhost` |
| `REDIS_PORT` | Redis 포트 | `6379` |
| `MAX_CONCURRENT_JOBS` | 동시 처리 작업 수 | `5` |
| `MAX_REQUESTS_PER_HOUR` | 시간당 최대 요청 수 | `100` |

---

## 📁 프로젝트 구조

```
suno-music-generator/
├── server/
│   ├── index.js              # 메인 서버 파일
│   ├── config/
│   │   └── database.js       # MongoDB 연결
│   ├── models/
│   │   └── MusicJob.js       # 음악 작업 모델
│   ├── routes/
│   │   ├── music.js          # 음악 생성 라우트
│   │   ├── queue.js          # 큐 상태 라우트
│   │   └── status.js         # 시스템 상태 라우트
│   └── services/
│       ├── sunoClient.js     # Suno API 클라이언트
│       └── queueService.js   # 큐 관리 서비스
├── client/
│   └── index.html            # 웹 UI
├── storage/
│   └── music/                # 생성된 음악 저장 폴더
├── package.json
├── .env
├── .env.example
└── README.md
```

---

## 🔌 WebSocket 이벤트

클라이언트는 Socket.IO를 통해 실시간 업데이트를 받습니다:

| 이벤트 | 설명 | 데이터 |
|--------|------|--------|
| `job:started` | 작업 시작 | `{ jobId, params }` |
| `job:progress` | 진행률 업데이트 | `{ jobId, progress }` |
| `job:completed` | 작업 완료 | `{ jobId, result }` |
| `job:failed` | 작업 실패 | `{ jobId, error }` |

**클라이언트 예시:**
```javascript
const socket = io('http://localhost:5000');

socket.on('job:progress', (data) => {
  console.log(`Job ${data.jobId}: ${data.progress}%`);
});

socket.on('job:completed', (data) => {
  console.log('Job completed!', data.result);
});
```

---

## 🐛 문제 해결

### Redis 연결 실패
```
⚠️ Redis not available, using in-memory queue
```
**해결:** Redis가 설치되지 않았거나 실행 중이 아닙니다. Redis를 설치하거나 in-memory 모드로 계속 사용할 수 있습니다.

### MongoDB 연결 실패
```
⚠️ Continuing without MongoDB (in-memory mode)
```
**해결:** MongoDB가 실행 중이 아닙니다. 데이터베이스 없이도 작동하지만, 재시작 시 데이터가 유실됩니다.

### Suno API 오류
```
❌ Suno API connection failed
```
**해결:** `.env` 파일의 `SUNO_API_KEY`가 올바른지 확인하세요.

---

## 🌐 배포

### PM2로 배포 (추천)

```bash
# PM2 설치
npm install -g pm2

# 애플리케이션 시작
pm2 start server/index.js --name "suno-music-api"

# 자동 시작 설정
pm2 startup
pm2 save

# 모니터링
pm2 logs suno-music-api
pm2 status
```

### Docker로 배포

```bash
# Dockerfile 생성 (예정)
docker build -t suno-music-generator .
docker run -p 5000:5000 --env-file .env suno-music-generator
```

---

## 🔒 보안

- **API Key 보호**: `.env` 파일을 절대 공개하지 마세요
- **사용자 인증**: 프로덕션에서는 `X-User-ID` 대신 실제 인증 시스템 사용
- **Rate Limiting**: 환경 변수로 요청 제한 설정
- **CORS 설정**: 프로덕션에서는 `cors` 설정을 특정 도메인으로 제한

---

## 📈 성능 최적화

- **동시 작업 수 조정**: `MAX_CONCURRENT_JOBS` 환경 변수 조정
- **Redis 사용**: 대규모 트래픽에는 Redis 필수
- **MongoDB 인덱싱**: 자동으로 설정된 인덱스 사용
- **파일 압축**: 생성된 MP3 파일 압축 고려

---

## 🤝 기여

이 프로젝트에 기여하고 싶으시다면:

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 라이선스

MIT License - 자유롭게 사용, 수정, 배포하실 수 있습니다.

---

## 📞 지원

문제가 발생하거나 질문이 있으시면:

- **Issues**: GitHub Issues에 문의
- **Email**: support@example.com
- **Documentation**: 위 가이드 참조

---

## 🎯 로드맵

- [ ] 사용자 인증 시스템
- [ ] 음악 태그/카테고리 기능
- [ ] 음악 공유 기능
- [ ] 플레이리스트 관리
- [ ] 음악 편집 기능
- [ ] 모바일 앱
- [ ] AI 추천 시스템

---

## 🙏 감사의 말

- **Suno AI** - 훌륭한 음악 생성 API 제공
- **Bull** - 강력한 작업 큐 시스템
- **Socket.IO** - 실시간 통신 라이브러리

---

**Made with ❤️ for music creators**

🎵 **Happy Music Creating!** 🎵
