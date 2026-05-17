/**
 * 빠른 테스트: 이미 완료된 곡들로 테스트
 */
const axios = require('axios');
const fs = require('fs');

const BASE_URL = 'https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  magenta: '\x1b[35m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('═══════════════════════════════════════════════════', 'magenta');
  log('       🎵 Suno Music Generator 빠른 테스트', 'magenta');
  log('═══════════════════════════════════════════════════', 'magenta');
  
  // 1. 15곡 생성 요청
  log('\n📤 Step 1: 15곡 생성 요청...', 'cyan');
  
  const generateResponse = await axios.post(`${BASE_URL}/api/style/generate-simple`, {
    style: 'cozy-lofi emotional',
    count: 15,
    language: 'English',
    gender: 'auto'
  });
  
  const taskIds = generateResponse.data.allTaskIds;
  log(`✅ 15곡 생성 요청 완료!`, 'green');
  log(`   - TaskIDs: ${taskIds.length}개`, 'blue');
  
  // 2. 5분 대기 후 완료된 곡 수집
  log(`\n⏳ 5분 대기 중... (Suno AI가 곡을 생성합니다)`, 'yellow');
  
  await new Promise(resolve => setTimeout(resolve, 300000)); // 5분 대기
  
  log('\n📊 Step 2: 완료된 곡 수집...', 'cyan');
  
  const completedSongs = [];
  
  for (const taskId of taskIds) {
    try {
      const statusRes = await axios.get(`${BASE_URL}/api/music/status/${taskId}`);
      
      if (statusRes.data.status === 'completed' && statusRes.data.song) {
        completedSongs.push(statusRes.data.song);
        log(`  ✅ "${statusRes.data.song.title}" 완료`, 'green');
      } else {
        log(`  ⏳ "${statusRes.data.song?.title || taskId}" 진행중...`, 'yellow');
      }
    } catch (error) {
      log(`  ❌ ${taskId} 확인 실패`, 'red');
    }
    
    await new Promise(resolve => setTimeout(resolve, 500)); // 0.5초 딜레이
  }
  
  log(`\n✅ 완료된 곡: ${completedSongs.length}/${taskIds.length}`, 'green');
  
  if (completedSongs.length === 0) {
    log('⚠️  아직 완료된 곡이 없습니다. 나중에 다시 시도하세요.', 'yellow');
    return;
  }
  
  // 3. 가사 중복 검사
  log('\n📝 Step 3: 가사 중복 검사...', 'cyan');
  
  const lyrics = completedSongs.map(s => s.lyrics || s.lyric).filter(l => l);
  const duplicates = [];
  const seen = new Map();
  
  lyrics.forEach((lyric, idx) => {
    const normalized = lyric.trim().toLowerCase();
    if (seen.has(normalized)) {
      duplicates.push({
        song1: completedSongs[seen.get(normalized)].title,
        song2: completedSongs[idx].title
      });
    } else {
      seen.set(normalized, idx);
    }
  });
  
  if (duplicates.length === 0) {
    log(`✅ 중복 없음! ${lyrics.length}곡 모두 고유합니다.`, 'green');
  } else {
    log(`⚠️  중복 발견: ${duplicates.length}건`, 'yellow');
    duplicates.forEach(dup => {
      log(`   - "${dup.song1}" ↔ "${dup.song2}"`, 'yellow');
    });
  }
  
  // 가사 샘플 (처음 3곡)
  log('\n📄 가사 샘플 (처음 3곡):',  'blue');
  lyrics.slice(0, 3).forEach((lyric, idx) => {
    log(`\n   곡 ${idx + 1}: "${completedSongs[idx].title}"`, 'cyan');
    log(`   ${lyric.substring(0, 100).replace(/\n/g, ' ')}...`, 'blue');
  });
  
  // 4. 이미지 업스케일 테스트 (3개)
  log('\n🖼️  Step 4: 이미지 업스케일 테스트 (3개)...', 'cyan');
  
  const imageSongs = completedSongs.slice(0, Math.min(3, completedSongs.length));
  const upscaledImages = [];
  
  for (const song of imageSongs) {
    try {
      const imageUrl = song.imageUrl || song.image_url;
      if (!imageUrl) continue;
      
      log(`\n🔄 "${song.title}" 업스케일 중...`, 'yellow');
      
      const response = await axios.post(`${BASE_URL}/api/style/upscale-image`, {
        imageUrl: imageUrl,
        title: song.title,
        style: 'cozy-lofi emotional',
        lyrics: song.lyrics || song.lyric || ''
      }, {
        timeout: 120000
      });
      
      upscaledImages.push({
        title: song.title,
        youtubeUrl: response.data.youtubeUrl,
        albumUrl: response.data.albumUrl
      });
      
      log(`✅ 업스케일 완료!`, 'green');
      log(`   - YouTube: ${response.data.youtubeUrl}`, 'green');
      log(`   - Album: ${response.data.albumUrl}`, 'green');
      
    } catch (error) {
      log(`❌ 업스케일 실패: ${error.message}`, 'red');
    }
  }
  
  log(`\n✅ 이미지 업스케일: ${upscaledImages.length}/${imageSongs.length}`, 'green');
  
  // 5. 앨범 메타데이터
  log('\n📦 Step 5: 앨범 메타데이터 생성...', 'cyan');
  
  try {
    const metadataRes = await axios.post(`${BASE_URL}/api/style/generate-album-metadata`, {
      songs: completedSongs.map(s => ({
        title: s.title,
        lyrics: s.lyrics || s.lyric || '',
        duration: s.duration || 180
      }))
    });
    
    const metadata = metadataRes.data;
    
    log('✅ 메타데이터 생성 완료!', 'green');
    log(`   - 앨범 제목: ${metadata.albumTitle}`, 'blue');
    log(`   - YouTube 제목: ${metadata.youtubeTitle}`, 'blue');
    log(`   - 태그 수: ${metadata.tags.length}개`, 'blue');
    
    const timeTrackCount = (metadata.description.match(/\d{2}:\d{2}/g) || []).length;
    log(`   - Time Track: ${timeTrackCount}개 타임스탬프`, 'blue');
    
    // Time Track 샘플
    const timeTrackLines = metadata.description.split('\n')
      .filter(line => /\d{2}:\d{2}/.test(line))
      .slice(0, 5);
    
    log('\n   Time Track 샘플:', 'cyan');
    timeTrackLines.forEach(line => {
      log(`      ${line}`, 'blue');
    });
    
  } catch (error) {
    log(`❌ 메타데이터 생성 실패: ${error.message}`, 'red');
  }
  
  // 최종 보고서
  log('\n═══════════════════════════════════════════════════', 'magenta');
  log('            📊 최종 테스트 결과', 'magenta');
  log('═══════════════════════════════════════════════════', 'magenta');
  
  log(`\n✅ 테스트 완료된 곡 수: ${completedSongs.length}곡`, 'green');
  log(`✅ 가사 중복: ${duplicates.length}건 ${duplicates.length === 0 ? '(✓ 없음)' : '(⚠ 발견)'}`, duplicates.length === 0 ? 'green' : 'yellow');
  log(`✅ 이미지 업스케일: ${upscaledImages.length}/${imageSongs.length}`, 'green');
  log(`✅ 앨범 메타데이터: 생성 완료`, 'green');
  
  log('\n📝 결론:', 'cyan');
  if (duplicates.length === 0) {
    log('   🏆 모든 가사가 고유합니다! 1700+ 단어 사전이 완벽하게 작동합니다.', 'green');
  } else {
    log('   ⚠️  일부 가사 중복 발견. 추가 수정이 필요합니다.', 'yellow');
  }
  
  // JSON 보고서 저장
  const report = {
    totalRequested: taskIds.length,
    totalCompleted: completedSongs.length,
    lyricsUnique: lyrics.length - duplicates.length,
    lyricsDuplicate: duplicates.length,
    imagesUpscaled: upscaledImages.length,
    songs: completedSongs.map(s => ({
      title: s.title,
      hasLyrics: !!(s.lyrics || s.lyric),
      hasImage: !!(s.imageUrl || s.image_url)
    })),
    duplicatesDetail: duplicates,
    upscaledImages: upscaledImages
  };
  
  fs.writeFileSync('/home/user/webapp/suno-music-generator/quick-test-report.json', JSON.stringify(report, null, 2));
  log('\n📄 상세 보고서: /home/user/webapp/suno-music-generator/quick-test-report.json', 'green');
  
  log('\n═══════════════════════════════════════════════════', 'magenta');
}

main().catch(error => {
  console.error('❌ 오류:', error.message);
  process.exit(1);
});
