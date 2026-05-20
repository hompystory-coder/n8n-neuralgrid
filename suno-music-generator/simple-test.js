// 1. Gemini로 테스트
const { GoogleGenerativeAI } = require('@google/generative-ai');

const GEMINI_KEY = 'AIzaSyCS3nl6jkeSaWFKByCbCUJZSOjSXVQOnp4';
const genAI = new GoogleGenerativeAI(GEMINI_KEY);

async function testGemini() {
  console.log('🧪 Gemini 단순 테스트...\n');
  
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    const prompt = '다음 JSON만 출력: {"score": 85, "reason": "좋은 음악"}';
    
    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    console.log('✅ 성공!');
    console.log('📏 길이:', text.length);
    console.log('📄 응답:', text);
    
    return text;
    
  } catch (error) {
    console.error('❌ 실패:', error.message);
  }
}

testGemini();
