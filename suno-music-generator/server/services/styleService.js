const fs = require('fs').promises;
const path = require('path');

// 장르 데이터베이스 경로
const GENRES_DB_PATH = path.join(__dirname, '../data/genres.json');
const PRESETS_DB_PATH = path.join(__dirname, '../data/style-presets.json');

// 캐시
let genresCache = null;
let presetsCache = null;

/**
 * 장르 데이터베이스 로드
 */
async function loadGenres() {
  if (!genresCache) {
    const data = await fs.readFile(GENRES_DB_PATH, 'utf8');
    genresCache = JSON.parse(data);
  }
  return genresCache;
}

/**
 * 프리셋 데이터베이스 로드
 */
async function loadPresets() {
  if (!presetsCache) {
    const data = await fs.readFile(PRESETS_DB_PATH, 'utf8');
    presetsCache = JSON.parse(data);
  }
  return presetsCache;
}

/**
 * 장르 ID로 장르 정보 찾기
 */
async function findGenreById(genreId) {
  const genres = await loadGenres();
  
  for (const category of genres.categories) {
    const genre = category.genres.find(g => g.id === genreId);
    if (genre) {
      return {
        genre,
        category: {
          id: category.id,
          name: category.name,
          emoji: category.emoji
        }
      };
    }
  }
  
  return null;
}

/**
 * 스타일 설정을 Suno Music Prompt로 변환
 * 
 * @param {Object} styleConfig - 스타일 설정
 * @param {string} styleConfig.genreId - 장르 ID
 * @param {number} styleConfig.bpm - BPM (선택)
 * @param {Array<string>} styleConfig.mood - 무드 (선택)
 * @param {Array<string>} styleConfig.instruments - 악기 (선택)
 * @param {string} styleConfig.customPrompt - 커스텀 프롬프트 (선택)
 * @returns {Object} { prompt, metadata }
 */
async function convertStyleToSunoPrompt(styleConfig) {
  const { genreId, bpm, mood, instruments, customPrompt } = styleConfig;
  
  // 장르 정보 가져오기
  const genreInfo = await findGenreById(genreId);
  
  if (!genreInfo) {
    throw new Error(`장르를 찾을 수 없습니다: ${genreId}`);
  }
  
  const { genre } = genreInfo;
  
  // 프롬프트 구성 요소 수집
  const promptParts = [];
  
  // 1. 기본 장르 템플릿 (가장 중요)
  promptParts.push(genre.promptTemplate);
  
  // 2. BPM 정보 추가 (사용자가 지정하거나 장르 기본값)
  const finalBpm = bpm || genre.bpm.default;
  promptParts.push(`${finalBpm} BPM`);
  
  // 3. 무드 정보 (사용자 지정 또는 장르 기본값)
  const finalMood = mood && mood.length > 0 ? mood : genre.mood;
  if (finalMood && finalMood.length > 0) {
    promptParts.push(finalMood.slice(0, 3).join(', ') + ' mood');
  }
  
  // 4. 악기 정보 (사용자 지정 또는 장르 기본값)
  const finalInstruments = instruments && instruments.length > 0 ? instruments : genre.instruments;
  if (finalInstruments && finalInstruments.length > 0) {
    promptParts.push('featuring ' + finalInstruments.slice(0, 4).join(', '));
  }
  
  // 5. 커스텀 프롬프트 추가
  if (customPrompt && customPrompt.trim().length > 0) {
    promptParts.push(customPrompt.trim());
  }
  
  // 최종 프롬프트 생성
  const finalPrompt = promptParts.join(', ');
  
  // 메타데이터 생성
  const metadata = {
    genre: {
      id: genre.id,
      name: genre.name,
      nameKo: genre.nameKo,
      category: genreInfo.category.name
    },
    bpm: finalBpm,
    bpmRange: genre.bpm,
    mood: finalMood,
    instruments: finalInstruments,
    examples: genre.examples,
    rawPrompt: finalPrompt
  };
  
  return {
    prompt: finalPrompt,
    metadata
  };
}

