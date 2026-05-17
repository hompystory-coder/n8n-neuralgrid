/**
 * 🎨 Replicate 이미지 생성 서비스
 * DALL-E 대신 Stable Diffusion 또는 Flux 모델 사용
 */

const Replicate = require('replicate');
require('dotenv').config();

const replicate = new Replicate({
  auth: process.env.REPLICATE_API_TOKEN
});

/**
 * Replicate로 단일 이미지 생성
 * Flux Dev 모델 사용 - 빠르고 고품질
 */
async function generateSingleImage(prompt, options = {}) {
  const {
    width = 1792,
    height = 1024,
    num_outputs = 1,
    guidance_scale = 7.5,
    num_inference_steps = 50
  } = options;

  try {
    console.log(`🎨 [Replicate Flux] 이미지 생성 시작...`);
    console.log(`   크기: ${width}x${height}`);
    console.log(`   프롬프트: ${prompt.substring(0, 100)}...`);
    
    // Flux Dev 모델 사용 (빠르고 안정적)
    const output = await replicate.run(
      "black-forest-labs/flux-dev",
      {
        input: {
          prompt: prompt,
          width: width,
          height: height,
          num_outputs: num_outputs,
          guidance_scale: guidance_scale,
          num_inference_steps: num_inference_steps,
          output_format: "png",
          output_quality: 90
        }
      }
    );

    // output은 배열 또는 FileOutput 객체로 반환됨
    let imageUrl;
    if (Array.isArray(output)) {
      imageUrl = output[0];
    } else {
      imageUrl = output;
    }
    
    // FileOutput 객체인 경우 toString()으로 URL 추출
    if (typeof imageUrl === 'object' && imageUrl !== null) {
      imageUrl = imageUrl.toString();
    }

    console.log(`✅ [Replicate Flux] 이미지 생성 완료!`);
    console.log(`   URL: ${imageUrl}`);

    return {
      success: true,
      imageUrl: imageUrl,
      revisedPrompt: prompt, // Replicate는 프롬프트를 수정하지 않음
      width: width,
      height: height
    };
  } catch (error) {
    console.error(`❌ [Replicate Flux] 생성 실패:`, error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Replicate로 여러 썸네일 동시 생성
 */
async function generateMultipleThumbnails(prompts, options = {}) {
  console.log(`\n${'='.repeat(70)}`);
  console.log(`🚀 [Replicate Flux] ${prompts.length}개 썸네일 생성 시작`);
  console.log(`${'='.repeat(70)}\n`);

  const results = [];
  const errors = [];

  // 순차적으로 생성
  for (let i = 0; i < prompts.length; i++) {
    const promptData = prompts[i];
    console.log(`\n[${i + 1}/${prompts.length}] ${promptData.label || `썸네일 ${i+1}`} 생성 중...`);
    
    try {
      const result = await generateSingleImage(promptData.prompt, options);
      
      if (result.success) {
        results.push({
          version: promptData.version || i + 1,
          label: promptData.label || `썸네일 ${i+1}`,
          imageUrl: result.imageUrl,
          imageUrlNoWatermark: result.imageUrl,
          width: result.width,
          height: result.height,
          revisedPrompt: result.revisedPrompt
        });
        console.log(`✅ [${i + 1}/${prompts.length}] ${promptData.label || `썸네일 ${i+1}`} 완료`);
      } else {
        errors.push({
          version: promptData.version || i + 1,
          label: promptData.label || `썸네일 ${i+1}`,
          error: result.error
        });
        console.log(`❌ [${i + 1}/${prompts.length}] ${promptData.label || `썸네일 ${i+1}`} 실패: ${result.error}`);
      }
    } catch (error) {
      errors.push({
        version: promptData.version || i + 1,
        label: promptData.label || `썸네일 ${i+1}`,
        error: error.message
      });
      console.log(`❌ [${i + 1}/${prompts.length}] ${promptData.label || `썸네일 ${i+1}`} 오류: ${error.message}`);
    }

    // API Rate Limit 방지 (약간의 딜레이)
    if (i < prompts.length - 1) {
      console.log(`⏳ 다음 이미지 생성을 위해 1초 대기...`);
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  console.log(`\n${'='.repeat(70)}`);
  console.log(`✅ [Replicate Flux] 생성 완료`);
  console.log(`   성공: ${results.length}/${prompts.length}`);
  console.log(`   실패: ${errors.length}/${prompts.length}`);
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
 * 프롬프트 최적화
 */
function optimizePromptForReplicate(prompt) {
  // Stable Diffusion/Flux 스타일 프롬프트 최적화
  // 품질 키워드 추가
  const qualityTags = "high quality, detailed, professional, 4k, masterpiece";
  
  // 이미 품질 태그가 있으면 추가하지 않음
  if (!prompt.toLowerCase().includes('high quality') && 
      !prompt.toLowerCase().includes('masterpiece')) {
    return `${prompt}, ${qualityTags}`;
  }
  
  return prompt;
}

module.exports = {
  generateSingleImage,
  generateMultipleThumbnails,
  optimizePromptForReplicate
};
