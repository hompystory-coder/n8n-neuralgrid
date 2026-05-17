/**
 * 🎵 Suno Music Generator 종합 테스트
 * 
 * 실제 웹브라우저처럼 동작:
 * 1. 15곡 생성 요청
 * 2. 완료될 때까지 대기 (폴링)
 * 3. 가사 중복 검사
 * 4. 이미지 업스케일
 * 5. 앨범 메타데이터
 * 6. 최종 보고서
 */

const axios = require('axios');
const fs = require('fs');
const path = require('path');

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
  const timestamp = new Date().toLocaleTimeString('ko-KR');
  console.log(`${colors[color]}[${timestamp}] ${message}${colors.reset}`);
}

// 테스트 결과 저장
const testResults = {
  songGeneration: { status: 'pending', songs: [], startTime: null, endTime: null },
  lyricsAnalysis: { duplicates: [], similarPairs: [], uniqueCount: 0, totalCount: 0 },
  imageUpscale: { images: [], errors: [] },
  albumMetadata: { data: null, error: null },
  summary: { totalTime: 0, issues: [] }
};

// 1. 15곡 생성 요청 및 완료 대기
async function generateAndWaitSongs() {
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📤 Step 1: 15곡 생성 시작...', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  testResults.songGeneration.startTime = Date.now();
  
  try {
    // 곡 생성 요청
    const response = await axios.post(`${BASE_URL}/api/style/generate-simple`, {
      style: 'cozy-lofi acoustic emotional',
      songCount: 15,
      language: 'English',
      vocalGender: 'neutral'
    });
    
    log(`✅ 생성 요청 성공! TaskID: ${response.data.taskId}`, 'green');
    log(`   - 생성 요청: 15곡`, 'blue');
    log(`   - 예상 시간: 약 30-45분`, 'blue');
    
    // 완료될 때까지 대기 (폴링)
    const taskId = response.data.taskId;
    const allTaskIds = response.data.allTaskIds || [taskId];
    
    log('\n⏳ 곡 생성 중... (30초마다 확인)', 'yellow');
    
    let completedSongs = [];
    let attempts = 0;
    const maxAttempts = 120; // 60분 대기 (30초 × 120 = 1시간)
    
    while (attempts < maxAttempts) {
      attempts++;
      await sleep(30000); // 30초 대기
      
      try {
        // 모든 태스크 상태 확인
        const statusChecks = await Promise.all(
          allTaskIds.map(id => 
            axios.get(`${BASE_URL}/api/music/status/${id}`, { timeout: 10000 })
              .catch(err => ({ data: { status: 'error', error: err.message } }))
          )
        );
        
        const completed = statusChecks.filter(r => 
          r.data.status === 'completed' && r.data.song
        );
        
        const pending = statusChecks.filter(r => 
          r.data.status === 'pending' || r.data.status === 'processing'
        );
        
        const failed = statusChecks.filter(r => 
          r.data.status === 'failed' || r.data.status === 'error'
        );
        
        log(`📊 진행상황 (${attempts}/${maxAttempts}): 완료 ${completed.length}, 진행중 ${pending.length}, 실패 ${failed.length}`, 'blue');
        
        // 완료된 곡 수집
        completed.forEach(result => {
          if (result.data.song && !completedSongs.find(s => s.id === result.data.song.id)) {
            completedSongs.push(result.data.song);
            log(`  ✅ "${result.data.song.title}" 완료!`, 'green');
          }
        });
        
        // 모두 완료 또는 실패 확인
        if (completed.length + failed.length >= allTaskIds.length) {
          if (failed.length > 0) {
            log(`⚠️  ${failed.length}곡 생성 실패`, 'yellow');
          }
          break;
        }
        
      } catch (error) {
        log(`❌ 상태 확인 오류: ${error.message}`, 'red');
      }
    }
    
    testResults.songGeneration.endTime = Date.now();
    testResults.songGeneration.songs = completedSongs;
    testResults.songGeneration.status = 'completed';
    
    const elapsedMinutes = ((testResults.songGeneration.endTime - testResults.songGeneration.startTime) / 60000).toFixed(1);
    log(`\n✅ 곡 생성 완료! ${completedSongs.length}곡 (${elapsedMinutes}분 소요)`, 'green');
    
    completedSongs.forEach((song, idx) => {
      log(`   ${idx + 1}. "${song.title}"`, 'blue');
    });
    
    return completedSongs;
    
  } catch (error) {
    testResults.songGeneration.status = 'failed';
    testResults.songGeneration.error = error.message;
    log(`❌ 곡 생성 실패: ${error.message}`, 'red');
    throw error;
  }
}

