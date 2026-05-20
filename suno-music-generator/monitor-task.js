const axios = require('axios');

const SUNO_API_KEY = 'ed2ac381296182c4891cfec2d22138a5';
const API_BASE_URL = 'https://api.sunoapi.org/api/v1';

const taskId = process.argv[2] || '6fb317e15047f43e2f6e18b211ab0a35';

async function checkStatus() {
  try {
    const response = await axios.get(
      `${API_BASE_URL}/generate/record-info?taskId=${taskId}`,
      {
        headers: {
          'Authorization': `Bearer ${SUNO_API_KEY}`
        }
      }
    );
    
    return response.data;
  } catch (error) {
    console.error('Error:', error.response?.data || error.message);
    return null;
  }
}

async function monitor() {
  console.log(`\n🔍 Monitoring Task: ${taskId}\n`);
  
  let attempts = 0;
  const maxAttempts = 20;
  
  while (attempts < maxAttempts) {
    const result = await checkStatus();
    
    if (result && result.data) {
      const status = result.data.status;
      const time = new Date().toLocaleTimeString();
      
      console.log(`[${time}] Attempt ${attempts + 1}/${maxAttempts} - Status: ${status}`);
      
      if (status === 'SUCCESS') {
        console.log('\n🎉 SUCCESS! Generated music:\n');
        console.log(JSON.stringify(result.data.response, null, 2));
        
        if (result.data.response && result.data.response.sunoData) {
          console.log('\n🎵 Generated Songs:');
          result.data.response.sunoData.forEach((song, index) => {
            console.log(`\n  Song ${index + 1}:`);
            console.log(`  - Title: ${song.title}`);
            console.log(`  - ID: ${song.id}`);
            console.log(`  - Audio: ${song.audio_url}`);
            console.log(`  - Video: ${song.video_url}`);
            console.log(`  - Duration: ${song.duration}s`);
            console.log(`  - Style: ${song.tags || 'N/A'}`);
          });
        }
        break;
      } else if (status === 'FAILED' || status === 'GENERATE_AUDIO_FAILED') {
        console.log('\n❌ FAILED:');
        console.log('Error Code:', result.data.errorCode);
        console.log('Error Message:', result.data.errorMessage);
        break;
      }
    }
    
    attempts++;
    
    if (attempts < maxAttempts) {
      await new Promise(resolve => setTimeout(resolve, 10000)); // 10초 대기
    }
  }
  
  if (attempts >= maxAttempts) {
    console.log('\n⏱️ Timeout: Monitoring stopped after', maxAttempts * 10, 'seconds');
  }
}

monitor();
