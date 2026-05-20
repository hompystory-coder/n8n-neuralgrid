const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');

// 장르 데이터베이스 경로
const GENRES_DB_PATH = path.join(__dirname, '../data/genres.json');
const PRESETS_DB_PATH = path.join(__dirname, '../data/style-presets.json');

// 캐시된 데이터
let genresCache = null;
let presetsCache = null;

// 장르 데이터베이스 로드
async function loadGenres() {
  if (!genresCache) {
    const data = await fs.readFile(GENRES_DB_PATH, 'utf8');
    genresCache = JSON.parse(data);
  }
  return genresCache;
}

// 프리셋 데이터베이스 로드
async function loadPresets() {
  if (!presetsCache) {
    const data = await fs.readFile(PRESETS_DB_PATH, 'utf8');
    presetsCache = JSON.parse(data);
  }
  return presetsCache;
}

/**
 * GET /api/genres
 * 전체 장르 데이터베이스 반환
 */
router.get('/', async (req, res) => {
  try {
    const genres = await loadGenres();
    res.json({
      success: true,
      data: genres
    });
  } catch (error) {
    console.error('❌ 장르 데이터베이스 로드 실패:', error);
    res.status(500).json({
      success: false,
      error: '장르 데이터베이스를 불러올 수 없습니다.'
    });
  }
});

/**
 * GET /api/genres/categories
 * 카테고리 목록만 반환 (장르 상세 제외)
 */
router.get('/categories', async (req, res) => {
  try {
    const genres = await loadGenres();
    const categories = genres.categories.map(cat => ({
      id: cat.id,
      name: cat.name,
      emoji: cat.emoji,
      description: cat.description,
      count: cat.count
    }));
    
    res.json({
      success: true,
      data: {
        totalCategories: categories.length,
        categories
      }
    });
  } catch (error) {
    console.error('❌ 카테고리 로드 실패:', error);
    res.status(500).json({
      success: false,
      error: '카테고리를 불러올 수 없습니다.'
    });
  }
});

/**
 * GET /api/genres/category/:categoryId
 * 특정 카테고리의 장르 목록 반환
 */
router.get('/category/:categoryId', async (req, res) => {
  try {
    const { categoryId } = req.params;
    const genres = await loadGenres();
    
    const category = genres.categories.find(cat => cat.id === categoryId);
    
    if (!category) {
      return res.status(404).json({
        success: false,
        error: '카테고리를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: category
    });
  } catch (error) {
    console.error('❌ 카테고리 장르 로드 실패:', error);
    res.status(500).json({
      success: false,
      error: '장르를 불러올 수 없습니다.'
    });
  }
});

/**
 * GET /api/genres/genre/:genreId
 * 특정 장르의 상세 정보 반환
 */
router.get('/genre/:genreId', async (req, res) => {
  try {
    const { genreId } = req.params;
    const genres = await loadGenres();
    
    let foundGenre = null;
    let foundCategory = null;
    
    for (const category of genres.categories) {
      const genre = category.genres.find(g => g.id === genreId);
      if (genre) {
        foundGenre = genre;
        foundCategory = {
          id: category.id,
          name: category.name,
          emoji: category.emoji
        };
        break;
      }
    }
    
    if (!foundGenre) {
      return res.status(404).json({
        success: false,
        error: '장르를 찾을 수 없습니다.'
      });
    }
    
    res.json({
      success: true,
      data: {
        genre: foundGenre,
        category: foundCategory
      }
    });
  } catch (error) {
    console.error('❌ 장르 상세 정보 로드 실패:', error);
    res.status(500).json({
      success: false,
      error: '장르 정보를 불러올 수 없습니다.'
    });
  }
});

/**
 * GET /api/genres/search
 * 장르 검색
 * Query params: q (검색어), category (카테고리 필터)
 */
router.get('/search', async (req, res) => {
  try {
    const { q, category } = req.query;
    
    if (!q || q.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '검색어를 입력해주세요.'
      });
    }
    
    const genres = await loadGenres();
    const searchTerm = q.toLowerCase().trim();
    const results = [];
    
    for (const cat of genres.categories) {
      // 카테고리 필터가 있으면 적용
      if (category && cat.id !== category) {
        continue;
      }
      
      for (const genre of cat.genres) {
        const matchScore = calculateMatchScore(genre, searchTerm);
        if (matchScore > 0) {
          results.push({
            genre,
            category: {
              id: cat.id,
              name: cat.name,
              emoji: cat.emoji
            },
            matchScore
          });
        }
      }
    }
    
    // 매칭 스코어순 정렬
    results.sort((a, b) => b.matchScore - a.matchScore);
    
    res.json({
      success: true,
      data: {
        query: q,
        totalResults: results.length,
        results: results.slice(0, 50) // 최대 50개 결과
      }
    });
  } catch (error) {
    console.error('❌ 장르 검색 실패:', error);
    res.status(500).json({
      success: false,
      error: '장르 검색에 실패했습니다.'
    });
  }
});