// 2. 가사 중복 분석
function analyzeLyrics(songs) {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📝 Step 2: 가사 중복 분석...', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  const lyrics = songs.map(s => s.lyrics || s.lyric).filter(l => l);
  const totalCount = lyrics.length;
  
  log(`📊 분석 대상: ${totalCount}곡의 가사`, 'blue');
  
  // 1) 정확한 일치 검사
  const duplicates = [];
  const seen = new Map();
  
  lyrics.forEach((lyric, idx) => {
    const normalized = lyric.trim().toLowerCase();
    if (seen.has(normalized)) {
      duplicates.push({
        song1: songs[seen.get(normalized)].title,
        song2: songs[idx].title,
        index1: seen.get(normalized),
        index2: idx
      });
    } else {
      seen.set(normalized, idx);
    }
  });
  
  // 2) 유사도 검사 (첫 200자)
  const similarPairs = [];
  for (let i = 0; i < lyrics.length; i++) {
    for (let j = i + 1; j < lyrics.length; j++) {
      const prefix1 = lyrics[i].substring(0, 200).trim();
      const prefix2 = lyrics[j].substring(0, 200).trim();
      
      if (prefix1 === prefix2 && prefix1.length > 50) {
        similarPairs.push({
          song1: songs[i].title,
          song2: songs[j].title,
          index1: i,
          index2: j,
          commonPrefix: prefix1.substring(0, 100) + '...'
        });
      }
    }
  }
  
  // 3) 단어 빈도 분석 (상위 10개 단어)
  const wordCounts = {};
  lyrics.forEach(lyric => {
    const words = lyric.toLowerCase().match(/\b[a-z가-힣]+\b/g) || [];
    words.forEach(word => {
      if (word.length > 3) {
        wordCounts[word] = (wordCounts[word] || 0) + 1;
      }
    });
  });
  
  const topWords = Object.entries(wordCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);
  
  testResults.lyricsAnalysis = {
    duplicates,
    similarPairs,
    uniqueCount: totalCount - duplicates.length,
    totalCount,
    topWords
  };
  
  // 결과 출력
  if (duplicates.length === 0 && similarPairs.length === 0) {
    log('✅ 중복 가사 없음! 모든 가사가 고유합니다.', 'green');
    log(`   - 총 ${totalCount}곡 모두 고유한 가사`, 'green');
  } else {
    if (duplicates.length > 0) {
      log(`⚠️  정확히 일치하는 중복: ${duplicates.length}건`, 'red');
      duplicates.forEach(dup => {
        log(`   - "${dup.song1}" ↔ "${dup.song2}"`, 'red');
      });
      testResults.summary.issues.push(`중복 가사 ${duplicates.length}건 발견`);
    }
    
    if (similarPairs.length > 0) {
      log(`⚠️  유사한 가사 (첫 200자): ${similarPairs.length}건`, 'yellow');
      similarPairs.forEach(pair => {
        log(`   - "${pair.song1}" ↔ "${pair.song2}"`, 'yellow');
      });
      testResults.summary.issues.push(`유사 가사 ${similarPairs.length}건 발견`);
    }
  }
  
  log('\n📊 가장 많이 사용된 단어 TOP 10:', 'blue');
  topWords.forEach(([word, count]) => {
    log(`   - "${word}": ${count}회`, 'blue');
  });
  
  // 가사 샘플 출력 (처음 3곡)
  log('\n📄 가사 샘플 (처음 3곡, 각 150자):', 'blue');
  lyrics.slice(0, 3).forEach((lyric, idx) => {
    log(`\n   📝 곡 ${idx + 1}: "${songs[idx].title}"`, 'cyan');
    const sample = lyric.substring(0, 150).replace(/\n/g, ' ').trim();
    log(`      ${sample}...`, 'blue');
  });
}

