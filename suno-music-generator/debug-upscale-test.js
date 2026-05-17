const http = require('http');

const postData = JSON.stringify({
  imageUrl: 'https://cdn1.suno.ai/image_4c30c1dc-b88b-44fe-85cd-4ea16ba4be3a.jpeg',
  title: 'Debug Test',
  style: 'cozy-lofi',
  lyrics: 'Test lyrics'
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

console.log('🔍 디버그 테스트 시작...\n');

const req = http.request(options, (res) => {
  console.log(`상태 코드: ${res.statusCode}`);
  console.log(`헤더:`, res.headers);
  console.log('');
  
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    console.log('📝 원본 응답 데이터:');
    console.log(data);
    console.log('\n');
    
    try {
      const result = JSON.parse(data);
      console.log('📊 파싱된 JSON:');
      console.log(JSON.stringify(result, null, 2));
    } catch (error) {
      console.error('JSON 파싱 실패:', error.message);
    }
  });
});

req.on('error', (error) => {
  console.error('요청 실패:', error);
});

req.write(postData);
req.end();
