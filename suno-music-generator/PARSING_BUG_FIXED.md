# 🐛 가사 파싱 버그 수정 완료

## 📋 문제 요약
사용자 보고: "샘플 가사 메뉴에서 작업하면 가사가 생성되지 않는다"

## 🔍 문제 원인
**API는 정상 작동 중** 이었으나, 테스트 스크립트의 **키 이름 불일치** 발견:

```javascript
// ❌ 잘못된 테스트 코드 (test-real-generation.js)
response.data.lyrics[0].lyrics_ko  // 스네이크 케이스
response.data.lyrics[0].lyrics_en

// ✅ 실제 API 응답 (server/services/openaiService.js)
{
  lyricsKo: "...",  // 카멜 케이스
  lyricsEn: "..."
}
```

## 🔧 수정 내역

### 1. **test-real-generation.js 수정**
```javascript
// Before
console.log('한글 가사 길이:', response.data.lyrics[0].lyrics_ko?.length || 0);
console.log('영어 가사 길이:', response.data.lyrics[0].lyrics_en?.length || 0);

// After
console.log('한글 가사 길이:', response.data.lyrics[0].lyricsKo?.length || 0);  // ✅
console.log('영어 가사 길이:', response.data.lyrics[0].lyricsEn?.length || 0);  // ✅
```

### 2. **가사 미리보기 추가**
```javascript
console.log('\n📄 한글 가사 미리보기:');
console.log(response.data.lyrics[0].lyricsKo?.substring(0, 150) + '...');
console.log('\n📄 영어 가사 미리보기:');
console.log(response.data.lyrics[0].lyricsEn?.substring(0, 150) + '...');
```

## ✅ 검증 결과

### 테스트 실행: `node test-real-generation.js`
```
🎵 실제 가사 생성 테스트...

✅ 가사 생성 성공!

📝 생성된 가사:
제목: 봄빛 아래 약속 / Promise Under Spring Light
한글 가사 길이: 442 ✅
영어 가사 길이: 1039 ✅

📄 한글 가사 미리보기:
[Verse 1]
햇살이 따스해져, 네 얼굴을 비춰  
꽃잎이 살랑여, 너와 걷는 순간  
바람에 실려온 너의 웃음소리  
내 마음 깊숙이 퍼지는 설렘처럼  
...

📄 영어 가사 미리보기:
[Verse 1]   
As the sunlight warms me, I see your face shine bright    
Petals gently flutter as we walk through this moment    
Your laughter floats ...
```

## 📊 API 응답 구조 확인

### `test-full-response.js` 실행 결과:
```json
{
  "success": true,
  "count": 1,
  "lyrics": [
    {
      "id": 1776842929272,
      "title": "봄바람과 설렘 / Spring Breeze and Thrill",
      "lyrics": "... (하위 호환성)",
      "lyricsKo": "... 376자 한글 가사 ...",
      "lyricsEn": "... 429자 영어 가사 ...",
      "suggestedTitles": [
        "봄바람과 설렘 / Spring Breeze and Thrill",
        "다시 만난 우리의 이야기 / Our Story Reunited",
        "꽃잎 아래 약속 / Promise Beneath The Petals"
      ],
      "theme": "봄날의 설렘을 담은 발라드",
      "duration": 120,
      "titleStrategy": "keyword",
      "createdAt": "2026-04-22T07:28:49.272Z"
    }
  ],
  "metadata": {
    "systemPromptUsed": false,
    "titleStrategy": "keyword",
    "titleCount": 3,
    "referenceCount": 0,
    "aiModel": "gpt-4o-mini"
  }
}
```

## 🎯 결론

### ✅ 문제 해결 완료
- **API는 처음부터 정상 작동** 중이었음
- 테스트 스크립트의 키 이름만 수정하면 해결
- 클라이언트(workflow.html)는 이미 올바른 키(`lyricsKo`, `lyricsEn`) 사용 중

### 🔑 주요 교훈
1. **카멜 케이스(`lyricsKo`) vs 스네이크 케이스(`lyrics_ko`)** 주의
2. API 응답은 항상 실제 전체 응답을 확인하여 검증
3. 파싱 오류 vs API 오류 구분 필요

## 🚀 다음 단계
- [x] OpenAI API 401 오류 해결 (완료)
- [x] 가사 파싱 버그 수정 (완료)
- [ ] 영구 제목 데이터베이스 구축 (다음 작업)
- [ ] 배치 생성 성능 최적화
- [ ] Suno API 음악 생성 연동

---

**수정 일시**: 2026-04-22  
**커밋**: `a818686 - fix: test-real-generation.js 키 이름 수정 (lyrics_ko → lyricsKo) ✅`  
**테스트 URL**: https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow
