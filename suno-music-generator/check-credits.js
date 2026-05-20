const axios = require('axios');

const API_KEY = 'c7306447f54798df57135499effe024f';
const BASE_URL = 'https://api.sunoapi.org/api/v1';

async function checkAccount() {
  console.log('💰 Suno API 계정 상태 확인\n');
  
  // 1. 크레딧 확인 시도
  try {
    const response = await axios.get(`${BASE_URL}/account/info`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    console.log('✅ 계정 정보:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ 계정 정보 조회 실패:', error.response?.status, error.response?.data || error.message);
  }
  
  console.log('\n');
  
  // 2. 다른 엔드포인트 시도
  try {
    const response = await axios.get(`${BASE_URL}/user/info`, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      },
      timeout: 10000
    });
    console.log('✅ 사용자 정보:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.log('❌ 사용자 정보 조회 실패:', error.response?.status, error.response?.data || error.message);
  }
  
  console.log('\n');
  
  // 3. 간단한 테스트 (instrumental 버전)
  console.log('🎵 Instrumental 테스트 (크레딧 적게 소모)...');
  try {
    const response = await axios.post(`${BASE_URL}/generate`, {
      model: 'V5',
      title: 'Test Instrumental',
      style: 'ambient, calm',
      prompt: 'calm instrumental music',
      customMode: true,
      instrumental: true,  // ✅ Instrumental 모드
      callBackUrl: 'https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/api/webhook/suno'
    }, {
      headers: {
        'Authorization': `Bearer ${API_KEY}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('✅ Instrumental 생성 성공:', response.data);
  } catch (error) {
    console.log('❌ Instrumental 생성 실패:', error.response?.status, error.response?.data || error.message);
  }
}

checkAccount();
