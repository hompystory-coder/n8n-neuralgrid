# 📂 메뉴별 결과 독립 저장 & 수동 초기화

## 🎯 개요

메뉴 간 이동 시 **이전 결과가 자동으로 초기화되지 않고**, 각 메뉴별로 **독립적으로 결과를 저장**하여 사용자 경험을 개선합니다.

---

## ⚠️ 기존 문제점

### 문제 1: 자동 초기화
```
텍스트 프롬프트에서 5개 가사 생성 ✅
→ 샘플 가사 메뉴로 이동
→ 이전 5개 가사가 모두 사라짐 ❌
```

### 문제 2: 사용자 혼란
- 메뉴를 전환할 때마다 이전 작업이 사라짐
- 다시 돌아가도 결과가 없음
- 여러 메뉴를 비교할 수 없음

---

## ✅ 해결 방법

### 1️⃣ 메뉴별 독립적인 저장소

```javascript
// 각 메뉴별로 독립적인 결과 저장
let lyricsResults = {
    prompt: [],      // 텍스트 프롬프트 결과
    sample: [],      // 샘플 가사 결과
    reference: []    // 레퍼런스 음악 결과
};

let selectedLyricsIndex = {
    prompt: null,
    sample: null,
    reference: null
};
```

### 2️⃣ 헬퍼 함수

```javascript
// 현재 메뉴의 결과를 반환
function getCurrentLyrics() {
    return lyricsResults[selectedMethod];
}

// 현재 메뉴에 결과 저장
function setCurrentLyrics(lyrics) {
    lyricsResults[selectedMethod] = lyrics;
}

// 현재 메뉴의 선택 인덱스
function getCurrentSelectedIndex() {
    return selectedLyricsIndex[selectedMethod];
}

// 선택 인덱스 저장
function setCurrentSelectedIndex(index) {
    selectedLyricsIndex[selectedMethod] = index;
}
```

### 3️⃣ 메뉴 전환 시 자동 불러오기

```javascript
// 메뉴 전환 시 저장된 결과 표시
function displayCurrentMenuResults() {
    const currentLyrics = getCurrentLyrics();
    
    if (currentLyrics.length > 0) {
        // 저장된 결과가 있으면 표시
        displayGeneratedLyrics(currentLyrics);
        console.log(`✅ ${selectedMethod} 메뉴의 저장된 ${currentLyrics.length}개 결과를 불러왔습니다.`);
    } else {
        // 결과가 없으면 프리뷰 숨기기
        const preview = document.getElementById('lyricsPreview');
        preview.classList.remove('active');
        preview.innerHTML = '';
    }
}
```

### 4️⃣ 수동 초기화 버튼

```javascript
function clearCurrentMenu() {
    const currentLyrics = getCurrentLyrics();
    
    // 결과가 없으면 알림
    if (currentLyrics.length === 0) {
        showNotification('초기화할 결과가 없습니다.', 'info');
        return;
    }
    
    // 확인 대화상자
    if (!confirm(`현재 메뉴의 ${currentLyrics.length}개 가사를 모두 초기화하시겠습니까?`)) {
        return;
    }
    
    // 현재 메뉴만 초기화
    setCurrentLyrics([]);
    setCurrentSelectedIndex(null);
    
    // UI 초기화
    const preview = document.getElementById('lyricsPreview');
    preview.classList.remove('active');
    preview.innerHTML = '';
    
    showNotification('🔄 현재 메뉴가 초기화되었습니다.', 'success');
}
```

---

## 🎨 UI 변경사항

### 버튼 텍스트 변경

**Before:**
```html
<button class="btn btn-secondary" onclick="resetStep1()">초기화</button>
```

**After:**
```html
<button class="btn btn-secondary" onclick="clearCurrentMenu()">🔄 현재 메뉴 초기화</button>
```

---

## 🔄 동작 흐름

### 시나리오 1: 텍스트 프롬프트 → 샘플 가사

```
1. 텍스트 프롬프트에서 3개 가사 생성
   → lyricsResults.prompt = [가사1, 가사2, 가사3]

2. 샘플 가사 메뉴로 이동
   → displayCurrentMenuResults() 호출
   → lyricsResults.sample = [] (비어있음)
   → 프리뷰 숨김

3. 샘플 가사에서 2개 생성
   → lyricsResults.sample = [가사A, 가사B]

4. 다시 텍스트 프롬프트로 이동
   → displayCurrentMenuResults() 호출
   → lyricsResults.prompt = [가사1, 가사2, 가사3] ✅
   → 이전 결과가 그대로 표시됨!
```

### 시나리오 2: 수동 초기화

```
1. 텍스트 프롬프트에 5개 가사 저장됨
   → lyricsResults.prompt = [가사1, ..., 가사5]

2. "🔄 현재 메뉴 초기화" 버튼 클릭
   → 확인 대화상자 표시: "5개 가사를 초기화하시겠습니까?"

3. "확인" 클릭
   → lyricsResults.prompt = []
   → selectedLyricsIndex.prompt = null
   → 프리뷰 숨김
   → 알림: "🔄 현재 메뉴가 초기화되었습니다."

4. 샘플 가사 메뉴로 이동
   → lyricsResults.sample은 그대로 유지됨 ✅
```

---

## 📊 개선 전후 비교

