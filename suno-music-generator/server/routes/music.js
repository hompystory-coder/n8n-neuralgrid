const express = require('express');
const router = express.Router();
const { addJob, addBatchJobs } = require('../services/queueService');
const MusicJob = require('../models/MusicJob');
const sunoClient = require('../services/sunoClient');
const AudioAnalyzer = require('../services/audioAnalyzer'); // 🆕 추가
const audioAnalyzer = new AudioAnalyzer(); // 🆕 추가

// 스타일 라우터에서 생성된 메타데이터 가져오기
let generatedMusicMetadata = null;
try {
  const styleRouter = require('./style');
  generatedMusicMetadata = styleRouter.generatedMusicMetadata;
} catch (err) {
  console.log('⚠️ Style router metadata not available yet');
}

/**
 * POST /api/music/lyrics
 * Generate lyrics only
 */
router.post('/lyrics', async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({ 
        error: 'Prompt is required' 
      });
    }

    console.log('📝 Generating lyrics for:', prompt);

    // Suno API로 가사 생성 (직접 호출, 큐 사용 안함)
    const result = await sunoClient.generateLyrics({
      prompt,
      callBackUrl: '' // 웹훅 없이 폴링으로 처리
    });

    if (!result.success) {
      return res.status(500).json({ 
        error: result.error?.message || 'Lyrics generation failed' 
      });
    }

    // taskId 반환
    res.json({
      success: true,
      taskId: result.taskId,
      message: 'Lyrics generation started'
    });

  } catch (error) {
    console.error('Lyrics generation error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/music/lyrics/:taskId
 * Get lyrics generation status
 */
router.get('/lyrics/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    const result = await sunoClient.getTaskStatus(taskId);

    if (!result.success) {
      return res.status(500).json({ 
        error: result.error?.message || 'Status check failed' 
      });
    }

    res.json({
      success: true,
      status: result.status,
      lyrics: result.response?.data?.[0]?.text || null,
      data: result.data
    });

  } catch (error) {
    console.error('Lyrics status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * POST /api/music/generate
 * Generate a single song
 */
router.post('/generate', async (req, res) => {
  try {
    const { prompt, style, duration, title, lyrics, instrumental, model, customMode } = req.body;

    if (!prompt && !lyrics) {
      return res.status(400).json({ 
        success: false,
        error: 'Prompt or lyrics is required' 
      });
    }

    console.log('🎵 Generating music:', {
      title,
      style,
      hasPrompt: !!prompt,
      hasLyrics: !!lyrics,
      model: model || 'V5'
    });

    // Suno API 직접 호출 (큐 대신)
    const callbackBaseUrl = process.env.PUBLIC_URL || process.env.CALLBACK_BASE_URL || 'http://localhost:5000';
    const sunoParams = {
      customMode: customMode !== undefined ? customMode : true,
      model: model || 'V5',
      prompt: lyrics || prompt,  // 🔥 가사를 prompt에 넣기
      style: style || prompt || 'pop',  // 🔥 스타일 설정
      title: title || 'Untitled Song',
      instrumental: instrumental || false,
      callBackUrl: `${callbackBaseUrl}/api/webhook/suno` // 실제 웹훅 URL
    };

    const result = await sunoClient.generateMusic(sunoParams);

    if (!result.success) {
      // 크레딧 부족 시 데모 모드로 전환
      if (result.error?.message?.includes('insufficient') || 
          result.error?.message?.includes('credits')) {
        console.log('⚠️ 크레딧 부족 - 데모 모드 활성화');
        
        // 데모 Task ID 생성
        const demoTaskId = 'DEMO_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        
        return res.json({
          success: true,
          taskId: demoTaskId,
          data: { taskId: demoTaskId },
          message: 'Demo mode: Music generation started',
          isDemo: true
        });
      }
      
      return res.status(500).json({ 
        success: false,
        error: result.error?.message || 'Music generation failed' 
      });
    }

    res.json({
      success: true,
      taskId: result.taskId,
      data: result.data,
      message: 'Music generation started'
    });

    // 🎬 음악 생성 후 유튜브 메타데이터 자동 생성 (비동기, 에러 무시)
    try {
      const youtubeMetadataGenerator = require('../services/youtubeMetadataGenerator');
      const metadata = await youtubeMetadataGenerator.generate({
        title: title || 'Untitled Song',
        lyrics: lyrics || prompt,
        style: style || prompt || 'pop',
        genre: style ? style.split(',')[0].trim() : 'pop',
        mood: 'chill',
        bpm: 120
      });
      console.log('✅ 유튜브 메타데이터 자동 생성:', metadata.title);
    } catch (metaError) {
      console.warn('⚠️ 유튜브 메타데이터 생성 실패 (무시):', metaError.message);
    }

  } catch (error) {
    console.error('Generate error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * POST /api/music/batch
 * Generate multiple songs in batch
 */
router.post('/batch', async (req, res) => {
  try {
    const { requests } = req.body;

    if (!Array.isArray(requests) || requests.length === 0) {
      return res.status(400).json({ 
        error: 'Requests array is required' 
      });
    }

    if (requests.length > 50) {
      return res.status(400).json({ 
        error: 'Maximum 50 songs per batch' 
      });
    }

    const userId = req.headers['x-user-id'] || 'anonymous';
    const results = await addBatchJobs(requests, userId);

    const successCount = results.filter(r => r.success).length;
    const failCount = results.length - successCount;

    res.json({
      success: true,
      message: `Queued ${successCount} jobs, ${failCount} failed`,
      results
    });

  } catch (error) {
    console.error('Batch generate error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/music/history
 * Get user's music generation history
 */
router.get('/history', async (req, res) => {
  try {
    const userId = req.headers['x-user-id'] || 'anonymous';
    const limit = parseInt(req.query.limit) || 20;
    const skip = parseInt(req.query.skip) || 0;

    const jobs = await MusicJob.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()
      .catch(() => []);

    const total = await MusicJob.countDocuments({ userId }).catch(() => 0);

    res.json({
      success: true,
      jobs,
      total,
      limit,
      skip
    });

  } catch (error) {
    console.error('History error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/music/:jobId
 * Get specific job details
 */
router.get('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;

    const job = await MusicJob.findOne({ jobId }).lean().catch(() => null);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    res.json({
      success: true,
      job
    });

  } catch (error) {
    console.error('Get job error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * DELETE /api/music/:jobId
 * Delete a job (cancel if not completed)
 */
router.delete('/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const userId = req.headers['x-user-id'] || 'anonymous';

    const job = await MusicJob.findOne({ jobId, userId }).catch(() => null);

    if (!job) {
      return res.status(404).json({ error: 'Job not found' });
    }

    if (job.status === 'processing') {
      return res.status(400).json({ error: 'Cannot delete job in progress' });
    }

    // Delete audio file if exists
    if (job.audioUrl) {
      const fs = require('fs').promises;
      const path = require('path');
      const filepath = path.join(__dirname, '../../storage', job.audioUrl);
      await fs.unlink(filepath).catch(() => {});
    }

    await MusicJob.deleteOne({ jobId }).catch(() => {});

    res.json({
      success: true,
      message: 'Job deleted'
    });

  } catch (error) {
    console.error('Delete job error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/music/status/:taskId
 * Get music generation status
 */
router.get('/status/:taskId', async (req, res) => {
  try {
    const { taskId } = req.params;

    console.log('📊 Checking status for taskId:', taskId);

    // 데모 모드 감지
    if (taskId.startsWith('DEMO_')) {
      console.log('🎭 데모 모드: 샘플 음악 반환');
      
      // 샘플 음악 반환 (실제로는 이미 생성된 음악의 URL)
      return res.json({
        success: true,
        status: 'completed',
        data: {
          title: req.query.title || 'Demo Music',
          audioUrl: 'https://cdn1.suno.ai/f8c208e2-30cc-43f8-bbff-257bb7c52424.mp3',
          imageUrl: 'https://cdn2.suno.ai/image_f8c208e2-30cc-43f8-bbff-257bb7c52424.jpeg',
          duration: 44.8,
          model: 'V5',
          prompt: '데모 모드 - Suno API 크레딧이 부족하여 샘플 음악을 제공합니다.',
          tags: 'demo, sample, emotional-ballad',
          isDemo: true
        }
      });
    }

    const result = await sunoClient.getTaskStatus(taskId);

    if (!result.success) {
      return res.status(500).json({ 
        success: false,
        error: result.error?.message || 'Status check failed' 
      });
    }

    // 상태 매핑
    let status = 'generating';
    let data = null;

    if (result.data) {
      // Suno API 응답 구조에 따라 조정
      if (result.data.status === 'SUCCESS' || result.data.status === 'complete') {
        status = 'completed';
        
        // sunoData 배열에서 첫 번째 (또는 가장 긴) 음악 선택
        const sunoData = result.data.response?.sunoData || [];
        if (sunoData.length > 0) {
          // 가장 긴 음악 선택 (보통 더 완성도가 높음)
          const selectedTrack = sunoData.reduce((prev, curr) => 
            (curr.duration > prev.duration) ? curr : prev
          );
          
          // 저장된 메타데이터 가져오기
          const metadata = generatedMusicMetadata?.get?.(taskId) || {};
          console.log(`📋 메타데이터 확인:`, metadata ? '있음' : '없음');
          
          data = {
            title: metadata.title || selectedTrack.title,
            audioUrl: selectedTrack.audioUrl || selectedTrack.sourceAudioUrl,
            imageUrl: selectedTrack.sourceImageUrl || selectedTrack.imageUrl, // 고해상도 원본 우선
            imageLargeUrl: selectedTrack.sourceImageUrl || selectedTrack.imageUrl, // 동일하게 원본 사용
            duration: selectedTrack.duration,
            model: selectedTrack.modelName || 'V5',
            // 추가 정보
            prompt: selectedTrack.prompt,
            tags: selectedTrack.tags,
            lyrics: metadata.lyrics || selectedTrack.lyrics || selectedTrack.lyric || '',
            // 모든 트랙 정보 포함 (가사와 제목 모두 포함)
            allTracks: sunoData.map(track => ({
              id: track.id,
              title: track.title || metadata.title, // 🔧 Suno 생성 제목 우선, fallback만 metadata
              audioUrl: track.audioUrl || track.sourceAudioUrl,
              imageUrl: track.sourceImageUrl || track.imageUrl, // 고해상도 원본 우선
              imageLargeUrl: track.sourceImageUrl || track.imageUrl, // 동일하게 원본 사용
              duration: track.duration,
              model: track.modelName || 'V5',
              prompt: track.prompt,
              tags: track.tags,
              lyrics: metadata.lyrics || track.lyrics || track.lyric || ''
            }))
          };
        } else {
          // fallback: 직접 데이터 사용
          data = {
            title: result.data.title,
            audioUrl: result.data.audio_url || result.data.audioUrl,
            imageUrl: result.data.source_image_url || result.data.sourceImageUrl || result.data.image_url || result.data.imageUrl, // 고해상도 원본 우선
            imageLargeUrl: result.data.source_image_url || result.data.sourceImageUrl || result.data.image_url || result.data.imageUrl, // 동일하게 원본 사용
            duration: result.data.duration,
            model: result.data.model || 'V5'
          };
        }
      } else if (result.data.status === 'FAILED' || result.data.status === 'failed' || result.data.status === 'GENERATE_AUDIO_FAILED') {
        status = 'failed';
      } else if (result.data.status === 'PROCESSING' || result.data.status === 'processing') {
        status = 'processing';
      } else if (result.data.status === 'QUEUED' || result.data.status === 'queue') {
        status = 'queue';
      }
    }

    res.json({
      success: true,
      status,
      data,
      raw: result.data
    });

  } catch (error) {
    console.error('Status check error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * POST /api/music/upload-audio
 * Upload audio file and generate music with style matching
 */
const multer = require('multer');
const upload = multer({ 
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 10 * 1024 * 1024 // 10MB
  },
  fileFilter: (req, file, cb) => {
    // 오디오 파일만 허용
    if (file.mimetype.startsWith('audio/')) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed'));
    }
  }
});

router.post('/upload-audio', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file provided'
      });
    }

    console.log('🎵 Analyzing audio with OpenAI:', req.file.originalname);
    console.log(`   File size: ${(req.file.size / 1024 / 1024).toFixed(2)} MB`);
    console.log(`   MIME type: ${req.file.mimetype}`);

    // OpenAI로 오디오 스타일 분석
    const analysisResult = await audioAnalyzer.analyzeAudioStyle(
      req.file.buffer,
      req.file.mimetype
    );

    if (!analysisResult.success) {
      console.warn('⚠️ Analysis failed, using fallback tags');
      return res.json({
        success: true,
        tags: analysisResult.fallbackTags || 'Contemporary music, diverse instrumentation',
        analysis: null,
        fallback: true,
        message: 'Audio analyzed with fallback (OpenAI unavailable)'
      });
    }

    console.log('✅ Audio analysis complete!');
    console.log('🎨 Generated tags:', analysisResult.tags);

    res.json({
      success: true,
      tags: analysisResult.tags,
      analysis: analysisResult.analysis,
      message: 'Audio analyzed successfully'
    });

  } catch (error) {
    console.error('❌ Upload-audio error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Audio analysis failed'
    });
  }
});


/**
 * POST /api/music/extract-style
 * Extract style code from generated music and save it
 */
router.post('/extract-style', async (req, res) => {
  try {
    const { taskId, styleName, description } = req.body;

    if (!taskId) {
      return res.status(400).json({
        success: false,
        error: 'TaskId is required'
      });
    }

    console.log('🎨 Extracting style from task:', taskId);

    // 1. 작업 상태 확인
    const statusResult = await sunoClient.getTaskStatus(taskId);

    if (!statusResult.success) {
      return res.status(500).json({
        success: false,
        error: 'Failed to get task status'
      });
    }

    if (statusResult.status !== 'SUCCESS') {
      return res.status(400).json({
        success: false,
        error: 'Task is not completed yet',
        status: statusResult.status
      });
    }

    // 2. 생성된 음악 데이터에서 스타일 추출
    const sunoData = statusResult.response?.sunoData?.[0];
    if (!sunoData) {
      return res.status(404).json({
        success: false,
        error: 'No music data found'
      });
    }

    // 3. 스타일 코드 생성
    const styleCode = {
      name: styleName || `Style_${Date.now()}`,
      description: description || 'Extracted from uploaded audio',
      tags: sunoData.tags || '',
      modelName: sunoData.modelName || 'chirp-crow',
      sourceTaskId: taskId,
      sourceAudioId: sunoData.id,
      createdAt: new Date().toISOString(),
      // 추가 메타데이터
      originalTitle: sunoData.title,
      duration: sunoData.duration
    };

    console.log('✅ Style extracted:', styleCode);

    // 4. 스타일 저장 (나중에 DB에 저장할 수 있음)
    // TODO: DB에 저장하는 로직 추가

    res.json({
      success: true,
      styleCode,
      message: 'Style extracted successfully'
    });

  } catch (error) {
    console.error('Extract style error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
