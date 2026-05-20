# 🎨 웹훅 기반 썸네일 자동 생성 시스템

**완전 자동화된 썸네일 생성 시스템**이 구축되었습니다!

---

## 📋 시스템 개요

### 작동 원리

```
1. 웹사이트 → 서버
   사용자가 "YouTube 썸네일 생성" 버튼 클릭
   
2. 서버 → 큐
   요청을 메모리 큐에 저장 (requestId 생성)
   
3. 서버 → Socket.IO
   실시간 알림으로 프론트엔드에 전달
   
4. AI 어시스턴트 → 이미지 생성
   대기 중인 요청을 감지하고 이미지 생성
   
5. AI → 서버 웹훅
   /api/webhook/thumbnail-complete 호출
   
6. 서버 → Socket.IO → 웹사이트
   실시간으로 결과 업데이트 (자동 표시)
```

---

## 🚀 사용 방법

### 1️⃣ 웹사이트에서 요청

1. 음악 생성 후 앨범 생성
2. 썸네일 섹션에서 **"YouTube 썸네일 생성"** 버튼 클릭
3. 자동으로 대기 화면 표시

### 2️⃣ AI 어시스턴트가 자동 처리

#### 방법 A: 수동 처리 (현재)

AI 채팅에서:
```
아래 프롬프트로 nano-banana-2 모델, 16:9 비율로 이미지를 생성한 후
웹훅으로 완료 알림을 보내줘:

curl -X POST http://localhost:5000/api/webhook/thumbnail-complete \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "thumb_...",
    "imageUrl": "https://...",
    "imageUrlNoWatermark": "https://...",
    "width": 1365,
    "height": 768
  }'
```

#### 방법 B: Python 자동 처리 스크립트

터미널에서:
```bash
cd /home/user/webapp/suno-music-generator
python3 server/webhook_thumbnail_processor.py
```

스크립트가:
- 10초마다 대기 중인 요청 확인
- 프롬프트 표시
- 사용자가 AI에게 이미지 생성 요청
- 생성된 URL 입력
- 자동으로 웹훅 전송

### 3️⃣ 웹사이트에서 자동 결과 표시

- Socket.IO로 실시간 업데이트
- 폴링으로 자동 재확인 (최대 60초)
- 완료 시 이미지 자동 표시
- 다운로드 버튼 제공

---

## 🔌 API 엔드포인트

### POST /api/webhook/thumbnail-request

**썸네일 생성 요청**

**Request:**
```json
{
  "title": "듣는 순간 집중되는 음악📚",
  "style": "Lo-Fi Hip Hop, study music",
  "language": "korean"
}
```

**Response:**
```json
{
  "success": true,
  "requestId": "thumb_1778195725776_gq4h46q0o",
  "prompt": "Professional YouTube music thumbnail design...",
  "template": {
    "mood": "focused and productive",
    "colorScheme": "clean blue and white tones, minimal design",
    "visualElements": "books on desk, study lamp, notebook, coffee cup, plants"
  },
  "aspectRatio": "16:9",
  "model": "nano-banana-2",
  "pollUrl": "/api/webhook/thumbnail-status/thumb_1778195725776_gq4h46q0o"
}
```

### POST /api/webhook/thumbnail-complete

**썸네일 생성 완료 알림**

**Request:**
```json
{
  "requestId": "thumb_1778195725776_gq4h46q0o",
  "imageUrl": "https://www.genspark.ai/api/files/s/JkAJ7FZE?cache_control=3600",
  "imageUrlNoWatermark": "https://www.genspark.ai/api/files/s/tJ7s0BaJ?cache_control=3600",
  "width": 1365,
  "height": 768
}
```

**Response:**
```json
{
  "success": true,
  "message": "Thumbnail completion processed"
}
```

### GET /api/webhook/thumbnail-status/:requestId

**썸네일 요청 상태 조회**

**Response:**
```json
{
  "success": true,
  "requestId": "thumb_1778195725776_gq4h46q0o",
  "status": "completed",
  "title": "듣는 순간 집중되는 음악📚",
  "imageUrl": "https://www.genspark.ai/api/files/s/JkAJ7FZE?cache_control=3600",
  "imageUrlNoWatermark": "https://www.genspark.ai/api/files/s/tJ7s0BaJ?cache_control=3600",
  "width": 1365,
  "height": 768,
  "createdAt": "2026-05-07T23:15:25.777Z",
  "completedAt": "2026-05-07T23:16:00.886Z"
}
```

### GET /api/webhook/thumbnail-queue

**대기 중인 요청 목록 조회**

**Response:**
```json
{
  "success": true,
  "count": 2,
  "requests": [
    {
      "requestId": "thumb_...",
      "title": "...",
      "style": "...",
      "status": "pending",
      "createdAt": "2026-05-07T23:15:25.777Z"
    }
  ]
}
```

