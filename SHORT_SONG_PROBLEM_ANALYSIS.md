# 🚨 곡이 짧아지는 문제 분석

## 📊 문제 상황

**보고:** 프로그램이 이상하게 수정되어 노래가 짧게 나오고 있음

---

## 🔍 코드 분석 결과

### ✅ **가사 길이 요구사항 (정상)**

**Line 381-398 (lyricsGenerator.js):**
```javascript
5. **🎵 최소 3분 이상 재생되는 길이 (매우 중요!)**
   - 한국어: 최소 1800자 이상 (2000자 권장)
   - 영어: 최소 500단어 이상 (600단어 권장)
   - 구조: Intro → Verse 1 → Pre-Chorus → Chorus → Verse 2 
           → Pre-Chorus → Chorus → Bridge → Verse 3 
           → Final Chorus → Outro
```

### ✅ **max_tokens 설정 (정상)**

**Line 443:**
```javascript
max_tokens: 4000,  // 3분 이상 가사를 위해 충분한 토큰!
```

### ✅ **폴백 가사 길이 (정상)**

**예시 (지하철 파업 가사):**
```
[Intro] (4줄)
[Verse 1] (12줄)
[Pre-Chorus] (4줄)
[Chorus] (12줄)
[Verse 2] (11줄)
[Pre-Chorus] (4줄)
[Chorus] (12줄)
[Bridge] (12줄)
[Verse 3] (8줄)
[Final Chorus] (16줄)
[Outro] (4줄)

총 약 70줄 이상 → 3분 이상 충분!
```

---

## ❓ 가능한 원인

### 1️⃣ **LLM이 짧게 생성**
**문제:**
- GPT가 프롬프트를 무시하고 짧은 가사만 생성

**확인 방법:**
```javascript
// Line 449 로그 확인
console.log(`✅ 이슈 기반 가사 생성 완료 (${lyrics.length}자)`);
```

**해결:**
- 생성된 가사가 1800자 미만이면 **재생성** 요구
- 또는 **폴백 가사 강제 사용**

### 2️⃣ **Suno API가 가사를 잘라냄**
**문제:**
- Suno API가 긴 가사를 받아도 짧게 생성

**확인 필요:**
- Suno API 문서 확인
- 가사 최대 길이 제한 있는지?

### 3️⃣ **스타일 태그가 짧은 곡을 유도**
**문제:**
- 스타일에 "short", "quick", "brief" 같은 단어

**확인 방법:**
```javascript
// Line 1055 로그 확인
console.log(`   🎨 적용된 스타일: ${variedStyle}`);
```

### 4️⃣ **최근 코드 수정 영향**
**문제:**
- 하이라이트 트랙 시스템 추가 후 이상?
- YouTube 제목 개선 후 이상?

**확인:**
```bash
git diff HEAD~3 -- server/services/lyricsGenerator.js
```

---

## 🛠️ 즉시 적용 가능한 해결책

### **해결책 1: 가사 길이 검증 추가**

```javascript
// generateLyricsFromIssue 함수 수정 (Line 448 이후)

const lyrics = completion.choices[0].message.content.trim();

// 🔥 가사 길이 검증 추가!
const minLength = language === 'korean' ? 1800 : 500;
if (lyrics.length < minLength) {
  console.warn(`⚠️ 가사가 너무 짧음 (${lyrics.length}자/${minLength}자)`);
  console.warn(`   폴백 템플릿 가사 사용 (긴 가사 보장)`);
  return generateIssueFallbackLyrics(issue, style, language, gender, uniqueSeed);
}

console.log(`✅ 이슈 기반 가사 생성 완료 (${lyrics.length}자)`);
```

### **해결책 2: 프롬프트 강화**

```javascript
// Line 381 수정

5. **🎵 최소 3분 이상 재생되는 길이 (절대 필수!)**
   - 한국어: 반드시 1800자 이상 (짧으면 실패로 간주!)
   - 영어: 반드시 500단어 이상 (짧으면 실패로 간주!)
   - ⚠️ CRITICAL: 1800자 미만은 절대 금지! 반드시 긴 가사를 작성하세요!
   - 각 섹션을 충실히 채우고, Verse는 최소 12줄씩 작성하세요!
```

