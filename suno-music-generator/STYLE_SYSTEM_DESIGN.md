# 🎵 Suno Music Generator - 스타일 시스템 설계

## 📊 분석 결과: Notion 문서 완벽 습득

### 🎯 핵심 발견사항

#### 1. **206개 장르 체계**
- POP 팝: 21개
- ROCK 록: 38개
- HIP HOP 힙합: 19개
- BALLAD/R&B/SOUL: 19개
- HOUSE/EDM/ELECTRONIC: 39개
- AMBIENT/NEW AGE: 9개
- JAZZ: 5개
- LATIN/WORLD: 25개
- SOUNDTRACK/CINEMATIC: 10개
- GOSPEL/CHRISTIAN: 3개
- CLASSICAL: 8개
- WORLD/KIDS: 2개

#### 2. **템포 기반 분류**
| 템포 | BPM 범위 | 대표 분위기 |
|------|---------|------------|
| 🐢 느린 | ~89 BPM | 발라드, 어쿠스틱, 감성적 |
| 🚶 미디엄 | 90~115 BPM | R&B, 팝, 인디 |
| 🏃 빠른 | 116+ BPM | 댄스, 록, 트랩, EDM |

#### 3. **각 장르의 특징 설명**
- 한국어 장르명
- 영문 장르명
- 핵심 특징 (비트, 사운드, 감성)
- BPM별 프롬프트 가이드

---

## 🎨 우리 사이트 적용 전략

### Phase 1: 계층적 장르 선택 시스템

```
1단계: 대분류 선택 (12개 카테고리)
   ↓
2단계: 세부 장르 선택 (해당 카테고리의 장르들)
   ↓
3단계: 템포/무드 미세 조정
   ↓
4단계: AI 자동 최적화 제안
```

### UI 구조 제안:

```
┌─────────────────────────────────────────┐
│  🎵 스타일 선택 (Step 2)                │
├─────────────────────────────────────────┤
│                                          │
│  📝 생성된 가사: "봄날의 약속"          │
│  ┌────────────────────────────────┐    │
│  │ [Verse 1]                      │    │
│  │ 따스한 햇살이 내 얼굴을...     │    │
│  └────────────────────────────────┘    │
│                                          │
│  🤖 AI 추천 스타일:                     │
│  ┌──────┐ ┌──────┐ ┌──────┐          │
│  │ 팝발라드│ │어쿠스틱│ │인디팝 │          │
│  │ 90 BPM│ │75 BPM│ │105BPM│          │
│  └──────┘ └──────┘ └──────┘          │
│                                          │
│  🎹 장르 카테고리:                      │
│  ┌────┐┌────┐┌────┐┌────┐          │
│  │🎤팝││🎸록││🎧힙합││🎹발라드│          │
│  └────┘└────┘└────┘└────┘          │
│  ┌────┐┌────┐┌────┐┌────┐          │
│  │🏠EDM││🌿뉴에이지││🎷재즈││🌍라틴│          │
│  └────┘└────┘└────┘└────┘          │
│                                          │
│  선택: 🎤 POP 팝 ▼                      │
│  ┌──────────────────────────────┐    │
│  │ ☐ HIT Pop Song (히트팝)      │    │
│  │ ☐ Dance Pop (댄스팝)         │    │
│  │ ☐ K-Pop (케이팝)             │    │
│  │ ☐ Acoustic Pop (어쿠스틱)    │    │
│  │ ☑ Indie Pop (인디팝) ✓       │    │
│  │ ☐ Bedroom Pop (베드룸팝)     │    │
│  └──────────────────────────────┘    │
│                                          │
│  🎚️ 템포 조정:                          │
│  🐢───●───────────🏃 [105 BPM]       │
│     느림   미디엄   빠름                │
│                                          │
│  🌈 무드 선택:                           │
│  ☑ 밝고 경쾌한  ☐ 감성적  ☐ 어두움    │
│  ☐ 몽환적      ☐ 에너지넘침            │
│                                          │
│  🎭 추가 옵션:                           │
│  ☐ 보컬 중심   ☑ 어쿠스틱 악기         │
│  ☐ 신스 사용   ☐ 오케스트라            │
│                                          │
│  📊 최종 프롬프트 미리보기:             │
│  ┌────────────────────────────────┐  │
│  │ Indie Pop, acoustic guitar,    │  │
│  │ bright and cheerful mood,      │  │
│  │ 105 BPM, medium tempo          │  │
│  └────────────────────────────────┘  │
│                                          │
│  [← 이전] [스타일 저장] [다음: 음악생성 →]│
└─────────────────────────────────────────┘
```