// 3. 이미지 업스케일 테스트
async function testImageUpscale(songs) {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🖼️  Step 3: 이미지 업스케일 테스트...', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  // 랜덤으로 3개 선택 (처음, 중간, 끝)
  const selectedIndices = [
    0,
    Math.floor(songs.length / 2),
    songs.length - 1
  ];
  
  const selectedSongs = selectedIndices
    .map(i => songs[i])
    .filter(s => s && (s.imageUrl || s.image_url));
  
  log(`📌 선택된 곡: ${selectedSongs.map(s => s.title).join(', ')}`, 'blue');
  
  for (const song of selectedSongs) {
    try {
      const imageUrl = song.imageUrl || song.image_url;
      log(`\n🔄 "${song.title}" 업스케일 중...`, 'yellow');
      log(`   원본 이미지: ${imageUrl}`, 'blue');
      
      const response = await axios.post(`${BASE_URL}/api/style/upscale-image`, {
        imageUrl: imageUrl,
        title: song.title,
        style: 'cozy-lofi emotional',
        lyrics: song.lyrics || song.lyric || ''
      }, {
        timeout: 120000
      });
      
      testResults.imageUpscale.images.push({
        title: song.title,
        originalUrl: imageUrl,
        youtubeUrl: response.data.youtubeUrl,
        albumUrl: response.data.albumUrl
      });
      
      log(`✅ 업스케일 완료!`, 'green');
      log(`   - YouTube 썸네일 (1280×720): ${response.data.youtubeUrl}`, 'green');
      log(`   - 앨범 커버 (3000×3000): ${response.data.albumUrl}`, 'green');
      
    } catch (error) {
      log(`❌ 업스케일 실패: ${error.message}`, 'red');
      testResults.imageUpscale.errors.push({
        title: song.title,
        error: error.message
      });
      testResults.summary.issues.push(`이미지 업스케일 실패: ${song.title}`);
    }
  }
  
  const successCount = testResults.imageUpscale.images.length;
  const totalCount = selectedSongs.length;
  
  if (successCount === totalCount) {
    log(`\n✅ 모든 이미지 업스케일 성공! (${successCount}/${totalCount})`, 'green');
  } else {
    log(`\n⚠️  일부 이미지 업스케일 실패 (${successCount}/${totalCount})`, 'yellow');
  }
}

// 4. 앨범 메타데이터 생성
async function generateAlbumMetadata(songs) {
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📦 Step 4: 앨범 메타데이터 생성 (최종정리)...', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/style/generate-album-metadata`, {
      songs: songs.map((s, idx) => ({
        title: s.title,
        lyrics: s.lyrics || s.lyric || '',
        duration: s.duration || 180
      }))
    }, {
      timeout: 60000
    });
    
    const metadata = response.data;
    testResults.albumMetadata.data = metadata;
    
    log('✅ 앨범 메타데이터 생성 완료!', 'green');
    log(`\n📌 앨범 정보:`, 'blue');
    log(`   제목: ${metadata.albumTitle}`, 'blue');
    log(`   YouTube 제목: ${metadata.youtubeTitle}`, 'blue');
    
    log(`\n📝 설명 (처음 300자):`, 'blue');
    const descPreview = metadata.description.substring(0, 300).replace(/\n/g, ' ');
    log(`   ${descPreview}...`, 'blue');
    
    log(`\n🏷️  태그 (처음 15개):`, 'blue');
    log(`   ${metadata.tags.slice(0, 15).join(', ')}`, 'blue');
    
    // Time Track 검증
    const timeTrackMatches = metadata.description.match(/\d{2}:\d{2}/g) || [];
    log(`\n⏱️  Time Track:`, 'blue');
    log(`   - 타임스탬프 개수: ${timeTrackMatches.length}개`, 'blue');
    log(`   - 곡 수: ${songs.length}개`, 'blue');
    
    if (timeTrackMatches.length === songs.length) {
      log(`   ✅ Time Track 정확함 (${timeTrackMatches.length}/${songs.length})`, 'green');
    } else {
      log(`   ⚠️  Time Track 불일치 (${timeTrackMatches.length}/${songs.length})`, 'yellow');
      testResults.summary.issues.push(`Time Track 불일치: ${timeTrackMatches.length}/${songs.length}`);
    }
    
    // 실제 Time Track 출력 (처음 5개)
    const timeTrackLines = metadata.description.split('\n')
      .filter(line => /\d{2}:\d{2}/.test(line))
      .slice(0, 5);
    
    log('\n   Time Track 샘플 (처음 5곡):', 'cyan');
    timeTrackLines.forEach(line => {
      log(`      ${line}`, 'blue');
    });
    
  } catch (error) {
    testResults.albumMetadata.error = error.message;
    log(`❌ 메타데이터 생성 실패: ${error.message}`, 'red');
    testResults.summary.issues.push(`메타데이터 생성 실패: ${error.message}`);
  }
}