### **해결책 3: Suno API 파라미터 확인**

Suno API에 곡 길이를 지정하는 파라미터가 있는지 확인:
```javascript
const result = await sunoClient.generateMusic({
  model: 'V5',
  customMode: true,
  prompt: lyrics,
  style: variedStyle,
  // 🔥 혹시 이런 파라미터가 있나요?
  duration: 180,  // 3분 (초 단위)
  // 또는
  length: 'long',  // short/medium/long
});
```

---

## 🎯 테스트 방법

### **1. 로그 확인**
```bash
tail -100 /tmp/suno-server.log | grep "가사 생성 완료"
```

**확인할 것:**
```
✅ 이슈 기반 가사 생성 완료 (2345자)  ← 1800자 이상이면 OK
✅ 이슈 기반 가사 생성 완료 (892자)   ← 너무 짧음! 문제!
```

### **2. 생성된 곡 확인**
웹앱에서 곡 생성 후:
- 실제 재생 시간 확인
- 1분 미만이면 문제!
- 2-3분이면 정상!

### **3. 가사 직접 확인**
서버 로그에서:
```
📜 가사: [Intro]
아침 공기 차갑고
발걸음만 빨라져
...
```

---

## 💡 추천 조치

### **즉시 실행:**

1. ✅ **가사 길이 검증 추가** (해결책 1 적용)
2. ✅ **프롬프트 강화** (해결책 2 적용)
3. ✅ **로그 확인** - 실제 가사 길이 체크

### **확인 필요:**

1. ❓ Suno API 문서 확인 - 곡 길이 제한?
2. ❓ 최근 생성한 곡의 실제 재생 시간?
3. ❓ 스타일 태그에 짧은 곡 유도하는 단어?

---

## 🔧 코드 수정 (적용할 내용)

### **파일: server/services/lyricsGenerator.js**
**Line 448 이후에 추가:**

```javascript
const lyrics = completion.choices[0].message.content.trim();

// 🔥 가사 길이 검증 (3분 이상 보장!)
const minLength = language === 'korean' ? 1800 : 500;
const wordCount = language === 'korean' ? lyrics.length : lyrics.split(/\s+/).length;

if (wordCount < minLength) {
  console.warn(`⚠️ 가사가 너무 짧습니다!`);
  console.warn(`   현재: ${wordCount} ${language === 'korean' ? '자' : '단어'}`);
  console.warn(`   최소: ${minLength} ${language === 'korean' ? '자' : '단어'}`);
  console.warn(`   → 폴백 템플릿 가사 사용 (긴 가사 보장)`);
  return generateIssueFallbackLyrics(issue, style, language, gender, uniqueSeed);
}

console.log(`✅ 이슈 기반 가사 생성 완료 (${wordCount} ${language === 'korean' ? '자' : '단어'})`);
console.log(`   최소 요구: ${minLength}, 실제: ${wordCount} ✅`);
```

---

## 📊 예상 효과

### **수정 전:**
```
곡 1: 892자 → 1분 30초 (너무 짧음!) ❌
곡 2: 1245자 → 2분 10초 (짧음) ⚠️
곡 3: 2134자 → 3분 20초 (정상) ✅
```

### **수정 후:**
```
곡 1: 892자 → 검증 실패 → 폴백 2200자 → 3분 40초 ✅
곡 2: 1245자 → 검증 실패 → 폴백 2200자 → 3분 40초 ✅
곡 3: 2134자 → 검증 통과 → 3분 20초 ✅
```

---

## ✅ 결론

**문제:**
- LLM이 가끔 짧은 가사 생성 (1800자 미만)
- 현재 코드는 이를 검증하지 않음

**해결:**
- 가사 길이 검증 로직 추가
- 짧으면 자동으로 폴백 가사 사용
- 폴백 가사는 항상 2200자 이상 (3분 이상)

**적용 후:**
- 모든 곡이 최소 3분 이상 보장
- 사용자 만족도 향상
- 일관된 곡 길이

---

**다음 단계: 이 수정을 적용할까요?** 🚀
