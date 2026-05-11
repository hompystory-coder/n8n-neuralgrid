/**
 * 🎨 썸네일 자동 생성 모듈 (CTR 최적화 버전 v2.0)
 * 성공 채널 분석 기반 프롬프트 시스템
 * 예상 CTR: 7-12% (기존 3-5% 대비 2-3배 향상)
 */

/**
 * 🎯 CTR 최적화 템플릿 (실제 성공 채널 분석 기반)
 */
const thumbnailTemplates = {
  'lofi': {
    name: 'Lo-fi / Chill Beats',
    targetCTR: '9-12%',
    mood: 'nostalgic, cozy, and deeply comforting',
    mustHave: ['studying', 'desk', 'books', 'headphones', 'cozy room', 'night scene'],
    mustAvoid: ['party', 'festival', 'dancing', 'bright daylight', 'crowd'],
    primaryColors: {
      main: '#8B5CF6',      // Warm Purple
      secondary: '#F9A8D4', // Soft Pink
      accent: '#FCD34D',    // Golden Yellow
      background: '#1E293B' // Dark Navy
    },
    visualElements: 'Anime character studying at wooden desk, vinyl records, retro radio, cassette tape, coffee mug with steam, plants in pots, fairy lights, large window showing rainy city view or night sky',
    specificDetails: 'Character wearing cozy hoodie, headphones on, peaceful expression, warm desk lamp creating golden glow, books stacked neatly, notebook open with pen, lo-fi aesthetic room',
    atmosphere: 'dreamy, nostalgic, inviting - makes viewers want to study and relax',
    keywords: 'lofi hip hop, chill beats, study beats, relaxation',
    referenceStyle: 'Lofi Girl channel, Studio Ghibli aesthetic, ChilledCow vibes',
    composition: 'Character takes 60% of frame, background 40%, rule of thirds'
  },
  
  'study': {
    name: 'Study / Focus Music',
    targetCTR: '7-10%',
    mood: 'focused, productive, and inspiring',
    mustHave: ['workspace', 'laptop', 'organized desk', 'clean environment', 'studying'],
    mustAvoid: ['party', 'dancing', 'festival', 'nightlife', 'alcohol'],
    primaryColors: {
      main: '#3B82F6',      // Bright Blue
      secondary: '#10B981', // Green
      accent: '#FDE047',    // Yellow
      background: '#F8FAFC' // Light Gray
    },
    visualElements: 'Modern clean workspace, open laptop with glowing screen, noise-canceling headphones, organized desk with minimal items, succulent plants, notebook with neat notes, coffee cup',
    specificDetails: 'Bright natural lighting from large window, clean minimalist aesthetic, motivational quote visible, pen holder with colorful pens, desk calendar, ambient desk lamp',
    atmosphere: 'clean, organized, motivating - perfect study environment',
    keywords: 'study music, focus, concentration, productivity, deep work',
    referenceStyle: 'Modern productivity aesthetic, Apple product ads, minimalist design',
    composition: 'Clean composition with lots of negative space, balanced layout'
  },
  
  'upbeat': {
    name: 'Upbeat / Happy Vibes',
    targetCTR: '7-9%',
    mood: 'energetic, joyful, and vibrant',
    mustHave: ['dancing', 'party', 'festival', 'celebration', 'bright colors', 'outdoor fun', 'sunlight'],
    mustAvoid: ['studying', 'desk', 'books', 'laptop', 'work', 'dark room', 'rain'],
    primaryColors: {
      main: '#FB923C',      // Bright Orange
      secondary: '#FDE047', // Sunny Yellow
      accent: '#22D3EE',    // Vibrant Cyan
      background: '#DBEAFE' // Sky Blue
    },
    visualElements: 'Colorful party scene, confetti in the air, disco ball reflections, dancing silhouettes, bright sunlight, beach vibes with palm trees, vibrant street art, festival atmosphere',
    specificDetails: 'Motion blur for energy, lens flare effects, bokeh from lights, rainbow gradients, playful geometric shapes, summer vibes, happy people enjoying music',
    atmosphere: 'fun, exciting, makes you want to dance and smile',
    keywords: 'happy music, feel good, party, celebration, summer vibes',
    referenceStyle: 'Festival posters, summer playlist covers, energetic lifestyle brands',
    composition: 'Dynamic diagonal lines, asymmetric layout for energy'
  },
  
  'emotional': {
    name: 'Emotional / Heartbreak',
    targetCTR: '8-11%',
    mood: 'melancholic, emotional, and deeply touching',
    mustHave: ['rain', 'alone', 'silhouette', 'night scene', 'urban', 'emotional'],
    mustAvoid: ['party', 'celebration', 'bright colors', 'smiling', 'dancing'],
    primaryColors: {
      main: '#1E40AF',      // Deep Blue
      secondary: '#A78BFA', // Soft Purple
      accent: '#F472B6',    // Neon Pink
      background: '#0F172A' // Almost Black
    },
    visualElements: 'Silhouette walking alone in rain, urban night scene with street lamps, wet pavement with reflections, city lights blurred in background, broken heart symbol (subtle), falling rain drops, foggy atmosphere',
    specificDetails: 'Backlit silhouette for mystery, neon signs in distance (pink/purple), umbrella optional, lonely bench, bridge at night, emotional body language, tear on cheek (subtle)',
    atmosphere: 'sad but beautiful, relatable heartbreak, cinematic emotion',
    keywords: 'sad songs, heartbreak, healing music, emotional',
    referenceStyle: 'K-drama posters, indie album covers, emotional movie scenes',
    composition: 'Rule of thirds with subject off-center, leading lines, lots of negative space'
  },
  
  'nightdrive': {
    name: 'Night Drive / Synthwave',
    targetCTR: '8-10%',
    mood: 'cool, mysterious, and cinematic',
    mustHave: ['neon lights', 'cyberpunk', 'night', 'city', 'car', 'synthwave'],
    mustAvoid: ['daylight', 'nature', 'books', 'studying', 'party'],
    primaryColors: {
      main: '#A855F7',      // Neon Purple
      secondary: '#EC4899', // Hot Pink
      accent: '#06B6D4',    // Cyan
      background: '#3B0764' // Dark Purple
    },
    visualElements: 'Cyberpunk city skyline at night, neon signs glowing, wet streets reflecting colorful lights, car dashboard view, highway at night, skyscrapers with illuminated windows, synthwave grid pattern',
    specificDetails: 'Neon glow effects, light trails from cars, atmospheric fog, bokeh from city lights, retro 80s aesthetic, palm tree silhouettes, vaporwave elements, lens flares',
    atmosphere: 'cool, futuristic, night drive feeling - urban exploration',
    keywords: 'synthwave, retrowave, night drive, cyberpunk',
    referenceStyle: 'Blade Runner, Cyberpunk 2077, Synthwave album covers',
    composition: 'Perspective lines converging, symmetry or dynamic angles'
  },
  
  'cafe': {
    name: 'Cafe / Coffee Music',
    targetCTR: '6-9%',
    mood: 'warm, intimate, and comfortable',
    mustHave: ['coffee', 'cafe', 'cozy', 'warm lighting', 'wooden table'],
    mustAvoid: ['party', 'gym', 'office desk', 'technology', 'neon'],
    primaryColors: {
      main: '#92400E',      // Deep Brown
      secondary: '#FEF3C7', // Cream
      accent: '#F59E0B',    // Amber
      background: '#451A03' // Dark Brown
    },
    visualElements: 'Cozy cafe interior, steaming coffee cup on wooden table, latte art visible, vintage cafe furniture, warm pendant lights, indoor plants, brick wall, bookshelves, croissant on plate',
    specificDetails: 'Soft natural window light, steam rising from coffee, barista in background (blurred), vintage coffee grinder, chalkboard menu, cozy armchair, rustic wood texture',
    atmosphere: 'warm, inviting, feels like your favorite coffee shop',
    keywords: 'cafe music, coffee time, relaxation, cozy vibes',
    referenceStyle: 'Instagram cafe aesthetic, cozy lifestyle photography',
    composition: 'Warm lighting, shallow depth of field, inviting composition'
  },
  
  'workout': {
    name: 'Workout / Gym Music',
    targetCTR: '7-9%',
    mood: 'powerful, intense, and motivating',
    mustHave: ['gym', 'exercise', 'athlete', 'muscles', 'dumbbells', 'intense'],
    mustAvoid: ['sitting', 'studying', 'cafe', 'relaxation', 'sleeping'],
    primaryColors: {
      main: '#DC2626',      // Bold Red
      secondary: '#171717', // Black
      accent: '#FACC15',    // Yellow
      background: '#0A0A0A' // Deep Black
    },
    visualElements: 'Athletic person working out, dumbbells and gym equipment, sweat drops, muscular silhouette, gym interior with dramatic lighting, weights being lifted, running motion blur',
    specificDetails: 'High contrast lighting, motion blur for energy, chalk dust in air, dramatic shadows, determined expression, veins showing effort, gym badge on clothing, water bottle',
    atmosphere: 'intense, powerful, makes you want to push harder',
    keywords: 'workout music, gym, exercise, motivation, beast mode',
    referenceStyle: 'Nike ads, fitness influencer content, sports photography',
    composition: 'Dynamic action shot, diagonal lines for movement, high energy'
  }
};