// 최종 보고서 생성
function generateFinalReport(songs) {
  const totalTime = Date.now() - testResults.songGeneration.startTime;
  testResults.summary.totalTime = totalTime;
  
  log('\n', 'reset');
  log('═══════════════════════════════════════════════════', 'magenta');
  log('         🎉 최종 테스트 보고서', 'magenta');
  log('═══════════════════════════════════════════════════', 'magenta');
  
  // 기본 정보
  log('\n📊 테스트 개요:', 'cyan');
  log(`   - 총 소요 시간: ${(totalTime / 60000).toFixed(1)}분`, 'blue');
  log(`   - 생성된 곡 수: ${songs.length}곡 / 요청 15곡`, 'blue');
  log(`   - 테스트 일시: ${new Date().toLocaleString('ko-KR')}`, 'blue');
  
  // 1. 곡 생성
  log('\n1️⃣  곡 생성 결과:', 'cyan');
  if (testResults.songGeneration.status === 'completed') {
    const genTime = ((testResults.songGeneration.endTime - testResults.songGeneration.startTime) / 60000).toFixed(1);
    log(`   ✅ 성공 - ${songs.length}곡 생성 (${genTime}분)`, 'green');
    log(`   - 평균 생성 시간: ${(genTime / songs.length).toFixed(1)}분/곡`, 'blue');
  } else {
    log(`   ❌ 실패`, 'red');
  }
  
  // 2. 가사 중복
  log('\n2️⃣  가사 중복 분석:', 'cyan');
  const { duplicates, similarPairs, uniqueCount, totalCount } = testResults.lyricsAnalysis;
  
  if (duplicates.length === 0 && similarPairs.length === 0) {
    log(`   ✅ 중복 없음 - ${totalCount}곡 모두 고유한 가사`, 'green');
  } else {
    log(`   ⚠️  중복 발견:`, 'yellow');
    log(`      - 정확 일치: ${duplicates.length}건`, 'yellow');
    log(`      - 유사 가사: ${similarPairs.length}건`, 'yellow');
    log(`      - 고유 가사: ${uniqueCount}/${totalCount}`, 'yellow');
  }
  
  // 3. 이미지 업스케일
  log('\n3️⃣  이미지 업스케일:', 'cyan');
  const upscaleSuccess = testResults.imageUpscale.images.length;
  const upscaleTotal = upscaleSuccess + testResults.imageUpscale.errors.length;
  
  if (upscaleTotal > 0) {
    if (testResults.imageUpscale.errors.length === 0) {
      log(`   ✅ 성공 - ${upscaleSuccess}개 이미지 업스케일`, 'green');
    } else {
      log(`   ⚠️  부분 성공 - ${upscaleSuccess}/${upscaleTotal}`, 'yellow');
    }
    
    testResults.imageUpscale.images.forEach(img => {
      log(`      • ${img.title}`, 'blue');
      log(`        YouTube: ${img.youtubeUrl}`, 'blue');
      log(`        Album: ${img.albumUrl}`, 'blue');
    });
  }
  
  // 4. 앨범 메타데이터
  log('\n4️⃣  앨범 메타데이터 (최종정리):', 'cyan');
  if (testResults.albumMetadata.data) {
    const data = testResults.albumMetadata.data;
    log(`   ✅ 성공`, 'green');
    log(`      • 앨범 제목: ${data.albumTitle}`, 'blue');
    log(`      • YouTube 제목: ${data.youtubeTitle}`, 'blue');
    log(`      • 설명 길이: ${data.description.length}자`, 'blue');
    log(`      • 태그 수: ${data.tags.length}개`, 'blue');
    
    const timeTrackCount = (data.description.match(/\d{2}:\d{2}/g) || []).length;
    log(`      • Time Track: ${timeTrackCount}개 타임스탬프`, 'blue');
  } else {
    log(`   ❌ 실패 - ${testResults.albumMetadata.error}`, 'red');
  }
  
  // 5. 발견된 문제점
  log('\n5️⃣  발견된 문제점:', 'cyan');
  if (testResults.summary.issues.length === 0) {
    log(`   ✅ 문제 없음 - 모든 기능 정상 작동`, 'green');
  } else {
    testResults.summary.issues.forEach(issue => {
      log(`   ⚠️  ${issue}`, 'yellow');
    });
  }
  
  // 6. 최종 평가
  log('\n6️⃣  최종 평가:', 'cyan');
  const score = calculateScore();
  
  if (score >= 90) {
    log(`   🏆 우수 (${score}/100점) - 시스템 완벽 작동`, 'green');
  } else if (score >= 70) {
    log(`   ✅ 양호 (${score}/100점) - 일부 개선 필요`, 'yellow');
  } else {
    log(`   ⚠️  미흡 (${score}/100점) - 수정 필요`, 'red');
  }
  
  log('\n═══════════════════════════════════════════════════', 'magenta');
  log('              테스트 완료', 'magenta');
  log('═══════════════════════════════════════════════════', 'magenta');
  
  // JSON 보고서 저장
  const reportPath = path.join(__dirname, 'final-test-report.json');
  const report = {
    ...testResults,
    testDate: new Date().toISOString(),
    songs: songs.map(s => ({
      title: s.title,
      duration: s.duration,
      hasLyrics: !!(s.lyrics || s.lyric),
      hasImage: !!(s.imageUrl || s.image_url),
      hasAudio: !!(s.audioUrl || s.audio_url)
    })),
    score
  };
  
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
  log(`\n📄 상세 보고서 저장: ${reportPath}`, 'green');
}

