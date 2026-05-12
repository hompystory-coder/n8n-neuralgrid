const express = require('express');
const router = express.Router();
const youtubeMetadataGenerator = require('../services/youtubeMetadataGenerator');

/**
 * 🎬 유튜브 메타데이터 생성 API
 * 
 * POST /api/youtube/generate-metadata
 * 
 * Body:
 * {
 *   "title": "벚꽃의 향기",
 *   "lyrics": "봄이 오면 벚꽃이...",
 *   "style": "lo-fi hip hop, 85 BPM, chill mood",
 *   "genre": "lo-fi",
 *   "mood": "chill",
 *   "bpm": 85
 * }
 * 
 * Response:
 * {
 *   "success": true,
 *   "data": {
 *     "title": "Playlist | 벚꽃의 향기 | Chill Lo-Fi | 85 BPM Study Vibes",
 *     "description": "🌸 2026년 봄, 우리의 일상 속...",
 *     "tags": ["playlist", "lofi", "chill", ...]
 *   }
 * }
 */
router.post('/generate-metadata', async (req, res) => {
  try {
    const songData = req.body;

    // 필수 필드 검증
    if (!songData.title) {
      return res.status(400).json({
        success: false,
        error: '곡 제목(title)이 필요합니다'
      });
    }

    console.log('🎬 유튜브 메타데이터 생성 시작:', songData.title);

    // 메타데이터 생성
    const metadata = await youtubeMetadataGenerator.generate(songData);

    console.log('✅ 메타데이터 생성 완료');
    console.log('제목:', metadata.title);
    console.log('태그 개수:', metadata.tags.length);

    res.json({
      success: true,
      data: metadata
    });

  } catch (error) {
    console.error('❌ 메타데이터 생성 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message || '메타데이터 생성 중 오류가 발생했습니다'
    });
  }
});

/**
 * 🎬 배치 메타데이터 생성 (여러 곡)
 * 
 * POST /api/youtube/generate-metadata-batch
 * 
 * Body:
 * {
 *   "songs": [
 *     { "title": "곡1", "style": "...", ... },
 *     { "title": "곡2", "style": "...", ... }
 *   ]
 * }
 */
router.post('/generate-metadata-batch', async (req, res) => {
  try {
    const { songs } = req.body;

    if (!songs || !Array.isArray(songs)) {
      return res.status(400).json({
        success: false,
        error: 'songs 배열이 필요합니다'
      });
    }

    console.log(`🎬 배치 메타데이터 생성 시작: ${songs.length}곡`);

    const results = [];
    for (const songData of songs) {
      try {
        const metadata = await youtubeMetadataGenerator.generate(songData);
        results.push({
          success: true,
          song: songData.title,
          metadata
        });
      } catch (error) {
        results.push({
          success: false,
          song: songData.title,
          error: error.message
        });
      }
    }

    const successCount = results.filter(r => r.success).length;
    console.log(`✅ 배치 생성 완료: ${successCount}/${songs.length}곡 성공`);

    res.json({
      success: true,
      total: songs.length,
      successCount,
      results
    });

  } catch (error) {
    console.error('❌ 배치 메타데이터 생성 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message || '배치 생성 중 오류가 발생했습니다'
    });
  }
});

/**
 * 🎬 중복 체크 (제목 유사도 검사)
 * 
 * POST /api/youtube/check-duplicates
 * 
 * Body:
 * {
 *   "titles": ["제목1", "제목2", ...]
 * }
 */
router.post('/check-duplicates', async (req, res) => {
  try {
    const { titles } = req.body;

    if (!titles || !Array.isArray(titles)) {
      return res.status(400).json({
        success: false,
        error: 'titles 배열이 필요합니다'
      });
    }

    console.log(`🔍 중복 체크 시작: ${titles.length}개 제목`);

    // 모든 제목에 대해 메타데이터 생성
    const metadatas = [];
    for (const title of titles) {
      const metadata = await youtubeMetadataGenerator.generate({
        title,
        style: 'lo-fi hip hop, 85 BPM, chill',
        genre: 'lo-fi',
        mood: 'chill',
        bpm: 85
      });
      metadatas.push({
        originalTitle: title,
        youtubeTitle: metadata.title,
        templateIndex: metadata.metadata.templateIndex
      });
    }

    // 중복 검사
    const titleCounts = {};
    metadatas.forEach(m => {
      titleCounts[m.youtubeTitle] = (titleCounts[m.youtubeTitle] || 0) + 1;
    });

    const duplicates = Object.entries(titleCounts)
      .filter(([, count]) => count > 1)
      .map(([title, count]) => ({ title, count }));

    const uniqueRate = ((titles.length - duplicates.length) / titles.length * 100).toFixed(2);

    console.log(`✅ 중복 체크 완료: ${uniqueRate}% 고유`);

    res.json({
      success: true,
      total: titles.length,
      unique: titles.length - duplicates.length,
      duplicates: duplicates.length,
      uniqueRate: `${uniqueRate}%`,
      duplicatesList: duplicates,
      samples: metadatas.slice(0, 10) // 샘플 10개
    });

  } catch (error) {
    console.error('❌ 중복 체크 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message || '중복 체크 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