/**
 * 가사 기반 AI 스타일 추천
 * 
 * @param {string} lyrics - 가사 텍스트
 * @param {number} count - 추천 개수 (기본 3)
 * @returns {Array} 추천 장르 목록
 */
async function recommendStylesFromLyrics(lyrics, count = 3) {
  if (!lyrics || lyrics.trim().length === 0) {
    throw new Error('가사를 입력해주세요.');
  }
  
  const genres = await loadGenres();
  const lyricsLower = lyrics.toLowerCase();
  
  // 키워드 분석
  const keywords = extractKeywords(lyricsLower);
  const emotion = analyzeEmotion(lyricsLower);
  const tempo = predictTempo(lyricsLower);
  const language = detectLanguage(lyrics);
  
  console.log('🎯 가사 분석 결과:');
  console.log('   감정:', emotion);
  console.log('   템포:', tempo);
  console.log('   언어:', language);
  console.log('   키워드:', keywords);
  
  // 모든 장르에 대해 스코어링
  const recommendations = [];
  
  for (const category of genres.categories) {
    for (const genre of category.genres) {
      const score = calculateRecommendScore(genre, keywords, emotion, tempo, language);
      if (score > 0) {
        recommendations.push({
          genre,
          category: {
            id: category.id,
            name: category.name,
            emoji: category.emoji
          },
          score,
          reason: generateRecommendReason(genre, emotion, tempo, language),
          suggestedBpm: getSuggestedBpm(genre, tempo)
        });
      }
    }
  }
  
  // 스코어순 정렬 후 상위 N개 반환
  recommendations.sort((a, b) => b.score - a.score);
  return recommendations.slice(0, count);
}

/**
 * 프리셋으로 스타일 빠른 적용
 */
async function applyPreset(presetId) {
  const presets = await loadPresets();
  const preset = presets.presets.find(p => p.id === presetId);
  
  if (!preset) {
    throw new Error(`프리셋을 찾을 수 없습니다: ${presetId}`);
  }
  
  // 프리셋의 장르 정보 가져오기
  const genreInfo = await findGenreById(preset.genre);
  
  if (!genreInfo) {
    throw new Error(`프리셋의 장르를 찾을 수 없습니다: ${preset.genre}`);
  }
  
  // 프리셋 설정을 스타일 설정으로 변환
  const styleConfig = {
    genreId: preset.genre,
    bpm: preset.bpm,
    mood: preset.mood,
    instruments: preset.instruments,
    customPrompt: preset.style
  };
  
  // Suno 프롬프트로 변환
  const result = await convertStyleToSunoPrompt(styleConfig);
  
  return {
    ...result,
    preset: {
      id: preset.id,
      name: preset.name,
      nameEn: preset.nameEn,
      emoji: preset.emoji,
      description: preset.description
    }
  };
}

// ========================================
// 유틸리티 함수들
// ========================================

/**
 * 키워드 추출
 */
function extractKeywords(lyrics) {
  const emotionalWords = {
    love: ['love', 'heart', 'forever', 'together', '사랑', '마음', '영원', '함께'],
    sad: ['miss', 'cry', 'tear', 'pain', 'lonely', '그리움', '눈물', '아픔', '외로운'],
    happy: ['smile', 'joy', 'bright', 'shine', 'happy', '미소', '기쁨', '밝은', '행복'],
    dream: ['dream', 'wish', 'hope', 'star', '꿈', '소망', '희망', '별'],
    time: ['night', 'day', 'morning', 'sunset', 'time', '밤', '낮', '아침', '저녁', '시간']
  };
  
  const found = {};
  for (const [category, words] of Object.entries(emotionalWords)) {
    found[category] = words.filter(w => lyrics.includes(w)).length;
  }
  
  return found;
}

/**
 * 감정 분석 (더 정교하게)
 */
