/**
 * 🔥 인기 차트 API 라우트
 */

const express = require('express');
const router = express.Router();
const chartCrawler = require('../services/chartCrawler');

/**
 * GET /api/charts
 * 
 * 차트 데이터 조회 (캐시 우선)
 */
router.get('/', async (req, res) => {
    try {
        console.log('📊 차트 데이터 요청');
        
        const charts = await chartCrawler.getCharts();
        
        res.json({
            success: true,
            data: charts
        });
        
    } catch (error) {
        console.error('차트 조회 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/charts/update
 * 
 * 수동으로 차트 업데이트 (관리자용)
 */
router.post('/update', async (req, res) => {
    try {
        console.log('🔄 차트 수동 업데이트 요청');
        
        // 강제 업데이트
        const charts = await chartCrawler.updateCharts();
        
        res.json({
            success: true,
            message: '차트가 업데이트되었습니다',
            data: charts
        });
        
    } catch (error) {
        console.error('차트 업데이트 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * GET /api/charts/genre/:genre
 * 
 * 특정 장르의 차트만 조회
 */
router.get('/genre/:genre', async (req, res) => {
    try {
        const { genre } = req.params;
        console.log(`📊 ${genre} 장르 차트 요청`);
        
        const charts = await chartCrawler.getCharts();
        
        if (!charts.charts[genre]) {
            return res.status(404).json({
                success: false,
                error: '해당 장르를 찾을 수 없습니다'
            });
        }
        
        res.json({
            success: true,
            data: {
                genre,
                songs: charts.charts[genre],
                lastUpdated: charts.lastUpdated
            }
        });
        
    } catch (error) {
        console.error('장르별 차트 조회 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

/**
 * POST /api/charts/lyrics
 * 
 * 선택된 곡들의 가사 추출 (Genius API)
 * 
 * Body: {
 *   songs: [
 *     { title: "소문의 낙원", artist: "AKMU" },
 *     { title: "RUDE!", artist: "Hearts2Hearts" }
 *   ]
 * }
 */
router.post('/lyrics', async (req, res) => {
    try {
        const { songs } = req.body;
        
        if (!songs || !Array.isArray(songs)) {
            return res.status(400).json({
                success: false,
                error: '곡 목록이 필요합니다'
            });
        }
        
        console.log(`🎵 ${songs.length}개 곡의 가사 추출 요청`);
        
        // 가사 추출 (병렬 처리)
        const lyricsResults = await Promise.all(
            songs.map(async (song) => {
                try {
                    const lyrics = await chartCrawler.getLyrics(song.title, song.artist);
                    return {
                        title: song.title,
                        artist: song.artist,
                        lyrics: lyrics,
                        success: lyrics !== null
                    };
                } catch (error) {
                    console.error(`가사 추출 실패: ${song.title}`, error.message);
                    return {
                        title: song.title,
                        artist: song.artist,
                        lyrics: null,
                        success: false,
                        error: error.message
                    };
                }
            })
        );
        
        const successCount = lyricsResults.filter(r => r.success).length;
        console.log(`✅ ${successCount}/${songs.length}개 가사 추출 완료`);
        
        res.json({
            success: true,
            data: lyricsResults,
            summary: {
                total: songs.length,
                success: successCount,
                failed: songs.length - successCount
            }
        });
        
    } catch (error) {
        console.error('가사 추출 오류:', error);
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
});

module.exports = router;
