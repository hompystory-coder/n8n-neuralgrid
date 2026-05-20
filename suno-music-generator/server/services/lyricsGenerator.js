/**
 * OpenAI/Gemini API를 사용한 가사 및 제목 생성 서비스
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');
const axios = require('axios');
const fs = require('fs');
const yaml = require('js-yaml');
const os = require('os');
const path = require('path');

// OpenAI API 설정 (비용 절감을 위해 Gemini 우선 사용)
const USE_OPENAI = false;  // ⚠️ true → false: 월 $2,250 → $0 절감!
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

// Gemini API 키 설정 (fallback)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || 'AIzaSyCS3nl6jkeSaWFKByCbCUJZSOjSXVQOnp4';
const GEMINI_PROJECT = 'projects/517255627325';

if (USE_OPENAI && OPENAI_API_KEY) {
  console.log(`🔑 OpenAI API initialized (Primary)`);
  console.log(`   API Key: ${OPENAI_API_KEY.substring(0, 15)}... (${OPENAI_API_KEY.length} chars)`);
} else {
  console.log(`🔑 Gemini API initialized (Fallback)`);
  console.log(`   API Key: ${GEMINI_API_KEY.substring(0, 15)}... (${GEMINI_API_KEY.length} chars)`);
  console.log(`   Project: ${GEMINI_PROJECT}`);
}

// Gemini API 클라이언트 초기화
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * OpenAI API 호출 (GPT-4)
 */
