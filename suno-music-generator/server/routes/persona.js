const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const router = express.Router();
const sunoClient = require('../services/sunoClient');
const axios = require('axios');

// 업로드 디렉토리 설정
const UPLOAD_DIR = path.join(__dirname, '../temp/uploads');

// multer 설정 (메모리 스토리지 사용)
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    try {
      await fs.mkdir(UPLOAD_DIR, { recursive: true });
      cb(null, UPLOAD_DIR);
    } catch (error) {
      cb(error);
    }
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, `audio-${uniqueSuffix}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|m4a|ogg|flac|mpeg|audio/i;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);

    // 확장자 또는 MIME 타입 중 하나라도 맞으면 허용
    if (mimetype || extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  }
});

/**
 * POST /api/persona/upload-and-analyze
 * 음악 파일 업로드 & 보컬 스타일 분석
 */
router.post('/upload-and-analyze', upload.single('audio'), async (req, res) => {
  let tempFilePath = null;
  
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file uploaded'
      });
    }

    tempFilePath = req.file.path;
    console.log('📤 Audio file uploaded:', req.file.filename);

    // 파일을 공개 URL로 변환
    // 샌드박스 공개 URL 사용
    const fileUrl = `https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/uploads/${req.file.filename}`;

    // Step 1: Upload & Cover로 음악 생성
    console.log('🎸 Step 1: Uploading to Suno and creating cover...');
    const coverResult = await sunoClient.uploadAndCover({
      uploadUrl: fileUrl,
      model: 'V5',
      customMode: true,
      instrumental: false,
      prompt: req.body.prompt || 'Analyze this music for vocal characteristics',
      style: req.body.style || 'original',
      title: req.body.title || 'Uploaded Audio Analysis',
      callBackUrl: `${process.env.PUBLIC_URL || process.env.BASE_URL || 'http://localhost:5000'}/api/webhook/suno`
    });

    if (!coverResult.success) {
      throw new Error(coverResult.error?.message || 'Upload and cover failed');
    }

    console.log('✅ Cover created:', coverResult.taskId);

    // Step 2: 작업 완료 대기
    console.log('⏳ Waiting for cover generation to complete...');
    const completedTask = await sunoClient.waitForCompletion(coverResult.taskId, 300000, 10000);

    if (!completedTask.success || completedTask.status !== 'SUCCESS') {
      throw new Error('Cover generation did not complete successfully');
    }

    // audioId 추출
    const audioData = completedTask.response || completedTask.data?.response;
    if (!audioData || !Array.isArray(audioData) || audioData.length === 0) {
      throw new Error('No audio data returned from cover generation');
    }

    const audioId = audioData[0].id;
    console.log('✅ Audio generated:', audioId);

    // 임시 파일 삭제
    try {
      await fs.unlink(tempFilePath);
      console.log('🗑️ Temporary file deleted');
    } catch (err) {
      console.warn('⚠️ Could not delete temp file:', err.message);
    }

    res.json({
      success: true,
      message: 'Audio uploaded and analyzed successfully',
      data: {
        taskId: coverResult.taskId,
        audioId: audioId,
        audioData: audioData[0]
      }
    });

  } catch (error) {
    console.error('❌ Upload and analyze error:', error);
    
    // 임시 파일 삭제
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (err) {
        // 무시
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload and analyze audio'
    });
  }
});

/**
 * POST /api/persona/create
 * 페르소나 생성 (이미 생성된 음악에서)
 */
router.post('/create', async (req, res) => {
  try {
    const { taskId, audioId, name, description, vocalStart, vocalEnd, style } = req.body;

    if (!taskId || !audioId || !name || !description) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: taskId, audioId, name, description'
      });
    }

    console.log('🎤 Creating persona:', { taskId, audioId, name });

    const result = await sunoClient.createPersona({
      taskId,
      audioId,
      name,
      description,
      vocalStart: vocalStart || 0,
      vocalEnd: vocalEnd || 30,
      style
    });

    if (!result.success) {
      throw new Error(result.error?.message || 'Persona creation failed');
    }

    res.json({
      success: true,
      message: 'Persona created successfully',
      data: {
        personaId: result.personaId,
        ...result.data
      }
    });

  } catch (error) {
    console.error('❌ Persona creation error:', error);
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create persona'
    });
  }
});

/**
 * POST /api/persona/full-workflow
 * 전체 워크플로우: 업로드 → 분석 → 페르소나 생성
 */
router.post('/full-workflow', upload.single('audio'), async (req, res) => {
  let tempFilePath = null;

  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        error: 'No audio file uploaded'
      });
    }

    const { personaName, personaDescription, vocalStart, vocalEnd, style } = req.body;

    if (!personaName || !personaDescription) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: personaName, personaDescription'
      });
    }

    tempFilePath = req.file.path;
    console.log('📤 Starting full persona workflow:', req.file.filename);

    // 파일 URL 생성 (샌드박스 공개 URL)
    const fileUrl = `https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/uploads/${req.file.filename}`;

    // Step 1: Upload & Cover
    console.log('🎸 Step 1/3: Uploading to Suno...');
    const coverResult = await sunoClient.uploadAndCover({
      uploadUrl: fileUrl,
      model: 'V5',
      customMode: true,
      instrumental: false,
      prompt: personaDescription,
      style: style || 'original',
      title: personaName,
      callBackUrl: `${process.env.PUBLIC_URL || process.env.BASE_URL || 'http://localhost:5000'}/api/webhook/suno`
    });

    if (!coverResult.success) {
      throw new Error(coverResult.error?.message || 'Upload failed');
    }

    // Step 2: 완료 대기
    console.log('⏳ Step 2/3: Waiting for generation to complete...');
    const completedTask = await sunoClient.waitForCompletion(coverResult.taskId, 300000, 10000);

    if (!completedTask.success || completedTask.status !== 'SUCCESS') {
      throw new Error('Generation did not complete successfully');
    }

    // 실제 Suno API 응답 구조: data.response.sunoData 배열
    const sunoData = completedTask.data?.response?.sunoData;
    
    if (!sunoData || !Array.isArray(sunoData) || sunoData.length === 0) {
      console.error('❌ No audio data found. Full task:', JSON.stringify(completedTask, null, 2));
      throw new Error('No audio data returned from Suno API');
    }

    // 첫 번째 오디오의 ID 사용
    const audioId = sunoData[0].id;
    console.log('✅ Audio generated:', audioId);

    // Step 3: 페르소나 생성
    console.log('🎤 Step 3/3: Creating persona...');
    const personaResult = await sunoClient.createPersona({
      taskId: coverResult.taskId,
      audioId: audioId,
      name: personaName,
      description: personaDescription,
      vocalStart: vocalStart ? parseInt(vocalStart) : 0,
      vocalEnd: vocalEnd ? parseInt(vocalEnd) : 30,
      style: style
    });

    if (!personaResult.success) {
      throw new Error(personaResult.error?.message || 'Persona creation failed');
    }

    console.log('✅ Persona created:', personaResult.personaId);

    // 임시 파일 삭제
    try {
      await fs.unlink(tempFilePath);
    } catch (err) {
      console.warn('⚠️ Could not delete temp file:', err.message);
    }

    res.json({
      success: true,
      message: 'Persona created successfully from uploaded audio',
      data: {
        taskId: coverResult.taskId,
        audioId: audioId,
        personaId: personaResult.personaId,
        audioData: audioData[0],
        personaData: personaResult.data
      }
    });

  } catch (error) {
    console.error('❌ Full workflow error:', error);

    // 임시 파일 삭제
    if (tempFilePath) {
      try {
        await fs.unlink(tempFilePath);
      } catch (err) {
        // 무시
      }
    }

    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create persona from uploaded audio'
    });
  }
});

module.exports = router;
