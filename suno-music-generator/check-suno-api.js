// Suno API 상태 확인

const SUNO_API_KEY = process.env.SUNO_API_KEY || 'c7306447f59dd26e7c0f8fe03f4da18c';

async function checkSunoAPI() {
  console.log('🔍 Suno API 상태 확인\n');
  
  try {
    // 1. API 엔드포인트 확인
    console.log('📡 Suno API 엔드포인트: https://api.sunoapi.net');
    console.log('🔑 API Key:', SUNO_API_KEY.substring(0, 10) + '...\n');
    
    // 2. 간단한 생성 테스트
    console.log('🎵 테스트 음악 생성 요청...');
    const response = await fetch('https://api.sunoapi.net/generate/music', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': SUNO_API_KEY
      },
      body: JSON.stringify({
        model: 'V5',
        title: 'Test Song',
        style: 'pop',
        prompt: '[Verse]\nTest lyrics\n\n[Chorus]\nTest chorus',
        customMode: true,
        instrumental: false
      })
    });
    
    console.log('📊 응답 상태:', response.status, response.statusText);
    
    const data = await response.json();
    console.log('📄 응답 데이터:', JSON.stringify(data, null, 2).substring(0, 500));
    
    if (data.taskId) {
      console.log('\n✅ Suno API 정상 작동');
      console.log('🆔 Task ID:', data.taskId);
    } else if (data.errorCode) {
      console.log('\n❌ Suno API 에러:', data.errorCode, data.errorMessage);
    }
    
  } catch (error) {
    console.error('\n❌ 테스트 실패:', error.message);
  }
}

checkSunoAPI();