/**
 * GET /api/genres/presets
 * 스타일 프리셋 목록 반환
 */
router.get('/presets', async (req, res) => {
  try {
    const presets = await loadPresets();
    res.json({
      success: true,
      data: presets
    });
  } catch (error) {
    console.error('❌ 프리셋 로드 실패:', error);
    res.status(500).json({
      success: false,
      error: '프리셋을 불러올 수 없습니다.'
    });
  }
});

/**
 * GET /api/genres/recommend
 * 가사 기반 AI 장르 추천
 * Query params: lyrics (가사 텍스트), count (추천 개수, 기본 3)
 */
router.get('/recommend', async (req, res) => {
  try {
    const { lyrics, count = 3 } = req.query;
    
    if (!lyrics || lyrics.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: '가사를 입력해주세요.'
      });
    }
    
    const genres = await loadGenres();
    const recommendations = analyzeAndRecommend(lyrics, genres, parseInt(count));
    
    res.json({
      success: true,
      data: {
        lyrics: lyrics.substring(0, 100) + '...', // 미리보기만
        recommendations
      }
    });
  } catch (error) {
    console.error('❌ 장르 추천 실패:', error);
    res.status(500).json({
      success: false,
      error: '장르 추천에 실패했습니다.'
    });
  }
});

// ========================================
// 유틸리티 함수들
// ========================================

/**
 * 장르와 검색어 매칭 스코어 계산
 */
function calculateMatchScore(genre, searchTerm) {
  let score = 0;
  
  // ID 매칭
  if (genre.id.includes(searchTerm)) score += 10;
  
  // 이름 매칭 (영문)
  if (genre.name.toLowerCase().includes(searchTerm)) score += 8;
  
  // 한글 이름 매칭
  if (genre.nameKo && genre.nameKo.includes(searchTerm)) score += 8;
  
  // 설명 매칭
  if (genre.description.toLowerCase().includes(searchTerm)) score += 5;
  
  // Mood 매칭
  if (genre.mood && genre.mood.some(m => m.includes(searchTerm))) score += 4;
  
  // 악기 매칭
  if (genre.instruments && genre.instruments.some(i => i.includes(searchTerm))) score += 3;
  
  // 예시 아티스트 매칭
  if (genre.examples && genre.examples.some(e => e.toLowerCase().includes(searchTerm))) score += 6;
  
  return score;
}

/**
 * 가사 분석 및 장르 추천
 */
function analyzeAndRecommend(lyrics, genresData, count = 3) {
  const lyricsLower = lyrics.toLowerCase();
  const recommendations = [];
  
  // 키워드 기반 분석
  const keywords = extractKeywords(lyricsLower);
  const emotion = analyzeEmotion(lyricsLower);
  const tempo = predictTempo(lyricsLower);
  
  // 모든 장르에 대해 스코어링
  for (const category of genresData.categories) {
    for (const genre of category.genres) {
      const score = calculateRecommendScore(genre, keywords, emotion, tempo);
      if (score > 0) {
        recommendations.push({
          genre,
          category: {
            id: category.id,
            name: category.name,
            emoji: category.emoji
          },
          score,
          reason: generateRecommendReason(genre, keywords, emotion, tempo)
        });
      }
    }
  }
  
  // 스코어순 정렬 후 상위 N개 반환
  recommendations.sort((a, b) => b.score - a.score);
  return recommendations.slice(0, count);
}

/**
 * 키워드 추출
 */
function extractKeywords(lyrics) {
  const emotionalWords = ['love', 'heart', 'miss', 'cry', 'smile', 'dream', 'night', 'day', 
                          '사랑', '그리움', '눈물', '미소', '꿈', '밤', '낮', '마음'];
  const energyWords = ['party', 'dance', 'energy', 'power', 'fast', 'slow',
                      '파티', '댄스', '에너지', '빠른', '느린'];
  const moodWords = ['sad', 'happy', 'dark', 'bright', 'lonely', 'together',
                    '슬픈', '행복', '어두운', '밝은', '외로운', '함께'];
  
  const found = {
    emotional: emotionalWords.filter(w => lyrics.includes(w)),
    energy: energyWords.filter(w => lyrics.includes(w)),
    mood: moodWords.filter(w => lyrics.includes(w))
  };
  
  return found;
}

/**
 * 감정 분석
 */
