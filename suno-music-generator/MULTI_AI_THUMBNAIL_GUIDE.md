# 🎨 다중 AI 모델 지원 썸네일 자동 생성 시스템

## 📋 개요

YouTube 썸네일을 **3가지 AI 모델**로 자동 생성하는 시스템입니다.
- ✅ 버튼 클릭 → **4개 버전** 자동 생성 (디자인 A/B × 텍스트 포함/없음)
- ✅ 실시간 웹사이트 표시 (Socket.IO)
- ✅ 제목 자동 정리 ("5곡 8분" 같은 패턴 제거)

---

## 🤖 지원하는 AI 모델

### 1. **GenSpark nano-banana-2** (기본값)
- **타입**: 무료, 수동 생성
- **작동 방식**: AI 어시스턴트가 JSON 파일을 읽고 `image_generation` 툴로 생성
- **장점**: 완전 무료
- **단점**: AI 어시스턴트 수동 개입 필요

### 2. **Replicate FLUX Schnell** ⭐ 권장!
- **타입**: 완전 자동 생성
- **작동 방식**: Python 스크립트가 자동으로 Replicate API 호출
- **장점**: 
  - 완전 자동화 (1초 간격)
  - 빠른 생성 속도
  - 고품질 이미지
  - 워터마크 없음
- **필요**: Replicate API 토큰 (무료 크레딧 제공)
- **설정**: `.env`에 `REPLICATE_API_TOKEN=your_token` 추가

### 3. **OpenAI DALL-E 3**
- **타입**: 완전 자동 생성 (고급)
- **작동 방식**: Python 스크립트가 자동으로 OpenAI API 호출
- **장점**:
  - 프리미엄 품질
  - 텍스트 렌더링 우수
  - 안정적
- **필요**: OpenAI API 키 (유료)
- **설정**: `.env`에 `OPENAI_API_KEY=sk-...` 추가

---

## 🚀 설치 및 설정

### 1️⃣ 필수 패키지 설치

```bash
cd /home/user/webapp/suno-music-generator
pip3 install replicate openai requests
```

### 2️⃣ 환경변수 설정

`.env` 파일에 추가:

```bash
# GenSpark는 별도 설정 불필요 (기본 제공)

# Replicate FLUX (권장) - https://replicate.com/account/api-tokens
REPLICATE_API_TOKEN=your_replicate_token_here

# OpenAI DALL-E 3 (선택) - https://platform.openai.com/api-keys  
OPENAI_API_KEY=sk-proj-...
```

### 3️⃣ 통합 자동 생성 스크립트 실행

```bash
cd /home/user/webapp/suno-music-generator/server
python3 auto_thumbnail_unified.py &
```

**스크립트 기능:**
- 5초마다 대기열 체크
- `aiModel`에 따라 자동 처리:
  - `genspark`: JSON 저장 (AI 어시스턴트가 처리)
  - `replicate`: 자동 생성 및 웹훅 전송
  - `openai`: 자동 생성 및 웹훅 전송

---

## 🎯 사용 방법

### 웹사이트에서 사용

1. **앨범 생성**: 음악을 생성하고 앨범 메타데이터 생성
2. **AI 모델 선택**: 드롭다운에서 원하는 AI 모델 선택
   - 🎨 GenSpark nano-banana-2 (무료, 수동)
   - 🚀 Replicate FLUX Schnell (자동 - **권장**)
   - 💎 OpenAI DALL-E 3 (자동 - 고급)
3. **버튼 클릭**: "YouTube 썸네일 생성 (4가지 버전)" 버튼 클릭
4. **자동 표시**: 생성 완료 시 자동으로 4개 썸네일 표시

### 4개 버전 설명

| 버전 | 디자인 | 텍스트 | 용도 |
|------|--------|--------|------|
| Design A + Text | A | 포함 | 바로 업로드 가능한 완성본 |
| Design A - Text | A | 없음 | 배경 이미지 (나중에 텍스트 추가) |
| Design B + Text | B | 포함 | 대체 디자인 완성본 |
| Design B - Text | B | 없음 | 대체 배경 이미지 |

---

## 🔧 시스템 아키텍처

