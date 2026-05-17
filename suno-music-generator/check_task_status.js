const axios = require('axios');

async function checkStatus() {
  const apiKey = process.env.SUNO_API_KEY;
  const taskId = 'c67c39adaf6aae2d17bd05fd7afcb884';
  
  console.log('🔍 TaskID 상태 확인:', taskId);
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
  
  // 여러 가능한 엔드포인트 시도
  const endpoints = [
    `/query/${taskId}`,
    `/task/${taskId}`,
    `/status/${taskId}`,
    `/${taskId}`
  ];
  
  const baseURL = 'https://api.sunoapi.org/api/v1';
  
  for (const endpoint of endpoints) {
    try {
      console.log(`시도: GET ${baseURL}${endpoint}`);
      const response = await axios.get(`${baseURL}${endpoint}`, {
        headers: {
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      console.log('✅ 성공!');
      console.log(JSON.stringify(response.data, null, 2));
      return;
    } catch (error) {
      console.log(`❌ 실패 (${error.response?.status})`);
    }
  }
  
  console.log('\n모든 엔드포인트 실패. POST 방식 시도...\n');
  
  // POST 방식 시도
  try {
    console.log(`시도: POST ${baseURL}/query`);
    const response = await axios.post(`${baseURL}/query`, {
      taskIds: [taskId]
    }, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ 성공!');
    console.log(JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log(`❌ 실패:`, error.message);
    if (error.response) {
      console.log('응답:', JSON.stringify(error.response.data, null, 2));
    }
  }
}

checkStatus().then(() => process.exit(0)).catch(err => {
  console.error(err);
  process.exit(1);
});