/**
 * 스타일 매칭 (스마트 매칭)
 */
function selectTemplate(style) {
  const styleLower = style.toLowerCase();
  
  // Lo-fi / Chill
  if (styleLower.includes('lofi') || styleLower.includes('lo-fi') || 
      styleLower.includes('chill') || styleLower.includes('beats')) {
    return thumbnailTemplates['lofi'];
  }
  
  // Study / Focus
  if (styleLower.includes('study') || styleLower.includes('focus') || 
      styleLower.includes('concentration')) {
    return thumbnailTemplates['study'];
  }
  
  // Upbeat / Happy
  if (styleLower.includes('upbeat') || styleLower.includes('happy') || 
      styleLower.includes('energy') || styleLower.includes('party')) {
    return thumbnailTemplates['upbeat'];
  }
  
  // Emotional / Sad
  if (styleLower.includes('emotional') || styleLower.includes('sad') || 
      styleLower.includes('heartbreak') || styleLower.includes('healing')) {
    return thumbnailTemplates['emotional'];
  }
  
  // Night Drive
  if (styleLower.includes('night') || styleLower.includes('drive') || 
      styleLower.includes('synthwave') || styleLower.includes('cyberpunk')) {
    return thumbnailTemplates['nightdrive'];
  }
  
  // Cafe
  if (styleLower.includes('cafe') || styleLower.includes('coffee')) {
    return thumbnailTemplates['cafe'];
  }
  
  // Workout
  if (styleLower.includes('workout') || styleLower.includes('gym') || 
      styleLower.includes('exercise')) {
    return thumbnailTemplates['workout'];
  }
  
  // Default: Lo-fi (가장 높은 CTR)
  return thumbnailTemplates['lofi'];
}

