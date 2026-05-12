/**
 * 🧪 유튜브 메타데이터 생성기 테스트
 */

const youtubeMetadataGenerator = require('./server/services/youtubeMetadataGenerator');

// 테스트 데이터 (다양한 스타일)
const testSongs = [
  {
    title: '벚꽃의 향기',
    lyrics: '봄이 오면 벚꽃이 피어나고\n따뜻한 바람이 불어와\n일상의 소소한 행복을 느끼며',
    style: 'lo-fi hip hop, 85 BPM, chill mood',
    genre: 'lo-fi',
    mood: 'chill',
    bpm: 85
  },
  {
    title: '홈카페이 머문 곳',
    lyrics: '커피 한 잔의 여유\n집에서 즐기는 카페\n평온한 오후',
    style: 'lo-fi, cafe music, 80 BPM, relaxing',
    genre: 'lo-fi',
    mood: 'chill',
    bpm: 80
  },
  {
    title: '러닝의 향기',
    lyrics: '달리면서 느끼는 자유\n새벽 공기와 함께\n건강한 삶',
    style: 'upbeat pop, 120 BPM, energetic',
    genre: 'pop',
    mood: 'energetic',
    bpm: 120
  },
  {
    title: '등산이 머문 곳',
    lyrics: '산을 오르며\n자연과 하나 되는 순간\n힐링의 시간',
    style: 'folk, acoustic, 90 BPM, peaceful',
    genre: 'indie',
    mood: 'chill',
    bpm: 90
  },
  {
    title: 'AI 아트의 탄생',
    lyrics: '인공지능이 그리는 예술\n창의성의 새로운 시대\n미래를 향한 발걸음',
    style: 'electronic, ambient, 100 BPM, futuristic',
    genre: 'electronic',
    mood: 'dreamy',
    bpm: 100
  }
];

async function runTests() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🧪 유튜브 메타데이터 생성기 테스트');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const results = [];

  // 1️⃣ 각 곡별 메타데이터 생성
  console.log('📝 1단계: 개별 메타데이터 생성\n');
  
  for (const song of testSongs) {
    console.log(`\n🎵 곡: "${song.title}"`);
    console.log(`   스타일: ${song.style}`);
    
    try {
      const metadata = await youtubeMetadataGenerator.generate(song);
      
      console.log(`✅ 생성 성공!`);
      console.log(`   제목: ${metadata.title}`);
      console.log(`   태그 개수: ${metadata.tags.length}`);
      console.log(`   태그: ${metadata.tags.slice(0, 5).join(', ')}...`);
      console.log(`   템플릿: ${metadata.metadata.templateIndex + 1}번`);
      console.log(`   설명 스타일: ${metadata.metadata.descriptionStyle}`);
      
      results.push({
        success: true,
        originalTitle: song.title,
        youtubeTitle: metadata.title,
        tagsCount: metadata.tags.length,
        templateIndex: metadata.metadata.templateIndex
      });
      
    } catch (error) {
      console.error(`❌ 실패:`, error.message);
      results.push({
        success: false,
        originalTitle: song.title,
        error: error.message
      });
    }
  }

  // 2️⃣ 중복 검사
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🔍 2단계: 중복 검사\n');

  const youtubeTitles = results.map(r => r.youtubeTitle);
  const uniqueTitles = new Set(youtubeTitles);
  
  console.log(`총 생성된 제목: ${youtubeTitles.length}개`);
  console.log(`고유한 제목: ${uniqueTitles.size}개`);
  console.log(`중복: ${youtubeTitles.length - uniqueTitles.size}개`);
  console.log(`고유율: ${(uniqueTitles.size / youtubeTitles.length * 100).toFixed(2)}%`);

  // 3️⃣ "Playlist" 접두사 검사
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ 3단계: "Playlist" 접두사 검사\n');

  const allStartWithPlaylist = youtubeTitles.every(title => 
    title && title.startsWith('Playlist')
  );
  
  if (allStartWithPlaylist) {
    console.log('✅ 모든 제목이 "Playlist"로 시작합니다!');
  } else {
    console.log('❌ 일부 제목이 "Playlist"로 시작하지 않습니다!');
    youtubeTitles.forEach((title, idx) => {
      if (!title.startsWith('Playlist')) {
        console.log(`   ❌ [${idx + 1}] ${title}`);
      }
    });
  }

  // 4️⃣ 태그 분석
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🏷️ 4단계: 태그 분석\n');

  const allTags = new Set();
  results.forEach(r => {
    if (r.success) {
      console.log(`${r.originalTitle}: ${r.tagsCount}개 태그`);
    }
  });

  // 5️⃣ 템플릿 다양성 검사
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('🎨 5단계: 템플릿 다양성 검사\n');

  const templateUsage = {};
  results.forEach(r => {
    if (r.success) {
      templateUsage[r.templateIndex] = (templateUsage[r.templateIndex] || 0) + 1;
    }
  });

  console.log('템플릿 사용 분포:');
  Object.entries(templateUsage)
    .sort((a, b) => parseInt(a[0]) - parseInt(b[0]))
    .forEach(([idx, count]) => {
      console.log(`   템플릿 ${parseInt(idx) + 1}: ${count}회 사용`);
    });

  // 6️⃣ 최종 결과 샘플
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('📋 6단계: 생성된 제목 샘플\n');

  results.slice(0, 5).forEach((r, idx) => {
    if (r.success) {
      console.log(`${idx + 1}. ${r.youtubeTitle}`);
    }
  });

  // 최종 요약
  console.log('\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✨ 테스트 완료 요약');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const successCount = results.filter(r => r.success).length;
  
  console.log(`✅ 성공: ${successCount}/${results.length}곡`);
  console.log(`🔄 고유율: ${(uniqueTitles.size / youtubeTitles.length * 100).toFixed(2)}%`);
  console.log(`📝 "Playlist" 접두사: ${allStartWithPlaylist ? '✅ 통과' : '❌ 실패'}`);
  console.log(`🎨 템플릿 다양성: ${Object.keys(templateUsage).length}가지 사용`);

  if (successCount === results.length && allStartWithPlaylist && uniqueTitles.size === youtubeTitles.length) {
    console.log('\n🎉 모든 테스트 통과!');
  } else {
    console.log('\n⚠️ 일부 테스트 실패');
  }
}

// 테스트 실행
runTests().catch(error => {
  console.error('❌ 테스트 실행 실패:', error);
  process.exit(1);
});
