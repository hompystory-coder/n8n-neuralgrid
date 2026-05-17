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
 * 🎨 더 멋진 썸네일 프롬프트 생성 (흥미롭고 클릭하고 싶은 실사 사진)
 * 
 * 개선사항:
 * - 더 다양하고 창의적인 장면 선택
 * - 계절감과 시간대 다양화 (봄, 여름, 가을, 겨울 / 아침, 낮, 저녁)
 * - 더 매력적인 색감과 조명
 * - 독특한 구도와 시각 효과
 */
function generateMoodLandscape(title, template, language, includeText) {
  const colors = template.primaryColors;
  
  // 🎯 장르별 최적 시간대/계절 선택 (브랜드 일관성)
  let timeOfDay, season;
  
  if (template.name.includes('Lo-fi') || template.name.includes('Study')) {
    // Lo-fi: 차분한 시간대만
    timeOfDay = ['sunset golden hour', 'blue hour twilight'][Math.floor(Math.random() * 2)];
    season = ['autumn colorful leaves', 'rainy day reflections'][Math.floor(Math.random() * 2)];
  } else if (template.name.includes('Upbeat') || template.name.includes('Party')) {
    // Upbeat: 활기찬 시간대만
    timeOfDay = ['golden hour sunrise', 'bright midday'][Math.floor(Math.random() * 2)];
    season = ['spring cherry blossoms', 'summer vibrant green'][Math.floor(Math.random() * 2)];
  } else if (template.name.includes('Emotional') || template.name.includes('Night')) {
    // Emotional: 감성적 시간대만
    timeOfDay = ['sunset golden hour', 'blue hour twilight'][Math.floor(Math.random() * 2)];
    season = ['autumn colorful leaves', 'winter magical atmosphere'][Math.floor(Math.random() * 2)];
  } else if (template.name.includes('Cafe')) {
    // Cafe: 따뜻한 시간대만
    timeOfDay = ['warm afternoon', 'sunset golden hour'][Math.floor(Math.random() * 2)];
    season = ['spring cherry blossoms', 'autumn colorful leaves'][Math.floor(Math.random() * 2)];
  } else if (template.name.includes('Workout')) {
    // Workout: 에너지 넘치는 시간대만
    timeOfDay = ['golden hour sunrise', 'bright midday'][Math.floor(Math.random() * 2)];
    season = ['spring cherry blossoms', 'summer vibrant green'][Math.floor(Math.random() * 2)];
  } else {
    // 기본: 밝은 시간대
    timeOfDay = ['warm afternoon', 'sunset golden hour'][Math.floor(Math.random() * 2)];
    season = ['spring cherry blossoms', 'autumn colorful leaves'][Math.floor(Math.random() * 2)];
  }
  
  // 장르별 흥미로운 장소 (더 다양하고 매력적인 옵션)
  let scene = '';
  let visualStyle = '';
  
  if (template.name.includes('Lo-fi') || template.name.includes('Study')) {
    const scenes = [
      `Cozy library with floor-to-ceiling windows overlooking ${season}, warm interior lighting, wooden desks with vintage lamps, books stacked artistically, ${timeOfDay} natural light streaming in`,
      `Japanese-style room with low table, cushions, paper lanterns, large window showing garden with ${season}, peaceful and serene atmosphere, ${timeOfDay}`,
      `Modern minimalist workspace, large window overlooking city skyline during ${season}, clean desk with plants and coffee, ${timeOfDay} creating perfect study mood`,
      `Vintage record store interior, vinyl records on shelves, turntable playing, warm Edison bulb lighting, ${season} visible through storefront window, ${timeOfDay}`
    ];
    scene = scenes[Math.floor(Math.random() * scenes.length)];
    visualStyle = 'Cinematic photography, warm color grading, soft focus background, Instagram aesthetic, cozy and inviting';
  } else if (template.name.includes('Upbeat') || template.name.includes('Party')) {
    const scenes = [
      `Vibrant street festival during ${season}, colorful decorations and lights, food stalls with neon signs, energy and excitement, ${timeOfDay}, no close-up faces`,
      `Rooftop bar overlooking city at ${timeOfDay}, string lights and lanterns, ${season} decorations, cocktails on table, urban nightlife energy, distant people blurred`,
      `Shibuya crossing Tokyo during ${season}, massive LED screens and neon billboards, yellow cabs and pedestrians (far away, blurred), ${timeOfDay}, electric atmosphere`,
      `Beach boardwalk carnival, colorful ferris wheel and rides, palm trees with ${season} feel, ${timeOfDay} creating magical atmosphere, joyful energy`
    ];
    scene = scenes[Math.floor(Math.random() * scenes.length)];
    visualStyle = 'Dynamic urban photography, vibrant neon colors, motion blur effects, high contrast, eye-catching and energetic';
  } else if (template.name.includes('Emotional') || template.name.includes('Night')) {
    const scenes = [
      `Paris Montmartre street with ${season}, vintage street lamps lit during ${timeOfDay}, romantic cobblestone path, charming cafes with warm glow, dreamy atmosphere`,
      `Cherry blossom path in Kyoto during ${season}, traditional architecture, lanterns creating warm glow, ${timeOfDay}, magical and romantic`,
      `Coastal cliff at ${timeOfDay} during ${season}, lighthouse in distance, waves crashing, dramatic sky with clouds, breathtaking natural beauty`,
      `European old town square at ${timeOfDay}, ${season} decorations, fountain in center, historic buildings with warm window lights, nostalgic and emotional`
    ];
    scene = scenes[Math.floor(Math.random() * scenes.length)];
    visualStyle = 'Cinematic photography, emotional color grading, dreamy bokeh effect, film grain texture, romantic and nostalgic';
  } else if (template.name.includes('Cafe')) {
    const scenes = [
      `Parisian outdoor cafe during ${season}, colorful flower baskets hanging, vintage bistro chairs and marble tables, ${timeOfDay} creating perfect cafe ambiance, charming European street`,
      `Modern aesthetic cafe interior, large windows showing ${season} outside, latte art on table, indoor plants, natural wood and white tiles, ${timeOfDay} streaming through windows`,
      `Seaside cafe terrace overlooking ocean, ${season} coastal view, white wooden chairs, colorful umbrellas, ${timeOfDay} reflecting on water, Mediterranean vibe`,
      `Cozy bookshop cafe, bookshelves to ceiling, comfortable armchairs, coffee mugs on vintage tables, ${season} visible through bay windows, ${timeOfDay} creating warm glow`
    ];
    scene = scenes[Math.floor(Math.random() * scenes.length)];
    visualStyle = 'Lifestyle photography, warm inviting colors, shallow depth of field, Instagram cafe aesthetic, cozy and welcoming';
  } else if (template.name.includes('Workout')) {
    const scenes = [
      `Modern city running path along river during ${season}, ${timeOfDay} creating inspiring light, joggers and cyclists in far distance (blurred), Brooklyn Bridge or Han River view, motivational atmosphere`,
      `Outdoor yoga platform overlooking mountains during ${season}, ${timeOfDay} creating magical lighting, yoga mats ready (no people close-up), nature and fitness harmony`,
      `Beach workout area at ${timeOfDay} during ${season}, surfboards and beach volleyball, palm trees, ocean view, active lifestyle energy, people in background only`,
      `Urban park fitness area during ${season}, outdoor gym equipment, green trees, ${timeOfDay}, city skyline background, healthy lifestyle vibe, distant people blurred`
    ];
    scene = scenes[Math.floor(Math.random() * scenes.length)];
    visualStyle = 'Action photography, energetic color grading, dynamic composition, motivational aesthetic, inspiring and powerful';
  } else {
    const scenes = [
      `London double-decker bus on tree-lined street during ${season}, ${timeOfDay}, red phone booth, iconic British architecture, vibrant city life`,
      `Amsterdam canal during ${season}, colorful bicycles parked on bridge, traditional Dutch houses, boats on water, ${timeOfDay}, charming European atmosphere`,
      `San Francisco cable car on hilly street, ${season} trees, Victorian houses, ${timeOfDay}, bay view in distance, iconic California scene`,
      `New York Manhattan street during ${season}, yellow cabs, steam from subway grates, tall buildings, ${timeOfDay}, classic NYC energy`
    ];
    scene = scenes[Math.floor(Math.random() * scenes.length)];
    visualStyle = 'Professional travel photography, vibrant urban colors, dynamic street photography, iconic location aesthetic';
  }
  
  return `📸 STUNNING PROFESSIONAL PHOTOGRAPHY: ${scene}

🎯 STYLE REFERENCE:
- YouTube playlist thumbnails like "WHERE: New York", "WHERE: London", "WHERE: Tokyo"
- Unsplash/Pexels TOP-rated travel and lifestyle photography
- Instagram-worthy, visually stunning, click-magnet thumbnails
- National Geographic quality composition and lighting

✨ VISUAL STYLE: ${visualStyle}

🎨 CRITICAL QUALITY REQUIREMENTS:
✅ MUST HAVE:
  - ULTRA VIBRANT, eye-catching colors (not dull, not washed out)
  - Professional cinematic lighting (${timeOfDay} for natural beauty)
  - Interesting depth and layered composition
  - Rich visual details (signs, flowers, architecture, textures)
  - Instagram-worthy, travel-photography aesthetic
  - Clear focal point with attractive background blur
  - Dynamic elements (movement, reflections, lighting effects)
  - 🔥 CTR OPTIMIZATION: Leave 30-40% bottom space for text overlay
  - 🎯 High contrast background for readable white/yellow text overlay

❌ MUST AVOID:
  - Close-up people faces or portraits in foreground
  - Dark, moody, or poorly lit scenes
  - Flat, boring composition
  - Dull or desaturated colors
  - Illustrations, cartoons, digital art, anime style
  - Cluttered or confusing layouts
  - Generic stock photo look
  - 🚫 Text or typography in the image itself (overlay will be added later)

📐 COMPOSITION GUIDELINES:
- Rule of thirds for dynamic balance
- Leading lines to guide viewer's eye
- Foreground, middle ground, background layers
- Interesting perspective (not just straight-on view)
- ${includeText ? '💡 CTR TIP: Clear bottom 40% space for bold text (genre + mood keywords)' : 'Visually balanced for text overlay later'}
- 🎯 YouTube CTR Strategy: Visual should tell a story that makes viewers CLICK

💡 LIGHTING & ATMOSPHERE:
- ${timeOfDay} creates natural magic hour glow
- Warm color temperature (not cold or clinical)
- Soft shadows and natural highlights
- Atmospheric effects (light rays, bokeh, reflections)

🌈 COLOR PALETTE:
- Primary: ${colors.primary} (vibrant, saturated)
- Accent: ${colors.accent} (eye-catching highlights)
- Overall mood: Cheerful, inviting, inspiring
- High contrast for visibility on mobile

📱 TECHNICAL SPECS:
- 16:9 aspect ratio (YouTube/website standard)
- High resolution 4K quality (3840x2160)
- Professional stock photography level
- Optimized for both desktop and mobile viewing
- Text-ready composition with clear focal areas

🎬 FINAL OUTPUT: Ultra-high quality professional photograph that makes viewers WANT TO CLICK and listen to this music playlist. Stunning, inspiring, and visually memorable.`;
}

