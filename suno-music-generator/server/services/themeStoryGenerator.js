/**
 * 🎨 테마 기반 다양한 이야기 생성기
 * 
 * 사용자가 "캠핑", "사랑", "우정" 등의 테마를 입력하면
 * 해당 테마에 맞는 15가지 다양한 이야기를 자동 생성합니다.
 */

const { GoogleGenerativeAI } = require('@google/generative-ai');

// 환경 변수에서 Gemini API 키 가져오기 (유효한 키 사용)
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  console.error('❌ GEMINI_API_KEY가 설정되지 않았습니다!');
  throw new Error('GEMINI_API_KEY is required for theme-based story generation');
}

const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);

/**
 * 테마에서 다양한 이야기 생성
 * @param {string} theme - 테마 (예: "캠핑", "사랑", "우정")
 * @param {string} language - 언어 (korean/english)
 * @param {number} count - 생성할 이야기 개수
 * @returns {Promise<Array>} - 이야기 배열
 */
async function generateStoriesFromTheme(theme, language = 'korean', count = 15) {
  if (!theme || !theme.trim()) {
    // 테마가 없으면 일반 트렌드 이슈 반환
    return null;
  }

  const languageText = language === 'korean' ? '한국어' : 'English';
  const targetLanguage = language === 'korean' ? '한국어' : 'English';

  console.log(`\n🎨 테마 기반 이야기 생성 시작:`);
  console.log(`   📝 테마: "${theme}"`);
  console.log(`   🌐 언어: ${languageText}`);
  console.log(`   🔢 개수: ${count}개`);

  try {
    const systemInstruction = `당신은 창의적인 스토리텔러입니다.

🎯 **임무**: 주어진 테마에 맞는 ${count}개의 독특하고 다양한 이야기를 만드세요.

✅ **원칙**:
1. 각 이야기는 **서로 완전히 달라야** 합니다
2. 감정, 상황, 등장인물, 배경을 다양하게 변화
3. 긍정적이고 공감 가능한 내용
4. 구체적인 장면과 감각적 묘사 포함

🚫 **제외**: 정치, 폭력, 불법, 성적 내용, 비극적 결말`;

    const userPrompt = `📚 **테마**: "${theme}"

${count}개의 다양한 이야기를 생성하세요.

**각 이야기 요구사항**:
- 제목: ${targetLanguage}로 5-15자
- 설명: 구체적 상황 묘사 (50-100자)
- 감정 스토리: 감각적이고 생생한 장면 묘사 (150-300자)
- 감각 디테일: 시각, 청각, 촉각, 후각 등 (50자)
- 키워드: 3-5개

**다양성 예시** (테마: "캠핑"):
1. 산속 캠핑 - 고요한 아침, 새소리
2. 해변 캠핑 - 파도 소리, 노을
3. 계곡 캠핑 - 물소리, 시원함
4. 도심 캠핑 - 옥상, 별빛, 도시 야경
5. 겨울 캠핑 - 눈밭, 따뜻한 난로
6. 혼자 캠핑 - 명상, 자기 성찰
7. 가족 캠핑 - 아이들 웃음, 화목
8. 커플 캠핑 - 로맨틱, 추억
9. 친구들 캠핑 - 캠프파이어, 기타
10. 차박 캠핑 - 자동차, 자유로움
... (테마에 맞게 다양하게)

**출력 형식** (JSON):
\`\`\`json
{
  "theme": "${theme}",
  "language": "${languageText}",
  "count": ${count},
  "stories": [
    {
      "id": 1,
      "title": "이야기 제목",
      "description": "간단한 상황 설명",
      "emotionalStory": "감정적이고 생생한 장면 묘사. 구체적인 이미지와 감정을 담아내세요.",
      "sensoryDetails": "시각적/청각적/촉각적 요소",
      "category": "상황/감정/관계/장소 등",
      "mood": "밝음/따뜻함/설렘/평온함/희망찬",
      "keywords": ["키워드1", "키워드2", "키워드3"]
    }
  ]
}
\`\`\`

지금 ${count}개의 완전히 다른 이야기를 생성하세요:`;

    console.log('🤖 Gemini API 호출 중...');

    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.95,  // 창의성 높게
        maxOutputTokens: 8192,
      },
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    let text = response.text();

    console.log('📥 Gemini 응답 받음 (길이:', text.length, '자)');

    // JSON 추출
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      console.error('❌ JSON 형식을 찾을 수 없음');
      return null;
    }

    const jsonText = jsonMatch[1] || jsonMatch[0];
    const data = JSON.parse(jsonText);

    if (!data.stories || !Array.isArray(data.stories)) {
      console.error('❌ stories 배열을 찾을 수 없음');
      return null;
    }

    console.log(`✅ ${data.stories.length}개 이야기 생성 완료!`);
    console.log(`   📋 예시: ${data.stories.slice(0, 3).map(s => s.title).join(', ')}...`);

    // ID 자동 할당
    data.stories.forEach((story, index) => {
      story.id = index + 1;
      story.realNews = false;  // 테마 기반은 실제 뉴스 아님
      story.safe = true;
      story.source = `테마: ${theme}`;
    });

    return {
      theme: theme,
      searchMethod: 'Theme-Based Story Generation',
      count: data.stories.length,
      issues: data.stories
    };

  } catch (error) {
    console.error('❌ 테마 이야기 생성 실패:', error.message);
    
    // API 키 문제 감지
    if (error.message && error.message.includes('403') && error.message.includes('leaked')) {
      console.error('🔐 Gemini API 키가 유출되어 차단되었습니다!');
      console.error('💡 해결방법: https://aistudio.google.com/app/apikey 에서 새 API 키를 발급받아');
      console.error('   .env 파일의 GEMINI_API_KEY를 업데이트하세요.');
    } else if (error.message && error.message.includes('API key')) {
      console.error('🔑 Gemini API 키 관련 오류입니다.');
      console.error('💡 GEMINI_API_KEY 환경 변수를 확인하세요.');
    }
    
    console.error('   Stack:', error.stack);
    return null;
  }
}

