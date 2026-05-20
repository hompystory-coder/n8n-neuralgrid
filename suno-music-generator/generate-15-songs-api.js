/**
 * API를 통해 15곡 생성 요청
 */

const axios = require('axios');

async function generate15Songs() {
  console.log('🎵 15곡 생성 요청 중...\n');
  
  try {
    const response = await axios.post(
      'https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/api/style/generate-simple',
      {
        style: 'cozy-lofi acoustic emotional dreamy',
        songCount: 15,
        language: 'English',
        vocalGender: 'neutral'
      },
      {
        timeout: 60000,
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );
    
    console.log('✅ 생성 요청 성공!');
    console.log('📦 응답:', JSON.stringify(response.data, null, 2));
    console.log('\n⏳ 예상 대기 시간: 약 30-45분');
    console.log('\n📝 생성 완료 후 다음 명령으로 분석:');
    console.log('   node analyze-songs.js');
    
  } catch (error) {
    console.error('❌ 생성 요청 실패:', error.message);
    if (error.response) {
      console.error('응답:', error.response.data);
    }
  }
}

generate15Songs();