/**
 * 제목 정리 (곡수/시간 제거)
 */
function cleanTitle(title) {
  return title
    .replace(/\d+곡/g, '')
    .replace(/\d+분/g, '')
    .replace(/\d+\s*tracks?/gi, '')
    .replace(/\d+\s*songs?/gi, '')
    .replace(/\d+\s*min(utes)?/gi, '')
    .replace(/\s+\|\s+/g, ' | ')
    .replace(/\|\s*$/g, '')
    .trim();
}

/**
 * 🎯 4가지 전략적 버전 생성
 */
function generateThumbnailPrompt(title, style, language = 'korean') {
  const template = selectTemplate(style);
  const cleanedTitle = cleanTitle(title);
  
  // 4가지 버전: 전략적으로 다른 접근
  const prompts = [
    {
      version: 'design_a_with_text',
      label: '캐릭터 중심 + 텍스트 (최고 CTR)',
      prompt: generateCharacterFocused(cleanedTitle, template, language, true)
    },
    {
      version: 'design_a_no_text',
      label: '캐릭터 중심 + 텍스트 없음',
      prompt: generateCharacterFocused(cleanedTitle, template, language, false)
    },
    {
      version: 'design_b_with_text',
      label: '분위기 풍경 + 텍스트',
      prompt: generateMoodLandscape(cleanedTitle, template, language, true)
    },
    {
      version: 'design_b_no_text',
      label: '분위기 풍경 + 텍스트 없음',
      prompt: generateMoodLandscape(cleanedTitle, template, language, false)
    }
  ];
  
  return {
    prompts,
    template,
    cleanTitle: cleanedTitle,
    aspectRatio: '16:9',
    model: 'nano-banana-2',
    expectedCTR: template.targetCTR
  };
}

