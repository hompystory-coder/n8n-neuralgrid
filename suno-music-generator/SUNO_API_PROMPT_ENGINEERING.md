# 🎵 Suno API 프롬프트 엔지니어링 완전 가이드

## 📋 목차

1. [Suno API 개요](#1-suno-api-개요)
2. [API 파라미터 전체 목록](#2-api-파라미터-전체-목록)
3. ["캠핑" 테마 예시: 사용자 요구 → API 프롬프트 변환](#3-캠핑-테마-예시)
4. [프롬프트 생성 파이프라인](#4-프롬프트-생성-파이프라인)
5. [스타일 코드 생성 전략](#5-스타일-코드-생성-전략)
6. [언어 일관성 유지 방법](#6-언어-일관성-유지-방법)
7. [볼륨/음량 제어 방법](#7-볼륨음량-제어-방법)

---

## 1. Suno API 개요

### 기본 정보
- **Base URL**: `https://api.sunoapi.org/api/v1`
- **인증**: Bearer Token (헤더: `Authorization: Bearer YOUR_API_KEY`)
- **주요 엔드포인트**: 
  - `POST /generate` - 음악 생성
  - `GET /generate/record-info?taskId=XXX` - 상태 조회
- **모델**: V4, V4_5, V4_5PLUS, V4_5ALL, **V5** (최신, 권장), V5_5

### 생성 방식
1. **Custom Mode** (`customMode: true`) - AI 가사 직접 제공 (권장)
2. **Auto Mode** (`customMode: false`) - Suno가 자동 가사 생성

---

## 2. API 파라미터 전체 목록

### 필수 파라미터

| 파라미터 | 타입 | 설명 | 제한 | 예시 |
|---------|------|------|------|------|
| `model` | string | 모델 버전 | V4, V4_5, V5, V5_5 | `"V5"` |
| `customMode` | boolean | 커스텀 가사 사용 여부 | - | `true` |
| `instrumental` | boolean | 인스트루멘탈 모드 | - | `false` |

### 음악 내용 파라미터

| 파라미터 | 타입 | 설명 | 제한 | 예시 |
|---------|------|------|------|------|
| `title` | string | 곡 제목 | 최대 100자 | `"Camping Under Stars"` |
| `prompt` | string | 가사 또는 음악 설명 | 최대 5000자 | `"[Verse 1]\nCamping by the river..."` |
| `style` | string | 장르/스타일 태그 | 최대 1000자 | `"acoustic folk, soft guitar, campfire vibes"` |

### 고급 제어 파라미터

| 파라미터 | 타입 | 설명 | 범위 | 기본값 | 효과 |
|---------|------|------|------|--------|------|
| `vocalGender` | string | 보컬 성별 | `"m"`, `"f"` | 자동 | 남성/여성 보컬 지정 |
| `styleWeight` | number | 스타일 준수 강도 | 0.0 - 1.0 | 0.5 | 높을수록 스타일 엄격히 적용 |
| `weirdnessConstraint` | number | 창의성/실험성 | 0.0 - 1.0 | 0.5 | 낮을수록 안정적, 높을수록 실험적 |
| `audioWeight` | number | 오디오 가중치 | 0.0 - 1.0 | 0.5 | 오디오 특성 강조 |
| `negativeTags` | string | 제외할 요소 | - | - | `"loud drums, distortion"` |

### 선택 파라미터

| 파라미터 | 타입 | 설명 | 예시 |
|---------|------|------|------|
| `callBackUrl` | string | 웹훅 URL | `"https://yourdomain.com/webhook"` |
| `personaId` | string | Persona ID | `"persona_abc123"` |
| `personaModel` | string | Persona 모델 | `"V5"` |

---

## 3. "캠핑" 테마 예시

### 사용자 요구사항 (원본)

```
- "캠핑"에 관한 가사와 제목을 만들고 싶어
- "캠핑"에 관한 멋진 이야기들을 가사와 제목으로 만들어줘
- "캠핑"에 어울리는 스타일코드를 생성해줘
- 너무 시끄러운 노래는 빼줘 / 큰소리나는 악기는 작게해줘
- 즐겁고 그루브하고 힙합 스타일이 좋아
- 15곡의 가사와 제목을 만들고 싶어
- 한국어/영어 모두 같게 맞추어줘
```

### ✅ 프롬프트 변환 결과

#### 1️⃣ 가사 생성 (AI → Suno API `prompt` 필드)

**LLM에게 전달되는 System Instruction:**

```
당신은 전문 작사가입니다.

🎯 작사 규칙 (3-4분 풀 트랙):
1. 필수 구조: [Intro] → [Verse 1] → [Pre-Chorus] → [Chorus] → [Verse 2] → [Pre-Chorus] → [Chorus] → [Bridge] → [Chorus] → [Outro]
2. 각 섹션 줄 수: Intro(4줄), Verse(8줄씩), Pre-Chorus(4줄씩), Chorus(8줄씩), Bridge(6줄), Outro(4줄)
3. 총 길이: 800-1200자 (최소 800자 필수!)
4. 한 줄 길이: 12-20자

⏱️ 목표 곡 길이: 3-4분 (180-240초)
🚫 금지: Verse 3, Verse 4, Final Chorus 같은 추가 섹션 금지

🎭 작사 스타일: 유쾌 - 밝고 경쾌한, 긍정적 에너지, 신나는 멜로디

💡 작사 방법:
- 감정 스토리의 구체적 이미지를 가사로 표현
- 키워드를 직접 말하지 말고 은유로 전달
- 모든 줄은 시적이고 감각적으로 작성

📝 반드시 한국어 가사만 출력하세요!
```

**LLM에게 전달되는 User Prompt:**

```
📰 이슈: 캠핑 트렌드 증가 - 자연 속에서 힐링
💭 감정 스토리: 텐트를 치고 캠프파이어 앞에 앉아 기타를 치며 노래하는 친구들. 별빛 아래 도란도란 이야기를 나누며 웃음꽃이 핀다.
👁️ 감각: 타닥타닥 타오르는 불빛, 기타 선율, 시원한 밤바람, 풀냄새
🏷️ 키워드: 캠핑, 캠프파이어, 자연, 친구, 별빛

🎵 음악: fun groovy hip-hop, acoustic, cheerful, 여성 보컬

━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 800-1200자 가사를 다음 구조로 완전히 끝까지 작성하세요:

[Intro]
(4줄, 각 12-20자)

[Verse 1]
(8줄, 각 12-20자 - 이야기 시작, 상황 묘사)

[Pre-Chorus]
(4줄, 각 12-20자 - 감정 고조, 코러스 준비)

[Chorus]
(8줄, 각 12-20자 - 메인 메시지, 가장 강렬하게)

[Verse 2]
(8줄, 각 12-20자 - 이야기 전개, 새로운 각도)

[Pre-Chorus]
(4줄, 각 12-20자)

[Chorus]
(8줄, 각 12-20자)

[Bridge]
(6줄, 각 12-20자 - 전환, 클라이맥스)

[Chorus]
(8줄, 각 12-20자 - 마지막 후렴)

[Outro]
(4줄, 각 12-20자 - 여운, 마무리)
━━━━━━━━━━━━━━━━━━━━━━━━━━

지금 [Intro]부터 [Outro]까지 전체 가사를 작성하세요:
```

**LLM이 생성한 가사 (예시):**

```
[Intro]
밤하늘 별이 쏟아지고
모닥불 타닥타닥 소리
자유로운 이 순간 속에
우리만의 축제가 시작돼

[Verse 1]
텐트를 치고 짐을 풀면서
설레는 마음 가득 차올라
나무 사이로 바람이 불어와
이곳이 바로 우리 낙원이야
친구들과 둘러앉아
기타 소리에 맞춰 노래해
걱정은 다 멀리 두고서
오직 지금 이 순간만 느껴

[Pre-Chorus]
자연 속에 풍덩 빠져들어
마음까지 자유로워져
이 느낌 계속되길 바라
영원히 이대로

[Chorus]
캠프파이어 앞에서 춤춰
별빛 샤워 속에 노래해
웃음소리 메아리 되어
밤하늘 높이 올라가
자유롭게 자유롭게
마음껏 소리쳐
오늘 밤은 우리 것이야
끝없이 빛나는 이 순간

[Verse 2]
마시멜로 구워 먹으며
어릴 적 추억 이야기해
시간 가는 줄도 모르고
웃음이 끊이질 않아
밤이 깊어갈수록
우리 목소리는 더 커져가
이 순간을 사진에 담아
평생 간직할 기억 만들어

[Pre-Chorus]
자연 속에 풍덩 빠져들어
마음까지 자유로워져
이 느낌 계속되길 바라
영원히 이대로

[Chorus]
캠프파이어 앞에서 춤춰
별빛 샤워 속에 노래해
웃음소리 메아리 되어
밤하늘 높이 올라가
자유롭게 자유롭게
마음껏 소리쳐
오늘 밤은 우리 것이야
끝없이 빛나는 이 순간

[Bridge]
내일 일은 내일 생각해
오늘은 이 밤을 즐겨
별들도 우릴 응원해
계속 타올라 이 불꽃처럼

[Chorus]
캠프파이어 앞에서 춤춰
별빛 샤워 속에 노래해
웃음소리 메아리 되어
밤하늘 높이 올라가
자유롭게 자유롭게
마음껏 소리쳐
오늘 밤은 우리 것이야
끝없이 빛나는 이 순간

[Outro]
불빛이 서서히 꺼져가도
이 기억은 계속 빛날 거야
내일 또 다시 만나
우리만의 캠핑 파티
```

#### 2️⃣ 제목 생성 (AI → Suno API `title` 필드)

**LLM에게 전달되는 프롬프트:**

```
다음 가사에서 핵심 메시지를 추출하여 짧고 매력적인 곡 제목을 만들어주세요.

가사:
[위 가사 전문]

요구사항:
- 한국어: 2-8자 (예: "별빛 캠핑", "모닥불 밤")
- 감성적이고 기억에 남는 제목
- 가사의 핵심 테마 반영
- 이슈 키워드: 캠핑, 캠프파이어, 자연
```

**LLM이 생성한 제목:**

```
별빛 캠핑 파티
```

#### 3️⃣ 스타일 코드 생성 (API `style` 필드)

**원본 사용자 요구:**
- "즐겁고 그루브하고 힙합 스타일이 좋아"
- "너무 시끄러운 노래는 빼줘"
- "큰소리나는 악기는 작게해줘"
- "캠핑에 어울리는 스타일"

**변환 로직 (코드):**

```javascript
let styleDescription = "fun groovy hip-hop";  // 사용자 입력 기본

// 1️⃣ "캠핑" 테마 추가
styleDescription += ", acoustic guitar, campfire vibes, relaxed";

// 2️⃣ 시끄러운 요소 제외 (negativeTags 사용)
const negativeTags = "loud drums, heavy bass, distortion, aggressive";

// 3️⃣ 부드러운 악기 강조
styleDescription += ", soft percussion, gentle rhythm";

// 4️⃣ 성별 보컬 추가 (예: 여성)
styleDescription += ", female vocals";

// 5️⃣ 곡 길이 힌트 (YouTube Watch Time 최적화)
styleDescription += ", full-length track, extended song, 3-4 minutes";
```

**최종 `style` 파라미터:**

```
"fun groovy hip-hop, acoustic guitar, campfire vibes, relaxed, soft percussion, gentle rhythm, female vocals, full-length track, extended song, 3-4 minutes"
```

#### 4️⃣ 볼륨/음량 제어

**방법 1: `style` 필드에 키워드 추가**

```javascript
style += ", soft volume, quiet instruments, gentle mixing";
```

**방법 2: `negativeTags` 파라미터 사용**

```javascript
negativeTags: "loud drums, heavy bass, distortion, screaming, aggressive"
```

**방법 3: `styleWeight` & `weirdnessConstraint` 조정**

```javascript
styleWeight: 0.7,              // 스타일 강하게 준수 (0.5 → 0.7)
weirdnessConstraint: 0.2       // 실험성 낮춤 (0.5 → 0.2) = 더 안정적
```

#### 5️⃣ 최종 Suno API 호출

```javascript
await sunoClient.generateMusic({
  model: 'V5',
  customMode: true,
  instrumental: false,
  
  // 🎵 AI 생성 콘텐츠
  title: "별빛 캠핑 파티",
  prompt: "[Intro]\n밤하늘 별이 쏟아지고...",  // 위 가사 전문
  
  // 🎨 스타일 제어
  style: "fun groovy hip-hop, acoustic guitar, campfire vibes, relaxed, soft percussion, gentle rhythm, female vocals, full-length track, extended song, 3-4 minutes",
  
  // 🔧 고급 제어
  vocalGender: 'f',
  styleWeight: 0.7,              // 스타일 강하게 준수
  weirdnessConstraint: 0.2,      // 실험성 낮춤 = 안정적
  negativeTags: "loud drums, heavy bass, distortion, aggressive",
  
  // 🔗 웹훅
  callBackUrl: "https://yourdomain.com/api/webhook/suno"
});
```

#### 6️⃣ 15곡 생성 (반복)

```javascript
for (let i = 0; i < 15; i++) {
  // 각 곡마다 다른 캠핑 이슈 선택
  const campingIssues = [
    { title: "산속 캠핑", keywords: ["산", "등산", "자연"] },
    { title: "해변 캠핑", keywords: ["바다", "파도", "모래"] },
    { title: "계곡 캠핑", keywords: ["물소리", "시원함", "여름"] },
    { title: "차박 캠핑", keywords: ["자동차", "여행", "자유"] },
    { title: "글램핑", keywords: ["럭셔리", "편안함", "힐링"] },
    // ... 15개 이슈
  ];
  
  const issue = campingIssues[i];
  
  // 1. AI 가사 생성 (위 프롬프트 사용)
  const lyrics = await generateLyrics(issue, style, language, gender, i);
  
  // 2. AI 제목 생성
  const title = await generateTitle(lyrics, issue);
  
  // 3. Suno API 호출
  await sunoClient.generateMusic({
    model: 'V5',
    customMode: true,
    title: title,
    prompt: lyrics,
    style: styleDescription,
    vocalGender: (i % 2 === 0) ? 'f' : 'm',  // 여성/남성 교대
    styleWeight: 0.7,
    weirdnessConstraint: 0.2,
    negativeTags: "loud drums, heavy bass, distortion"
  });
  
  // 4. API 과부하 방지 딜레이
  await new Promise(resolve => setTimeout(resolve, 500));
}
```

---

## 4. 프롬프트 생성 파이프라인

### 전체 흐름도

```
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣ 사용자 요구사항 수집                                           │
│    - 테마: "캠핑"                                                │
│    - 스타일: "즐겁고 그루브한 힙합"                               │
│    - 제약: "시끄럽지 않게", "15곡", "한국어/영어"                 │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2️⃣ 테마 분해 (이슈 생성)                                          │
│    LLM이 "캠핑" 테마를 15개 세부 이슈로 분해:                     │
│    - 산속 캠핑, 해변 캠핑, 계곡 캠핑, 차박, 글램핑...             │
│    각 이슈마다:                                                   │
│    - title: "산속 캠핑"                                           │
│    - description: "고요한 산속에서 텐트 치고..."                   │
│    - emotionalStory: 구체적 감정 스토리                           │
│    - keywords: ["산", "자연", "평온"]                             │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3️⃣ 가사 생성 (각 이슈마다)                                        │
│    LLM에게 전달:                                                  │
│    - System: "전문 작사가 역할, 10개 섹션 구조, 800-1200자"      │
│    - User: "이슈 내용 + 스타일 + 성별 + 구조 템플릿"             │
│    LLM 응답:                                                      │
│    - [Intro] ~ [Outro] 완전한 가사                                │
│    검증:                                                          │
│    - 10개 섹션 모두 존재 확인                                     │
│    - 800자 이상 확인                                              │
│    - 재시도 (최대 3회)                                            │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4️⃣ 제목 생성                                                      │
│    LLM에게 전달:                                                  │
│    - 생성된 가사 전문                                             │
│    - 이슈 제목/키워드                                             │
│    - "2-8자 한국어 제목 생성"                                     │
│    LLM 응답:                                                      │
│    - "별빛 캠핑 파티"                                             │
│    중복 검사:                                                     │
│    - 이전 제목들과 비교                                           │
│    - 중복 시 재생성                                               │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 5️⃣ 스타일 최적화                                                  │
│    사용자 입력: "fun groovy hip-hop"                              │
│    ↓                                                              │
│    추가 처리:                                                     │
│    + "acoustic guitar, campfire vibes"  (테마 반영)              │
│    + "soft percussion, gentle rhythm"    (시끄럽지 않게)         │
│    + "female vocals"                     (성별 지정)             │
│    + "full-length track, 3-4 minutes"    (길이 힌트)             │
│    ↓                                                              │
│    금지 키워드 제거:                                              │
│    - "money chord" → "popular chord progression"                 │
│    - "instrumental" 키워드 제거                                   │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 6️⃣ Suno API 호출                                                  │
│    POST https://api.sunoapi.org/api/v1/generate                  │
│    {                                                              │
│      "model": "V5",                                               │
│      "customMode": true,                                          │
│      "title": "별빛 캠핑 파티",                                   │
│      "prompt": "[Intro]\n밤하늘 별이...",                         │
│      "style": "fun groovy hip-hop, acoustic...",                  │
│      "vocalGender": "f",                                          │
│      "styleWeight": 0.7,                                          │
│      "weirdnessConstraint": 0.2,                                  │
│      "negativeTags": "loud drums, heavy bass"                     │
│    }                                                              │
└─────────────────────────────────────────────────────────────────┘
                           ↓
┌─────────────────────────────────────────────────────────────────┐
│ 7️⃣ 상태 모니터링                                                  │
│    taskId 받음 → 폴링 시작                                        │
│    GET /generate/record-info?taskId=XXX                           │
│    - PENDING → GENERATING → SUCCESS                               │
│    - 최대 10분 대기                                               │
│    SUCCESS 시:                                                    │
│    - audioUrl: MP3 파일 다운로드                                  │
│    - duration: 곡 길이 (초)                                       │
│    - imageUrl: 앨범 커버 이미지                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 5. 스타일 코드 생성 전략

### 기본 원칙

1. **사용자 입력 100% 유지**: 사용자가 입력한 스타일을 절대 변경하지 않음
2. **테마별 추가**: 캠핑, 여행, 계절 등 테마에 맞는 키워드 추가
3. **제약 조건 반영**: "시끄럽지 않게" → soft, gentle 등 추가
4. **성별 보컬 명시**: male/female vocals 명시
5. **곡 길이 힌트**: full-length, extended, 3-4 minutes

### 테마별 스타일 키워드 예시

#### 캠핑 테마

```javascript
const campingStyleKeywords = [
  "acoustic guitar",
  "campfire vibes",
  "relaxed",
  "nature sounds",
  "folk elements",
  "gentle rhythm"
];
```

#### 여행 테마

```javascript
const travelStyleKeywords = [
  "upbeat tempo",
  "adventure feeling",
  "world music elements",
  "energetic but smooth",
  "wanderlust vibes"
];
```

#### 계절별 테마

```javascript
const seasonalKeywords = {
  spring: ["bright", "fresh", "light", "blossom vibes"],
  summer: ["energetic", "sunny", "beach vibes", "carefree"],
  autumn: ["warm", "nostalgic", "mellow", "cozy"],
  winter: ["calm", "introspective", "soft", "warm"]
};
```

### 볼륨 제어 키워드

```javascript
// 조용한 곡
const quietKeywords = [
  "soft volume",
  "gentle mixing",
  "quiet instruments",
  "low dynamics",
  "subtle",
  "delicate"
];

// 시끄러운 요소 제외
const loudExclusions = [
  "loud drums",
  "heavy bass",
  "distortion",
  "aggressive",
  "screaming",
  "harsh"
];
```

---

## 6. 언어 일관성 유지 방법

### 문제점
- 사용자가 "한국어/영어 모두 같게" 요청 시, 각 곡마다 다른 언어 사용

### 해결 방법

#### 방법 1: 언어 파라미터 명시

```javascript
for (let i = 0; i < 15; i++) {
  const language = 'korean';  // 또는 'english'
  
  const lyrics = await generateLyrics(
    style, 
    language,  // ✅ 모든 곡에 동일 언어 전달
    gender, 
    i
  );
}
```

#### 방법 2: LLM System Instruction에 명시

```javascript
const systemInstruction = `당신은 전문 작사가입니다.

⚠️ **언어 규칙 (CRITICAL)**:
- 반드시 ${targetLanguage === '한국어' ? '한국어' : 'English'} 가사만 출력!
- 다른 언어 섞지 마세요!
- 섹션 태그는 영어 ([Intro], [Verse 1]) 사용

📝 출력 예시:
[Intro]
${language === 'korean' ? '밤하늘 별이 쏟아지고' : 'Stars are falling from the night sky'}
${language === 'korean' ? '모닥불 타닥타닥 소리' : 'Crackling campfire sounds'}
...
`;
```

#### 방법 3: 후처리 검증

```javascript
function validateLanguage(lyrics, targetLanguage) {
  if (targetLanguage === 'korean') {
    // 한글 비율 확인
    const koreanChars = lyrics.match(/[가-힣]/g) || [];
    const totalChars = lyrics.replace(/[\[\]\n\s]/g, '').length;
    const koreanRatio = koreanChars.length / totalChars;
    
    if (koreanRatio < 0.5) {
      console.warn(`⚠️ 한국어 비율 낮음: ${(koreanRatio * 100).toFixed(1)}%`);
      return false;
    }
  } else {
    // 영어 비율 확인
    const englishChars = lyrics.match(/[a-zA-Z]/g) || [];
    const totalChars = lyrics.replace(/[\[\]\n\s]/g, '').length;
    const englishRatio = englishChars.length / totalChars;
    
    if (englishRatio < 0.5) {
      console.warn(`⚠️ 영어 비율 낮음: ${(englishRatio * 100).toFixed(1)}%`);
      return false;
    }
  }
  
  return true;
}
```

---

## 7. 볼륨/음량 제어 방법

### 방법 1: `style` 필드에 키워드 추가

```javascript
let style = "fun groovy hip-hop";

// 조용한 곡 만들기
style += ", soft volume, gentle mixing, quiet instruments";
style += ", subtle dynamics, low energy, calm";

// 최종
// "fun groovy hip-hop, soft volume, gentle mixing, quiet instruments, subtle dynamics, low energy, calm"
```

### 방법 2: `negativeTags` 파라미터 사용

```javascript
const negativeTags = [
  "loud drums",
  "heavy bass",
  "distortion",
  "aggressive",
  "screaming",
  "harsh",
  "intense percussion"
].join(", ");

// Suno API 호출 시
await sunoClient.generateMusic({
  // ...
  negativeTags: negativeTags,
  // ...
});
```

### 방법 3: `styleWeight` & `weirdnessConstraint` 조정

```javascript
// 조용한 곡을 원할 때
styleWeight: 0.7,              // 스타일 강하게 준수 (기본 0.5 → 0.7)
weirdnessConstraint: 0.2       // 실험성 낮춤 (기본 0.5 → 0.2)

// 더 자유로운 곡을 원할 때
styleWeight: 0.3,              // 스타일 약하게 준수
weirdnessConstraint: 0.8       // 실험성 높임
```

### 방법 4: 악기 지정

```javascript
// 조용한 악기 명시
const quietInstruments = [
  "acoustic guitar",
  "soft piano",
  "gentle strings",
  "light percussion",
  "finger snaps",
  "hand claps"
];

style += ", " + quietInstruments.join(", ");
```

### 종합 예시: 캠핑 테마 조용한 곡

```javascript
const style = [
  "fun groovy hip-hop",           // 사용자 입력
  "acoustic guitar",              // 캠핑 테마
  "campfire vibes",
  "soft volume",                  // 볼륨 제어
  "gentle mixing",
  "quiet instruments",
  "subtle dynamics",
  "female vocals",                // 성별
  "full-length track"             // 길이
].join(", ");

const negativeTags = [
  "loud drums",
  "heavy bass",
  "distortion",
  "aggressive"
].join(", ");

await sunoClient.generateMusic({
  model: 'V5',
  customMode: true,
  title: "별빛 캠핑 파티",
  prompt: lyrics,
  style: style,
  vocalGender: 'f',
  styleWeight: 0.7,               // 스타일 강하게 준수
  weirdnessConstraint: 0.2,       // 실험성 낮춤 = 안정적
  negativeTags: negativeTags
});
```

---

## 📌 핵심 요약

### 사용자 요구 → API 프롬프트 변환 체크리스트

| 사용자 요구 | 처리 방법 | API 파라미터 |
|------------|----------|-------------|
| "캠핑 가사" | LLM이 캠핑 테마 가사 생성 | `prompt` 필드 |
| "15곡" | for 루프 15회 반복 | 반복 호출 |
| "한국어/영어 일치" | `language` 변수 고정 | LLM 프롬프트 |
| "시끄럽지 않게" | soft, gentle 키워드 추가 | `style` 필드 |
| "큰 악기 작게" | loud drums 등 제외 | `negativeTags` 필드 |
| "힙합 스타일" | 사용자 입력 그대로 전달 | `style` 필드 |
| "즐겁고 그루브한" | fun, groovy 키워드 유지 | `style` 필드 |

### 최종 코드 예시 (완전한 파이프라인)

```javascript
// 1. 사용자 요구사항
const userRequest = {
  theme: "캠핑",
  style: "즐겁고 그루브한 힙합",
  constraints: ["시끄럽지 않게", "큰소리 악기 작게"],
  count: 15,
  language: "korean"  // 또는 "english"
};

// 2. 15곡 생성 루프
for (let i = 0; i < userRequest.count; i++) {
  // 3. 캠핑 이슈 선택
  const campingIssues = [
    { title: "산속 캠핑", description: "...", keywords: ["산", "자연"] },
    { title: "해변 캠핑", description: "...", keywords: ["바다", "파도"] },
    // ... 15개
  ];
  const issue = campingIssues[i];
  
  // 4. AI 가사 생성
  const lyrics = await generateLyrics(
    issue, 
    userRequest.style, 
    userRequest.language, 
    'auto',  // 성별 자동 (여성/남성 교대)
    i
  );
  
  // 5. AI 제목 생성
  const title = await generateTitle(lyrics, issue, userRequest.language, i);
  
  // 6. 스타일 최적화
  let style = userRequest.style;  // "즐겁고 그루브한 힙합"
  
  // 테마 추가
  style += ", acoustic guitar, campfire vibes, relaxed";
  
  // 제약 반영
  style += ", soft volume, gentle mixing, quiet instruments";
  
  // 성별 추가
  const gender = (i % 2 === 0) ? 'female' : 'male';
  style += `, ${gender} vocals`;
  
  // 길이 힌트
  style += ", full-length track, extended song, 3-4 minutes";
  
  // 7. negativeTags 생성
  const negativeTags = "loud drums, heavy bass, distortion, aggressive";
  
  // 8. Suno API 호출
  const result = await sunoClient.generateMusic({
    model: 'V5',
    customMode: true,
    instrumental: false,
    title: title,
    prompt: lyrics,
    style: style,
    vocalGender: gender === 'female' ? 'f' : 'm',
    styleWeight: 0.7,
    weirdnessConstraint: 0.2,
    negativeTags: negativeTags,
    callBackUrl: "https://yourdomain.com/api/webhook/suno"
  });
  
  console.log(`✅ ${i+1}/${userRequest.count} 곡 생성 요청: ${result.taskId}`);
  
  // 9. API 과부하 방지
  await new Promise(resolve => setTimeout(resolve, 500));
}
```

---

## 🎓 학습 포인트

1. **Suno API는 `style` 필드가 핵심**: 장르, 악기, 분위기, 볼륨까지 모두 텍스트로 제어
2. **`negativeTags`로 원하지 않는 요소 제외**: "loud", "aggressive" 등
3. **`styleWeight` & `weirdnessConstraint`로 미세 조정**: 스타일 준수 vs 창의성
4. **Custom Mode 필수**: AI가 생성한 가사를 100% 제어
5. **언어 일관성은 LLM 프롬프트로 해결**: System Instruction에 명시
6. **곡 길이는 가사 길이와 style 힌트로 제어**: 800-1200자 + "full-length, 3-4 minutes"

---

**작성일**: 2026-05-21  
**작성자**: GenSpark AI Developer  
**버전**: 1.0