function analyzeEmotion(lyrics) {
  const emotions = {
    sad: ['sad', 'cry', 'miss', 'lonely', 'pain', 'tear', 'hurt', 'broke', 'lost', 
          '슬픈', '눈물', '그리운', '외로운', '아픈', '떠나', '헤어'],
    happy: ['happy', 'smile', 'joy', 'love', 'bright', 'shine', 'laugh', 'fun',
            '행복', '미소', '기쁨', '사랑', '밝은', '웃음', '즐거운'],
    dark: ['dark', 'night', 'shadow', 'cold', 'fear', 'death', 'black', 'alone',
           '어두운', '밤', '그림자', '차가운', '두려운', '죽음', '혼자'],
    energetic: ['dance', 'party', 'energy', 'power', 'fire', 'wild', 'crazy',
                '춤', '파티', '에너지', '힘', '불', '미친', '열정'],
    romantic: ['kiss', 'touch', 'hold', 'feel', 'close', 'together', 'forever',
               '키스', '안다', '느낌', '가까이', '함께', '영원']
  };
  
  let scores = {};
  for (const [emotion, words] of Object.entries(emotions)) {
    scores[emotion] = words.filter(w => lyrics.includes(w)).length;
  }
  
  // 가장 높은 스코어의 감정 반환
  const maxEmotion = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  
  return scores[maxEmotion] > 0 ? maxEmotion : 'neutral';
}

/**
 * 템포 예측 (더 정교하게)
 */
function predictTempo(lyrics) {
  const tempoIndicators = {
    verySlow: ['slow', 'calm', 'quiet', 'soft', 'gentle', 'peaceful',
               '느린', '차분한', '조용한', '부드러운', '평화로운'],
    slow: ['ballad', 'tender', 'sweet', 'mellow', 'smooth',
           '발라드', '감미로운', '달콤한', '부드러운'],
    medium: ['walk', 'groove', 'move', 'sway', 'flow',
             '걷는', '그루브', '움직', '흔들', '흐르는'],
    fast: ['fast', 'quick', 'rush', 'run', 'speed',
           '빠른', '빠르게', '달리', '속도'],
    veryFast: ['dance', 'party', 'jump', 'wild', 'crazy', 'energy', 'power',
               '춤', '파티', '뛰', '미친', '에너지', '힘']
  };
  
  let scores = {};
  for (const [tempo, words] of Object.entries(tempoIndicators)) {
    scores[tempo] = words.filter(w => lyrics.includes(w)).length;
  }
  
  const maxTempo = Object.keys(scores).reduce((a, b) => scores[a] > scores[b] ? a : b);
  
  return scores[maxTempo] > 0 ? maxTempo : 'medium';
}

/**
 * 언어 감지
 */
function detectLanguage(lyrics) {
  const koreanChars = (lyrics.match(/[가-힣]/g) || []).length;
  const englishChars = (lyrics.match(/[a-zA-Z]/g) || []).length;
  
  if (koreanChars > englishChars) return 'korean';
  if (englishChars > koreanChars) return 'english';
  return 'mixed';
}

/**
 * 추천 스코어 계산 (더 정교하게)
 */