// 새 프롬프트 생성기 사용
const promptGen = require('./thumbnailPromptGenerator');

/**
 * Version 1: Character-Focused (캐릭터 중심) - 최고 CTR
 */
function generateCharacterFocused(title, template, language, includeText) {
  // 새 생성기 사용
  return promptGen.generateCharacterFocused(title, template, language, includeText);
}

/**
 * Version 1 (OLD): Character-Focused - 이전 버전 (백업용)
 */
function generateCharacterFocusedOld(title, template, language, includeText) {
  const colors = template.primaryColors;
  
  const textSection = includeText ? `
TITLE TEXT (VERY IMPORTANT):
- Text: "${title}"
- Font: LARGE, BOLD, sans-serif (minimum 72px equivalent)
- Position: Top center or bottom center (don't block character's face)
- Color: White (#FFFFFF) with soft glow effect
- Glow: ${colors.secondary} or ${colors.accent} color glow around text
- Shadow: Soft drop shadow for depth and readability
- Style: Clean, modern, highly readable
- ${language === 'korean' ? 'Korean font: Pretendard Bold or Noto Sans KR Black' : 'English font: Montserrat Bold or Poppins Black'}
- Make text POP and STAND OUT - it should be the second thing viewers notice after the character
- Text should be LARGE enough to read on mobile phones (thumbnail size)
` : `
CRITICAL - NO TEXT AT ALL:
- DO NOT include ANY text, titles, numbers, or letters in the image
- This is a background-only version for later text overlay
- Pure visual design without any typography
- Leave clear space at top or bottom for text to be added later
- Focus 100% on the visual elements and atmosphere
`;

  return `IMPORTANT: This is for ${template.name} music, NOT lofi/study music!

Professional YouTube music playlist thumbnail - Character-Focused Design (Highest CTR style)

CRITICAL REQUIREMENTS - MUST FOLLOW:
- Genre: ${template.name}
- Keywords: ${template.keywords}
- Mood: ${template.mood}
${template.name === 'Upbeat / Happy Vibes' ? `- DO NOT show: studying, books, desk, homework, laptop, work
- DO show: dancing, party, festival, celebration, smiling faces, outdoor fun
- Energy level: HIGH, VIBRANT, JOYFUL` : ''}

MAIN SUBJECT (MOST IMPORTANT - 60% of composition):
${template.visualElements.split(',')[0]}
- Style: ${template.referenceStyle}
- Expression: ${template.mood.split(',')[0]} face with genuine ${template.mood.split(',')[1] || 'emotion'}
- Action: ${template.name.includes('Upbeat') ? 'dancing, celebrating, enjoying party atmosphere' : 'calm, focused activity'}
- Position: Center or slightly off-center (rule of thirds)
- Detail: High quality, detailed illustration, expressive eyes that connect with viewer
- The character should be the FOCAL POINT that immediately draws attention
- Character should look inviting and relatable to the target audience

BACKGROUND & ENVIRONMENT (40% of composition):
${template.visualElements}
- Style: ${template.referenceStyle}
- Composition: ${template.composition}
- Detail level: Rich but not overwhelming, supports the main character

COLOR PALETTE (EXACT COLORS - Critical for CTR):
- Primary/Dominant: ${colors.main} (${Math.round(100 * 0.4)}% of image)
- Secondary: ${colors.secondary} (${Math.round(100 * 0.3)}% of image)
- Accent: ${colors.accent} (${Math.round(100 * 0.2)}% of image)
- Background base: ${colors.background} (${Math.round(100 * 0.1)}% of image)
- Color scheme creates ${template.mood} feeling
- High contrast: minimum 70% brightness difference between elements
- Colors should be vibrant but not oversaturated

LIGHTING & ATMOSPHERE:
- Mood: ${template.atmosphere}
- Lighting: Warm, cinematic lighting with clear light source
- Shadows: Soft shadows for depth, not too dark
- Highlights: Strategic highlights on character and key elements
- Overall feel: ${template.mood}
- Atmosphere should make viewers feel: ${template.atmosphere}

${textSection}

TECHNICAL REQUIREMENTS (YouTube Optimization):
- Aspect ratio: 16:9 (perfect for YouTube thumbnails)
- Resolution: High quality, sharp, professional
- Composition: Balanced, eye-catching, follows ${template.composition}
- Contrast: High contrast (70%+ difference) between foreground and background
- Focal point: Character's face/eyes should be the immediate attention grabber
- Depth: Clear foreground, midground, background separation
- Style: Clean, professional, ${template.referenceStyle}

MOOD & PSYCHOLOGY:
- Target emotion: ${template.mood}
- Viewer feeling: ${template.atmosphere}
- Click trigger: Makes viewers feel "${template.atmosphere}"
- Genre keywords: ${template.keywords}
- Reference style: ${template.referenceStyle}

DESIGN GOALS:
- Create an IMMEDIATE emotional connection with the viewer
- Make the thumbnail INSTANTLY recognizable at small sizes (mobile)
- Stand out among dozens of other thumbnails in search results
- Convey the music's mood/vibe at a single glance
- Professional quality that builds trust and channel branding
- Target CTR: ${template.targetCTR} (top-performing range)

${includeText ? 
  `Final output: Professional thumbnail with prominent title text that combines beautiful character art with excellent typography.` : 
  `Final output: Professional background design perfect for adding text overlay later, with clear space reserved for title.`}`;
}

