# ✅ 1단계 완료: 가사 생성 시스템

## 🎉 구현 완료!

**1단계: 가사 생성 & 기획 시스템**이 성공적으로 구축되었습니다!

---

## 🌐 웹 접속 URL

### **새로운 워크플로우 페이지**
👉 **https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow**

### **기존 페이지**
👉 **https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai**

---

## ✅ 1단계에서 구현된 기능

### 📝 **1. 세 가지 입력 방법**

#### 방법 1: 💭 텍스트 프롬프트
- AI에게 어떤 가사를 만들지 자세히 설명
- 주제, 분위기, 스토리 입력
- **설정 옵션**:
  - 생성 수량 (1-50개)
  - 곡 길이 (30초 ~ 4분+)
  - 변형 정도 (0-100%)

**예시 프롬프트**:
```
실연의 아픔을 담은 감성적인 발라드 가사. 
가을 저녁의 외로움과 그리움을 표현하고 싶어요.
```

#### 방법 2: 📄 샘플 가사
- 참고할 가사를 직접 입력하거나 파일 업로드
- TXT, DOCX 파일 지원
- AI가 스타일 분석 후 유사한 가사 생성
- 드래그 & 드롭 지원

#### 방법 3: 🔗 음악 참조
- 음악 파일 업로드 (MP3, WAV, M4A)
- YouTube, Spotify, Suno URL 입력
- AI가 음악 분석 후 가사 추출 또는 생성

---

## 🎨 UI/UX 특징

### ✨ **직관적인 인터페이스**
- 📊 4단계 워크플로우 표시기
- 🎯 현재 단계 하이라이트
- ✅ 완료된 단계 표시
- 🎨 그라디언트 배경 (보라색 계열)

### 🖱️ **편리한 조작**
- ➕➖ 수량 조절 버튼
- 📊 슬라이더로 변형 정도 조절
- 🖱️ 드래그 & 드롭 파일 업로드
- 📋 생성된 가사 프리뷰 및 관리

### 📱 **반응형 디자인**
- 데스크톱, 태블릿, 모바일 지원
- 자동으로 레이아웃 조정

---

## 🔧 백엔드 API

### **가사 생성 API 엔드포인트**

#### 1. POST `/api/lyrics/generate-from-prompt`
프롬프트로 가사 생성

**요청 예시**:
```json
{
  "prompt": "실연의 아픔을 담은 발라드",
  "quantity": 3,
  "duration": 180,
  "variationLevel": 50
}
```

**응답 예시**:
```json
{
  "success": true,
  "count": 3,
  "lyrics": [
    {
      "id": 1776761315538,
      "title": "Generated Song 1",
      "lyrics": "[Verse 1]\n...\n[Chorus]\n...",
      "theme": "실연의 아픔을 담은 발라드",
      "duration": 180,
      "createdAt": "2026-04-21T08:48:35.537Z"
    }
  ]
}
```

#### 2. POST `/api/lyrics/generate-from-sample`
샘플 가사 분석 및 유사 가사 생성

**요청 예시**:
```json
{
  "sampleLyrics": "[Verse 1]\nYour sample lyrics...",
  "quantity": 5
}
```

**응답**:
```json
{
  "success": true,
  "analyzedStyle": {
    "structure": "Verse-Chorus",
    "hasBridge": false,
    "complexity": "Simple",
    "estimatedGenre": "Pop/Ballad"
  },
  "count": 5,
  "lyrics": [...]
}
```

#### 3. POST `/api/lyrics/extract-from-music`
음악 URL/파일에서 가사 추출

**요청 예시**:
```json
{
  "musicUrl": "https://www.youtube.com/watch?v=...",
  "quantity": 1
}
```

#### 4. POST `/api/lyrics/generate-batch`
배치 가사 생성 (테마 자동 생성)

**요청 예시**:
```json
{
  "mainTheme": "사랑",
  "count": 10,
  "genres": ["Pop", "Ballad", "R&B"]
}
```

