/**
 * 🎨 썸네일 텍스트 오버레이 서비스
 * 생성된 이미지에 자동으로 텍스트를 추가합니다
 */

const { createCanvas, loadImage, GlobalFonts } = require('@napi-rs/canvas');
const sharp = require('sharp');
const path = require('path');

/**
 * 이미지에 텍스트 오버레이 추가
 * @param {Buffer} imageBuffer - 원본 이미지 버퍼
 * @param {string} text - 추가할 텍스트
 * @param {object} options - 텍스트 옵션
 * @returns {Promise<Buffer>} - 텍스트가 추가된 이미지 버퍼
 */
async function addTextOverlay(imageBuffer, text, options = {}) {
  try {
    // 이미지 메타데이터 가져오기
    const metadata = await sharp(imageBuffer).metadata();
    const { width, height } = metadata;

    // Canvas 생성
    const canvas = createCanvas(width, height);
    const ctx = canvas.getContext('2d');

    // 원본 이미지 로드
    const image = await loadImage(imageBuffer);
    ctx.drawImage(image, 0, 0, width, height);

    // 텍스트 옵션 설정
    const {
      position = 'bottom', // 'top', 'bottom', 'center'
      fontSize = Math.floor(height * 0.08), // 높이의 8%
      fontFamily = 'sans-serif',
      fontWeight = 'bold',
      textColor = '#FFFFFF',
      glowColor = '#FCD34D',
      shadowColor = 'rgba(0, 0, 0, 0.8)',
      glowBlur = 20,
      shadowBlur = 10,
      maxWidth = width * 0.9, // 너비의 90%
      lineHeight = 1.3,
      padding = height * 0.05 // 여백
    } = options;

    // 폰트 설정
    ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    // 텍스트를 여러 줄로 나누기 (긴 텍스트 처리)
    const lines = wrapText(ctx, text, maxWidth);

    // Y 위치 계산
    let startY;
    const totalTextHeight = lines.length * fontSize * lineHeight;
    
    if (position === 'top') {
      startY = padding + fontSize / 2;
    } else if (position === 'center') {
      startY = (height - totalTextHeight) / 2 + fontSize / 2;
    } else { // bottom
      startY = height - padding - totalTextHeight + fontSize / 2;
    }

    // 각 줄 그리기
    lines.forEach((line, index) => {
      const y = startY + index * fontSize * lineHeight;
      const x = width / 2;

      // 1. 글로우 효과 (외곽선)
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = glowBlur;
      ctx.strokeStyle = glowColor;
      ctx.lineWidth = 8;
      ctx.strokeText(line, x, y);
      ctx.strokeText(line, x, y); // 두 번 그려서 더 강하게

      // 2. 그림자 효과
      ctx.shadowColor = shadowColor;
      ctx.shadowBlur = shadowBlur;
      ctx.shadowOffsetX = 4;
      ctx.shadowOffsetY = 4;

      // 3. 검은색 외곽선 (가독성)
      ctx.strokeStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.lineWidth = 6;
      ctx.strokeText(line, x, y);

      // 4. 메인 텍스트
      ctx.shadowColor = 'transparent';
      ctx.shadowBlur = 0;
      ctx.fillStyle = textColor;
      ctx.fillText(line, x, y);
    });

    // Canvas를 Buffer로 변환
    const overlayBuffer = canvas.toBuffer('image/png');

    // Sharp로 최종 이미지 생성 (품질 최적화)
    const finalBuffer = await sharp(overlayBuffer)
      .webp({ quality: 90 })
      .toBuffer();

    return finalBuffer;

  } catch (error) {
    console.error('❌ 텍스트 오버레이 에러:', error);
    throw error;
  }
}

/**
 * 텍스트를 최대 너비에 맞게 여러 줄로 나누기
 */
function wrapText(ctx, text, maxWidth) {
  const words = text.split(' ');
  const lines = [];
  let currentLine = '';

  words.forEach(word => {
    const testLine = currentLine ? `${currentLine} ${word}` : word;
    const metrics = ctx.measureText(testLine);
    
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = word;
    } else {
      currentLine = testLine;
    }
  });

  if (currentLine) {
    lines.push(currentLine);
  }

  return lines;
}

/**
 * 버전에 따라 텍스트 추가 여부 결정
 */
async function processImageWithText(imageBuffer, text, version, template) {
  // 'with_text' 버전만 텍스트 추가
  if (!version.includes('with_text')) {
    return imageBuffer;
  }

  // 템플릿에 따라 다른 스타일 적용
  const options = getTextStyleForTemplate(template);
  
  return await addTextOverlay(imageBuffer, text, options);
}

/**
 * 템플릿에 따른 텍스트 스타일 반환
 */
function getTextStyleForTemplate(template) {
  if (!template || !template.primaryColors) {
    return {}; // 기본값 사용
  }

  const colors = template.primaryColors;

  return {
    position: 'bottom',
    glowColor: colors.accent || '#FCD34D',
    textColor: '#FFFFFF',
    shadowColor: 'rgba(0, 0, 0, 0.9)'
  };
}

module.exports = {
  addTextOverlay,
  processImageWithText,
  wrapText
};
