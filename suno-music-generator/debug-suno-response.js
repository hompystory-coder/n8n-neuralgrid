// Suno API 응답 구조 확인용 스크립트

const sunoClient = require('./server/services/sunoClient');

async function debugSunoResponse() {
  try {
    // 최근 완료된 task ID가 있다면 상태 확인
    const taskId = process.argv[2];
    
    if (!taskId) {
      console.log('Usage: node debug-suno-response.js <taskId>');
      console.log('Example: node debug-suno-response.js fc3e982c-9f64-4751-862e-b64df2da21a3');
      return;
    }
    
    console.log('🔍 Suno API 응답 구조 분석 시작...');
    console.log(`Task ID: ${taskId}\n`);
    
    const result = await sunoClient.getTaskStatus(taskId);
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📦 전체 응답 구조:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(JSON.stringify(result, null, 2));
    
    if (result.data?.response?.sunoData) {
      const sunoData = result.data.response.sunoData;
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('🎵 sunoData 배열 구조:');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`곡 수: ${sunoData.length}`);
      
      if (sunoData[0]) {
        console.log('\n첫 번째 곡의 모든 필드:');
        console.log(JSON.stringify(sunoData[0], null, 2));
        
        console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('📋 필드명 분석:');
        console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
        console.log('Available fields:', Object.keys(sunoData[0]).join(', '));
        
        // 제목 관련 필드 찾기
        console.log('\n🎵 제목 관련 필드:');
        Object.keys(sunoData[0]).forEach(key => {
          if (key.toLowerCase().includes('title') || key.toLowerCase().includes('name')) {
            console.log(`  ${key}: "${sunoData[0][key]}"`);
          }
        });
        
        // Duration 관련 필드 찾기
        console.log('\n⏱️ Duration 관련 필드:');
        Object.keys(sunoData[0]).forEach(key => {
          if (key.toLowerCase().includes('duration') || key.toLowerCase().includes('length') || key.toLowerCase().includes('time')) {
            console.log(`  ${key}: ${sunoData[0][key]}`);
          }
        });
        
        // Audio URL 관련 필드 찾기
        console.log('\n🔊 Audio URL 관련 필드:');
        Object.keys(sunoData[0]).forEach(key => {
          if (key.toLowerCase().includes('audio') || key.toLowerCase().includes('url') || key.toLowerCase().includes('source')) {
            const value = sunoData[0][key];
            if (typeof value === 'string' && value.length > 50) {
              console.log(`  ${key}: ${value.substring(0, 50)}...`);
            } else {
              console.log(`  ${key}: ${value}`);
            }
          }
        });
      }
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
    console.error(error.stack);
  }
}

debugSunoResponse();
