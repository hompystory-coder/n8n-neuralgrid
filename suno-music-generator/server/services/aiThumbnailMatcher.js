/**
 * 🤖 AI 기반 썸네일 자동 매칭 시스템
 * 202개 장르를 자동으로 분석하여 적절한 시각적 제약조건 생성
 */

/**
 * 🎨 시각적 요소 데이터베이스 (AI 학습 기반)
 */
const visualDatabase = {
  // 감정/무드 → 시각적 요소 매핑
  moods: {
    'energetic': {
      mustHave: ['dynamic movement', 'bright colors', 'action', 'energy lines'],
      mustAvoid: ['static', 'sitting', 'sleeping', 'calm'],
      colors: { main: '#FB923C', secondary: '#FDE047', accent: '#22D3EE', bg: '#DBEAFE' },
      atmosphere: 'high energy, exciting, makes you want to move'
    },
    'upbeat': {
      mustHave: ['smiling', 'dancing', 'celebration', 'sunlight', 'outdoor'],
      mustAvoid: ['sad', 'dark', 'rain', 'alone', 'crying'],
      colors: { main: '#FB923C', secondary: '#FDE047', accent: '#22D3EE', bg: '#DBEAFE' },
      atmosphere: 'fun, joyful, positive vibes'
    },
    'chill': {
      mustHave: ['relaxed', 'comfortable', 'cozy', 'soft lighting'],
      mustAvoid: ['intense', 'aggressive', 'loud', 'chaotic'],
      colors: { main: '#8B5CF6', secondary: '#F9A8D4', accent: '#FCD34D', bg: '#1E293B' },
      atmosphere: 'calm, relaxing, peaceful'
    },
    'relaxed': {
      mustHave: ['calm scene', 'soft colors', 'peaceful', 'nature'],
      mustAvoid: ['chaos', 'crowd', 'noise', 'intensity'],
      colors: { main: '#10B981', secondary: '#D1FAE5', accent: '#FDE047', bg: '#F0FDF4' },
      atmosphere: 'serene, tranquil, stress-free'
    },
    'emotional': {
      mustHave: ['rain', 'silhouette', 'alone', 'night', 'reflection'],
      mustAvoid: ['party', 'bright', 'celebration', 'crowd'],
      colors: { main: '#1E40AF', secondary: '#A78BFA', accent: '#F472B6', bg: '#0F172A' },
      atmosphere: 'touching, melancholic, deeply emotional'
    },
    'sad': {
      mustHave: ['tears', 'alone', 'rain', 'grey tones', 'empty space'],
      mustAvoid: ['smiling', 'party', 'bright colors', 'celebration'],
      colors: { main: '#64748B', secondary: '#94A3B8', accent: '#CBD5E1', bg: '#1E293B' },
      atmosphere: 'melancholic, sorrowful, touching'
    },
    'romantic': {
      mustHave: ['couple', 'sunset', 'soft light', 'intimate', 'warm colors'],
      mustAvoid: ['alone', 'dark', 'aggressive', 'cold'],
      colors: { main: '#F472B6', secondary: '#FBCFE8', accent: '#FDE047', bg: '#FFF1F2' },
      atmosphere: 'loving, intimate, heartwarming'
    },
    'dark': {
      mustHave: ['shadows', 'night', 'urban', 'neon', 'mystery'],
      mustAvoid: ['bright daylight', 'pastel', 'cute', 'cheerful'],
      colors: { main: '#1F2937', secondary: '#374151', accent: '#EF4444', bg: '#0A0A0A' },
      atmosphere: 'mysterious, intense, edgy'
    },
    'aggressive': {
      mustHave: ['intensity', 'power', 'bold', 'high contrast', 'raw energy'],
      mustAvoid: ['soft', 'gentle', 'pastel', 'calm'],
      colors: { main: '#DC2626', secondary: '#171717', accent: '#FACC15', bg: '#0A0A0A' },
      atmosphere: 'powerful, intense, aggressive'
    },
    'nostalgic': {
      mustHave: ['vintage', 'retro', 'warm tones', 'old photos', 'memories'],
      mustAvoid: ['modern', 'futuristic', 'neon', 'digital'],
      colors: { main: '#D97706', secondary: '#FEF3C7', accent: '#92400E', bg: '#78350F' },
      atmosphere: 'nostalgic, sentimental, warm memories'
    },
    'futuristic': {
      mustHave: ['neon', 'digital', 'technology', 'cyberpunk', 'hologram'],
      mustAvoid: ['vintage', 'natural', 'organic', 'rustic'],
      colors: { main: '#A855F7', secondary: '#EC4899', accent: '#06B6D4', bg: '#3B0764' },
      atmosphere: 'futuristic, high-tech, cyber'
    },
    'powerful': {
      mustHave: ['strength', 'muscles', 'dramatic', 'epic', 'heroic'],
      mustAvoid: ['weak', 'gentle', 'soft', 'delicate'],
      colors: { main: '#DC2626', secondary: '#171717', accent: '#FACC15', bg: '#0A0A0A' },
      atmosphere: 'powerful, epic, inspiring'
    },
    'calm': {
      mustHave: ['peace', 'meditation', 'nature', 'soft', 'zen'],
      mustAvoid: ['chaos', 'loud', 'intense', 'aggressive'],
      colors: { main: '#10B981', secondary: '#D1FAE5', accent: '#FDE047', bg: '#F0FDF4' },
      atmosphere: 'peaceful, zen, calming'
    },
    'meditative': {
      mustHave: ['meditation', 'yoga', 'nature', 'spiritual', 'peaceful'],
      mustAvoid: ['loud', 'party', 'urban', 'technology'],
      colors: { main: '#7C3AED', secondary: '#DDD6FE', accent: '#FDE047', bg: '#F5F3FF' },
      atmosphere: 'meditative, spiritual, healing'
    },
    'healing': {
      mustHave: ['nature', 'water', 'soft light', 'peaceful', 'serene'],
      mustAvoid: ['urban', 'loud', 'chaos', 'dark'],
      colors: { main: '#10B981', secondary: '#D1FAE5', accent: '#FDE047', bg: '#F0FDF4' },
      atmosphere: 'healing, restorative, peaceful'
    },
    'party': {
      mustHave: ['crowd', 'dancing', 'lights', 'celebration', 'drinks'],
      mustAvoid: ['alone', 'quiet', 'study', 'work'],
      colors: { main: '#FB923C', secondary: '#FDE047', accent: '#22D3EE', bg: '#DBEAFE' },
      atmosphere: 'party, celebration, fun times'
    },
    'danceable': {
      mustHave: ['dancing', 'movement', 'rhythm', 'club', 'lights'],
      mustAvoid: ['sitting', 'static', 'calm', 'sleeping'],
      colors: { main: '#EC4899', secondary: '#FDE047', accent: '#8B5CF6', bg: '#1E1B4B' },
      atmosphere: 'danceable, rhythmic, groovy'
    },
    'catchy': {
      mustHave: ['bright', 'colorful', 'pop', 'commercial', 'trendy'],
      mustAvoid: ['dark', 'minimal', 'experimental'],
      colors: { main: '#FB923C', secondary: '#FDE047', accent: '#22D3EE', bg: '#DBEAFE' },
      atmosphere: 'catchy, memorable, radio-friendly'
    },
    'sophisticated': {
      mustHave: ['elegant', 'classy', 'refined', 'artistic'],
      mustAvoid: ['crude', 'messy', 'chaotic', 'loud'],
      colors: { main: '#1F2937', secondary: '#D1D5DB', accent: '#F59E0B', bg: '#111827' },
      atmosphere: 'sophisticated, elegant, refined'
    },
    'heavy': {
      mustHave: ['intensity', 'darkness', 'power', 'aggression'],
      mustAvoid: ['light', 'soft', 'gentle', 'pastel'],
      colors: { main: '#171717', secondary: '#DC2626', accent: '#FACC15', bg: '#0A0A0A' },
      atmosphere: 'heavy, intense, powerful'
    },
    'modern': {
      mustHave: ['contemporary', 'clean', 'digital', 'minimalist'],
      mustAvoid: ['vintage', 'retro', 'old-fashioned'],
      colors: { main: '#3B82F6', secondary: '#93C5FD', accent: '#FDE047', bg: '#F8FAFC' },
      atmosphere: 'modern, contemporary, fresh'
    },
    'vintage': {
      mustHave: ['retro', 'old photos', 'sepia', 'classic'],
      mustAvoid: ['modern', 'digital', 'neon', 'futuristic'],
      colors: { main: '#D97706', secondary: '#FEF3C7', accent: '#92400E', bg: '#78350F' },
      atmosphere: 'vintage, retro, timeless'
    },
    'anthemic': {
      mustHave: ['epic', 'stadium', 'crowd', 'heroic', 'inspiring'],
      mustAvoid: ['intimate', 'quiet', 'minimal'],
      colors: { main: '#DC2626', secondary: '#FDE047', accent: '#FACC15', bg: '#0A0A0A' },
      atmosphere: 'anthemic, epic, inspiring'
    },
    'intimate': {
      mustHave: ['close-up', 'warm', 'personal', 'soft light'],
      mustAvoid: ['crowd', 'stadium', 'loud', 'large scale'],
      colors: { main: '#F472B6', secondary: '#FBCFE8', accent: '#FDE047', bg: '#FFF1F2' },
      atmosphere: 'intimate, personal, warm'
    },
    'groovy': {
      mustHave: ['rhythm', 'funk', 'dancing', 'colorful'],
      mustAvoid: ['static', 'minimal', 'cold'],
      colors: { main: '#EC4899', secondary: '#FDE047', accent: '#8B5CF6', bg: '#1E1B4B' },
      atmosphere: 'groovy, funky, rhythmic'
    },
    'ethereal': {
      mustHave: ['dreamy', 'floating', 'soft', 'mystical', 'atmospheric'],
      mustAvoid: ['harsh', 'aggressive', 'concrete'],
      colors: { main: '#A855F7', secondary: '#DDD6FE', accent: '#FDE047', bg: '#F5F3FF' },
      atmosphere: 'ethereal, dreamy, atmospheric'
    },
    'chaotic': {
      mustHave: ['disorder', 'intense', 'fragmented', 'wild'],
      mustAvoid: ['organized', 'calm', 'minimal', 'clean'],
      colors: { main: '#DC2626', secondary: '#EC4899', accent: '#FACC15', bg: '#0A0A0A' },
      atmosphere: 'chaotic, wild, intense'
    }
  },

  // 악기 → 시각적 요소 매핑
  instruments: {
    'piano': {
      visual: ['piano keys', 'musician hands', 'elegant', 'classical setting'],
      atmosphere: 'sophisticated, emotional, artistic'
    },
    'guitar': {
      visual: ['guitar', 'musician', 'strings', 'rock aesthetic'],
      atmosphere: 'authentic, raw, musical'
    },
    'acoustic-guitar': {
      visual: ['acoustic guitar', 'cozy', 'intimate', 'wooden'],
      atmosphere: 'warm, organic, intimate'
    },
    'electric-guitar': {
      visual: ['electric guitar', 'stage', 'amplifier', 'rock'],
      atmosphere: 'energetic, rock, powerful'
    },
    'synthesizer': {
      visual: ['synth', 'electronic', 'neon', 'modern'],
      atmosphere: 'electronic, futuristic, modern'
    },
    'drums': {
      visual: ['drums', 'drummer', 'sticks', 'rhythm'],
      atmosphere: 'rhythmic, energetic, powerful'
    },
    'saxophone': {
      visual: ['saxophone', 'jazz', 'smoky', 'sophisticated'],
      atmosphere: 'jazzy, smooth, sophisticated'
    },
    'violin': {
      visual: ['violin', 'classical', 'orchestra', 'elegant'],
      atmosphere: 'classical, elegant, emotional'
    },
    '808-bass': {
      visual: ['urban', 'modern', 'street', 'hip-hop'],
      atmosphere: 'modern, hip-hop, bass-heavy'
    }
  },

  // 장르 카테고리 → 시각적 스타일 매핑
  categories: {
    'pop': {
      style: 'colorful, trendy, mainstream, polished',
      referenceStyle: 'Billboard charts, music video aesthetics'
    },
    'rock': {
      style: 'raw, energetic, rebellious, guitar-focused',
      referenceStyle: 'Concert posters, rock magazine covers'
    },
    'electronic': {
      style: 'futuristic, neon, digital, cyber',
      referenceStyle: 'EDM festival visuals, cyberpunk aesthetics'
    },
    'hip-hop': {
      style: 'urban, street, modern, bold',
      referenceStyle: 'Hip-hop album covers, street art'
    },
    'jazz': {
      style: 'sophisticated, vintage, smoky, elegant',
      referenceStyle: 'Jazz club posters, Blue Note records'
    },
    'classical': {
      style: 'elegant, timeless, sophisticated, orchestral',
      referenceStyle: 'Classical concert halls, vintage posters'
    },
    'ambient': {
      style: 'abstract, atmospheric, minimal, ethereal',
      referenceStyle: 'Ambient album art, abstract visuals'
    }
  }
};