/**
 * 🎨 AI 기반 창의적 썸네일 프롬프트 생성 (실험적 고급 옵션)
 * 
 * 더욱 창의적이고 독특한 썸네일을 위한 AI 프롬프트
 */
function generateCreativeThumbnail(title, template, language, includeText) {
  const colors = template.primaryColors;
  
  // 창의적인 테마 선택
  const creativeThemes = [
    `Surreal dreamlike scene blending reality and fantasy, ${template.mood} atmosphere`,
    `Abstract art installation in urban setting, ${template.mood} color palette`,
    `Magical realism photography, everyday location transformed into ${template.mood} wonderland`,
    `Double exposure effect combining nature and cityscape, ${template.mood} feeling`,
    `Cinematic movie poster style composition, ${template.mood} genre aesthetic`
  ];
  
  const theme = creativeThemes[Math.floor(Math.random() * creativeThemes.length)];
  
  return `🎭 CREATIVE ARTISTIC THUMBNAIL: ${theme}

GENRE: ${template.name}
MOOD: ${template.mood}
KEYWORDS: ${template.keywords}

🎨 ARTISTIC DIRECTION:
- Push creative boundaries while maintaining professional quality
- Blend multiple photography techniques for unique visual
- Use color theory for maximum emotional impact
- Create memorable, share-worthy imagery

✨ COLOR & LIGHT:
- Primary palette: ${colors.primary}
- Accent highlights: ${colors.accent}
- Dramatic lighting with artistic flair
- Color grading like premium music videos

📐 COMPOSITION:
- Bold, unconventional framing
- Visual hierarchy for immediate impact
- ${includeText ? 'Dynamic text placement area' : 'Balanced for overlay'}

🎯 GOAL: Create a thumbnail that stands out in a crowded YouTube feed, making viewers curious and eager to click.

TECHNICAL: 16:9, 4K quality, professional photography standards`;
}

module.exports = {
  generateCharacterFocused,
  generateMoodLandscape,
  generateCreativeThumbnail,
  getGenreConstraints
};
