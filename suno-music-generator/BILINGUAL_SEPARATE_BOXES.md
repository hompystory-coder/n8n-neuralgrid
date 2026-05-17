# 🎵 한글/영어 가사 분리 박스 UI

## ✅ 구현 완료

### 요청사항
> "영어가사는 한글가사와 함께있으면안되고 따로 한글박스옆에 영어박스로 만들어줘"

**완료**: 한글 가사와 영어 가사를 **별도의 박스**로 나누어 **나란히** 표시합니다!

---

## 🌐 접속 URL
**웹 UI**: https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow

---

## 📸 UI 레이아웃

```
┌─────────────────────────────────────────────────────┐
│  제목: 미소의 노래 / Smile Song                     │
├─────────────────────┬───────────────────────────────┤
│  🇰🇷 한글 가사      │  🇺🇸 English Lyrics          │
├─────────────────────┼───────────────────────────────┤
│ [Verse 1]           │ [Verse 1]                     │
│ 처음 봄날의을       │ first spring moment           │
│ 마주한 그 순간      │ the moment we met             │
│ 세상이 멈춘 것      │ the world seemed to stop      │
│ 같았어              │ it felt like                  │
│                     │                               │
│ [Chorus]            │ [Chorus]                      │
│ 미소 짓게 해,       │ make me smile,                │
│ 설레는 마음         │ fluttering heart              │
│ 이 봄날의이         │ this spring day               │
│ 영원하길            │ may it be forever             │
│                     │                               │
│ ...                 │ ...                           │
└─────────────────────┴───────────────────────────────┘
```

---

## 🎨 디자인 특징

### 1. Grid 레이아웃
```css
display: grid;
grid-template-columns: 1fr 1fr;  /* 50% : 50% */
gap: 20px;                        /* 박스 사이 간격 */
```

### 2. 개별 박스 스타일
```css
.lyrics-box {
    background: rgba(255, 255, 255, 0.02);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 20px;
}
```

### 3. 박스 헤더
```
🇰🇷 한글 가사       🇺🇸 English Lyrics
━━━━━━━━━━━━━━━━   ━━━━━━━━━━━━━━━━━
```

### 4. Hover 효과
- 마우스 오버 시 배경색 변경
- 보더 색상 Purple 강조 (`rgba(168, 85, 247, 0.3)`)

### 5. 모바일 반응형
```css
@media (max-width: 768px) {
    grid-template-columns: 1fr;  /* 768px 이하에서 세로 배치 */
}
```

---

## 🔧 백엔드 구조

### API 응답 형식
```json
{
  "success": true,
  "count": 1,
  "lyrics": [
    {
      "id": 1234567890,
      "title": "미소의 노래 / Smile Song",
      "lyrics": "[전체 가사 - 하위 호환성]",
      "lyricsKo": "[Verse 1]\n처음 봄날의을...",
      "lyricsEn": "[Verse 1]\nfirst spring moment...",
      "suggestedTitles": [
        "미소의 노래 / Smile Song",
        "설레는 마음 / Fluttering Heart",
        "봄날의 약속 / Spring Day Promise"
      ]
    }
  ]
}
```

### 필드 설명
- **lyrics**: 하위 호환성을 위한 전체 가사 (기존 코드 지원)
- **lyricsKo**: 한글 가사만 (새로운 UI에서 사용)
- **lyricsEn**: 영어 가사만 (새로운 UI에서 사용)

---

## 📊 비교표

| 항목 | 이전 | 개선 후 |
|------|------|---------|
| **가사 표시** | 한글\|영어 혼합 | **한글 / 영어 분리** |
| **레이아웃** | 단일 박스 | **2개 박스 나란히** |
| **가독성** | 보통 (혼합으로 가독성 저하) | **우수 (명확히 분리)** |
| **언어 전환** | 불가능 | **각 박스에서 독립적으로 확인** |
| **모바일 지원** | 없음 | **반응형 (세로 배치)** |

---

## 🚀 사용 방법

### 1. 웹 UI에서 가사 생성
```
1. https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow 접속
2. 프롬프트 입력 (예: "봄날의 설렘을 담은 노래")
3. 수량 선택 (1~50개)
4. "가사 생성" 버튼 클릭
```

