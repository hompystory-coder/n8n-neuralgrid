const taskMetadata = require('./server/temp/taskMetadata.json');

console.log('📊 생성된 곡 목록:\n');

const tasks = Object.entries(taskMetadata);
console.log(`총 ${tasks.length}개의 task\n`);

// 완료된 곡만 필터링
const completedSongs = tasks.filter(([id, data]) => data.status === 'completed');
console.log(`✅ 완료된 곡: ${completedSongs.length}개\n`);

if (completedSongs.length > 0) {
  console.log('곡 목록:');
  completedSongs.slice(0, 5).forEach(([id, data], index) => {
    console.log(`\n${index + 1}. ${data.title}`);
    console.log(`   Task ID: ${id}`);
    console.log(`   Style: ${data.style}`);
    console.log(`   Image: ${data.imageUrl ? '✅' : '❌'}`);
    console.log(`   Audio: ${data.audioUrl ? '✅' : '❌'}`);
  });
  
  if (completedSongs.length > 5) {
    console.log(`\n... 외 ${completedSongs.length - 5}개 곡`);
  }
}

console.log('\n🎯 테스트 준비 완료!');
console.log('웹에서 이미지를 클릭하여 업스케일을 테스트하세요.');