/**
 * 테마에 맞는 추천 키워드 생성
 */
function getRecommendedKeywords(theme) {
  const themeKeywords = {
    '캠핑': ['캠프파이어', '텐트', '자연', '별빛', '모닥불', '등산', '산', '계곡'],
    '사랑': ['첫사랑', '설렘', '고백', '데이트', '이별', '재회', '그리움', '추억'],
    '우정': ['친구', '동료', '신뢰', '우정', '함께', '추억', '웃음', '위로'],
    '여행': ['여행', '모험', '탐험', '새로움', '자유', '도전', '경험', '추억'],
    '추억': ['과거', '향수', '회상', '그때', '옛날', '기억', '순간', '시간'],
    '희망': ['꿈', '미래', '도전', '성장', '변화', '새출발', '가능성', '믿음'],
    '봄': ['벚꽃', '새싹', '봄바람', '따스함', '시작', '설렘', '개화', '생명'],
    '여름': ['바다', '햇살', '열정', '휴가', '시원함', '활기', '에너지', '자유'],
    '가을': ['단풍', '낙엽', '가을바람', '향수', '감성', '성숙', '수확', '정취'],
    '겨울': ['눈', '크리스마스', '따뜻함', '포근함', '추억', '위로', '휴식', '조용함'],
    '도전': ['용기', '목표', '성장', '극복', '열정', '노력', '성취', '변화'],
    '위로': ['공감', '이해', '따뜻함', '치유', '회복', '평온', '안정', '희망']
  };

  return themeKeywords[theme] || ['일상', '감정', '경험', '추억'];
}

module.exports = {
  generateStoriesFromTheme,
  getRecommendedKeywords
};
