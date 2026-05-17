const axios = require('axios');

const API_KEY = 'c7306447f54798df57135499effe024f';
const BASE_URL = 'https://api.sunoapi.org/api/v1';
const TASK_ID = '878e84c1b45b6eab97bd2c89f8b61da6';

async function checkStatus() {
  try {
    const response = await axios.get(`${BASE_URL}/generate/record-info?taskId=${TASK_ID}`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('📊 Suno API 직접 상태 확인:\n');
    console.log(JSON.stringify(response.data, null, 2));
    
  } catch (error) {
    console.error('❌ 에러:', error.response?.status, error.response?.data || error.message);
  }
}

checkStatus();