---

## 🧠 AI 자동 추천 로직

### 가사 분석 → 스타일 추천

```javascript
function analyzeAndRecommendStyle(lyrics) {
  // 1. 키워드 분석
  const keywords = extractKeywords(lyrics);
  
  // 2. 감정 분석
  const emotion = analyzeEmotion(lyrics); // 슬픔, 기쁨, 그리움 등
  
  // 3. 템포 예측
  const predictedTempo = predictTempoFromLyrics(lyrics);
  
  // 4. 장르 매칭
  const recommendations = matchGenres({
    keywords,
    emotion,
    tempo: predictedTempo
  });
  
  return recommendations; // Top 3
}
```

### 예시 매칭 로직:

| 가사 키워드 | 감정 | 추천 장르 | 템포 |
|------------|------|-----------|------|
| "봄날", "햇살", "설렘" | 밝고 희망적 | Indie Pop, Acoustic Pop | 95-110 BPM |
| "이별", "눈물", "외로움" | 슬픔 | Pop Ballad, Singer Songwriter | 60-80 BPM |
| "춤춰", "밤새", "파티" | 흥겨움 | Dance Pop, EDM | 120-130 BPM |
| "그리워", "추억", "별" | 그리움 | Dream Pop, Bedroom Pop | 85-100 BPM |

---

## 📦 데이터베이스 구조

### genres.json

```json
{
  "categories": [
    {
      "id": "pop",
      "name": "POP 팝",
      "icon": "🎤",
      "description": "차트 중심의 대중 음악 전반",
      "genres": [
        {
          "id": "hit-pop-song",
          "name": "HIT Pop Song",
          "nameKo": "히트팝송",
          "description": "차트 팝, 라디오 친화적",
          "bpmRange": [90, 130],
          "defaultBPM": 110,
          "mood": ["밝음", "경쾌함", "중독성"],
          "instruments": ["vocal", "synth", "drum-machine"],
          "promptTemplate": "HIT Pop Song, catchy melody, radio-friendly, {BPM} BPM",
          "examples": ["Dua Lipa", "The Weeknd", "Olivia Rodrigo"]
        },
        {
          "id": "k-pop",
          "name": "K-Pop",
          "nameKo": "케이팝",
          "description": "한국 아이돌 팝, 퍼포먼스 중심",
          "bpmRange": [110, 140],
          "defaultBPM": 125,
          "mood": ["에너지넘침", "완벽한편곡", "다이나믹"],
          "instruments": ["vocal-harmonies", "edm-elements", "808-bass"],
          "promptTemplate": "K-Pop, dynamic performance, perfect production, {BPM} BPM",
          "examples": ["BTS", "BLACKPINK", "NewJeans"]
        }
      ]
    },
    {
      "id": "rock",
      "name": "ROCK 록",
      "icon": "🎸",
      "genres": [...]
    }
  ]
}
```

---

## 🎨 스타일 프리셋 시스템

### 빠른 선택용 프리셋 (20개)

```javascript
const stylePresets = [
  {
    id: "emotional-ballad",
    name: "🎹 감성 발라드",
    description: "피아노 중심의 감성적인 발라드",
    genre: "pop-ballad",
    bpm: 70,
    mood: ["감성적", "슬픔"],
    instruments: ["piano", "strings"],
    prompt: "emotional ballad, piano, strings, heartfelt vocals, 70 BPM"
  },
  {
    id: "upbeat-dance-pop",
    name: "💃 신나는 댄스팝",
    description: "클럽에서 춤추고 싶은 경쾌한 팝",
    genre: "dance-pop",
    bpm: 125,
    mood: ["밝음", "에너지넘침"],
    instruments: ["synth", "edm-drums"],
    prompt: "upbeat dance pop, club energy, 4-on-the-floor beat, 125 BPM"
  },
  {
    id: "chill-lofi",
    name: "☕ 칠한 로파이",
    description: "공부하거나 휴식할 때 듣는 로파이",
    genre: "lo-fi-hip-hop",
    bpm: 85,
    mood: ["편안함", "따뜻함"],
    instruments: ["soft-piano", "vinyl-crackle", "jazz-drums"],
    prompt: "lo-fi hip hop, chill beats, vinyl warmth, 85 BPM"
  },
  // ... 17개 더
];
```

---

## 🔄 2단계 워크플로우 상세 설계

### Step 2-1: 가사 목록 표시

