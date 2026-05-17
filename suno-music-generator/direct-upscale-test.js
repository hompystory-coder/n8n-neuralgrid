// 직접 업스케일 API 테스트
const http = require('http');

const postData = JSON.stringify({
  imageUrl: 'https://cdn1.suno.ai/image_4c30c1dc-b88b-44fe-85cd-4ea16ba4be3a.jpeg',
  title: 'Test Song - Direct API',
  style: 'cozy-lofi emotional',
  lyrics: 'Test lyrics for image upscaling functionality'
});

const options = {
  hostname: 'localhost',
  port: 5000,
  path: '/api/style/upscale-image',
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('🖼️ 이미지 업스케일 API 테스트 시작...\n');
console.log('📝 요청 데이터:', JSON.parse(postData), '\n');

const req = http.request(options, (res) => {
  console.log(`📡 서버 응답 상태: ${res.statusCode}\n`);
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const result = JSON.parse(data);
      console.log('✅ 업스케일 성공!\n');
      console.log('📊 결과:');
      console.log('  - YouTube 썸네일:', result.youtubeUrl);
      console.log('  - 앨범 커버:', result.albumUrl);
      console.log('\n🎯 테스트 완료!');
    } catch (error) {
      console.error('❌ 응답 파싱 실패:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('❌ 요청 실패:', error.message);
});

req.write(postData);
req.end();
