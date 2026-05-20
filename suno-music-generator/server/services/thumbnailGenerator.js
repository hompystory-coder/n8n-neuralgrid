/**
 * 🎨 썸네일 자동 생성 모듈 (AI 자동 분석 버전 v3.0)
 * AI 기반 장르 자동 분석으로 202개 모든 장르 지원
 * 예상 CTR: 7-12% (기존 3-5% 대비 2-3배 향상)
 */

const aiMatcher = require('./aiThumbnailMatcher');
const styleParser = require('./styleParser');
const fs = require('fs');
const path = require('path');

// 장르 데이터 로드
let genresData = null;
try {
  const genresPath = path.join(__dirname, '../data/genres.json');
  genresData = JSON.parse(fs.readFileSync(genresPath, 'utf8'));
} catch (err) {
  console.warn('⚠️ genres.json 로드 실패, 기본 템플릿 사용:', err.message);
}

/**
 * 🎯 CTR 최적화 템플릿 (대표 7개 - 폴백용)
 * AI 매칭 실패 시에만 사용됨
 */
const thumbnailTemplates = {
  'lofi': {
    name: 'Lo-fi / Chill Beats',
    targetCTR: '9-12%',
    mood: 'nostalgic, cozy, and deeply comforting',
    mustHave: ['cozy room', 'night scene', 'rainy city view', 'warm lighting', 'vinyl records', 'fairy lights'],
    mustAvoid: ['people', 'characters', 'faces', 'party', 'festival', 'dancing', 'bright daylight', 'crowd'],
    primaryColors: {
      main: '#8B5CF6',      // Warm Purple
      secondary: '#F9A8D4', // Soft Pink
      accent: '#FCD34D',    // Golden Yellow
      background: '#1E293B' // Dark Navy
    },
    visualElements: 'Cozy room interior with wooden desk, vinyl records on wall, retro radio, cassette tape, steaming coffee mug, potted plants, fairy lights, large window showing rainy city night view with neon lights reflecting on wet streets',
    specificDetails: 'Warm desk lamp glow, books stacked artistically, open notebook with pen, lo-fi aesthetic room, soft purple and pink ambient lighting, rain droplets on window, city lights bokeh in background, empty chair suggesting peaceful solitude',
    atmosphere: 'dreamy, nostalgic, inviting - peaceful environment that makes viewers want to study and relax',
    keywords: 'lofi hip hop, chill beats, study beats, relaxation',
    referenceStyle: 'Lofi Girl channel aesthetic (but without character), Studio Ghibli room backgrounds, ChilledCow vibes',
    composition: 'Room environment takes 100% of frame, emphasis on atmospheric lighting and depth, rule of thirds for window placement'
  },
  
  'study': {
    name: 'Study / Focus Music',
    targetCTR: '7-10%',
    mood: 'focused, productive, and inspiring',
    mustHave: ['workspace', 'organized desk', 'clean environment', 'natural lighting', 'plants', 'window view'],
    mustAvoid: ['people', 'characters', 'faces', 'party', 'dancing', 'festival', 'nightlife', 'alcohol'],
    primaryColors: {
      main: '#3B82F6',      // Bright Blue
      secondary: '#10B981', // Green
      accent: '#FDE047',    // Yellow
      background: '#F8FAFC' // Light Gray
    },
    visualElements: 'Modern clean workspace scene, organized desk with laptop glowing softly, noise-canceling headphones resting on desk, minimal items neatly arranged, succulent plants, open notebook with neat notes, coffee cup with steam',
    specificDetails: 'Bright natural lighting streaming through large window, clean minimalist aesthetic, city skyline or nature view outside window, pen holder with colorful pens, desk calendar, ambient desk lamp, white and blue tones, scandinavian design',
    atmosphere: 'clean, organized, motivating - perfect study environment without distractions',
    keywords: 'study music, focus, concentration, productivity, deep work',
    referenceStyle: 'Modern productivity aesthetic, Apple product ads style (environmental shots), minimalist design photography',
    composition: 'Clean composition with lots of negative space, balanced layout, no people, focus on environment'
  },
  
  'upbeat': {
    name: 'Upbeat / Happy Vibes',
    targetCTR: '7-9%',
    mood: 'energetic, joyful, and vibrant',
    mustHave: ['party scene', 'festival atmosphere', 'celebration', 'bright colors', 'outdoor fun', 'sunlight', 'confetti'],
    mustAvoid: ['people', 'characters', 'faces', 'studying', 'desk', 'books', 'laptop', 'work', 'dark room', 'rain'],
    primaryColors: {
      main: '#FB923C',      // Bright Orange
      secondary: '#FDE047', // Sunny Yellow
      accent: '#22D3EE',    // Vibrant Cyan
      background: '#DBEAFE' // Sky Blue
    },
    visualElements: 'Colorful party scene environment, confetti falling in mid-air, disco ball reflections creating light patterns, bright sunlight streaming through, beach setting with palm trees silhouettes, vibrant street art murals, festival stage lighting, empty dance floor with dramatic lighting',
    specificDetails: 'Motion blur effects suggesting movement, lens flare from sunlight, bokeh from colorful lights, rainbow gradients in sky, playful geometric light patterns, summer atmosphere, energy and excitement in the environment itself without people',
    atmosphere: 'fun, exciting, energetic environment that makes you want to dance and smile',
    keywords: 'happy music, feel good, party, celebration, summer vibes',
    referenceStyle: 'Festival posters, summer playlist covers, energetic lifestyle photography (environmental)',
    composition: 'Dynamic diagonal lines, asymmetric layout for energy, environmental focus'
  },
  
  'emotional': {
    name: 'Emotional / Heartbreak',
    targetCTR: '8-11%',
    mood: 'melancholic, emotional, and deeply touching',
    mustHave: ['rain', 'night scene', 'urban environment', 'street lamps', 'wet pavement', 'emotional lighting'],
    mustAvoid: ['people', 'characters', 'faces', 'party', 'celebration', 'bright colors', 'smiling', 'dancing'],
    primaryColors: {
      main: '#1E40AF',      // Deep Blue
      secondary: '#A78BFA', // Soft Purple
      accent: '#F472B6',    // Neon Pink
      background: '#0F172A' // Almost Black
    },
    visualElements: 'Empty urban night scene with rain, street lamps casting golden glow on wet pavement, city lights reflecting in puddles, neon signs blurred in foggy distance, lonely bench on empty street, bridge over calm water at night, falling rain creating atmosphere',
    specificDetails: 'Dramatic backlighting creating moody atmosphere, neon signs in pink and purple hues, empty umbrella left on bench, rain droplets on camera lens effect, emotional lighting with deep shadows, cinematic depth of field, urban loneliness',
    atmosphere: 'sad but beautiful, relatable heartbreak, cinematic emotion, solitude and reflection',
    keywords: 'sad songs, heartbreak, healing music, emotional',
    referenceStyle: 'K-drama atmospheric shots (no people), indie album covers, emotional movie environmental scenes',
    composition: 'Rule of thirds with empty space conveying loneliness, leading lines from street, lots of negative space'
  },
  
  'nightdrive': {
    name: 'Night Drive / Synthwave',
    targetCTR: '8-10%',
    mood: 'cool, mysterious, and cinematic',
    mustHave: ['neon lights', 'cyberpunk city', 'night', 'city skyline', 'highway', 'synthwave aesthetic'],
    mustAvoid: ['people', 'characters', 'faces', 'daylight', 'nature', 'books', 'studying', 'party'],
    primaryColors: {
      main: '#A855F7',      // Neon Purple
      secondary: '#EC4899', // Hot Pink
      accent: '#06B6D4',    // Cyan
      background: '#3B0764' // Dark Purple
    },
    visualElements: 'Cyberpunk city skyline at night, towering neon signs glowing in purple and pink, wet streets reflecting colorful lights creating mirror effect, empty highway at night with light trails, futuristic skyscrapers with illuminated windows, synthwave grid pattern in background, palm tree silhouettes against neon sky',
    specificDetails: 'Neon glow effects radiating from signs, light trails from passing vehicles, atmospheric fog creating depth, bokeh from distant city lights, retro 80s aesthetic, vaporwave color palette, lens flares, no people visible, pure environmental shot',
    atmosphere: 'cool, futuristic, night drive feeling - urban exploration and mystery',
    keywords: 'synthwave, retrowave, night drive, cyberpunk',
    referenceStyle: 'Blade Runner environmental shots (no people), Cyberpunk 2077 cityscapes, Synthwave album covers',
    composition: 'Perspective lines converging to create depth, symmetry or dynamic angles, environmental focus'
  },
  
  'cafe': {
    name: 'Cafe / Coffee Music',
    targetCTR: '6-9%',
    mood: 'warm, intimate, and comfortable',
    mustHave: ['coffee cup', 'cafe interior', 'cozy environment', 'warm lighting', 'wooden table', 'plants'],
    mustAvoid: ['people', 'characters', 'faces', 'party', 'gym', 'office desk', 'technology', 'neon'],
    primaryColors: {
      main: '#92400E',      // Deep Brown
      secondary: '#FEF3C7', // Cream
      accent: '#F59E0B',    // Amber
      background: '#451A03' // Dark Brown
    },
    visualElements: 'Cozy cafe interior scene, steaming coffee cup with latte art on wooden table, vintage cafe furniture arranged artistically, warm pendant lights casting golden glow, lush indoor plants, exposed brick wall, filled bookshelves, croissant on ceramic plate, empty chairs suggesting peaceful atmosphere',
    specificDetails: 'Soft natural window light streaming in, steam rising gracefully from coffee, vintage coffee grinder on counter, handwritten chalkboard menu, empty cozy armchair, rustic wood texture, warm amber tones, no people visible, inviting empty space',
    atmosphere: 'warm, inviting, feels like your favorite coffee shop when it\'s quiet and peaceful',
    keywords: 'cafe music, coffee time, relaxation, cozy vibes',
    referenceStyle: 'Instagram cafe aesthetic (environmental shots), cozy lifestyle photography, coffee table books',
    composition: 'Warm lighting, shallow depth of field focusing on coffee cup, inviting environmental composition'
  },
  
  'workout': {
    name: 'Workout / Gym Music',
    targetCTR: '7-9%',
    mood: 'powerful, intense, and motivating',
    mustHave: ['gym equipment', 'dumbbells', 'workout space', 'intense lighting', 'athletic environment', 'motivational'],
    mustAvoid: ['people', 'characters', 'faces', 'sitting', 'studying', 'cafe', 'relaxation', 'sleeping'],
    primaryColors: {
      main: '#DC2626',      // Bold Red
      secondary: '#171717', // Black
      accent: '#FACC15',    // Yellow
      background: '#0A0A0A' // Deep Black
    },
    visualElements: 'Modern gym interior with dramatic lighting, arranged dumbbells and gym equipment, empty workout space with motivational atmosphere, dramatic spotlights creating shadows, weights on rack, running track or treadmills, athletic environment with energy',
    specificDetails: 'High contrast dramatic lighting, motion blur effects suggesting recent activity, chalk dust particles floating in air creating atmosphere, dramatic shadows adding intensity, empty gym space suggesting dedication, water bottle and towel left behind, motivational quotes on walls',
    atmosphere: 'intense, powerful, motivational environment that makes you want to push harder',
    keywords: 'workout music, gym, exercise, motivation, beast mode',
    referenceStyle: 'Nike environmental ads (gym spaces), fitness magazine photography (equipment focus), sports facility shots',
    composition: 'Dynamic angles showing equipment, diagonal lines for movement energy, high contrast and intensity'
  }
};