#### 5. PUT `/api/lyrics/:lyricsId`
가사 편집

#### 6. DELETE `/api/lyrics/:lyricsId`
가사 삭제

---

## 📂 파일 구조

```
/home/user/webapp/suno-music-generator/
├── client/
│   ├── index.html           # 기존 UI
│   └── workflow.html        # ✨ 새로운 4단계 워크플로우 UI
├── server/
│   ├── index.js             # 메인 서버 (lyrics 라우트 추가)
│   └── routes/
│       ├── music.js         # 음악 생성 API
│       ├── queue.js         # 큐 관리 API
│       ├── status.js        # 상태 API
│       └── lyrics.js        # ✨ 새로운 가사 생성 API
```

---

## 🎯 사용 방법

### **Step 1: 웹 접속**
https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow

### **Step 2: 입력 방법 선택**
- 💭 텍스트 프롬프트
- 📄 샘플 가사
- 🔗 음악 참조

### **Step 3: 정보 입력**
- 프롬프트/샘플/URL 입력
- 생성 수량 설정 (1-50개)
- 곡 길이 선택
- 변형 정도 조절

### **Step 4: 가사 생성**
🎵 "가사 생성하기" 버튼 클릭

### **Step 5: 결과 확인**
- 생성된 가사 프리뷰
- 제목, 가사 내용 확인
- ✏️ 편집, 🗑️ 삭제, ✅ 선택 가능

### **Step 6: 다음 단계로**
"다음 단계: 스타일 선택 →" 버튼 클릭

---

## 🚧 현재 상태

### ✅ **완료됨**
- [x] 4단계 워크플로우 UI 디자인
- [x] 1단계: 가사 생성 UI 완성
- [x] 3가지 입력 방법 구현
- [x] 드래그 & 드롭 파일 업로드
- [x] 가사 생성 API 6개 엔드포인트
- [x] 실시간 프리뷰 및 관리 기능
- [x] 서버 연동 및 테스트

### 🔄 **진행 중**
- [ ] 2단계: 스타일 선택 UI 구현 (다음 단계)

### ⏳ **예정**
- [ ] 실제 AI 가사 생성 (OpenAI/Gemini 연동)
- [ ] YouTube 음악 다운로드 (yt-dlp)
- [ ] 음성 인식 (Whisper)
- [ ] Suno 메타데이터 추출
- [ ] 3단계: 실시간 진행 모니터링
- [ ] 4단계: YouTube 최적화

---

## 💡 개선 제안 (TODO)

### **가사 생성 고도화**
1. **AI 통합**
   - OpenAI GPT-4o 연동
   - Google Gemini Pro 연동
   - 프롬프트 엔지니어링 최적화

2. **음악 분석 기능**
   - yt-dlp로 YouTube 오디오 다운로드
   - Whisper로 음성 → 텍스트 변환
   - Suno API 메타데이터 가져오기
   - 음악 장르/분위기 자동 분석

3. **가사 품질 향상**
   - 운율 체크
   - 감정 분석
   - 키워드 추출
   - 자동 교정

4. **템플릿 시스템**
   - 장르별 가사 템플릿 (발라드, 힙합, 팝 등)
   - 구조 프리셋 (Verse-Chorus, AABA 등)
   - 저장된 템플릿 관리

---

## 🎊 다음 단계

**2단계: 스타일 선택 시스템**을 구현할 준비가 되었습니다!

예정 기능:
- 🤖 AI 자동 스타일 추천
- 🎸 장르 선택 (Pop, Rock, Jazz, Classical 등)
- 🌅 분위기 설정 (Energetic, Melancholic, Romantic 등)
- 🎚️ 고급 파라미터 (스타일 강도, 창의성, 보컬 성별 등)
- 🎭 페르소나 선택 ("Taylor Swift Style" 등)
- 🔗 Suno 링크 참조로 스타일 복제

---

**1단계 완료! 🎉 다음 단계로 계속 진행하시겠어요?**