```html
<!-- 생성된 가사 카드 -->
<div class="lyrics-card" data-lyrics-id="1">
  <div class="lyrics-header">
    <h3>봄날의 약속 / Promise of Spring</h3>
    <span class="lyrics-meta">발라드 · 90 BPM</span>
  </div>
  <div class="lyrics-preview">
    <div class="lyrics-ko">
      [Verse 1]
      따스한 햇살이 내 얼굴을 감싸...
    </div>
    <div class="lyrics-en">
      [Verse 1]
      The warm sunlight wraps around...
    </div>
  </div>
  <div class="lyrics-actions">
    <button class="btn-select-style">스타일 선택</button>
    <button class="btn-view-full">전체 보기</button>
  </div>
</div>
```

### Step 2-2: AI 추천 스타일

```javascript
async function getStyleRecommendations(lyrics) {
  const response = await fetch('/api/styles/recommend', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      lyricsKo: lyrics.lyricsKo,
      lyricsEn: lyrics.lyricsEn,
      title: lyrics.title
    })
  });
  
  const recommendations = await response.json();
  // [
  //   { genre: "indie-pop", confidence: 0.85, bpm: 105 },
  //   { genre: "acoustic-pop", confidence: 0.78, bpm: 90 },
  //   { genre: "bedroom-pop", confidence: 0.72, bpm: 95 }
  // ]
  
  return recommendations;
}
```

### Step 2-3: 스타일 선택 모달

```html
<div class="style-selector-modal">
  <div class="modal-header">
    <h2>🎨 스타일 선택</h2>
    <p>가사: "봄날의 약속"</p>
  </div>
  
  <!-- AI 추천 -->
  <div class="ai-recommendations">
    <h3>🤖 AI 추천</h3>
    <div class="recommendation-cards">
      <div class="rec-card selected">
        <span class="confidence">85%</span>
        <h4>Indie Pop</h4>
        <p>105 BPM · 밝고 경쾌함</p>
      </div>
      <!-- ... -->
    </div>
  </div>
  
  <!-- 수동 선택 -->
  <div class="manual-selection">
    <h3>🎹 직접 선택</h3>
    <!-- 카테고리 그리드 -->
    <!-- 장르 목록 -->
    <!-- 템포/무드 조정 -->
  </div>
  
  <!-- 프롬프트 미리보기 -->
  <div class="prompt-preview">
    <h3>📊 최종 프롬프트</h3>
    <code>Indie Pop, acoustic guitar, bright mood, 105 BPM</code>
  </div>
  
  <div class="modal-actions">
    <button class="btn-cancel">취소</button>
    <button class="btn-confirm">확인</button>
  </div>
</div>
```

---

## 🎯 구현 우선순위

### Priority 1 (1-2시간): 핵심 UI
- [ ] 생성된 가사 목록 표시
- [ ] 스타일 선택 모달
- [ ] 장르 카테고리 그리드
- [ ] 템포 슬라이더

### Priority 2 (1-2시간): AI 추천
- [ ] 가사 분석 API (`/api/styles/recommend`)
- [ ] OpenAI 감정/키워드 분석
- [ ] 장르 매칭 로직
- [ ] Top 3 추천 표시

### Priority 3 (1시간): 고급 기능
- [ ] 스타일 프리셋 (20개)
- [ ] BPM별 장르 필터
- [ ] 무드 태그 시스템
- [ ] 프롬프트 미리보기

---

## 💡 추가 아이디어

### 1. **스타일 A/B 테스트**
```
같은 가사 → 2가지 스타일로 생성 → 비교 듣기
```

### 2. **스타일 믹스**
```
70% Indie Pop + 30% Dream Pop = 독특한 혼합 스타일
```

### 3. **인기 스타일 트렌드**
```
실시간 인기 장르 표시 (통계 기반)
```

### 4. **스타일 템플릿 저장**
```
"내가 선호하는 스타일" 저장 → 빠른 재사용
```

---

## 📈 구현 타임라인

### Day 1 (오늘)
- ✅ Notion 문서 분석 완료
- ✅ 스타일 시스템 설계 완료
- [ ] genres.json 데이터베이스 생성
- [ ] 기본 UI 구현

### Day 2 (내일)
- [ ] AI 추천 시스템 구현
- [ ] 스타일 선택 모달 완성
- [ ] 테스트 및 버그 수정

---

## 🎯 결론

**206개 장르를 효율적으로 관리하기 위한 핵심 전략**:

1. **계층적 구조**: 12개 카테고리 → 206개 세부 장르
2. **AI 자동 추천**: 가사 분석 → Top 3 추천
3. **빠른 프리셋**: 20개 인기 스타일 원클릭
4. **유연한 커스터마이징**: 템포/무드 수동 조정

**다음 단계**: `genres.json` 생성부터 시작하시겠습니까?
