/**
 * 🎨 썸네일 프롬프트 생성기 (간결하고 명확한 버전)
 * 모든 템플릿에 일관성 있게 적용되는 구조
 */

/**
 * 장르별 제약사항 (template에서 직접 가져오기)
 * 템플릿에 정의된 mustHave/mustAvoid 배열을 사용
 */
function getGenreConstraints(template) {
  // 에너지 레벨 자동 결정
  const moodLower = template.mood.toLowerCase();
  let energy = 'MEDIUM';
  
  if (moodLower.includes('energetic') || moodLower.includes('powerful') || 
      moodLower.includes('joyful') || moodLower.includes('intense')) {
    energy = 'HIGH, vibrant, dynamic';
  } else if (moodLower.includes('calm') || moodLower.includes('cozy') || 
             moodLower.includes('melancholic') || moodLower.includes('nostalgic')) {
    energy = 'LOW, calm, peaceful';
  } else if (moodLower.includes('focused') || moodLower.includes('productive')) {
    energy = 'MEDIUM, focused, steady';
  }
  
  return {
    avoid: template.mustAvoid || [],
    required: template.mustHave || [],
    energy: energy
  };
}

/**
 * 프롬프트 헤더 생성 (장르 명확화)
 */
function generatePromptHeader(template) {
  const constraints = getGenreConstraints(template);
  
  let header = `🎵 GENRE: ${template.name}
CRITICAL: This is for "${template.name}" music playlist thumbnail - NOT other genres!

STRICT REQUIREMENTS:
- Music Genre: ${template.keywords}
- Target Mood: ${template.mood}
- Energy Level: ${constraints.energy}
`;

  // MUST AVOID 섹션 (매우 강조)
  if (constraints.avoid.length > 0) {
    header += `\n❌ MUST AVOID (DO NOT SHOW):
${constraints.avoid.map(item => `  - ${item}`).join('\n')}
`;
  }
  
  // MUST INCLUDE 섹션 (매우 강조)
  if (constraints.required.length > 0) {
    header += `\n✅ MUST INCLUDE (REQUIRED):
${constraints.required.map(item => `  - ${item}`).join('\n')}
`;
  }
  
  return header;
}

/**
 * 텍스트 섹션 생성
 */
function generateTextSection(title, colors, language, includeText) {
  if (!includeText) {
    return `
NO TEXT VERSION:
- DO NOT include ANY text, titles, numbers, or letters
- Pure visual design for text overlay later
- Leave clear space at top or bottom for text placement
`;
  }
  
  return `
TITLE TEXT (IMPORTANT):
- Text: "${title}"
- Size: LARGE, BOLD (minimum 72px)
- Position: Bottom center (don't block main subject)
- Color: White (#FFFFFF)
- Glow: ${colors.accent} glow effect
- Shadow: Black shadow for readability
- ${language === 'korean' ? 'Font: Pretendard Bold / Noto Sans KR Bold' : 'Font: Montserrat Bold / Poppins Black'}
- Must be readable on mobile phone screens
`;
}

/**
 * 환경/분위기 중심 프롬프트 생성 (캐릭터 없음)
 * 이 함수는 더 이상 캐릭터를 생성하지 않고 오직 환경과 분위기만 생성합니다
 */
function generateCharacterFocused(title, template, language, includeText) {
  // 이 함수 이름은 하위 호환성을 위해 유지하지만, 실제로는 환경 중심 생성
  return generateMoodLandscape(title, template, language, includeText);
}

/**
 * 풍경 중심 프롬프트 생성
 */
function generateMoodLandscape(title, template, language, includeText) {
  const colors = template.primaryColors;
  const constraints = getGenreConstraints(template);
  
  return `${generatePromptHeader(template)}

DESIGN TYPE: Professional YouTube music playlist thumbnail - Cinematic Landscape Style

🚫 ABSOLUTELY NO PEOPLE/CHARACTERS:
- DO NOT include any people, characters, humans, faces, or body parts
- This must be a pure environmental/atmospheric shot
- Focus 100% on environment, mood, and atmosphere
- Any AI-generated people will result in rejection

MAIN SCENE (Panoramic wide-angle):
- Scene: ${template.visualElements}
- Style: Cinematic, immersive, ${template.referenceStyle}
- Composition: ${template.composition}
- Storytelling: Scene should immediately convey "${template.mood}"
- Perspective: Wide-angle cinematic view

VISUAL ELEMENTS & DETAILS:
- Key details: ${template.specificDetails}
- Quality: Photorealistic with artistic enhancement
- Depth layers: Strong foreground, midground, background separation
- Movement feel: ${constraints.energy.includes('HIGH') ? 'Dynamic energy and motion' : 'Calm, peaceful stillness'}
- Atmosphere: ${template.atmosphere}

COLOR PALETTE (CINEMATIC GRADING):
- Primary/Dominant: ${colors.main} (sets the overall mood)
- Secondary/Supporting: ${colors.secondary} (harmonizes with primary)
- Accent/Highlights: ${colors.accent} (points of visual interest)
- Base/Foundation: ${colors.background} (underlying color tone)
- Color temperature: ${template.mood}
- Saturation: Vibrant and eye-catching
- Contrast: High (70%+ difference between elements)

LIGHTING & EFFECTS:
- Lighting mood: ${template.atmosphere}
- Light source: Clear, motivated lighting
- Shadows: Strategic shadows for depth and drama
- Atmosphere keywords: ${template.keywords}
- Overall feeling: Makes viewers feel "${template.atmosphere}"
${generateTextSection(title, colors, language, includeText)}

COMPOSITION & LAYOUT:
- Layout style: ${template.composition}
- Balance: Visual balance with clear focal points
- Negative space: ${includeText ? '30-40% for prominent text placement' : '20-30% for breathing room'}
- Leading lines: Guide viewer's eye through the scene

TECHNICAL SPECS:
- Aspect ratio: 16:9 (YouTube standard)
- Resolution: High resolution, professional grade
- Clarity: Sharp, clear (artistic blur acceptable)
- Mobile-friendly: Impactful even at small thumbnail size
- Target CTR: ${template.targetCTR}

Final output: ${includeText ? 'Cinematic landscape with central text overlay' : 'Cinematic landscape background ready for text overlay'}`;
}

module.exports = {
  generateCharacterFocused,
  generateMoodLandscape,
  getGenreConstraints
};
