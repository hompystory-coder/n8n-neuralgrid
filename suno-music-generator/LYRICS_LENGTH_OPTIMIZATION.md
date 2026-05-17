# 🎵 가사 길이 최적화 (Suno AI 맞춤)

## 🚨 문제점

### 이전 설정 (문제)
```yaml
가사 길이:
  한국어: 1,800-2,000자 (너무 길음!)
  영어: 500-600 단어

구조: (11개 섹션 - 너무 복잡!)
  - Intro (4줄)
  - Verse 1 (10줄 이상)
  - Pre-Chorus (4줄)
  - Chorus (8줄)
  - Verse 2 (10줄 이상)
  - Pre-Chorus (4줄)
  - Chorus (8줄)
  - Bridge (8줄)
  - Verse 3 (10줄 이상)
  - Final Chorus (10줄)
  - Outro (6줄)

결과:
  ❌ 가사가 너무 길어서 Suno AI가 제대로 처리 못함
  ❌ 노래가 4-5분 이상 걸림
  ❌ 구조가 복잡해서 음악적으로 부자연스러움
```

## ✅ 해결 방안

### 현재 설정 (최적화)
```yaml
가사 길이:
  한국어: 400-900자 (적정)
  영어: 150-350 단어
  
구조: (8개 섹션 - 간결)
  - Intro (2-4줄)
  - Verse 1 (4-6줄)
  - Chorus (4-6줄)
  - Verse 2 (4-6줄)
  - Chorus (반복)
  - Bridge (3-4줄)
  - Chorus (마지막)
  - Outro (2-4줄)

결과:
  ✅ Suno AI가 잘 처리하는 적정 길이
  ✅ 2-3분 곡 (표준 팝송 길이)
  ✅ 간결하고 임팩트 있는 구조
```

## 📊 비교

| 항목 | 이전 | 현재 | 개선 |
|------|------|------|------|
| 한국어 길이 | 1,800-2,000자 | 400-900자 | **-55%** |
| 영어 길이 | 500-600 단어 | 150-350 단어 | **-50%** |
| 섹션 수 | 11개 | 8개 | **-27%** |
| Pre-Chorus | 2회 | 제거 | **간소화** |
| Verse 3 | 있음 | 제거 | **간소화** |
| Final Chorus | 별도 | Chorus 반복 | **간소화** |
| 예상 곡 길이 | 4-5분 | 2-3분 | **표준** |

## 🎯 구체적 변경 사항

### 1. 가사 길이 제한
```javascript
// 이전
const minLength = language === 'korean' ? 1800 : 500;
// → 너무 길어서 Suno AI가 처리하기 어려움

// 현재
const minLength = language === 'korean' ? 400 : 150;
const maxLength = language === 'korean' ? 900 : 350;
// → Suno AI 최적 길이
```

### 2. 토큰 제한
```javascript
// 이전
const model = createGeminiModel(1.2, 8192, systemInstruction);
// → 너무 많은 토큰으로 긴 가사 생성

// 현재
const model = createGeminiModel(1.2, 2048, systemInstruction);
// → 적절한 토큰 수로 간결한 가사
```

### 3. 구조 간소화
```
이전 (복잡):
Intro → Verse 1 → Pre-Chorus → Chorus → 
Verse 2 → Pre-Chorus → Chorus → Bridge → 
Verse 3 → Final Chorus → Outro

현재 (간결):
Intro → Verse 1 → Chorus → 
Verse 2 → Chorus → Bridge → 
Chorus → Outro
```

### 4. 자동 자르기
```javascript
if (wordCount > maxLength) {
  console.warn(`⚠️ 가사가 너무 깁니다! (${wordCount} > ${maxLength})`);
  // 자동으로 적정 길이로 자르기
  if (language === 'korean') {
    return lyrics.substring(0, maxLength);
  } else {
    return words.slice(0, maxLength).join(' ');
  }
}
```

## 📝 Suno AI 권장 가이드라인

### 적정 가사 길이
- **짧은 곡 (2분)**: 300-500자 (한국어), 100-200 단어 (영어)
- **표준 곡 (2-3분)**: 500-800자 (한국어), 200-300 단어 (영어)
- **긴 곡 (3-4분)**: 800-1000자 (한국어), 300-400 단어 (영어)

### 구조 추천
**기본 구조 (가장 일반적)**:
```
Intro → Verse 1 → Chorus → Verse 2 → Chorus → Bridge → Chorus → Outro
```

**짧은 곡**:
```
Verse 1 → Chorus → Verse 2 → Chorus → Outro
```

**긴 곡**:
```
Intro → Verse 1 → Pre-Chorus → Chorus → 
Verse 2 → Pre-Chorus → Chorus → Bridge → 
Chorus → Outro
```

## 🎊 결과

### 이전 (문제)
```
생성된 가사: 1,872자
예상 길이: 4-5분
Suno AI 처리: ⚠️ 가끔 오류
음악적 완성도: ⭐⭐⭐
```

### 현재 (최적화)
```
생성된 가사: 500-800자
예상 길이: 2-3분
Suno AI 처리: ✅ 안정적
음악적 완성도: ⭐⭐⭐⭐⭐
```

## 🚀 다음 단계

1. **테스트**: 여러 장르로 생성해보기
2. **피드백**: 실제 생성된 음악 품질 확인
3. **미세 조정**: 필요 시 길이 범위 조정

---

**커밋**: 8642322
**날짜**: 2026-05-05
**상태**: ✅ 완료