function calculateRecommendScore(genre, keywords, emotion, tempo, language) {
  let score = 0;
  
  // 1. 감정 매칭 (가장 중요: 30점)
  if (genre.mood) {
    const emotionMoodMap = {
      sad: ['emotional', 'sad', 'melancholic', 'melancholy', 'sorrowful', 'ballad', 'intimate'],
      happy: ['upbeat', 'happy', 'joyful', 'energetic', 'cheerful', 'bright', 'optimistic'],
      dark: ['dark', 'aggressive', 'heavy', 'intense', 'moody', 'dramatic', 'gothic'],
      energetic: ['energetic', 'upbeat', 'party', 'dance', 'fast', 'powerful', 'wild'],
      romantic: ['romantic', 'smooth', 'sensual', 'passionate', 'intimate', 'soft']
    };
    
    const relevantMoods = emotionMoodMap[emotion] || [];
    const moodMatches = genre.mood.filter(m => relevantMoods.includes(m)).length;
    score += moodMatches * 10;
  }
  
  // 2. 템포 매칭 (20점)
  if (genre.bpm) {
    const tempoBpmMap = {
      verySlow: [0, 80],
      slow: [80, 100],
      medium: [100, 130],
      fast: [130, 160],
      veryFast: [160, 999]
    };
    
    const [minBpm, maxBpm] = tempoBpmMap[tempo] || [100, 130];
    const genreBpm = genre.bpm.default;
    
    if (genreBpm >= minBpm && genreBpm <= maxBpm) {
      score += 20;
    } else {
      // 부분 점수
      const distance = Math.min(Math.abs(genreBpm - minBpm), Math.abs(genreBpm - maxBpm));
      score += Math.max(0, 20 - distance / 2);
    }
  }
  
  // 3. 언어별 장르 선호도 (10점)
  if (language === 'korean') {
    const koreanFriendlyGenres = ['k-pop', 'pop-ballad', 'indie-pop', 'r-and-b', 'ballad'];
    if (koreanFriendlyGenres.includes(genre.id)) {
      score += 10;
    }
  }
  
  // 4. 키워드 매칭 (10점)
  if (keywords.love > 0 && genre.mood && genre.mood.includes('romantic')) score += 5;
  if (keywords.dream > 0 && genre.mood && genre.mood.includes('dreamy')) score += 5;
  
  return score;
}

/**
 * 추천 이유 생성
 */
function generateRecommendReason(genre, emotion, tempo, language) {
  const reasons = [];
  
  const emotionReasons = {
    sad: '감성적이고 애틋한 가사에 잘 어울립니다',
    happy: '밝고 긍정적인 분위기와 잘 맞습니다',
    dark: '어둡고 강렬한 느낌을 잘 표현합니다',
    energetic: '에너지 넘치는 분위기를 살립니다',
    romantic: '로맨틱한 감성을 잘 전달합니다'
  };
  
  if (emotionReasons[emotion]) {
    reasons.push(emotionReasons[emotion]);
  }
  
  const tempoReasons = {
    verySlow: '매우 느린 템포로 여유로운 느낌',
    slow: '느린 템포로 감성을 깊게 표현',
    medium: '적당한 템포로 듣기 편안함',
    fast: '빠른 템포로 활기찬 느낌',
    veryFast: '매우 빠른 템포로 강렬한 에너지'
  };
  
  if (tempoReasons[tempo]) {
    reasons.push(tempoReasons[tempo]);
  }
  
  if (genre.bpm) {
    reasons.push(`${genre.bpm.default} BPM 권장`);
  }
  
  return reasons.join(', ');
}

/**
 * 추천 BPM 계산
 */
function getSuggestedBpm(genre, tempo) {
  const tempoBpmMap = {
    verySlow: 0.8,  // 기본 BPM의 80%
    slow: 0.9,      // 기본 BPM의 90%
    medium: 1.0,    // 기본 BPM
    fast: 1.1,      // 기본 BPM의 110%
    veryFast: 1.2   // 기본 BPM의 120%
  };
  
  const multiplier = tempoBpmMap[tempo] || 1.0;
  const suggestedBpm = Math.round(genre.bpm.default * multiplier);
  
  // BPM 범위 내로 제한
  return Math.max(genre.bpm.min, Math.min(genre.bpm.max, suggestedBpm));
}

/**
 * 캐시 초기화 (데이터 업데이트 후 사용)
 */
function clearCache() {
  genresCache = null;
  presetsCache = null;
  console.log('✅ 장르/프리셋 캐시 초기화 완료');
}

module.exports = {
  loadGenres,
  loadPresets,
  findGenreById,
  convertStyleToSunoPrompt,
  recommendStylesFromLyrics,
  applyPreset,
  clearCache
};