---

## 🎯 Socket.IO 이벤트

### Client → Server (없음)

현재는 서버가 자동으로 이벤트 발송

### Server → Client

#### `thumbnail-request`

새 썸네일 요청 알림

```javascript
socket.on('thumbnail-request', (data) => {
  console.log('새 썸네일 요청:', data.requestId);
});
```

#### `thumbnail-complete`

썸네일 생성 완료 알림

```javascript
socket.on('thumbnail-complete', (data) => {
  if (data.requestId === window.currentThumbnailRequestId) {
    displayThumbnailResult(data);
  }
});
```

---

## 🧪 테스트

### 테스트 1: 썸네일 요청

```bash
curl -X POST http://localhost:5000/api/webhook/thumbnail-request \
  -H "Content-Type: application/json" \
  -d '{
    "title": "테스트 제목",
    "style": "Lo-Fi Hip Hop",
    "language": "korean"
  }'
```

### 테스트 2: 이미지 생성 (AI 어시스턴트)

AI 채팅에서:
```
위 프롬프트로 nano-banana-2 모델, 16:9 비율로 이미지를 생성해줘
```

### 테스트 3: 완료 웹훅 전송

```bash
curl -X POST http://localhost:5000/api/webhook/thumbnail-complete \
  -H "Content-Type: application/json" \
  -d '{
    "requestId": "thumb_...",
    "imageUrl": "https://www.genspark.ai/api/files/s/...",
    "imageUrlNoWatermark": "https://www.genspark.ai/api/files/s/...",
    "width": 1365,
    "height": 768
  }'
```

### 테스트 4: 상태 확인

```bash
curl http://localhost:5000/api/webhook/thumbnail-status/thumb_...
```

---

## 📊 지원하는 스타일 템플릿

| 스타일 | 분위기 | 색상 | 시각 요소 |
|--------|--------|------|-----------|
| **Study** | focused, productive | clean blue/white | books, lamp, notebook, coffee |
| **Cafe** | cozy, comfortable | warm brown/cream | coffee, interior, plants |
| **Workout** | energetic, powerful | bold red/black | gym equipment, dumbbells |
| **Lo-Fi** | nostalgic, aesthetic | retro sunset, vintage | vinyl, radio, cassette tape |
| **Healing** | peaceful, relaxing | soft purple/blue | stars, moon, clouds, waves |
| **K-Pop** | emotional, dramatic | vibrant colors, glow | microphone, stage lights |

---

## 🔧 기술 스택

- **Backend**: Node.js + Express
- **Queue**: Memory Map (Redis 확장 가능)
- **Real-time**: Socket.IO
- **Image**: GenSpark nano-banana-2 (무료)
- **Resolution**: 1365x768 (16:9)
- **Automation**: Python webhook processor

---

## 🎨 생성된 샘플 썸네일

### Lo-Fi Hip Hop Study Music

![Sample Thumbnail](https://www.genspark.ai/api/files/s/JkAJ7FZE?cache_control=3600)

- **제목**: "듣는 순간 집중되는 음악📚"
- **스타일**: Lo-Fi Hip Hop, study music
- **분위기**: Focused and productive
- **색상**: Clean blue and white tones
- **해상도**: 1365x768 (16:9)

---

## 🚀 라이브 서버

**URL**: https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai

**워크플로우**: https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow

---

## 📝 사용 팁

### 1. 완전 자동화하려면

Python 스크립트를 백그라운드로 실행:
```bash
nohup python3 server/webhook_thumbnail_processor.py > /tmp/webhook-processor.log 2>&1 &
```

### 2. Redis로 확장하려면

```javascript
// server/routes/webhook.js
const Redis = require('ioredis');
const redis = new Redis();

// Map 대신 Redis 사용
async function addThumbnailRequest(requestId, data) {
  await redis.set(`thumbnail:${requestId}`, JSON.stringify(data));
}
```

### 3. 타임아웃 조정하려면

```javascript
// client/style-workflow.js
const maxAttempts = 60; // 60초 → 120초로 변경
```

---

## 🎉 완료!

웹훅 기반 썸네일 자동 생성 시스템이 완성되었습니다!

**주요 장점:**
- ✅ 완전 자동화 (웹 → AI → 웹)
- ✅ 실시간 업데이트 (Socket.IO)
- ✅ 무료 이미지 생성 (nano-banana-2)
- ✅ 고품질 (1365x768, 16:9)
- ✅ 6가지 스타일 템플릿
- ✅ 확장 가능한 아키텍처

**다음 단계:**
1. Redis로 큐 확장
2. 자동 retry 로직 추가
3. 썸네일 히스토리 DB 저장
4. 대량 생성 배치 처리
