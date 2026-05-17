/**
 * Google Gemini를 사용한 가사 생성 서비스
 */
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Gemini API 초기화
const apiKey = process.env.GEMINI_API_KEY || 'AIzaSyCS3nl6jkeSaWFKByCbCUJZSOjSXVQOnp4';
const genAI = new GoogleGenerativeAI(apiKey);

console.log('🔑 Gemini API initialized');
console.log(`   API Key: ${apiKey.substring(0, 15)}... (${apiKey.length} chars)`);

/**
 * Gemini로 가사 생성
 */
async function generateLyricsWithGemini(issue, style, language, gender, index, previousLyrics = []) {
  const languageText = language === 'korean' ? '한국어' : '영어';
  const genderText = gender === 'female' ? '여성' : gender === 'male' ? '남성' : '중성적인';
  const targetLanguage = language === 'korean' ? '한국어' : 'English';
  
  const uniqueSeed = Date.now() + index * 1000;
  
  try {
    console.log(`🎵 Gemini로 ${languageText} 가사 생성 중...`);
    console.log(`   📌 이슈: ${issue.title}`);
    console.log(`   📝 설명: ${issue.description}`);
    
    // 이전 가사 샘플 준비
    let previousLyricsSample = '';
    if (previousLyrics.length > 0) {
      const recentLyrics = previousLyrics.slice(-3);
      previousLyricsSample = '\n\n**❌ 절대 사용 금지 - 이전 가사**:\n\n';
      recentLyrics.forEach((lyrics, i) => {
        const sample = lyrics.substring(0, 200).replace(/\n/g, ' ');
        previousLyricsSample += `이전 곡 ${i + 1}: "${sample}..."\n\n`;
      });
    }
    
    // 랜덤 접근 방식
    const approaches = [
      "1인칭 시점으로 직접적인 경험과 감정을",
      "2인칭 시점으로 누군가에게 전하는 메시지를",
      "3인칭 관찰자 시점으로 객관적인 이야기를",
      "과거 회상으로 지나간 시간을 돌아보며",
      "현재 진행형으로 지금 이 순간을 포착하며"
    ];
    
    const times = ["새벽", "아침", "오후", "저녁", "밤"];
    const places = ["카페", "거리", "공원", "집", "바다"];
    const emotions = ["그리움", "희망", "평온", "설렘", "위로"];
    
    const approach = approaches[uniqueSeed % approaches.length];
    const time = times[(uniqueSeed + 17) % times.length];
    const place = places[(uniqueSeed + 31) % places.length];
    const emotion = emotions[(uniqueSeed + 47) % emotions.length];
    
    const prompt = `당신은 전문 작사가입니다.

다음 이슈를 바탕으로 완전히 독창적인 ${targetLanguage} 가사를 작성하세요:

📰 이슈: ${issue.title}
📝 설명: ${issue.description}
🏷️ 키워드: ${issue.keywords.join(', ')}
😊 분위기: ${issue.mood}

🎵 음악 정보:
- 스타일: ${style}
- 보컬: ${genderText}
- 곡 번호: ${index + 1}번째

🎭 이 곡만의 접근:
- ${approach}
- 시간: ${time}
- 장소: ${place}
- 감정: ${emotion}

${previousLyricsSample}

⚠️ 중요:
1. 이슈를 직접 언급하지 말고 감정과 상황으로 표현
2. 위의 이전 가사들과 완전히 다른 새로운 가사
3. ${approach} 방식으로 작성
4. 구체적이고 감각적인 표현 사용
5. 최소 1800자 이상 (한국어) 또는 500단어 이상 (영어)

구조:
[Intro]
[Verse 1]
[Pre-Chorus]
[Chorus]
[Verse 2]
[Pre-Chorus]
[Chorus]
[Bridge]
[Verse 3]
[Final Chorus]
[Outro]

가사만 출력하세요 (설명 없이):`;

    // Gemini 모델 사용
    const model = genAI.getGenerativeModel({ 
      model: 'gemini-1.5-flash',
      generationConfig: {
        temperature: 1.2,
        maxOutputTokens: 8192,
      }
    });
    
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const lyrics = response.text();
    
    console.log(`✅ Gemini 가사 생성 완료! (${lyrics.length}자)`);
    
    return lyrics;
    
  } catch (error) {
    console.error(`❌ Gemini 가사 생성 오류:`, error.message);
    throw error;
  }
}

module.exports = {
  generateLyricsWithGemini
};
