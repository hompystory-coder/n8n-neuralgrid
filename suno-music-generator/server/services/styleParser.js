/**
 * 🧠 스타일 문자열 파서
 * 자유형식 스타일 설명에서 핵심 특징 추출
 */

/**
 * BPM 범위로 에너지 레벨 분류
 */
function classifyEnergyFromBPM(bpm) {
  if (bpm < 70) return 'slow';
  if (bpm < 85) return 'calm';
  if (bpm < 100) return 'moderate';
  if (bpm < 120) return 'energetic';  // 100-119 BPM = energetic
  return 'high-energy';
}

/**
 * 스타일 문자열에서 BPM 추출
 */
function extractBPM(styleString) {
  const bpmMatch = styleString.match(/(\d+)\s*bpm/i);
  if (bpmMatch) {
    return parseInt(bpmMatch[1]);
  }
  return null;
}

/**
 * 에너지 레벨 키워드 감지
 */
function detectEnergyLevel(styleString) {
  const styleLower = styleString.toLowerCase();
  
  // High energy indicators
  const highEnergyKeywords = ['up tempo', 'uptempo', 'energetic', 'fast', 'upbeat', 'dance', 
                               'party', 'EDM', 'techno', 'house', 'drum and bass', 'dubstep',
                               'rock', 'metal', 'punk', 'hardcore'];
  
  // Low energy indicators
  const lowEnergyKeywords = ['slow', 'calm', 'relaxing', 'peaceful', 'ambient', 'meditation',
                              'sleep', 'lullaby', 'drone', 'downtempo'];
  
  // Study/work indicators (should NOT be used for upbeat music)
  const studyKeywords = ['study', 'focus', 'work', 'concentration', 'reading', 'office'];
  
  // Check high energy
  for (const keyword of highEnergyKeywords) {
    if (styleLower.includes(keyword)) {
      return { level: 'high', confidence: 0.9 };
    }
  }
  
  // Check low energy
  for (const keyword of lowEnergyKeywords) {
    if (styleLower.includes(keyword)) {
      return { level: 'low', confidence: 0.9 };
    }
  }
  
  // Check if it's study music (but shouldn't be if tempo is high)
  for (const keyword of studyKeywords) {
    if (styleLower.includes(keyword)) {
      return { level: 'study', confidence: 0.7 };
    }
  }
  
  return { level: 'moderate', confidence: 0.5 };
}

/**
 * 장르 카테고리 감지
 */
function detectGenreCategory(styleString) {
  const styleLower = styleString.toLowerCase();
  
  const categoryKeywords = {
    dance: ['dance', 'edm', 'techno', 'house', 'trance', 'dubstep', 'electro', 'club'],
    pop: ['pop', 'k-pop', 'j-pop', 'mainstream'],
    rnb: ['r&b', 'rnb', 'r & b', 'rhythm and blues', 'soul', 'neo-soul'],
    jazz: ['jazz', 'swing', 'bebop', 'fusion', 'smooth jazz'],
    rock: ['rock', 'indie rock', 'alternative rock', 'punk', 'metal'],
    hiphop: ['hip hop', 'hip-hop', 'rap', 'trap', 'boom bap'],
    electronic: ['electronic', 'synth', 'ambient', 'chillwave', 'vaporwave'],
    classical: ['classical', 'orchestra', 'piano', 'violin', 'symphony'],
    acoustic: ['acoustic', 'folk', 'singer-songwriter', 'unplugged'],
    latin: ['latin', 'reggaeton', 'salsa', 'bachata', 'cumbia']
  };
  
  for (const [category, keywords] of Object.entries(categoryKeywords)) {
    for (const keyword of keywords) {
      if (styleLower.includes(keyword)) {
        return category;
      }
    }
  }
  
  return 'general';
}

/**
 * 분위기 키워드 감지
 */