/**
 * 🧠 AI 분석: 장르 정보 → 시각적 제약조건 자동 생성
 */
function analyzeGenreForThumbnail(genreInfo) {
  const constraints = {
    mustHave: [],
    mustAvoid: [],
    colors: { main: '#8B5CF6', secondary: '#F9A8D4', accent: '#FCD34D', bg: '#1E293B' },
    atmosphere: '',
    visualElements: '',
    referenceStyle: '',
    energy: 'MEDIUM'
  };

  // 1. Mood 분석 (가장 중요)
  if (genreInfo.mood && genreInfo.mood.length > 0) {
    genreInfo.mood.forEach(mood => {
      const moodData = visualDatabase.moods[mood.toLowerCase()];
      if (moodData) {
        constraints.mustHave.push(...moodData.mustHave);
        constraints.mustAvoid.push(...moodData.mustAvoid);
        constraints.colors = moodData.colors;
        constraints.atmosphere = moodData.atmosphere;
      }
    });
  }

  // 2. BPM 기반 에너지 레벨 결정
  if (genreInfo.bpm) {
    const bpm = genreInfo.bpm.default || genreInfo.bpm.min || 100;
    if (bpm >= 130) {
      constraints.energy = 'HIGH, intense, fast-paced';
      constraints.mustHave.push('motion blur', 'dynamic', 'speed');
    } else if (bpm <= 80) {
      constraints.energy = 'LOW, slow, relaxed';
      constraints.mustHave.push('calm', 'slow motion', 'peaceful');
    } else {
      constraints.energy = 'MEDIUM, balanced, moderate';
    }
  }

  // 3. 악기 기반 시각적 요소 추가
  if (genreInfo.instruments && genreInfo.instruments.length > 0) {
    genreInfo.instruments.forEach(instrument => {
      const instrumentData = visualDatabase.instruments[instrument];
      if (instrumentData) {
        constraints.visualElements += instrumentData.visual.join(', ') + ', ';
        if (!constraints.atmosphere) {
          constraints.atmosphere = instrumentData.atmosphere;
        }
      }
    });
  }

  // 4. 장르 이름 기반 카테고리 추론
  const genreName = genreInfo.name.toLowerCase();
  for (const [category, data] of Object.entries(visualDatabase.categories)) {
    if (genreName.includes(category)) {
      constraints.referenceStyle = data.referenceStyle;
      constraints.visualElements += data.style + ', ';
      break;
    }
  }

  // 5. 중복 제거 및 정리
  constraints.mustHave = [...new Set(constraints.mustHave)];
  constraints.mustAvoid = [...new Set(constraints.mustAvoid)];
  constraints.visualElements = constraints.visualElements.trim();

  // 6. 기본값 설정 (비어있을 경우)
  if (constraints.mustHave.length === 0) {
    constraints.mustHave = ['music', 'artistic', 'creative'];
  }
  if (!constraints.atmosphere) {
    constraints.atmosphere = 'musical, artistic, engaging';
  }
  if (!constraints.referenceStyle) {
    constraints.referenceStyle = 'Modern music visuals, professional quality';
  }

  return constraints;
}