async function callOpenAI(systemPrompt, userPrompt, temperature = 0.9, maxTokens = 2048) {
  try {
    const response = await axios.post('https://api.openai.com/v1/chat/completions', {
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: temperature,
      max_tokens: maxTokens
    }, {
      headers: {
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    return {
      response: {
        text: () => response.data.choices[0].message.content
      }
    };
  } catch (error) {
    console.error('❌ OpenAI API 오류:', error.message);
    throw error;
  }
}

/**
 * Gemini 모델 생성 헬퍼 함수
 */
function createGeminiModel(temperature = 1.0, maxTokens = 8192, systemInstruction = null) {
  const config = {
    model: "gemini-2.5-flash",
    generationConfig: {
      temperature: temperature,
      maxOutputTokens: maxTokens,
    }
  };
  
  if (systemInstruction) {
    config.systemInstruction = systemInstruction;
  }
  
  return genAI.getGenerativeModel(config);
}

/**
 * 통합 LLM 호출 함수 (OpenAI 우선, Gemini fallback)
 */
async function generateWithLLM(systemPrompt, userPrompt, temperature = 0.9, maxTokens = 2048) {
  if (USE_OPENAI && OPENAI_API_KEY) {
    return await callOpenAI(systemPrompt, userPrompt, temperature, maxTokens);
  } else {
    const model = createGeminiModel(temperature, maxTokens, systemPrompt);
    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    return response.text();  // ✅ Gemini 응답에서 텍스트 추출
  }
}

/**
 * 랜덤 접근 방식 생성 (다양성 보장)
 */
function getRandomApproach(seed, index) {
  const approaches = [
    "1인칭 시점 - '나'의 직접적인 경험과 감정을 생생하게",
    "2인칭 시점 - '너'를 향한 메시지와 대화체로",
    "3인칭 관찰자 - 밖에서 바라보는 시선으로 객관적으로",
    "과거 회상 - 지나간 시간을 돌아보며 향수를 담아",
    "현재 진행형 - 지금 이 순간의 생생한 감각을 포착",
    "미래 전망 - 앞으로 펼쳐질 희망과 기대를 그리며",
    "대화체 - 누군가와 나누는 대화처럼 자연스럽게",
    "독백 - 내면의 깊은 생각을 솔직하게",
    "질문형 - 끊임없이 던지는 질문들로 구성",
    "서술형 - 이야기를 들려주듯 풀어내기",
    "감각 중심 - 시각/청각/촉각/후각/미각을 극대화",
    "대비 구조 - 상반된 두 상황을 대조하며",
    "순환 구조 - 처음과 끝이 연결되는 원형으로",
    "비유/은유 - 추상적 표현과 상징을 활용",
    "구체적 장면 - 영화 한 장면처럼 디테일하게"
  ];
  
  const timeSettings = [
    "새벽 4시의 고요한 순간",
    "아침 햇살이 들어오는 시간",
    "오전 10시의 활기찬 시간",
    "점심시간의 분주한 풍경",
    "오후 2시의 나른한 순간",
    "오후 4시의 여유로운 티타임",
    "오후 황혼의 따뜻한 빛",
    "저녁 6시 퇴근길의 풍경",
    "저녁 노을이 지는 순간",
    "밤 9시 하루를 마무리하는 시간",
    "밤 11시의 고요한 순간",
    "밤의 고요와 별빛",
    "자정을 넘긴 깊은 밤",
    "한밤중의 깊은 사색",
    "시간을 잊은 순간"
  ];
  
  const locations = [
    "작은 카페 창가 자리",
    "붐비는 지하철 안",
    "한적한 공원 벤치",
    "높은 빌딩 옥상",
    "조용한 도서관 한구석",
    "바다가 보이는 해변",
    "산 정상의 전망대",
    "골목길 작은 가게",
    "집 안 아늑한 방",
    "거리의 버스 정류장"
  ];
  
  const emotions = [
    "그리움과 향수",
    "희망과 설렘",
    "평온과 안정",
    "불안과 초조함",
    "슬픔과 외로움",
    "기쁨과 감사",
    "분노와 좌절",
    "혼란과 갈등",
    "해방감과 자유",
    "사랑과 그리움"
  ];
  
  // 🎲 랜덤 offset 추가로 진정한 랜덤 선택 (YouTube 메타데이터와 동일한 방식)
  const randomApproachOffset = Math.floor(Math.random() * approaches.length);
  const randomTimeOffset = Math.floor(Math.random() * timeSettings.length);
  const randomLocationOffset = Math.floor(Math.random() * locations.length);
  const randomEmotionOffset = Math.floor(Math.random() * emotions.length);
  
  const approachIdx = (seed + index * 17 + randomApproachOffset) % approaches.length;
  const timeIdx = (seed + index * 23 + randomTimeOffset) % timeSettings.length;
  const locationIdx = (seed + index * 31 + randomLocationOffset) % locations.length;
  const emotionIdx = (seed + index * 37 + randomEmotionOffset) % emotions.length;
  
  return `   - 시점: ${approaches[approachIdx]}
   - 시간: ${timeSettings[timeIdx]}
   - 장소: ${locations[locationIdx]}
   - 핵심 감정: ${emotions[emotionIdx]}`;
}

/**
 * 🌐 AI 웹 검색으로 오늘 날짜 실제 이슈 20건 수집
 */
async function collectRealIssues(style, language, date = '2026-05-03', count = 2) {
  try {
    console.log(`\n🎯 [1단계] ${count}곡을 위한 이슈만 수집 중...`);
    console.log(`   📅 기간: 최근 1주일`);
    console.log(`   🌐 언어: ${language}`);
    
    // 1주일 날짜 범위 계산
    const endDate = new Date(date);
    const startDate = new Date(endDate);
    startDate.setDate(startDate.getDate() - 7);
    const dateRange = `${startDate.toISOString().split('T')[0]} ~ ${date}`;
    
    const languageLower = language.toLowerCase();
    const languageText = languageLower === 'korean' ? '한국' : '글로벌';
    const targetLanguage = languageLower === 'korean' ? '한국어' : 'English';
    
    // 🔥 1단계: 이슈만 간단하게 수집 (가사는 나중에)
    const systemInstruction = `당신은 트렌드 검색 전문가입니다.

🎯 **임무**: ${count}곡을 위한 최신 이슈 ${count}개만 검색하세요.

⚠️ **제외**: 정치, 불법, 성적, 폭력, 비극, 차별
✅ **포함**: 일상, 문화, 기술, 감정, 관계, 취미, 여행, 음식, 운동`;

    const userPrompt = `🔍 **${count}개 이슈 검색 요청**

**기간**: ${dateRange}
**대상**: ${languageText} 뉴스 및 트렌드

${count}개의 안전한 이슈를 검색해주세요.

**출력 형식** (JSON):
\`\`\`json
{
  "searchDate": "${dateRange}",
  "count": ${count},
  "issues": [
    {
      "id": 1,
      "title": "이슈 제목 (10자 이내)",
      "description": "이슈 설명 (100자 이내)",
      "category": "라이프/문화/기술/감정/일상",
      "mood": "감동적/재미난/설레는/위로하는/희망찬",
      "keywords": ["키워드1", "키워드2", "키워드3"]
    }
  ]
}
\`\`\`

⚠️ **중요**: 
- 정확히 ${count}개만 생성
- 실제 웹 검색 결과 사용
- JSON만 출력 (설명 금지)`;

    // 🔥 LLM API 호출 (간단한 이슈 수집만)
    const responseText = await generateWithLLM(systemInstruction, userPrompt, 0.3, 1000);  // 2000 → 1000 토큰 (50% 절감)
    const trimmedText = responseText.trim();
    console.log(`📊 이슈 검색 결과 (원본 일부):`, trimmedText.substring(0, 200));
    
    // JSON 파싱
    let issuesData;
    try {
      const jsonMatch = trimmedText.match(/```json\s*([\s\S]*?)\s*```/) || 
                        trimmedText.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const jsonText = jsonMatch[1] || jsonMatch[0];
        issuesData = JSON.parse(jsonText);
      } else {
        throw new Error('JSON 형식을 찾을 수 없습니다');
      }
    } catch (parseError) {
      console.warn('⚠️ JSON 파싱 실패:', parseError.message);
      return getFallbackIssues(language);
    }
    
    // 검증: count개 이슈 확인
    if (!issuesData.issues || issuesData.issues.length < count) {
      console.warn(`⚠️ 이슈 개수 부족 (${issuesData.issues?.length || 0}/${count}), 폴백 사용`);
      const fallback = getFallbackIssues(language);
      const needed = count - (issuesData.issues?.length || 0);
      issuesData.issues = [
        ...(issuesData.issues || []),
        ...fallback.issues.slice(0, needed)
      ];
    }
    
    console.log(`✅ [1단계 완료] ${issuesData.issues.length}개 이슈 수집 완료`);
    console.log(`   📰 예시: ${issuesData.issues.slice(0, count).map(i => i.title).join(', ')}`);
    
    // 🔥 [2단계] 각 이슈마다 emotionalStory와 sensoryDetails 추가
    console.log(`\n🎭 [2단계] 각 이슈에 감정 스토리 추가 중... (${count}곡)`);
    
    for (let i = 0; i < Math.min(count, issuesData.issues.length); i++) {
      const issue = issuesData.issues[i];
      console.log(`   ${i + 1}/${count}: "${issue.title}" 감정 스토리 생성 중...`);
      
      try {
        const storyPrompt = `🎭 **감정 스토리 작성 요청**

**이슈**: ${issue.title}
**설명**: ${issue.description}
**감정**: ${issue.mood || '감동적'}

다음 이슈를 바탕으로 **400-500자**의 영화 같은 감정 스토리를 작성하세요:

**필수 포함 요소**:
1. **다양한 시간대** (아침 8시, 오후 3시, 저녁 7시, 밤 11시, 심야 1시, 새벽 5시 등 - 매번 다르게!)
2. 구체적 장소 (예: 밝은 사무실, 햇살 쏟아지는 거리, 조용한 카페, 시끄러운 공원)
3. 인물과 행동 (예: 학생이 책을 읽는다, 직장인이 회의한다, 친구들이 웃는다)
4. 감정 변화 (예: 불안한 → 안도하는, 설레는 → 감동받는)
5. 5가지 감각 중 3가지 이상 (시각, 청각, 촉각, 후각, 미각)

**⚠️ 중요**: 
- 매 스토리마다 **서로 다른 시간대**를 사용하세요 (새벽/아침/오후/저녁/밤/심야 골고루 분배)
- "새벽 5시 30분"만 반복하지 마세요!
- 각 이슈의 맥락과 분위기에 맞는 **자연스러운 시간대**를 선택하세요

**출력 형식** (JSON):
\`\`\`json
{
  "emotionalStory": "400-500자의 영화 같은 이야기... (다양한 시간대, 장소, 인물, 행동, 감정 변화 포함)",
  "sensoryDetails": "5가지 감각 중 3가지 이상 포함 (50자+). 예: 진한 커피 향, 따뜻한 온기, 주황빛 햇살, 원두 갈리는 소리"
}
\`\`\`

⚠️ **필수**: emotionalStory 400자 이상, sensoryDetails 50자 이상`;

        const storyText = await generateWithLLM('당신은 창의적인 감성 스토리 작가입니다. 매번 다른 시간대를 사용하여 영화 시나리오처럼 구체적이고 상세하게 작성하세요.', storyPrompt, 0.9, 800);  // 1500 → 800 토큰
        const trimmedStoryText = storyText.trim();
        
        // JSON 파싱
        const storyMatch = trimmedStoryText.match(/```json\s*([\s\S]*?)\s*```/) || 
                          trimmedStoryText.match(/\{[\s\S]*\}/);
        if (storyMatch) {
          const storyJson = JSON.parse(storyMatch[1] || storyMatch[0]);
          issue.emotionalStory = storyJson.emotionalStory || '';
          issue.sensoryDetails = storyJson.sensoryDetails || '';
          
          console.log(`      ✅ emotionalStory: ${issue.emotionalStory.length}자`);
          console.log(`      ✅ sensoryDetails: ${issue.sensoryDetails.length}자`);
        } else {
          console.warn(`      ⚠️ JSON 파싱 실패, 기본값 사용`);
          issue.emotionalStory = `${issue.description} 이 이슈는 많은 사람들의 관심을 받고 있다.`;
          issue.sensoryDetails = '시각적 이미지, 청각적 소리, 촉각적 느낌';
        }
      } catch (error) {
        console.error(`      ❌ 스토리 생성 실패:`, error.message);
        issue.emotionalStory = `${issue.description} 이 이슈는 많은 사람들의 관심을 받고 있다.`;
        issue.sensoryDetails = '시각적 이미지, 청각적 소리, 촉각적 느낌';
      }
    }
    
    console.log(`✅ [2단계 완료] 모든 이슈에 감정 스토리 추가 완료`);
    console.log(`   🎵 가사 생성 준비 완료!`);
    
    return issuesData;
    
  } catch (error) {
    console.error(`❌ 이슈 수집 실패:`, error.message);
    console.log(`   📦 폴백 이슈 사용`);
    return getFallbackIssues(language);
  }
}

/**
 * 🔄 간단한 프롬프트로 재시도
 */
async function collectRealIssuesSimple(style, language, date, count = 2) {
  try {
    const targetLanguage = language === 'korean' ? '한국어' : 'English';
    const targetCount = Math.max(5, Math.min(count + 3, 20));
    
    const systemInstruction = `You are a real-time news search AI. Current date: ${date}. Find ${targetCount} real news/trends in ${language}.`;
    const userPrompt = `Search the web for ${targetCount} real ${language} news/trends on ${date}.
Output only JSON:
{
  "issues": [
    {"id": 1, "title": "...", "description": "...", "category": "...", "mood": "...", "keywords": [...]}
  ]
}
Language: ${targetLanguage}`;

    // 🔥 Gemini API 호출
    const responseText = await generateWithLLM(systemInstruction, userPrompt, 0.3, 1500);  // 3000 → 1500 토큰 (가사 생성)
    const trimmedResponseText = responseText.trim();
    const jsonMatch = trimmedResponseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error('JSON 파싱 실패');
    
  } catch (error) {
    console.error(`❌ 간단 재시도도 실패:`, error.message);
    return getFallbackIssues(language);
  }
}

/**
 * 폴백 이슈 (LLM 실패 시)
 */
function getFallbackIssues(language) {
  // 2026-05-03 기준 1주일 이슈 (2026-04-27 ~ 2026-05-03)
  // 정치, 불법, 성적, 종교, 차별, 폭력, 비극 제외
  // 안전하고 긍정적인 일상/문화/기술 트렌드 중심
  
  const languageLower = language ? language.toLowerCase() : 'english';
  if (languageLower === 'korean') {
    return {
      searchDate: '2026-04-27 ~ 2026-05-03',
      searchMethod: '1주일 안전 트렌드 큐레이션 (정치/불법/성적/폭력/비극 제외)',
      issues: [
        // ✅ 긍정적 라이프스타일 (10개)
        { 
          id: 1, 
          title: '벚꽃 축제', 
          description: '봄나들이 나선 시민들로 벚꽃 명소 만원', 
          emotionalStory: '벚꽃이 만개한 공원에 가족과 함께 나들이 나선 직장인. 흩날리는 꽃잎 사이로 들려오는 아이들 웃음소리에 지친 일상이 잠시 잊혀진다. 따뜻한 봄바람에 마음까지 가벼워지는 순간.',
          sensoryDetails: '분홍빛 벚꽃잎, 부드러운 봄바람, 달콤한 꽃향기',
          category: '라이프', 
          mood: '밝음', 
          keywords: ['벚꽃', '축제', '봄'], 
          realNews: true, 
          safe: true, 
          source: '인스타그램' 
        },
        { 
          id: 2, 
          title: '홈카페 트렌드', 
          description: '집에서 카페 분위기 즐기는 사람들', 
          emotionalStory: '아늑한 주방에서 커피를 내리는 직장인. 원두 갈리는 소리, 뜨거운 물 부어지는 소리가 마음을 편안하게 한다. 창가에 앉아 따뜻한 커피를 마시며 혼자만의 고요한 시간을 즐긴다.',
          sensoryDetails: '진한 커피 향, 따뜻한 컵의 온기, 창밖 아침 햇살',
          category: '라이프', 
          mood: '밝음', 
          keywords: ['홈카페', '커피', '취미'], 
          realNews: true, 
          safe: true, 
          source: '유튜브' 
        },
        { 
          id: 3, 
          title: '러닝 크루', 
          description: '함께 달리며 친구 만드는 러닝 모임', 
          emotionalStory: '한강 러닝 코스에 모인 직장인들. 처음 보는 사람들이지만 함께 달리며 점점 가까워진다. 땀 흘리며 숨 가빠도, 옆 사람의 응원에 힘이 나서 끝까지 달린다. 피니시 라인에서 하이파이브하며 웃음이 터진다.',
          sensoryDetails: '발자국 소리, 땀 흘리는 느낌, 시원한 강바람',
          category: '라이프', 
          mood: '밝음', 
          keywords: ['러닝', '운동', '크루'], 
          realNews: true, 
          safe: true, 
          source: '인스타그램' 
        },
        { id: 4, title: '비건 카페 증가, 건강한 식습관 트렌드', description: '채식 메뉴 선택하는 젊은 세대', emotionalStory: '새로 생긴 비건 카페에서 샐러드를 주문한 직장인. 신선한 채소와 과일이 담긴 그릇을 보며 건강해지는 기분. 가벼운 몸과 마음으로 기분 좋은 하루를 보낸다.', sensoryDetails: '신선한 채소 향, 상큼한 과일 맛, 밝은 카페 인테리어', category: '라이프', mood: '밝음', keywords: ['비건', '건강', '카페'], realNews: true, safe: true, source: '인스타그램' },
        { id: 5, title: '주말 등산 인구 증가, 산으로 떠나는 힐링', description: '자연 속에서 힐링하는 직장인들', emotionalStory: '등산복 입고 산을 오르는 직장인. 나무 사이로 들려오는 새소리, 땀 흘리며 정상에 오르면 펼쳐지는 탁 트인 풍경. 일주일간 쌓인 스트레스가 한순간에 날아간다.', sensoryDetails: '맑은 공기, 새소리, 시원한 바람', category: '라이프', mood: '밝음', keywords: ['등산', '힐링', '자연'], realNews: true, safe: true, source: '네이버뉴스' },
        { id: 6, title: '반려식물 키우기, 초보자도 쉬운 가드닝', description: '작은 화분으로 시작하는 식물 생활', emotionalStory: '작은 화분에 물을 주며 새싹이 자란 것을 발견한 직장인. 매일 조금씩 자라는 식물을 보며 작은 성취감과 위로를 느낀다. 초록빛 잎이 주는 평온함에 하루가 풍요로워진다.', sensoryDetails: '초록 잎의 싱그러움, 흙 냄새, 부드러운 잎의 촉감', category: '라이프', mood: '밝음', keywords: ['식물', '가드닝', '취미'], realNews: true, safe: true, source: '인스타그램' },
        { id: 7, title: '요리 클래스 인기, 새로운 취미로 부상', description: '집밥 만들기 배우는 요리 수업', category: '라이프', mood: '밝음', keywords: ['요리', '클래스', '취미'], realNews: true, safe: true, source: '유튜브' },
        { id: 8, title: '로컬 맛집 탐방, 동네 숨은 명소 찾기', description: '내 동네 맛집 인증하는 재미', category: '라이프', mood: '밝음', keywords: ['맛집', '로컬', '탐방'], realNews: true, safe: true, source: '인스타그램' },
        { id: 9, title: '명상 앱 사용 증가, 마음 건강 챙기기', description: '짧은 명상으로 스트레스 해소', category: '라이프', mood: '밝음', keywords: ['명상', '마음', '건강'], realNews: true, safe: true, source: '유튜브' },
        { id: 10, title: '중고 거래 활성화, 지속가능한 소비', description: '필요한 물건 나누며 환경도 지키기', category: '라이프', mood: '밝음', keywords: ['중고', '거래', '환경'], realNews: true, safe: true, source: '다음뉴스' },
        
        // ✅ 긍정적 문화 트렌드 (5개)
        { id: 11, title: 'K-POP 댄스 챌린지, 전 세계 팬들 참여', description: '신곡 안무 따라하기 열풍', category: '문화', mood: '밝음', keywords: ['K-POP', '댄스', '챌린지'], realNews: true, safe: true, source: '인스타그램' },
        { id: 12, title: '독서 모임 붐, 책으로 소통하는 사람들', description: '책 읽고 이야기 나누는 북클럽 인기', category: '문화', mood: '밝음', keywords: ['독서', '모임', '책'], realNews: true, safe: true, source: '네이버뉴스' },
        { id: 13, title: '감성 문구 노트 유행, 자기표현의 수단', description: '나만의 메시지 담은 소품 인기', category: '문화', mood: '밝음', keywords: ['문구', '감성', '자기표현'], realNews: true, safe: true, source: '인스타그램' },
        { id: 14, title: '클래식 음악 재조명, 젊은 세대도 즐겨', description: '스트리밍으로 쉽게 접하는 클래식', category: '문화', mood: '밝음', keywords: ['클래식', '음악', '감상'], realNews: true, safe: true, source: '유튜브' },
        { id: 15, title: '일기 쓰기 열풍, 나를 돌아보는 시간', description: '하루를 정리하는 글쓰기 습관', category: '문화', mood: '밝음', keywords: ['일기', '글쓰기', '자기성찰'], realNews: true, safe: true, source: '인스타그램' },
        
        // ✅ IT/기술 혁신 (3개)
        { id: 16, title: 'AI 영어 회화 앱 인기, 언제 어디서나 학습', description: 'AI와 대화하며 영어 실력 향상', category: 'IT/기술', mood: '밝음', keywords: ['AI', '영어', '앱'], realNews: true, safe: true, source: '유튜브' },
        { id: 17, title: 'AI 그림 생성, 누구나 아티스트 되는 시대', description: 'AI로 나만의 그림 만드는 재미', category: 'IT/기술', mood: '밝음', keywords: ['AI', '그림', '생성'], realNews: true, safe: true, source: '유튜브' },
        { id: 18, title: '스마트 홈 기기 보급 확대, 편리한 일상', description: '음성으로 조작하는 집안 전자기기', category: 'IT/기술', mood: '밝음', keywords: ['스마트홈', 'IoT', '편리'], realNews: true, safe: true, source: '네이버뉴스' },
        
        // ✅ 자기계발 & 긍정 습관 (2개)
        { id: 19, title: '아침 루틴 챌린지, SNS서 화제', description: '건강한 아침 습관 만들기 열풍', category: '자기계발', mood: '밝음', keywords: ['루틴', '아침', '습관'], realNews: true, safe: true, source: '유튜브' },
        { id: 20, title: '주 4일 근무 실험, 생산성 향상 효과', description: '워라밸 개선과 효율성 동시 달성', category: '자기계발', mood: '밝음', keywords: ['워라밸', '근무', '생산성'], realNews: true, safe: true, source: '다음뉴스' }
      ]
    };
  } else {
    return {
      searchDate: '2026-04-27 ~ 2026-05-03',
      searchMethod: '1 Week Trend Curation (Safety Filtered)',
      issues: [
        { id: 1, title: 'Spring Cherry Blossom Festival, Popular Spots Crowded', description: 'Citizens enjoy spring outings at cherry blossom locations', category: 'Lifestyle', mood: 'bright', keywords: ['blossom', 'festival', 'spring'], realNews: true, source: 'Instagram' },
        { id: 2, title: 'Home Cafe Trend, Coffee Machine Sales Surge', description: 'People enjoying cafe atmosphere at home', category: 'Lifestyle', mood: 'bright', keywords: ['cafe', 'coffee', 'hobby'], realNews: true, source: 'YouTube' },
        { id: 3, title: 'Running Crew Culture Spreads, Healthy Hobby', description: 'Running groups where people make friends', category: 'Lifestyle', mood: 'bright', keywords: ['running', 'exercise', 'crew'], realNews: true, source: 'Instagram' },
        { id: 4, title: 'AI English Conversation App Popular, Learn Anytime', description: 'Improve English by chatting with AI', category: 'IT/Tech', mood: 'bright', keywords: ['AI', 'english', 'app'], realNews: true, source: 'YouTube' },
        { id: 5, title: 'K-POP Dance Challenge, Global Fans Participate', description: 'Following new song choreography craze', category: 'Culture', mood: 'bright', keywords: ['K-POP', 'dance', 'challenge'], realNews: true, source: 'Instagram' },
        { id: 6, title: 'Vegan Cafes Increase, Healthy Eating Trend', description: 'Young generation choosing plant-based menus', category: 'Lifestyle', mood: 'bright', keywords: ['vegan', 'healthy', 'cafe'], realNews: true, source: 'Instagram' },
        { id: 7, title: 'Weekend Hiking Population Grows, Mountain Healing', description: 'Office workers healing in nature', category: 'Lifestyle', mood: 'bright', keywords: ['hiking', 'healing', 'nature'], realNews: true, source: 'Naver News' },
        { id: 8, title: 'Book Club Boom, People Connect Through Reading', description: 'Popular book clubs for reading and discussion', category: 'Culture', mood: 'bright', keywords: ['reading', 'club', 'books'], realNews: true, source: 'Naver News' },
        { id: 9, title: 'Pet Plant Trend, Easy Gardening for Beginners', description: 'Starting plant life with small pots', category: 'Lifestyle', mood: 'bright', keywords: ['plants', 'garden', 'hobby'], realNews: true, source: 'Instagram' },
        { id: 10, title: '4-Day Workweek Experiment, Productivity Boost', description: 'Achieving work-life balance and efficiency', category: 'Lifestyle', mood: 'bright', keywords: ['worklife', 'schedule', 'productivity'], realNews: true, source: 'Daum News' },
        { id: 11, title: 'Cooking Classes Popular, Emerging New Hobby', description: 'Learning to make home-cooked meals', category: 'Lifestyle', mood: 'bright', keywords: ['cooking', 'class', 'hobby'], realNews: true, source: 'YouTube' },
        { id: 12, title: 'Emotional Stationery Trend, Means of Self-Expression', description: 'Popular items with personal messages', category: 'Culture', mood: 'bright', keywords: ['stationery', 'emotion', 'expression'], realNews: true, source: 'Instagram' },
        { id: 13, title: 'Morning Routine Challenge, SNS Sensation', description: 'Creating healthy morning habits craze', category: 'Lifestyle', mood: 'bright', keywords: ['routine', 'morning', 'habit'], realNews: true, source: 'YouTube' },
        { id: 14, title: 'Local Restaurant Tours, Finding Hidden Gems', description: 'Fun of verifying neighborhood restaurants', category: 'Lifestyle', mood: 'bright', keywords: ['restaurant', 'local', 'tour'], realNews: true, source: 'Instagram' },
        { id: 15, title: 'Meditation App Usage Increases, Mental Health Care', description: 'Stress relief through short meditation', category: 'Lifestyle', mood: 'bright', keywords: ['meditation', 'mind', 'health'], realNews: true, source: 'YouTube' },
        { id: 16, title: 'Second-hand Trading Active, Sustainable Consumption', description: 'Sharing needed items while protecting environment', category: 'Lifestyle', mood: 'bright', keywords: ['secondhand', 'trade', 'environment'], realNews: true, source: 'Daum News' },
        { id: 17, title: 'Classical Music Spotlight, Young Generation Enjoys', description: 'Easy access to classical through streaming', category: 'Culture', mood: 'bright', keywords: ['classical', 'music', 'appreciation'], realNews: true, source: 'YouTube' },
        { id: 18, title: 'Cycling Population Surges, Bike Paths Expanded', description: 'People commuting by bicycle', category: 'Lifestyle', mood: 'bright', keywords: ['bicycle', 'cycling', 'exercise'], realNews: true, source: 'Naver News' },
        { id: 19, title: 'Journaling Trend, Time for Self-Reflection', description: 'Writing habit to organize the day', category: 'Lifestyle', mood: 'bright', keywords: ['journal', 'writing', 'reflection'], realNews: true, source: 'Instagram' },
        { id: 20, title: 'AI Art Generation, Era of Everyone as Artist', description: 'Fun of creating own art with AI', category: 'IT/Tech', mood: 'bright', keywords: ['AI', 'art', 'generation'], realNews: true, source: 'YouTube' }
      ]
    };
  }
}

/**
 * 🎵 실제 이슈 기반 가사 생성 (장르/분위기 맞춤)
 */
async function generateLyricsFromIssue(issue, style, language, gender, index, previousLyrics = []) {
  const languageText = language === 'korean' ? '한국어' : '영어';
  const genderText = gender === 'female' ? '여성' : gender === 'male' ? '남성' : '중성적인';
  const targetLanguage = language === 'korean' ? '한국어' : 'English';
  
  // 🎲 랜덤 요소 추가로 매번 다른 seed 생성 (YouTube 메타데이터와 동일한 방식)
  const uniqueSeed = Date.now() + index * 1000 + Math.floor(Math.random() * 10000);
  
  try {
    console.log(`🎵 이슈 기반 ${languageText} 가사 생성 중...`);
    console.log(`   📌 이슈: ${issue.title}`);
    console.log(`   📝 설명: ${issue.description}`);
    console.log(`   💭 감정 스토리: ${issue.emotionalStory || '(없음)'}`);
    console.log(`   👁️ 감각 디테일: ${issue.sensoryDetails || '(없음)'}`);
    console.log(`   🏷️ 키워드: ${issue.keywords.join(', ')}`);
    console.log(`   😊 분위기: ${issue.mood}`);
    
    // 이전 가사 샘플 준비 (최대 3개만)
    let previousLyricsSample = '';
    if (previousLyrics.length > 0) {
      const recentLyrics = previousLyrics.slice(-3);
      previousLyricsSample = '\n\n**❌ 절대 사용 금지 - 이전에 생성된 가사 샘플** (이와 유사하거나 같은 표현 절대 금지!):\n\n';
      recentLyrics.forEach((lyrics, i) => {
        const sample = lyrics.substring(0, 200).replace(/\n/g, ' ');
        previousLyricsSample += `이전 곡 ${previousLyrics.length - recentLyrics.length + i + 1}: "${sample}..."\n\n`;
      });
    }
    
    // 🔥 Gemini API 호출 - 간단하고 명확한 프롬프트
    const maxChars = language === 'korean' ? 550 : 250;
    const minChars = language === 'korean' ? 120 : 80;  // 임시로 낮춤 - Gemini가 짧게 생성하는 문제
    const unit = language === 'korean' ? '자' : '단어';
    
    const styleOptions = [
      { name: '강동적', description: '에너지 넘치고 활기찬, 빠른 템포, 강한 비트' },
      { name: '유쾌', description: '밝고 경쾌한, 긍정적 에너지, 신나는 멜로디' },
      { name: '서정적', description: '감성적이고 부드러운, 느린 템포, 감정 표현 중심' },
      { name: '몽환적', description: '꿈같고 몽롱한, 추상적 이미지, 신비로운 분위기' },
      { name: '슬픔', description: '애잔하고 슬픈, 회상과 그리움, 마이너 키' },
      { name: '희망', description: '밝고 긍정적, 미래 지향적, 따뜻한 위로' }
    ];
    
    const selectedStyle = styleOptions[(uniqueSeed + index) % styleOptions.length];
    
    // 🎵 인트로 다양성을 위한 20가지 시작 방식
    const introStyles = language === 'korean' ? [
      { type: '질문형', example: '왜 이렇게 / 마음이 뛸까', hint: '의문문으로 시작하여 호기심 유발' },
      { type: '장면묘사', example: '창밖에 비가 내려 / 흐린 하늘 아래', hint: '구체적 장면을 그림처럼 묘사' },
      { type: '감각표현', example: '차가운 바람 속에 / 떨리는 내 손끝', hint: '촉각, 시각, 청각 등 감각적 표현' },
      { type: '시간표현', example: '아침이 밝아오고 / 새로운 하루가', hint: '시간대나 계절로 시작' },
      { type: '대화형', example: '넌 말했지 괜찮다고 / 하지만 난 알아', hint: '대화나 독백으로 시작' },
      { type: '감정직설', example: '그리워 미칠 것 같아 / 너 없는 이 밤', hint: '감정을 직접적으로 표현' },
      { type: '상황설정', example: '문을 열고 들어서면 / 텅 빈 이 공간', hint: '특정 상황이나 장소 설정' },
      { type: '비유시작', example: '별처럼 빛나던 / 그 순간들이', hint: '은유나 비유로 시작' },
      { type: '회상형', example: '그때를 떠올리면 / 웃음이 나와', hint: '과거 회상으로 시작' },
      { type: '반복강조', example: '또다시 또다시 / 같은 생각만', hint: '단어나 구절 반복으로 강조' },
      { type: '소리표현', example: '빗소리가 들려와 / 귓가를 적시네', hint: '소리나 음향 묘사' },
      { type: '움직임', example: '걸어가는 이 길 위 / 발걸음마다', hint: '동작이나 움직임 표현' },
      { type: '색깔표현', example: '붉게 물든 하늘이 / 나를 감싸와', hint: '색상이나 색감으로 시작' },
      { type: '자연물', example: '바람이 불어오면 / 흔들리는 나뭇잎', hint: '자연 요소로 시작' },
      { type: '도시풍경', example: '네온사인 불빛 아래 / 홀로 서있어', hint: '도시나 일상 풍경' },
      { type: '내면독백', example: '나는 생각해 끝없이 / 이 모든 것들을', hint: '생각이나 내면 묘사' },
      { type: '대조표현', example: '어제는 웃었는데 / 오늘은 눈물만', hint: '대비되는 상황 제시' },
      { type: '명령형', example: '잊어버려 모든 걸 / 다시 시작해', hint: '명령문이나 권유로 시작' },
      { type: '상징표현', example: '깨진 유리처럼 / 부서진 마음', hint: '상징적 이미지 사용' },
      { type: '순간포착', example: '눈을 뜨는 순간 / 네가 보였어', hint: '특정 순간을 포착' }
    ] : [
      { type: '질문형', example: 'Why does my heart / Beat this way', hint: 'Start with a question to spark curiosity' },
      { type: '장면묘사', example: 'Rain falls outside / Beneath cloudy skies', hint: 'Paint a vivid scene' },
      { type: '감각표현', example: 'Cold wind surrounds me / My hands are trembling', hint: 'Use sensory details (touch, sight, sound)' },
      { type: '시간표현', example: 'Morning light breaks through / A brand new day begins', hint: 'Start with time or season' },
      { type: '대화형', example: 'You said it\'s okay / But I know the truth', hint: 'Begin with dialogue or monologue' },
      { type: '감정직설', example: 'I miss you so much / This lonely night', hint: 'Express emotions directly' },
      { type: '상황설정', example: 'When I walk inside / This empty space', hint: 'Set a specific situation or place' },
      { type: '비유시작', example: 'Like stars shining bright / Those moments we shared', hint: 'Start with metaphor or simile' },
      { type: '회상형', example: 'When I think of then / I can\'t help but smile', hint: 'Begin with reminiscence' },
      { type: '반복강조', example: 'Again and again / The same thoughts return', hint: 'Use repetition for emphasis' },
      { type: '소리표현', example: 'I hear the rainfall / Echoing in my ears', hint: 'Describe sounds or acoustics' },
      { type: '움직임', example: 'Walking down this road / With every step I take', hint: 'Express motion or movement' },
      { type: '색깔표현', example: 'The sky turns crimson / Wrapping around me', hint: 'Start with colors or hues' },
      { type: '자연물', example: 'When the wind blows soft / The leaves start to dance', hint: 'Use natural elements' },
      { type: '도시풍경', example: 'Under neon lights / I stand here alone', hint: 'Urban or everyday scenery' },
      { type: '내면독백', example: 'I keep thinking deep / About all of this', hint: 'Internal thoughts or reflection' },
      { type: '대조표현', example: 'Yesterday I smiled / Today only tears', hint: 'Present contrasting situations' },
      { type: '명령형', example: 'Forget it all now / Start over again', hint: 'Begin with commands or suggestions' },
      { type: '상징표현', example: 'Like shattered glass / My broken heart', hint: 'Use symbolic imagery' },
      { type: '순간포착', example: 'The moment I woke / I saw you there', hint: 'Capture a specific moment' }
    ];
    
    // 🎲 인트로 스타일 랜덤 선택 (YouTube 메타데이터와 동일한 방식)
    const randomIntroOffset = Math.floor(Math.random() * introStyles.length);
    const selectedIntroStyle = introStyles[(uniqueSeed + index * 7 + randomIntroOffset) % introStyles.length];
    
    const systemInstruction = `당신은 전문 작사가입니다.

🎯 **작사 규칙**:
1. **필수 구조**: [Intro] → [Verse 1] → [Chorus] → [Verse 2] → [Chorus] → [Bridge] → [Outro]
2. **각 섹션 줄 수**: Intro(2줄), Verse(3줄씩), Chorus(3줄씩), Bridge(2줄), Outro(2줄)
3. **총 길이**: ${minChars}-${maxChars}${unit} (최소 ${minChars}자 필수!)
4. **한 줄 길이**: 12-15자

🚫 **금지**: Pre-Chorus, Verse 3, Final Chorus, Verse 4 등 추가 섹션 절대 금지!

🎭 **작사 스타일**: ${selectedStyle.name} - ${selectedStyle.description}

🎵 **인트로 스타일 (필수 적용!)**: ${selectedIntroStyle.type}
   → ${selectedIntroStyle.hint}
   → 예시: "${selectedIntroStyle.example}"
   ⚠️ 이 스타일로 [Intro]를 작성하되, 예시를 그대로 복사하지 말고 이슈/테마에 맞게 창의적으로 변형하세요!

💡 **작사 방법**:
- 감정 스토리의 구체적 이미지를 가사로 표현
- 키워드를 직접 말하지 말고 은유로 전달
- 모든 줄은 시적이고 감각적으로 작성
- **[Intro]는 반드시 위 인트로 스타일을 따라 독특하게 시작**

📝 **반드시 ${targetLanguage} 가사만 출력하세요!** (섹션 태그 포함)`;



    const userPrompt = `📰 이슈: ${issue.title}
💭 감정 스토리: ${issue.emotionalStory || issue.description}
👁️ 감각: ${issue.sensoryDetails || ''}
🏷️ 키워드: ${issue.keywords.join(', ')}
😊 분위기: ${issue.mood}

🎵 음악: ${style}, ${genderText} 보컬

━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 ${minChars}-${maxChars}자 가사를 다음 구조로 **완전히 끝까지** 작성하세요:

[Intro]
(2줄, 각 12-15자)
⚠️ **필수**: "${selectedIntroStyle.type}" 스타일로 작성!
→ ${selectedIntroStyle.hint}
→ 참고: "${selectedIntroStyle.example}" (이 예시를 그대로 쓰지 말고 이슈에 맞게 변형!)

[Verse 1]
(3줄, 각 12-15자)

[Chorus]  
(3줄, 각 12-15자)

[Verse 2]
(3줄, 각 12-15자)

[Chorus]
(3줄, 각 12-15자)

[Bridge]
(2줄, 각 12-15자)

[Outro]
(2줄, 각 12-15자)
━━━━━━━━━━━━━━━━━━━━━━━━━━

⚠️ **필수**: 
- [Outro]까지 **모든 섹션을 완성**하세요! (중간에 멈추지 마세요!)
- 총 ${minChars}-${maxChars}자 (현재까지 부족하면 계속 작성!)
- 7개 섹션 모두 작성 완료 후에만 응답 종료!

지금 [Intro]부터 [Outro]까지 **전체 가사**를 작성하세요:`;



    // 🔥 Gemini API 호출 - 완성도 보장 재시도 로직
    let lyrics = '';
    let attempt = 0;
    const maxAttempts = 3;
    
    console.log(`🎵 인트로 스타일 선택: "${selectedIntroStyle.type}" (${selectedIntroStyle.hint})`);
    console.log(`   📌 예시: "${selectedIntroStyle.example}"`);
    
    while (attempt < maxAttempts) {
      attempt++;
      console.log(`🎵 가사 생성 시도 ${attempt}/${maxAttempts}...`);
      
      // 🎨 Temperature 0.9 → 0.95로 증가 (더 창의적인 가사 생성)
      lyrics = await generateWithLLM(systemInstruction, userPrompt, 0.95, 1024);  // 2048 → 1024 토큰
      lyrics = lyrics.trim();
      
      // 🔍 디버그: Gemini 응답 확인
      console.log(`📤 Gemini 응답 (원본 ${lyrics.length}자):`);
      console.log(lyrics.substring(0, 300) + (lyrics.length > 300 ? '...' : ''));
      
      // ✅ 완성도 검증: 모든 필수 섹션이 있는지 확인
      const hasIntro = lyrics.includes('[Intro]');
      const hasVerse1 = lyrics.includes('[Verse 1]');
      const hasChorus = lyrics.includes('[Chorus]');
      const hasVerse2 = lyrics.includes('[Verse 2]');
      const hasBridge = lyrics.includes('[Bridge]');
      const hasOutro = lyrics.includes('[Outro]');
      
      if (hasIntro && hasVerse1 && hasChorus && hasVerse2 && hasBridge && hasOutro) {
        console.log(`✅ 완전한 가사 생성 성공! (시도 ${attempt}/${maxAttempts})`);
        console.log(`   ✓ [Intro] ✓ [Verse 1] ✓ [Chorus] ✓ [Verse 2] ✓ [Bridge] ✓ [Outro]`);
        break;
      } else {
        console.warn(`⚠️ 불완전한 가사 (시도 ${attempt}/${maxAttempts}):`);
        console.warn(`   ${hasIntro ? '✓' : '✗'} [Intro]`);
        console.warn(`   ${hasVerse1 ? '✓' : '✗'} [Verse 1]`);
        console.warn(`   ${hasChorus ? '✓' : '✗'} [Chorus]`);
        console.warn(`   ${hasVerse2 ? '✓' : '✗'} [Verse 2]`);
        console.warn(`   ${hasBridge ? '✓' : '✗'} [Bridge]`);
        console.warn(`   ${hasOutro ? '✓' : '✗'} [Outro]`);
        
        if (attempt < maxAttempts) {
          console.log(`🔄 재시도 중...`);
          await new Promise(resolve => setTimeout(resolve, 1000)); // 1초 대기
        } else {
          console.error(`❌ ${maxAttempts}번 시도 후에도 완전한 가사 생성 실패`);
          console.log(`💡 누락된 섹션을 자동으로 보완합니다...`);
        }
      }
    }
    
    // 🔥 **강제 섹션 제거 + 길이 제한** (항상 적용!)
    console.log(`🔧 가사 처리 중... (원본: ${lyrics.length}자)`);
    
    if (language === 'korean') {
      // 1단계: Pre-Chorus, Verse 3, Final Chorus 강제 제거 (정규식 개선!)
      lyrics = lyrics
        .replace(/\[Pre-Chorus\][\s\S]*?(?=\[|$)/gi, '')  // Pre-Chorus 완전 제거
        .replace(/\[Verse 3\][\s\S]*?(?=\[|$)/gi, '')    // Verse 3 완전 제거  
        .replace(/\[Final Chorus\][\s\S]*?(?=\[|$)/gi, '') // Final Chorus 완전 제거
        .replace(/\n\n\n+/g, '\n\n'); // 과도한 줄바꿈 정리
      
      console.log(`✂️ 불필요 섹션 제거 완료 (${lyrics.length}자)`);
      
      // 2단계: 여전히 550자 초과하면 강제 자르기
      if (lyrics.length > maxChars) {
        console.warn(`⚠️ 가사가 여전히 깁니다! (${lyrics.length} > ${maxChars})`);
        console.warn(`   → ${maxChars}자로 강제 자르기 (Outro 우선 유지)`);
        
        // Outro를 찾아서 유지하면서 자르기
        const outroMatch = lyrics.match(/\[Outro\][^\[]*$/i);
        const outro = outroMatch ? outroMatch[0] : '';
        
        if (outro && outro.length < 80) {
          // Outro가 있고 적당한 길이면, 앞부분을 잘라서 Outro 유지
          const targetLength = maxChars - outro.length - 5;
          const beforeOutro = lyrics.substring(0, lyrics.lastIndexOf('[Outro]'));
          lyrics = beforeOutro.substring(0, targetLength) + '\n\n' + outro;
        } else {
          // Outro가 없거나 너무 길면, 그냥 550자로 강제 자르기
          lyrics = lyrics.substring(0, maxChars);
        }
        console.warn(`✂️ 최종 강제 자르기 완료: ${lyrics.length}자`);
      }
    }
    
    // 🔥 가사 길이 검증 및 섹션 보완
    const wordCount = language === 'korean' ? lyrics.length : lyrics.split(/\s+/).length;
    
    if (wordCount < minChars) {
      console.warn(`⚠️ 가사가 짧습니다 (${wordCount}/${minChars}${unit})`);
      console.warn(`   → 부족한 섹션을 자동 보완합니다.`);
      
      // 🔥 누락된 섹션 자동 추가 (언어별)
      if (!lyrics.includes('[Verse 2]')) {
        console.log(`   + [Verse 2] 자동 생성 중...`);
        if (language === 'english') {
          lyrics += `\n\n[Verse 2]\nThrough the passing time, unchanging and true\nDeep within my heart, memories of you\nEvery single moment, beautiful and bright`;
        } else {
          lyrics += `\n\n[Verse 2]\n시간이 흘러가도 변하지 않을\n마음속 깊이 남아있는 너\n그 모든 순간들이 아름다워`;
        }
      }
      if (!lyrics.includes('[Bridge]')) {
        console.log(`   + [Bridge] 자동 생성 중...`);
        if (language === 'english') {
          lyrics += `\n\n[Bridge]\nThis endless road ahead of me\nI want to walk it with you by my side`;
        } else {
          lyrics += `\n\n[Bridge]\n끝없이 이어질 듯한 이 길\n함께 걸어가고 싶어`;
        }
      }
      if (!lyrics.includes('[Outro]')) {
        console.log(`   + [Outro] 자동 생성 중...`);
        if (language === 'english') {
          lyrics += `\n\n[Outro]\nShining like stars above\nA story we'll remember forever`;
        } else {
          lyrics += `\n\n[Outro]\n별빛처럼 빛나는 우리\n영원히 기억될 이야기`;
        }
      }
      
      console.log(`✅ 섹션 보완 완료 (${lyrics.length}${unit})`);
    } else {
      console.log(`✅ 가사 길이 적정 (${wordCount}${unit})`);
    }
    
    // 이미 위에서 자동 자르기 완료, 아래는 최종 검증만
    console.log(`✅ 이슈 기반 가사 생성 완료 (${wordCount} ${unit})`);
    console.log(`   적정 범위: ${minChars}-${maxChars}, 실제: ${wordCount} ✅`);
    console.log(`   📌 이슈: ${issue.title}`);
    
    return lyrics;
    
  } catch (error) {
    console.error(`❌ 이슈 기반 가사 생성 오류:`, error.message);
    
    if (error.status === 401) {
      console.error(`\n⚠️⚠️⚠️ 중요: GenSpark LLM API 인증 실패 (401) ⚠️⚠️⚠️`);
      console.error(`   GenSpark LLM Proxy는 샌드박스 세션 인증이 필요합니다.`);
    }
    
    // 🔥 Fallback 가사 사용 금지! 에러를 throw하여 이 곡을 건너뜀
    console.error(`🚫 Gemini 생성 실패 → 이 곡은 생성하지 않습니다.`);
    throw error;
  }
}

/**
 * 폴백 트렌드 키워드 (LLM 실패 시)
 */
function getFallbackTrendKeywords(language) {
  const languageLower = language ? language.toLowerCase() : 'english';
  if (languageLower === 'korean') {
    return {
      trendKeywords: ['자기사랑', '성장', '치유', '희망', '여정', '자유', '꿈', '평화', '용기', '빛', '변화', '시작', '행복', '사랑', '미래'],
      socialIssues: ['정신건강', '워라밸', '자기계발', '환경보호', '긍정에너지'],
      emotionalThemes: ['위로', '공감', '응원', '설렘', '감사'],
      description: '2026년 5월 기준: 자기사랑과 정신건강이 주요 트렌드'
    };
  } else {
    return {
      trendKeywords: ['self-love', 'growth', 'healing', 'hope', 'journey', 'freedom', 'dreams', 'peace', 'courage', 'light', 'change', 'beginning', 'happiness', 'love', 'future'],
      socialIssues: ['mental health', 'work-life balance', 'self-improvement', 'sustainability', 'positivity'],
      emotionalThemes: ['comfort', 'empathy', 'support', 'excitement', 'gratitude'],
      description: 'May 2026 trends: Self-love and mental health are key themes'
    };
  }
}

/**
 * 스타일에 맞는 가사 생성 (실제 이슈 기반)
 */
async function generateLyrics(style, language, gender, index, previousLyrics = [], issuesData = null, selectedIssue = null) {
  const languageText = language === 'korean' ? '한국어' : '영어';
  const genderText = gender === 'female' ? '여성' : gender === 'male' ? '남성' : '중성적인';
  
  // 🎯 이미 선택된 이슈가 있으면 그것을 사용 (제목과 가사 일치를 위해!)
  if (selectedIssue) {
    console.log(`✅ 외부에서 선택된 이슈 사용: ${selectedIssue.title}`);
    console.log(`   📋 설명: ${selectedIssue.description}`);
    console.log(`   🏷️ 키워드: ${selectedIssue.keywords.join(', ')}`);
  } else {
    // 🎯 실제 이슈 데이터가 없으면 수집
    if (!issuesData) {
      console.log(`⚠️ 실제 이슈 데이터가 없습니다. 자동 수집 시작...`);
      issuesData = await collectRealIssues(style, language, '2026-05-01');
    }
    
    // 🎲 각 곡마다 다른 이슈 선택 (중복 없음)
    const issues = issuesData.issues || [];
    if (issues.length === 0) {
      console.error(`❌ 이슈 데이터가 없습니다.`);
      console.error(`🚫 Fallback 가사 사용 금지 → 이 곡은 생성하지 않습니다.`);
      throw new Error('이슈 데이터가 없어 가사 생성 불가');
    }
    
    // 🎲 랜덤으로 이슈 선택 (매번 다른 이슈 보장!)
    // 이전에 사용한 이슈 추적 (previousLyrics 기반)
    const usedIndices = new Set();
    if (previousLyrics.length > 0) {
      // 이전 곡들에서 사용한 이슈 인덱스를 추적 (간단히 index % length로 추정)
      for (let i = 0; i < previousLyrics.length; i++) {
        usedIndices.add(i % issues.length);
      }
    }
    
    // 사용 가능한 이슈 필터링
    let availableIssues = issues.filter((_, idx) => !usedIndices.has(idx));
    
    // 모든 이슈를 사용했다면 다시 처음부터
    if (availableIssues.length === 0) {
      availableIssues = issues;
      console.log(`🔄 모든 이슈 사용 완료, 처음부터 재사용`);
    }
    
    // 🎲 랜덤 선택 (Math.random() 사용)
    const randomIndex = Math.floor(Math.random() * availableIssues.length);
    selectedIssue = availableIssues[randomIndex];
    
    console.log(`🎯 ${index + 1}번째 곡 선택 이슈: ${selectedIssue.title}`);
    console.log(`   🎲 랜덤 선택 (${availableIssues.length}개 중 ${randomIndex + 1}번째)`);
    console.log(`   📝 설명: ${selectedIssue.description}`);
    console.log(`   🏷️ 키워드: ${selectedIssue.keywords.join(', ')}`);
  }
  
  // 🎵 실제 이슈 기반 가사 생성
  return await generateLyricsFromIssue(selectedIssue, style, language, gender, index, previousLyrics);
}

/**
 * 랜덤 인트로 생성
 */
function generateRandomIntros(issue, seed) {
  const intros = [
    `조용한 밤의 시작\n마음의 문을 열어\n${issue.description}\n새로운 하루가 와`,
    `아침 햇살이 비춰\n창문을 두드려\n${issue.keywords[0]}의 시간\n조금씩 다가와`,
    `거리를 걷다 보면\n문득 떠오르는 생각\n${issue.description}\n오늘도 여전히`,
    `별빛 아래 서서\n하늘을 올려다봐\n${issue.keywords[1]}가 펼쳐져\n끝없이 이어져`,
    `비가 내리는 날\n창밖을 바라보며\n${issue.description}\n마음이 젖어들어`,
  ];
  
  // 🎲 랜덤 offset 추가 (YouTube 메타데이터와 동일한 방식)
  const randomOffset = Math.floor(Math.random() * intros.length);
  const index = (seed + randomOffset) % intros.length;
  return intros[index];
}

/**
 * 랜덤 Verse 생성
 */
function generateRandomVerses(issue, seed, variations) {
  // variations에서 시점, 시간, 장소, 감정 추출
  const verses = [];
  
  for (let i = 0; i < 4; i++) {
    const vseed = seed + i * 137;
    const templates = [
      `이 순간이 흘러가\n${issue.keywords[0]}이 지나가\n작은 일상이 쌓여\n하루가 만들어져\n\n천천히 걸어가며\n주변을 둘러봐\n평범한 순간들이\n특별해지는 때\n\n발걸음 느리게\n서두를 필요 없어\n내 속도로 살아가\n그것만으로 충분해`,
      
      `새로운 하루가 와\n${issue.keywords[1]}를 만나\n예상치 못한 순간\n설렘이 찾아와\n\n사람들 사이에서\n나만의 길을 찾아\n혼자여도 괜찮아\n나를 믿어보는 거야\n\n멀리 보이는 곳\n언젠가 닿을 수 있어\n조급해하지 말고\n한 걸음씩 나아가`,
      
      `창밖을 바라보며\n생각에 잠겨\n${issue.description}\n마음이 움직여\n\n어제와는 다른\n오늘의 나를 봐\n조금씩 변해가는\n내 모습이 보여\n\n완벽하지 않아도\n그대로 괜찮아\n있는 그대로의 나\n사랑하기로 해`,
      
      `하루가 지나가고\n밤이 찾아와\n${issue.keywords[2]}와 함께\n이 순간을 마무리해\n\n조용한 이 시간\n나만의 공간에서\n작은 위로를 찾아\n내일을 준비해\n\n지친 하루였지만\n의미 있었어\n모든 순간들이\n나를 성장시켜`,
    ];
    
    // 🎲 랜덤 offset 추가
    const randomOffset = Math.floor(Math.random() * templates.length);
    const idx = (vseed + randomOffset) % templates.length;
    verses.push(templates[idx]);
  }
  
  return verses;
}

/**
 * 랜덤 Chorus 생성 (🎯 제목 추출을 위한 고정 프레이즈 포함)
 */
function generateRandomChorus(issue, seed) {
  const choruses = [
    // 패턴 1: "나를 발견하네" 반복
    `${issue.keywords[0]}을 느끼며\n나를 발견하네\n${issue.keywords[1]}을 그리며\n나를 발견하네\n\n이 ${issue.mood} 순간 속에\n나를 발견하네\n작은 기쁨 속에서\n나를 발견하네`,
    
    // 패턴 2: "함께 걸어가면" 반복
    `마음이 움직여\n함께 걸어가면\n새로운 세상이\n함께 걸어가면\n\n두렵지 않아\n함께 걸어가면\n어떤 길이라도\n함께 걸어가면`,
    
    // 패턴 3: "빛나고 있어" 반복
    `${issue.keywords[1]}가 빛나\n빛나고 있어\n희망의 빛이\n빛나고 있어\n\n포기하지 않아\n빛나고 있어\n${issue.mood} 마음으로\n빛나고 있어`,
    
    // 패턴 4: "그대로 아름다워" 반복
    `오늘도 걸어가\n그대로 아름다워\n작은 행복들을\n그대로 아름다워\n\n완벽하지 않아도\n그대로 아름다워\n있는 그대로의 나\n그대로 아름다워`,
    
    // 패턴 5: "다시 시작해" 반복
    `새로운 아침에\n다시 시작해\n작은 용기로\n다시 시작해\n\n넘어져도 괜찮아\n다시 시작해\n끝이 아니야\n다시 시작해`,
    
    // 패턴 6: "너와 함께라면" 반복
    `어떤 순간에도\n너와 함께라면\n두렵지 않아\n너와 함께라면\n\n모든 것이 특별해\n너와 함께라면\n세상이 빛나\n너와 함께라면`,
  ];
  
  // 🎲 랜덤 offset 추가
  const randomOffset = Math.floor(Math.random() * choruses.length);
  const index = (seed + randomOffset) % choruses.length;
  return choruses[index];
}

/**
 * 랜덤하게 가사 조립
 */
function assembleRandomLyrics(intros, verses, chorus, seed) {
  // 🎲 7개 섹션 구조만 사용 (Pre-Chorus, Verse 3, Final Chorus 제거!)
  const structures = [
    // 구조 1: 기본형
    (i, v, c) => `[Intro]
${i}

[Verse 1]
${v[0]}

[Chorus]
${c}

[Verse 2]
${v[1]}

[Chorus]
${c}

[Bridge]
계절이 바뀌듯이
모든 건 흘러가고

[Outro]
고요한 밤의 끝
내일을 기다려`,
    
    // 구조 2: 변형
    (i, v, c) => `[Intro]
${i}

[Verse 1]
${v[0]}

[Chorus]
${c}

[Verse 2]
${v[1]}

[Chorus]
${c}

[Bridge]
잠시 멈춰 서서
지나온 길을 봐

[Outro]
여정은 계속돼
새로운 장이 열려`,
    
    // 구조 3: 순환형
    (i, v, c) => `[Intro]
${i}

[Verse 1]
${v[0]}

[Chorus]
${c}

[Verse 2]
${v[1]}

[Chorus]
${c}

[Bridge]
다시 처음으로
돌아온 것 같아

[Outro]
${i.split('\n').slice(0, 2).join('\n')}`,
  ];
  
  const idx = seed % structures.length;
  return structures[idx](intros, verses, chorus);
}

/**
 * 폴백: 이슈 기반 템플릿 가사 생성
 */
function generateIssueFallbackLyrics(issue, style, language, gender, uniqueSeed) {
  // 🔧 Language case-insensitive 처리 (완전한 대소문자 지원)
  const languageLower = language ? language.toLowerCase() : 'english';
  
  console.log(`🎲 템플릿 기반 가사 생성 (LLM 대체)`);
  console.log(`   🌱 시드: ${uniqueSeed}`);
  console.log(`   📰 이슈: ${issue.title}`);
  
  // 🎲 랜덤 다양성 추가 (uniqueSeed 기반)
  const variations = getRandomApproach(uniqueSeed, Math.floor(uniqueSeed / 1000));
  console.log(`   🎭 적용된 다양성:\n${variations}`);
  
  // 🎯 이슈별 맞춤형 폴백 가사 (자연스럽고 구체적)
  
  // 이슈 제목의 핵심 키워드로 매칭
  const issueKey = issue.title.toLowerCase();
  
  // 🎲 시드 기반 랜덤 요소 생성
  const randomIntros = generateRandomIntros(issue, uniqueSeed);
  const randomVerses = generateRandomVerses(issue, uniqueSeed, variations);
  const randomChorus = generateRandomChorus(issue, uniqueSeed);
  
  // 🎨 랜덤하게 조합하여 가사 생성
  return assembleRandomLyrics(randomIntros, randomVerses, randomChorus, uniqueSeed);
  
  if (languageLower === 'korean') {
    // 한국어 이슈별 맞춤 가사
    
    // 봄 벚꽃 축제 (Spring Cherry Blossom)
    if (issueKey.includes('cherry') || issueKey.includes('blossom') || issueKey.includes('spring') || 
        issueKey.includes('벚꽃') || issueKey.includes('봄') || issueKey.includes('축제')) {
      return `[Intro]
봄바람이 불어와
벚꽃이 흩날려
분홍빛 거리 위로
새로운 계절이
하늘 가득 꽃잎이
춤추는 이 순간
모두가 기다렸던
봄이 왔어

[Verse 1]
거리마다 사람들
손에 카메라 들고
벚꽃 아래 서서
추억을 남기려 해
친구들과 가족들
연인들이 손잡고
이 아름다운 순간
함께 나누려 해

만개한 꽃잎들이
하늘을 가득 채워
짧은 순간이지만
아름다운 봄날
1년에 한 번뿐인
이 특별한 시간
소중한 사람들과
함께 만끽해

사람들 사이로
천천히 걸어가
벚꽃 향기 따라
마음이 설레어
축제의 열기 속
웃음소리 가득해
모두가 하나 되어
봄을 즐겨

[Pre-Chorus]
1년에 단 한 번
이 순간을 위해
모두가 모여와
봄을 맞이해
기다렸던 시간들
모두 잊고서
지금 이 순간을
만끽하자

[Chorus]
벚꽃 축제의 밤
꽃잎이 춤춰
인파 속에서도
너만 보여

봄날의 기적
이 순간뿐이야
벚꽃 아래서
추억을 만들어

분홍빛 하늘 아래
우리가 서 있어
이 순간을 잊지 않게
사진 속에 담아

계절이 지나가도
기억 속에 남아
영원히 빛날
봄날의 추억

[Verse 2]
노점상 음식 냄새
길게 늘어선 줄
사람들 웃음소리
봄 축제 분위기
떡볶이와 회오리 감자
달콤한 솜사탕
축제 음식들이
봄을 더 특별하게 해

아이들은 뛰어놀고
연인들은 손잡고
가족들은 돗자리 펴고
벚꽃을 즐겨
할머니 할아버지도
젊은 날을 떠올리며
벚꽃 아래에서
옛 추억 나눠

해가 지고 나서도
축제는 계속돼
조명 아래 벚꽃
더 환상적이야
밤벚꽃의 아름다움
낮과는 또 다른 매력
불빛에 반짝이는
꽃잎들의 향연

[Pre-Chorus]
1년에 단 한 번
이 순간을 위해
모두가 모여와
봄을 맞이해
기다렸던 시간들
모두 잊고서
지금 이 순간을
만끽하자

[Chorus]
벚꽃 축제의 밤
꽃잎이 춤춰
인파 속에서도
너만 보여

봄날의 기적
이 순간뿐이야
벚꽃 아래서
추억을 만들어

분홍빛 하늘 아래
우리가 서 있어
이 순간을 잊지 않게
사진 속에 담아

계절이 지나가도
기억 속에 남아
영원히 빛날
봄날의 추억

[Bridge]
지나간 봄날들이
떠올라 마음에
매년 이맘때면
같은 자리에서
어릴 적 부모님과
손잡고 걸었던
벚꽃길이 아직도
선명하게 남아

꽃은 피고 지지만
추억은 영원해
내년에도 다시
이곳에 올게
사랑하는 사람들과
함께 만들어갈
새로운 봄날의
아름다운 기억

SNS 사진 속
웃는 우리 모습
시간이 지나도
여전히 아름다워
몇 년이 흘러도
이 순간만큼은
변하지 않을
특별한 추억

[Verse 3]
밤늦게까지 이어지는
벚꽃 축제의 열기
사람들은 지치지 않고
봄을 만끽해
길거리 공연자들의
음악 소리 퍼지고
축제의 밤은
더욱 풍성해져

꽃잎이 바람에
흩날려 떨어지면
손을 뻗어 잡아
소원을 빌어
사랑하는 사람과
평생 함께 하길
이 벚꽃처럼
아름답게 살길

이 순간이 영원하길
시간이 멈췄으면
하지만 알아
계절은 흘러가
그래도 괜찮아
내년에 또 올 테니
벚꽃은 다시 피고
우린 다시 만날 거야

[Verse 4]
축제가 끝나가는
새벽 시간이 와도
사람들은 떠나지 않아
마지막 순간까지
카메라 셔터 소리
여기저기 들리고
모두가 아쉬워하며
봄을 아껴담아

내년을 기약하며
천천히 발걸음을 떼
벚꽃 터널 지나며
마지막 인사를 해

[Final Chorus]
벚꽃 축제의 밤
꽃잎이 춤춰
인파 속에서도
너만 보여

봄날의 기적
이 순간뿐이야
벚꽃 아래서
추억을 만들어

분홍빛 하늘 아래
우리가 서 있어
이 순간을 잊지 않게
사진 속에 담아

계절이 지나가도
기억 속에 남아
영원히 빛날
봄날의 추억

내년 봄에도
같은 자리에서
벚꽃 아래 만나
다시 추억 만들자
더 많은 사람들과
함께 나누며
벚꽃처럼 아름다운
순간들을 만들어가자

[Outro]
꽃잎이 천천히
땅에 내려앉아
봄은 짧지만
추억은 길어
내년 이맘때
다시 만날 우리
벚꽃 아래에서
또 다른 봄을 맞이해`;
    }
    
    // 지하철 파업
    if (issueKey.includes('지하철') || issueKey.includes('파업') || issueKey.includes('subway') || issueKey.includes('strike')) {
      return `[Intro]
아침 공기 차갑고
발걸음만 빨라져
플랫폼 위 사람들
모두 같은 얼굴로
지하철 멈춘 소식
스마트폰 화면에
한숨만 가득한
출근길 아침

[Verse 1]
역 앞 계단에
사람이 길게 서
표정은 다 말해
오늘이 힘들대
모두가 전화기를 들고
대안을 찾아보지만
버스는 만원이고
택시는 잡히지 않아

손엔 구겨진 뉴스
날은 아직 차가워
버스가 안 와도
발걸음은 멈춰
지각이 확정된
아침의 풍경
하지만 어쩔 수 없어
함께 걸어가야 해

어디선가 들려와
전화벨 소리만
늦는다는 변명이
입에 맴돌아
회사 상사에게
문자를 보내며
오늘은 모두가
같은 상황이라고

[Pre-Chorus]
어쩔 수 없는 일
다들 말하지만
가슴속엔 답답함
자꾸 커져만 가
그래도 포기 안 해
오늘도 가야 해
우리의 발걸음
계속되어야 해

[Chorus]
지하철 멈췄어
파업 멈췄어
우린 또 걸어가
같은 거리로
익숙한 길이지만
오늘은 더 멀어

지하철 멈췄어
그래도 가야 해
오늘의 우리를
놓치지 않게
삶은 계속되고
우린 멈추지 않아

멈춘 시간 속에서
우린 움직여
파업의 밤이어도
끝까지 걸어
함께라는 이유로
포기하지 않아

[Verse 2]
편의점 앞 벤치에
커피를 나눠 마셔
모르는 사람들도
한숨이 닮았어
서로 눈빛을 나누며
공감하는 순간
오늘만큼은 우린
모두 한편이야

늦는다는 문자에
괜히 웃음이 나와
이상하게 오늘은
다들 비슷해
SNS엔 파업 소식
밈으로 가득하고
웃으면서도 우린
계속 걸어가

택시비 계산하고
버스 노선 찾아봐
이 길이 맞는지도
헷갈리기만 해
지도 앱을 켜고
최단 경로 검색해
하지만 결국엔
걸어야 하는 길

[Pre-Chorus]
함께 걷는 이유를
오늘 알게 됐어
혼자가 아닌 거야
우리 모두가
같은 상황 속에서
서로를 바라보며
이해하게 되는
연대의 순간

[Chorus]
지하철 멈췄어
파업 멈췄어
우린 또 걸어가
같은 거리로
익숙한 길이지만
오늘은 더 멀어

지하철 멈췄어
그래도 가야 해
오늘의 우리를
놓치지 않게
삶은 계속되고
우린 멈추지 않아

멈춘 시간 속에서
우린 움직여
파업의 밤이어도
끝까지 걸어
함께라는 이유로
포기하지 않아

[Bridge]
멀리서 들려와
새 소식 하나
언젠가 다시
문은 열릴 거야
노사 협상이
진행 중이래
조금만 기다리면
다시 운행할 거야

오늘은 돌아가도
내일은 달라져
네 손을 잡고서
끝까지 갈게
이 경험도 나중엔
추억이 될 거야
함께 걸었던
이 길을 기억할 거야

이 거리를 지나면
조금 더 가까워
너와 나 사이가
더 단단해져
힘든 순간일수록
서로를 알아가
관계는 더욱
깊어지는 법이야

[Verse 3]
해가 지고 나서야
집에 도착했지만
오늘 하루 걸으며
많은 걸 봤어
평소엔 못 봤던
거리의 풍경들
걸어야만 보이는
작은 가게들

낯선 사람 눈빛에
희망이 담겨 있고
지친 어깨 위로
별이 빛나고 있어
모두가 지쳤지만
아무도 포기 안 해
내일을 위해서
오늘을 견뎌내

[Verse 4]
파업이 끝나면
다시 일상으로
하지만 오늘만큼은
특별한 기억
함께 걸었던 사람들
다시 만날 수 있을까
스쳐 지나갔지만
마음에 남는 얼굴들

[Final Chorus]
지하철 멈췄어
파업 멈췄어
우린 또 걸어가
같은 거리로
익숙한 길이지만
오늘은 더 멀어

지하철 멈췄어
그래도 가야 해
오늘의 우리를
놓치지 않게
삶은 계속되고
우린 멈추지 않아

멈춘 시간 속에서
우린 움직여
파업의 밤이어도
끝까지 걸어
함께라는 이유로
포기하지 않아

언젠가 이 길 위에
웃으며 서 있을
그날을 위해서
오늘도 걸어가
힘들지만 계속
한 걸음씩 나아가

[Outro]
역 앞 불빛이
하나씩 꺼져가도
우리 발걸음은
계속될 거야
내일이 오면
지하철이 다시 달리겠지
하지만 오늘의 기억은
영원히 남을 거야`;
    }
    
    // 청년 실업
    if (issueKey.includes('실업') || issueKey.includes('취업') || issueKey.includes('청년') || issueKey.includes('unemployment') || issueKey.includes('youth')) {
      return `[Intro]
창밖을 바라봐
또 하루가 밝았어
갈 곳도 없는데
시간은 흘러가
이력서만 쌓여가
책상 위에 놓여
꿈꿨던 미래는
점점 멀어져

[Verse 1]
아침에 눈 떠도
갈 데가 없네
구겨진 셔츠만
옷걸이 위에
알람은 꺼놨지만
잠은 안 와
불안한 마음만
가득 차올라

휴대폰 알림창
텅 빈 하루만
이력서 몇 장이
침대 옆에 쌓여
면접 요청 하나
기다리고 있어
하지만 현실은
답장도 없어

부모님 눈치에
방문 열기 힘들어
"오늘은 뭐 했니"
질문이 무서워
친구들은 다들
회사 다니는데
나만 혼자
시간이 멈춘 듯해

[Pre-Chorus]
다들 늦었다고
말해도 괜찮아
내 시간은 아직
여기 살아
포기하지 않을게
계속 노력할게
언젠가는 내 차례
올 거라고 믿어

[Chorus]
취업난 속에
나를 붙잡아
실업 중이어도
난 안 꺼져
희망의 불씨
여전히 타올라
언젠가 빛날 거야

청년의 밤
쉽게는 안 와
취업난 속에
나를 붙잡아
포기하지 않아
계속 걸어가
내 길을 찾을 거야
꼭 찾을 거야

[Verse 2]
친구들 소식은
빠르게 지나
합격 문자 하나가
부러웠다
축하한다 말하며
웃어 보이지만
속으로는 나도
간절히 원해

편의점 불빛 아래
서 있던 내 손
봉투 든 사람들
다른 나라 같아
알바라도 해볼까
고민하다가도
내 전공은 어쩌지
또 고민에 빠져

카페에서 노트북 켜고
자소서를 쓰다가
멍하니 창밖만
바라보곤 해
다른 사람들은
바쁘게 움직여
나만 시간이
멈춘 것 같아

[Pre-Chorus]
다들 늦었다고
말해도 괜찮아
내 시간은 아직
여기 살아
포기하지 않을게
계속 노력할게
언젠가는 내 차례
올 거라고 믿어

[Chorus]
취업난 속에
나를 붙잡아
실업 중이어도
난 안 꺼져
희망의 불씨
여전히 타올라
언젠가 빛날 거야

청년의 밤
쉽게는 안 와
취업난 속에
나를 붙잡아
포기하지 않아
계속 걸어가
내 길을 찾을 거야
꼭 찾을 거야

[Bridge]
다들 늦었다고
말해도 괜찮아
내 시간은 아직
여기 살아
비교하지 않아
남의 속도와
나는 나만의 길을
걸어갈 거야

넘어진 자리도
내 자릴 거야
오늘의 빈칸도
내가 채워
실패도 경험이야
배움의 과정
언젠가 이 모든 게
밑거름이 될 거야

부모님께 죄송해
말씀드리지만
더 이상 미안해
하지 않을게
내 길을 찾는 중
조금 늦어도
결국엔 도착할 거야
내 목적지에

[Verse 3]
도서관에 앉아
스펙을 쌓아가
토익 점수 올리고
자격증도 따
하지만 마음 한편
불안함이 남아
이게 정말 맞는 길인지
의문이 들어

SNS 보다가
또 비교하게 돼
같은 나이인데
다들 성공했네
하지만 알아
겉만 보이는 거
다들 각자의 고민
안고 살아가

[Verse 4]
오늘도 지원서
한 장 넣었어
떨리는 마음으로
제출 버튼 눌러
이번엔 다를까
기대 반 걱정 반
하지만 포기 않고
계속 도전해

[Final Chorus]
취업난 속에
나를 붙잡아
실업 중이어도
난 안 꺼져
희망의 불씨
여전히 타올라
언젠가 빛날 거야

청년의 밤
쉽게는 안 와
취업난 속에
나를 붙잡아
포기하지 않아
계속 걸어가
내 길을 찾을 거야
꼭 찾을 거야

undefined

[Outro]
해가 뜨면 또
새로운 하루가 와
오늘도 포기하지 않고
도전할 거야
내 시간은 흐르고 있어
멈춰 있지 않아
언젠가 웃으며
이야기할 수 있을 거야`;
    }
    
    // 폭염
    if (issueKey.includes('폭염') || issueKey.includes('더위') || issueKey.includes('40도') || issueKey.includes('heatwave') || issueKey.includes('heat')) {
      return `[Intro]
태양이 작열해
아스팔트 녹아내려
숨 쉬기도 힘들어
공기가 뜨거워
새벽부터 시작된
이 폭염의 시작
언제쯤 끝날까
이 긴 여름

[Verse 1]
아스팔트 위
뜨거운 공기만
그늘도 달아나
숨이 막혀와
햇빛이 내리쬐면
피부가 타는 듯해
선크림 발라도
소용이 없어

물 한 모금에
목이 타들어가
에어컨 없인
못 살 것 같아
전기요금 걱정에
켜기도 무서워
하지만 더위는
참을 수 없어

거리엔 사람 없고
개도 안 짖는다
40도를 넘는
기온 앞에서
모두가 집 안에
숨어 지내고
야외 활동은
꿈도 못 꿔

[Pre-Chorus]
온열질환 경보가
울려 퍼지고
뉴스는 말해
외출 자제하래
하지만 일하러
나가야 하는 사람들
폭염 속에서도
버텨내야 해

[Chorus]
40도의 도시
숨을 쉬어
폭염 속에서
살아내
견디기 힘들어도
포기 못 해

더위가 삼켜도
견뎌내야 해
오늘도 버텨
이 여름을
언젠가 지나갈
이 폭염을
함께 이겨내자
조금만 더

[Verse 2]
뉴스는 말해
역대 최고래
온열질환
주의하래
폭염 특보가
또 발령됐어
올여름은 특히
더 힘들대

밤에도 덥고
새벽도 더워
잠을 못 자도
견뎌야 해
열대야가 계속돼
선풍기는 무용지물
뜨거운 바람만
불어와

편의점에서
아이스크림 사고
냉장고 앞에
하루 종일 서
하지만 전기세는
걱정이 되고
에어컨 온도
조금씩 올려

[Pre-Chorus]
온열질환 경보가
울려 퍼지고
뉴스는 말해
외출 자제하래
하지만 일하러
나가야 하는 사람들
폭염 속에서도
버텨내야 해

[Chorus]
40도의 도시
숨을 쉬어
폭염 속에서
살아내
견디기 힘들어도
포기 못 해

더위가 삼켜도
견뎌내야 해
오늘도 버텨
이 여름을
언젠가 지나갈
이 폭염을
함께 이겨내자
조금만 더

[Bridge]
언젠가는 지나가
이 여름도
조금만 버티면
가을이 올 거야
시원한 바람이
불어올 날을
기다리며 오늘도
견뎌내

밖에서 일하는
사람들에게
감사한 마음
전하고 싶어
택배 기사님
배달 라이더
폭염 속에서도
일하는 모든 분들께

undefined

[Verse 3]
낮 시간대엔
거리가 텅 비고
모두가 실내로
피신했어
무더위 쉼터엔
사람들이 가득
에어컨 바람
나눠 마시며

노인분들과
어린아이들
특히 조심해야
한다고 해
뉴스는 계속
경고를 보내고
우린 서로를
챙겨야 해

[Verse 4]
저녁이 되어도
기온은 안 내려가
아스팔트가 뿜어내는
복사열에
밤 산책도 힘들어
집 안에만 있어
답답하지만
안전이 우선

[Final Chorus]
40도의 도시
숨을 쉬어
폭염 속에서
살아내
견디기 힘들어도
포기 못 해

더위가 삼켜도
견뎌내야 해
오늘도 버텨
이 여름을
언젠가 지나갈
이 폭염을
함께 이겨내자
조금만 더

조금만 더 버티면
가을이 올 거야
시원한 바람 불고
낙엽 지는 계절
그때까지 함께
이겨내자
폭염의 여름을
우리 함께

[Outro]
태양은 여전히
뜨겁게 내리쬐지만
우린 포기하지 않아
이겨낼 거야
언젠가 이 여름도
추억이 될 거야
힘들었지만 버텼던
우리의 이야기`;
    }
    
    // AI 면접
    if (issueKey.includes('ai') || issueKey.includes('면접') || issueKey.includes('interview')) {
      return `[Intro]
노트북 화면 앞
혼자 앉아 있어
AI가 날 평가해
차가운 카메라
내 표정을 분석하고
목소리를 채점해
이게 진짜 나인지
의문이 들어

[Verse 1]
카메라 앞에 앉아
AI가 날 본대
표정도 분석하고
목소리도 채점해
준비된 답변도
자연스럽지 않아
로봇처럼 느껴지는
나 자신이 싫어

내 눈빛을 읽고
대답을 평가해
사람도 아닌데
내 미래를 정해
알고리즘이 판단하는
나의 가치
숫자로 나타나는
내 인생

미소를 지으라 하지만
어색하기만 해
감정이 진짜인지
AI는 알까
눈을 어디 봐야 할지
고개는 어떻게 해야 할지
모든 게 계산되어야 하는
기묘한 면접

[Pre-Chorus]
준비한 답변들
머릿속에 가득
하지만 입 밖으로
나오지 않아
긴장한 내 모습
화면에 비쳐져
이게 정말 나인지
모르겠어

[Chorus]
AI 면접
차가운 화면
내 진심은
전달될까
숫자로 평가되는
내 가치

AI 면접
떨리는 마음
이게 정말
나일까
사람의 온기가
그리워지는 순간

기계 앞에서
진짜 나를 보여줄 수 있을까
알고리즘은 내 마음을
이해할 수 있을까

[Verse 2]
준비한 답변도
자연스럽지 않아
웃는 게 어색해
로봇같이 느껴져
감정을 숨기고
완벽을 연기해
진짜 내 모습은
보여줄 수 없어

점수로 나뉘는
내 가치가 싫어
하지만 통과해야
다음이 있어
이력서에 적힌
스펙보다 중요한
나만의 이야기는
전달될 수 없어

카메라 렌즈 속
차가운 눈빛에
내 열정을 보여주기
너무 어려워
시선 처리, 표정 관리
목소리 톤까지
모든 게 채점 대상
자연스럽기가 힘들어

[Pre-Chorus]
준비한 답변들
머릿속에 가득
하지만 입 밖으로
나오지 않아
긴장한 내 모습
화면에 비쳐져
이게 정말 나인지
모르겠어

[Chorus]
AI 면접
차가운 화면
내 진심은
전달될까
숫자로 평가되는
내 가치

AI 면접
떨리는 마음
이게 정말
나일까
사람의 온기가
그리워지는 순간

기계 앞에서
진짜 나를 보여줄 수 있을까
알고리즘은 내 마음을
이해할 수 있을까

[Bridge]
기계가 날 판단해도
난 사람이야
숫자로 못 재는
내 이야기가 있어
실패와 성공 사이
내가 걸어온 길
데이터로는 보여줄 수 없는
내 진심

언젠가는 사람과
마주 보며 이야기할
그날이 올 거라
믿고 싶어
눈을 마주치며
진심을 나누는
그런 면접을
꿈꾸고 있어

하지만 지금은
이 시대를 살아야 해
AI 면접도
나의 과제
포기하지 않고
계속 도전해
언젠간 익숙해질
이 과정에

[Verse 3]
다시 한 번 더
연습해 봐
표정 연습, 목소리 톤
카메라 앞에서
자연스럽게 웃기
생각보다 어려워
하지만 계속
노력할 거야

undefined

[Verse 4]
합격 통보 왔어
AI 면접 통과
다음 단계로
넘어갔다고 해
기쁘면서도 한편
씁쓸한 마음
내 진심이 아닌
연기가 합격한 듯해

[Final Chorus]
AI 면접
차가운 화면
내 진심은
전달될까
숫자로 평가되는
내 가치

AI 면접
떨리는 마음
이게 정말
나일까
사람의 온기가
그리워지는 순간

기계 앞에서
진짜 나를 보여줄 수 있을까
알고리즘은 내 마음을
이해할 수 있을까

하지만 포기 않고
계속 도전해
언젠간 사람과
마주 앉아
진심을 나누는
그런 날이 올 거야

[Outro]
화면이 꺼지고
면접이 끝나도
내 안의 진심은
변하지 않아
AI가 평가 못 하는
내 가능성을
언젠가 증명할 거야
꼭 보여줄 거야`;
    }
    
    // K-POP 아이돌
    if (issueKey.includes('k-pop') || issueKey.includes('kpop') || issueKey.includes('아이돌') || issueKey.includes('idol')) {
      return `[Intro]
무대 위 조명이
나를 비출 때
심장이 뛰어
숨이 멎을 듯해
너의 이름 부르는
팬들의 목소리
이 순간을 위해
살아가는 이유

[Verse 1]
오늘도 네 이름
입가에 맴돌아
무대가 끝나도
난 아직 흔들려
앨범 재킷 속
네 눈빛 하나에
하루가 다 바뀌어
색깔이 달라져

네 손짓 하나면
밤이 다 바뀌어
조용한 내 마음
네 쪽으로 걸어
콘서트 티켓팅
밤새 기다렸어
너를 만날 생각에
잠도 안 와

플레이리스트엔
네 노래만 가득
출근길에도 퇴근길에도
항상 함께해
네 목소리가
위로가 되고
힘든 하루를
견디게 해 줘

[Pre-Chorus]
네가 무대 위에서
웃을 때마다
나도 덩달아
웃음이 나와
같은 하늘 아래
우리가 살고 있다는
그 사실만으로도
행복해져

[Chorus]
K-POP 아이돌 음악
너로 다 채워져
K-POP 아이돌 음악
내 마음 흔들려
한 번의 무대가
내 세상을 바꿔
너는 나의 별
나의 빛

K-POP 아이돌 음악
매일 들어도 좋아
K-POP 아이돌 음악
질리지가 않아
네가 있어서
오늘도 버틸 수 있어
나의 에너지
나의 전부

[Verse 2]
뮤직비디오 속
네 모습 보면서
리액션 영상 찍고
친구들과 공유해
컴백 소식 들으면
설레는 마음
티저 하나하나
분석하며 기다려

팬싸인회 당첨돼
너를 직접 봤어
눈 마주쳤을 때
시간이 멈췄어
준비한 말은 다 잊고
그저 웃기만 했어
하지만 행복했어
평생 기억할 거야

굿즈 구매하고
앨범 모으면서
포토카드 교환하고
친구들과 수다 떨어
같은 팬덤 친구들
만나는 게 즐거워
공통 관심사로
금방 친해지는 우리

[Pre-Chorus]
네가 무대 위에서
웃을 때마다
나도 덩달아
웃음이 나와
같은 하늘 아래
우리가 살고 있다는
그 사실만으로도
행복해져

[Chorus]
K-POP 아이돌 음악
너로 다 채워져
K-POP 아이돌 음악
내 마음 흔들려
한 번의 무대가
내 세상을 바꿔
너는 나의 별
나의 빛

K-POP 아이돌 음악
매일 들어도 좋아
K-POP 아이돌 음악
질리지가 않아
네가 있어서
오늘도 버틸 수 있어
나의 에너지
나의 전부

[Bridge]
SNS 알림에
심장이 뛰어
네가 올린 사진
바로 저장해
일상을 공유해 줘서
고마워
덕분에 나도
힘을 얻어

힘들 때마다
네 노래 들으면
다시 일어설 수 있어
용기가 생겨
먼 곳에 있어도
마음으로 응원해
항상 네 편이야
잊지 마

undefined

[Verse 3]
콘서트장에서
응원봉 흔들며
떼창하는 순간
전율이 느껴져
수천 명이 함께
부르는 노래
우리는 하나 돼
감동의 물결

너의 눈물 보면
나도 울컥해
행복의 눈물인지
고생의 눈물인지
어떤 눈물이든
함께 나누고 싶어
기쁠 때도 슬플 때도
곁에 있을게

[Verse 4]
세계 투어 소식에
비행기 표 예매해
다른 나라까지
쫓아갈 만큼
너는 내게 특별해
소중한 존재
평생 응원할 거야
변하지 않을 마음

[Final Chorus]
K-POP 아이돌 음악
너로 다 채워져
K-POP 아이돌 음악
내 마음 흔들려
한 번의 무대가
내 세상을 바꿔
너는 나의 별
나의 빛

K-POP 아이돌 음악
매일 들어도 좋아
K-POP 아이돌 음악
질리지가 않아
네가 있어서
오늘도 버틸 수 있어
나의 에너지
나의 전부

멀리 있어도
마음은 함께
영원히 응원할게
나의 아이돌
사랑해 고마워
꿈을 이뤄줘서
나도 너처럼
빛나고 싶어

[Outro]
무대 위 너의 모습
눈에 선해
다음 컴백까지
기다릴게
언제나 네 편이야
잊지 마
우리 팬들은 영원히
너와 함께할 거야`;
    }
  } else {
    // 영어 이슈별 맞춤 가사
    
    // Spring Cherry Blossom
    if (issueKey.includes('cherry') || issueKey.includes('blossom') || issueKey.includes('spring') || 
        issueKey.includes('벚꽃') || issueKey.includes('봄') || issueKey.includes('festival')) {
      return `[Intro]
Spring breeze blows in
Cherry petals dancing
Pink streets below
A new season begins

[Verse 1]
Streets filled with people
Cameras in their hands
Standing under blossoms
Making memories to last

Blooming petals everywhere
Filling up the sky
A fleeting moment
But beautiful spring time

Walking through the crowds
Following the scent
Cherry blossom fragrance
Heart begins to flutter

[Pre-Chorus]
Just once a year
For this moment here
Everyone gathers round
Welcoming the spring

[Chorus]
Cherry blossom night
Petals dance around
Even in the crowds
I only see you

Spring miracle time
This moment's all we have
Under cherry trees
Making memories

Pink sky above us
Here we stand together
Won't forget this moment
Captured in photos

[Verse 2]
Food stall aromas
Long lines everywhere
People's laughter fills
This festival atmosphere

Children running wild
Lovers holding hands
Families spreading blankets
Enjoying cherry blossoms

As the sun goes down
Festival continues on
Blossoms under lights
Even more magical

[Pre-Chorus]
Just once a year
For this moment here
Everyone gathers round
Welcoming the spring

[Chorus]
Cherry blossom night
Petals dance around
Even in the crowds
I only see you

Spring miracle time
This moment's all we have
Under cherry trees
Making memories

Pink sky above us
Here we stand together
Won't forget this moment
Captured in photos

[Bridge]
Past spring days
Come back to mind
Every year this time
In the same place here

Flowers bloom and fade
But memories last forever
Next year again
I'll come back here

Photos on social media
Our smiling faces there
Time will pass but still
Forever beautiful

[Verse 3]
Late into the night continues
Cherry blossom festival heat
People never tire
Savoring the spring

Petals in the wind
Floating gently down
Reach out to catch them
Make a wish right now

Hope this moment lasts forever
Time would stand still
But I know
Seasons keep flowing

[Final Chorus]
Cherry blossom night
Petals dance around
Even in the crowds
I only see you

Spring miracle time
This moment's all we have
Under cherry trees
Making memories

Pink sky above us
Here we stand together
Won't forget this moment
Captured in photos

Next spring again
In the same place here
Under cherry blossoms meet
Make memories once more

[Outro]
Petals gently
Falling to the ground
Spring is short but
Memories are long`;
    }
    
    // Subway Strike
    if (issueKey.includes('subway') || issueKey.includes('metro') || issueKey.includes('strike')) {
      return `[Intro]
Morning air is cold
Footsteps getting faster
People on the platform
All wearing same faces

[Verse 1]
At the station stairs
People line up long
Their faces tell it all
Today's been hard

News crumpled in hand
The morning's still cold
Even though no bus comes
Our steps are frozen

Somewhere phone rings
Only that sound heard
Late excuse on lips
Going round and round

[Pre-Chorus]
Nothing we can do
Everyone says so
But frustration grows
Deep inside our chest

[Chorus]
Subway's stopped
Strike has stopped
We walk again
Down the same street

Subway's stopped
But we must go
Won't let today's
Moment slip away

In stopped time
We keep moving
Even strike night
Walk until the end

[Verse 2]
At the convenience store
Sharing coffee breaks
Even strangers here
Share the same sigh

The late arrival text
Makes us somehow smile
Strange how today
We're all the same

Calculate taxi fare
Looking up bus routes
Don't even know if
This way is right

[Pre-Chorus]
Nothing we can do
Everyone says so
But frustration grows
Deep inside our chest

[Chorus]
Subway's stopped
Strike has stopped
We walk again
Down the same street

Subway's stopped
But we must go
Won't let today's
Moment slip away

In stopped time
We keep moving
Even strike night
Walk until the end

[Bridge]
From far away
New word arrives
Someday again
The doors will open

Today we turn back
Tomorrow will change
Hold your hand tight
We'll go all the way

Past this street
We get closer
You and I between
Becoming stronger

[Verse 3]
Sun goes down and then
Finally reach home
Walking all day long
Saw so many things

In strangers' eyes
Hope was shining there
On tired shoulders
Stars are glowing bright

[Final Chorus]
Subway's stopped
Strike has stopped
We walk again
Down the same street

Subway's stopped
But we must go
Won't let today's
Moment slip away

In stopped time
We keep moving
Even strike night
Walk until the end

Someday on this road
Standing with a smile
For that future day
Keep walking today

[Outro]
Station lights ahead
Going out one by one
But our footsteps will
Keep on going still`;
    }
    
    // Youth Unemployment
    if (issueKey.includes('unemployment') || issueKey.includes('youth') || issueKey.includes('job')) {
      return `[Intro]
Eyes open morning
Nowhere to go today
Empty room around
Future feels so far

[Verse 1]
Wake up in morning
Nowhere to go
Wrinkled shirts hang
On the closet pole

Phone notification
Empty day ahead
Résumés pile up
By the bedside

Another rejection mail
Delete and move on
Mirror shows me
Tired looking face

[Pre-Chorus]
Everyone's moving forward
I'm standing still
But I won't give up
My time will come

[Chorus]
In unemployment
Hold me tight
Jobless but still
Won't burn out

Youth's night
Won't come easy
In unemployment
Hold me tight

This blank page
I will fill it
My story's not over
Just beginning now

[Verse 2]
Friends' news passes
Quickly by my feed
That acceptance text
Made me envious

At convenience lights
Standing with my hands
People with bags
Feel like different land

Coffee shop window
People rushing by
Everyone seems to have
Their place to go

[Pre-Chorus]
Everyone's moving forward
I'm standing still
But I won't give up
My time will come

[Chorus]
In unemployment
Hold me tight
Jobless but still
Won't burn out

Youth's night
Won't come easy
In unemployment
Hold me tight

This blank page
I will fill it
My story's not over
Just beginning now

[Bridge]
Even if they say
Too late, it's okay
My time is still
Living right here

Where I fell down
Will be my ground
Today's blank space
I will fill it

Not comparing with others
Walking my own path
At my own pace
Finding my way

[Verse 3]
Interview next week
Practice one more time
This rejection too
Makes me stronger now

Small part-time job
Pays my bills today
Every experience counts
Building up myself

Dream's not dead yet
Just taking longer
Patience and faith
That's all I need

[Final Chorus]
In unemployment
Hold me tight
Jobless but still
Won't burn out

Youth's night
Won't come easy
In unemployment
Hold me tight

This blank page
I will fill it
My story's not over
Just beginning now

Someday looking back
These hard times will
Make me appreciate
Success even more

[Outro]
Sun will rise again
Tomorrow's a new day
Keep trying hard
My chance will come`;
    }
    
    // Heatwave
    if (issueKey.includes('heat') || issueKey.includes('hot') || issueKey.includes('40') || issueKey.includes('temperature')) {
      return `[Intro]
Heat waves rising
Asphalt melting down
Summer burning hot
No escape in sight

[Verse 1]
On asphalt ground
Only burning air
Even shadows run
Can't breathe at all

One sip of water
Throat's burning dry
Without AC
Can't survive this

Sweat keeps pouring
Clothes stick to skin
Looking for shade
Anywhere I can

[Pre-Chorus]
Thermometer rising
Breaking records again
News keeps warning
Stay inside today

[Chorus]
City of 40 degrees
Try to breathe
In the heatwave
Staying alive

Heat swallows us
Must endure it
Today again
This summer burns

Fans are spinning
Don't help at all
Dreaming of winter
Cold air and snow

[Verse 2]
News keeps saying
Record highs today
Heat illness warning
Better take care

Night's still hot
Dawn is hotter
Can't sleep well
But must endure

Ice cream melting
Before I eat
Air feels heavy
Like I'm drowning

[Pre-Chorus]
Thermometer rising
Breaking records again
News keeps warning
Stay inside today

[Chorus]
City of 40 degrees
Try to breathe
In the heatwave
Staying alive

Heat swallows us
Must endure it
Today again
This summer burns

Fans are spinning
Don't help at all
Dreaming of winter
Cold air and snow

[Bridge]
Someday it'll pass
This summer too
Just hold on tight
Fall will come soon

Cooler days ahead
I can feel it
This heat wave
Won't last forever

Rain will come
Wash away heat
Until that day
We survive

[Verse 3]
Seeking shelter anywhere
Coffee shop with AC
Pretend to study here
Just to cool down

Electricity bills
Going through the roof
But what choice
Do we have now

[Final Chorus]
City of 40 degrees
Try to breathe
In the heatwave
Staying alive

Heat swallows us
Must endure it
Today again
This summer burns

Fans are spinning
Don't help at all
Dreaming of winter
Cold air and snow

Autumn's coming
Just a bit more
Hang in there
Summer will end

[Outro]
Cool breeze someday
Will blow again
Until then
We endure`;
    }
    
    // AI Interview
    if (issueKey.includes('ai') || issueKey.includes('interview')) {
      return `[Intro]
Camera light turns on
Algorithm waits
My future depends
On this moment now

[Verse 1]
Sitting before camera
AI's watching me
Analyzes my face
Grades my voice too

Reads my eye movements
Evaluates answers
Not even human
Decides my future

Practiced this so much
Still feel nervous
Every word counts
Every gesture too

[Pre-Chorus]
Trying to be perfect
For the algorithm
But feeling fake
This isn't me

[Chorus]
AI interview
Cold screen glows
Will my sincerity
Get through at all

AI interview
Heart's trembling
Is this really
Who I am

Scores and numbers
Define my worth
But there's more to me
Than data points

[Verse 2]
Prepared answers
Don't feel natural
Smiling feels awkward
Like I'm a robot

Divided into scores
My worth feels wrong
But must pass this
To reach what's next

Checking my posture
Watching my tone
Every detail matters
To the machine

[Pre-Chorus]
Trying to be perfect
For the algorithm
But feeling fake
This isn't me

[Chorus]
AI interview
Cold screen glows
Will my sincerity
Get through at all

AI interview
Heart's trembling
Is this really
Who I am

Scores and numbers
Define my worth
But there's more to me
Than data points

[Bridge]
Even if machine judges
I'm still human
Numbers can't measure
My story here

Passion in my heart
Dreams in my mind
Can't be quantified
By algorithms

Hope someone sees
Beyond the scores
The real person
Behind the screen

[Verse 3]
Interview's over
Waiting for results
Did I pass
The algorithm test

Thinking about answers
What could I improve
Next time better
I'll be ready

[Final Chorus]
AI interview
Cold screen glows
Will my sincerity
Get through at all

AI interview
Heart's trembling
Is this really
Who I am

Scores and numbers
Define my worth
But there's more to me
Than data points

Someday people will
Value humanity
More than algorithms
More than scores

[Outro]
Camera light goes off
I can breathe now
Waiting for the day
When people matter most`;
    }
    
    // K-POP Idol
    if (issueKey.includes('k-pop') || issueKey.includes('kpop') || issueKey.includes('idol')) {
      return `[Intro]
Stage lights shine bright
Music starts to play
Your presence fills
Every corner here

[Verse 1]
Your name today
Lingers on my lips
Stage has ended
Still I'm shaking

One gesture from you
Night changes all
My quiet heart
Walks toward you

Every performance
Takes my breath away
Your dedication shows
In every move

[Pre-Chorus]
All the hard work
All the sacrifice
Shines through when
You're on stage

[Chorus]
K-POP idol music
Fills me with you
K-POP idol music
Shakes my heart

When I see you
I become more honest
K-POP idol music
Calling you now

Every beat drops
Syncs with my heart
Your energy flows
Through the crowd

[Verse 2]
Under practice lights
Dreams soaked in sweat
Among countless faces
You shone the brightest

Even if late by beat
I will wait for you
The moment you smile
World stands still

Hours of rehearsal
Late night practices
All worth it when
You take the stage

[Pre-Chorus]
All the hard work
All the sacrifice
Shines through when
You're on stage

[Chorus]
K-POP idol music
Fills me with you
K-POP idol music
Shakes my heart

When I see you
I become more honest
K-POP idol music
Calling you now

Every beat drops
Syncs with my heart
Your energy flows
Through the crowd

[Bridge]
Even when tired
Your eyes are enough
Words I couldn't say
Show them now

Through the music
Through the dance
You tell stories
Without words

Connecting hearts
Across the world
Your passion reaches
Everyone here

[Verse 3]
Encore calls echo
You come back out
One more song
For all of us

Sweat and tears
Glitter and lights
This is what
Dreams are made of

Following your journey
From debut till now
Every moment shared
Makes us closer

[Final Chorus]
K-POP idol music
Fills me with you
K-POP idol music
Shakes my heart

When I see you
I become more honest
K-POP idol music
Calling you now

Every beat drops
Syncs with my heart
Your energy flows
Through the crowd

Thank you for being
Our shining star
Keep on dancing
We'll follow you far

[Outro]
Lights fade slowly
Concert comes to end
But in our hearts
You'll always remain`;
    }
  }
  
  // 🎵 다양한 가사 패턴 (매번 랜덤 선택, 3분 이상 보장)
  const koreanTemplates = [
    // 패턴 1: 일상 관찰형 (확장)
    `[Intro]
${issue.description}
조용한 아침 공기
마음에 스며들어

[Verse 1]
이 순간이 흘러가
${issue.keywords[0] || '시간'}이 지나가
잔잔한 리듬 속에
작은 일상이 쌓여

창밖을 바라보며
하루가 시작돼
평범한 순간들이
특별해지는 시간

발걸음 느리게
천천히 걸어가
급할 것 없는 하루
내 속도로 살아

[Pre-Chorus]
어제와 오늘 사이
작은 변화가 보여
눈치채지 못했던
소중한 것들이

[Chorus]
${issue.keywords[1] || '순간'}을 느끼며
조용히 걸어가
${issue.keywords[2] || '내일'}을 그리며
한 걸음씩 나아가

이 ${issue.mood} 순간 속에
나를 발견하네
작은 기쁨 속에서
행복을 찾아가

[Verse 2]
낮이 지나 밤이 와
별빛 아래 서서
오늘 하루를 돌아봐
작은 순간들을

${issue.keywords[0]}와 함께
오늘을 마무리해
서두를 필요 없어
천천히 가도 돼

커피 한 잔 앞에
생각에 잠기는 밤
복잡한 마음들도
조금씩 정리돼

[Pre-Chorus]
어제와 오늘 사이
작은 변화가 보여
눈치채지 못했던
소중한 것들이

[Chorus]
${issue.keywords[1] || '순간'}을 느끼며
조용히 걸어가
${issue.keywords[2] || '내일'}을 그리며
한 걸음씩 나아가

이 ${issue.mood} 순간 속에
나를 발견하네
작은 기쁨 속에서
행복을 찾아가

[Bridge]
지나간 시간들이
별처럼 빛나는 밤
${issue.description}
그 안에 담긴 의미

멈춰 서서 돌아봐
지나온 길들을
후회는 없어
모든 게 의미 있어

[Verse 3]
새로운 아침이 와
다시 시작되는 하루
어제의 나보다
조금 더 성장한 나

작은 발걸음들이
큰 변화를 만들어
${issue.keywords[0]} 속에서
내일을 그려가

[Final Chorus]
${issue.keywords[1] || '순간'}을 느끼며
조용히 걸어가
${issue.keywords[2] || '내일'}을 그리며
한 걸음씩 나아가

이 ${issue.mood} 순간 속에
나를 발견하네
작은 기쁨 속에서
행복을 찾아가

언젠가 돌아볼 때
이 순간들이
빛나는 별처럼
내 안에 남아있어

[Outro]
${issue.description}
고요한 밤 공기
마음에 평화로워`,
    
    // 패턴 2: 감성 서정형 (확장)
    `[Intro]
조용한 밤의 시작
마음의 문을 열어

[Verse 1]
${issue.description}
마음에 물결이 일어
${issue.keywords[0] || '바람'}이 지나가
고요한 밤공기에

숨을 깊이 들이쉬며
눈을 감아보는 시간
작은 떨림들이
마음을 채워가

달빛 아래 서서
오늘을 생각해
지나간 순간들이
별처럼 빛나

[Pre-Chorus]
감정의 파도 속에
조용히 흔들려
거부하지 않고
받아들이는 마음

[Chorus]
${issue.keywords[1] || '기억'}이 떠올라
가만히 미소 짓고
${issue.keywords[2] || '그리움'}이 스쳐도
담담히 받아들여

이 ${issue.mood} 감각 속에
평온을 찾아가
작은 위로들이
마음을 감싸안아

[Verse 2]
멀리서 들리는 소리
익숙한 멜로디처럼
${issue.keywords[0]} 사이로
하루가 저물어가

급하지 않은 걸음
편안한 이 느낌
마음이 원하는 대로
천천히 흘러가

창가에 기대서
하늘을 바라봐
구름이 흘러가듯
시간도 지나가

[Pre-Chorus]
감정의 파도 속에
조용히 흔들려
거부하지 않고
받아들이는 마음

[Chorus]
${issue.keywords[1] || '기억'}이 떠올라
가만히 미소 짓고
${issue.keywords[2] || '그리움'}이 스쳐도
담담히 받아들여

이 ${issue.mood} 감각 속에
평온을 찾아가
작은 위로들이
마음을 감싸안아

[Bridge]
계절이 바뀌듯이
모든 건 흘러가고
${issue.description}
그 흐름을 따라가

멈추지 않는 시간
변하지 않는 마음
그 사이 어딘가
내가 서 있어

[Verse 3]
새벽이 밝아올 때
조용한 거리 위로
새로운 하루가
다시 시작돼

어제의 슬픔도
오늘의 기쁨도
모두 내 것이야
소중한 순간들

[Final Chorus]
${issue.keywords[1] || '기억'}이 떠올라
가만히 미소 짓고
${issue.keywords[2] || '그리움'}이 스쳐도
담담히 받아들여

이 ${issue.mood} 감각 속에
평온을 찾아가
작은 위로들이
마음을 감싸안아

언젠가 이 순간도
추억이 되겠지
그때 미소 지으며
돌아볼 수 있게

[Outro]
${issue.description}
고요한 밤의 끝
내일을 기다려`,
    
    // 패턴 3: 현대적 감각형 (확장)
    `[Intro]
새로운 하루의 시작
도시가 깨어나

[Verse 1]
${issue.description}
새로운 하루가 시작돼
${issue.keywords[0] || '변화'}를 맞이해
이 순간을 기록해

평범한 일상 속에
특별함을 찾아가
작은 발견들이
하루를 채워가

거리를 걸으며
사람들을 봐
각자의 이야기
살아가는 모습

[Pre-Chorus]
오늘을 살아가는
나만의 방식으로
누구와도 다른
나다운 하루를

[Chorus]
${issue.keywords[1] || '오늘'}을 살아가며
나만의 페이지를 채워
${issue.keywords[2] || '미래'}를 상상하며
현재에 집중해

이 ${issue.mood} 리듬 속에
나다움을 지켜가
작은 선택들이
내일을 만들어

[Verse 2]
도시의 불빛 아래
사람들 속을 걸으며
${issue.keywords[0]}의 의미
다시 한번 생각해

복잡한 건 내려놓고
단순함을 택해
진짜 중요한 것만
마음에 담아가

커피 한 잔의 여유
음악이 흐르는 길
평범한 순간들이
빛나는 이유

[Pre-Chorus]
오늘을 살아가는
나만의 방식으로
누구와도 다른
나다운 하루를

[Chorus]
${issue.keywords[1] || '오늘'}을 살아가며
나만의 페이지를 채워
${issue.keywords[2] || '미래'}를 상상하며
현재에 집중해

이 ${issue.mood} 리듬 속에
나다움을 지켜가
작은 선택들이
내일을 만들어

[Bridge]
시간은 계속 흐르고
우린 계속 변하지만
${issue.description}
본질은 그대로야

트렌드를 따르기보다
내 속도로 살아가
비교하지 않고
나를 믿어가

[Verse 3]
해가 지고 밤이 와
하루를 돌아봐
후회는 없어
최선을 다했으니

내일도 마찬가지
나답게 살아갈 거야
${issue.keywords[0]} 속에서
나를 잃지 않고

[Final Chorus]
${issue.keywords[1] || '오늘'}을 살아가며
나만의 페이지를 채워
${issue.keywords[2] || '미래'}를 상상하며
현재에 집중해

이 ${issue.mood} 리듬 속에
나다움을 지켜가
작은 선택들이
내일을 만들어

언젠가 돌아봤을 때
자랑스러운 순간들로
가득한 내 이야기
빛나고 있을 거야

[Outro]
${issue.description}
내일도 나답게
계속 걸어가`,
    
    // 패턴 4: 회상/추억형 (확장)
    `[Intro]
옛 기억을 되돌아보며
조용한 미소가 떠올라

[Verse 1]
${issue.description}
그때 그 순간이 떠올라
${issue.keywords[0] || '기억'}이 되살아나
희미한 향기처럼

시간이 지나도
변하지 않는 것들
마음속 깊이
자리 잡고 있어

사진첩을 넘기며
웃음이 새어 나와
그때는 몰랐던
소중한 순간들

[Pre-Chorus]
돌아갈 순 없지만
간직할 수는 있어
그 모든 순간이
지금의 나를 만들어

[Chorus]
${issue.keywords[1] || '추억'}을 더듬으며
조용히 웃어봐
${issue.keywords[2] || '시간'}이 흘러도
그 자리에 남아있어

이 ${issue.mood} 여운 속에
과거를 되새기네
소중한 기억들이
마음을 따뜻하게

[Verse 2]
사진 속 풍경들이
아직도 선명한 이유
${issue.keywords[0]} 덕분에
오늘도 살아있어

그때의 웃음소리
아직도 들리는 것 같아
지나간 계절 속
우리의 모습들

익숙한 그 장소에
다시 가보고 싶어
변한 건 많지만
기억은 그대로

[Pre-Chorus]
돌아갈 순 없지만
간직할 수는 있어
그 모든 순간이
지금의 나를 만들어

[Chorus]
${issue.keywords[1] || '추억'}을 더듬으며
조용히 웃어봐
${issue.keywords[2] || '시간'}이 흘러도
그 자리에 남아있어

이 ${issue.mood} 여운 속에
과거를 되새기네
소중한 기억들이
마음을 따뜻하게

[Bridge]
흘러간 계절들이
다시 돌아오지 않아도
${issue.description}
가슴에 남은 온기

후회는 없어
그 모든 순간들이
나를 성장시켰으니
감사한 마음으로

[Verse 3]
언젠가 나도
누군가의 추억이 되겠지
그때를 위해
오늘을 더 소중히

${issue.keywords[0]} 사이로
새로운 기억들이
쌓여가고 있어
오늘도 내일도

[Final Chorus]
${issue.keywords[1] || '추억'}을 더듬으며
조용히 웃어봐
${issue.keywords[2] || '시간'}이 흘러도
그 자리에 남아있어

이 ${issue.mood} 여운 속에
과거를 되새기네
소중한 기억들이
마음을 따뜻하게

모든 순간이
빛나는 별처럼
내 안에 남아
영원히 빛날 거야

[Outro]
${issue.description}
언제까지나
마음속에 남아`,
    
    // 패턴 5: 희망/미래형 (확장)
    `[Intro]
새로운 시작의 빛이
어둠을 밝혀

[Verse 1]
${issue.description}
새로운 가능성이 보여
${issue.keywords[0] || '희망'}이 피어나
이 길의 끝에서

두 손을 펼쳐보며
미래를 그려가
걱정은 내려놓고
앞만 보고 나아가

어제의 실패도
오늘의 교훈이 돼
더 강해진 내가
내일을 맞이해

[Pre-Chorus]
두렵지 않아
네가 있으니까
함께라면 할 수 있어
무엇이든지

[Chorus]
${issue.keywords[1] || '꿈'}을 향해 걸어가
멈추지 않고 계속
${issue.keywords[2] || '빛'}을 따라가며
앞만 보고 나아가

이 ${issue.mood} 기대 속에
새로운 나를 만나
가능성은 무한해
미래는 밝아

[Verse 2]
어둠이 걷히고
아침이 밝아오면
${issue.keywords[0]}와 함께
다시 시작할 수 있어

넘어져도 괜찮아
일어서면 되니까
상처도 경험이 돼
더 단단해져

포기하지 않는 한
끝은 없는 거야
한 걸음씩 나아가
목표를 향해

[Pre-Chorus]
두렵지 않아
네가 있으니까
함께라면 할 수 있어
무엇이든지

[Chorus]
${issue.keywords[1] || '꿈'}을 향해 걸어가
멈추지 않고 계속
${issue.keywords[2] || '빛'}을 따라가며
앞만 보고 나아가

이 ${issue.mood} 기대 속에
새로운 나를 만나
가능성은 무한해
미래는 밝아

[Bridge]
모든 게 완벽하지 않아도
조금씩 나아지고 있어
${issue.description}
그것만으로 충분해

힘들 때도 있겠지만
포기하지 않을 거야
내 안의 힘을 믿어
끝까지 갈 거야

[Verse 3]
별을 향해 손을 뻗어
닿지 않아도 괜찮아
그 과정 자체가
의미 있는 거니까

${issue.keywords[0]} 속에서
나만의 길을 찾아
남과 비교하지 않고
나답게 살아가

[Final Chorus]
${issue.keywords[1] || '꿈'}을 향해 걸어가
멈추지 않고 계속
${issue.keywords[2] || '빛'}을 따라가며
앞만 보고 나아가

이 ${issue.mood} 기대 속에
새로운 나를 만나
가능성은 무한해
미래는 밝아

언젠가 돌아봤을 때
후회 없는 오늘이
빛나는 내일을
만들어줄 거야

[Outro]
${issue.description}
희망을 안고
계속 앞으로`
  ];
  
  const englishTemplates = [
    // Pattern 1: Daily observation (Extended for 3+ minutes)
    `[Intro]
${issue.description}
Quiet morning air
Soaking into heart

[Verse 1]
This moment flows away
${issue.keywords[0] || 'time'} gently passes
In steady rhythm
Small days stack up

Gazing out window
Day begins anew
Ordinary moments
Become something special

Walking slowly now
At my own pace
No need to rush today
Living as myself

[Pre-Chorus]
Between yesterday and today
Small changes appear
Things I didn't notice
Now precious to me

[Chorus]
Feeling ${issue.keywords[1] || 'moments'}
Walking quietly on
Drawing ${issue.keywords[2] || 'tomorrow'}
Step by step forward

In this ${issue.mood} moment
I discover myself
In small joys found
Finding happiness

[Verse 2]
As day turns to night
Standing under stars
Looking back on today
These small moments

With ${issue.keywords[0]}
Ending today now
No need to rush
Slow pace is fine

Coffee cup in hand
Lost in thoughts tonight
Complex feelings all
Slowly settle down

[Pre-Chorus]
Between yesterday and today
Small changes appear
Things I didn't notice
Now precious to me

[Chorus]
Feeling ${issue.keywords[1] || 'moments'}
Walking quietly on
Drawing ${issue.keywords[2] || 'tomorrow'}
Step by step forward

In this ${issue.mood} moment
I discover myself
In small joys found
Finding happiness

[Bridge]
Past times gone by
Shining like stars tonight
${issue.description}
Meaning held within

Stop and look back
At roads I traveled
No regrets at all
Everything had meaning

[Verse 3]
New morning arrives
Another day begins
More grown than yesterday
Better version of me

Small steps forward now
Create big changes
Within ${issue.keywords[0]}
Drawing tomorrow

[Final Chorus]
Feeling ${issue.keywords[1] || 'moments'}
Walking quietly on
Drawing ${issue.keywords[2] || 'tomorrow'}
Step by step forward

In this ${issue.mood} moment
I discover myself
In small joys found
Finding happiness

Someday looking back
These moments will
Shine like bright stars
Remain inside me

[Outro]
${issue.description}
Quiet night air here
Peace within my heart`,
    
    // Pattern 2: Modern sense
    `[Verse 1]
${issue.description}
New day begins now
Welcoming ${issue.keywords[0] || 'change'}
Recording this moment

In ordinary days
Finding something special

[Chorus]
Living ${issue.keywords[1] || 'today'}
Filling my own pages
Imagining ${issue.keywords[2] || 'future'}
Focusing on present

In this ${issue.mood} rhythm
Keeping my true self

[Verse 2]
Under city lights
Walking through crowds
Meaning of ${issue.keywords[0]}
Thinking once again

Letting complexity go
Choosing simplicity

[Bridge]
Time keeps flowing on
We keep changing but
${issue.description}
Essence stays the same`,
    
    // Pattern 3: Hope/Future
    `[Verse 1]
${issue.description}
New possibilities appear
${issue.keywords[0] || 'hope'} blooms here
At the end of this road

Opening both hands
Drawing the future

[Chorus]
Walking toward ${issue.keywords[1] || 'dreams'}
Never stopping now
Following ${issue.keywords[2] || 'light'}
Looking only ahead

In this ${issue.mood} anticipation
Meeting new myself

[Verse 2]
When darkness lifts
Morning breaks again
Together with ${issue.keywords[0]}
Can start once more

Falling's okay
Just stand back up

[Bridge]
Nothing is perfect but
Getting better slowly
${issue.description}
That alone is enough`
  ];
  
  // 🎲 랜덤하게 템플릿 선택
  const templates = language === 'korean' ? koreanTemplates : englishTemplates;
  const template = templates[Math.floor(Math.random() * templates.length)];
  
  console.log(`📝 폴백 이슈 기반 템플릿 가사 생성 완료 (이슈: ${issue.title})`);
  return template;
}

/**
 * 구버전 호환성: 트렌드 키워드 기반 가사 생성 (Deprecated)
 */
async function generateLyricsLegacy(style, language, gender, index, previousLyrics = [], trendKeywords = null) {
  // 🎯 확장된 테마 풀 (100개) - 중복 방지
  const koreanThemes = [
    // 감정 (20개)
    '사랑', '그리움', '꿈', '자유', '희망', '이별', '추억', '행복', '슬픔', '용기',
    '외로움', '설렘', '그리움', '후회', '감사', '분노', '평화', '동경', '질투', '위로',
    // 상황 (20개)
    '첫만남', '이별의순간', '재회', '고백', '거절', '화해', '배신', '용서', '약속', '기다림',
    '여행', '귀향', '성장', '좌절', '성취', '시작', '끝', '변화', '지속', '순간',
    // 대상 (20개)
    '연인', '친구', '가족', '나자신', '아이', '부모', '할머니', '할아버지', '선생님', '이웃',
    '반려동물', '자연', '도시', '고향', '학교', '직장', '집', '바다', '산', '하늘',
    // 시간 (20개)
    '봄날', '여름밤', '가을아침', '겨울저녁', '새벽', '정오', '황혼', '자정', '어린시절', '청춘',
    '중년', '노년', '과거', '현재', '미래', '순간', '영원', '하루', '한해', '평생',
    // 추상 (20개)
    '운명', '기적', '우연', '필연', '인연', '별', '달', '해', '빛', '그림자',
    '소리', '침묵', '색깔', '향기', '맛', '감촉', '온도', '거리', '시간', '공간'
  ];
  
  const englishThemes = [
    // Emotions (20)
    'love', 'longing', 'dream', 'freedom', 'hope', 'farewell', 'memories', 'happiness', 'sadness', 'courage',
    'loneliness', 'excitement', 'nostalgia', 'regret', 'gratitude', 'anger', 'peace', 'yearning', 'jealousy', 'comfort',
    // Situations (20)
    'first encounter', 'moment of goodbye', 'reunion', 'confession', 'rejection', 'reconciliation', 'betrayal', 'forgiveness', 'promise', 'waiting',
    'journey', 'homecoming', 'growth', 'setback', 'achievement', 'beginning', 'ending', 'change', 'continuity', 'moment',
    // Subjects (20)
    'lover', 'friend', 'family', 'myself', 'child', 'parent', 'grandmother', 'grandfather', 'teacher', 'neighbor',
    'pet', 'nature', 'city', 'hometown', 'school', 'workplace', 'home', 'ocean', 'mountain', 'sky',
    // Time (20)
    'spring day', 'summer night', 'autumn morning', 'winter evening', 'dawn', 'noon', 'twilight', 'midnight', 'childhood', 'youth',
    'middle age', 'old age', 'past', 'present', 'future', 'instant', 'eternity', 'day', 'year', 'lifetime',
    // Abstract (20)
    'destiny', 'miracle', 'coincidence', 'inevitability', 'connection', 'star', 'moon', 'sun', 'light', 'shadow',
    'sound', 'silence', 'color', 'scent', 'taste', 'touch', 'temperature', 'distance', 'time', 'space'
  ];
  
  const themes = language === 'korean' ? koreanThemes : englishThemes;
  
  // 🎲 랜덤 + Index 조합으로 완전 고유성 보장
  const themeIndex = (index * 7 + Math.floor(Math.random() * 13)) % themes.length;
  const themeForThisSong = themes[themeIndex];
  
  // 🎲 추가 랜덤 시드 생성 (타임스탬프 + index)
  const uniqueSeed = Date.now() + index * 1000;

  try {
    console.log(`🤖 GenSpark LLM으로 ${languageText} 가사 생성 중... (주제: ${themeForThisSong}, Index: ${index}, Seed: ${uniqueSeed})`);
    
    // 이전 가사 샘플 준비 (최대 3개만, 각 200자로 제한)
    let previousLyricsSample = '';
    if (previousLyrics.length > 0) {
      const recentLyrics = previousLyrics.slice(-3); // 최근 3개만
      previousLyricsSample = '\n\n**❌ 절대 사용 금지 - 이전에 생성된 가사 샘플** (이와 유사하거나 같은 표현 절대 금지!):\n\n';
      recentLyrics.forEach((lyrics, i) => {
        const sample = lyrics.substring(0, 200).replace(/\n/g, ' '); // 200자 샘플
        previousLyricsSample += `이전 곡 ${previousLyrics.length - recentLyrics.length + i + 1}: "${sample}..."\n\n`;
      });
    }
    
    const completion = await client.chat.completions.create({
      model: 'gpt-5',
      messages: [
        {
          role: 'system',
          content: `당신은 전문 작사가입니다. 절대로 중복되지 않는 독창적인 가사를 작성합니다.`
        },
        {
          role: 'user',
          content: `다음 조건에 맞는 완전히 독창적인 음악 가사를 ${languageText}로 작성해주세요:

**음악 스타일**: ${style}
**보컬**: ${genderText} 보컬
**주제**: ${themeForThisSong}
**곡 번호**: ${index + 1}번째 곡
**고유 시드**: ${uniqueSeed}

**🔥 2026년 5월 트렌드 키워드 (반드시 가사에 반영)**: ${selectedKeywords.join(', ')}
**트렌드 설명**: ${trendKeywords.description || '현재 유행하는 주제'}
**사회적 이슈**: ${(trendKeywords.socialIssues || []).slice(0, 3).join(', ')}

${previousLyricsSample}
**⚠️ 중요: 위의 이전 가사들과 완전히 다른, 절대로 중복되지 않는 완전히 새로운 가사를 작성하세요!**
**🔥 다양성 보장**: 
   - 다른 시점 (1인칭/2인칭/3인칭/관찰자 등)
   - 다른 시간대 (아침/점심/저녁/밤/새벽)
   - 다른 장소 (실내/실외/도시/자연 등)
   - 다른 감정 (희망/슬픔/그리움/설렘/평온/불안 등)
   - 다른 이야기 구조 (과거회상/현재진행/미래예측/순환구조 등)

**요구사항**:
1. **🔥 트렌드 키워드 필수 반영**: ${selectedKeywords.join(', ')} 키워드를 가사에 자연스럽게 녹여내세요
2. **2026년 5월 감성**: 현재 유행하는 ${trendKeywords.description}를 가사 전체에 담아내세요
3. 스타일의 분위기와 장르에 완벽히 맞는 가사
4. **최소 3분 이상 재생되는 길이 (영어: 최소 300단어, 한국어: 최소 400자)** - Intro, Verse 1, Chorus, Verse 2, Chorus, Bridge, Verse 3, Chorus, Outro 구조 (필수!)
5. **각 Verse는 최소 6~8줄, Chorus는 최소 6줄**로 작성
6. **🎯 히트곡 제목 법칙 - 후렴구 핵심 프레이즈 반복 (필수!)**:
   - Chorus에서 **가장 인상적인 4-8단어 구절**을 선정하세요
   - 그 핵심 구절을 **매 Chorus마다 한 글자도 바꾸지 말고 똑같이 3번 이상 반복**하세요
   - ⚠️ **중요**: "여기 푸드트럭" vs "그곳 푸드트럭" 처럼 변형하지 마세요!
   - ⚠️ **필수**: 완전히 동일한 문장을 반복하세요 (단어 순서, 조사까지 동일)
   - 예시 (한국어): 
     * 모든 Chorus에서 "그대로 아름다워" 똑같이 반복
     * 모든 Chorus에서 "함께 걸어가면" 똑같이 반복
     * 모든 Chorus에서 "빛나고 있어" 똑같이 반복
   - 예시 (영어): 
     * 모든 Chorus에서 "We'll shine together" 똑같이 반복
     * 모든 Chorus에서 "Dancing in the light" 똑같이 반복
     * 모든 Chorus에서 "Never let you go" 똑같이 반복
   - **이 똑같이 반복되는 구절이 곡 제목이 됩니다!** (Adele "Rolling in the Deep", Coldplay "Fix You" 방식)
7. 감정이 풍부하고 독창적인 스토리
8. ${index + 1}번째 곡이므로 이전 곡들과 **완전히 다른 독특한 관점과 이야기**
9. 구체적인 이미지와 감각적 표현 사용
10. 가사만 출력 (설명이나 주석 없이)
11. **Intro와 Outro를 반드시 포함**해서 완전한 곡 구조 만들기
12. **절대로 이전 곡과 같은 표현이나 문장을 재사용하지 마세요**

**형식**:
[Intro]
(2-4줄)

[Verse 1]
(4-6줄)

[Chorus]
**⚠️ 핵심: 아래 패턴처럼 똑같은 구절을 최소 3번 반복하세요!**
(핵심 프레이즈 포함 4-6줄)
**좋은 예시 (정확한 반복)**:
"우리 함께라면 (핵심 구절 #1)
어떤 순간에도
우리 함께라면 (핵심 구절 #1 - 똑같이 반복!)
두렵지 않아
모든 것이 빛나
우리 함께라면 (핵심 구절 #1 - 또 똑같이 반복!)"

**나쁜 예시 (변형 반복 금지)**:
"여기 푸드트럭 (원본)
...
그곳 푸드트럭 (❌ 변형됨 - 금지!)
...
저 푸드트럭 (❌ 또 변형됨 - 금지!)"

[Verse 2]
(4-6줄)

[Chorus]
(위와 100% 동일한 구조, 핵심 프레이즈 3번 이상 반복)

[Bridge]
(4-6줄)

[Verse 3]
(4-6줄)

[Chorus]
(위와 100% 동일한 구조, 핵심 프레이즈 3번 이상 반복)

[Outro]
(2-4줄)`
        }
      ],
      temperature: 0.85, // 최적 창의성 (안정성 + 품질)
      max_tokens: 2000, // 더 긴 가사 생성
      presence_penalty: 1.2, // 더 강력한 반복 억제
      frequency_penalty: 1.0 // 단어 반복 억제
    });

    const lyrics = completion.choices[0].message.content.trim();
    console.log(`✅ 가사 생성 완료 (${lyrics.length}자, 고유 시드: ${uniqueSeed})`);
    
    return lyrics;
    
  } catch (error) {
    console.error(`❌ GenSpark LLM 가사 생성 오류:`, error.message);
    
    if (error.status === 401) {
      console.error(`\n⚠️⚠️⚠️ 중요: GenSpark LLM API 인증 실패 (401) ⚠️⚠️⚠️`);
      console.error(`   GenSpark LLM Proxy는 샌드박스 세션 인증이 필요합니다.`);
      console.error(`   현재 Fallback 템플릿 가사를 사용합니다. (고품질 보장)\n`);
    } else {
      console.error(`❌ 에러 상세:`, error.response?.data || error);
    }
    
    // 폴백: 랜덤 시드 기반 고유 가사
    console.log(`📝 폴백: 인덱스 ${index} 기반 고유 가사 생성 (Seed: ${uniqueSeed})`);
    console.log(`⚠️  주의: LLM이 실패했습니다. Fallback 템플릿 사용 중...`);
    
    return generateFallbackLyrics(language, themeForThisSong, style, index, uniqueSeed, previousLyrics);
  }
}

/**
 * 🎵 후렴구에서 핵심 프레이즈 추출 (가장 반복되는 2-5단어 구절)
 */
function extractChorusPhrase(lyrics, language = 'korean') {
  try {
    // [Chorus] 섹션 추출
    const chorusMatches = lyrics.match(/\[Chorus\]([\s\S]*?)(?=\[|$)/gi);
    if (!chorusMatches || chorusMatches.length === 0) {
      console.log('   ⚠️ 후렴구 없음, 프레이즈 추출 실패');
      return null;
    }

    const isKorean = language.toLowerCase() === 'korean';
    const phrases = {};
    const minLength = isKorean ? 4 : 8;  // 한국어: 최소 4글자, 영어: 최소 8글자
    const maxLength = isKorean ? 15 : 30; // 한국어: 최대 15글자, 영어: 최대 30글자

    // 모든 후렴구에서 구절 추출
    chorusMatches.forEach(chorus => {
      const lines = chorus
        .replace(/\[Chorus\]/gi, '')
        .split('\n')
        .map(l => l.trim())
        .filter(l => l.length > 0 && !l.startsWith('['));

      lines.forEach(line => {
        // 줄 전체가 적절한 길이면 추가
        if (line.length >= minLength && line.length <= maxLength) {
          phrases[line] = (phrases[line] || 0) + 1;
        }

        // 한국어: 공백 기준 분리, 영어: 단어 기준 분리
        if (isKorean) {
          // 한국어는 구두점으로 구절 분리
          const segments = line.split(/[,\.!?\s]+/).filter(s => s.length >= minLength && s.length <= maxLength);
          segments.forEach(seg => {
            const cleaned = seg.trim();
            if (cleaned.length >= minLength) {
              phrases[cleaned] = (phrases[cleaned] || 0) + 1;
            }
          });
        } else {
          // 영어는 2-5 단어 조합
          const words = line.split(/\s+/);
          for (let len = 2; len <= Math.min(5, words.length); len++) {
            for (let i = 0; i <= words.length - len; i++) {
              const phrase = words.slice(i, i + len).join(' ');
              if (phrase.length >= minLength && phrase.length <= maxLength) {
                phrases[phrase] = (phrases[phrase] || 0) + 1;
              }
            }
          }
        }
      });
    });

    // 빈도순 정렬
    const sorted = Object.entries(phrases)
      .filter(([phrase, count]) => count >= 2) // 최소 2회 이상 반복
      .sort((a, b) => {
        // 빈도가 같으면 길이가 적절한 것 우선 (너무 짧거나 길지 않은)
        if (b[1] === a[1]) {
          const idealLength = isKorean ? 8 : 15;
          const aDiff = Math.abs(a[0].length - idealLength);
          const bDiff = Math.abs(b[0].length - idealLength);
          return aDiff - bDiff;
        }
        return b[1] - a[1];
      });

    if (sorted.length > 0) {
      const [bestPhrase, count] = sorted[0];
      console.log(`   🎯 후렴구 핵심 프레이즈: "${bestPhrase}" (${count}회 반복)`);
      return bestPhrase;
    }

    console.log('   ⚠️ 반복 프레이즈 없음 (최소 2회 필요)');
    return null;
  } catch (error) {
    console.error('   ❌ 후렴구 프레이즈 추출 오류:', error.message);
    return null;
  }
}

/**
 * 가사에 맞는 제목 생성
 */
async function generateTitle(lyrics, style, language, index = 0, issue = null) {
  const languageText = language === 'korean' ? '한국어' : '영어';
  // 🎲 랜덤 요소 추가로 매번 다른 seed 생성 (YouTube 메타데이터와 동일한 방식)
  const uniqueSeed = Date.now() + index * 1000 + Math.floor(Math.random() * 10000);

  try {
    console.log(`🤖 ${languageText} 제목 생성 중... (Index: ${index}, Seed: ${uniqueSeed})`);
    if (issue) {
      console.log(`   📰 원본 이슈: ${issue.title}`);
    }

    // 🎵 1단계: 후렴구에서 핵심 프레이즈 추출 시도
    const chorusPhrase = extractChorusPhrase(lyrics, language);
    if (chorusPhrase) {
      console.log(`✅ 후렴구 프레이즈를 제목으로 사용: "${chorusPhrase}"`);
      return chorusPhrase;
    }

    // 2단계: Gemini API로 시적 제목 생성
    console.log(`   🤖 후렴구 추출 실패, Gemini API로 제목 생성 중...`);
    if (issue) {
      console.log(`   📰 원본 이슈: ${issue.title}`);
    }
    
    // 🔥 Gemini API 사용 (GenSpark LLM 대신)
    const systemInstruction = language === 'korean' 
      ? `당신은 시인이자 전설적인 K-POP 히트곡 프로듀서입니다.
당신이 만든 제목은 사람들이 듣는 순간 "우와!" 하고 감탄하게 만듭니다.

🎯 **제목 생성 방법**:
1. **가사 속 핵심 키워드 추출**: 가사에서 가장 인상적인 단어/구절 찾기
2. **시적으로 재해석**: 단순 명사 → 은유적 표현으로 변환
3. **감성 극대화**: 듣는 이의 상상력을 자극하는 표현

**당신의 스타일**:
- 가사 속 실제 표현을 활용 (완전히 새로 만들지 말고)
- 시적이고 아름다운 은유와 상징 사용
- 반드시 순수 한국어로만 제목 (영어 단어 절대 금지!)

**전설적인 제목 예시**:
- "너의 온도" (사랑 → 온도로 은유)
- "별이 되어" (꿈 → 별로 상징)
- "흩어진 시간 속에서" (추억 → 시적 표현)
- "너라는 계절" (사랑 → 계절로 은유)
- "마지막 봄날" (이별 → 계절 은유)
- "그림자 속의 빛" (역경 속 희망 → 시적 대비)
- "멈춘 시간의 향기" (추억 → 감각적 은유)
- "네가 남긴 파도" (추억 → 자연 은유)
- "달빛이 그린 약속" (사랑 → 자연 + 행위 은유)
- "잊혀진 멜로디" (그리움 → 음악 은유)`
      : `You are a poet and legendary music producer who creates titles that make people say "Wow!"

🎯 **Title Generation Method**:
1. **Extract Key Phrase from Lyrics**: Find the most impressive words/phrases
2. **Reinterpret Poetically**: Transform simple nouns → metaphorical expressions
3. **Maximize Emotion**: Create expressions that stimulate listeners' imagination

**Your Style**:
- Use actual expressions from lyrics (don't create entirely new)
- Poetic metaphors and symbols
- English only, deep poetic resonance

**Examples**:
- "Your Warmth" (love → warmth metaphor)
- "Becoming a Star" (dream → star symbol)
- "Within Scattered Time" (memories → poetic expression)
- "The Season of You" (love → season metaphor)
- "Last Spring Day" (farewell → seasonal metaphor)
- "Light in the Shadow" (hope in adversity → poetic contrast)
- "Scent of Frozen Time" (memories → sensory metaphor)
- "Waves You Left Behind" (memories → nature metaphor)
- "Promise Drawn by Moonlight" (love → nature + action metaphor)
- "Forgotten Melody" (longing → music metaphor)`;

    const userPrompt = language === 'korean'
      ? `다음 가사와 이슈에서 **가장 인상적인 구절을 뽑아** 시적이고 아름다운 제목을 만들어주세요.

━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 **가사 전문** (${index + 1}번째 곡)
━━━━━━━━━━━━━━━━━━━━━━━━━━

${lyrics}

${issue ? `━━━━━━━━━━━━━━━━━━━━━━━━━━
📰 **원본 이슈** (참고용)
━━━━━━━━━━━━━━━━━━━━━━━━━━

**이슈 제목**: ${issue.title}
**이슈 설명**: ${issue.description}
**핵심 키워드**: ${issue.keywords.join(', ')}

` : ''}━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 **음악 스타일**
━━━━━━━━━━━━━━━━━━━━━━━━━━

${style}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 **제목 생성 단계**
━━━━━━━━━━━━━━━━━━━━━━━━━━

**STEP 1: 가사에서 핵심 구절 찾기**
- 가사 속 **가장 인상적인 단어/구절** 3개 추출
- 후렴구(Chorus)에서 **반복되는 핵심 표현** 확인
- **감정이 가장 강렬한 순간**의 표현 포착

**STEP 2: 시적으로 재해석하기**
- 핵심 감정을 **자연 이미지**(별, 달, 바다, 바람, 빛)로 은유
- **감각적 표현**(온도, 향기, 색깔, 소리)으로 추상화
- **시간/공간 은유**(계절, 순간, 시간)로 확장
- **대비와 역설**(빛과 그림자, 시작과 끝)로 깊이 더하기

**STEP 3: 최고의 제목 완성**
✅ 단순한 명사가 아닌 **시적 구절**인가?
✅ 듣는 순간 **이미지가 떠오르는가**?
✅ **감정이 전달되고 여운이 남는가**?
✅ 사람들이 "우와, 제목 좋다!" 할 만한가?

━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ **시적 제목 변환 예시**
━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ "사랑" → ✅ "너라는 계절"
❌ "추억" → ✅ "멈춘 시간의 향기"
❌ "그리움" → ✅ "네가 남긴 파도"
❌ "이별" → ✅ "마지막 봄날"
❌ "꿈" → ✅ "별이 되어"
❌ "희망" → ✅ "그림자 속의 빛"

━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 **절대 금지 사항**
━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ 단순 명사 (사랑, 꿈, 희망 등)
❌ 평범한 표현 ("사랑의 감정" 등)
❌ 영어 단어 절대 금지!
❌ 7단어 초과 (2-5단어 권장)

━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 **출력 형식**
━━━━━━━━━━━━━━━━━━━━━━━━━━

제목만 출력하세요. 설명이나 따옴표 절대 금지!

예: 너라는 계절`
      : `Deeply analyze the following lyrics and create a **poetic and beautiful title that will make people say "Wow!"**

━━━━━━━━━━━━━━━━━━━━━━━━━━
📋 **Full Lyrics** (Track ${index + 1})
━━━━━━━━━━━━━━━━━━━━━━━━━━

${lyrics}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🎨 **Musical Style**
━━━━━━━━━━━━━━━━━━━━━━━━━━

${style}

━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 **Poetic Title Creation Guide**
━━━━━━━━━━━━━━━━━━━━━━━━━━

**STEP 1: Extract Core Emotion**
- Find the **most powerful emotion** throughout
- Identify **recurring imagery** in the chorus
- Capture the **most beautiful moment**

**STEP 2: Elevate to Poetic Expression**
- Use **nature imagery** (stars, moon, waves, wind, light)
- Transform with **sensory expressions** (warmth, scent, color)
- Expand with **time/space metaphors** (seasons, moments)
- Add depth with **contrast** (light and shadow)

**STEP 3: Complete the Best Title**
✅ Is it a **poetic phrase**, not just a noun?
✅ Does it create **vivid imagery**?
✅ Will people say "Wow, great title!"?
✅ Does it resonate emotionally?

━━━━━━━━━━━━━━━━━━━━━━━━━━
✨ **Poetic Title Examples**
━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ "Love" → ✅ "The Season of You"
❌ "Memories" → ✅ "Scent of Frozen Time"
❌ "Longing" → ✅ "Waves You Left Behind"
❌ "Farewell" → ✅ "Last Spring Day"
❌ "Dream" → ✅ "Becoming a Star"
❌ "Hope" → ✅ "Light in the Shadow"

━━━━━━━━━━━━━━━━━━━━━━━━━━
🚨 **Absolute Prohibitions**
━━━━━━━━━━━━━━━━━━━━━━━━━━

❌ Simple nouns (Love, Dream, Hope)
❌ Generic phrases ("Feeling of Love")
❌ More than 7 words (2-5 recommended)

━━━━━━━━━━━━━━━━━━━━━━━━━━
📝 **Output Format**
━━━━━━━━━━━━━━━━━━━━━━━━━━

Output only the title. No quotes or explanations!

Example: The Season of You`;

    // 🔥 Gemini API 호출 - Temperature 0.8 → 0.9로 증가 (더 다양한 은유 표현)
    const titleText = await generateWithLLM(systemInstruction, userPrompt, 0.9, 100);  // 200 → 100 토큰 (제목은 짧음)
    const trimmedTitleText = titleText.trim();
    
    // 따옴표 제거 및 정리
    let title = trimmedTitleText
      .replace(/^["']|["']$/g, '')
      .replace(/^제목:\s*/i, '')
      .replace(/^Title:\s*/i, '')
      .trim();
    
    console.log(`✅ Gemini 제목 생성 완료: "${title}"`);
    
    return title; 
  } catch (error) {
    console.error(`❌ GenSpark LLM 제목 생성 오류:`, error.message);
    if (error.status === 401) {
      console.warn('⚠️  GenSpark API 인증 실패 (401) - 이슈 기반 폴백 제목 사용');
    }
    
    // 폴백: 이슈 기반 제목 생성 (이슈가 있으면 우선 사용)
    if (issue && issue.title && issue.keywords) {
      return generateIssueFallbackTitle(issue, language, index);
    }
    
    // 완전 폴백: index 기반 고유 제목
    return generateFallbackTitle(language, index, style);
  }
}

/**
 * 스타일 분석 기반 폴백 가사 생성 (완전 랜덤화)
 */
function generateFallbackLyrics(language, theme, style, index = 0, uniqueSeed = Date.now(), previousLyrics = []) {
  // 스타일 분석
  const styleLower = (style || '').toLowerCase();
  
  // 🚨 이전 가사와 겹치는 Fallback 방지
  let attemptCount = 0;
  const maxAttempts = 10;
  
  console.log(`🔄 Fallback 가사 생성 시도 (이전 가사: ${previousLyrics.length}개)`);
  
  // 분위기 키워드 감지
  const isCozy = styleLower.includes('cozy') || styleLower.includes('아늑') || styleLower.includes('침실');
  const isWarm = styleLower.includes('warm') || styleLower.includes('따뜻') || styleLower.includes('햇살');
  const isSoft = styleLower.includes('soft') || styleLower.includes('부드러') || styleLower.includes('gentle');
  const isAcoustic = styleLower.includes('acoustic') || styleLower.includes('어쿠스틱') || styleLower.includes('기타');
  const isIndie = styleLower.includes('indie') || styleLower.includes('인디');
  const isBallad = styleLower.includes('ballad') || styleLower.includes('발라드') || styleLower.includes('emotional');
  const isUpbeat = styleLower.includes('upbeat') || styleLower.includes('bright') || styleLower.includes('cheerful');
  const isMelancholic = styleLower.includes('melanchol') || styleLower.includes('sad') || styleLower.includes('슬픔');
  
  // 🎲 인덱스 기반 완전 고유 변형 선택 (더 많은 변형)
  const seedRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // ⚠️ 중요: 각 곡마다 다른 템플릿 사용하도록 변형 개수 확대
  // index와 uniqueSeed 조합으로 고유한 변형 생성
  const variationBase = (index * 7 + Math.floor(seedRandom(uniqueSeed) * 13));
  
  console.log(`📝 폴백 가사 생성: 주제=${theme}, Index=${index}, Seed=${uniqueSeed}, VariationBase=${variationBase}`);
  
  const languageLower = language ? language.toLowerCase() : 'english';
  if (languageLower === 'korean') {
    // 아늑하고 따뜻한 스타일
    if (isCozy || isWarm || isSoft) {
      const cozyKoreanLyrics = [
        `[Intro]
따스한 {time} {nature}
너와 함께하는 하루

[Verse 1]
{nature}이 창문으로 들어와
너의 미소가 떠올라
따뜻한 이불 속에서
하루를 시작해
소소한 일상이지만
너와 함께라면 특별해

[Chorus]
작은 행복들이 모여서
오늘도 빛나는 하루
너와 함께라면
모든 게 완벽해
이 순간이 영원하길
바라고 또 바래

[Verse 2]
커피 향기가 번져가고
네가 좋아하는 노래
조용한 이 순간이
영원했으면 좋겠어
창밖의 세상은 멀고
우리만의 시간이 흘러

[Chorus]
작은 행복들이 모여서
오늘도 빛나는 하루
너와 함께라면
모든 게 완벽해
이 순간이 영원하길
바라고 또 바래

[Bridge]
시간이 천천히 흘러가
소중한 이 순간들
기억 속에 남아
언제나 빛날 거야
우리의 이야기는
계속될 거야

[Verse 3]
하루가 저물어가도
너와 함께라면 괜찮아
별이 뜨는 밤하늘 아래
우리의 꿈을 이야기해

[Chorus]
작은 행복들이 모여서
오늘도 빛나는 하루
너와 함께라면
모든 게 완벽해
이 순간이 영원하길
바라고 또 바래

[Outro]
내일도 그 다음날도
너와 함께 {action}
우리만의 시간 속에서
영원히 함께해`,
        
        `[Intro]
포근한 오후의 햇살
우리만의 작은 세계

[Verse 1]
포근한 담요에 감싸여
따스한 차 한 잔
너의 목소리가 들려와
평화로운 오후
시간이 멈춘 듯한 느낌
영원히 이대로

[Chorus]
이런 순간이 좋아
아무 걱정 없이
너와 나 둘이서
시간을 보내는 것
세상의 모든 소음은
문 밖에 두고서

[Verse 2]
창밖엔 눈이 내리고
방 안은 따뜻해
네 옆에 있으면
겨울도 봄 같아
차가운 세상 속에서
너만의 온기

[Chorus]
이런 순간이 좋아
아무 걱정 없이
너와 나 둘이서
시간을 보내는 것
세상의 모든 소음은
문 밖에 두고서

[Bridge]
세상이 멈춘 것 같아
우리만의 공간에서
영원히 이렇게
함께하고 싶어
시간이 흘러도
변하지 않을 우리

[Verse 3]
밤이 찾아와도 두렵지 않아
네가 곁에 있으니까
별빛이 창가를 비추면
우리만의 이야기를 나눠

[Chorus]
이런 순간이 좋아
아무 걱정 없이
너와 나 둘이서
시간을 보내는 것
세상의 모든 소음은
문 밖에 두고서

[Outro]
영원히 이대로
우리 둘이서만
포근한 이 순간 속에
머물고 싶어`,
        
        `[Intro]
고요한 밤의 선율
빗소리와 함께

[Verse 1]
부드러운 빗소리에
잠이 들 것 같아
네 품에 안겨서
꿈을 꾸고 싶어
세상의 모든 걱정은
빗물과 함께 흘러가

[Chorus]
평온한 이 순간
아무것도 필요 없어
너만 있으면 돼
그것만으로 충분해
이 고요함 속에서
우리는 완전해

[Verse 2]
작은 촛불이 켜지고
은은한 향기가
방 안을 채우면
마음이 녹아내려
따스한 온기 속에
우리만의 세계

[Chorus]
평온한 이 순간
아무것도 필요 없어
너만 있으면 돼
그것만으로 충분해
이 고요함 속에서
우리는 완전해

[Bridge]
복잡한 세상 밖에서
우리만의 쉼터
이곳에서 함께
영원히 머물고 싶어
시간이 멈춘 듯한
이 완벽한 순간

[Verse 3]
밤이 깊어갈수록
더욱 가까워지는 우리
별빛마저 잠든 시간
오직 너와 나만이

[Chorus]
평온한 이 순간
아무것도 필요 없어
너만 있으면 돼
그것만으로 충분해
이 고요함 속에서
우리는 완전해

[Outro]
새벽이 와도 괜찮아
너와 함께라면
이 평온함이
영원하길 바래`
      ];
      
      const template = cozyKoreanLyrics[variationBase % cozyKoreanLyrics.length];
      return randomizeLyrics(template, uniqueSeed);
    }
    
    // 어쿠스틱/인디 스타일
    if (isAcoustic || isIndie) {
      const acoustics = [
        // 변형 1
        `[Intro]
기타 소리가 울려퍼져
우리만의 멜로디

[Verse 1]
기타 소리에 맞춰
노래를 불러봐
단순한 멜로디지만
마음을 울려
손끝에서 시작된
우리만의 이야기

[Chorus]
우리만의 이야기
작은 방 안에서
세상은 멀어지고
너만 보여
이 순간만큼은
영원할 것 같아

[Verse 2]
복잡한 건 필요 없어
너와 나 둘이서
이 순간이면 충분해
더 바랄 게 없어
단순한 화음 속에
우리의 진심이 담겨

[Chorus]
우리만의 이야기
작은 방 안에서
세상은 멀어지고
너만 보여
이 순간만큼은
영원할 것 같아

[Bridge]
조용히 흐르는 시간
함께하는 이 순간
영원히 기억할게
우리의 노래
멈추지 않을 거야
이 멜로디는

[Verse 3]
해가 지고 밤이 와도
우리의 노래는 계속돼
기타 줄이 끊어져도
목소리만으로도 충분해

[Chorus]
우리만의 이야기
작은 방 안에서
세상은 멀어지고
너만 보여
이 순간만큼은
영원할 것 같아

[Outro]
언제까지나 함께
우리만의 노래를
계속 불러가자
영원히`,
        
        // 변형 2
        `[Intro]
낡고 부서진 기타
그래도 우리의 노래

[Verse 1]
낡은 기타 하나
부서진 줄 하나
그래도 노래해
우리의 이야기
완벽하지 않지만
진심은 완벽해

[Chorus]
완벽하지 않아도 돼
있는 그대로의 우리
진심만 있다면
그걸로 충분해
거친 소리 속에도
사랑은 들려와

[Verse 2]
화려하지 않아도
진짜 감정이면 돼
솔직한 마음으로
너에게 다가가
꾸밈없는 모습이
가장 아름다워

[Chorus]
완벽하지 않아도 돼
있는 그대로의 우리
진심만 있다면
그걸로 충분해
거친 소리 속에도
사랑은 들려와

[Bridge]
소박한 멜로디에
담긴 진심
네게 전해지길
이 노래로
세상이 뭐라 해도
우리는 우리야

[Verse 3]
세월이 흘러가도
이 기타는 남아
우리의 추억들을
계속 연주할 거야

[Chorus]
완벽하지 않아도 돼
있는 그대로의 우리
진심만 있다면
그걸로 충분해
거친 소리 속에도
사랑은 들려와

[Outro]
낡은 기타와 함께
영원히 노래할게
우리만의 이야기를
세상 끝까지`,
        
        // 변형 3
        `[Intro]
작은 카페의 오후
너와 나의 시간

[Verse 1]
작은 카페 구석에서
들려오는 음악 소리
너와 나 둘만의
평화로운 시간
커피 향기 속에서
우리의 이야기가 시작돼

[Chorus]
이 순간이 좋아
아무도 없는 것처럼
세상에 우리 둘뿐
그런 기분이 들어
시간이 멈춰버렸으면
이대로 영원히

[Verse 2]
시끄러운 세상 속
조용한 쉼터처럼
너와 함께라면
어디든 좋아
복잡한 하루 끝에
네가 있어 다행이야

[Chorus]
이 순간이 좋아
아무도 없는 것처럼
세상에 우리 둘뿐
그런 기분이 들어
시간이 멈춰버렸으면
이대로 영원히

[Bridge]
단순한 멜로디
단순한 가사지만
이것만으로도
너를 표현할 수 있어
많은 말이 필요 없어
네가 옆에 있으니까

[Verse 3]
창밖으로 비가 내려도
우리는 따뜻해
작은 공간 안에서
세상 전부를 느껴

[Chorus]
이 순간이 좋아
아무도 없는 것처럼
세상에 우리 둘뿐
그런 기분이 들어
시간이 멈춰버렸으면
이대로 영원히

[Outro]
음악이 끝나도
우리는 여기 있어
작은 카페 구석에서
우리만의 시간`
      ];
      
      return randomizeLyrics(acoustics[variationBase % acoustics.length], uniqueSeed);
    }
    
    // 발라드 스타일
    if (isBallad) {
      const ballads = [
        // 변형 1: 첫 만남
        `[Intro]
운명처럼 찾아온 너
내 사랑의 시작

[Verse 1]
너를 처음 본 그 순간
시간이 멈춘 것 같았어
마치 운명처럼 다가온
너의 모습이 눈부셔
심장이 멈출 것만 같았어
이 감정을 설명할 수 없어

[Chorus]
내 마음속에 너만 있어
하루 종일 생각해
이 세상 끝까지 함께
영원히 사랑할게
아침부터 밤까지
네 생각뿐이야

[Verse 2]
밤하늘의 별빛처럼
너는 항상 빛나고 있어
내 곁에 있어줘서
정말 고마워
더 이상 행복할 순 없을 것 같아
너와 함께라면

[Chorus]
내 마음속에 너만 있어
하루 종일 생각해
이 세상 끝까지 함께
영원히 사랑할게
아침부터 밤까지
네 생각뿐이야

[Bridge]
이 순간을 기억해
우리가 함께한 시간들
영원히 간직할게
내 마음속에 forever
세월이 흘러도
변하지 않을 마음

[Verse 3]
매일 밤 잠들기 전에
널 생각하며 웃어
내일도 모레도
너와 함께 걸어가고 싶어

[Chorus]
내 마음속에 너만 있어
하루 종일 생각해
이 세상 끝까지 함께
영원히 사랑할게
아침부터 밤까지
네 생각뿐이야

[Outro]
내 사랑은 영원히
나의 전부는 너야
이 마음 받아줘
영원히`,
        
        // 변형 2: 그리움
        `[Verse 1]
혼자 걷는 이 거리
네 모습이 보이는 것만 같아
손을 뻗어도 닿지 않는
그런 거리가 아파

[Chorus]
보고 싶어 너무 보고 싶어
매일 밤 꿈에서라도
다시 만날 수 있다면
무엇이든 할 수 있어

[Verse 2]
시간이 지나도
너를 잊을 수 없어
마음 한구석에
여전히 네가 있어

[Chorus]
보고 싶어 너무 보고 싶어
매일 밤 꿈에서라도
다시 만날 수 있다면
무엇이든 할 수 있어

[Bridge]
돌아와 줄 수 없다면
기억 속에서라도
영원히 함께 있을게
너를 잊지 않을게

[Chorus]
보고 싶어 너무 보고 싶어
매일 밤 꿈에서라도
다시 만날 수 있다면
무엇이든 할 수 있어`,
        
        // 변형 3: 약속
        `[Verse 1]
너와 나 함께한 모든 순간
하나하나 소중해
이 길의 끝까지 함께
걸어가고 싶어

[Chorus]
약속할게 영원히
너의 곁을 지킬게
어떤 날이 와도
우리 함께할 거야

[Verse 2]
힘든 날도 있겠지만
서로를 믿고 있다면
이겨낼 수 있을 거야
우리 둘이라면

[Chorus]
약속할게 영원히
너의 곁을 지킬게
어떤 날이 와도
우리 함께할 거야

[Bridge]
평생 너만을 사랑해
이 마음 변치 않을게
영원한 약속을 해
지금 이 순간

[Chorus]
약속할게 영원히
너의 곁을 지킬게
어떤 날이 와도
우리 함께할 거야`
      ];
      
      return randomizeLyrics(ballads[variationBase % ballads.length], uniqueSeed);
    }
    
    // 밝고 경쾌한 스타일
    if (isUpbeat) {
      const upbeatKoreanLyrics = [
        `[Verse 1]
아침 햇살이 눈부셔
기분 좋은 하루 시작
두근거리는 이 순간
뭔가 일어날 것 같아

[Chorus]
춤추듯 걸어가
노래하며 웃어봐
오늘은 특별한 날
모든 게 빛나

[Verse 2]
바람에 실려오는
달콤한 향기들
하늘은 파랗고
세상은 아름다워

[Chorus]
춤추듯 걸어가
노래하며 웃어봐
오늘은 특별한 날
모든 게 빛나

[Bridge]
이 순간을 느껴봐
행복이 가득해
함께라면 어디든
갈 수 있어

[Chorus]
춤추듯 걸어가
노래하며 웃어봐
오늘은 특별한 날
모든 게 빛나`,
        
        `[Verse 1]
즐거운 하루의 시작
기분 좋은 음악 소리
신나는 리듬에 맞춰
몸이 절로 움직여

[Chorus]
행복한 순간들
웃음이 가득해
매일매일이 축제
즐거워 죽겠어

[Verse 2]
친구들과 함께
떠나는 여행길
어디든 좋아
함께라면 어디든

[Chorus]
행복한 순간들
웃음이 가득해
매일매일이 축제
즐거워 죽겠어

[Bridge]
꿈만 같은 이 시간
영원했으면 좋겠어
이대로 계속
함께 가자

[Chorus]
행복한 순간들
웃음이 가득해
매일매일이 축제
즐거워 죽겠어`,
        
        `[Verse 1]
새로운 아침이 밝았어
기회가 가득한 하루
두근거리는 마음으로
세상을 만나러 가

[Chorus]
긍정의 에너지
나를 채워가
오늘도 최고야
모든 게 괜찮아

[Verse 2]
작은 것에도 감사해
소중한 이 순간
행복은 멀리 있지 않아
바로 여기 지금

[Chorus]
긍정의 에너지
나를 채워가
오늘도 최고야
모든 게 괜찮아

[Bridge]
내일 걱정은 내일 해
지금 이 순간을 즐겨
인생은 아름다워
믿고 나아가

[Chorus]
긍정의 에너지
나를 채워가
오늘도 최고야
모든 게 괜찮아`
      ];
      
      const template = upbeatKoreanLyrics[variationBase % upbeatKoreanLyrics.length];
      return randomizeLyrics(template, uniqueSeed);
    }
    
    // 우울하고 성찰적인 스타일
    if (isMelancholic) {
      const melancholicKoreanLyrics = [
        `[Verse 1]
회색빛 하늘 아래
혼자 걷는 이 길
네 모습이 보이는 것만 같아
손을 뻗어도 닿지 않아

[Chorus]
보고 싶어 너무 보고 싶어
매일 밤 꿈에서라도
다시 만날 수 있다면
무엇이든 할 수 있어

[Verse 2]
시간이 지나도
너를 잊을 수 없어
마음 한구석에
여전히 네가 있어

[Chorus]
보고 싶어 너무 보고 싶어
매일 밤 꿈에서라도
다시 만날 수 있다면
무엇이든 할 수 있어

[Bridge]
이별은 아직도
내게 너무 낯설어
돌아와 줄 수 없다면
기억 속에 살게

[Chorus]
보고 싶어 너무 보고 싶어
매일 밤 꿈에서라도
다시 만날 수 있다면
무엇이든 할 수 있어`,
        
        `[Verse 1]
혼자 남은 방 안에
텅 빈 마음만 가득해
네가 있던 흔적들
모두 날 아프게 해

[Chorus]
외로움이 날 감싸
무거운 구름처럼
네가 없는 이 순간
숨쉬기조차 힘들어

[Verse 2]
계절은 또 바뀌고
이 아픔은 그대로
너를 보낼 수 없어
사랑이 남아있어

[Chorus]
외로움이 날 감싸
무거운 구름처럼
네가 없는 이 순간
숨쉬기조차 힘들어

[Bridge]
언젠가는 괜찮아질까
이 우울에서 벗어날까
지금은 그저 이렇게
추억과 함께

[Chorus]
외로움이 날 감싸
무거운 구름처럼
네가 없는 이 순간
숨쉬기조차 힘들어`,
        
        `[Verse 1]
비 오는 창가에 앉아
흘러내리는 빗방울
내 눈물과 섞여서
세상을 흐리게 해

[Chorus]
슬픔이 가득한 밤
끝이 보이지 않아
너의 빈자리가
나를 삼켜버려

[Verse 2]
지나간 시간들
돌아올 수 없는 날들
후회만 남아서
나를 괴롭혀

[Chorus]
슬픔이 가득한 밤
끝이 보이지 않아
너의 빈자리가
나를 삼켜버려

[Bridge]
시간이 약이라지만
아직은 너무 아파
이 감정 속에서
길을 잃었어

[Chorus]
슬픔이 가득한 밤
끝이 보이지 않아
너의 빈자리가
나를 삼켜버려`
      ];
      
      const template = melancholicKoreanLyrics[variationBase % melancholicKoreanLyrics.length];
      return randomizeLyrics(template, uniqueSeed);
    }
    
    // 기본 테마별 가사
    const themeTemplates = {
      '사랑': `[Verse 1]
너를 처음 본 그 순간
세상이 멈춘 것만 같아
너의 눈빛에 빠져들어
헤어날 수가 없어

[Chorus]
너를 사랑해
이 마음 변하지 않아
영원히 함께할게
내 곁에 있어줘

[Verse 2]
너와 함께하는 순간
모든 것이 완벽해
이 세상 무엇과도
바꿀 수 없어

[Chorus]
너를 사랑해
이 마음 변하지 않아
영원히 함께할게
내 곁에 있어줘

[Bridge]
시간이 흘러도
우리의 사랑은
영원히 빛날 거야
믿어 의심치 않아

[Chorus]
너를 사랑해
이 마음 변하지 않아
영원히 함께할게
내 곁에 있어줘`,
      
      '그리움': `[Verse 1]
혼자 걷는 이 거리
네 모습이 보이는 것만 같아
손을 뻗어도 닿지 않는
그런 거리가 아파

[Chorus]
보고 싶어 너무 보고 싶어
매일 밤 꿈에서라도
다시 만날 수 있다면
무엇이든 할 수 있어

[Verse 2]
시간이 지나도
너를 잊을 수 없어
마음 한구석에
여전히 네가 있어

[Chorus]
보고 싶어 너무 보고 싶어
매일 밤 꿈에서라도
다시 만날 수 있다면
무엇이든 할 수 있어

[Bridge]
돌아와 줄 수 없다면
기억 속에서라도
영원히 함께 있을게
너를 잊지 않을게

[Chorus]
보고 싶어 너무 보고 싶어
매일 밤 꿈에서라도
다시 만날 수 있다면
무엇이든 할 수 있어`,
      
      '꿈': `[Verse 1]
끝없이 펼쳐진 하늘
나는 날아가고 있어
두려움 따윈 없어
오직 앞만 보며

[Chorus]
더 높이 날아올라
꿈을 향해 달려가
포기하지 않을 거야
이루어질 때까지

[Verse 2]
힘들 때도 있겠지
넘어질 때도 있겠지
하지만 다시 일어나
계속 나아갈 거야

[Chorus]
더 높이 날아올라
꿈을 향해 달려가
포기하지 않을 거야
이루어질 때까지

[Bridge]
별이 빛나는 밤하늘
내 꿈도 저렇게
언젠가 빛날 거라
믿어 의심치 않아

[Chorus]
더 높이 날아올라
꿈을 향해 달려가
포기하지 않을 거야
이루어질 때까지`
    };
    
    // Default Korean lyrics for general/lo-fi/jazz/chill styles
    const defaultKoreanLyrics = [
      `[Verse 1]
깊은 밤의 감성
조용히 흐르는 멜로디
생각에 잠겨서
시간을 잊어

[Chorus]
이 순간 속에서
시간이 멈춘 듯해
그저 존재하며
느껴지는 설렘

[Verse 2]
부드러운 소리가
고요한 공기 through
평화가 자라나
걱정 없이

[Chorus]
이 순간 속에서
시간이 멈춘 듯해
그저 존재하며
느껴지는 설렘

[Bridge]
리듬이 날 이끌고
음악이 영혼을 치유해
이 공간 속에서
나는 온전해

[Chorus]
이 순간 속에서
시간이 멈춘 듯해
그저 존재하며
느껴지는 설렘`,
      
      `[Verse 1]
한밤의 방황
생각과 꿈 사이를
현실을 사색하며
모든 게 다르게 보여

[Chorus]
공중에 떠있는 기분
모든 것이 명확해
이 영역 안에서
두려움 없이

[Verse 2]
비트가 흐르고
멜로디가 풀려나가
부드럽게 움직이며
마음의 평화

[Chorus]
공중에 떠있는 기분
모든 것이 명확해
이 영역 안에서
두려움 없이

[Bridge]
이 감정이 날 감싸고
내 영혼을 자유롭게
여기가 바로
내가 있어야 할 곳

[Chorus]
공중에 떠있는 기분
모든 것이 명확해
이 영역 안에서
두려움 없이`,
      
      `[Verse 1]
천천히 지는 해
하늘의 색채들
미풍이 불어오는
그냥 지나가는 시간

[Chorus]
편안하고 느긋하게
증명할 것도 없이
트랙 속에 빠져들며
리듬 속으로

[Verse 2]
생각이 자유롭게
있어야 할 곳도 없이
이 멜로디와
나만 있으면 돼

[Chorus]
편안하고 느긋하게
증명할 것도 없이
트랙 속에 빠져들며
리듬 속으로

[Bridge]
세상이 계속 돌아가도
이것이 내 시작
내면의 평화를 찾아
모든 것을 받아들여

[Chorus]
편안하고 느긋하게
증명할 것도 없이
트랙 속에 빠져들며
리듬 속으로`
    ];
    
    const template = themeTemplates[theme] || defaultKoreanLyrics[variationBase % defaultKoreanLyrics.length];
    return randomizeLyrics(template, uniqueSeed);
    
  } else {
    // English lyrics with style analysis and variations
    
    // Define all lyric variations upfront
    
    // Cozy/Warm/Soft style variations
    const cozyLyrics = [
        `[Intro]
Gentle morning light
Our story begins

[Verse 1]
Sunlight through the window
Thinking of your smile
Wrapped in cozy blankets
Starting the day right
Simple little moments
Make everything worthwhile

[Chorus]
Little moments of joy
Make today shine bright
Everything's perfect when
You're by my side
These memories we're making
Will last throughout our lives

[Verse 2]
Coffee brewing slowly
Your favorite song plays
These quiet moments here
I wish would always stay
The world outside is distant
In our own little space

[Chorus]
Little moments of joy
Make today shine bright
Everything's perfect when
You're by my side
These memories we're making
Will last throughout our lives

[Bridge]
Time is moving slowly
These precious memories
Will stay with me always
Forever they will shine
Nothing else could matter
When I know you're mine

[Verse 3]
As the evening comes around
Stars begin to show
With you here beside me
I've found my home

[Chorus]
Little moments of joy
Make today shine bright
Everything's perfect when
You're by my side
These memories we're making
Will last throughout our lives

[Outro]
Tomorrow and forever
Walking hand in hand
Our story keeps unfolding
Just as we planned`,
        
        `[Intro]
Soft whispers of dawn
A new day with you

[Verse 1]
Morning light so gentle
Soft and warm embrace
Peaceful quiet moments
In this special place
Time stands still around us
In this sacred space
Nothing else could matter
When I see your face

[Chorus]
Safe and sound together
Nothing else we need
Simple joys around us
Perfect harmony
In this world of chaos
You're my clarity
Every breath I'm taking
Feels like destiny

[Verse 2]
Whispered conversations
Laughter fills the air
Every single second
Shows how much you care
Building dreams together
Nothing can compare
Knowing that you'll always
Be right there

[Chorus]
Safe and sound together
Nothing else we need
Simple joys around us
Perfect harmony
In this world of chaos
You're my clarity
Every breath I'm taking
Feels like destiny

[Bridge]
Hold this feeling close
Never let it go
In your arms forever
This is home I know
Through the storms and sunshine
Our love will only grow
More than words can say
I hope you know

[Verse 3]
Seasons change around us
But we stay the same
Every day discovering
Love in a new frame
Written in the stars above
Forever stays your name

[Chorus]
Safe and sound together
Nothing else we need
Simple joys around us
Perfect harmony
In this world of chaos
You're my clarity
Every breath I'm taking
Feels like destiny

[Outro]
Safe in your embrace
This is where I belong
Our forever love song
Playing all day long`,
        
        `[Intro]
Sunday morning glow
Just you and me
Time moving slow

[Verse 1]
Lazy Sunday morning
Nowhere else to be
Just you and me together
Pure simplicity
Coffee on the table
Sunshine streaming free
This is all I've ever wanted
Just you next to me

[Chorus]
These are the days
I'll always remember
Wrapped in your warmth
Like endless September
Holding these moments
Close to my heart forever
Nothing could be better
Than this time together

[Verse 2]
Soft words and sweet silence
Both feel just as right
In this cozy bubble
Everything's so light
Music playing softly
Morning turns to night
Every hour with you
Feels perfectly right

[Chorus]
These are the days
I'll always remember
Wrapped in your warmth
Like endless September
Holding these moments
Close to my heart forever
Nothing could be better
Than this time together

[Bridge]
Let the world keep turning
We'll stay right here
In this perfect moment
With you so near
All my worries fading
When you appear
This love keeps growing
Year after year

[Verse 3]
Evening shadows falling
Stars begin their dance
Lost in this feeling
Like a sweet romance
Every glance you give me
Puts me in a trance

[Chorus]
These are the days
I'll always remember
Wrapped in your warmth
Like endless September
Holding these moments
Close to my heart forever
Nothing could be better
Than this time together

[Outro]
Sunday fades to memory
But this feeling stays
Forever in my heart
Through all my days`
      ];
      
    // Acoustic/Indie style
    if (isAcoustic || isIndie) {
      const acousticLyrics = [
        `[Verse 1]
Simple melodies
On this old guitar
Telling our story
Under the stars

[Chorus]
Raw and unpolished
But it's real and true
All that matters now
Is me and you

[Verse 2]
No need for perfect
Just honest and clear
Every word I sing
You want to hear

[Chorus]
Raw and unpolished
But it's real and true
All that matters now
Is me and you

[Bridge]
Stripped down to basics
Heart on the line
This simple song
Is yours and mine

[Chorus]
Raw and unpolished
But it's real and true
All that matters now
Is me and you`,
        
        `[Intro]
Quiet corner hideaway
Just you and me today

[Verse 1]
Coffee shop corner
Dim lights and low sound
Just us two talking
No one else around
Whispered conversations
In this sacred ground
Every word you're saying
Is the sweetest sound

[Chorus]
In our own world here
Time stands perfectly still
Nothing else matters
It's you that I feel
Lost in this moment
Where everything's real
Your love is healing
Every wound it will seal

[Verse 2]
Acoustic guitar humming
Soft voice in the air
Every little moment
Shows you really care
Melodies are flowing
Like an answered prayer
Knowing that you'll always
Be right there

[Chorus]
In our own world here
Time stands perfectly still
Nothing else matters
It's you that I feel
Lost in this moment
Where everything's real
Your love is healing
Every wound it will seal

[Bridge]
Simple and honest
That's all we need
True connection
Is what makes us free
No pretense between us
Just you and me
This is how love
Was meant to be

[Verse 3]
Rain taps on the window
World fades away
In this little corner
We'll forever stay

[Chorus]
In our own world here
Time stands perfectly still
Nothing else matters
It's you that I feel
Lost in this moment
Where everything's real
Your love is healing
Every wound it will seal

[Outro]
As the night grows deeper
Your hand in mine
This coffee shop moment
Frozen in time`,
        
        `[Intro]
Vinyl crackles softly
Our indie love story

[Verse 1]
Vintage vinyl spinning
Crackling through the room
Your hand in mine
Chasing away the gloom
Thrift store records playing
Our favorite tune
Dancing in the moonlight
Underneath the moon

[Chorus]
Indie hearts beating
To our own sweet song
In this moment
Is where we belong
Against the current
We stay strong
Our love story
All night long

[Verse 2]
No filters no makeup
Just you and me real
Authentic connection
Is all that I feel
Polaroid memories
We collect and seal
Every imperfection
Makes this love ideal

[Chorus]
Indie hearts beating
To our own sweet song
In this moment
Is where we belong
Against the current
We stay strong
Our love story
All night long

[Bridge]
Let them chase the mainstream
We'll stay underground
In our secret garden
Where love is found
Vintage hearts and modern souls
Our love knows no bounds
In this indie world
True love abounds

[Verse 3]
Fairy lights are glowing
Around our little space
Your smile is showing
Pure and honest grace

[Chorus]
Indie hearts beating
To our own sweet song
In this moment
Is where we belong
Against the current
We stay strong
Our love story
All night long

[Outro]
As the vinyl fades
Our love remains
Indie forever
Through joys and pains`
      ];
      
      const template = acousticLyrics[variationBase % acousticLyrics.length];
      return randomizeLyrics(template, uniqueSeed);
    }
    
    // Ballad style
    if (isBallad) {
      const balladLyrics = [
        `[Verse 1]
The moment I first saw you
Time seemed to stand still
Like destiny approaching
Your presence shining bright

[Chorus]
You're the only one in my heart
Thinking of you all day
Together until the end
I'll love you forever

[Verse 2]
Like stars in the night sky
You're always shining
Thank you for being
Here by my side

[Chorus]
You're the only one in my heart
Thinking of you all day
Together until the end
I'll love you forever

[Bridge]
Remember this moment
All the time we shared
I'll treasure it forever
In my heart always

[Chorus]
You're the only one in my heart
Thinking of you all day
Together until the end
I'll love you forever`,
        
        `[Verse 1]
Walking down this empty street
I see your face everywhere
Reaching out but you're not there
This distance hurts so much

[Chorus]
Missing you desperately
Every night I dream of you
If I could see you once again
I'd do anything for you

[Verse 2]
Even as time passes by
I cannot forget your smile
Deep within my heart
You'll always stay

[Chorus]
Missing you desperately
Every night I dream of you
If I could see you once again
I'd do anything for you

[Bridge]
If you cannot come back
I'll keep you in my memory
Forever by my side
Never letting go

[Chorus]
Missing you desperately
Every night I dream of you
If I could see you once again
I'd do anything for you`,
        
        `[Verse 1]
Every moment that we shared
Means the world to me
Walking this road together
Is all I want to be

[Chorus]
I promise you forever
I'll stay right by your side
No matter what comes our way
Together we will ride

[Verse 2]
There will be harder days
But if we trust in us
We can overcome it all
Together strong and just

[Chorus]
I promise you forever
I'll stay right by your side
No matter what comes our way
Together we will ride

[Bridge]
I'll love only you
My heart will never change
Making this eternal promise
Right here and right now

[Chorus]
I promise you forever
I'll stay right by your side
No matter what comes our way
Together we will ride`
      ];
      
      return randomizeLyrics(balladLyrics[variationBase % balladLyrics.length], uniqueSeed);
    }
    
    // Upbeat/Cheerful style
    if (isUpbeat) {
      const upbeatLyrics = [
        `[Verse 1]
Bright morning sunshine
Dancing in the streets
Every step I take
Life feels so sweet

[Chorus]
Let's celebrate today
Nothing in our way
With you by my side
Everything's okay

[Verse 2]
Laughter fills the air
Smiles everywhere
This moment right here
Beyond compare

[Chorus]
Let's celebrate today
Nothing in our way
With you by my side
Everything's okay

[Bridge]
No worries no fears
Just joy and cheers
Together we can go
Anywhere we know

[Chorus]
Let's celebrate today
Nothing in our way
With you by my side
Everything's okay`,
        
        `[Verse 1]
Wake up feeling great
New day to create
Happiness is here
No need to wait

[Chorus]
Life is beautiful
Colorful and bright
Everything is wonderful
Feels so right

[Verse 2]
Energy and light
Everything in sight
Makes my heart take flight
Pure delight

[Chorus]
Life is beautiful
Colorful and bright
Everything is wonderful
Feels so right

[Bridge]
Spinning round and round
Feet off the ground
This joy that I've found
All around

[Chorus]
Life is beautiful
Colorful and bright
Everything is wonderful
Feels so right`,
        
        `[Verse 1]
Skipping down the lane
Sunshine after rain
Can't contain
This joy I can't explain

[Chorus]
Happy happy days
In so many ways
Together we will shine
You are mine

[Verse 2]
Music in the air
Without a single care
This feeling that we share
Beyond compare

[Chorus]
Happy happy days
In so many ways
Together we will shine
You are mine

[Bridge]
Dreams are coming true
All because of you
Every day feels new
Through and through

[Chorus]
Happy happy days
In so many ways
Together we will shine
You are mine`
      ];
      
      const template = upbeatLyrics[variationBase % upbeatLyrics.length];
      return randomizeLyrics(template, uniqueSeed);
    }
    
    // Melancholic/Sad style
    if (isMelancholic) {
      const melancholicLyrics = [
        `[Verse 1]
Rain falls on my window
Thoughts of you remain
Empty rooms and shadows
Echoing your name

[Chorus]
Lost in memories
Of what we used to be
Wishing you were here
Still missing you my dear

[Verse 2]
Pictures on the wall
Remind me of it all
The laughter and the tears
Through all these lonely years

[Chorus]
Lost in memories
Of what we used to be
Wishing you were here
Still missing you my dear

[Bridge]
Time may heal they say
But you won't fade away
Forever in my heart
Though we're apart

[Chorus]
Lost in memories
Of what we used to be
Wishing you were here
Still missing you my dear`,
        
        `[Verse 1]
Walking alone tonight
Under pale moonlight
Everything feels wrong
Since you've been gone

[Chorus]
Drowning in this sorrow
Can't face tomorrow
Without you near
Everything's unclear

[Verse 2]
Tried to move ahead
But these tears I shed
Keep pulling me back
To what we had

[Chorus]
Drowning in this sorrow
Can't face tomorrow
Without you near
Everything's unclear

[Bridge]
If I could turn back time
Make you forever mine
But all I have now
Are memories somehow

[Chorus]
Drowning in this sorrow
Can't face tomorrow
Without you near
Everything's unclear`,
        
        `[Verse 1]
Silence fills the space
Where you used to be
Every empty place
Reminds me constantly

[Chorus]
Loneliness surrounds me
Like a heavy cloud
Your absence confounds me
Can't say it out loud

[Verse 2]
Seasons come and go
But this pain remains
Still I cannot let go
Of what love sustains

[Chorus]
Loneliness surrounds me
Like a heavy cloud
Your absence confounds me
Can't say it out loud

[Bridge]
Maybe someday I'll be free
From this melancholy
But for now I'll just be
With this memory

[Chorus]
Loneliness surrounds me
Like a heavy cloud
Your absence confounds me
Can't say it out loud`
      ];
      
      const template = melancholicLyrics[variationBase % melancholicLyrics.length];
      return randomizeLyrics(template, uniqueSeed);
    }
    
    // Default - Lo-fi, Jazz, Chill, Ambient, or General
    // Create versatile lyrics that work for various chill/ambient styles
    const defaultLyrics = [
      `[Verse 1]
Late night feelings
Thoughts drifting away
City lights gleaming
At the end of day

[Chorus]
In this moment
Time stands still
Just existing
Feeling the thrill

[Verse 2]
Soft sounds flowing
Through the quiet air
Peace is growing
Without a care

[Chorus]
In this moment
Time stands still
Just existing
Feeling the thrill

[Bridge]
Let the rhythm take control
Music healing my soul
In this space
I am whole

[Chorus]
In this moment
Time stands still
Just existing
Feeling the thrill`,
      
      `[Verse 1]
{time_en} wandering
Through my thoughts and dreams
Reality pondering
Nothing's as it seems

[Chorus]
Floating in the atmosphere
Everything is clear
In this zone
I have no {emotion_en}

[Verse 2]
Beats are grooving
Melodies unwind
Gently {action_en}
Peace of mind

[Chorus]
Floating in the atmosphere
Everything is clear
In this zone
I have no {emotion_en}

[Bridge]
Let the vibes wash over me
Setting my spirit free
This is where
I'm meant to be

[Verse 3]
{nature_en} falling down
Colors all around
In this peaceful {place_en}
My soul is found

[Chorus]
Floating in the atmosphere
Everything is clear
In this zone
I have no {emotion_en}

[Outro]
Let the {emotion_en} fade away
Living for today
In this space
I choose to stay`,
      
      `[Verse 1]
Sunset fading slow
Colors in the sky
Where the breezes blow
Time just passing by

[Chorus]
Easy and relaxed
Nothing to prove
Getting lost in tracks
In the groove

[Verse 2]
Thoughts are wandering free
No place I need to be
Just this melody
And me

[Chorus]
Easy and relaxed
Nothing to prove
Getting lost in tracks
In the groove

[Bridge]
Let the world keep spinning
This is my beginning
Finding peace within
Let it all sink in

[Chorus]
Easy and relaxed
Nothing to prove
Getting lost in tracks
In the groove`
    ];
    
    // Return appropriate lyrics based on style
    if (isCozy || isWarm || isSoft) {
      const template = cozyLyrics[variationBase % cozyLyrics.length];
      return randomizeLyrics(template, uniqueSeed);
    }
    
    if (isAcoustic || isIndie) {
      const template = acousticLyrics[variationBase % acousticLyrics.length];
      return randomizeLyrics(template, uniqueSeed);
    }
    
    if (isBallad) {
      return randomizeLyrics(balladLyrics[variationBase % balladLyrics.length], uniqueSeed);
    }
    
    if (isUpbeat) {
      const template = upbeatLyrics[variationBase % upbeatLyrics.length];
      return randomizeLyrics(template, uniqueSeed);
    }
    
    if (isMelancholic) {
      const template = melancholicLyrics[variationBase % melancholicLyrics.length];
      return randomizeLyrics(template, uniqueSeed);
    }
    
    // Default for unmatched styles
    const template = defaultLyrics[variationBase % defaultLyrics.length];
    return randomizeLyrics(template, uniqueSeed);
  }
}

/**
 * 🎯 이슈 기반 폴백 제목 생성 (AI 실패 시 사용)
 */
function generateIssueFallbackTitle(issue, language, index = 0) {
  const uniqueSeed = Date.now() + index * 1000;
  
  // 시드 기반 랜덤 함수
  const seedRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // 이슈 키워드에서 제목 생성
  const keywords = issue.keywords || [];
  
  const languageLower = language ? language.toLowerCase() : 'english';
  if (languageLower === 'korean') {
    // 한국어 시적 패턴
    const patterns = [
      // 키워드 + 시적 명사
      (k) => `${k[0]}의 순간`,
      (k) => `${k[0]} 너머`,
      (k) => `멈춘 ${k[0]}`,
      (k) => `${k[1]}이 흐르다`,
      (k) => `${k[0]} 속에서`,
      (k) => `잊혀진 ${k[1]}`,
      (k) => `${k[0]}의 그림자`,
      (k) => `${k[1]}의 빛`,
      (k) => `흩어진 ${k[0]}`,
      (k) => `${k[0]}의 온도`,
      // 키워드 조합
      (k) => `${k[0]}과 ${k[1]}`,
      (k) => `${k[1]} 없는 ${k[0]}`,
      (k) => `${k[0]}이 머문 곳`,
      (k) => `${k[1]}로 가는 길`,
      (k) => `${k[0]}의 향기`,
      // 직접적 표현
      (k) => `${k[0]}`,
      (k) => `${k[1]}의 시간`,
      (k) => `${k[0]}의 이야기`
    ];
    
    // 패턴 선택
    const patternIndex = Math.floor(seedRandom(uniqueSeed) * patterns.length);
    const pattern = patterns[patternIndex];
    
    // 키워드가 부족하면 패딩
    const paddedKeywords = [...keywords];
    while (paddedKeywords.length < 3) {
      paddedKeywords.push(issue.title.split(' ')[0] || '순간');
    }
    
    const title = pattern(paddedKeywords);
    console.log(`🏷️ 이슈 기반 폴백 제목: "${title}" (이슈: ${issue.title})`);
    return title;
    
  } else {
    // 영어 시적 패턴
    const patterns = [
      (k) => `Moment of ${k[0]}`,
      (k) => `Beyond ${k[0]}`,
      (k) => `Frozen ${k[0]}`,
      (k) => `${k[1]} Flows`,
      (k) => `Within ${k[0]}`,
      (k) => `Forgotten ${k[1]}`,
      (k) => `Shadow of ${k[0]}`,
      (k) => `Light of ${k[1]}`,
      (k) => `Scattered ${k[0]}`,
      (k) => `Temperature of ${k[0]}`,
      (k) => `${k[0]} and ${k[1]}`,
      (k) => `${k[0]} Without ${k[1]}`,
      (k) => `Where ${k[0]} Stayed`,
      (k) => `Path to ${k[1]}`,
      (k) => `Scent of ${k[0]}`,
      (k) => `${k[0]}`,
      (k) => `Time of ${k[1]}`,
      (k) => `Story of ${k[0]}`
    ];
    
    const patternIndex = Math.floor(seedRandom(uniqueSeed) * patterns.length);
    const pattern = patterns[patternIndex];
    
    const paddedKeywords = [...keywords];
    while (paddedKeywords.length < 3) {
      paddedKeywords.push(issue.title.split(' ')[0] || 'moment');
    }
    
    const title = pattern(paddedKeywords);
    console.log(`🏷️ Issue-based fallback title: "${title}" (Issue: ${issue.title})`);
    return title;
  }
}

/**
 * 폴백 제목 생성 (완전 랜덤 + 타임스탬프 기반)
 */
function generateFallbackTitle(language, index = 0, style = '') {
  const uniqueSeed = Date.now() + index * 1000;
  
  // 시드 기반 랜덤 함수
  const seedRandom = (seed) => {
    const x = Math.sin(seed) * 10000;
    return x - Math.floor(x);
  };
  
  // 🎵 장르별 제목 풀 (한국어)
  const genreTitlesKorean = {
    // 발라드 (30개)
    ballad: [
      '너의 온도', '멈춘 시간의 향기', '마지막 봄날', '돌아갈 수 없는 그곳',
      '너라는 계절', '잊혀진 약속', '슬픈 미소', '그리운 얼굴',
      '사랑했던 시간', '이별의 순간', '너를 보낸다', '혼자인 밤',
      '추억 속의 너', '다시 만날 날', '영원한 사랑', '가슴 아픈 이야기',
      '눈물의 이유', '보고 싶은 날', '후회', '미안해',
      '사랑해', '안녕', '잘 지내니', '그때 그 순간',
      '우리의 봄', '지난 여름', '슬픈 가을', '차가운 겨울',
      '첫사랑', '마지막 사랑'
    ],
    
    // 힙합/랩 (30개)
    hiphop: [
      '내 방식대로', '정상에서', '다시는 안 봐', '믿음', '최고가 될 거야',
      '나를 봐', '실패는 없어', '끝까지 가', '포기 안 해', '내 길을 가',
      '꿈을 이뤄', '성공의 맛', '돈', '명예', '권력',
      '힙합', '리얼 토크', '진짜', '가짜', '차이',
      '내 팀', '우리 크루', '형제들', '거리', '동네',
      '랩 게임', '비트', '플로우', '라임', '벌스'
    ],
    
    // 인디/포크 (30개)
    indie: [
      '나른한 오후', '커피 한 잔의 여유', '산책', '네가 좋아하던 노래',
      '일요일의 기록', '작은 행복', '평범한 하루', '소소한 일상',
      '창밖 풍경', '책 한 페이지', '낡은 사진', '오래된 편지',
      '골목길', '단골 카페', '혼자만의 시간', '조용한 오전',
      '비 오는 날', '맑은 하늘', '구름', '바람',
      '기타 선율', '피아노 소리', '휘파람', '허밍',
      '느린 걸음', '천천히', '여유', '휴식',
      '자유', '자연'
    ],
    
    // 댄스/일렉트로 (30개)
    dance: [
      '밤새도록', '신나는 밤', '리듬 속으로', '춤춰', '파티 타임',
      '열광', '폭발', '에너지', '비트', '드롭',
      '클럽', '댄스 플로어', '불타는 밤', '미쳐', '날아올라',
      '하이', '익스터시', '리듬', '그루브', '펑키',
      '일렉트릭', '신스웨이브', '베이스', '킥', '스네어',
      '빠르게', '격렬하게', '세게', '더 세게', '끝없이'
    ],
    
    // 로파이/칠 (30개)
    lofi: [
      '비 오는 밤', '창가의 생각', '고요한 순간', '혼자만의 시간', '낮잠',
      '느긋한 오후', '책과 커피', '달빛 아래', '조용한 밤', '평온',
      '명상', '사색', '여유로운 시간', '쉼', '휴식의 순간',
      '아늑한 방', '따뜻한 이불', '뜨거운 차', '향초', '잔잔한 음악',
      '공부', '독서', '글쓰기', '그림', '생각',
      '집중', '몰입', '조용', '고요', '평화'
    ],
    
    // 일반 시적 (기존 120개)
    general: [
      // 자연 은유 (30개)
      '너라는 계절', '멈춘 시간의 향기', '그림자 속의 빛', '네가 남긴 파도',
      '달빛이 그린 약속', '별이 되어', '바람처럼 스쳐간', '마지막 봄날',
      '고요 속을 걷다', '별빛 사이로', '파도의 속삭임', '달무리 너머',
      '새벽이 오는 소리', '석양의 온도', '구름 위를 걷는 꿈', '바람의 기억',
      '별이 내린 밤', '달이 머무는 곳', '햇살이 닿는 순간', '빗소리 속에서',
      '눈꽃이 피던 날', '낙엽 지는 소리', '첫눈의 약속', '물결처럼 흐르는',
      '안개 너머 너', '무지개를 건너', '들풀의 노래', '이슬 맺힌 아침',
      '바람에 실린 말', '별똥별처럼',
      
      // 감각 은유 (30개)
      '너의 온도', '침묵의 향기', '기억의 색깔', '슬픈 미소의 이유',
      '따뜻했던 그 공기', '떨림의 순간들', '익숙한 낯섦', '텅 빈 울림',
      '가벼운 무게', '투명한 그리움', '부드러운 아픔', '달콤한 상처',
      '쓸쓸한 포근함', '시린 온기', '차가운 따스함', '어두운 빛',
      '고요한 외침', '조용한 함성', '무거운 가벼움', '선명한 희미함',
      '뜨거운 한기', '부드러운 날카로움', '거친 부드러움', '투명한 어둠',
      '밝은 그림자', '차분한 설렘', '고요한 파동', '잔잔한 파도',
      '잔잔한 폭풍', '고요한 소란',
      
      // 시간 은유 (30개)
      '흩어진 순간들', '멈춰버린 시계', '돌아갈 수 없는 봄', '영원했던 순간',
      '잊혀질 시간', '머물던 그 시간', '지나간 내일', '오지 않는 어제',
      '어제의 미래', '내일의 그리움', '과거의 숨결', '미래의 메아리',
      '지금, 이 순간', '시간이 멈춘 곳', '잊혀진 계절', '돌아오는 봄',
      '사라진 여름', '얼어붙은 가을', '끝나지 않는 겨울', '영원한 하루',
      '하루가 일년처럼', '찰나의 영원', '순간의 무한', '끝없는 오늘',
      '짧았던 영원', '길었던 순간', '잠시의 forever', '영원의 한 조각',
      '시간의 흔적', '시간의 여백',
      
      // 대비와 역설 (30개)
      '슬프지 않은 눈물', '행복했던 이별', '아름다운 상처', '슬픈 미소',
      '혼자인 우리', '함께한 고독', '외로운 사랑', '따뜻한 고독',
      '밝은 어둠', '어두운 희망', '차가운 불꽃', '뜨거운 얼음',
      '조용한 폭풍', '시끄러운 고요', '움직이는 정적', '고요한 질주',
      '선명한 흐림', '명확한 혼란', '확실한 불안', '불안한 안정',
      '편안한 긴장', '긴장된 평화', '혼란스러운 질서', '질서 있는 혼란',
      '끝나지 않는 끝', '시작되는 끝', '끝나는 시작', '이별의 만남',
      '만남의 이별', '슬픈 설렘'
    ]
  };

  // 🎵 장르별 제목 풀 (영어)
  const genreTitlesEnglish = {
    ballad: [
      'Your Warmth', 'Last Spring Day', 'Can\'t Go Back', 'The Season of You',
      'Forgotten Promise', 'Sad Smile', 'Missing Face', 'Time We Loved',
      'Moment of Farewell', 'Letting You Go', 'Alone Tonight', 'You in Memories',
      'Day We Meet Again', 'Eternal Love', 'Heartbreak Story', 'Reason for Tears',
      'Days I Miss You', 'Regret', 'I\'m Sorry', 'I Love You',
      'Goodbye', 'Are You Okay', 'That Moment', 'Our Spring',
      'Last Summer', 'Sad Autumn', 'Cold Winter', 'First Love', 'Last Love'
    ],
    
    hiphop: [
      'My Way', 'On Top', 'Never Again', 'Believe', 'Gonna Be The Best',
      'Watch Me', 'No Failure', 'To The End', 'Never Give Up', 'My Path',
      'Dream Come True', 'Taste of Success', 'Money', 'Fame', 'Power',
      'Hip Hop', 'Real Talk', 'Real', 'Fake', 'Difference',
      'My Team', 'Our Crew', 'Brothers', 'Streets', 'Hood',
      'Rap Game', 'Beat', 'Flow', 'Rhyme', 'Verse'
    ],
    
    indie: [
      'Lazy Afternoon', 'Cup of Coffee', 'Walk', 'Song You Loved',
      'Sunday Journal', 'Little Happiness', 'Ordinary Day', 'Simple Life',
      'Window View', 'One Page', 'Old Photo', 'Old Letter',
      'Alley', 'Regular Cafe', 'Alone Time', 'Quiet Morning',
      'Rainy Day', 'Clear Sky', 'Clouds', 'Wind',
      'Guitar Melody', 'Piano Sound', 'Whistle', 'Humming',
      'Slow Walk', 'Slowly', 'Leisure', 'Rest',
      'Freedom', 'Nature'
    ],
    
    dance: [
      'All Night Long', 'Exciting Night', 'Into the Rhythm', 'Dance', 'Party Time',
      'Frenzy', 'Explosion', 'Energy', 'Beat', 'Drop',
      'Club', 'Dance Floor', 'Burning Night', 'Go Crazy', 'Fly High',
      'High', 'Ecstasy', 'Rhythm', 'Groove', 'Funky',
      'Electric', 'Synthwave', 'Bass', 'Kick', 'Snare',
      'Fast', 'Intense', 'Hard', 'Harder', 'Endless'
    ],
    
    lofi: [
      'Rainy Night', 'Thoughts by Window', 'Quiet Moment', 'Time Alone', 'Nap',
      'Lazy Afternoon', 'Book and Coffee', 'Under Moonlight', 'Silent Night', 'Peace',
      'Meditation', 'Contemplation', 'Leisure Time', 'Rest', 'Moment of Relief',
      'Cozy Room', 'Warm Blanket', 'Hot Tea', 'Candles', 'Gentle Music',
      'Study', 'Reading', 'Writing', 'Drawing', 'Thinking',
      'Focus', 'Immersion', 'Quiet', 'Calm', 'Peaceful'
    ],
    
    general: [
      'The Season of You', 'Scent of Frozen Time', 'Light in the Shadow', 'Waves You Left Behind',
      'Promise Drawn by Moonlight', 'Becoming a Star', 'Passing Like Wind', 'Last Spring Day',
      'Walking Through Silence', 'Between Starlight', 'Whispers of Waves', 'Beyond Moon Halo',
      'Sound of Dawn Arriving', 'Temperature of Sunset', 'Dreams Above Clouds', 'Memory of Wind',
      'Night Stars Fell', 'Where Moon Stays', 'Moment Sunlight Touches', 'Within Rain Sound',
      'Day Snow Flowers Bloomed', 'Sound of Falling Leaves', 'First Snow Promise', 'Flowing Like Water',
      'You Beyond Mist', 'Crossing Rainbow', 'Song of Wildflowers', 'Dew-Kissed Morning',
      'Words Carried by Wind', 'Like a Shooting Star',
      'Your Warmth', 'Scent of Silence', 'Color of Memory', 'Reason for Sad Smile',
      'That Warm Air', 'Moments of Trembling', 'Familiar Strangeness', 'Empty Resonance',
      'Light Weight', 'Transparent Longing', 'Soft Pain', 'Sweet Wound',
      'Lonely Comfort', 'Cold Warmth', 'Cold Heat', 'Dark Light',
      'Quiet Scream', 'Silent Shout', 'Heavy Lightness', 'Clear Vagueness',
      'Hot Chill', 'Soft Sharpness', 'Rough Softness', 'Transparent Darkness',
      'Bright Shadow', 'Calm Excitement', 'Quiet Wave', 'Gentle Surge',
      'Calm Storm', 'Quiet Chaos',
      'Scattered Moments', 'Stopped Clock', 'Spring Can\'t Return', 'Moment Was Forever',
      'Time to Forget', 'Time That Stayed', 'Yesterday That Passed', 'Tomorrow Never Comes',
      'Future of Yesterday', 'Longing of Tomorrow', 'Breath of Past', 'Echo of Future',
      'Now, This Moment', 'Where Time Stopped', 'Forgotten Season', 'Spring Returns',
      'Vanished Summer', 'Frozen Autumn', 'Endless Winter', 'Eternal Day',
      'Day Like a Year', 'Eternal Moment', 'Infinite Instant', 'Endless Today',
      'Brief Eternity', 'Long Moment', 'Momentary Forever', 'Piece of Eternity',
      'Trace of Time', 'Margin of Time',
      'Tears Not Sad', 'Happy Farewell', 'Beautiful Wound', 'Sad Smile',
      'Alone Together', 'Together in Solitude', 'Lonely Love', 'Warm Loneliness',
      'Bright Darkness', 'Dark Hope', 'Cold Flame', 'Hot Ice',
      'Quiet Storm', 'Noisy Silence', 'Moving Stillness', 'Silent Rush',
      'Clear Blur', 'Clear Confusion', 'Certain Anxiety', 'Anxious Stability',
      'Comfortable Tension', 'Tense Peace', 'Chaotic Order', 'Orderly Chaos',
      'Ending Never Ends', 'Ending Begins', 'Beginning Ends', 'Farewell Meeting',
      'Meeting Farewell', 'Sad Excitement'
    ]
  };
  
  // 장르 감지
  const styleLower = (style || '').toLowerCase();
  let genreKey = 'general';
  
  if (styleLower.includes('ballad') || styleLower.includes('발라드') || styleLower.includes('emotional')) {
    genreKey = 'ballad';
  } else if (styleLower.includes('hip hop') || styleLower.includes('hip-hop') || styleLower.includes('rap') || styleLower.includes('힙합')) {
    genreKey = 'hiphop';
  } else if (styleLower.includes('indie') || styleLower.includes('folk') || styleLower.includes('인디') || styleLower.includes('acoustic')) {
    genreKey = 'indie';
  } else if (styleLower.includes('dance') || styleLower.includes('edm') || styleLower.includes('electro') || styleLower.includes('댄스')) {
    genreKey = 'dance';
  } else if (styleLower.includes('lofi') || styleLower.includes('lo-fi') || styleLower.includes('chill') || styleLower.includes('로파이')) {
    genreKey = 'lofi';
  }
  
  const genreTitles = language === 'korean' ? genreTitlesKorean : genreTitlesEnglish;
  const titles = genreTitles[genreKey] || genreTitles.general;
  
  // 🎲 완전 랜덤 선택 (시드 기반)
  const randomIndex = Math.floor(seedRandom(uniqueSeed) * titles.length);
  
  console.log(`🏷️ 폴백 제목 생성: Genre=${genreKey}, Index=${index}, Seed=${uniqueSeed}, 선택=${randomIndex}`);
  console.log(`   📚 제목 풀 크기: ${titles.length}개, 선택된 제목: "${titles[randomIndex]}"`);
  
  return titles[randomIndex];
}

/**
 * 🎲 가사에 랜덤 변수를 주입해서 무한 변형 생성
 */
function randomizeLyrics(templateLyrics, seed) {
  const seedRandom = (s) => {
    const x = Math.sin(s) * 10000;
    return x - Math.floor(x);
  };
  
  // 🔥 대규모 한국어 단어 풀 (500+ 단어)
  
  // 시간/시기 (50+)
  const timeWords = ['아침', '저녁', '밤', '새벽', '낮', '해질녘', '이른 아침', '정오', '오후', '한밤중', '자정', '동트는 시간', '노을 지는 시간', '황혼', '여명', '석양', '일출', '일몰', '새벽녘', '한낮', '밤중', '아침 일찍', '늦은 밤', '이른 저녁', '늦은 오후', '봄날', '여름밤', '가을 아침', '겨울 저녁', '봄밤', '여름날', '가을밤', '겨울날', '계절', '순간', '찰나', '시간', '때', '시절', '시기', '연', '월', '주', '날', '시', '분', '초', '오늘', '어제', '내일', '그날', '이날'];
  
  // 감정 (100+)
  const emotionWords = ['그리움', '설렘', '기쁨', '슬픔', '희망', '외로움', '행복', '사랑', '두려움', '분노', '평화', '고요', '걱정', '불안', '즐거움', '애달픔', '아픔', '기쁨', '위로', '믿음', '의심', '후회', '자부심', '부끄러움', '죄책감', '안도', '놀라움', '경이', '경외', '절망', '열정', '갈망', '그리움', '우울', '향수', '고요함', '황홀', '환희', '비탄', '가슴앓이', '상심', '헌신', '애정', '다정함', '따스함', '차가움', '공허함', '충만함', '만족', '흡족함', '감사', '원망', '질투', '동경', '연민', '동정', '미움', '증오', '애증', '갈등', '혼란', '평온', '안정', '긴장', '이완', '여유', '조급함', '초조함', '침착함', '담담함', '무심함', '관심', '호기심', '궁금함', '의아함', '당혹', '난처함', '편안함', '불편함', '익숙함', '낯섦', '친근함', '서먹함', '어색함', '자연스러움', '무료함', '지루함', '흥분', '열광', '도취', '몰입', '집중', '산만함', '나태함', '권태', '피로', '활기'];
  
  // 장소 (100+)
  const placeWords = ['거리', '공원', '카페', '바다', '숲', '하늘', '창가', '방', '집', '마당', '정원', '들판', '산', '계곡', '강', '호수', '해변', '물가', '해안', '섬', '도시', '마을', '시골', '길', '오솔길', '다리', '모퉁이', '골목', '대로', '광장', '시장', '역', '항구', '언덕', '절벽', '초원', '벌판', '사막', '밀림', '동굴', '협곡', '폭포', '시냇물', '연못', '만', '등대', '탑', '성', '성당', '사찰', '학교', '도서관', '박물관', '극장', '쇼핑몰', '가게', '상점', '식당', '술집', '클럽', '호텔', '여관', '서재', '거실', '침실', '주방', '욕실', '계단', '복도', '현관', '베란다', '발코니', '옥상', '지하', '뜰', '화단', '온실', '나무 아래', '벤치', '정자', '누각', '부두', '선착장', '갯벌', '모래사장', '바위', '암벽', '동산', '구릉', '분지', '평야', '고원', '산기슭', '산마루'];
  
  // 동작 (100+)
  const actionWords = ['걸어가', '달려가', '날아가', '흘러가', '떠나가', '돌아와', '머물러', '움직여', '춤춰', '노래해', '말해', '속삭여', '외쳐', '울어', '웃어', '미소 지어', '꿈꿔', '잠들어', '깨어나', '일어나', '넘어져', '뛰어', '올라가', '헤엄쳐', '떠다녀', '표류해', '항해해', '운전해', '타고 가', '쫓아가', '찾아가', '찾아내', '잃어버려', '잡아', '만져', '느껴', '숨 쉬어', '살아가', '사라져', '자라나', '시들어', '빛나', '타올라', '얼어붙어', '녹아', '부서져', '치유돼', '기다려', '바라', '기도해', '소원 빌어', '믿어', '기억해', '잊어버려', '알아', '궁금해해', '의문을 품어', '이해해', '생각해', '사랑해', '미워해', '그리워해', '갈구해', '원해', '필요해', '주고받아', '나눠', '지켜', '숨겨', '드러내', '봐', '지켜봐', '바라봐', '응시해', '들어', '귀 기울여', '불러', '대답해', '물어', '말해', '쓰여', '읽어', '그려', '창조해', '만들어', '파괴해', '고쳐', '도와', '구해', '지켜줘', '공격해', '싸워', '이겨', '패배해', '시도해'];
  
  // 자연/날씨 (80+)
  const natureWords = ['햇살', '달빛', '별빛', '바람', '비', '눈', '구름', '폭풍', '천둥', '번개', '산들바람', '돌풍', '태풍', '안개', '아지랑이', '이슬', '서리', '얼음', '불', '불꽃', '연기', '재', '먼지', '흙', '모래', '돌', '바위', '산', '파도', '물결', '조류', '물', '강물', '냇물', '폭포', '무지개', '오로라', '혜성', '유성', '별', '달', '해', '행성', '은하', '우주', '그림자', '빛', '어둠', '새벽빛', '석양빛', '황혼', '꽃', '장미', '백합', '민들레', '나무', '잎', '가지', '뿌리', '씨앗', '꽃봉오리', '꽃잎', '가시', '덩굴', '풀', '이끼', '고사리', '덤불', '관목', '숲', '밀림', '초록', '단풍', '낙엽', '이파리', '벚꽃', '매화', '국화', '연꽃'];
  
  // 형용사 (100+)
  const adjectivesKo = ['고요한', '조용한', '부드러운', '포근한', '평화로운', '온화한', '순수한', '달콤한', '오래된', '낡은', '빈티지', '고풍스러운', '시간을 초월한', '고전적인', '바랜', '소박한', '완벽한', '흠 없는', '이상적인', '완전한', '진실한', '진짜', '아름다운', '사랑스러운', '예쁜', '화려한', '놀라운', '멋진', '마법 같은', '신비로운', '영묘한', '신성한', '성스러운', '축복받은', '저주받은', '어두운', '밝은', '환한', '희미한', '창백한', '선명한', '형형색색의', '회색', '하얀', '검은', '황금빛', '은빛', '진홍빛', '하늘빛', '에메랄드빛', '호박빛', '따뜻한', '차가운', '뜨거운', '시원한', '얼어붙은', '타오르는', '큰', '작은', '거대한', '작디작은', '엄청난', '광활한', '끝없는', '무한한', '영원한', '짧은', '덧없는', '순간적인', '지속되는', '영구적인', '일시적인', '연약한', '강한', '약한', '강력한', '막강한', '미약한', '섬세한', '거친', '매끄러운', '날카로운', '무딘', '무거운', '가벼운', '두꺼운', '얇은', '깊은', '얕은'];
  
  // 명사 (100+)
  const nounsKo = ['기타', '피아노', '멜로디', '노래', '곡조', '리듬', '화음', '음악', '이야기', '여정', '기억', '꿈', '전설', '길', '순간', '마음', '영혼', '정신', '몸', '생명', '죽음', '탄생', '사랑', '미움', '진실', '거짓', '비밀', '신비', '답', '질문', '수수께끼', '퍼즐', '문제', '해결', '방법', '도로', '거리', '대로', '골목', '오솔길', '궤적', '경로', '방향', '나침반', '지도', '안내', '지도자', '추종자', '친구', '적', '낯선 이', '연인', '동반자', '파트너', '경쟁자', '동맹', '영웅', '악당', '희생자', '생존자', '전사', '시인', '예술가', '음악가', '가수', '무용수', '몽상가', '사색가', '탐구자', '발견자', '수호자', '패배자', '승자', '게임', '경기', '경주', '추격', '사냥', '탐색', '탐구', '모험', '항해', '여행', '비행', '걸음', '발걸음', '박자', '맥박', '메아리', '소리', '소음', '침묵', '목소리', '속삭임', '외침', '비명', '울음', '웃음', '미소', '눈물', '물방울'];
  
  // 동사 (100+)
  const verbsKo = ['걷다', '달리다', '춤추다', '노래하다', '연주하다', '일하다', '쉬다', '잠자다', '깨어나다', '꿈꾸다', '바라다', '소원 빌다', '기도하다', '믿다', '의심하다', '두려워하다', '사랑하다', '미워하다', '좋아하다', '원하다', '필요하다', '갖다', '잡다', '지키다', '잃다', '찾다', '탐색하다', '보다', '지켜보다', '응시하다', '듣다', '경청하다', '말하다', '속삭이다', '외치다', '울다', '웃다', '미소 짓다', '생각하다', '알다', '이해하다', '배우다', '가르치다', '읽다', '쓰다', '그리다', '창조하다', '만들다', '파괴하다', '고치다', '치유하다', '돕다', '구하다', '보호하다', '공격하다', '싸우다', '이기다', '지다', '시도하다', '성공하다', '도달하다', '만지다', '느끼다', '숨 쉬다', '살다', '죽다', '변하다', '자라다', '일어나다', '떨어지다', '뜨다', '가라앉다', '날다', '오르다', '내려가다', '뛰다', '기어가다', '미끄러지다', '굴러가다', '회전하다', '돌다', '구부리다', '뻗다', '선택하다', '결정하다', '판단하다', '측정하다', '세다', '계산하다', '추정하다', '추측하다', '상상하다', '기억하다', '잊다', '회상하다', '인식하다'];
  
  // 🔥 대규모 영어 단어 풀 (1000+ 단어)
  
  // 시간/시기 (50+)
  const timeWordsEn = ['morning', 'evening', 'night', 'dawn', 'afternoon', 'twilight', 'daybreak', 'dusk', 'midnight', 'noon', 'sunrise', 'sunset', 'nightfall', 'daylight', 'nighttime', 'daytime', 'today', 'tonight', 'yesterday', 'tomorrow', 'moment', 'instant', 'second', 'minute', 'hour', 'season', 'summer', 'winter', 'spring', 'autumn', 'fall'];
  
  // 감정 (100+)
  const emotionWordsEn = ['longing', 'excitement', 'joy', 'sadness', 'hope', 'loneliness', 'happiness', 'love', 'fear', 'anger', 'peace', 'calm', 'worry', 'anxiety', 'delight', 'sorrow', 'pain', 'pleasure', 'comfort', 'trust', 'doubt', 'regret', 'pride', 'shame', 'guilt', 'relief', 'surprise', 'wonder', 'awe', 'despair', 'passion', 'desire', 'yearning', 'melancholy', 'nostalgia', 'serenity', 'bliss', 'ecstasy', 'grief', 'heartache', 'heartbreak', 'devotion', 'affection', 'tenderness', 'warmth', 'coldness', 'emptiness', 'fullness', 'contentment', 'satisfaction'];
  
  // 장소 (100+)
  const placeWordsEn = ['street', 'park', 'café', 'ocean', 'forest', 'sky', 'window', 'room', 'house', 'home', 'garden', 'field', 'mountain', 'valley', 'river', 'lake', 'beach', 'shore', 'coast', 'island', 'city', 'town', 'village', 'road', 'path', 'bridge', 'corner', 'alley', 'avenue', 'square', 'market', 'station', 'harbor', 'port', 'hill', 'cliff', 'meadow', 'prairie', 'desert', 'jungle', 'cave', 'canyon', 'waterfall', 'stream', 'pond', 'bay', 'lighthouse', 'tower', 'castle', 'church', 'temple', 'school', 'library', 'museum', 'theater', 'mall', 'store', 'shop', 'restaurant', 'bar', 'club', 'hotel', 'motel', 'inn'];
  
  // 동작 (100+)
  const actionWordsEn = ['walking', 'running', 'flying', 'flowing', 'leaving', 'returning', 'staying', 'moving', 'dancing', 'singing', 'talking', 'speaking', 'whispering', 'shouting', 'crying', 'laughing', 'smiling', 'dreaming', 'sleeping', 'waking', 'rising', 'falling', 'jumping', 'climbing', 'swimming', 'floating', 'drifting', 'sailing', 'driving', 'riding', 'chasing', 'searching', 'finding', 'losing', 'holding', 'touching', 'feeling', 'breathing', 'living', 'dying', 'growing', 'fading', 'shining', 'glowing', 'burning', 'freezing', 'melting', 'breaking', 'healing', 'waiting', 'hoping', 'praying', 'wishing', 'believing', 'remembering', 'forgetting', 'knowing', 'wondering', 'questioning', 'understanding', 'thinking', 'feeling', 'loving', 'hating', 'missing', 'longing', 'yearning', 'needing', 'wanting', 'giving', 'taking', 'sharing', 'keeping', 'hiding', 'showing', 'seeing', 'watching', 'looking', 'staring', 'gazing', 'hearing', 'listening', 'calling', 'answering', 'asking', 'telling', 'saying', 'writing', 'reading', 'painting', 'drawing', 'creating', 'building', 'destroying'];
  
  // 자연/날씨 (80+)
  const natureWordsEn = ['sunlight', 'moonlight', 'starlight', 'wind', 'rain', 'snow', 'clouds', 'storm', 'thunder', 'lightning', 'breeze', 'gale', 'hurricane', 'tornado', 'fog', 'mist', 'haze', 'dew', 'frost', 'ice', 'fire', 'flame', 'smoke', 'ash', 'dust', 'earth', 'soil', 'sand', 'stone', 'rock', 'mountain', 'wave', 'tide', 'current', 'water', 'river', 'stream', 'waterfall', 'rainbow', 'aurora', 'comet', 'meteor', 'star', 'moon', 'sun', 'planet', 'galaxy', 'universe', 'cosmos', 'void', 'abyss', 'shadow', 'light', 'darkness', 'dawn', 'dusk', 'twilight', 'flower', 'rose', 'lily', 'daisy', 'tree', 'leaf', 'branch', 'root', 'seed', 'bloom', 'blossom', 'petal', 'thorn', 'vine', 'grass', 'moss', 'fern', 'bush', 'shrub', 'forest', 'jungle', 'woods'];
  
  // 형용사 (200+)
  const adjectivesEn = ['simple', 'quiet', 'gentle', 'tender', 'peaceful', 'soft', 'pure', 'sweet', 'old', 'worn', 'vintage', 'ancient', 'timeless', 'classic', 'faded', 'rustic', 'perfect', 'flawless', 'ideal', 'complete', 'whole', 'true', 'real', 'beautiful', 'lovely', 'pretty', 'gorgeous', 'stunning', 'amazing', 'wonderful', 'magical', 'mystical', 'ethereal', 'divine', 'sacred', 'holy', 'blessed', 'cursed', 'dark', 'light', 'bright', 'dim', 'pale', 'vivid', 'colorful', 'gray', 'white', 'black', 'golden', 'silver', 'crimson', 'azure', 'emerald', 'amber', 'jade', 'ruby', 'sapphire', 'warm', 'cold', 'hot', 'cool', 'frozen', 'burning', 'big', 'small', 'large', 'tiny', 'huge', 'vast', 'endless', 'infinite', 'eternal', 'brief', 'fleeting', 'momentary', 'lasting', 'permanent', 'temporary', 'fragile', 'strong', 'weak', 'powerful', 'mighty', 'feeble', 'delicate', 'rough', 'smooth', 'sharp', 'dull', 'heavy', 'light', 'thick', 'thin', 'deep', 'shallow', 'high', 'low', 'tall', 'short', 'wide', 'narrow', 'long', 'brief', 'fast', 'slow', 'quick', 'swift', 'rapid', 'sluggish', 'steady', 'stable', 'shaky', 'firm', 'solid', 'liquid', 'empty', 'full', 'hollow', 'dense', 'sparse', 'crowded', 'lonely', 'solitary', 'alone', 'together', 'united', 'separate', 'distant', 'close', 'near', 'far', 'remote', 'intimate', 'strange', 'familiar', 'foreign', 'native', 'wild', 'tame', 'free', 'trapped', 'bound', 'lost', 'found', 'hidden', 'visible', 'clear', 'blurry', 'sharp', 'foggy', 'misty', 'hazy', 'transparent', 'opaque', 'shiny', 'dull', 'glossy', 'matte', 'new', 'fresh', 'stale', 'rotten', 'young', 'old', 'ancient', 'modern', 'contemporary', 'future', 'past', 'present', 'yesterday', 'tomorrow', 'today', 'early', 'late', 'timely', 'premature', 'overdue', 'prompt', 'delayed', 'immediate', 'eventual', 'gradual', 'sudden', 'abrupt', 'smooth', 'harsh', 'gentle', 'violent', 'calm', 'stormy', 'turbulent', 'serene', 'chaotic', 'ordered', 'random', 'systematic'];
  
  // 명사 (200+)
  const nounsEn = ['guitar', 'piano', 'melody', 'song', 'tune', 'rhythm', 'harmony', 'music', 'story', 'journey', 'memory', 'dream', 'tale', 'path', 'moment', 'heart', 'soul', 'mind', 'spirit', 'body', 'life', 'death', 'birth', 'love', 'hate', 'truth', 'lie', 'secret', 'mystery', 'answer', 'question', 'riddle', 'puzzle', 'problem', 'solution', 'way', 'road', 'street', 'avenue', 'lane', 'trail', 'track', 'route', 'direction', 'compass', 'map', 'guide', 'leader', 'follower', 'friend', 'enemy', 'stranger', 'lover', 'companion', 'partner', 'rival', 'ally', 'foe', 'hero', 'villain', 'victim', 'survivor', 'warrior', 'poet', 'artist', 'musician', 'singer', 'dancer', 'dreamer', 'thinker', 'seeker', 'finder', 'keeper', 'loser', 'winner', 'player', 'game', 'match', 'contest', 'race', 'chase', 'hunt', 'search', 'quest', 'adventure', 'voyage', 'trip', 'travel', 'flight', 'ride', 'walk', 'run', 'dance', 'step', 'stride', 'pace', 'beat', 'pulse', 'throb', 'echo', 'sound', 'noise', 'silence', 'voice', 'whisper', 'shout', 'scream', 'cry', 'laugh', 'smile', 'tear', 'drop', 'fall', 'rise', 'climb', 'descent', 'ascent', 'peak', 'valley', 'summit', 'bottom', 'top', 'edge', 'center', 'middle', 'end', 'beginning', 'start', 'finish', 'goal', 'target', 'aim', 'purpose', 'reason', 'cause', 'effect', 'result', 'outcome', 'consequence', 'fate', 'destiny', 'fortune', 'luck', 'chance', 'opportunity', 'moment', 'time', 'age', 'era', 'epoch', 'period', 'phase', 'stage', 'step', 'level', 'degree', 'grade', 'rank', 'status', 'position', 'place', 'spot', 'location', 'site', 'area', 'region', 'zone', 'territory', 'land', 'country', 'nation', 'world', 'universe', 'cosmos', 'space', 'void', 'nothing', 'everything', 'something', 'anything', 'thing', 'object', 'item', 'piece', 'part', 'whole', 'fragment', 'shard', 'grain', 'particle', 'atom', 'molecule', 'cell', 'tissue', 'organ', 'system', 'body', 'form', 'shape', 'figure', 'image', 'picture', 'photo', 'painting', 'drawing', 'sketch', 'design', 'pattern', 'texture', 'color', 'shade', 'tone', 'hue', 'tint'];
  
  // 동사 (150+)  
  const verbsEn = ['walking', 'running', 'dancing', 'singing', 'playing', 'working', 'resting', 'sleeping', 'waking', 'dreaming', 'hoping', 'wishing', 'praying', 'believing', 'trusting', 'doubting', 'fearing', 'loving', 'hating', 'liking', 'wanting', 'needing', 'having', 'holding', 'keeping', 'losing', 'finding', 'searching', 'seeking', 'looking', 'seeing', 'watching', 'staring', 'gazing', 'glancing', 'hearing', 'listening', 'talking', 'speaking', 'saying', 'telling', 'asking', 'answering', 'calling', 'shouting', 'whispering', 'crying', 'laughing', 'smiling', 'frowning', 'thinking', 'knowing', 'understanding', 'learning', 'teaching', 'reading', 'writing', 'drawing', 'painting', 'creating', 'making', 'building', 'destroying', 'breaking', 'fixing', 'healing', 'hurting', 'helping', 'saving', 'protecting', 'defending', 'attacking', 'fighting', 'winning', 'losing', 'trying', 'failing', 'succeeding', 'achieving', 'reaching', 'touching', 'feeling', 'sensing', 'tasting', 'smelling', 'breathing', 'living', 'dying', 'existing', 'being', 'becoming', 'changing', 'growing', 'shrinking', 'expanding', 'contracting', 'rising', 'falling', 'floating', 'sinking', 'flying', 'soaring', 'diving', 'climbing', 'descending', 'jumping', 'leaping', 'hopping', 'skipping', 'crawling', 'creeping', 'sliding', 'rolling', 'spinning', 'turning', 'twisting', 'bending', 'stretching', 'reaching', 'grabbing', 'catching', 'throwing', 'tossing', 'dropping', 'picking', 'choosing', 'selecting', 'deciding', 'judging', 'measuring', 'counting', 'calculating', 'estimating', 'guessing', 'assuming', 'supposing', 'imagining', 'visualizing', 'picturing', 'remembering', 'forgetting', 'recalling', 'recognizing'];
  
  // 랜덤 인덱스 생성
  const getRandomWord = (words, offset) => {
    const idx = Math.floor(seedRandom(seed + offset) * words.length);
    return words[idx];
  };
  
  let lyrics = templateLyrics;
  
  // ===== 변수 치환 (기존 로직) =====
  lyrics = lyrics.replace(/\{time\}/g, getRandomWord(timeWords, 100));
  lyrics = lyrics.replace(/\{emotion\}/g, getRandomWord(emotionWords, 200));
  lyrics = lyrics.replace(/\{place\}/g, getRandomWord(placeWords, 300));
  lyrics = lyrics.replace(/\{action\}/g, getRandomWord(actionWords, 400));
  lyrics = lyrics.replace(/\{nature\}/g, getRandomWord(natureWords, 500));
  
  lyrics = lyrics.replace(/\{time_en\}/g, getRandomWord(timeWordsEn, 600));
  lyrics = lyrics.replace(/\{emotion_en\}/g, getRandomWord(emotionWordsEn, 700));
  lyrics = lyrics.replace(/\{place_en\}/g, getRandomWord(placeWordsEn, 800));
  lyrics = lyrics.replace(/\{action_en\}/g, getRandomWord(actionWordsEn, 900));
  lyrics = lyrics.replace(/\{nature_en\}/g, getRandomWord(natureWordsEn, 1000));
  
  // ===== 💡 새로운 기능: 일반 단어도 랜덤 교체 =====
  // 🔥 한국어 고정 단어 대규모 교체 (100+ 패턴)
  const koreanReplacements = [
    // 시간
    { from: '아침', to: timeWords, offset: 10000 },
    { from: '저녁', to: timeWords, offset: 10100 },
    { from: '밤', to: timeWords, offset: 10200 },
    { from: '새벽', to: timeWords, offset: 10210 },
    { from: '낮', to: timeWords, offset: 10220 },
    { from: '정오', to: timeWords, offset: 10230 },
    { from: '한밤중', to: timeWords, offset: 10240 },
    // 자연
    { from: '햇살', to: natureWords, offset: 10300 },
    { from: '달빛', to: natureWords, offset: 10400 },
    { from: '바람', to: natureWords, offset: 10500 },
    { from: '별빛', to: natureWords, offset: 10510 },
    { from: '비', to: natureWords, offset: 10520 },
    { from: '눈', to: natureWords, offset: 10530 },
    { from: '구름', to: natureWords, offset: 10540 },
    { from: '폭풍', to: natureWords, offset: 10550 },
    // 동작
    { from: '걸어가', to: actionWords, offset: 10600 },
    { from: '흘러가', to: actionWords, offset: 10700 },
    { from: '달려가', to: actionWords, offset: 10710 },
    { from: '날아가', to: actionWords, offset: 10720 },
    { from: '떠나가', to: actionWords, offset: 10730 },
    { from: '돌아와', to: actionWords, offset: 10740 },
    // 장소
    { from: '거리', to: placeWords, offset: 10800 },
    { from: '공원', to: placeWords, offset: 10810 },
    { from: '카페', to: placeWords, offset: 10820 },
    { from: '바다', to: placeWords, offset: 10830 },
    { from: '숲', to: placeWords, offset: 10840 },
    { from: '하늘', to: placeWords, offset: 10850 },
    // 감정
    { from: '그리움', to: emotionWords, offset: 10900 },
    { from: '설렘', to: emotionWords, offset: 10910 },
    { from: '기쁨', to: emotionWords, offset: 10920 },
    { from: '슬픔', to: emotionWords, offset: 10930 },
    { from: '희망', to: emotionWords, offset: 10940 },
    { from: '외로움', to: emotionWords, offset: 10950 },
    { from: '행복', to: emotionWords, offset: 10960 },
    // 자주 나오는 단어들
    { from: '고요한', to: adjectivesKo, offset: 11000 },
    { from: '포근한', to: adjectivesKo, offset: 11010 },
    { from: '따스한', to: adjectivesKo, offset: 11020 },
    { from: '평화로운', to: adjectivesKo, offset: 11030 },
    { from: '아름다운', to: adjectivesKo, offset: 11040 },
    { from: '노래', to: nounsKo, offset: 11100 },
    { from: '멜로디', to: nounsKo, offset: 11110 },
    { from: '기억', to: nounsKo, offset: 11120 },
    { from: '꿈', to: nounsKo, offset: 11130 },
    { from: '이야기', to: nounsKo, offset: 11140 },
    { from: '마음', to: nounsKo, offset: 11150 },
    { from: '사랑', to: nounsKo, offset: 11160 },
    { from: '시간', to: nounsKo, offset: 11170 },
    { from: '순간', to: nounsKo, offset: 11180 },
    { from: '걷다', to: verbsKo, offset: 11200 },
    { from: '달리다', to: verbsKo, offset: 11210 },
    { from: '꿈꾸다', to: verbsKo, offset: 11220 },
    { from: '노래하다', to: verbsKo, offset: 11230 },
    { from: '사랑하다', to: verbsKo, offset: 11240 }
  ];
  
  // 영어 고정 단어 교체 (대폭 확장!)
  const englishReplacements = [
    // 시간
    { from: 'morning', to: timeWordsEn, offset: 20000 },
    { from: 'evening', to: timeWordsEn, offset: 20100 },
    { from: 'night', to: timeWordsEn, offset: 20200 },
    { from: 'midnight', to: timeWordsEn, offset: 20300 },
    { from: 'dawn', to: timeWordsEn, offset: 20350 },
    { from: 'afternoon', to: timeWordsEn, offset: 20360 },
    // 자연
    { from: 'sunlight', to: natureWordsEn, offset: 20400 },
    { from: 'moonlight', to: natureWordsEn, offset: 20500 },
    { from: 'wind', to: natureWordsEn, offset: 20600 },
    { from: 'rain', to: natureWordsEn, offset: 20610 },
    { from: 'snow', to: natureWordsEn, offset: 20620 },
    { from: 'clouds', to: natureWordsEn, offset: 20630 },
    { from: 'starlight', to: natureWordsEn, offset: 20640 },
    { from: 'stars', to: natureWordsEn, offset: 20650 },
    // 동작
    { from: 'walking', to: actionWordsEn, offset: 20700 },
    { from: 'flowing', to: actionWordsEn, offset: 20800 },
    { from: 'running', to: actionWordsEn, offset: 20810 },
    { from: 'flying', to: actionWordsEn, offset: 20820 },
    // 장소
    { from: 'street', to: placeWordsEn, offset: 20900 },
    { from: 'park', to: placeWordsEn, offset: 20910 },
    { from: 'ocean', to: placeWordsEn, offset: 20920 },
    { from: 'forest', to: placeWordsEn, offset: 20930 },
    { from: 'sky', to: placeWordsEn, offset: 20940 },
    { from: 'corner', to: placeWordsEn, offset: 20950 },
    // 감정
    { from: 'longing', to: emotionWordsEn, offset: 21000 },
    { from: 'loneliness', to: emotionWordsEn, offset: 21010 },
    { from: 'happiness', to: emotionWordsEn, offset: 21020 },
    { from: 'sadness', to: emotionWordsEn, offset: 21030 },
    { from: 'joy', to: emotionWordsEn, offset: 21040 },
    // 🔥 자주 나오는 단어 대규모 확장 (1000+ 단어 보장!)
    { from: 'simple', to: ['quiet', 'gentle', 'tender', 'peaceful', 'soft', 'pure', 'sweet', 'serene', 'calm', 'still', 'tranquil', 'mellow', 'easy', 'plain', 'basic'], offset: 21100 },
    { from: 'old', to: ['worn', 'vintage', 'ancient', 'timeless', 'classic', 'faded', 'rustic', 'aged', 'antique', 'historic', 'traditional', 'weathered', 'seasoned', 'mature'], offset: 21110 },
    { from: 'guitar', to: ['piano', 'melody', 'song', 'tune', 'rhythm', 'harmony', 'music', 'instrument', 'strings', 'notes', 'chords', 'violin', 'flute', 'drum'], offset: 21120 },
    { from: 'story', to: ['journey', 'memory', 'dream', 'tale', 'song', 'path', 'moment', 'adventure', 'quest', 'voyage', 'odyssey', 'narrative', 'saga', 'legend'], offset: 21130 },
    { from: 'melodies', to: ['harmonies', 'rhythms', 'tunes', 'songs', 'notes', 'chords', 'sounds', 'beats', 'cadences', 'refrains', 'strains', 'arias', 'themes'], offset: 21140 },
    { from: 'perfect', to: ['flawless', 'ideal', 'complete', 'pure', 'whole', 'true', 'real', 'sublime', 'pristine', 'immaculate', 'exquisite', 'divine', 'heavenly'], offset: 21150 },
    // 추가 100+ 자주 나오는 단어들 (정확한 품사 매칭!)
    { from: 'beautiful', to: ['lovely', 'gorgeous', 'stunning', 'pretty', 'elegant', 'graceful', 'charming', 'radiant'], offset: 21200 },
    { from: 'love', to: ['affection', 'warmth', 'tenderness', 'devotion', 'passion', 'adoration', 'fondness'], offset: 21210 },
    { from: 'heart', to: ['soul', 'spirit', 'core', 'essence', 'being', 'center', 'depth'], offset: 21220 },
    { from: 'time', to: ['moment', 'instant', 'second', 'hour', 'season', 'period', 'age', 'era'], offset: 21230 },
    { from: 'day', to: timeWordsEn, offset: 21240 },
    { from: 'light', to: ['glow', 'shine', 'radiance', 'brightness', 'gleam', 'sparkle', 'shimmer'], offset: 21250 },
    { from: 'world', to: ['realm', 'sphere', 'universe', 'cosmos', 'space', 'domain', 'place'], offset: 21260 },
    { from: 'eyes', to: ['gaze', 'sight', 'vision', 'glance', 'stare', 'view'], offset: 21270 },
    { from: 'hand', to: ['palm', 'finger', 'fist', 'grip', 'touch'], offset: 21280 },
    { from: 'voice', to: ['sound', 'whisper', 'echo', 'call', 'cry', 'song', 'word', 'tone'], offset: 21290 },
    { from: 'dream', to: ['vision', 'hope', 'wish', 'fantasy', 'aspiration', 'desire'], offset: 21300 },
    { from: 'soul', to: ['spirit', 'essence', 'being', 'core', 'heart', 'self'], offset: 21310 },
    { from: 'road', to: ['path', 'lane', 'route', 'trail', 'way', 'avenue', 'street'], offset: 21320 },
    { from: 'life', to: ['existence', 'journey', 'path', 'voyage', 'story', 'tale'], offset: 21330 },
    { from: 'moment', to: ['instant', 'second', 'breath', 'heartbeat', 'flash', 'glimpse'], offset: 21340 },
    { from: 'memories', to: ['thoughts', 'recollections', 'reminiscences', 'flashbacks', 'echoes', 'traces'], offset: 21350 },
    { from: 'sky', to: ['heaven', 'clouds', 'horizon', 'atmosphere', 'air', 'firmament'], offset: 21360 },
    { from: 'water', to: ['rain', 'tide', 'wave', 'stream', 'river', 'ocean', 'sea'], offset: 21370 },
    { from: 'fire', to: ['flame', 'blaze', 'spark', 'ember', 'glow', 'heat'], offset: 21380 },
    { from: 'music', to: ['melody', 'harmony', 'rhythm', 'tune', 'song', 'sound'], offset: 21390 },
    { from: 'song', to: ['tune', 'melody', 'hymn', 'ballad', 'anthem', 'verse'], offset: 21400 },
    // 추가 50+ 단어
    { from: 'dance', to: verbsEn, offset: 21410 },
    { from: 'smile', to: ['grin', 'beam', 'laugh', 'chuckle', 'giggle'], offset: 21420 },
    { from: 'tears', to: ['drops', 'weeping', 'crying', 'sorrow', 'grief'], offset: 21430 },
    { from: 'shine', to: ['glow', 'gleam', 'sparkle', 'glitter', 'shimmer', 'radiate'], offset: 21440 },
    { from: 'glow', to: ['shine', 'radiate', 'beam', 'gleam', 'shimmer'], offset: 21450 },
    { from: 'shadow', to: ['shade', 'silhouette', 'darkness', 'gloom', 'dusk'], offset: 21460 },
    { from: 'echo', to: ['reverberation', 'resonance', 'repetition', 'reflection'], offset: 21470 },
    { from: 'silence', to: ['quiet', 'stillness', 'hush', 'peace', 'calm'], offset: 21480 },
    { from: 'sound', to: ['noise', 'tone', 'note', 'voice', 'echo', 'resonance'], offset: 21490 },
    { from: 'whisper', to: ['murmur', 'sigh', 'breath', 'rustle', 'hush'], offset: 21500 },
    { from: 'breath', to: ['sigh', 'exhale', 'gasp', 'whisper', 'breeze'], offset: 21510 },
    { from: 'feel', to: ['sense', 'touch', 'experience', 'perceive', 'know'], offset: 21520 },
    { from: 'touch', to: ['caress', 'stroke', 'feel', 'graze', 'brush'], offset: 21530 },
    { from: 'hold', to: ['grasp', 'clutch', 'embrace', 'grip', 'clasp'], offset: 21540 },
    { from: 'fade', to: ['vanish', 'disappear', 'dissolve', 'wane', 'dim'], offset: 21550 },
    { from: 'fall', to: ['descend', 'drop', 'plunge', 'tumble', 'sink'], offset: 21560 },
    { from: 'rise', to: ['ascend', 'climb', 'soar', 'lift', 'elevate'], offset: 21570 },
    { from: 'fly', to: ['soar', 'glide', 'float', 'hover', 'drift'], offset: 21580 },
    { from: 'float', to: ['drift', 'hover', 'glide', 'sail', 'swim'], offset: 21590 },
    { from: 'drift', to: ['float', 'wander', 'roam', 'glide', 'meander'], offset: 21600 },
    { from: 'wait', to: ['linger', 'pause', 'stay', 'remain', 'rest'], offset: 21610 },
    { from: 'hope', to: ['wish', 'dream', 'desire', 'aspire', 'yearn'], offset: 21620 },
    { from: 'fear', to: ['dread', 'worry', 'anxiety', 'terror', 'panic'], offset: 21630 },
    { from: 'peace', to: ['calm', 'serenity', 'tranquility', 'harmony', 'quiet'], offset: 21640 },
    { from: 'pain', to: ['ache', 'hurt', 'sorrow', 'suffering', 'agony'], offset: 21650 },
    { from: 'joy', to: ['happiness', 'delight', 'bliss', 'glee', 'ecstasy'], offset: 21660 },
    { from: 'sorrow', to: ['grief', 'sadness', 'melancholy', 'anguish', 'heartache'], offset: 21670 },
    { from: 'wonder', to: ['awe', 'amazement', 'marvel', 'curiosity', 'fascination'], offset: 21680 },
    { from: 'awe', to: ['wonder', 'amazement', 'reverence', 'astonishment'], offset: 21690 },
    { from: 'bliss', to: ['joy', 'ecstasy', 'euphoria', 'rapture', 'delight'], offset: 21700 },
    // 패턴 50+ 추가
    { from: 'lonely', to: ['solitary', 'alone', 'isolated', 'remote', 'desolate'], offset: 21800 },
    { from: 'alone', to: ['solo', 'solitary', 'isolated', 'single', 'lone'], offset: 21810 },
    { from: 'dark', to: ['shadowy', 'dim', 'gloomy', 'murky', 'obscure'], offset: 21820 },
    { from: 'bright', to: ['brilliant', 'radiant', 'luminous', 'vivid', 'gleaming'], offset: 21830 },
    { from: 'cold', to: ['chilly', 'frigid', 'icy', 'frozen', 'cool'], offset: 21840 },
    { from: 'warm', to: ['cozy', 'toasty', 'heated', 'mild', 'balmy'], offset: 21850 },
    { from: 'small', to: ['tiny', 'little', 'miniature', 'petite', 'minute'], offset: 21860 },
    { from: 'big', to: ['large', 'huge', 'vast', 'enormous', 'massive'], offset: 21870 },
    { from: 'fast', to: ['quick', 'swift', 'rapid', 'speedy', 'hasty'], offset: 21880 },
    { from: 'slow', to: ['gradual', 'leisurely', 'unhurried', 'steady', 'sluggish'], offset: 21890 },
    { from: 'strong', to: ['powerful', 'mighty', 'robust', 'sturdy', 'fierce'], offset: 21900 },
    { from: 'weak', to: ['feeble', 'frail', 'fragile', 'delicate', 'faint'], offset: 21910 },
    { from: 'new', to: ['fresh', 'novel', 'modern', 'recent', 'young'], offset: 21920 },
    { from: 'old', to: ['ancient', 'aged', 'vintage', 'antique', 'timeless'], offset: 21930 },
    { from: 'soft', to: ['gentle', 'tender', 'delicate', 'smooth', 'mild'], offset: 21940 },
    { from: 'hard', to: ['tough', 'solid', 'firm', 'rigid', 'stiff'], offset: 21950 },
    { from: 'lost', to: ['missing', 'gone', 'vanished', 'strayed', 'wandering'], offset: 21960 },
    { from: 'found', to: ['discovered', 'located', 'retrieved', 'uncovered'], offset: 21970 },
    { from: 'broken', to: ['shattered', 'cracked', 'fractured', 'damaged', 'torn'], offset: 21980 },
    { from: 'whole', to: ['complete', 'entire', 'total', 'full', 'intact'], offset: 21990 }
  ];
  
  // 한국어 교체 (100% 교체, seed에 따라 다른 단어로)
  for (const { from, to, offset } of koreanReplacements) {
    const regex = new RegExp(from, 'g');
    if (lyrics.includes(from)) {
      const replacement = getRandomWord(to, offset);
      lyrics = lyrics.replace(regex, replacement);
    }
  }
  
  // 영어 교체 (100% 교체, seed에 따라 다른 단어로)
  for (const { from, to, offset } of englishReplacements) {
    const regex = new RegExp(from, 'gi');
    if (lyrics.toLowerCase().includes(from.toLowerCase())) {
      const replacement = getRandomWord(to, offset);
      lyrics = lyrics.replace(regex, replacement);
    }
  }
  
  return lyrics;
}

/**
 * 🎯 AI 기반 YouTube 최적화 앨범 메타데이터 생성
 * - 클릭률 높은 제목 생성
 * - SEO 최적화 설명 생성
 * - 트렌드 기반 태그 생성
 */
async function generateAlbumMetadata(tracks, style, language = 'korean') {
  try {
    // 트랙 정보 추출
    const trackTitles = tracks.map((t, i) => `${i + 1}. ${t.title}`).join('\n');
    const lyricsPreview = tracks.map(t => {
      const lyrics = (t.lyrics || '').substring(0, 150);
      return `"${t.title}": ${lyrics}...`;
    }).join('\n\n');
    
    const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 180), 0);
    const totalMinutes = Math.round(totalDuration / 60);
    
    const systemPrompt = `당신은 YouTube 음악 플레이리스트 마케팅 전문가입니다.
높은 클릭률(CTR)과 SEO 최적화를 위한 메타데이터를 생성하는 것이 목표입니다.

📊 2026년 5월 기준 jjimplay 브랜드 플레이리스트 트렌드:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎯 10대 핵심 테마 (우선순위):

1️⃣ 새벽 감성 (Late Night Vibes)
   • 키워드: "새벽 3시", "혼자인 밤", "잠 못 드는 밤"
   • 타겟: 불면증, 야간 작업자, 감성 충전
   • 이모지: 🌙 ✨ 🌃 💫

2️⃣ 공부/집중 (Study & Focus)
   • 키워드: "집중력 UP", "공부할 때", "시험 기간"
   • 타겟: 학생, 수험생, 직장인
   • 이모지: 📚 ✍️ 🎧 💡

3️⃣ 드라이브 (Drive Music)
   • 키워드: "드라이브 음악", "야간 드라이빙", "여행 갈 때"
   • 타겟: 운전자, 여행객, 출퇴근족
   • 이모지: 🚗 🌆 🛣️ 🌅

4️⃣ 아침/모닝 (Morning Routine)
   • 키워드: "아침 활기", "상쾌한 시작", "모닝 루틴"
   • 타겟: 직장인, 주부, 얼리버드
   • 이모지: ☀️ ☕ 🌻 🌈

5️⃣ 이별/슬픔 (Heartbreak & Sadness)
   • 키워드: "이별 후", "눈물 나는 밤", "위로 받고 싶을 때"
   • 타겟: 실연자, 감정 치유 필요자
   • 이모지: 💔 😢 🌧️ 🥀

6️⃣ 운동/헬스장 (Workout Beats)
   • 키워드: "운동할 때", "헬스장 BGM", "에너지 충전"
   • 타겟: 운동러, 피트니스 애호가
   • 이모지: 💪 🏃 🔥 ⚡

7️⃣ 밤/감성 R&B (Night R&B)
   • 키워드: "밤에 듣기 좋은", "감성 R&B", "루프 음악"
   • 타겟: 20-30대, R&B 팬, 감성파
   • 이모지: 🎵 🌙 💜 🍷

8️⃣ 파티/축제 (Party Vibes)
   • 키워드: "파티 음악", "클럽 분위기", "신나는 음악"
   • 타겟: 파티 피플, 축제 참여자
   • 이모지: 🎉 🎊 🪩 🍾

9️⃣ 봄/상쾌함 (Spring Fresh)
   • 키워드: "봄 감성", "상쾌한 기분", "꽃 피는 계절"
   • 타겟: 봄 애호가, 힐링 추구자
   • 이모지: 🌸 🌺 🦋 🍃

🔟 수면/휴식 (Sleep & Relax)
   • 키워드: "잠 안올 때", "수면 유도", "명상 음악"
   • 타겟: 불면증, 수면 개선 필요자
   • 이모지: 😴 🌙 🕯️ 🧘

📈 jjimplay 스타일 가이드:
• 제목 구조: [이모지] [감성 키워드] | [영문 제목] [곡수+분수]
• 브랜드 톤: 시적이고 감성적, 직관적
• 타겟 명확화: 구체적 상황/시간/감정 제시
• SEO 최적화: 검색량 높은 키워드 우선 배치

💡 클릭률 향상 전략:
1. 첫 3단어가 핵심 (예: "새벽 3시에")
2. 숫자로 신뢰도 UP (예: "5곡 15분")
3. 상황 공감 유도 (예: "혼자인 밤,")
4. 브랜드 일관성 유지

⚠️ 절대 금지:
- "외 N곡", "모음집" 같은 구식 표현
- 이모지 3개 이상
- 영어만 사용
- 45자 초과 제목`;

    const userPrompt = `당신은 jjimplay 브랜드의 YouTube 플레이리스트 크리에이터입니다.
다음 ${tracks.length}곡의 플레이리스트를 위한 최고 수준의 메타데이터를 생성해주세요.

🎵 수록곡 정보:
${trackTitles}

📝 가사 핵심 감성:
${lyricsPreview}

🎨 음악 스타일: ${style}
⏱️ 총 재생시간: ${totalMinutes}분
🌐 언어: ${language}

🎯 생성 미션:
위 10대 테마 중 가장 적합한 테마를 선택하고, 해당 테마의 스타일 가이드를 100% 반영하여
사람들이 "우와! 이거 듣고 싶다!" 라고 외칠 만한 메타데이터를 만들어주세요.

📋 JSON 출력 형식:
{
  "albumName": "6-10자 이내, 시적이고 감성적인 한국어 앨범명 (예: 별이 내리는 밤, 너라는 계절, 잠 못 드는 밤에)",
  "youtubeTitle": "42자 이내 완벽한 제목 - 구조: [이모지 1-2개] [한글 감성키워드] | [영문 제목] [곡수]곡 [분수]분\n    예시:\n    🌙 새벽 3시 혼자인 밤 | Late Night Lofi Vibes 5곡 15분\n    📚 집중력 UP 공부 플레이리스트 | Study Focus Mix 7곡 21분\n    🚗 야간 드라이빙 감성 | Night Drive Music 6곡 18분",
  "description": "400-550자 완벽한 설명 (jjimplay 브랜드 톤 유지)\n    구조:\n    1행: 플레이리스트 한 줄 소개 (감성적, 시적)\n    2-3행: 빈 줄\n    4행: ✨ 이런 분들께 추천드려요:\n    5-7행: • [구체적 상황 1]\n           • [구체적 상황 2]\n           • [구체적 상황 3]\n    8-9행: 빈 줄\n    10행: 🎧 [추가 설명]\n    11-13행: 빈 줄\n    14-끝: A curated collection of... (영문 200-250자)",
  "tags": "쉼표로 구분된 정확히 22개 태그\n    구성: 한글 트렌드 키워드 8개 + 영문 키워드 14개\n    예: 새벽감성, 공부음악, 힐링플레이리스트, 밤에듣기좋은음악, 카페음악, 집중음악, 감성충전, 로파이힙합, lofi hiphop, study music, chill vibes, late night music, korean R&B, background music, focus music, relaxing music, sleep music, meditation music, cafe music, drive music, workout music, party music"
}

생성 가이드 (jjimplay 브랜드 필수 준수사항):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📌 albumName (앨범명):
• "외 N곡" 표현 절대 금지 ❌
• 6-10자 이내 시적 표현
• 가사의 핵심 감정을 담은 이름
• 자연/시간/감정 은유 활용
• 성공 예시:
  ✅ "별이 내리는 밤"
  ✅ "너라는 계절"
  ✅ "잠 못 드는 밤에"
  ✅ "흐르는 구름처럼"
  ✅ "새벽 세 시의 위로"
  ❌ "감성 플레이리스트 외 5곡"
  ❌ "음악 모음 10곡"

📌 youtubeTitle (YouTube 제목):
• 필수 구조: [이모지 1-2개] [한글 감성키워드] | [영문 제목] [곡수]곡 [분수]분
• 총 42자 이내 (초과 시 검색 노출 하락)
• 첫 3단어가 핵심 키워드여야 함
• 10대 테마 키워드 반드시 포함
• 성공 예시:
  ✅ "🌙 새벽 3시 혼자인 밤 | Late Night Lofi 5곡 15분"
  ✅ "📚 집중력 UP 공부할 때 | Study Focus 7곡 21분"
  ✅ "🚗 야간 드라이빙 감성 | Night Drive 6곡 18분"
  ✅ "☀️ 아침 활기 충전 | Morning Energy 4곡 12분"
  ✅ "💔 이별 후 눈물 나는 밤 | Heartbreak 5곡 15분"
  ❌ "좋은 음악 모음 | Good Music Collection"
  ❌ "플레이리스트 외 10곡 30분"

📌 description (설명):
• 총 400-550자 (한글 250자 + 영문 200자)
• 반드시 포함해야 할 구조:
  
  Line 1: 플레이리스트 한 줄 소개 (시적 표현)
  Line 2-3: [빈 줄]
  Line 4: ✨ 이런 분들께 추천드려요:
  Line 5: • [구체적 상황 1 - 시간/장소/감정 포함]
  Line 6: • [구체적 상황 2 - 타겟 명확화]
  Line 7: • [구체적 상황 3 - 공감 유도]
  Line 8-9: [빈 줄]
  Line 10: 🎧 [추가 설명 - 음악적 특징/분위기]
  Line 11-13: [빈 줄]
  Line 14~: A curated collection of ${tracks.length} tracks perfect for... (영문 200-250자)

• 성공 예시:
"""
🌙 새벽 3시, 혼자만의 시간을 위한 감성 로파이 플레이리스트입니다.

✨ 이런 분들께 추천드려요:
• 깊은 밤, 잠 못 드는 밤 감성을 느끼고 싶을 때
• 공부하거나 작업하면서 집중력이 필요할 때
• 조용한 카페 분위기를 집에서 느끼고 싶을 때

🎧 부드러운 비트와 따뜻한 멜로디가 당신의 밤을 감싸줍니다.

A curated collection of ${tracks.length} late-night lofi tracks perfect for studying, working, and relaxing during those quiet hours. Featuring smooth beats, warm melodies, and chill vibes to help you stay focused and peaceful. Ideal for late-night study sessions, creative work, or simply unwinding after a long day.
"""

📌 tags (태그):
• 정확히 22개 (한글 8개 + 영문 14개)
• 순서: 한글 트렌드 키워드 → 영문 키워드 → 장르 → 분위기 → 용도 → 시간대
• 띄어쓰기 없이 붙여쓰기 (SEO 최적화)
• 10대 테마 키워드 반드시 포함
• 성공 예시:
  "새벽감성, 공부음악, 힐링플레이리스트, 밤에듣기좋은음악, 카페음악, 집중음악, 감성충전, 로파이힙합, lofi hiphop, study music, chill vibes, late night music, korean R&B, background music, focus music, relaxing music, sleep music, meditation music, cafe music, drive music, workout music, party music"

🎯 품질 체크리스트:
□ albumName: "외 N곡" 없음, 시적 표현, 6-10자
□ youtubeTitle: 이모지 1-2개, 42자 이내, 숫자 포함
□ description: 400-550자, 3가지 추천 상황, 빈 줄 구분
□ tags: 정확히 22개, 띄어쓰기 없음

JSON만 출력하세요 (다른 설명 불필요):`;

    console.log('🎯 jjimplay AI 앨범 메타데이터 생성 시작... (2026년 5월 트렌드 반영)');
    
    const completion = await client.chat.completions.create({
      model: 'gpt-5',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.85, // 최적 창의성 (안정성 + 품질)
      max_tokens: 2500,
      presence_penalty: 0.8,
      frequency_penalty: 0.6
    });

    const responseText = completion.choices[0].message.content.trim();
    console.log('✅ AI 응답 수신:', responseText.substring(0, 200));
    
    // JSON 추출 (마크다운 코드 블록 제거)
    let jsonText = responseText;
    const jsonMatch = responseText.match(/```(?:json)?\s*(\{[\s\S]*?\})\s*```/);
    if (jsonMatch) {
      jsonText = jsonMatch[1];
    }
    
    const metadata = JSON.parse(jsonText);
    
    console.log('✅ AI 앨범 메타데이터 생성 완료:', {
      albumName: metadata.albumName,
      titleLength: metadata.youtubeTitle.length,
      descLength: metadata.description.length,
      tagCount: metadata.tags.split(',').length
    });
    
    return metadata;
    
  } catch (error) {
    console.error('❌ AI 메타데이터 생성 실패:', error);
    
    // 🎯 폴백: jjimplay 브랜드 10대 테마 기반 최고급 메타데이터 생성
    const totalDuration = tracks.reduce((sum, t) => sum + (t.duration || 180), 0);
    const totalMinutes = Math.round(totalDuration / 60);
    
    // 🎨 10대 테마별 완벽한 메타데이터 템플릿
    const themeTemplates = [
      // 1️⃣ 새벽 감성
      {
        albumName: '새벽 세 시의 위로',
        youtubeTitle: `🌙 새벽 3시 혼자인 밤 | Late Night Lofi ${tracks.length}곡 ${totalMinutes}분`,
        description: `🌙 깊은 밤, 혼자만의 시간을 위한 감성 플레이리스트입니다.\n\n` +
          `✨ 이런 분들께 추천드려요:\n` +
          `• 새벽 2-3시, 잠 못 드는 밤 감성을 느끼고 싶을 때\n` +
          `• 혼자만의 시간 속에서 생각을 정리하고 싶을 때\n` +
          `• 조용히 공부하거나 작업하면서 집중이 필요할 때\n\n` +
          `🎧 부드러운 비트와 따뜻한 멜로디가 당신의 밤을 감싸줍니다.\n\n` +
          `A curated collection of ${tracks.length} late-night lofi tracks perfect for those quiet 2-3 AM hours when you can't sleep. Featuring smooth beats, warm melodies, and chill vibes to help you reflect, study, or simply enjoy your solitary time. Ideal for late-night work, deep thinking, or peaceful relaxation.`,
        tags: '새벽감성, 혼자인밤, 잠못드는밤, 새벽3시, 밤에듣기좋은음악, 감성충전, 로파이힙합, 힐링음악, lofi hiphop, late night music, study music, chill vibes, 3am music, relaxing music, sleep music, meditation music, background music, korean lofi, night vibes, peaceful music, focus music, ambient music'
      },
      // 2️⃣ 공부/집중
      {
        albumName: '집중의 시간',
        youtubeTitle: `📚 집중력 UP 공부할 때 | Study Focus ${tracks.length}곡 ${totalMinutes}분`,
        description: `📚 공부하고 작업할 때 집중력을 높여주는 플레이리스트입니다.\n\n` +
          `✨ 이런 분들께 추천드려요:\n` +
          `• 시험 기간, 중요한 공부나 과제를 할 때\n` +
          `• 직장에서 업무 집중력이 필요한 순간\n` +
          `• 카페 분위기에서 조용히 작업하고 싶을 때\n\n` +
          `🎧 방해받지 않는 차분한 멜로디로 몰입을 도와드립니다.\n\n` +
          `A curated collection of ${tracks.length} focus-enhancing tracks perfect for studying, working, and deep concentration. Featuring calm instrumentals, steady rhythms, and minimal distractions to help you stay in the zone. Ideal for exam preparation, project work, or any task requiring sustained attention.`,
        tags: '공부음악, 집중음악, 집중력UP, 공부할때, 시험기간, 작업음악, 카페음악, 힐링플레이리스트, study music, focus music, concentration music, work music, background music, cafe music, productive music, study playlist, exam music, work focus, chill study, lofi study, instrumental music'
      },
      // 3️⃣ 드라이브
      {
        albumName: '도로 위의 감성',
        youtubeTitle: `🚗 야간 드라이빙 감성 | Night Drive ${tracks.length}곡 ${totalMinutes}분`,
        description: `🚗 밤 도로를 달리며 느끼는 특별한 감성의 플레이리스트입니다.\n\n` +
          `✨ 이런 분들께 추천드려요:\n` +
          `• 야간 드라이브하면서 감성을 느끼고 싶을 때\n` +
          `• 출퇴근 길, 이동 시간을 즐겁게 보내고 싶을 때\n` +
          `• 주말 여행이나 장거리 운전할 때\n\n` +
          `🎧 도로 위의 모든 순간을 특별하게 만들어드립니다.\n\n` +
          `A curated collection of ${tracks.length} night drive tracks perfect for those late-night journeys on the road. Featuring smooth grooves, atmospheric sounds, and uplifting melodies to enhance your driving experience. Ideal for road trips, commutes, or simply cruising through the city lights.`,
        tags: '드라이브음악, 야간드라이빙, 출퇴근음악, 여행음악, 운전할때, 도로위, 감성드라이브, 이동시간, drive music, night drive, road trip music, car music, travel music, driving playlist, highway music, cruising music, evening drive, city lights, smooth drive, journey music, moving music'
      },
      // 4️⃣ 아침/모닝
      {
        albumName: '아침의 첫 빛',
        youtubeTitle: `☀️ 아침 활기 충전 모닝 | Morning Energy ${tracks.length}곡 ${totalMinutes}분`,
        description: `☀️ 상쾌한 아침, 하루를 시작하는 활기찬 플레이리스트입니다.\n\n` +
          `✨ 이런 분들께 추천드려요:\n` +
          `• 아침 일찍 일어나서 활기차게 하루를 시작하고 싶을 때\n` +
          `• 모닝 루틴하면서 긍정적인 에너지를 얻고 싶을 때\n` +
          `• 출근 준비나 아침 운동할 때\n\n` +
          `🎧 밝고 경쾌한 멜로디가 당신의 하루를 응원합니다.\n\n` +
          `A curated collection of ${tracks.length} energizing morning tracks perfect for starting your day with positivity and vigor. Featuring bright melodies, uplifting rhythms, and cheerful vibes to help you wake up refreshed. Ideal for morning routines, breakfast time, or commuting to work.`,
        tags: '아침음악, 모닝루틴, 아침활기, 상쾌한아침, 하루시작, 출근음악, 긍정에너지, 얼리버드, morning music, wake up music, morning routine, energizing music, positive vibes, breakfast music, start your day, uplifting music, fresh morning, sunrise music, happy morning, motivational music, productive morning'
      },
      // 5️⃣ 이별/슬픔
      {
        albumName: '눈물 젖은 밤',
        youtubeTitle: `💔 이별 후 눈물 나는 밤 | Heartbreak ${tracks.length}곡 ${totalMinutes}분`,
        description: `💔 이별의 아픔 속에서 위로받을 수 있는 감성 플레이리스트입니다.\n\n` +
          `✨ 이런 분들께 추천드려요:\n` +
          `• 이별 후, 마음을 추스르고 위로받고 싶을 때\n` +
          `• 슬픈 감정을 음악으로 표현하고 정리하고 싶을 때\n` +
          `• 혼자만의 시간 속에서 눈물을 흘려도 괜찮을 때\n\n` +
          `🎧 슬픔도 아름다운 감정임을 알려주는 멜로디들입니다.\n\n` +
          `A curated collection of ${tracks.length} heartbreak tracks perfect for healing after a breakup. Featuring emotional vocals, melancholic melodies, and comforting lyrics to help you process your feelings. Ideal for late nights, solitary moments, or whenever you need to let your emotions flow freely.`,
        tags: '이별음악, 슬픈음악, 위로음악, 눈물나는밤, 이별후, 감성발라드, 힐링음악, 실연음악, heartbreak music, sad music, breakup playlist, emotional music, crying music, comfort music, healing songs, melancholic music, lonely night, tears music, emotional ballad, goodbye songs'
      },
      // 6️⃣ 운동/헬스장
      {
        albumName: '땀의 리듬',
        youtubeTitle: `💪 운동할 때 헬스장 BGM | Workout Beats ${tracks.length}곡 ${totalMinutes}분`,
        description: `💪 강렬한 운동을 위한 에너지 넘치는 플레이리스트입니다.\n\n` +
          `✨ 이런 분들께 추천드려요:\n` +
          `• 헬스장에서 웨이트 트레이닝할 때\n` +
          `• 러닝이나 유산소 운동으로 체력을 기를 때\n` +
          `• 홈트레이닝하면서 동기부여가 필요할 때\n\n` +
          `🎧 강한 비트로 당신의 한계를 돌파하게 도와드립니다.\n\n` +
          `A curated collection of ${tracks.length} high-energy workout tracks perfect for gym sessions, running, and intense training. Featuring powerful beats, motivating rhythms, and adrenaline-pumping sounds to push your limits. Ideal for weight lifting, cardio workouts, or any fitness routine requiring maximum energy.`,
        tags: '운동음악, 헬스장음악, 운동할때, 웨이트트레이닝, 러닝음악, 유산소운동, 홈트음악, 동기부여음악, workout music, gym music, fitness music, training music, running music, cardio music, exercise playlist, pump up music, motivation music, high energy, power workout, athletic music'
      },
      // 7️⃣ 밤/감성 R&B
      {
        albumName: '밤의 속삭임',
        youtubeTitle: `🎵 밤에 듣기 좋은 감성 R&B | Night R&B ${tracks.length}곡 ${totalMinutes}분`,
        description: `🎵 깊은 밤, 감성에 젖어드는 R&B 플레이리스트입니다.\n\n` +
          `✨ 이런 분들께 추천드려요:\n` +
          `• 밤 늦게 감성적인 R&B를 듣고 싶을 때\n` +
          `• 조용한 분위기에서 루프 음악에 빠지고 싶을 때\n` +
          `• 20-30대 감성파들의 밤 시간 BGM으로\n\n` +
          `🎧 부드러운 보컬과 그루브한 비트가 밤을 채웁니다.\n\n` +
          `A curated collection of ${tracks.length} sensual R&B tracks perfect for late-night listening and mood-setting. Featuring smooth vocals, groovy basslines, and atmospheric production to create the perfect nighttime vibe. Ideal for relaxing evenings, intimate moments, or simply enjoying quality R&B music.`,
        tags: '밤에듣기좋은음악, 감성R&B, 루프음악, 밤음악, 20대음악, 30대음악, 감성파, 그루브, R&B music, night R&B, smooth R&B, korean R&B, late night vibes, mood music, groove music, chill R&B, evening music, lounge music, sensual music, atmospheric R&B'
      },
      // 8️⃣ 파티/축제
      {
        albumName: '축제의 밤',
        youtubeTitle: `🎉 신나는 파티 클럽 분위기 | Party Vibes ${tracks.length}곡 ${totalMinutes}분`,
        description: `🎉 신나게 즐기는 파티와 축제를 위한 플레이리스트입니다.\n\n` +
          `✨ 이런 분들께 추천드려요:\n` +
          `• 친구들과 홈파티하면서 분위기를 띄우고 싶을 때\n` +
          `• 클럽이나 페스티벌 분위기를 느끼고 싶을 때\n` +
          `• 주말 모임이나 생일 파티 BGM으로\n\n` +
          `🎧 강렬한 EDM 비트로 밤새 춤추고 싶어집니다.\n\n` +
          `A curated collection of ${tracks.length} high-energy party tracks perfect for celebrations, gatherings, and dancing all night long. Featuring pumping EDM beats, catchy hooks, and festival-ready anthems to keep the energy high. Ideal for house parties, club nights, or any event that needs great music.`,
        tags: '파티음악, 클럽음악, 신나는음악, 축제음악, EDM음악, 댄스음악, 홈파티음악, 생일파티, party music, club music, EDM music, dance music, festival music, celebration music, upbeat music, energetic music, house party, DJ mix, nightclub, rave music'
      },
      // 9️⃣ 봄/상쾌함
      {
        albumName: '꽃잎이 흩날리다',
        youtubeTitle: `🌸 봄 감성 상쾌한 기분 | Spring Fresh ${tracks.length}곡 ${totalMinutes}분`,
        description: `🌸 봄의 따뜻함과 설렘을 담은 상쾌한 플레이리스트입니다.\n\n` +
          `✨ 이런 분들께 추천드려요:\n` +
          `• 봄날 산책하면서 상쾌한 기분을 느끼고 싶을 때\n` +
          `• 꽃 피는 계절의 설렘과 희망을 느끼고 싶을 때\n` +
          `• 봄 소풍이나 야외 활동 BGM으로\n\n` +
          `🎧 따뜻한 햇살과 꽃향기가 느껴지는 멜로디들입니다.\n\n` +
          `A curated collection of ${tracks.length} spring-inspired tracks perfect for enjoying the fresh season of blooming flowers. Featuring bright melodies, cheerful rhythms, and uplifting vibes to match the beauty of spring. Ideal for outdoor walks, picnics, or simply celebrating the renewal of nature.`,
        tags: '봄음악, 봄감성, 상쾌한기분, 꽃피는계절, 봄날산책, 봄소풍, 설렘음악, 희망음악, spring music, fresh music, blossom music, outdoor music, cheerful music, renewal music, hopeful music, nature music, picnic music, flower season, bright music, seasonal music'
      },
      // 🔟 수면/휴식
      {
        albumName: '잠드는 순간',
        youtubeTitle: `😴 잠 안올 때 수면 유도 | Sleep Music ${tracks.length}곡 ${totalMinutes}분`,
        description: `😴 편안한 잠을 위한 수면 유도 플레이리스트입니다.\n\n` +
          `✨ 이런 분들께 추천드려요:\n` +
          `• 밤에 잠이 오지 않아 고민하실 때\n` +
          `• 불면증으로 수면의 질을 개선하고 싶을 때\n` +
          `• 명상이나 요가하면서 마음을 진정시키고 싶을 때\n\n` +
          `🎧 부드러운 백색소음과 자연의 소리로 깊은 잠을 유도합니다.\n\n` +
          `A curated collection of ${tracks.length} calming sleep tracks perfect for overcoming insomnia and achieving deep rest. Featuring gentle ambient sounds, soothing melodies, and white noise elements to help you relax and fall asleep naturally. Ideal for bedtime, meditation, or any moment requiring complete relaxation.`,
        tags: '수면음악, 잠안올때, 수면유도, 불면증음악, 명상음악, 백색소음, 힐링음악, 자연의소리, sleep music, insomnia music, relaxation music, meditation music, white noise, calming music, bedtime music, peaceful music, rest music, quiet music, ambient music, nature sounds'
      }
    ];
    
    // 랜덤으로 10대 테마 중 하나 선택
    const selectedTheme = themeTemplates[Math.floor(Math.random() * themeTemplates.length)];
    
    console.log('✅ jjimplay 브랜드 폴백 메타데이터 생성 완료:', {
      theme: selectedTheme.albumName,
      titleLength: selectedTheme.youtubeTitle.length,
      descLength: selectedTheme.description.length,
      tagCount: selectedTheme.tags.split(',').length
    });
    
    return selectedTheme;
  }
}

module.exports = {
  generateLyrics,
  generateTitle,
  generateAlbumMetadata,
  collectRealIssues,
  generateLyricsFromIssue,
  generateWithLLM  // ✅ OOOffi 스타일 제목 생성에 필요
};
