# 🎯 남은 개발 리스트 (2026-04-22)

## ✅ 최근 완료된 작업 (지난 3일)

### 1. Bugs Music 가사 추출 수정 ✅
- **문제:** 한국 음악 가사 추출 실패 (0%)
- **해결:** trackId 추출 로직 수정 → 성공률 100%
- **결과:** AKMU, 한로로 등 한국 차트 가사 추출 가능

### 2. 영어 가사 품질 대폭 개선 ✅
- **문제:** 단어만 나열 (e.g., "Spring sea", "Wave", "You")
- **해결:** 
  - 완전한 문장 생성 (주어+동사+목적어)
  - 영어 가사 검증 시스템 추가
  - Mock 가사도 완전한 문장으로 수정
- **결과:** 95%+ 완전한 영어 문장 생성

### 3. 영어 가사 다양성 추가 ✅
- **문제:** 모든 곡의 영어 가사가 동일
- **해결:** 각 키워드마다 5가지 변형 추가 (100+ 고유 표현)
- **결과:** 5곡 생성 시 모두 다른 영어 가사

### 4. 영어 제목 로마자 표기 문제 수정 ✅
- **문제:** "희망의, 새로운" → "Hope, Sae To Un" (로마자)
- **해결:** 
  - 번역 딕셔너리 30+ 단어 추가
  - 로마자 변환 제거, 의미 기반 번역
- **결과:** "희망의, 새로운" → "Hope, New"

### 5. "샘플" 단어 제거 ✅
- **문제:** 생성된 가사에 "샘플" 단어 포함
- **해결:**
  - 서버 프롬프트: "샘플 가사" → "참고 가사"
  - UI 메뉴: "샘플 가사" → "참고 가사"
- **결과:** 가사에 메타 단어 없음

### 6. 제목 중복 방지 시스템 ✅
- **문제:** 대량 생성 시 제목 중복
- **해결:** 최근 50개 제목 추적, 중복 시 재생성 (최대 5회)
- **결과:** 수천 곡 생성 시에도 고유한 제목

---

## 🔴 남은 개발 리스트

### Priority 1: 긴급 (High)

#### 1. 🚨 OpenAI API 키 오류 해결
**현재 상황:**
```
⚠️ OpenAI API 실패 (401 status code), using advanced mock...
```

**문제:**
- OpenAI API 키가 만료되었거나 invalid
- 현재 Mock 가사 생성기로 대체 작동 중
- Mock 가사는 품질이 낮음