/**
 * 🎯 메인 함수: 장르 → 썸네일 템플릿 자동 생성
 */
function generateThumbnailTemplate(genreInfo, title = '') {
  // AI 분석으로 제약조건 생성
  const constraints = analyzeGenreForThumbnail(genreInfo);

  // 템플릿 구조 생성
  const template = {
    name: genreInfo.name || genreInfo.nameKo || 'Music',
    targetCTR: '7-10%', // 기본 타겟 CTR
    mood: (genreInfo.mood || []).join(', '),
    mustHave: constraints.mustHave,
    mustAvoid: constraints.mustAvoid,
    primaryColors: constraints.colors,
    visualElements: constraints.visualElements || 'Musical scene with artistic elements',
    specificDetails: `${genreInfo.description || ''}, ${constraints.atmosphere}`,
    atmosphere: constraints.atmosphere,
    keywords: genreInfo.name,
    referenceStyle: constraints.referenceStyle,
    composition: constraints.energy.includes('HIGH') 
      ? 'Dynamic diagonal lines, asymmetric layout for energy' 
      : 'Balanced composition, rule of thirds',
    energy: constraints.energy
  };

  return template;
}

module.exports = {
  analyzeGenreForThumbnail,
  generateThumbnailTemplate,
  visualDatabase
};
