# Suno 가사 API 프롬프트 최적화 가이드

## 📋 Suno 가사 API가 받아들이는 항목

### 공식 제한:
- **최대 길이: 200자**
- **용도: 가사 내용 설명 (음악 프로덕션 X)**

---

## ✅ 포함 가능한 항목

### 1. 주제 (Theme)
```
"A song about lost love"
"Lyrics about hope and perseverance"
"Story of someone chasing their dreams"
```

### 2. 분위기 (Mood)
```
melancholic, euphoric, aggressive, dreamy, nostalgic, romantic,
dark, uplifting, peaceful, intense, playful, emotional
```

### 3. 장르/스타일 (Genre/Style)
```
pop, R&B, jazz, rock, hip-hop, country, ballad, trap, soul
```

### 4. 언어 (Language)
```
English, Korean, Spanish, Japanese, etc.
```

### 5. 감정 톤 (Emotional Tone)
```
heartfelt, vulnerable, confident, angry, joyful, sad
```

---

## 🚫 포함하면 안 되는 항목

### ❌ 음악 프로덕션 디테일
```
❌ "Electric piano, 808 bass, reverb, money chord"
❌ "100bpm, up tempo, chill beat"
❌ "instrumental intro, clear vocal, acoustic mellow piano"
```
**이유**: 이런 건 음악 생성 API의 `style` 필드용입니다!

### ❌ 기술적 사양
```
❌ "1–5–3–6 chord progression"
❌ "balanced mix with low bass"
❌ "trendy vocal production"
```

---

## 📝 올바른 프롬프트 예시

### 예시 1: Pop 발라드
```
"English pop ballad lyrics, heartbreaking and emotional"
길이: 53자 ✅
```

### 예시 2: Hip-Hop
```
"Rap lyrics about success and hustle, confident mood"
길이: 55자 ✅
```

### 예시 3: R&B
```
"R&B song lyrics, romantic and intimate, smooth delivery"
길이: 59자 ✅
```

### 예시 4: Jazz
```
"Jazz lyrics, nostalgic and melancholic, late night vibe"
길이: 57자 ✅
```

### 예시 5: Country
```
"Country song about small town life, nostalgic storytelling"
길이: 61자 ✅
```

---

## 🎯 우리 시스템 최적화 전략

### 현재 문제:
```javascript
// ❌ 긴 스타일을 그대로 전달
const lyricsPrompt = `${language} song lyrics in ${styleDescription} style`;
// "english song lyrics in Pop R&B, Jazz sound, Electric piano, up tempo..." (315자)
```

### 해결책 1: 핵심 키워드만 추출
```javascript
// ✅ 장르만 추출
const genres = extractGenres(styleDescription);  // ["pop", "R&B", "jazz"]
const moods = extractMoods(styleDescription);    // ["emotional", "chill"]

const lyricsPrompt = `${language} song lyrics, ${genres.join(' ')} style, ${moods.join(' ')} mood`;
// "english song lyrics, pop R&B jazz style, emotional chill mood" (59자)
```

### 해결책 2: 간단한 템플릿
```javascript
// ✅ 가장 간단한 형식
const lyricsPrompt = `${language} ${primaryGenre} lyrics, ${primaryMood} mood`;
// "english pop lyrics, emotional mood" (33자)
```

---

## 📊 프롬프트 길이 비교

| 방식 | 예시 | 길이 | 결과 |
|------|------|------|------|
| **전체 스타일** | "english song lyrics in Pop R&B, Jazz sound, Electric piano, up tempo, no reverb, money chord, 100bpm, chill, catch melody, clear vocal, acoustic mellow piano, emotional, 1–5–3–6..." | 315자 | ❌ 실패 |
| **키워드 추출** | "english song lyrics, pop R&B jazz style, emotional chill mood" | 59자 | ✅ 성공 |
| **최소 템플릿** | "english pop R&B lyrics, emotional mood" | 40자 | ✅ 성공 |

---

## 💡 추천 구현

### Option A: 3-Part 템플릿 (가장 간단)
```javascript
const lyricsPrompt = `${language} ${mainGenre} lyrics, ${mainMood} mood`;

// 예시:
"English pop lyrics, emotional mood"
"Korean ballad lyrics, melancholic mood"
"English rap lyrics, confident mood"
```

**장점**:
- ✅ 항상 200자 이하 보장
- ✅ 간단하고 명확
- ✅ Suno가 잘 이해함

**단점**:
- ⚠️ 디테일 손실 (하지만 가사 내용은 Suno가 알아서 잘 만듦)

---

### Option B: 키워드 추출 (현재 구현)
```javascript
// 장르 추출
const genres = [];
if (style.includes('pop')) genres.push('pop');
if (style.includes('r&b')) genres.push('R&B');
if (style.includes('jazz')) genres.push('jazz');

// 분위기 추출
const moods = [];
if (style.includes('emotional')) moods.push('emotional');
if (style.includes('chill')) moods.push('chill');

const lyricsPrompt = `${language} song lyrics, ${genres.join(' ')} style, ${moods.join(' ')} mood`;
```

**장점**:
- ✅ 스타일 정보 최대한 보존
- ✅ 유연함

**단점**:
- ⚠️ 복잡한 로직
- ⚠️ 여전히 200자 초과 가능

---

### Option C: 하이브리드 (추천!) 🏆
```javascript
// 1. 주요 장르만 추출 (최대 2개)
const mainGenres = extractTopGenres(style, 2);  // ["pop", "R&B"]

// 2. 주요 분위기만 추출 (최대 2개)
const mainMoods = extractTopMoods(style, 2);    // ["emotional", "chill"]

// 3. 간단한 템플릿
const lyricsPrompt = `${language} ${mainGenres.join(' ')} lyrics, ${mainMoods.join(' ')} mood`;

// 예시: "english pop R&B lyrics, emotional chill mood" (44자)
```

**장점**:
- ✅ 핵심 정보만 전달
- ✅ 항상 200자 이하
- ✅ Suno가 이해하기 쉬움

---

## 🧪 테스트 결과 예상

### Input:
```
스타일: "Pop R&B, Jazz sound, Electric piano, up tempo, no reverb, money chord, 100bpm, chill, catch melody, clear vocal, acoustic mellow piano, emotional, 1–5–3–6, money chord balanced mix with low bass, Soft emotional tone, instrumental intro only, trendy vocal, unique intro trendy pop vocal"
```

### Output:

#### Option A (최소):
```
"english pop lyrics, emotional mood"
→ 33자 ✅
→ Suno: "일반적인 팝 발라드 가사"
```

#### Option B (현재):
```
"english song lyrics, pop R&B jazz style, upbeat emotional chill mood"
→ 68자 ✅
→ Suno: "팝, R&B, 재즈 느낌의 감성적이고 차분한 가사"
```

#### Option C (추천):
```
"english pop R&B lyrics, emotional chill mood"
→ 44자 ✅
→ Suno: "팝 R&B 스타일의 감성적이고 차분한 가사"
```

---

## ✅ 최종 추천

**Option C (하이브리드)** 사용:
- 주요 장르 2개 + 주요 분위기 2개
- 간단한 템플릿: `"${language} ${genre1} ${genre2} lyrics, ${mood1} ${mood2} mood"`
- 항상 200자 이하 보장
- 핵심 정보 유지

---

## 📚 참고 자료

- [Suno 공식 문서](https://docs.sunoapi.org/suno-api/generate-lyrics)
- [HookGenius Prompt Guide](https://hookgenius.app/learn/suno-prompt-guide-2026/)
- 테스트 커밋: `2f54a3b`