function analyzeEmotion(lyrics) {
  const sadWords = ['sad', 'cry', 'miss', 'lonely', 'pain', '슬픈', '눈물', '그리운', '외로운', '아픈'];
  const happyWords = ['happy', 'smile', 'joy', 'love', 'bright', '행복', '미소', '기쁨', '사랑', '밝은'];
  const darkWords = ['dark', 'night', 'shadow', 'cold', '어두운', '밤', '그림자', '차가운'];
  
  let sadCount = sadWords.filter(w => lyrics.includes(w)).length;
  let happyCount = happyWords.filter(w => lyrics.includes(w)).length;
  let darkCount = darkWords.filter(w => lyrics.includes(w)).length;
  
  if (sadCount > happyCount && sadCount > darkCount) return 'sad';
  if (happyCount > sadCount && happyCount > darkCount) return 'happy';
  if (darkCount > sadCount && darkCount > happyCount) return 'dark';
  
  return 'neutral';
}

/**
 * 템포 예측
 */
function predictTempo(lyrics) {
  const fastWords = ['fast', 'dance', 'party', 'energy', 'run', '빠른', '댄스', '파티', '에너지'];
  const slowWords = ['slow', 'calm', 'quiet', 'soft', '느린', '차분한', '조용한', '부드러운'];
  
  let fastCount = fastWords.filter(w => lyrics.includes(w)).length;
  let slowCount = slowWords.filter(w => lyrics.includes(w)).length;
  
  if (fastCount > slowCount) return 'fast';
  if (slowCount > fastCount) return 'slow';
  
  return 'medium';
}

/**
 * 추천 스코어 계산
 */
function calculateRecommendScore(genre, keywords, emotion, tempo) {
  let score = 0;
  
  // Mood 매칭
  if (genre.mood) {
    if (emotion === 'sad' && genre.mood.some(m => ['emotional', 'sad', 'melancholic', 'ballad'].includes(m))) {
      score += 10;
    }
    if (emotion === 'happy' && genre.mood.some(m => ['upbeat', 'happy', 'joyful', 'energetic'].includes(m))) {
      score += 10;
    }
    if (emotion === 'dark' && genre.mood.some(m => ['dark', 'aggressive', 'heavy', 'intense'].includes(m))) {
      score += 10;
    }
  }
  
  // BPM 매칭
  if (genre.bpm) {
    if (tempo === 'slow' && genre.bpm.default < 100) score += 8;
    if (tempo === 'medium' && genre.bpm.default >= 100 && genre.bpm.default < 130) score += 8;
    if (tempo === 'fast' && genre.bpm.default >= 130) score += 8;
  }
  
  // 키워드 매칭
  const allKeywords = [...keywords.emotional, ...keywords.energy, ...keywords.mood];
  if (genre.mood && allKeywords.some(k => genre.mood.join(' ').includes(k))) {
    score += 5;
  }
  
  return score;
}

/**
 * 추천 이유 생성
 */
function generateRecommendReason(genre, keywords, emotion, tempo) {
  const reasons = [];
  
  if (emotion === 'sad') reasons.push('감성적인 가사');
  if (emotion === 'happy') reasons.push('밝고 긍정적인 분위기');
  if (emotion === 'dark') reasons.push('어둡고 강렬한 느낌');
  
  if (tempo === 'slow') reasons.push('느린 템포');
  if (tempo === 'fast') reasons.push('빠른 템포');
  
  if (genre.bpm) {
    reasons.push(`${genre.bpm.default} BPM 추천`);
  }
  
  return reasons.join(', ');
}

/**
 * POST /api/genres/preset-to-prompt
 * 프리셋 ID를 받아서 Suno 프롬프트로 변환
 */
router.post('/preset-to-prompt', async (req, res) => {
  try {
    const { presetId } = req.body;
    
    if (!presetId) {
      return res.status(400).json({
        success: false,
        error: '프리셋 ID가 필요합니다.'
      });
    }
    
    const presetsData = await loadPresets();
    const presets = presetsData.presets || presetsData; // presets 배열 추출
    const preset = presets.find(p => p.id === presetId);
    
    if (!preset) {
      return res.status(404).json({
        success: false,
        error: '프리셋을 찾을 수 없습니다.'
      });
    }
    
    // 프리셋의 style을 기반으로 완전한 Suno 프롬프트 생성
    const prompt = `${preset.style}, ${preset.bpm} BPM, ${preset.mood.join(', ')} mood, featuring ${preset.instruments.join(', ')}`;
    
    res.json({
      success: true,
      prompt,
      metadata: {
        preset: preset.name,
        genre: preset.genre,
        bpm: preset.bpm,
        mood: preset.mood
      }
    });
    
  } catch (error) {
    console.error('❌ 프리셋 프롬프트 변환 실패:', error);
    res.status(500).json({
      success: false,
      error: '프리셋 프롬프트 변환에 실패했습니다.'
    });
  }
});

module.exports = router;