### 2. 결과 확인
```
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
제목: 미소의 노래 / Smile Song

┌─────────────────────┬───────────────────────┐
│  🇰🇷 한글 가사      │  🇺🇸 English Lyrics  │
│                     │                       │
│  [Verse 1]          │  [Verse 1]            │
│  처음 봄날의을...   │  first spring...      │
│  ...                │  ...                  │
└─────────────────────┴───────────────────────┘

💡 추천 제목:
  ⭐ 미소의 노래 / Smile Song
  ◯ 설레는 마음 / Fluttering Heart
  ◯ 봄날의 약속 / Spring Day Promise

[✏️ 편집] [🗑️ 삭제] [✅ 선택]
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## 💻 코드 구조

### Frontend (HTML/CSS/JS)
```html
<div class="lyrics-bilingual-container">
    <!-- 한글 박스 -->
    <div class="lyrics-box">
        <div class="lyrics-box-header">
            <span class="lyrics-box-icon">🇰🇷</span>
            <span class="lyrics-box-title">한글 가사</span>
        </div>
        <div class="lyrics-box-content">
            ${lyricsKo}
        </div>
    </div>
    
    <!-- 영어 박스 -->
    <div class="lyrics-box">
        <div class="lyrics-box-header">
            <span class="lyrics-box-icon">🇺🇸</span>
            <span class="lyrics-box-title">English Lyrics</span>
        </div>
        <div class="lyrics-box-content">
            ${lyricsEn}
        </div>
    </div>
</div>
```

### Backend (Node.js)
```javascript
// parseLyricsResponse() 함수에서 한영 분리
const lyricsKo = lyricsKoMatch ? lyricsKoMatch[1].trim() : '';
const lyricsEn = lyricsEnMatch ? lyricsEnMatch[1].trim() : '';

return {
  lyrics: lyricsKo,      // 하위 호환
  lyricsKo: lyricsKo,    // 한글 전용
  lyricsEn: lyricsEn,    // 영어 전용
  titles: titles
};
```

---

## 📝 주요 변경사항

### 1. 백엔드 (`server/services/openaiService.js`)
- ✅ `parseLyricsResponse()` 함수 수정
  - `lyricsKo` 필드 추가
  - `lyricsEn` 필드 추가
  - 기존 `lyrics` 필드 유지 (하위 호환성)

- ✅ `generateLyrics()` 함수 수정
  - results에 `lyricsKo`, `lyricsEn` 포함

### 2. 프론트엔드 (`client/workflow.html`)
- ✅ CSS 추가
  - `.lyrics-bilingual-container` (Grid 레이아웃)
  - `.lyrics-box` (개별 박스 스타일)
  - `.lyrics-box-header` (헤더 영역)
  - `.lyrics-box-content` (내용 영역)
  - 모바일 반응형 미디어쿼리

- ✅ JavaScript 수정
  - `displayGeneratedLyrics()` 함수 리팩토링
  - 한영 박스 렌더링 로직 추가

---

## 🎯 주요 장점

### 1. 가독성 향상
- ❌ 이전: `처음 봄날의을 | first spring moment`
- ✅ 개선: 한글과 영어가 **별도 박스**에 깔끔하게 분리

### 2. 비교 용이
- 한글 가사와 영어 가사를 **나란히** 비교 가능
- 번역 품질 확인에 최적화

### 3. 프로페셔널한 디자인
- Glassmorphism 스타일
- Hover 효과로 인터랙티브한 UX
- 국기 아이콘으로 직관적인 언어 구분

### 4. 확장 가능
- 추후 다른 언어 추가 가능 (일본어, 중국어 등)
- Grid 레이아웃으로 유연한 확장

---

## ✅ 체크리스트

- [x] 한글 가사 별도 필드 (`lyricsKo`)
- [x] 영어 가사 별도 필드 (`lyricsEn`)
- [x] Grid 레이아웃 (2컬럼)
- [x] 개별 박스 스타일
- [x] 국기 아이콘 추가
- [x] Hover 효과
- [x] 모바일 반응형
- [x] 하위 호환성 유지 (`lyrics` 필드)
- [x] API 테스트 완료
- [x] 웹 UI 테스트 완료
- [x] Git 커밋 완료

---

## 🎉 결론

이제 **한글 가사와 영어 가사가 별도의 박스**로 나누어져 **나란히 표시**됩니다!

**웹 UI에서 직접 확인해보세요**:  
👉 https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow

---

**작성일**: 2026-04-21  
**버전**: 2.1.0  
**커밋**: 4dfd4d7
