// 테스트용 곡 데이터 생성

const fs = require('fs');
const path = require('path');

const testSongs = [
  {
    taskId: 'test-song-1',
    title: 'Cozy Morning Vibes',
    imageUrl: 'https://cdn1.suno.ai/image_4c30c1dc-b88b-44fe-85cd-4ea16ba4be3a.jpeg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    style: 'cozy-lofi emotional',
    lyrics: '[Verse 1]\nMorning light through my window\nCoffee brewing nice and slow\n\n[Chorus]\nCozy vibes all around\nPeaceful moments to be found',
    duration: 180,
    status: 'completed',
    model: 'V5',
    createdAt: new Date().toISOString()
  },
  {
    taskId: 'test-song-2',
    title: 'Sunset Dreams',
    imageUrl: 'https://cdn1.suno.ai/image_large_4c30c1dc-b88b-44fe-85cd-4ea16ba4be3a.jpeg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    style: 'ambient emotional',
    lyrics: '[Verse 1]\nGolden hour fading away\nColors painting the sky\n\n[Chorus]\nSunset dreams come alive\nIn this moment we thrive',
    duration: 195,
    status: 'completed',
    model: 'V5',
    createdAt: new Date().toISOString()
  },
  {
    taskId: 'test-song-3',
    title: 'Urban Nights',
    imageUrl: 'https://cdn1.suno.ai/image_4c30c1dc-b88b-44fe-85cd-4ea16ba4be3a.jpeg',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    style: 'urban rnb smooth',
    lyrics: '[Verse 1]\nCity lights shining bright\nNeon signs in the night\n\n[Chorus]\nUrban rhythm in my soul\nThis city makes me whole',
    duration: 200,
    status: 'completed',
    model: 'V5',
    createdAt: new Date().toISOString()
  }
];

// titles.db.json 생성
const dbPath = path.join(__dirname, 'server', 'data', 'titles.db.json');

// 기존 데이터 읽기 (있다면)
let existingData = { songs: [] };
try {
  if (fs.existsSync(dbPath)) {
    existingData = JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  }
} catch (error) {
  console.log('⚠️  기존 데이터 없음, 새로 생성합니다.');
}

// 테스트 곡 추가
const updatedData = {
  songs: [...testSongs, ...existingData.songs]
};

fs.writeFileSync(dbPath, JSON.stringify(updatedData, null, 2));

console.log('✅ 테스트 곡 데이터 생성 완료!');
console.log(`📊 총 ${updatedData.songs.length}개 곡`);
console.log('\n🎵 테스트 곡 목록:');
testSongs.forEach((song, i) => {
  console.log(`  ${i+1}. ${song.title}`);
  console.log(`     이미지: ${song.imageUrl.substring(0, 50)}...`);
});

console.log('\n✨ 이제 workflow 페이지에서 이미지를 클릭하여 업스케일을 테스트하세요!');
console.log('🌐 URL: https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow');