/**
 * Version 2: Mood-Landscape (분위기 풍경) - 높은 CTR
 */
function generateMoodLandscape(title, template, language, includeText) {
  // 새 생성기 사용
  return promptGen.generateMoodLandscape(title, template, language, includeText);
}

/**
 * Version 2 (OLD): Mood-Landscape - 이전 버전 (백업용)
 */
function generateMoodLandscapeOld(title, template, language, includeText) {
  const colors = template.primaryColors;
  
  const textSection = includeText ? `
TITLE TEXT (CENTER STAGE):
- Text: "${title}"
- Font: EXTRA LARGE, BOLD (minimum 80px equivalent)
- Position: Center or top-center (text is the hero here)
- Color: White (#FFFFFF) or ${colors.accent}
- Effect: Strong glow effect in ${colors.secondary} or ${colors.main}
- Shadow: Deep shadow for maximum contrast and readability
- Style: Bold, impactful, modern typography
- ${language === 'korean' ? 'Korean font: Pretendard Extra Bold' : 'English font: Bebas Neue or Oswald Bold'}
- Text should be MASSIVE and DOMINANT - the main focus
- Text takes 50-60% of the visual attention
` : `
NO TEXT VERSION:
- Absolutely NO text, titles, or typography
- Pure cinematic scene/landscape
- Designed as a background for text overlay
- Maximum visual impact without text distraction
- Leave obvious space for title placement
`;

  return `IMPORTANT: This is for ${template.name} music, NOT lofi/study music!

Professional YouTube music playlist thumbnail - Mood-Landscape Design (Cinematic style)

CRITICAL GENRE: ${template.name}
Keywords: ${template.keywords}
${template.name === 'Upbeat / Happy Vibes' ? `MUST AVOID: study scenes, desks, books, laptops, homework
MUST INCLUDE: party, festival, dancing, outdoor celebration, bright daylight` : ''}

MAIN SCENE (PANORAMIC COMPOSITION):
${template.visualElements}
- Style: Cinematic, wide-angle, immersive scene
- Composition: ${template.composition}
- Perspective: ${template.referenceStyle}
- Visual storytelling: Scene should immediately convey ${template.mood}
- The entire scene creates the mood, not just one element

VISUAL ELEMENTS & DETAILS:
${template.specificDetails}
- Quality: Photorealistic with artistic enhancement
- Detail: Rich, immersive, but not cluttered
- Focus: Clear main subject with supporting elements
- Depth: Strong sense of depth with foreground, midground, background
- Movement: ${template.mood.includes('energetic') ? 'Sense of motion and energy' : 'Calm, peaceful stillness'}

COLOR PALETTE & GRADING:
- Primary: ${colors.main} (dominant color, sets the mood)
- Secondary: ${colors.secondary} (supporting color)
- Accent: ${colors.accent} (highlights and points of interest)
- Base: ${colors.background} (foundation color)
- Color grading: ${template.mood} color temperature
- Saturation: Vibrant and eye-catching but not oversaturated
- Contrast: High contrast (70%+) for visual pop

LIGHTING & EFFECTS:
- Lighting style: ${template.atmosphere}
- Light source: Clear, motivated lighting (natural or artificial)
- Shadows: Strategic shadows for depth and drama
- Effects: ${template.specificDetails.includes('glow') ? 'Glow effects, light rays, atmospheric haze' : 'Clean lighting, minimal effects'}
- Atmosphere: ${template.atmosphere}
- Mood lighting: Colors and lighting work together to create ${template.mood}

${textSection}

COMPOSITION & LAYOUT:
- Layout: ${template.composition}
- Balance: Visual balance with clear focal points
- Leading lines: Guide viewer's eye through the composition
- Negative space: ${includeText ? '30-40% for text placement' : '20-30% for breathing room'}
- Symmetry: ${template.mood.includes('calm') ? 'Balanced, symmetrical' : 'Dynamic, asymmetrical'}

MOOD & ATMOSPHERE:
- Primary mood: ${template.mood}
- Emotional impact: ${template.atmosphere}
- Viewer feeling: Should make viewers feel ${template.atmosphere}
- Genre: ${template.keywords}
- Reference: ${template.referenceStyle}

TECHNICAL SPECS:
- Aspect ratio: 16:9 (YouTube standard)
- Quality: High resolution, professional grade
- Style: ${template.referenceStyle}
- Clarity: Sharp, clear, no blur (except artistic motion blur)
- Color depth: Rich, deep colors with proper gradation
- Contrast ratio: Minimum 70% between key elements

YOUTUBE OPTIMIZATION:
- Mobile-friendly: Clear and impactful even at small sizes
- Thumbnail psychology: ${template.atmosphere}
- Click trigger: Immediate mood recognition
- Brand consistency: Style aligns with ${template.keywords}
- Target CTR: ${template.targetCTR}

${includeText ? 
  `Final output: Cinematic scene with powerful central typography that dominates the composition.` : 
  `Final output: Cinematic background scene ready for text overlay, with clear composition and visual hierarchy.`}`;
}

module.exports = {
  thumbnailTemplates,
  selectTemplate,
  generateThumbnailPrompt,
  cleanTitle
};
