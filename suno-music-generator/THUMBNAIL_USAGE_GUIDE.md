# 🦔 고슴도치 썸네일 다양성 시스템 사용 가이드

## 📋 개요
- **46개 다양한 생활 시나리오** (기존 10개 → 46개)
- **1번 곡 자동 매칭** (제목/가사 키워드 분석)
- **47개 키워드 카테고리** (한글/영어 지원)
- **반복 방지 랜덤 선택**

---

## 🎯 사용 방법

### 1. 기본 사용 (1번 곡 매칭)

```javascript
const thumbnailGenerator = require('./server/services/thumbnailPromptGenerator');

// 1번 곡 정보 제공
const track1 = {
  title: '푸드트럭 앞에서',
  lyrics: '저녁 거리의 푸드트럭 앞에서 너를 기다려...'
};

// 자동 매칭 시나리오 선택
const prompt = thumbnailGenerator.generate({
  firstTrack: track1,
  includeText: true
});

console.log(prompt);
// → "푸드트럭" 키워드 감지 → food_truck_visit, cooking_kitchen 중 랜덤 선택
```

### 2. 다양한 키워드 매칭 예시

```javascript
// 동물/펫
const dogTrack = { title: '강아지와 함께', lyrics: '공원에서 산책' };
// → walking_dog, pet_grooming, park_bench 중 선택

// 여행
const travelTrack = { title: '벚꽃 아래', lyrics: '봄날 벚꽃이 피었어' };
// → cherry_blossom 시나리오

// 카페/음료
const cafeTrack = { title: '카페에서 커피 한잔', lyrics: 'morning coffee' };
// → cafe_jazz, morning_chill 중 선택

// 감정
const sadTrack = { title: '비 오는 날', lyrics: '창밖의 빗소리' };
// → rain_window 시나리오
```

### 3. 배치 생성 (여러 프롬프트)

```javascript
// 1번 곡 우선 매칭 + 다양한 시나리오 4개 추가
const prompts = thumbnailGenerator.generateBatch({
  firstTrack: track1,
  genre: 'lofi',
  includeText: true
}, 5);

console.log(prompts);
// [
//   { scenario: 'food_truck_visit', name: 'Food Truck Adventure', prompt: '...', isMatched: true },
//   { scenario: 'lofi_study', name: 'Late Night Study', prompt: '...', isMatched: false },
//   { scenario: 'cafe_jazz', name: 'Cafe Jazz', prompt: '...', isMatched: false },
//   ...
// ]
```

### 4. 장르 기반 선택 (1번 곡 없을 때)

```javascript
// 1번 곡 없으면 장르/무드 기반 선택
const prompt = thumbnailGenerator.generate({
  genre: 'lofi',
  mood: 'chill',
  timeOfDay: 'night',
  includeText: true
});
// → lofi_study, bedroom_chill, rain_window, cafe_jazz 중 선택
```

---

## 🎭 전체 시나리오 목록 (46개)

### 🍳 음식/요리 (5개)
- `cooking_kitchen` - 주방에서 요리하기
- `food_truck_visit` - 푸드트럭 방문
- `baking_cookies` - 쿠키 굽기
- `picnic_park` - 공원 피크닉
- `restaurant_dining` - 레스토랑 식사

### 🐕 동물/펫 (5개)
- `walking_dog` - 강아지 산책
- `cat_cafe_visit` - 고양이 카페
- `pet_grooming` - 펫 그루밍
- `aquarium_visit` - 수족관 방문
- `bird_watching` - 새 관찰

### 🏃 운동/활동 (5개)
- `yoga_morning` - 아침 요가
- `jogging_park` - 공원 조깅
- `gym_workout` - 헬스장 운동
- `cycling_city` - 도시 자전거
- `skateboarding` - 스케이트보드

### ✈️ 여행/장소 (5개)
- `airport_departure` - 공항 출발
- `beach_sunset` - 해변 석양
- `mountain_hiking` - 산 등산
- `cherry_blossom` - 벚꽃 구경
- `city_night_walk` - 도시 야경 산책

### 📚 취미/문화 (5개)
- `bookstore_browse` - 서점 둘러보기
- `art_gallery` - 미술관 관람
- `gaming_setup` - 게임 플레이
- `photography_city` - 도시 사진 촬영
- `record_store` - 레코드샵 방문

### 👥 사회/일상 (5개)
- `video_call_work` - 재택 화상회의
- `shopping_mall` - 쇼핑몰 쇼핑
- `laundromat_wait` - 빨래방 대기
- `bus_ride` - 버스 통근
- `waiting_subway` - 지하철 대기

### 💖 감정/특별한 순간 (5개)
- `birthday_cake` - 생일 축하
- `stargazing_night` - 별 보기
- `first_snow` - 첫눈
- `graduation_day` - 졸업식
- `sunset_proposal` - 석양 프러포즈

### 🎵 기존 시나리오 (16개)
- `lofi_study` - 밤늦은 공부
- `hip_hop_production` - 힙합 프로덕션
- `morning_chill` - 아침 휴식
- `night_drive` - 야간 드라이브
- `cafe_jazz` - 카페 재즈
- `sunset_rooftop` - 옥상 석양
- `library_study` - 도서관 공부
- `bedroom_chill` - 침실 휴식
- `train_commute` - 기차 통근
- `rain_window` - 비 오는 창가
- `park_bench` - 공원 벤치
- `vinyl_shop` - 레코드샵
- `winter_cabin` - 겨울 오두막
- `city_night` - 도시 밤거리

