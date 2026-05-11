/**
 * 🎨 썸네일 자동 생성 모듈
 * GenSpark image_generation을 사용하여 YouTube 썸네일 생성
 */

const thumbnailTemplates = {
  'study': {
    mood: 'focused and productive',
    colorScheme: 'clean blue and white tones, minimal design',
    visualElements: 'books on desk, study lamp, notebook, coffee cup, plants',
    atmosphere: 'calm, organized, inspiring study environment',
    keywords: 'study music, focus, concentration, productivity'
  },
  'cafe': {
    mood: 'cozy and comfortable',
    colorScheme: 'warm brown and cream tones, coffee colors',
    visualElements: 'coffee cup, cafe interior, warm lighting, plants, pastries',
    atmosphere: 'relaxing cafe ambience with soft natural light',
    keywords: 'cafe music, relaxation, coffee time, cozy vibes'
  },
  'workout': {
    mood: 'energetic and powerful',
    colorScheme: 'bold red and black, high contrast, vibrant',
    visualElements: 'gym equipment, dumbbells, athletic silhouettes, motion blur',
    atmosphere: 'dynamic, powerful, motivating fitness environment',
    keywords: 'workout music, gym, exercise, motivation, energy'
  },
  'lofi': {
    mood: 'nostalgic and aesthetic',
    colorScheme: 'retro warm sunset colors, vintage tones',
    visualElements: 'vinyl records, retro radio, cassette tape, lo-fi aesthetic',
    atmosphere: 'dreamy, nostalgic, chill lo-fi vibes',
    keywords: 'lofi hip hop, chill beats, study beats, relaxation'
  },
  'healing': {
    mood: 'peaceful and relaxing',
    colorScheme: 'soft purple and blue, calming gradient',
    visualElements: 'stars, crescent moon, clouds, gentle waves',
    atmosphere: 'tranquil, serene, meditative night sky',
    keywords: 'healing music, meditation, sleep, relaxation'
  },
  'kpop': {
    mood: 'emotional and dramatic',
    colorScheme: 'vibrant colors with soft glow, stage lights',
    visualElements: 'microphone, stage lighting, concert atmosphere',
    atmosphere: 'emotional, dramatic, inspiring performance vibe',
    keywords: 'k-pop, ballad, emotional, singing'
  }
};

/**
 * 스타일 기반 템플릿 선택
 */
function selectTemplate(style) {
  const styleLower = style.toLowerCase();
  
  if (styleLower.includes('study') || styleLower.includes('focus')) {
    return thumbnailTemplates['study'];
  } else if (styleLower.includes('cafe') || styleLower.includes('coffee') || styleLower.includes('chill')) {
    return thumbnailTemplates['cafe'];
  } else if (styleLower.includes('workout') || styleLower.includes('gym') || styleLower.includes('exercise')) {
    return thumbnailTemplates['workout'];
  } else if (styleLower.includes('healing') || styleLower.includes('sleep') || styleLower.includes('meditation')) {
    return thumbnailTemplates['healing'];
  } else if (styleLower.includes('k-pop') || styleLower.includes('ballad')) {
    return thumbnailTemplates['kpop'];
  } else {
    return thumbnailTemplates['lofi']; // 기본값
  }
}

/**
 * 썸네일 생성 프롬프트 구성 (4가지 버전)
 */
function generateThumbnailPrompt(title, style, language = 'korean') {
  const template = selectTemplate(style);
  
  // 제목에서 곡수/시간 정보 제거 (예: "5곡 8분", "10곡", "3분" 등)
  const cleanTitle = title
    .replace(/\d+곡/g, '')           // "5곡" 제거
    .replace(/\d+분/g, '')           // "8분" 제거
    .replace(/\d+\s*tracks?/gi, '')  // "5 tracks" 제거
    .replace(/\d+\s*songs?/gi, '')   // "10 songs" 제거
    .replace(/\d+\s*min(utes)?/gi, '') // "8 minutes" 제거
    .replace(/\s+\|\s+/g, ' | ')     // 여러 공백 정리
    .replace(/\|\s*$/g, '')          // 끝의 | 제거
    .trim();
  
  // 디자인 A: 기본 템플릿
  const designA = {
    name: 'Design A',
    colorScheme: template.colorScheme,
    visualElements: template.visualElements,
    mood: template.mood
  };
  
  // 디자인 B: 대체 디자인 (색상과 요소 변경)
  const designB = getAlternativeDesign(template);
  
  // 4가지 프롬프트 생성
  const prompts = [
    // 1. 디자인 A + 텍스트 있음
    {
      version: 'design_a_with_text',
      label: '디자인 A (텍스트 포함)',
      prompt: generateSinglePrompt(cleanTitle, style, designA, template, language, true)
    },
    // 2. 디자인 A + 텍스트 없음
    {
      version: 'design_a_no_text',
      label: '디자인 A (텍스트 없음)',
      prompt: generateSinglePrompt(cleanTitle, style, designA, template, language, false)
    },
    // 3. 디자인 B + 텍스트 있음
    {
      version: 'design_b_with_text',
      label: '디자인 B (텍스트 포함)',
      prompt: generateSinglePrompt(cleanTitle, style, designB, template, language, true)
    },
    // 4. 디자인 B + 텍스트 없음
    {
      version: 'design_b_no_text',
      label: '디자인 B (텍스트 없음)',
      prompt: generateSinglePrompt(cleanTitle, style, designB, template, language, false)
    }
  ];

  return {
    prompts,
    template,
    cleanTitle,
    aspectRatio: '16:9',
    model: 'nano-banana-2'
  };
}

