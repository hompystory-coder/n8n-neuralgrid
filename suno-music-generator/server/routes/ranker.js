/**
 * 🎵 Music Ranker API Routes
 * AI 기반 음악 순위 자동 추천 API
 */

const express = require('express');
const router = express.Router();
const { rankTracks } = require('../services/musicRanker');

/**
 * POST /api/ranker/analyze
 * 음악 배열을 받아서 AI 순위 분석 수행
 * 
 * Body:
 * {
 *   tracks: [
 *     {
 *       id: "track-1",
 *       title: "노래 제목",
 *       audioUrl: "https://...",
 *       imageUrl: "https://...",
 *       duration: 180,
 *       lyrics: "가사 전체...",
 *       style: "Upbeat indie pop"
 *     }
 *   ],
 *   options: {
 *     maxTracks: 30,
 *     batchSize: 5,
 *     skipDuplicates: true
 *   }
 * }
 */
router.post('/analyze', async (req, res) => {
  try {
    const { tracks, options = {} } = req.body;
    
    // 입력 검증
    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'tracks 배열이 필요합니다.'
      });
    }
    
    console.log(`\n🎯 AI 순위 분석 요청 수신: ${tracks.length}곡`);
    
    // AI 분석 실행
    const result = await rankTracks(tracks, options);
    
    // 성공 응답
    res.json({
      success: true,
      data: result,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ AI 순위 분석 오류:', error);
    
    res.status(500).json({
      success: false,
      error: error.message,
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * GET /api/ranker/health
 * Health check
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    service: 'AI Music Ranker',
    status: 'healthy',
    gemini_api: process.env.GEMINI_API_KEY ? 'configured' : 'missing'
  });
});

module.exports = router;