---

## 🔑 키워드 매핑 (47개 카테고리)

### 음식/요리
- `푸드트럭|food truck|음식|요리|레시피|cook|recipe`
- `커피|coffee|카페|cafe|latte|라떼|카페인`
- `쿠키|cookie|베이킹|baking|케이크|cake`
- `피크닉|picnic|소풍`
- `레스토랑|restaurant|식당|dining`

### 동물/펫
- `강아지|puppy|dog|반려견|멍멍이|산책`
- `고양이|cat|냥|kitty`
- `펫|pet|반려동물`
- `물고기|fish|수족관|aquarium`
- `새|bird|조류`

### 운동/활동
- `운동|workout|exercise|피트니스|fitness`
- `요가|yoga|명상|meditation`
- `조깅|jogging|달리기|running`
- `헬스|gym|웨이트`
- `자전거|bicycle|cycling|사이클`
- `스케이트보드|skateboard`

### 여행/장소
- `여행|travel|trip|journey`
- `공항|airport|비행기|airplane|plane`
- `해변|beach|바다|ocean|sea`
- `산|mountain|등산|hiking`
- `벚꽃|cherry blossom|봄|spring`
- `도시|city|시내|downtown`

### 취미/문화
- `책|book|독서|reading|서점|bookstore`
- `미술|art|그림|gallery|갤러리`
- `게임|gaming|game`
- `사진|photography|photo|카메라|camera`
- `음반|vinyl|레코드|record`
- `도서관|library`

### 일상/사회
- `회의|meeting|업무|work|재택|remote`
- `쇼핑|shopping|mall`
- `빨래|laundry|세탁`
- `버스|bus`
- `지하철|subway|metro`
- `출퇴근|commute`

### 감정/특별한 순간
- `생일|birthday|파티|party|축하|celebration`
- `별|star|밤하늘|starry|stargazing`
- `눈|snow|겨울|winter`
- `졸업|graduation`
- `사랑|love|연인|romantic|로맨틱`

### 시간대/날씨
- `새벽|dawn|아침|morning|sunrise`
- `밤|night|심야|midnight|저녁|evening`
- `비|rain|우산|rainy`
- `석양|sunset|황혼`

### 감정 상태
- `행복|happy|즐거운|joyful|기쁜`
- `슬픈|sad|우울|melancholic|눈물`
- `평화|peaceful|고요한|calm|평온`
- `외로운|lonely|혼자|alone`

---

## 📊 시스템 통계

```javascript
const stats = thumbnailGenerator.getStats();
console.log(stats);
// {
//   totalScenarios: 46,
//   keywordMappings: 47,
//   genres: 18,
//   outfits: 7,
//   character: 'Blue Hedgehog'
// }
```

---

## 🔧 API 통합 예시

```javascript
// Express 라우트 예시
router.post('/generate-thumbnail', async (req, res) => {
  const { tracks, genre, mood } = req.body;
  
  // 1번 곡 정보 추출
  const firstTrack = tracks && tracks.length > 0 ? {
    title: tracks[0].title,
    lyrics: tracks[0].lyrics || ''
  } : null;
  
  // 썸네일 프롬프트 생성
  const prompt = thumbnailGenerator.generate({
    firstTrack,  // 🎯 1번 곡 매칭
    genre,
    mood,
    includeText: true,
    customText: '🎵 LOFI BEATS'
  });
  
  // 이미지 생성 API 호출
  const imageUrl = await replicateAPI.generate({
    prompt,
    model: 'flux-dev',
    width: 1280,
    height: 720
  });
  
  res.json({ imageUrl, prompt });
});
```

---

## ✅ 테스트 결과

```bash
node -e "
const generator = require('./server/services/thumbnailPromptGenerator.js');

// 테스트 1: 푸드트럭
console.log('🍔 푸드트럭:', generator.analyzeFirstTrackForScenario({ 
  title: '푸드트럭 앞에서' 
}));
// → baking_cookies, food_truck_visit 중 하나

// 테스트 2: 강아지
console.log('🐕 강아지:', generator.analyzeFirstTrackForScenario({ 
  title: '강아지와 함께' 
}));
// → walking_dog, pet_grooming, park_bench 중 하나

// 테스트 3: 벚꽃
console.log('🌸 벚꽃:', generator.analyzeFirstTrackForScenario({ 
  title: '벚꽃 아래' 
}));
// → cherry_blossom

// 테스트 4: 커피/카페
console.log('☕ 카페:', generator.analyzeFirstTrackForScenario({ 
  title: '카페에서 커피 한잔' 
}));
// → cafe_jazz, morning_chill 중 하나
"
```

---

## 🎉 결과

이제 **수없이 많은 썸네일을 만들어도**:
- ✅ 46가지 다양한 시나리오가 자동 선택됩니다
- ✅ 1번 곡의 테마에 맞는 고슴도치 행동이 나옵니다
- ✅ 반복되는 "잠자기/커피" 문제가 해결됩니다
- ✅ 매 생성마다 새로운 고슴도치 이야기가 펼쳐집니다!

🦔💙 **고슴도치의 다양한 생활을 즐기세요!**