| 기능 | Before | After |
|-----|--------|-------|
| 메뉴 전환 | 자동 초기화 ❌ | 결과 유지 ✅ |
| 결과 보관 | 하나의 배열 | 메뉴별 독립 저장 |
| 초기화 방식 | 자동 (메뉴 클릭 시) | 수동 (버튼 클릭 시) |
| 확인 절차 | 없음 | 확인 대화상자 있음 |
| 사용자 제어 | 낮음 | 높음 ✅ |

---

## 🧪 테스트 방법

### 1. 메뉴별 독립 저장 테스트

```
1. 텍스트 프롬프트에서 3개 가사 생성
2. 샘플 가사로 이동 (비어있음 확인)
3. 샘플 가사에서 2개 생성
4. 레퍼런스 음악으로 이동 (비어있음 확인)
5. 텍스트 프롬프트로 돌아가기
   → ✅ 처음 생성한 3개가 그대로 있어야 함
6. 샘플 가사로 이동
   → ✅ 2개 가사가 그대로 있어야 함
```

### 2. 수동 초기화 테스트

```
1. 텍스트 프롬프트에서 5개 생성
2. "🔄 현재 메뉴 초기화" 클릭
3. 확인 대화상자에서 "취소" 클릭
   → ✅ 가사가 그대로 유지되어야 함
4. 다시 "🔄 현재 메뉴 초기화" 클릭
5. 확인 대화상자에서 "확인" 클릭
   → ✅ 가사가 모두 사라지고 프리뷰 숨김
```

### 3. 빈 메뉴 초기화 시도

```
1. 새로운 메뉴 (결과 없음)
2. "🔄 현재 메뉴 초기화" 클릭
   → ✅ "초기화할 결과가 없습니다." 알림 표시
```

---

## 🚀 사용 방법

### 웹 UI 접속
```
https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow
```

### 1단계: 여러 메뉴에서 가사 생성
```
📝 텍스트 프롬프트
- 프롬프트 입력: "봄날의 설렘"
- 수량: 3개
- 🎵 가사 생성하기 클릭

💡 샘플 가사
- 기존 가사 붙여넣기
- 수량: 2개
- 🎵 가사 생성하기 클릭

🎵 레퍼런스 음악
- YouTube URL 입력
- 수량: 1개
- 🎵 가사 생성하기 클릭
```

### 2단계: 메뉴 간 자유롭게 이동
```
✅ 각 메뉴의 결과가 독립적으로 유지됨
✅ 언제든지 다시 돌아가서 확인 가능
```

### 3단계: 필요 시 수동 초기화
```
🔄 현재 메뉴 초기화 버튼 클릭
→ 확인 대화상자에서 "확인"
→ 현재 메뉴만 초기화됨
```

---

## 💾 저장 구조 예시

```javascript
// 사용자가 다양한 메뉴에서 작업한 경우
lyricsResults = {
    prompt: [
        { id: 1, title: "봄날의 노래 / Spring Song", lyricsKo: "...", lyricsEn: "..." },
        { id: 2, title: "설렘의 시작 / Beginning of Excitement", lyricsKo: "...", lyricsEn: "..." },
        { id: 3, title: "따뜻한 햇살 / Warm Sunshine", lyricsKo: "...", lyricsEn: "..." }
    ],
    sample: [
        { id: 4, title: "사랑의 노래 변주 1 / Love Song Variation 1", lyricsKo: "...", lyricsEn: "..." },
        { id: 5, title: "사랑의 노래 변주 2 / Love Song Variation 2", lyricsKo: "...", lyricsEn: "..." }
    ],
    reference: [
        { id: 6, title: "비슷한 느낌의 곡 / Similar Feeling Song", lyricsKo: "...", lyricsEn: "..." }
    ]
}

selectedLyricsIndex = {
    prompt: 1,    // 두 번째 가사 선택됨
    sample: 0,    // 첫 번째 가사 선택됨
    reference: null  // 아직 선택 안 함
}
```

---

## 🎯 핵심 개선 사항

### ✅ 사용자 경험 개선
- ❌ Before: 메뉴 이동 시 작업 손실
- ✅ After: 모든 메뉴의 작업 보존

### ✅ 유연한 초기화
- ❌ Before: 자동 강제 초기화
- ✅ After: 사용자가 원할 때만 초기화

### ✅ 명확한 피드백
- ✅ 확인 대화상자로 실수 방지
- ✅ 알림 메시지로 상태 확인

### ✅ 데이터 안전성
- ✅ 메뉴별 독립 저장으로 데이터 보호
- ✅ 실수로 인한 데이터 손실 방지

---

## 📝 관련 커밋

```bash
aa2da0c feat: 메뉴별 결과 독립 저장 & 수동 초기화
5af5ef7 fix: 메뉴 전환 시 이전 결과 초기화 (이전 버전)
```

---

## 🎉 결론

✅ **메뉴별 독립 저장**: 각 메뉴의 결과가 독립적으로 유지됨  
✅ **자동 불러오기**: 메뉴 이동 시 저장된 결과 자동 표시  
✅ **수동 초기화**: 사용자가 원할 때만 초기화 가능  
✅ **확인 절차**: 실수로 인한 데이터 손실 방지  
✅ **향상된 UX**: 더 자유롭고 안전한 작업 환경

**모든 요구사항이 완벽하게 구현되었습니다!** 🎊