// 점수 계산
function calculateScore() {
  let score = 0;
  
  // 곡 생성 (40점)
  const songCount = testResults.songGeneration.songs.length;
  score += Math.min(40, (songCount / 15) * 40);
  
  // 가사 고유성 (30점)
  const { duplicates, similarPairs, totalCount } = testResults.lyricsAnalysis;
  if (totalCount > 0) {
    const uniqueRatio = (totalCount - duplicates.length - similarPairs.length) / totalCount;
    score += uniqueRatio * 30;
  }
  
  // 이미지 업스케일 (15점)
  const upscaleSuccess = testResults.imageUpscale.images.length;
  const upscaleTotal = upscaleSuccess + testResults.imageUpscale.errors.length;
  if (upscaleTotal > 0) {
    score += (upscaleSuccess / upscaleTotal) * 15;
  }
  
  // 메타데이터 (15점)
  if (testResults.albumMetadata.data) {
    score += 15;
  }
  
  return Math.round(score);
}

// 유틸리티
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// 메인 실행
async function main() {
  log('🎵 Suno Music Generator 종합 테스트 시작', 'magenta');
  log('목표: 15곡 생성 + 가사 중복 검사 + 이미지 업스케일 + 메타데이터', 'magenta');
  
  let songs = [];
  
  try {
    // 1. 15곡 생성 및 완료 대기
    songs = await generateAndWaitSongs();
    
    if (songs.length === 0) {
      throw new Error('생성된 곡이 없습니다. 테스트 중단.');
    }
    
    // 2. 가사 중복 분석
    analyzeLyrics(songs);
    
    // 3. 이미지 업스케일
    await testImageUpscale(songs);
    
    // 4. 앨범 메타데이터
    await generateAlbumMetadata(songs);
    
    // 5. 최종 보고서
    generateFinalReport(songs);
    
  } catch (error) {
    log(`\n❌ 테스트 중 오류 발생: ${error.message}`, 'red');
    
    // 부분 보고서라도 생성
    if (songs.length > 0) {
      generateFinalReport(songs);
    }
    
    process.exit(1);
  }
}

main();