/**
 * 대체 디자인 생성
 */
function getAlternativeDesign(template) {
  // 각 템플릿에 대한 대체 디자인
  const alternatives = {
    'focused and productive': {
      mood: 'energetic and inspiring',
      colorScheme: 'vibrant orange and yellow, warm gradient',
      visualElements: 'modern workspace, laptop, headphones, motivational quotes',
    },
    'cozy and comfortable': {
      mood: 'warm and intimate',
      colorScheme: 'deep brown and gold, sunset tones',
      visualElements: 'vintage cafe, books, warm lamp light, steaming coffee',
    },
    'energetic and powerful': {
      mood: 'intense and focused',
      colorScheme: 'electric blue and neon purple, cyberpunk style',
      visualElements: 'futuristic gym, LED lights, abstract energy waves',
    },
    'nostalgic and aesthetic': {
      mood: 'dreamy and artistic',
      colorScheme: 'pastel pink and purple, soft gradient',
      visualElements: 'anime-style room, aesthetic decor, fairy lights, plants',
    },
    'peaceful and relaxing': {
      mood: 'serene and mystical',
      colorScheme: 'deep blue and purple, starry night',
      visualElements: 'galaxy, shooting stars, aurora borealis, cosmic clouds',
    },
    'emotional and dramatic': {
      mood: 'passionate and heartfelt',
      colorScheme: 'warm red and gold, spotlight effect',
      visualElements: 'solo spotlight, microphone close-up, emotional expression',
    }
  };
  
  return alternatives[template.mood] || {
    mood: 'modern and stylish',
    colorScheme: 'gradient background, contemporary colors',
    visualElements: 'abstract shapes, modern aesthetic',
  };
}

/**
 * 단일 프롬프트 생성
 */
function generateSinglePrompt(cleanTitle, style, design, template, language, includeText) {
  const textInstructions = includeText 
    ? `Text Requirements:
- Display the title "${cleanTitle}" prominently and attractively
- Use eye-catching typography and colors
- Make it pop and stand out
- Good readability from thumbnails
- ${language === 'korean' ? 'Korean-friendly fonts' : 'English-friendly fonts'}`
    : `IMPORTANT - NO TEXT:
- DO NOT include any text, titles, or numbers in the image
- Pure background design only
- Leave space for text overlay to be added later
- Focus on visual elements and atmosphere`;

  return `Professional YouTube music thumbnail ${includeText ? 'with title text' : 'background design'}

${includeText ? `Title: "${cleanTitle}"` : 'Background Design (No Text)'}
Music Style: ${style}

Visual Design:
- Mood: ${design.mood}
- Color Palette: ${design.colorScheme}
- Main Elements: ${design.visualElements}
- Atmosphere: ${template.atmosphere}

Technical Requirements:
- 16:9 aspect ratio (perfect for YouTube thumbnail)
- High quality, eye-catching design
- Attractive, catchy design that draws attention
- Modern, aesthetic, and premium look
- High contrast for excellent readability

${textInstructions}

Design Style:
- Clean and professional composition
- Photorealistic with artistic enhancement
- Suitable for ${template.keywords}
- Create a stunning thumbnail that attracts ${includeText ? 'clicks with prominent title' : 'viewers as a background'}

${includeText ? 'Create a premium-quality YouTube thumbnail with the title prominently displayed.' : 'Create a premium-quality background design suitable for text overlay.'}`;
}

module.exports = {
  thumbnailTemplates,
  selectTemplate,
  generateThumbnailPrompt
};
