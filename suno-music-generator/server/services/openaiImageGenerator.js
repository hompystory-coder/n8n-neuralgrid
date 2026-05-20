/**
 * 🤖 OpenAI DALL-E 3 이미지 생성 서비스
 * 완전 자동으로 4개의 썸네일을 생성합니다
 */

const OpenAI = require('openai');
require('dotenv').config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

/**
 * DALL-E 3로 단일 이미지 생성
 */
async function generateSingleImage(prompt, options = {}) {
  const {
    size = '1792x1024', // 16:9 aspect ratio (가장 가까운 사이즈)
    quality = 'standard', // 'standard' or 'hd'
    style = 'vivid' // 'vivid' or 'natural'
  } = options;

  try {
    console.log(`🎨 [DALL-E 3] 이미지 생성 시작...`);
    console.log(`   크기: ${size}, 품질: ${quality}, 스타일: ${style}`);
    
    const response = await openai.images.generate({
      model: 'dall-e-3',
      prompt: prompt,
      n: 1,
      size: size,
      quality: quality,
      style: style
    });

    const imageUrl = response.data[0].url;
    const revisedPrompt = response.data[0].revised_prompt;

    console.log(`✅ [DALL-E 3] 이미지 생성 완료!`);
    console.log(`   URL: ${imageUrl}`);

    return {
      success: true,
      imageUrl: imageUrl,
      revisedPrompt: revisedPrompt,
      width: size === '1792x1024' ? 1792 : 1024,
      height: size === '1792x1024' ? 1024 : 1792
    };
  } catch (error) {
    console.error(`❌ [DALL-E 3] 생성 실패:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * DALL-E 3로 4개 썸네일 동시 생성
 */
async function generateMultipleThumbnails(prompts, options = {}) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 [DALL-E 3] 4개 썸네일 생성 시작`);
  console.log(`${'='.repeat(70)}\n`);

  const results = [];
  const errors = [];

  // 순차적으로 생성 (DALL-E 3는 병렬 요청 제한이 있음)
  for (let i = 0; i < prompts.length; i++) {
    const promptData = prompts[i];
    console.log(`\n[${i + 1}/4] ${promptData.label} 생성 중...`);
    
    try {
      const result = await generateSingleImage(promptData.prompt, options);
      
      if (result.success) {
        results.push({
          version: promptData.version,
          label: promptData.label,
          imageUrl: result.imageUrl,
          imageUrlNoWatermark: result.imageUrl, // DALL-E는 워터마크 없음
          width: result.width,
          height: result.height,
          revisedPrompt: result.revisedPrompt
        });
        console.log(`✅ [${i + 1}/4] ${promptData.label} 완료`);
      } else {
        errors.push({
          version: promptData.version,
          label: promptData.label,
          error: result.error
        });
        console.log(`❌ [${i + 1}/4] ${promptData.label} 실패: ${result.error}`);
      }
    } catch (error) {
      errors.push({
        version: promptData.version,
        label: promptData.label,
        error: error.message
      });
      console.log(`❌ [${i + 1}/4] ${promptData.label} 오류: ${error.message}`);
    }

    // API Rate Limit 방지 (약간의 딜레이)
    if (i < prompts.length - 1) {
      console.log(`⏳ 다음 이미지 생성을 위해 2초 대기...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`✅ [DALL-E 3] 생성 완료`);
  console.log(`   성공: ${results.length}/4`);
  console.log(`   실패: ${errors.length}/4`);
  console.log(`${'='.repeat(70)}\n`);

  return {
    success: results.length > 0,
    results: results,
    errors: errors,
    totalGenerated: results.length,
    totalFailed: errors.length
  };
}

/**
 * DALL-E 프롬프트 최적화 (최대 4000자로 제한)
 */
function optimizePromptForDallE(prompt) {
  // DALL-E 3는 최대 4000자까지 허용
  if (prompt.length > 3900) {
    return prompt.substring(0, 3900) + '...';
  }
  return prompt;
}

module.exports = {
  generateSingleImage,
  generateMultipleThumbnails,
  optimizePromptForDallE
};
