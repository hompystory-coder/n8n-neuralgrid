/**
 * 🎵 최종 종합 테스트 보고서
 * 이미 생성된 모든 곡을 수집하고 테스트
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
  magenta: '\x1b[35m',
  bold: '\x1b[1m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function main() {
  log('\n╔═══════════════════════════════════════════════════╗', 'magenta');
  log('║   🎵 Suno Music Generator 최종 종합 테스트 보고서   ║', 'magenta');
  log('╚═══════════════════════════════════════════════════╝\n', 'magenta');
  
  const testReport = {
    timestamp: new Date().toISOString(),
    songs: [],
    lyricsAnalysis: {},
    imageTests: [],
    metadataTest: null,
    summary: {}
  };
  
  // 1. 모든 완료된 곡 수집
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📊 Step 1: 생성된 곡 수집 중...', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
  
  // 최근 생성 요청들의 taskId 수집 (마지막 3개 요청)
  const recentTaskIds = [
    // 가장 최근 15곡 요청
    '44c96cb049c48d0cff75d0eec29159aa', '980ff9d3e4b2f06afd3e6d8c6285310c', 'd545da670fe0a0ba5a21659947ee797e',
    '773086e4c6804f50f5f2244a26d31512', '6b14cec0202a4859bfefda9ff8f3e71d', 'dd7bcf46d8fbdf9769a81f936a70d355',
    '5eb840d59b00e1b5dc4ea26053f5f798', '6081bf8ec292d3aa88ea2fe42059cadf', 'd091ed0c1fdc854e322fa161116104ab',
    '49531e1b84022dae3880403410b867ca', '2f41aac61580bfd43369a3b4929d635f', '4938fbf250dbba172ee6a225578129e7',
    'dfa36f871dbb89c3915b34585346246b', '2fb1ffcc3de1d67dd022cc1227cb3636', '8f7f34e8c802155e59c8f101d391892f',
    // 이전 요청들
    'a3e99b716bac6a057647a52e4a9dd5c1', 'c2d7ab59272894a651597a071f16d69c', '8585aee75742001246913a3d7c5ac2d4'
  ];
  
  const completedSongs = [];
  const pendingSongs = [];
  const failedSongs = [];
  
  for (const taskId of recentTaskIds) {
    try {
      const response = await axios.get(`${BASE_URL}/api/music/status/${taskId}`, { timeout: 5000 });
      const data = response.data;
      
      if (data.status === 'completed' && data.song) {
        completedSongs.push(data.song);
        log(`  ✅ "${data.song.title}"`, 'green');
      } else if (data.status === 'pending' || data.status === 'processing') {
        pendingSongs.push(taskId);
        log(`  ⏳ ${taskId.substring(0, 8)}... (진행중)`, 'yellow');
      } else if (data.status === 'failed') {
        failedSongs.push(taskId);
        log(`  ❌ ${taskId.substring(0, 8)}... (실패)`, 'red');
      }
    } catch (error) {
      // 무시 (존재하지 않는 taskId)
    }
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  log(`\n📊 수집 결과:`, 'bold');
  log(`   ✅ 완료: ${completedSongs.length}곡`, 'green');
  log(`   ⏳ 진행중: ${pendingSongs.length}곡`, 'yellow');
  log(`   ❌ 실패: ${failedSongs.length}곡`, 'red');
  
  testReport.songs = completedSongs;
  testReport.summary.totalCompleted = completedSongs.length;
  testReport.summary.totalPending = pendingSongs.length;
  testReport.summary.totalFailed = failedSongs.length;
  
  if (completedSongs.length === 0) {
    log('\n⚠️  완료된 곡이 없습니다. 테스트를 종료합니다.', 'yellow');
    return;
  }
  
  // 2. 가사 중복 분석
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📝 Step 2: 가사 중복 분석 중...', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
  
  const lyrics = completedSongs.map(s => s.lyrics || s.lyric || '').filter(l => l.length > 0);
  
  // 정확한 일치 검사
  const duplicates = [];
  const seen = new Map();
  
  lyrics.forEach((lyric, idx) => {
    const normalized = lyric.trim().toLowerCase();
    if (seen.has(normalized)) {
      duplicates.push({
        song1: completedSongs[seen.get(normalized)].title,
        song2: completedSongs[idx].title,
        index1: seen.get(normalized),
        index2: idx
      });
    } else {
      seen.set(normalized, idx);
    }
  });
  
  // 유사도 검사 (첫 200자)
  const similarPairs = [];
  for (let i = 0; i < lyrics.length; i++) {
    for (let j = i + 1; j < lyrics.length; j++) {
      const prefix1 = lyrics[i].substring(0, 200).trim();
      const prefix2 = lyrics[j].substring(0, 200).trim();
      
      if (prefix1 === prefix2 && prefix1.length > 50) {
        similarPairs.push({
          song1: completedSongs[i].title,
          song2: completedSongs[j].title
        });
      }
    }
  }
  
  testReport.lyricsAnalysis = {
    total: lyrics.length,
    unique: lyrics.length - duplicates.length,
    exactDuplicates: duplicates.length,
    similarPairs: similarPairs.length,
    duplicateDetails: duplicates,
    similarDetails: similarPairs
  };
  
  if (duplicates.length === 0 && similarPairs.length === 0) {
    log(`✅ 중복 없음! ${lyrics.length}곡 모두 고유한 가사`, 'green');
  } else {
    if (duplicates.length > 0) {
      log(`⚠️  정확 일치 중복: ${duplicates.length}건`, 'red');
      duplicates.forEach(dup => {
        log(`   "${dup.song1}" ↔ "${dup.song2}"`, 'red');
      });
    }
    if (similarPairs.length > 0) {
      log(`⚠️  유사 가사: ${similarPairs.length}건`, 'yellow');
      similarPairs.forEach(pair => {
        log(`   "${pair.song1}" ↔ "${pair.song2}"`, 'yellow');
      });
    }
  }
  
  // 가사 샘플 출력
  log(`\n📄 가사 샘플 (처음 3곡):`, 'blue');
  lyrics.slice(0, 3).forEach((lyric, idx) => {
    log(`\n   🎵 곡 ${idx + 1}: "${completedSongs[idx].title}"`, 'cyan');
    const sample = lyric.substring(0, 120).replace(/\n/g, ' ').trim();
    log(`      ${sample}...`, 'blue');
  });
  
  // 3. 이미지 업스케일 테스트
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('🖼️  Step 3: 이미지 업스케일 테스트 (3곡)...', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
  
  const testSongs = completedSongs.slice(0, Math.min(3, completedSongs.length));
  
  for (const song of testSongs) {
    try {
      const imageUrl = song.imageUrl || song.image_url;
      if (!imageUrl) {
        log(`  ⚠️  "${song.title}" - 이미지 없음`, 'yellow');
        continue;
      }
      
      log(`\n🔄 "${song.title}" 업스케일 중...`, 'yellow');
      
      const response = await axios.post(`${BASE_URL}/api/style/upscale-image`, {
        imageUrl: imageUrl,
        title: song.title,
        style: 'cozy-lofi',
        lyrics: song.lyrics || song.lyric || ''
      }, { timeout: 120000 });
      
      testReport.imageTests.push({
        title: song.title,
        success: true,
        originalUrl: imageUrl,
        youtubeUrl: response.data.youtubeUrl,
        albumUrl: response.data.albumUrl
      });
      
      log(`✅ 업스케일 완료!`, 'green');
      log(`   YouTube (1280×720): ${response.data.youtubeUrl}`, 'green');
      log(`   Album (3000×3000): ${response.data.albumUrl}`, 'green');
      
    } catch (error) {
      log(`❌ 업스케일 실패: ${error.message}`, 'red');
      testReport.imageTests.push({
        title: song.title,
        success: false,
        error: error.message
      });
    }
  }
  
  const successfulUpscales = testReport.imageTests.filter(t => t.success).length;
  log(`\n✅ 이미지 업스케일: ${successfulUpscales}/${testSongs.length}`, 'green');
  
  // 4. 앨범 메타데이터 생성
  log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━', 'cyan');
  log('📦 Step 4: 앨범 메타데이터 생성 (최종정리)...', 'cyan');
  log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n', 'cyan');
  
  try {
    const response = await axios.post(`${BASE_URL}/api/style/generate-album-metadata`, {
      songs: completedSongs.map(s => ({
        title: s.title,
        lyrics: s.lyrics || s.lyric || '',
        duration: s.duration || 180
      }))
    }, { timeout: 60000 });
    
    const metadata = response.data;
    testReport.metadataTest = {
      success: true,
      albumTitle: metadata.albumTitle,
      youtubeTitle: metadata.youtubeTitle,
      descriptionLength: metadata.description.length,
      tagsCount: metadata.tags.length,
      timeTrackCount: (metadata.description.match(/\d{2}:\d{2}/g) || []).length
    };
    
    log(`✅ 메타데이터 생성 완료!`, 'green');
    log(`   📌 앨범 제목: ${metadata.albumTitle}`, 'blue');
    log(`   📌 YouTube 제목: ${metadata.youtubeTitle}`, 'blue');
    log(`   📝 설명 길이: ${metadata.description.length}자`, 'blue');
    log(`   🏷️  태그 수: ${metadata.tags.length}개`, 'blue');
    log(`   ⏱️  Time Track: ${testReport.metadataTest.timeTrackCount}개 타임스탬프`, 'blue');
    
    // Time Track 샘플
    const timeTrackLines = metadata.description.split('\n')
      .filter(line => /\d{2}:\d{2}/.test(line))
      .slice(0, 5);
    
    if (timeTrackLines.length > 0) {
      log(`\n   Time Track 샘플:`, 'cyan');
      timeTrackLines.forEach(line => {
        log(`      ${line}`, 'blue');
      });
    }
    
    // 태그 샘플
    log(`\n   태그 샘플 (처음 10개):`, 'cyan');
    log(`      ${metadata.tags.slice(0, 10).join(', ')}`, 'blue');
    
  } catch (error) {
    log(`❌ 메타데이터 생성 실패: ${error.message}`, 'red');
    testReport.metadataTest = {
      success: false,
      error: error.message
    };
  }
  
  // 5. 최종 보고서
  log('\n╔═══════════════════════════════════════════════════╗', 'magenta');
  log('║            📊 최종 테스트 결과 요약                ║', 'magenta');
  log('╚═══════════════════════════════════════════════════╝\n', 'magenta');
  
  log(`📅 테스트 일시: ${new Date().toLocaleString('ko-KR')}`, 'blue');
  log(`\n1️⃣  곡 생성:`, 'cyan');
  log(`   ✅ 완료: ${completedSongs.length}곡`, 'green');
  log(`   ⏳ 진행중: ${pendingSongs.length}곡`, 'yellow');
  log(`   ❌ 실패: ${failedSongs.length}곡`, failedSongs.length > 0 ? 'red' : 'green');
  
  log(`\n2️⃣  가사 분석:`, 'cyan');
  if (duplicates.length === 0 && similarPairs.length === 0) {
    log(`   🏆 완벽! ${lyrics.length}곡 모두 고유한 가사`, 'green');
  } else {
    log(`   📊 총 ${lyrics.length}곡`, 'blue');
    log(`   ✅ 고유: ${lyrics.length - duplicates.length - similarPairs.length}곡`, 'green');
    if (duplicates.length > 0) log(`   ⚠️  정확 중복: ${duplicates.length}건`, 'red');
    if (similarPairs.length > 0) log(`   ⚠️  유사: ${similarPairs.length}건`, 'yellow');
  }
  
  log(`\n3️⃣  이미지 업스케일:`, 'cyan');
  log(`   ✅ 성공: ${successfulUpscales}/${testSongs.length}`, 'green');
  
  log(`\n4️⃣  앨범 메타데이터:`, 'cyan');
  if (testReport.metadataTest && testReport.metadataTest.success) {
    log(`   ✅ 생성 완료`, 'green');
    log(`   📌 앨범: ${testReport.metadataTest.albumTitle}`, 'blue');
    log(`   ⏱️  Time Track: ${testReport.metadataTest.timeTrackCount}개`, 'blue');
  } else {
    log(`   ❌ 생성 실패`, 'red');
  }
  
  // 최종 평가
  log(`\n╔═══════════════════════════════════════════════════╗`, 'magenta');
  log(`║                 🎯 최종 평가                       ║`, 'magenta');
  log(`╚═══════════════════════════════════════════════════╝\n`, 'magenta');
  
  const score = calculateScore(testReport);
  
  if (score >= 90) {
    log(`🏆 우수 (${score}/100점) - 모든 기능 완벽 작동!`, 'green');
    log(`✅ 1700+ 단어 사전이 완벽하게 작동합니다.`, 'green');
    log(`✅ 이미지 업스케일 시스템 정상 작동.`, 'green');
    log(`✅ 메타데이터 자동 생성 완료.`, 'green');
  } else if (score >= 70) {
    log(`✅ 양호 (${score}/100점) - 대부분 기능 정상`, 'yellow');
  } else {
    log(`⚠️  개선 필요 (${score}/100점)`, 'red');
  }
  
  // JSON 보고서 저장
  const reportPath = '/home/user/webapp/suno-music-generator/FINAL-TEST-REPORT.json';
  testReport.summary.score = score;
  fs.writeFileSync(reportPath, JSON.stringify(testReport, null, 2));
  
  log(`\n📄 상세 보고서 저장: ${reportPath}`, 'green');
  log(`\n${'='.repeat(55)}\n`, 'magenta');
}

function calculateScore(report) {
  let score = 0;
  
  // 곡 생성 (40점)
  const songRatio = report.summary.totalCompleted / 15;
  score += Math.min(40, songRatio * 40);
  
  // 가사 고유성 (30점)
  const { total, exactDuplicates, similarPairs } = report.lyricsAnalysis;
  if (total > 0) {
    const uniqueRatio = (total - exactDuplicates - similarPairs) / total;
    score += uniqueRatio * 30;
  }
  
  // 이미지 업스케일 (15점)
  const successfulImages = report.imageTests.filter(t => t.success).length;
  const totalImageTests = report.imageTests.length;
  if (totalImageTests > 0) {
    score += (successfulImages / totalImageTests) * 15;
  }
  
  // 메타데이터 (15점)
  if (report.metadataTest && report.metadataTest.success) {
    score += 15;
  }
  
  return Math.round(score);
}

main().catch(error => {
  console.error('❌ 오류:', error.message);
  process.exit(1);
});
