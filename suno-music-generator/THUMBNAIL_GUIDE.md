# 🎨 YouTube 썸네일 자동 생성 시스템 가이드

## 📋 목차
1. [시스템 개요](#시스템-개요)
2. [지원 AI 모델](#지원-ai-모델)
3. [설치 및 설정](#설치-및-설정)
4. [사용 방법](#사용-방법)
5. [API 문서](#api-문서)
6. [트러블슈팅](#트러블슈팅)

---

## 🎯 시스템 개요

YouTube 썸네일을 **자동으로 4가지 버전**으로 생성하는 시스템입니다:

### 생성되는 4가지 버전
1. **디자인 A + 텍스트 포함** - 바로 업로드 가능한 완성본
2. **디자인 A + 텍스트 없음** - 배경 이미지 (텍스트 오버레이용)
3. **디자인 B + 텍스트 포함** - 대체 디자인 완성본
4. **디자인 B + 텍스트 없음** - 대체 디자인 배경

### 주요 기능
- ✅ **제목 자동 정리** - "5곡 8분" 같은 패턴 자동 제거
- ✅ **스타일 기반 생성** - 음악 스타일에 맞는 디자인
- ✅ **실시간 업데이트** - Socket.IO로 즉시 표시
- ✅ **다중 AI 모델 지원** - 3가지 AI 모델 중 선택 가능

---

## 🤖 지원 AI 모델

### 1. 🎨 GenSpark nano-banana-2 (기본값)
- **특징**: 무료, 고품질
- **방식**: AI 어시스턴트 수동 생성
- **속도**: 수동 처리 (AI 어시스턴트 응답 시간에 따름)
- **장점**: 완전 무료, 고품질
- **단점**: 완전 자동화 불가 (AI 어시스턴트 개입 필요)
- **사용 시나리오**: 비용 없이 고품질 썸네일 필요할 때

### 2. 🚀 Replicate FLUX Schnell ⭐ **권장**
- **특징**: 완전 자동, 빠름
- **방식**: Replicate API 자동 호출
- **속도**: 약 5-10초 (4개 이미지, 1초 간격)
- **장점**: 완전 자동화, 빠른 속도, 안정적
- **단점**: API 토큰 필요 (무료 크레딧 제공)
- **사용 시나리오**: 완전 자동화가 필요할 때 (권장)
- **설정**: `.env` 파일에 `REPLICATE_API_TOKEN` 필요

### 3. 💎 OpenAI DALL-E 3
- **특징**: 고품질, 완전 자동
- **방식**: OpenAI API 자동 호출
- **속도**: 약 30-40초 (4개 이미지, 8초 간격)
- **장점**: 최고 품질, 안정적
- **단점**: API 키 필요, 비용 발생
- **사용 시나리오**: 최고 품질 필요할 때
- **설정**: `.env` 파일에 `OPENAI_API_KEY` 필요

---

## 📦 설치 및 설정

### 1. 필수 패키지 설치

```bash
cd /home/user/webapp/suno-music-generator

# Python 패키지 설치
pip3 install requests replicate openai
```

### 2. 환경변수 설정 (`.env` 파일)

```bash
# Suno API (기존)
SUNO_API_KEY=your_suno_key

# OpenAI API (DALL-E 3용, 선택사항)
OPENAI_API_KEY=your_openai_key

# Replicate API (FLUX용, 선택사항 - 권장)
# https://replicate.com/account/api-tokens 에서 발급
REPLICATE_API_TOKEN=your_replicate_token
```

### 3. 자동 생성 시스템 시작

```bash
# 통합 자동 생성 스크립트 실행
cd /home/user/webapp/suno-music-generator/server
python3 auto_thumbnail_unified.py
```

**백그라운드 실행:**
```bash
nohup python3 auto_thumbnail_unified.py > thumbnail_generator.log 2>&1 &
```

---

## 🎮 사용 방법

### 웹 인터페이스에서 사용

1. **앨범 생성** - 먼저 음악 앨범을 생성하세요
2. **AI 모델 선택** - 썸네일 섹션에서 원하는 AI 모델 선택
   - GenSpark (무료, 수동)
   - **Replicate FLUX** (자동, 권장) ⭐
   - OpenAI DALL-E 3 (고급, 자동)
3. **썸네일 생성 버튼 클릭** - "YouTube 썸네일 생성" 버튼 클릭
4. **자동 표시** - 생성 완료 시 자동으로 4개 썸네일 표시

### 생성 과정

#### GenSpark 모드:
```
버튼 클릭 → 웹훅 요청 → 큐 추가 → JSON 저장 → AI 어시스턴트 수동 생성 → 웹훅 완료 → 실시간 표시
```

#### Replicate/OpenAI 모드:
```
버튼 클릭 → 웹훅 요청 → 큐 추가 → API 자동 호출 → 4개 이미지 생성 → 웹훅 완료 → 실시간 표시
```

---

## 🔌 API 문서

### 1. 썸네일 생성 요청

**Endpoint:** `POST /api/webhook/thumbnail-request`

**Request Body:**
```json
{
  "title": "🎧 집중력 UP 스터디 플레이리스트 5곡 10분",
  "style": "study music",
  "language": "korean",
  "aiModel": "replicate"  // "genspark" | "replicate" | "openai"
}
```

**Response:**
```json
{
  "success": true,
  "requestId": "thumb_1778228822682_e1v0h6yko",
  "cleanTitle": "🎧 집중력 UP 스터디 플레이리스트",
  "prompts": [
    {
      "version": "design_a_with_text",
      "label": "디자인 A (텍스트 포함)",
      "prompt": "..."
    },
    // ... 3 more prompts
  ],
  "aiModel": "replicate",
  "aiModelName": "Replicate FLUX Schnell (완전 자동)",
  "pollUrl": "/api/webhook/thumbnail-status/thumb_1778228822682_e1v0h6yko"
}
```

### 2. 썸네일 완성 알림

**Endpoint:** `POST /api/webhook/thumbnail-complete`

**Request Body:**
```json
{
  "requestId": "thumb_1778228822682_e1v0h6yko",
  "images": [
    {
      "version": "design_a_with_text",
      "label": "디자인 A (텍스트 포함)",
      "imageUrl": "https://example.com/image1.webp",
      "imageUrlNoWatermark": "https://example.com/image1.webp",
      "width": 1792,
      "height": 1024
    },
    // ... 3 more images
  ]
}
```

### 3. 상태 조회

**Endpoint:** `GET /api/webhook/thumbnail-status/:requestId`

**Response:**
```json
{
  "success": true,
  "requestId": "thumb_1778228822682_e1v0h6yko",
  "status": "completed",  // "pending" | "completed" | "failed"
  "title": "...",
  "images": [...],
  "createdAt": "2024-01-15T10:30:00Z",
  "completedAt": "2024-01-15T10:30:15Z"
}
```

### 4. 대기열 조회

**Endpoint:** `GET /api/webhook/thumbnail-queue`

**Response:**
```json
{
  "success": true,
  "count": 2,
  "requests": [
    {
      "requestId": "...",
      "title": "...",
      "status": "pending",
      "aiModel": "replicate",
      "createdAt": "..."
    }
  ]
}
```

---

## 🔍 모니터링

### 실시간 모니터링 스크립트

```bash
# monitor.sh 실행
cd /home/user/webapp/suno-music-generator
./monitor.sh
```

**출력 예시:**
```
==========================================
🎨 썸네일 생성 시스템 모니터링
==========================================
⏰ 2024-01-15 10:30:45

📊 서버 상태:
   ✅ Node.js 서버 실행 중 (PID: 12345)
   ✅ Python 자동 생성기 실행 중 (PID: 12346)

📋 대기 중인 요청: 1개
   - thumb_xyz (genspark) - 30초 대기 중

🎨 지원 AI 모델:
   1. GenSpark nano-banana-2 (무료, 수동) ✅
   2. Replicate FLUX Schnell (자동) ✅
   3. OpenAI DALL-E 3 (자동) ❌ (API 키 필요)
```

---

## ❗ 트러블슈팅

### 1. Replicate FLUX 작동 안함

**증상:** `Replicate FLUX Schnell (완전 자동) ❌ (설정 필요)`

**해결:**
```bash
# 1. Replicate API 토큰 발급
# https://replicate.com/account/api-tokens

# 2. .env 파일에 추가
echo "REPLICATE_API_TOKEN=r8_..." >> .env

# 3. 자동 생성기 재시작
pkill -f auto_thumbnail_unified
python3 server/auto_thumbnail_unified.py &
```

### 2. GenSpark 모드에서 이미지 생성 안됨

**증상:** JSON 파일만 생성되고 이미지가 안 나옴

**원인:** GenSpark 모드는 AI 어시스턴트가 수동으로 처리해야 합니다

**해결:**
- Replicate FLUX 모드로 전환 (권장)
- 또는 AI 어시스턴트에게 요청하여 수동 생성

### 3. Socket.IO 실시간 업데이트 안됨

**증상:** 썸네일 생성 후 자동으로 표시되지 않음

**해결:**
```bash
# 브라우저 콘솔에서 확인
socket.connected  // true 여야 함

# 서버 재시작
pm2 restart suno-server
```

### 4. "404 Not Found" 오류 (OpenAI)

**증상:** OpenAI DALL-E 3 모드에서 404 오류

**원인:** API 키가 만료되었거나 잘못됨

**해결:**
- Replicate FLUX 모드로 전환 (권장)
- 또는 OpenAI API 키 갱신

---

## 📊 성능 비교

| 모델 | 속도 | 품질 | 비용 | 자동화 | 권장도 |
|------|------|------|------|--------|--------|
| GenSpark nano-banana-2 | ⭐⭐ (수동) | ⭐⭐⭐⭐ | 무료 | ❌ 수동 | ⭐⭐⭐ |
| Replicate FLUX Schnell | ⭐⭐⭐⭐⭐ (5-10초) | ⭐⭐⭐⭐ | 무료 크레딧 | ✅ 자동 | ⭐⭐⭐⭐⭐ |
| OpenAI DALL-E 3 | ⭐⭐⭐ (30-40초) | ⭐⭐⭐⭐⭐ | 유료 | ✅ 자동 | ⭐⭐⭐⭐ |

**권장 사항:** 대부분의 경우 **Replicate FLUX Schnell**을 사용하세요! 🚀

---

## 🎉 완성!

이제 3가지 AI 모델 중 선택해서 완전 자동 또는 수동으로 YouTube 썸네일을 생성할 수 있습니다!

**문의사항이 있으면 언제든지 물어보세요!** 🙌