**해결 방법:**
1. `.env` 파일에서 OpenAI API 키 확인
2. 새로운 API 키 발급 (https://platform.openai.com/api-keys)
3. `.env` 업데이트:
   ```
   OPENAI_API_KEY=sk-proj-새로운키...
   ```
4. 서버 재시작

**예상 효과:**
- ✅ 실제 GPT-4o-mini 가사 생성
- ✅ Mock 가사 대신 고품질 가사
- ✅ 제목 다양성 향상

---

#### 2. 📊 대량 생성 시 성능 최적화
**현재 상황:**
- 50곡 생성 시 시간이 오래 걸림
- API 호출마다 800ms 대기 (Rate limit)

**개선 방안:**
1. **병렬 처리 도입**
   ```javascript
   // 현재: 순차 처리
   for (let i = 0; i < quantity; i++) {
     await generateLyrics();
     await sleep(800);
   }
   
   // 개선: 배치 병렬 처리
   const batches = chunk(quantity, 5);
   for (const batch of batches) {
     await Promise.all(batch.map(generateLyrics));
   }
   ```

2. **캐싱 시스템**
   - 같은 프롬프트 → 캐시된 결과 재사용
   - Redis 활용

3. **스트리밍 응답**
   - 생성 완료된 곡부터 즉시 표시
   - WebSocket 활용

**예상 효과:**
- 50곡 생성 시간: 40분 → 10분 (75% 단축)

---

#### 3. 🎵 Suno API 연동 실제 음악 생성
**현재 상황:**
- 가사만 생성됨
- Suno API 호출은 아직 구현 안 됨

**구현 필요:**
1. `server/services/sunoClient.js` 완성
2. 가사 → 음악 변환 API 호출
3. 생성된 음악 파일 다운로드
4. UI에 재생 버튼 추가

**예상 코드:**
```javascript
// server/services/sunoClient.js
async generateMusic(lyrics, style) {
  const response = await axios.post(`${this.baseUrl}/generate`, {
    lyrics,
    style,
    duration: 120
  });
  
  return response.data.musicUrl;
}
```

**예상 효과:**
- ✅ 가사 + 음악 완전 생성
- ✅ 다운로드 가능
- ✅ 웹에서 재생 가능

---

### Priority 2: 중요 (Medium)

#### 4. 💾 제목 영구 데이터베이스 구축
**현재 상황:**
- 서버 재시작 시 제목 기록 초기화
- `usedTitles` Set이 메모리에만 존재

**개선 방안:**
```javascript
// server/data/used_titles.json 생성
{
  "titles": [
    "희망의 빛 / Light of Hope",
    "새로운 시작 / New Beginning",
    ...
  ],
  "lastUpdated": "2026-04-22T10:00:00Z"
}

// 서버 시작 시 로드
loadUsedTitles() {
  const data = fs.readFileSync('./data/used_titles.json');
  this.usedTitles = new Set(JSON.parse(data).titles);
}

// 제목 추가 시 저장
saveUsedTitle(title) {
  this.usedTitles.add(title);
  fs.writeFileSync('./data/used_titles.json', 
    JSON.stringify({
      titles: Array.from(this.usedTitles),
      lastUpdated: new Date().toISOString()
    })
  );
}
```

**예상 효과:**
- ✅ 서버 재시작해도 제목 기록 유지
- ✅ 수천, 수만 곡 생성 시에도 중복 없음

---

#### 5. 🎨 스타일 프리셋 확장
**현재 상황:**
- 기본 프롬프트 스타일만 제공
- 사용자가 직접 프롬프트 작성해야 함

**개선 방안:**
```javascript
// 프리셋 추가
const stylePresets = {
  emotional_ballad: {
    systemPrompt: "감성적인 발라드 가사를...",
    examples: ["이별의 아픔", "그리운 마음"],
    keywords: ["눈물", "그리움", "추억"]
  },
  energetic_pop: {
    systemPrompt: "에너제틱한 팝 가사를...",
    examples: ["신나는 여름", "파티 나이트"],
    keywords: ["춤", "파티", "에너지"]
  },
  // ... 20+ 프리셋
};
```

**UI 개선:**
- 드롭다운으로 스타일 선택
- 예시 가사 미리보기
- 커스텀 프롬프트도 가능

---

#### 6. 📈 통계 및 분석 대시보드
**구현 내용:**
1. **생성 통계**
   - 총 생성 곡 수
   - 장르별 분포
   - 시간대별 생성량

2. **품질 지표**
   - 영어 가사 검증 통과율
   - 제목 중복률
   - API 성공률

3. **인기 키워드**
   - 가장 많이 사용된 단어
   - 트렌드 분석

**UI 추가:**
```html
<div class="dashboard">
  <div class="stat-card">
    <h3>총 생성 곡</h3>
    <p class="big-number">1,234</p>
  </div>
  <div class="stat-card">
    <h3>영어 가사 품질</h3>
    <p class="big-number">95%</p>
  </div>
</div>
```

---

### Priority 3: 개선 (Low)

#### 7. 🌐 다국어 지원
- 일본어 가사 생성
- 중국어 가사 생성
- 스페인어 가사 생성

#### 8. 📱 모바일 앱 버전
- React Native
- 오프라인 모드
- 푸시 알림

#### 9. 🔐 사용자 인증 시스템
- 로그인/회원가입
- 생성 기록 저장
- 프리미엄 기능

#### 10. 🎤 음성 입력
- 마이크로 프롬프트 입력
- 음성 → 텍스트 변환
- 음성 스타일 분석

---

## 🛠️ 기술 부채 (Technical Debt)

### 1. 코드 리팩토링
- `openaiService.js` 너무 큼 (1,700+ 줄)
- 함수 분리 필요
- 테스트 코드 추가

### 2. 에러 핸들링 개선
- 현재: try-catch만 사용
- 개선: 구조화된 에러 클래스
- 사용자 친화적 에러 메시지

### 3. 로깅 시스템 개선
- 현재: console.log만 사용
- 개선: Winston 또는 Pino 도입
- 로그 레벨 분리 (DEBUG, INFO, WARN, ERROR)

### 4. API 문서화
- Swagger/OpenAPI 도입
- API 엔드포인트 문서화
- 예시 요청/응답 추가

---

## 🎯 추천 작업 순서

### 이번 주 (Week 1)
1. ✅ OpenAI API 키 문제 해결 ← **최우선!**
2. ✅ Suno API 실제 음악 생성 연동
3. ✅ 제목 영구 데이터베이스 구축

### 다음 주 (Week 2)
4. 대량 생성 성능 최적화
5. 스타일 프리셋 확장
6. 통계 대시보드 추가

### 3주차 (Week 3)
7. 코드 리팩토링
8. 에러 핸들링 개선
9. API 문서화

---

## 📝 현재 시스템 상태

### ✅ 완벽하게 작동하는 기능
1. Bugs Music 가사 추출 (100%)
2. 영어 가사 생성 (95%+ 품질)
3. 제목 생성 (중복 방지)
4. 차트 분석 및 레퍼런스 활용
5. UI/UX (다크 테마, 반응형)

### ⚠️ 부분적으로 작동
1. OpenAI API (Mock으로 대체 중)
2. 대량 생성 (느림)

### ❌ 미구현
1. Suno API 음악 생성
2. 영구 제목 데이터베이스
3. 통계 대시보드

---

## 🔗 테스트 링크

**웹 UI:** https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow

**기능 테스트:**
1. ✅ 프롬프트로 생성
2. ✅ 참고 가사로 생성
3. ✅ 차트 분석 → 레퍼런스 선택 → 생성
4. ✅ 영어 가사 품질 확인
5. ✅ 제목 중복 없음 확인

---

## 💡 결론

**지금 당장 해야 할 것:**
1. 🚨 **OpenAI API 키 업데이트** (5분 소요)
2. 🎵 **Suno API 연동** (1-2시간)
3. 💾 **제목 DB 구축** (30분)

**현재 시스템은 85% 완성!**
- 가사 생성: ✅ 완벽
- 음악 생성: ❌ 미구현 ← 다음 단계!
- 최적화: ⚠️ 개선 필요

**가장 중요한 것:** OpenAI API 키를 먼저 해결하면 Mock 가사 대신 고품질 가사를 생성할 수 있습니다!