/**
 * 🤖 AI 기반 스마트 템플릿 선택
 * 1. 먼저 genres.json에서 정확한 장르 정보 찾기
 * 2. AI가 자동으로 시각적 제약조건 생성
 * 3. 실패 시 폴백 템플릿 사용
 */
function selectTemplate(style) {
  console.log('🎯 [Template Selection] 입력 스타일:', style);
  
  const styleLower = style.toLowerCase();
  const styleOriginal = style;
  
  // 🧠 Step 0: 스타일 문자열 지능형 파싱
  const parsedStyle = styleParser.parseStyle(style);
  console.log('🧠 [Parsed Features]:', JSON.stringify(parsedStyle, null, 2));
  
  // 1단계: genres.json에서 정확한 장르 찾기
  if (genresData && genresData.categories) {
    // 첫 번째 시도: 정확한 ID 매칭
    for (const category of genresData.categories) {
      if (category.genres) {
        for (const genre of category.genres) {
          if (genre.id === styleLower) {
            console.log(`✅ AI 매칭 성공 (정확): ${genre.name} (${genre.nameKo})`);
            return aiMatcher.generateThumbnailTemplate(genre);
          }
        }
      }
    }
    
    // 두 번째 시도: 부분 문자열 매칭
    for (const category of genresData.categories) {
      if (category.genres) {
        for (const genre of category.genres) {
          const nameMatch = genre.name && genre.name.toLowerCase().includes(styleLower);
          const nameKoMatch = genre.nameKo && genre.nameKo.includes(styleOriginal);
          const idMatch = styleLower.includes(genre.id);
          
          if (nameMatch || nameKoMatch || idMatch) {
            console.log(`✅ AI 매칭 성공 (유사): ${genre.name} (${genre.nameKo})`);
            return aiMatcher.generateThumbnailTemplate(genre);
          }
        }
      }
    }
    
    // 세 번째 시도: 카테고리 레벨 매칭
    for (const category of genresData.categories) {
      const categoryIdMatch = styleLower.includes(category.id);
      const categoryNameMatch = category.name && styleLower.includes(category.name.toLowerCase());
      
      if (categoryIdMatch || categoryNameMatch) {
        // 카테고리의 첫 번째 대표 장르 사용
        if (category.genres && category.genres.length > 0) {
          const representativeGenre = category.genres[0];
          console.log(`✅ AI 매칭 성공 (카테고리): ${category.name} → ${representativeGenre.name}`);
          return aiMatcher.generateThumbnailTemplate(representativeGenre);
        }
      }
    }
  }
  
  console.log(`⚠️ AI 매칭 실패, 파싱된 특징 기반 폴백 템플릿 선택`);
  
  // 2단계: 파싱된 특징 기반 지능형 템플릿 선택
  
  // 🚫 CRITICAL: "up tempo" 키워드나 높은 BPM이면 study 템플릿 절대 사용 금지
  if (parsedStyle.isHighEnergy && !parsedStyle.isStudyMusic) {
    console.log('🎵 High energy 감지 → upbeat 템플릿 선택');
    return thumbnailTemplates['upbeat'];
  }
  
  // Dance/EDM 장르 감지
  if (parsedStyle.isDance || parsedStyle.genreCategory === 'dance') {
    console.log('💃 Dance 장르 감지 → upbeat 템플릿 선택');
    return thumbnailTemplates['upbeat'];
  }
  
  // R&B/Jazz/Pop 조합 (trendy, upbeat 특징)
  if ((parsedStyle.genreCategory === 'rnb' || parsedStyle.genreCategory === 'jazz' || parsedStyle.genreCategory === 'pop') &&
      parsedStyle.isHighEnergy) {
    console.log('🎺 R&B/Jazz/Pop + High Energy → cafe 템플릿 선택');
    return thumbnailTemplates['cafe'];
  }
  
  // Emotional/Sad
  if (parsedStyle.moods.includes('sad') || parsedStyle.moods.includes('emotional')) {
    console.log('😢 Emotional 분위기 감지 → emotional 템플릿 선택');
    return thumbnailTemplates['emotional'];
  }
  
  // Calm/Relaxing
  if (parsedStyle.isCalm && !parsedStyle.isStudyMusic) {
    console.log('😌 Calm 분위기 감지 → cafe 템플릿 선택');
    return thumbnailTemplates['cafe'];
  }
  
  // 3단계: 키워드 기반 폴백 (기존 로직 유지, 단 순서 조정)
  
  // Upbeat / Happy (우선순위 높임)
  if (styleLower.includes('upbeat') || styleLower.includes('up tempo') || styleLower.includes('uptempo') ||
      styleLower.includes('happy') || styleLower.includes('energy') || styleLower.includes('party') ||
      styleLower.includes('dance')) {
    console.log('🎉 Upbeat 키워드 감지 → upbeat 템플릿');
    return thumbnailTemplates['upbeat'];
  }
  
  // Lo-fi / Chill
  if (styleLower.includes('lofi') || styleLower.includes('lo-fi') || 
      styleLower.includes('chill') || styleLower.includes('beats')) {
    console.log('🎧 Lo-fi 키워드 감지 → lofi 템플릿');
    return thumbnailTemplates['lofi'];
  }
  
  // Study / Focus (낮은 우선순위)
  if ((styleLower.includes('study') || styleLower.includes('focus') || 
       styleLower.includes('concentration')) && !parsedStyle.isHighEnergy) {
    console.log('📚 Study 키워드 감지 (에너지 레벨 확인됨) → study 템플릿');
    return thumbnailTemplates['study'];
  }
  
  // Emotional / Sad
  if (styleLower.includes('emotional') || styleLower.includes('sad') || 
      styleLower.includes('heartbreak') || styleLower.includes('healing')) {
    console.log('💔 Emotional 키워드 감지 → emotional 템플릿');
    return thumbnailTemplates['emotional'];
  }
  
  // Night Drive
  if (styleLower.includes('night') || styleLower.includes('drive') || 
      styleLower.includes('synthwave') || styleLower.includes('cyberpunk')) {
    console.log('🌃 Night Drive 키워드 감지 → nightdrive 템플릿');
    return thumbnailTemplates['nightdrive'];
  }
  
  // Cafe
  if (styleLower.includes('cafe') || styleLower.includes('coffee') ||
      styleLower.includes('jazz') || styleLower.includes('r&b')) {
    console.log('☕ Cafe/Jazz 키워드 감지 → cafe 템플릿');
    return thumbnailTemplates['cafe'];
  }
  
  // Workout
  if (styleLower.includes('workout') || styleLower.includes('gym') || 
      styleLower.includes('exercise')) {
    console.log('💪 Workout 키워드 감지 → workout 템플릿');
    return thumbnailTemplates['workout'];
  }
  
  // 4단계: 최후 폴백 - 에너지 레벨 기반
  console.log('⚠️ 키워드 매칭 실패, 에너지 레벨 기반 선택');
  
  if (parsedStyle.bpm !== null && parsedStyle.bpm >= 100) {
    console.log(`🎵 BPM ${parsedStyle.bpm} → upbeat 템플릿 (기본값 대신)`);
    return thumbnailTemplates['upbeat'];
  }
  
  if (parsedStyle.isHighEnergy) {
    console.log('⚡ High energy 감지 → upbeat 템플릿 (기본값 대신)');
    return thumbnailTemplates['upbeat'];
  }
  
  // 최후의 기본값: cafe (lofi보다 범용성 높음)
  console.log('❓ 특징 불명확 → cafe 템플릿 (범용 기본값)');
  return thumbnailTemplates['cafe'];
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
  
  // 4가지 버전: 모두 분위기/환경 중심 (캐릭터 제외)
  const prompts = [
    {
      version: 'design_a_with_text',
      label: '분위기 풍경 + 텍스트 (메인)',
      prompt: generateMoodLandscape(cleanedTitle, template, language, true)
    },
    {
      version: 'design_a_no_text',
      label: '분위기 풍경 + 텍스트 없음',
      prompt: generateMoodLandscape(cleanedTitle, template, language, false)
    },
    {
      version: 'design_b_with_text',
      label: '분위기 풍경 + 텍스트 (변형)',
      prompt: generateMoodLandscape(cleanedTitle, template, language, true)
    },
    {
      version: 'design_b_no_text',
      label: '분위기 풍경 + 텍스트 없음 (변형)',
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

/**
 * 환경/분위기 중심 생성 (캐릭터 없음)
 * Version 1: Character-Focused style adapted to environment-only
 */
function generateCharacterFocused(title, template, language, includeText) {
  const colors = template.primaryColors;
  
  const textSection = includeText ? `
TITLE TEXT (VERY IMPORTANT):
- Text: "${title}"
- Font: LARGE, BOLD, sans-serif (minimum 72px equivalent)
- Position: Top center or bottom center
- Color: White (#FFFFFF) with soft glow effect
- Glow: ${colors.secondary} or ${colors.accent} color glow around text
- Shadow: Soft drop shadow for depth and readability
- Style: Clean, modern, highly readable
- ${language === 'korean' ? 'Korean font: Pretendard Bold or Noto Sans KR Black' : 'English font: Montserrat Bold or Poppins Black'}
- Make text POP and STAND OUT
- Text should be LARGE enough to read on mobile phones (thumbnail size)
` : `
CRITICAL - NO TEXT AT ALL:
- DO NOT include ANY text, titles, numbers, or letters in the image
- This is a background-only version for later text overlay
- Pure visual design without any typography
- Leave clear space at top or bottom for text to be added later
- Focus 100% on the visual elements and atmosphere
`;

  return `IMPORTANT: This is for ${template.name} music!

Professional YouTube music playlist thumbnail - Environment-Focused Design (High CTR style)

CRITICAL REQUIREMENTS - MUST FOLLOW:
- Genre: ${template.name}
- Keywords: ${template.keywords}
- Mood: ${template.mood}
${template.mustAvoid ? `- MUST AVOID: ${template.mustAvoid.join(', ')}` : ''}
${template.mustHave ? `- MUST INCLUDE: ${template.mustHave.join(', ')}` : ''}

MAIN SCENE (60% of composition):
${template.visualElements}
- Style: ${template.referenceStyle}
- Atmosphere: ${template.mood}
- Focus: Environment and setting that conveys the music's mood

VISUAL ELEMENTS & DETAILS:
${template.specificDetails}
- Quality: Professional, high-quality rendering
- Detail: Rich and immersive atmosphere
- Composition: ${template.composition}

COLOR PALETTE:
- Primary: ${colors.main}
- Secondary: ${colors.secondary}
- Accent: ${colors.accent}
- Background: ${colors.background}
- Mood: ${template.atmosphere}

${textSection}

TECHNICAL SPECS:
- Aspect ratio: 16:9 (YouTube standard)
- Quality: High resolution, professional grade
- Style: ${template.referenceStyle}
- Target CTR: ${template.targetCTR}

${includeText ? 
  `Final output: Professional thumbnail with prominent title text combining beautiful environment with excellent typography.` : 
  `Final output: Professional background design perfect for adding text overlay later.`}`;
}

/**
 * Version 2: Mood-Landscape (분위기 풍경) - 높은 CTR
 */
function generateMoodLandscape(title, template, language, includeText) {
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

  return `IMPORTANT: This is for ${template.name} music!

Professional YouTube music playlist thumbnail - Mood-Landscape Design (Cinematic style)

CRITICAL GENRE: ${template.name}
Keywords: ${template.keywords}
${template.mustAvoid ? `MUST AVOID: ${template.mustAvoid.join(', ')}` : ''}
${template.mustHave ? `MUST INCLUDE: ${template.mustHave.join(', ')}` : ''}

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
- Depth: Strong sense of depth with foreground, midground, background

COLOR PALETTE & GRADING:
- Primary: ${colors.main} (dominant color, sets the mood)
- Secondary: ${colors.secondary} (supporting color)
- Accent: ${colors.accent} (highlights and points of interest)
- Base: ${colors.background} (foundation color)
- Mood: ${template.mood} color temperature
- Saturation: Vibrant and eye-catching
- Contrast: High contrast (70%+) for visual pop

LIGHTING & EFFECTS:
- Lighting style: ${template.atmosphere}
- Atmosphere: ${template.atmosphere}
- Mood lighting: Colors and lighting work together to create ${template.mood}

${textSection}

COMPOSITION & LAYOUT:
- Layout: ${template.composition}
- Balance: Visual balance with clear focal points
- Negative space: ${includeText ? '30-40% for text placement' : '20-30% for breathing room'}

MOOD & ATMOSPHERE:
- Primary mood: ${template.mood}
- Emotional impact: ${template.atmosphere}
- Genre: ${template.keywords}
- Reference: ${template.referenceStyle}

TECHNICAL SPECS:
- Aspect ratio: 16:9 (YouTube standard)
- Quality: High resolution, professional grade
- Style: ${template.referenceStyle}
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
