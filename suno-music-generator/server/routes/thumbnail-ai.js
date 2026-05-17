/**
 * 🎨 AI 어시스턴트 연동 썸네일 생성
 * 
 * 이 파일은 개념적 설계입니다.
 * 실제 구현을 위해서는 GenSpark AI API와의 통합이 필요합니다.
 */

const express = require('express');
const router = express.Router();

/**
 * 📝 썸네일 생성 요청 큐
 * AI 어시스턴트가 주기적으로 확인하여 처리
 */
const thumbnailQueue = new Map();

/**
 * 🎨 썸네일 생성 요청 (비동기)
 * 
 * 워크플로우:
 * 1. 웹사이트가 썸네일 요청
 * 2. 서버가 큐에 추가하고 taskId 반환
 * 3. AI 어시스턴트가 큐를 폴링
 * 4. AI가 이미지 생성
 * 5. AI가 결과를 서버에 업데이트
 * 6. 웹사이트가 taskId로 결과 조회
 */
router.post('/request-thumbnail', async (req, res) => {
  try {
    const { title, style, language = 'korean' } = req.body;
    
    if (!title || !style) {
      return res.status(400).json({ 
        success: false, 
        error: '제목과 스타일이 필요합니다.' 
      });
    }
    
    // 썸네일 생성 모듈로 프롬프트 생성
    const thumbnailGenerator = require('../services/thumbnailGenerator');
    const { prompt, template, aspectRatio, model } = 
      thumbnailGenerator.generateThumbnailPrompt(title, style, language);
    
    // 태스크 ID 생성
    const taskId = `thumb_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    // 큐에 추가
    thumbnailQueue.set(taskId, {
      taskId,
      title,
      style,
      language,
      prompt,
      template,
      aspectRatio,
      model,
      status: 'pending',
      createdAt: new Date(),
      result: null
    });
    
    console.log(`🎨 썸네일 생성 요청 추가: ${taskId}`);
    console.log(`   큐 크기: ${thumbnailQueue.size}`);
    
    // 즉시 taskId 반환 (비동기 처리)
    res.json({
      success: true,
      taskId,
      status: 'pending',
      message: '썸네일 생성이 큐에 추가되었습니다. AI가 처리 중입니다.',
      pollUrl: `/api/thumbnail-ai/status/${taskId}`
    });
    
  } catch (error) {
    console.error('❌ 썸네일 요청 실패:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * 📊 썸네일 생성 상태 조회
 */
router.get('/status/:taskId', (req, res) => {
  const { taskId } = req.params;
  const task = thumbnailQueue.get(taskId);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      error: '해당 작업을 찾을 수 없습니다.'
    });
  }
  
  res.json({
    success: true,
    taskId: task.taskId,
    status: task.status,
    createdAt: task.createdAt,
    result: task.result
  });
});

/**
 * 📥 AI 어시스턴트가 큐에서 작업 가져오기
 * (폴링 엔드포인트)
 */
router.get('/queue/next', (req, res) => {
  // pending 상태인 첫 번째 작업 찾기
  for (const [taskId, task] of thumbnailQueue.entries()) {
    if (task.status === 'pending') {
      // 상태를 processing으로 변경
      task.status = 'processing';
      task.startedAt = new Date();
      
      console.log(`🎨 AI에게 작업 전달: ${taskId}`);
      
      return res.json({
        success: true,
        task: {
          taskId: task.taskId,
          prompt: task.prompt,
          aspectRatio: task.aspectRatio,
          model: task.model,
          title: task.title,
          style: task.style
        }
      });
    }
  }
  
  // 대기 중인 작업 없음
  res.json({
    success: true,
    task: null,
    message: '대기 중인 작업이 없습니다.'
  });
});

/**
 * ✅ AI 어시스턴트가 생성 결과 업데이트
 */
router.post('/queue/complete', (req, res) => {
  const { taskId, imageUrl, error } = req.body;
  
  const task = thumbnailQueue.get(taskId);
  
  if (!task) {
    return res.status(404).json({
      success: false,
      error: '해당 작업을 찾을 수 없습니다.'
    });
  }
  
  if (imageUrl) {
    // 성공
    task.status = 'completed';
    task.result = {
      imageUrl,
      completedAt: new Date()
    };
    console.log(`✅ 썸네일 생성 완료: ${taskId}`);
    console.log(`   이미지 URL: ${imageUrl}`);
  } else if (error) {
    // 실패
    task.status = 'failed';
    task.result = {
      error,
      failedAt: new Date()
    };
    console.log(`❌ 썸네일 생성 실패: ${taskId}`);
    console.log(`   에러: ${error}`);
  }
  
  res.json({
    success: true,
    message: '결과가 업데이트되었습니다.'
  });
});

/**
 * 🧹 완료된 작업 정리 (주기적 실행)
 */
function cleanupCompletedTasks() {
  const oneHourAgo = Date.now() - 3600000;
  
  for (const [taskId, task] of thumbnailQueue.entries()) {
    if (task.status === 'completed' || task.status === 'failed') {
      if (new Date(task.createdAt).getTime() < oneHourAgo) {
        thumbnailQueue.delete(taskId);
        console.log(`🧹 오래된 작업 삭제: ${taskId}`);
      }
    }
  }
}

// 1시간마다 정리
setInterval(cleanupCompletedTasks, 3600000);

module.exports = router;