```
사용자 클릭
    ↓
POST /api/webhook/thumbnail-request
    - title: 앨범 제목
    - style: 음악 스타일
    - aiModel: 'genspark' | 'replicate' | 'openai'
    ↓
큐에 추가 (status: pending)
    ↓
Socket.IO 'thumbnail-request' 이벤트
    ↓
┌─────────────────────────────────────────┐
│  auto_thumbnail_unified.py (5초 주기)    │
└─────────────────────────────────────────┘
    ↓
aiModel 확인
    ↓
├─ genspark → JSON 저장 → AI 어시스턴트 수동 처리
├─ replicate → FLUX API 자동 호출 (4개 이미지)
└─ openai → DALL-E 3 API 자동 호출 (4개 이미지)
    ↓
POST /api/webhook/thumbnail-complete
    - requestId
    - images: [4개 이미지 URL 배열]
    ↓
Socket.IO 'thumbnail-complete' 이벤트
    ↓
웹사이트 자동 표시 (2×2 그리드)
```

---

## 📁 주요 파일

### Python 스크립트

| 파일 | 설명 |
|------|------|
| `auto_thumbnail_unified.py` | **통합 자동 생성** (모든 모델 지원) |
| `auto_thumbnail_generator.py` | GenSpark 전용 (v1, 구버전) |
| `auto_thumbnail_generator_v2.py` | OpenAI DALL-E 3 전용 |
| `auto_thumbnail_generator_v3_replicate.py` | Replicate FLUX 전용 |

### Node.js 서비스

| 파일 | 설명 |
|------|------|
| `server/routes/webhook.js` | 웹훅 엔드포인트 (요청/완료/상태/큐) |
| `server/services/thumbnailGenerator.js` | 4개 프롬프트 생성 로직 |
| `server/services/openaiImageGenerator.js` | OpenAI DALL-E 3 서비스 |

### 프론트엔드

| 파일 | 설명 |
|------|------|
| `client/workflow.html` | UI (AI 모델 선택 드롭다운) |
| `client/style-workflow.js` | 썸네일 생성 및 표시 로직 |

---

## 🔍 모니터링

### 실시간 모니터링 스크립트

```bash
cd /home/user/webapp/suno-music-generator
./monitor.sh
```

**표시 내용:**
- 서버 상태 (포트 5000)
- 대기 중인 요청 수
- 최근 10개 로그

### 수동 확인

```bash
# 큐 확인
curl http://localhost:5000/api/webhook/thumbnail-queue

# 특정 요청 상태 확인
curl http://localhost:5000/api/webhook/thumbnail-status/thumb_xxx

# 자동 생성 스크립트 로그
tail -f /tmp/auto_thumbnail.log  # (만약 리다이렉트했다면)
```

---

## 🐛 문제 해결

### Replicate API 404 오류

```bash
# API 토큰 확인
echo $REPLICATE_API_TOKEN

# .env 파일 확인
cat .env | grep REPLICATE

# 스크립트 재시작
pkill -f auto_thumbnail_unified
python3 server/auto_thumbnail_unified.py &
```

### OpenAI API 오류

OpenAI API 키가 만료되었거나 유효하지 않을 수 있습니다.
- Replicate FLUX를 사용하세요 (권장)

### GenSpark 수동 생성

GenSpark 모드에서는 AI 어시스턴트가:
1. `/tmp/thumbnail_request_*.json` 파일 감지
2. 파일 내용을 읽고 4개 프롬프트 확인
3. `image_generation` 툴로 4개 이미지 생성
4. `POST /api/webhook/thumbnail-complete`로 웹훅 전송

---

## 📊 성능 비교

| 모델 | 속도 | 품질 | 비용 | 자동화 | 권장도 |
|------|------|------|------|--------|--------|
| GenSpark | 중간 | 좋음 | 무료 | 수동 | ⭐⭐⭐ |
| **Replicate FLUX** | **빠름** | **우수** | **무료 크레딧** | **자동** | **⭐⭐⭐⭐⭐** |
| OpenAI DALL-E 3 | 중간 | 최고 | 유료 | 자동 | ⭐⭐⭐⭐ |

**결론**: Replicate FLUX Schnell을 사용하세요! 🚀

---

## 🎉 주요 기능

✅ **3가지 AI 모델 지원** (GenSpark, Replicate, OpenAI)
✅ **완전 자동 생성** (Replicate/OpenAI)
✅ **4가지 썸네일 버전** (디자인 A/B × 텍스트 유/무)
✅ **실시간 웹사이트 표시** (Socket.IO)
✅ **제목 자동 정리** (곡수/시간 제거)
✅ **워터마크 없음**
✅ **16:9 종횡비** (YouTube 최적화)
✅ **고품질 이미지**

---

## 📝 라이선스

이 시스템은 MIT 라이선스를 따릅니다.

---

**✨ 이제 YouTube 썸네일을 버튼 클릭 한 번으로 자동 생성하세요!**