function detectMood(styleString) {
  const styleLower = styleString.toLowerCase();
  
  const moodKeywords = {
    happy: ['happy', 'joyful', 'cheerful', 'uplifting', 'bright', 'sunny', 'positive'],
    sad: ['sad', 'melancholic', 'depressing', 'gloomy', 'heartbreak', 'lonely'],
    energetic: ['energetic', 'powerful', 'intense', 'aggressive', 'driving'],
    calm: ['calm', 'peaceful', 'relaxing', 'soothing', 'tranquil', 'serene'],
    romantic: ['romantic', 'love', 'sensual', 'intimate', 'passionate'],
    dark: ['dark', 'mysterious', 'eerie', 'haunting', 'ominous'],
    playful: ['playful', 'fun', 'quirky', 'whimsical', 'bouncy'],
    emotional: ['emotional', 'touching', 'moving', 'dramatic']
  };
  
  const detectedMoods = [];
  for (const [mood, keywords] of Object.entries(moodKeywords)) {
    for (const keyword of keywords) {
      if (styleLower.includes(keyword)) {
        detectedMoods.push(mood);
        break;
      }
    }
  }
  
  return detectedMoods.length > 0 ? detectedMoods : ['general'];
}

/**
 * 악기 감지
 */
function detectInstruments(styleString) {
  const styleLower = styleString.toLowerCase();
  
  const instruments = [
    'piano', 'guitar', 'bass', 'drums', 'violin', 'cello', 'flute', 'saxophone',
    'trumpet', 'synth', 'synthesizer', 'organ', 'ukulele', 'banjo', 'harp',
    'electric guitar', 'acoustic guitar', 'electric piano'
  ];
  
  const detected = [];
  for (const instrument of instruments) {
    if (styleLower.includes(instrument)) {
      detected.push(instrument);
    }
  }
  
  return detected;
}

/**
 * 보컬 타입 감지
 */
function detectVocalType(styleString) {
  const styleLower = styleString.toLowerCase();
  
  if (styleLower.includes('female vocal') || styleLower.includes('female voice')) {
    return 'female';
  }
  if (styleLower.includes('male vocal') || styleLower.includes('male voice')) {
    return 'male';
  }
  if (styleLower.includes('vocal') || styleLower.includes('singing') || styleLower.includes('voice')) {
    return 'vocal';
  }
  if (styleLower.includes('instrumental') || styleLower.includes('no vocal')) {
    return 'instrumental';
  }
  
  return 'unknown';
}

/**
 * 메인 파서: 스타일 문자열 분석
 * @param {string} styleString - 사용자가 입력한 스타일 설명
 * @returns {object} - 추출된 특징들
 */
function parseStyle(styleString) {
  console.log('🔍 [Style Parser] 입력:', styleString);
  
  const bpm = extractBPM(styleString);
  const energyDetection = detectEnergyLevel(styleString);
  const genreCategory = detectGenreCategory(styleString);
  const moods = detectMood(styleString);
  const instruments = detectInstruments(styleString);
  const vocalType = detectVocalType(styleString);
  
  // BPM 기반 에너지 우선 적용
  let finalEnergy = energyDetection.level;
  let energyConfidence = energyDetection.confidence;
  
  if (bpm !== null) {
    const bpmEnergy = classifyEnergyFromBPM(bpm);
    finalEnergy = bpmEnergy;
    energyConfidence = 0.95; // BPM은 매우 확실한 지표
    console.log(`🎵 BPM ${bpm} 감지 → 에너지 레벨: ${bpmEnergy}`);
  }
  
  // "up tempo" 키워드가 있으면 무조건 energetic 이상으로 격상
  if (styleString.toLowerCase().includes('up tempo') || styleString.toLowerCase().includes('uptempo')) {
    if (finalEnergy === 'study' || finalEnergy === 'moderate' || finalEnergy === 'calm') {
      finalEnergy = 'energetic';
      energyConfidence = 0.95;
      console.log('⚡ "up tempo" 감지 → energetic으로 격상');
    }
  }
  
  const result = {
    original: styleString,
    bpm: bpm,
    energy: {
      level: finalEnergy,
      confidence: energyConfidence
    },
    genreCategory: genreCategory,
    moods: moods,
    instruments: instruments,
    vocalType: vocalType,
    // 편의 플래그
    isHighEnergy: finalEnergy === 'high' || finalEnergy === 'energetic' || finalEnergy === 'high-energy',
    isStudyMusic: finalEnergy === 'study' && energyConfidence > 0.7,
    isDance: genreCategory === 'dance' || moods.includes('energetic'),
    isCalm: finalEnergy === 'low' || finalEnergy === 'calm' || moods.includes('calm')
  };
  
  console.log('✅ [Style Parser] 분석 결과:', result);
  
  return result;
}

module.exports = {
  parseStyle,
  extractBPM,
  detectEnergyLevel,
  detectGenreCategory,
  detectMood,
  detectInstruments,
  detectVocalType,
  classifyEnergyFromBPM
};
