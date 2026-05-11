const express = require('express');
const router = express.Router();
const axios = require('axios');
const { processImageWithText } = require('../services/textOverlay');

/**
 * POST /api/text-overlay/add
 * 이미지 URL에 텍스트 오버레이 추가
 */
router.post('/add', async (req, res) => {
  try {
    const { imageUrl, text, version, template } = req.body;

    if (!imageUrl || !text) {
      return res.status(400).json({
        success: false,
        error: 'imageUrl and text are required'
      });
    }

    console.log(`🎨 텍스트 오버레이 요청: ${text} (version: ${version})`);

    // 이미지 다운로드
    const imageResponse = await axios.get(imageUrl, {
      responseType: 'arraybuffer',
      timeout: 30000
    });

    const imageBuffer = Buffer.from(imageResponse.data);

    // 텍스트 추가 (with_text 버전만)
    const processedBuffer = await processImageWithText(
      imageBuffer,
      text,
      version,
      template
    );

    // Base64로 인코딩하여 반환
    const base64Image = processedBuffer.toString('base64');
    const mimeType = 'image/webp';

    res.json({
      success: true,
      image: `data:${mimeType};base64,${base64Image}`,
      mimeType,
      size: processedBuffer.length
    });

    console.log(`✅ 텍스트 오버레이 완료: ${processedBuffer.length} bytes`);

  } catch (error) {
    console.error('❌ 텍스트 오버레이 에러:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * POST /api/text-overlay/batch
 * 여러 이미지에 일괄 텍스트 추가
 */
router.post('/batch', async (req, res) => {
  try {
    const { images, text, template } = req.body;

    if (!images || !Array.isArray(images) || images.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'images array is required'
      });
    }

    console.log(`🎨 배치 텍스트 오버레이: ${images.length}개 이미지`);

    const results = [];

    for (const img of images) {
      try {
        // 이미지 다운로드
        const imageResponse = await axios.get(img.imageUrl, {
          responseType: 'arraybuffer',
          timeout: 30000
        });

        const imageBuffer = Buffer.from(imageResponse.data);

        // 텍스트 추가 (with_text 버전만)
        const processedBuffer = await processImageWithText(
          imageBuffer,
          text,
          img.version,
          template
        );

        // Base64로 인코딩
        const base64Image = processedBuffer.toString('base64');
        const mimeType = 'image/webp';

        results.push({
          version: img.version,
          label: img.label,
          image: `data:${mimeType};base64,${base64Image}`,
          imageUrl: img.imageUrl, // 원본 URL 유지
          width: img.width,
          height: img.height,
          hasText: img.version.includes('with_text')
        });

        console.log(`✅ [${results.length}/${images.length}] ${img.label} 완료`);

      } catch (error) {
        console.error(`❌ ${img.label} 실패:`, error.message);
        // 실패한 경우 원본 이미지 유지
        results.push({
          ...img,
          error: error.message,
          hasText: false
        });
      }
    }

    res.json({
      success: true,
      count: results.length,
      images: results
    });

    console.log(`✅ 배치 처리 완료: ${results.length}개`);

  } catch (error) {
    console.error('❌ 배치 텍스트 오버레이 에러:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
