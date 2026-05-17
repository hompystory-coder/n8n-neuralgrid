const express = require('express');
const router = express.Router();

// 썸네일 요청 큐 (메모리 기반, 실제로는 Redis 권장)
const thumbnailQueue = new Map();

/**
 * 썸네일 요청 큐에 추가
 */
function addThumbnailRequest(requestId, data) {
  thumbnailQueue.set(requestId, {
    ...data,
    status: 'pending',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  });
  console.log(`✅ Thumbnail request added to queue: ${requestId}`);
  return requestId;
}

/**
 * 썸네일 요청 상태 조회
 */
function getThumbnailRequest(requestId) {
  return thumbnailQueue.get(requestId);
}

/**
 * 썸네일 요청 상태 업데이트
 */
function updateThumbnailRequest(requestId, updates) {
  const existing = thumbnailQueue.get(requestId);
  if (existing) {
    thumbnailQueue.set(requestId, {
      ...existing,
      ...updates,
      updatedAt: new Date().toISOString()
    });
    console.log(`✅ Thumbnail request updated: ${requestId}`, updates);
  }
}

/**
 * POST /api/webhook/suno
 * Suno API 웹훅 엔드포인트
 */
router.post('/suno', async (req, res) => {
  try {
    console.log('📥 Suno webhook received:', JSON.stringify(req.body, null, 2));
    
    // 웹훅 데이터 저장 (나중에 폴링할 때 사용)
    // TODO: 실제로는 Redis나 DB에 저장해야 함
    
    // 200 OK 응답 (Suno API가 재시도하지 않도록)
    res.status(200).json({ 
      success: true,
      message: 'Webhook received' 
    });
    
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * POST /api/webhook/suno-lyrics
 * Suno 가사 생성 웹훅 엔드포인트
 */
router.post('/suno-lyrics', async (req, res) => {
  try {
    console.log('📥 Suno lyrics webhook received:', JSON.stringify(req.body, null, 2));
    
    // 웹훅 데이터 저장
    // TODO: Redis나 DB에 저장하여 폴링 시 사용
    
    // 200 OK 응답
    res.status(200).json({ 
      success: true,
      message: 'Lyrics webhook received' 
    });
    
  } catch (error) {
    console.error('❌ Lyrics webhook error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

/**
 * POST /api/webhook/thumbnail-request
 * 썸네일 생성 요청 웹훅
 */
router.post('/thumbnail-request', async (req, res) => {
  try {
    const { 
      title, 
      style, 
      language = 'korean',
      aiModel = 'genspark'  // 기본값: 'genspark' (AI 어시스턴트 자동) - 'openai' (프록시 미지원), 'replicate' (토큰 필요)
    } = req.body;
    
    if (!title || !style) {
      return res.status(400).json({
        success: false,
        error: 'title and style are required'
      });
    }
    
    // 고유 요청 ID 생성
    const requestId = `thumb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 4가지 프롬프트 생성
    const thumbnailGenerator = require('../services/thumbnailGenerator');
    const { prompts, template, cleanTitle, aspectRatio, model } = thumbnailGenerator.generateThumbnailPrompt(title, style, language);
    
    // 요청 큐에 추가
    addThumbnailRequest(requestId, {
      title,
      cleanTitle,
      style,
      language,
      prompts,
      template,
      aspectRatio,
      model,
      aiModel  // 'openai' 또는 'genspark'
    });
    
    // Socket.IO로 실시간 알림
    const io = req.app.get('io');
    if (io) {
      io.emit('thumbnail-request', {
        requestId,
        title,
        cleanTitle,
        style,
        prompts,
        aiModel
      });
      console.log(`📢 Socket.IO notification sent for: ${requestId} (AI Model: ${aiModel})`);
    }
    
    const modelNames = {
      'genspark': 'GenSpark nano-banana-2 (무료, 수동)',
      'replicate': 'Replicate FLUX Schnell (완전 자동)',
      'openai': 'OpenAI DALL-E 3 (완전 자동)'
    };
    
    res.json({
      success: true,
      requestId,
      cleanTitle,
      prompts,
      template,
      aspectRatio,
      model,
      aiModel,
      aiModelName: modelNames[aiModel] || aiModel,
      message: `4가지 썸네일 버전 생성 대기 중 (${modelNames[aiModel] || aiModel})`,
      pollUrl: `/api/webhook/thumbnail-status/${requestId}`
    });
    
  } catch (error) {
    console.error('❌ Thumbnail request error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/webhook/thumbnail-complete
 * 썸네일 생성 완료 웹훅 (AI 어시스턴트가 호출)
 */
router.post('/thumbnail-complete', async (req, res) => {
  try {
    const { requestId, images, error } = req.body;
    
    if (!requestId) {
      return res.status(400).json({
        success: false,
        error: 'requestId is required'
      });
    }
    
    const request = getThumbnailRequest(requestId);
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }
    
    // 상태 업데이트
    updateThumbnailRequest(requestId, {
      status: error ? 'failed' : 'completed',
      images, // 4가지 이미지 배열
      error,
      completedAt: new Date().toISOString()
    });
    
    // Socket.IO로 실시간 알림
    const io = req.app.get('io');
    if (io) {
      io.emit('thumbnail-complete', {
        requestId,
        status: error ? 'failed' : 'completed',
        images,
        error
      });
      console.log(`📢 Socket.IO completion notification sent for: ${requestId}`);
    }
    
    res.json({
      success: true,
      message: 'Thumbnail completion processed'
    });
    
  } catch (error) {
    console.error('❌ Thumbnail completion error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/webhook/thumbnail-status/:requestId
 * 썸네일 요청 상태 폴링
 */
router.get('/thumbnail-status/:requestId', async (req, res) => {
  try {
    const { requestId } = req.params;
    const request = getThumbnailRequest(requestId);
    
    if (!request) {
      return res.status(404).json({
        success: false,
        error: 'Request not found'
      });
    }
    
    res.json({
      success: true,
      ...request
    });
    
  } catch (error) {
    console.error('❌ Thumbnail status error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * GET /api/webhook/thumbnail-queue
 * 대기 중인 썸네일 요청 목록 (AI 어시스턴트용)
 */
router.get('/thumbnail-queue', async (req, res) => {
  try {
    const pendingRequests = Array.from(thumbnailQueue.entries())
      .filter(([_, data]) => data.status === 'pending')
      .map(([id, data]) => ({ requestId: id, ...data }));
    
    res.json({
      success: true,
      count: pendingRequests.length,
      requests: pendingRequests
    });
    
  } catch (error) {
    console.error('❌ Thumbnail queue error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
