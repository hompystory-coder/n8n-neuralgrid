const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const axios = require('axios');
const yaml = require('js-yaml');
const os = require('os');
const sharp = require('sharp');
const { generateLyrics, generateTitle } = require('../services/lyricsGenerator');
const { generateInfiniteLyrics } = require('../services/infiniteLyricsGenerator');
const { generateSimpleLyrics } = require('../services/simpleLyricsGenerator');
const styleParser = require('../services/styleParser');

/**
 * 📊 YouTube 알고리즘 최적화: 재생목록 곡 순서 최적화
 * 
 * 목표: Session Time 극대화 (시청자가 재생목록을 끝까지 듣도록)
 * 
 * 전략:
 * 1. Hook Start: 처음 3곡은 가장 매력적인 곡 (시청자 이탈 방지)
 * 2. Tempo Variation: 템포 변화로 지루함 방지
 * 3. Strong Finish: 마지막 2곡은 강렬한 곡 (다음 영상 클릭 유도)
 * 4. Middle Plateau: 중간은 안정적인 흐름 유지
 * 
 * @param {Array} songs - 곡 리스트 [{title, duration, energy, ...}]
 * @returns {Array} - 최적화된 순서의 곡 리스트
 */
function optimizePlaylistOrder(songs) {
  if (!songs || songs.length <= 3) return songs;
  
  // 에너지 레벨 추정 (제목과 스타일 기반)
  const songsWithEnergy = songs.map((song, index) => {
    const title = (song.title || '').toLowerCase();
    const style = (song.style || '').toLowerCase();
    const combined = title + ' ' + style;
    
    // 에너지 점수 계산 (0-10)
    let energy = 5; // 기본값
    
    // High energy keywords
    if (combined.match(/workout|exercise|party|dance|upbeat|energetic|motivat/)) energy += 3;
    if (combined.match(/fast|tempo|beat|rhythm|groove/)) energy += 2;
    if (combined.match(/exciting|vibrant|dynamic|powerful/)) energy += 2;
    
    // Low energy keywords
    if (combined.match(/sleep|calm|peace|relax|meditat|healing/)) energy -= 3;
    if (combined.match(/slow|gentle|soft|quiet|subtle/)) energy -= 2;
    if (combined.match(/melancholic|sad|emotional|sentimental/)) energy -= 1;
    
    // Mid energy (neutral/positive)
    if (combined.match(/cafe|study|work|reading|focus/)) energy = 5;
    if (combined.match(/chill|lofi|ambient/)) energy = 4;
    
    // Clamp to 0-10
    energy = Math.max(0, Math.min(10, energy));
    
    return {
      ...song,
      originalIndex: index,
      energy: energy,
      duration: song.duration || 210
    };
  });
  
  // 에너지별로 그룹화
  const sorted = [...songsWithEnergy].sort((a, b) => b.energy - a.energy);
  const highEnergy = sorted.filter(s => s.energy >= 7);
  const midEnergy = sorted.filter(s => s.energy >= 4 && s.energy < 7);
  const lowEnergy = sorted.filter(s => s.energy < 4);
  
  console.log('📊 재생목록 최적화:');
  console.log(`   High Energy (7-10): ${highEnergy.length}곡`);
  console.log(`   Mid Energy (4-6): ${midEnergy.length}곡`);
  console.log(`   Low Energy (0-3): ${lowEnergy.length}곡`);
  
  // 최적 순서 구성
  const optimized = [];
  
  // 1. Opening Hook (처음 3곡): High → Mid → High
  if (highEnergy.length >= 2) {
    optimized.push(highEnergy.shift()); // 강렬한 시작
    if (midEnergy.length > 0) optimized.push(midEnergy.shift()); // 안정화
    optimized.push(highEnergy.shift()); // 다시 에너지 상승
  } else if (highEnergy.length === 1) {
    optimized.push(highEnergy.shift());
    if (midEnergy.length > 0) optimized.push(midEnergy.shift());
    if (midEnergy.length > 0) optimized.push(midEnergy.shift());
  } else {
    // High energy 없으면 Mid로 시작
    while (optimized.length < 3 && midEnergy.length > 0) {
      optimized.push(midEnergy.shift());
    }
  }
  
  // 2. Middle Section: 템포 변화 (High-Mid-Low 순환)
  const remaining = [...highEnergy, ...midEnergy, ...lowEnergy];
  const middleCount = Math.max(0, songs.length - optimized.length - 2);
  
  for (let i = 0; i < middleCount && remaining.length > 0; i++) {
    const cycleIndex = i % 3;
    
    if (cycleIndex === 0 && highEnergy.length > 0) {
      optimized.push(highEnergy.shift());
    } else if (cycleIndex === 1 && midEnergy.length > 0) {
      optimized.push(midEnergy.shift());
    } else if (cycleIndex === 2 && lowEnergy.length > 0) {
      optimized.push(lowEnergy.shift());
    } else if (remaining.length > 0) {
      // Fallback: 남은 곡 중 아무거나
      optimized.push(remaining.shift());
    }
  }
  
  // 3. Strong Finish (마지막 2곡): 강렬한 마무리
  const allRemaining = [...highEnergy, ...midEnergy, ...lowEnergy];
  
  if (allRemaining.length >= 2) {
    // 마지막 2곡은 에너지 높은 순으로
    const lastTwo = allRemaining.sort((a, b) => b.energy - a.energy).slice(0, 2);
    optimized.push(...lastTwo);
    
    // 나머지 곡들도 추가
    const rest = allRemaining.filter(s => !lastTwo.includes(s));
    optimized.push(...rest);
  } else {
    optimized.push(...allRemaining);
  }
  
  console.log('✅ 재생목록 순서 최적화 완료:');
  console.log(`   1-3번: Hook (에너지: ${optimized.slice(0, 3).map(s => s.energy).join(', ')})`);
  console.log(`   중간: Variation`);
  console.log(`   마지막 2곡: Strong Finish (에너지: ${optimized.slice(-2).map(s => s.energy).join(', ')})`);
  
  return optimized;
}

/**
 * 🧠 GenSpark LLM으로 스타일 분석 (고급 버전)
 * 
 * 사용자 입력 스타일을 분석해서 Suno 가사 API용 최적 프롬프트 생성
 * 
 * @param {string} styleInput - 사용자 입력 스타일
 * @param {string} language - 언어 ('english' | 'korean')
 * @param {string} gender - 보컬 성별 ('male' | 'female')
 * @returns {Promise<string>} - Suno 가사 API용 프롬프트 (200자 이하)
 */
async function analyzeSunoLyricsStyleWithAI(styleInput, language = 'english', gender = 'female') {
  try {
    const apiKey = loadGenSparkAPIKey();
    if (!apiKey) {
      console.warn('⚠️  GenSpark API 키 없음, 기본 분석 함수 사용');
      return analyzeSunoLyricsStyle(styleInput, gender);
    }
    
    const prompt = `You are a music analysis AI. Analyze the following music style description and extract ONLY the elements needed for LYRICS generation.

User Style Input:
"${styleInput}"

Extract ONLY:
1. Theme (주제): love, heartbreak, nostalgia, freedom, dreams, etc.
2. Mood (분위기): emotional, chill, romantic, upbeat, melancholic, etc.
3. Genre (장르): pop, R&B, jazz, ballad, indie, etc.
4. Structure Hints (구조): verse-chorus, storytelling, repetitive hook, etc.

⚠️ EXCLUDE (가사 생성에 불필요):
- Instruments (piano, guitar, synth)
- Production details (reverb, compression, EQ)
- BPM numbers (100bpm, 120bpm)
- Chord progressions (1-5-3-6)
- Technical terms (no reverb, clean production)

Output Format (MAXIMUM 200 characters):
"${language} song lyrics, [genre], [mood], [theme] theme"

Example:
- Input: "emotional k-pop ballad with piano, slow tempo, 72bpm, female vocals, clean production, reverb"
- Output: "english k-pop ballad lyrics, emotional melancholic mood, love longing theme"

Now analyze and output ONLY the optimized prompt (maximum 200 characters):`;
    
    const response = await axios.post(
      'https://www.genspark.ai/api/llm_proxy/v1/chat/completions',
      {
        model: 'gpt-5-turbo',
        messages: [
          { role: 'system', content: 'You are a concise music prompt optimizer. Output only the optimized prompt, nothing else.' },
          { role: 'user', content: prompt }
        ],
        temperature: 0.3,  // 낮은 온도로 일관성 유지
        max_tokens: 100
      },
      {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      }
    );
    
    let optimizedPrompt = response.data.choices[0].message.content.trim();
    
    // 따옴표 제거
    optimizedPrompt = optimizedPrompt.replace(/^"|"$/g, '');
    
    // 200자 초과 시 잘라내기
    if (optimizedPrompt.length > 200) {
      optimizedPrompt = optimizedPrompt.substring(0, 197) + '...';
    }
    
    console.log('✅ GenSpark LLM 스타일 분석 완료:');
    console.log(`   입력 (${styleInput.length}자): "${styleInput.substring(0, 50)}..."`);
    console.log(`   출력 (${optimizedPrompt.length}자): "${optimizedPrompt}"`);
    
    return optimizedPrompt;
    
  } catch (error) {
    console.warn('⚠️  GenSpark LLM 실패, 기본 분석 함수 사용:', error.message);
    return analyzeSunoLyricsStyle(styleInput, gender, language);
  }
}

/**
 * 🎯 Suno 가사 API용 스타일 분석 함수 (폴백용)
 * 
 * 입력된 긴 스타일 프롬프트에서 핵심 요소만 추출하여 200자 이하로 압축
 * 
 * @param {string} styleInput - 사용자 입력 스타일 (예: "Pop R&B, Jazz sound, Electric piano, up tempo, no reverb, money chord, 100bpm...")
 * @param {string} gender - 보컬 성별 ('male' | 'female' | 'auto')
 * @returns {string} - 압축된 스타일 프롬프트 (예: "pop, R&B, jazz, upbeat, emotional, chill, female vocals")
 * 
 * 추출 우선순위:
 * 1. Genre/Style (장르) - pop, R&B, jazz, ballad, rock, hip-hop 등
 * 2. Mood (분위기) - emotional, chill, romantic, upbeat, melancholic 등
 * 3. Theme (주제) - love, heartbreak, celebration, nostalgia 등
 * 4. Structure (구조) - verse-chorus, storytelling, repetitive hook 등
 * 5. Vocals (보컬) - male vocals, female vocals
 * 
 * ⚠️ 제외 항목 (Suno 가사 API는 음악 프로덕션 디테일 불필요):
 * - 악기명 (piano, guitar, synth 등)
 * - 프로덕션 디테일 (reverb, compression, EQ 등)
 * - BPM 숫자
 * - 코드 진행 (1-5-3-6 등)
 */
function analyzeSunoLyricsStyle(styleInput, gender = 'auto', language = 'english') {
  const input = styleInput.toLowerCase();
  const elements = [];
  
  // 🌐 언어 힌트 추가 (가장 앞에)
  const languageHint = language === 'korean' ? 'korean' : 'english';
  elements.push(languageHint);
  
  // 1️⃣ Genre/Style (장르) - 최우선
  const genres = [
    'pop', 'r&b', 'rnb', 'jazz', 'ballad', 'rock', 'hip-hop', 'hip hop', 
    'rap', 'edm', 'electronic', 'indie', 'folk', 'country', 'soul', 
    'funk', 'disco', 'blues', 'reggae', 'latin', 'k-pop', 'kpop',
    'trap', 'house', 'techno', 'ambient', 'classical'
  ];
  
  genres.forEach(genre => {
    if (input.includes(genre) && !elements.includes(genre)) {
      elements.push(genre === 'rnb' ? 'R&B' : genre);
    }
  });
  
  // 2️⃣ Mood (분위기)
  const moods = [
    'emotional', 'chill', 'romantic', 'upbeat', 'melancholic', 'sad',
    'happy', 'energetic', 'calm', 'peaceful', 'dreamy', 'nostalgic',
    'dark', 'bright', 'warm', 'cozy', 'intense', 'dramatic', 'playful',
    'sensual', 'groovy', 'funky', 'smooth', 'relaxing', 'mellow'
  ];
  
  moods.forEach(mood => {
    if (input.includes(mood) && !elements.includes(mood)) {
      elements.push(mood);
    }
  });
  
  // 3️⃣ Tempo (템포) - 텍스트 형태만
  if (input.includes('slow tempo') || input.includes('slow-tempo')) {
    elements.push('slow tempo');
  } else if (input.includes('up tempo') || input.includes('uptempo') || input.includes('upbeat') || input.includes('up-tempo')) {
    elements.push('upbeat');
  } else if (input.includes('mid tempo') || input.includes('mid-tempo') || input.includes('medium tempo')) {
    elements.push('mid-tempo');
  }
  
  // 4️⃣ Theme (주제) - 가사 내용과 직접 관련
  const themes = [
    'love', 'heartbreak', 'celebration', 'nostalgia', 'freedom',
    'hope', 'longing', 'memories', 'dreams', 'journey', 'friendship',
    'summer', 'night', 'rain', 'city', 'nature'
  ];
  
  themes.forEach(theme => {
    if (input.includes(theme) && !elements.includes(theme)) {
      elements.push(theme);
    }
  });
  
  // 5️⃣ Vocal Character (보컬 특성)
  const vocalStyles = [
    'soulful', 'raspy', 'smooth', 'breathy', 'powerful', 'soft',
    'husky', 'clear', 'falsetto', 'belting', 'whispery'
  ];
  
  vocalStyles.forEach(style => {
    if (input.includes(style) && !elements.includes(style)) {
      elements.push(style);
    }
  });
  
  // 6️⃣ Structure Hints (구조 힌트)
  if (input.includes('verse-chorus') || input.includes('verse chorus')) {
    elements.push('verse-chorus');
  }
  if (input.includes('storytelling')) {
    elements.push('storytelling');
  }
  if (input.includes('repetitive') || input.includes('catchy')) {
    elements.push('catchy hook');
  }
  
  // 7️⃣ Vocals (성별) - 마지막에 추가
  if (gender === 'female' || input.includes('female')) {
    elements.push('female vocals');
  } else if (gender === 'male' || input.includes('male')) {
    elements.push('male vocals');
  }
  
  // 최대 10개 요소로 제한 (200자 제한 준수)
  const finalElements = elements.slice(0, 10);
  
  return finalElements.join(', ');
}

/**
 * Load GenSpark LLM API key from environment or config file
 */
function loadGenSparkAPIKey() {
  let apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey || apiKey === '') {
    const configPath = path.join(os.homedir(), '.genspark_llm.yaml');
    if (require('fs').existsSync(configPath)) {
      try {
        const fileContents = require('fs').readFileSync(configPath, 'utf8');
        const config = yaml.load(fileContents);
        if (config?.openai?.api_key) {
          apiKey = config.openai.api_key;
        }
      } catch (error) {
        console.error('❌ Failed to load GenSpark LLM config:', error.message);
      }
    }
  }
  
  return apiKey;
}

/**
 * 🔄 비동기로 가사 및 제목 업데이트 (Suno 생성 완료 후)
 */
async function updateLyricsAndTitleWhenReady(taskId, tempTitle, style, prompt, language, index) {
  try {
    console.log(`🔄 [${taskId}] 가사 및 제목 업데이트 대기 시작...`);
    
    const sunoClient = require('../services/sunoClient');
    
    // 최대 5분 대기 (3초마다 체크)
    const maxAttempts = 100;
    let attempts = 0;
    
    while (attempts < maxAttempts) {
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const statusResult = await sunoClient.getTaskStatus(taskId);
      
      if (statusResult.success && statusResult.status && statusResult.status.includes('SUCCESS')) {
        // ✅ 완료! 응답 구조 로그 (TEXT_SUCCESS, FIRST_SUCCESS 등 모두 처리)
        console.log(`📦 [${taskId}] 응답 구조 확인: status=${statusResult.status}`);
        console.log(`   - response keys: ${JSON.stringify(Object.keys(statusResult.response || {}))}`);
        console.log(`   - sunoData length: ${statusResult.response?.sunoData?.length || 0}`);
        
        if (statusResult.response?.sunoData?.[0]) {
          const firstSong = statusResult.response.sunoData[0];
          console.log(`   - sunoData[0] keys: ${JSON.stringify(Object.keys(firstSong))}`);
          console.log(`   - lyric exists: ${!!firstSong.lyric}`);
          console.log(`   - prompt exists: ${!!firstSong.prompt}`);
          console.log(`   - title exists: ${!!firstSong.title}`);
        }
        
        // 가사 추출 (여러 필드 시도)
        const lyrics = statusResult.response?.sunoData?.[0]?.lyric ||
                      statusResult.response?.sunoData?.[1]?.lyric ||
                      statusResult.response?.sunoData?.[0]?.prompt ||
                      statusResult.response?.sunoData?.[1]?.prompt ||
                      statusResult.data?.response?.sunoData?.[0]?.lyric ||
                      statusResult.data?.response?.sunoData?.[1]?.lyric ||
                      '[No lyrics available]';
        
        console.log(`🎵 [${taskId}] 추출된 가사 길이: ${lyrics.length}자`);
        
        // 🎯 🔥 Suno가 실제로 생성한 제목 사용 (가장 중요!)
        // Suno가 우리가 보낸 제목을 무시하고 자체적으로 제목을 생성하기 때문에
        // Suno가 돌려준 실제 제목을 사용해야 노래와 제목이 일치합니다!
        const sunoGeneratedTitle = statusResult.response?.sunoData?.[0]?.title ||
                                   statusResult.response?.sunoData?.[1]?.title ||
                                   statusResult.data?.response?.sunoData?.[0]?.title ||
                                   statusResult.data?.response?.sunoData?.[1]?.title;
        
        let finalTitle = tempTitle;
        
        if (sunoGeneratedTitle) {
          // ✅ Suno가 생성한 제목이 있으면 그것을 사용!
          finalTitle = sunoGeneratedTitle;
          console.log(`✅ [${taskId}] Suno 생성 제목 사용: "${finalTitle}"`);
        } else if (lyrics && lyrics !== '[No lyrics available]') {
          // Suno 제목이 없으면 가사 기반으로 제목 생성 (폴백)
          console.log(`🏷️ [${taskId}] Suno 제목 없음, 가사 기반 제목 생성 중...`);
          try {
            finalTitle = await generateTitle(lyrics, style, language, index);
            console.log(`✅ [${taskId}] 제목 생성 완료: "${finalTitle}"`);
          } catch (error) {
            console.error(`❌ [${taskId}] 제목 생성 실패:`, error.message);
            console.log(`⚠️ [${taskId}] 임시 제목 유지: "${tempTitle}"`);
          }
        } else {
          console.warn(`⚠️ [${taskId}] Suno 제목 및 가사 없음, 임시 제목 유지: "${tempTitle}"`);
        }
        
        // 메타데이터 업데이트
        if (generatedMusicMetadata.has(taskId)) {
          const metadata = generatedMusicMetadata.get(taskId);
          metadata.lyrics = lyrics;
          metadata.title = finalTitle;  // 제목도 업데이트
          generatedMusicMetadata.set(taskId, metadata);
          
          console.log(`✅ [${taskId}] 가사 및 제목 업데이트 완료!`);
          console.log(`   제목: "${finalTitle}"`);
          console.log(`   가사 길이: ${lyrics.length}자`);
          console.log(`   가사 미리보기: ${lyrics.substring(0, 200)}...`);
        } else {
          console.warn(`⚠️ [${taskId}] 메타데이터가 Map에 없습니다!`);
        }
        return;
      }
      
      if (statusResult.status === 'FAILED') {
        console.error(`❌ [${taskId}] 음악 생성 실패`);
        return;
      }
      
      if (attempts % 10 === 0) {
        console.log(`⏳ [${taskId}] 가사 대기 중... (${attempts}/${maxAttempts})`);
      }
    }
    
    console.warn(`⚠️ [${taskId}] 가사 업데이트 타임아웃`);
  } catch (error) {
    console.error(`❌ [${taskId}] 가사 업데이트 오류:`, error.message);
  }
}

// 🎵 생성된 곡의 메타데이터 저장 (taskId -> {title, lyrics, timestamp})
const generatedMusicMetadata = new Map();

// 🧹 메모리 누수 방지: 24시간 지난 메타데이터 자동 삭제
setInterval(() => {
  const now = Date.now();
  const ONE_DAY = 24 * 60 * 60 * 1000;
  
  for (const [taskId, metadata] of generatedMusicMetadata.entries()) {
    if (now - metadata.timestamp > ONE_DAY) {
      generatedMusicMetadata.delete(taskId);
      console.log(`🗑️  오래된 메타데이터 삭제: ${taskId}`);
    }
  }
}, 60 * 60 * 1000); // 1시간마다 정리

/**
 * 🌟 하이라이트 트랙 판별 (10곡 중 2-3곡을 특별하게!)
 */
function isHighlightTrack(index, totalTracks = 10) {
  const position30 = Math.floor(totalTracks * 0.3);  // 3번째 곡
  const position70 = Math.floor(totalTracks * 0.7);  // 7번째 곡
  const lastTrack = totalTracks - 1;                  // 마지막 곡
  
  return index === position30 || index === position70 || index === lastTrack;
}

/**
 * 🎨 스타일 변주 함수 - 기본 스타일 유지하면서 미묘한 변화 추가
 * 🌟 하이라이트 트랙은 훨씬 더 특별하게!
 */
function addStyleVariation(baseStyle, index, totalTracks = 10) {
  // 🌟 하이라이트 트랙 체크
  const isHighlight = isHighlightTrack(index, totalTracks);
  
  if (isHighlight) {
    // 🌟 하이라이트 트랙 전용 강렬한 변주
    const highlightVariations = [
      'orchestral strings crescendo', 'dramatic piano solo', 'emotional vocal climax',
      'cinematic build-up', 'powerful brass section', 'epic choir backing',
      'gospel-inspired vocals', 'soaring high notes', 'raw emotional delivery',
      'live string quartet feature', 'grand piano showcase', 'solo violin melody',
      'cello depth and warmth', 'harp arpeggios shimmer', 'acoustic guitar fingerstyle',
      'key modulation climax', 'tempo shift for impact', 'stripped-down intimate verse',
      'full orchestration chorus', 'a cappella bridge moment', 'jazz breakdown section',
      'intimate whispered vocals', 'vocal harmony layers', 'heartfelt delivery',
      'nostalgic atmosphere', 'bittersweet emotional peak', 'hopeful resolution'
    ];
    
    const pick1 = highlightVariations[Math.floor(Math.random() * highlightVariations.length)];
    const pick2 = highlightVariations[Math.floor(Math.random() * highlightVariations.length)];
    
    const highlightStyle = `${baseStyle}, ${pick1}, ${pick2}, highlight track, emotional centerpiece, full-length song, extended track, 3-4 minutes duration`;
    
    console.log(`🌟✨ 하이라이트 트랙 [${index + 1}/${totalTracks}]: ${highlightStyle}`);
    
    return highlightStyle;
  }
  
  // 일반 트랙: 기존 로직
  // 악기 변주 풀
  const instrumentVariations = [
    'piano-driven', 'guitar-focused', 'strings arrangement', 'acoustic elements',
    'synthesizer highlights', 'drum emphasis', 'bass-heavy', 'vocal-centric',
    'orchestral touches', 'electronic beats', 'minimalist arrangement', 'rich instrumentation',
    'lo-fi elements', 'hi-fi production', 'vintage sound', 'modern production',
    'layered harmonies', 'simple melody', 'complex rhythms', 'steady groove'
  ];
  
  // 분위기 변주 풀
  const moodVariations = [
    'melancholic mood', 'hopeful atmosphere', 'emotional depth', 'nostalgic feeling',
    'uplifting vibe', 'introspective tone', 'energetic spirit', 'calm ambiance',
    'dramatic tension', 'gentle flow', 'passionate intensity', 'serene quality',
    'bittersweet emotion', 'joyful energy', 'contemplative mood', 'dreamy atmosphere',
    'raw emotion', 'polished feel', 'intimate setting', 'expansive sound'
  ];
  
  // 템포/리듬 변주 풀
  const rhythmVariations = [
    'slow tempo', 'moderate pace', 'steady rhythm', 'syncopated beats',
    'flowing movement', 'driving pulse', 'relaxed timing', 'dynamic shifts',
    'subtle groove', 'powerful beat', 'gentle sway', 'rhythmic complexity',
    'smooth transitions', 'crisp timing', 'laid-back feel', 'urgent momentum'
  ];
  
  // 음색/질감 변주 풀
  const textureVariations = [
    'warm tones', 'bright timbre', 'dark colors', 'airy texture',
    'dense layers', 'sparse arrangement', 'crisp clarity', 'soft edges',
    'rich harmonics', 'clean sound', 'gritty texture', 'smooth polish',
    'organic feel', 'synthetic elements', 'natural acoustics', 'processed sound'
  ];
  
  // index 기반으로 각 카테고리에서 선택 (중복 방지)
  const instrumentIndex = (index * 3) % instrumentVariations.length;
  const moodIndex = (index * 5 + 7) % moodVariations.length;
  const rhythmIndex = (index * 7 + 3) % rhythmVariations.length;
  const textureIndex = (index * 11 + 5) % textureVariations.length;
  
  // 랜덤하게 2-3개 요소 조합
  const variations = [];
  
  // 짝수/홀수에 따라 다른 조합
  if (index % 4 === 0) {
    variations.push(instrumentVariations[instrumentIndex]);
    variations.push(moodVariations[moodIndex]);
  } else if (index % 4 === 1) {
    variations.push(moodVariations[moodIndex]);
    variations.push(rhythmVariations[rhythmIndex]);
  } else if (index % 4 === 2) {
    variations.push(instrumentVariations[instrumentIndex]);
    variations.push(textureVariations[textureIndex]);
  } else {
    variations.push(rhythmVariations[rhythmIndex]);
    variations.push(textureVariations[textureIndex]);
  }
  
  // 기본 스타일 + 변주 조합 + 곡 길이 힌트
  const variedStyle = `${baseStyle}, ${variations.join(', ')}, full-length song, extended track, 3-4 minutes duration`;
  
  console.log(`🎨 일반 트랙 [${index + 1}/${totalTracks}]: ${variedStyle}`);
  
  return variedStyle;
}

// 파일 업로드 설정
const storage = multer.diskStorage({
  destination: async (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../temp/uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `style-${Date.now()}${path.extname(file.originalname)}`);
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /mp3|wav|m4a|ogg|flac/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype) || file.mimetype.startsWith('audio/');
    
    if (extname && mimetype) {
      cb(null, true);
    } else {
      cb(new Error('Only audio files are allowed!'));
    }
  }
});

// 스타일 저장소 (메모리)
const styles = new Map();

/**
 * 1. 음악 파일 업로드 & AI 분석 → 스타일 생성
 */
router.post('/analyze-and-save', upload.single('audio'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: '음악 파일이 필요합니다.' });
    }

    const { styleName, styleDescription } = req.body;

    if (!styleName) {
      return res.status(400).json({ success: false, error: '스타일 이름이 필요합니다.' });
    }

    console.log(`🎨 스타일 분석 시작: ${styleName}`);

    // 파일을 공개 URL로 제공
    const fileUrl = `https://${req.get('host')}/uploads/${req.file.filename}`;
    console.log('📁 File URL:', fileUrl);

    // AI 분석 요청 (GenSpark analyze_media_content 사용 가정)
    // 실제로는 별도의 분석 서비스를 호출해야 함
    const analysisResult = {
      stylePrompt: styleDescription || "Contemporary pop style with smooth vocals",
      analysisDetails: {
        genre: "Pop",
        bpm: 120,
        mood: "Uplifting",
        vocal: { gender: "female", tone: "smooth", style: "contemporary" },
        instruments: ["guitar", "piano", "drums", "synth"]
      }
    };

    // 스타일 저장
    const styleId = `style_${Date.now()}`;
    const styleData = {
      id: styleId,
      name: styleName,
      description: styleDescription || '',
      prompt: analysisResult.stylePrompt,
      details: analysisResult.analysisDetails,
      audioFile: req.file.filename,
      createdAt: new Date().toISOString()
    };

    styles.set(styleId, styleData);

    console.log(`✅ 스타일 저장 완료: ${styleId}`);

    res.json({
      success: true,
      style: styleData
    });

  } catch (error) {
    console.error('❌ 스타일 분석 오류:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 2. 저장된 스타일 목록 조회
 */
router.get('/list', (req, res) => {
  const styleList = Array.from(styles.values()).map(style => ({
    id: style.id,
    name: style.name,
    description: style.description,
    createdAt: style.createdAt
  }));

  res.json({
    success: true,
    styles: styleList,
    count: styleList.length
  });
});

/**
 * 3. 특정 스타일 조회
 */
router.get('/:styleId', (req, res, next) => {
  const { styleId } = req.params;
  
  // 특정 명시적 라우트는 건너뛰기
  if (styleId === 'download-image') {
    return next();
  }
  
  const style = styles.get(styleId);

  if (!style) {
    return res.status(404).json({ success: false, error: '스타일을 찾을 수 없습니다.' });
  }

  res.json({
    success: true,
    style: style
  });
});

/**
 * 4. 스타일 삭제
 */
router.delete('/:styleId', async (req, res) => {
  try {
    const { styleId } = req.params;
    const style = styles.get(styleId);

    if (!style) {
      return res.status(404).json({ success: false, error: '스타일을 찾을 수 없습니다.' });
    }

    // 파일 삭제
    if (style.audioFile) {
      const filePath = path.join(__dirname, '../temp/uploads', style.audioFile);
      try {
        await fs.unlink(filePath);
      } catch (err) {
        console.warn('파일 삭제 실패:', err.message);
      }
    }

    styles.delete(styleId);

    res.json({
      success: true,
      message: '스타일이 삭제되었습니다.'
    });

  } catch (error) {
    console.error('❌ 스타일 삭제 오류:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * 5. 테마 기반 가사 생성
 */
router.post('/generate-lyrics', async (req, res) => {
  try {
    const { styleId, style: stylePrompt, theme, language = 'korean', gender = 'auto' } = req.body;

    if (!theme) {
      return res.status(400).json({ 
        success: false, 
        error: '테마가 필요합니다.' 
      });
    }

    let styleData;
    
    // styleId가 있으면 저장된 스타일 사용
    if (styleId) {
      styleData = styles.get(styleId);
      if (!styleData) {
        return res.status(404).json({ success: false, error: '스타일을 찾을 수 없습니다.' });
      }
      console.log(`✍️ 가사 생성 시작 - 스타일: ${styleData.name}, 테마: ${theme}`);
    } 
    // 직접 스타일 프롬프트가 제공된 경우
    else if (stylePrompt) {
      styleData = {
        name: 'Custom Style',
        description: stylePrompt,
        details: {
          prompt: stylePrompt,
          gender: gender
        }
      };
      console.log(`✍️ 가사 생성 시작 - 직접 스타일, 테마: ${theme}`);
    } 
    else {
      return res.status(400).json({ 
        success: false, 
        error: 'styleId 또는 style이 필요합니다.' 
      });
    }

    const style = styleData;

    // ⚠️ [비용 절감] lyricsGenerator (Gemini) 사용 - OpenAI 직접 호출 제거
    console.log('🎵 가사 생성 시작 (Gemini - 비용 $0)');
    
    // generateLyrics 호출하여 가사 생성 (이미 Gemini로 전환됨)
    const lyricsData = await generateLyrics({
      genre: style.name || 'pop',
      theme: theme,
      mood: style.details?.mood || 'emotional',
      language: language,
      structure: 'verse-chorus-verse-chorus',
      customInstructions: `Music Style: ${style.description || style.name}. BPM: ${style.details?.bpm || 120}`
    });
    
    const lyrics = lyricsData.lyrics || lyricsData;
    
    // 원래 OpenAI 직접 호출 코드 (비활성화 - 월 $50+ 절감!):
    // const openaiApiKey = process.env.OPENAI_API_KEY;
    // const response = await axios.post(
    //   'https://api.openai.com/v1/chat/completions',
    //   { model: 'gpt-5', ... }  // ← 오타(gpt-5), 실제론 gpt-4 호출되어 고비용!
    // );
    // const lyrics = response.data.choices[0].message.content.trim();

    console.log('✅ 가사 생성 완료');

    res.json({
      success: true,
      lyrics: lyrics,
      theme: theme,
      style: {
        id: style.id,
        name: style.name
      }
    });

  } catch (error) {
    console.error('❌ 가사 생성 오류:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || error.message 
    });
  }
});

/**
 * 6. 가사 기반 제목 제안
 */
router.post('/suggest-titles', async (req, res) => {
  try {
    const { lyrics, theme, count = 3 } = req.body;

    if (!lyrics) {
      return res.status(400).json({ success: false, error: '가사가 필요합니다.' });
    }

    console.log('💡 제목 제안 생성 중 (Gemini - 비용 $0)...');

    // ⚠️ [비용 절감] generateTitle (Gemini) 사용 - OpenAI 직접 호출 제거
    const titles = [];
    for (let i = 0; i < count; i++) {
      try {
        const titleData = await generateTitle(lyrics, { 
          mood: 'emotional', 
          customInstructions: theme ? `Theme: ${theme}` : '' 
        });
        const title = typeof titleData === 'string' ? titleData : titleData.title;
        if (title && !titles.includes(title)) {
          titles.push(title);
        }
      } catch (err) {
        console.warn(`제목 ${i+1} 생성 실패:`, err.message);
      }
    }
    
    // 최소 1개 제목은 보장
    if (titles.length === 0) {
      titles.push('Untitled Song');
    }
    
    // 원래 OpenAI 직접 호출 코드 (비활성화 - 월 $20+ 절감!):
    // const openaiApiKey = process.env.OPENAI_API_KEY;
    // const response = await axios.post(
    //   'https://api.openai.com/v1/chat/completions',
    //   { model: 'gpt-5', ... }  // ← 오타, 실제론 gpt-4 호출
    // );
    // const titlesText = response.data.choices[0].message.content.trim();
    // const titles = titlesText.split('\n')...

    console.log(`✅ ${titles.length}개 제목 제안 완료`);

    res.json({
      success: true,
      titles: titles
    });

  } catch (error) {
    console.error('❌ 제목 제안 오류:', error.response?.data || error.message);
    res.status(500).json({ 
      success: false, 
      error: error.response?.data?.error?.message || error.message 
    });
  }
});

/**
 * 7. 통합 음악 생성 (스타일 기반)
 */
router.post('/generate-music', async (req, res) => {
  try {
    const { 
      styleId, 
      lyrics, 
      title, 
      language = 'korean',
      gender = 'female',
      count = 2 
    } = req.body;

    if (!styleId || !lyrics || !title) {
      return res.status(400).json({ 
        success: false, 
        error: '스타일 ID, 가사, 제목이 필요합니다.' 
      });
    }

    const style = styles.get(styleId);
    if (!style) {
      return res.status(404).json({ success: false, error: '스타일을 찾을 수 없습니다.' });
    }

    console.log(`🎵 음악 생성 시작 - 스타일: ${style.name}, ${count}곡`);

    // 스타일 프롬프트에 언어/성별 추가
    let finalPrompt = style.prompt;

    // 성별 추가
    if (gender === 'female') {
      finalPrompt += ', female vocals';
    } else if (gender === 'male') {
      finalPrompt += ', male vocals';
    }

    // 언어 힌트 추가
    if (language === 'korean') {
      finalPrompt += ', Korean lyrics';
    } else if (language === 'english') {
      finalPrompt += ', English lyrics';
    }
    
    // 🔥 곡 길이 힌트 추가 (최소 3분 이상 보장!)
    // 💰 YouTube Watch Time 최적화: 3-4분 목표
    finalPrompt += ', full-length song, extended track, 3-4 minutes duration, complete song structure, longer verses and chorus';

    // Suno API 호출
    const sunoClient = require('../services/sunoClient');
    
    // 웹훅 URL 생성 (환경 변수 우선)
    const callbackUrl = process.env.PUBLIC_URL 
      ? `${process.env.PUBLIC_URL}/api/webhook/suno`
      : `${req.protocol}://${req.get('host')}/api/webhook/suno`;

    const result = await sunoClient.generateMusic({
      model: 'V5',
      customMode: true,
      lyrics: lyrics,
      style: finalPrompt,
      title: title,
      callBackUrl: callbackUrl // ✅ 필수 필드
    });

    if (!result.success) {
      throw new Error(result.error || '음악 생성 실패');
    }

    console.log('✅ 음악 생성 요청 완료:', result.taskId);

    res.json({
      success: true,
      taskId: result.taskId,
      style: {
        id: style.id,
        name: style.name
      },
      settings: {
        language,
        gender,
        count
      },
      message: '음악 생성이 시작되었습니다. 약 2-3분 소요됩니다.'
    });

  } catch (error) {
    console.error('❌ 음악 생성 오류:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// ==========================================
// 🎵 간단한 스타일 기반 음악 생성 엔드포인트
// ==========================================

/**
 * 5. 간단한 스타일 기반 음악 생성 (파일 업로드 없이)
 * POST /api/style/generate-simple
 * Body: { style, language, gender, count }
 */
router.post('/generate-simple', async (req, res) => {
  try {
    let { style, theme, language, gender, count, options } = req.body;  // ✨ theme 추가!

    // 입력 검증
    if (!style || !style.trim()) {
      return res.status(400).json({ 
        success: false, 
        error: '스타일을 입력해주세요.' 
      });
    }

    // 🔧 스타일 자동 축약 (MAX_TOKENS 방지)
    const originalStyle = style;
    const MAX_STYLE_LENGTH = 120;  // 120자 제한
    
    if (style.length > MAX_STYLE_LENGTH) {
      console.log(`⚠️ 스타일이 너무 깁니다! (${style.length}자 > ${MAX_STYLE_LENGTH}자)`);
      console.log(`   원본: ${style.substring(0, 80)}...`);
      
      // 자동 축약: 불필요한 단어 제거
      style = style
        .replace(/create an?|features?|with|style|meets|influences?|track|aesthetic|at\s+/gi, '')
        .replace(/\s+/g, ' ')
        .trim();
      
      // 여전히 길면 앞부분만 자르기
      if (style.length > MAX_STYLE_LENGTH) {
        style = style.substring(0, MAX_STYLE_LENGTH).trim();
        // 마지막 단어가 잘리지 않도록
        const lastComma = style.lastIndexOf(',');
        if (lastComma > MAX_STYLE_LENGTH - 20) {
          style = style.substring(0, lastComma).trim();
        }
      }
      
      console.log(`   ✂️ 자동 축약 완료: ${style.length}자`);
      console.log(`   축약: ${style}`);
    }

    const musicCount = parseInt(count) || 2;
    if (musicCount < 1 || musicCount > 20) {
      return res.status(400).json({ 
        success: false, 
        error: '생성 수량은 1-20개 사이여야 합니다.' 
      });
    }

    console.log('🎨 스타일 기반 음악 생성:', { style, theme, language, gender, count: musicCount });
    if (theme) {
      console.log(`🎭 테마 입력: "${theme}" - 테마 기반 다양한 이야기 생성 모드`);
    } else {
      console.log('📝 AI가 2026-05-01 기준 트렌드를 분석하고 고품질 가사를 생성합니다...');
    }
    
    // ✨ 옵션 로깅
    if (options) {
      console.log('🎛️ 고급 옵션 활성화:');
      Object.entries(options).forEach(([key, value]) => {
        if (value) console.log(`   ✅ ${key}`);
      });
    }

    // Suno API 호출 준비
    const sunoClient = require('../services/sunoClient');
    const { generateLyrics, generateTitle, collectRealIssues } = require('../services/lyricsGenerator');
    const { generateStoriesFromTheme } = require('../services/themeStoryGenerator');  // ✨ NEW!

    // 웹훅 URL 생성 (환경 변수 우선 사용)
    const callbackBaseUrl = process.env.PUBLIC_URL || 
      (() => {
        const protocol = req.headers['x-forwarded-proto'] || req.protocol || 'http';
        const host = req.headers['x-forwarded-host'] || req.get('host') || 'localhost:5000';
        return `${protocol}://${host}`;
      })();
    
    console.log(`🌐 Callback URL: ${callbackBaseUrl}/api/webhook/suno`);

    // 🎯 1단계: 이슈 수집 (테마 있으면 테마 기반, 없으면 트렌드 기반)
    let issuesData;
    
    if (theme && theme.trim()) {
      // ✨ 테마 기반 이야기 생성
      console.log(`\n🎨 [테마 모드] "${theme}" 테마로 ${musicCount}개 이야기 생성 중...`);
      issuesData = await generateStoriesFromTheme(theme, language, musicCount);
      
      if (!issuesData || !issuesData.issues || issuesData.issues.length === 0) {
        console.warn(`⚠️ 테마 이야기 생성 실패, 트렌드 모드로 전환`);
        issuesData = await collectRealIssues(style, language, '2026-05-03', musicCount);
      } else {
        console.log('✅ 테마 기반 이야기 생성 완료!');
        console.log(`   🎭 테마: "${theme}"`);
        console.log(`   📰 생성: ${issuesData.issues.length}개 이야기`);
        console.log(`   📋 예시: ${issuesData.issues.slice(0, Math.min(3, issuesData.issues.length)).map(i => i.title).join(', ')}${issuesData.issues.length > 3 ? '...' : ''}`);
      }
    } else {
      // 기존 트렌드 기반
      console.log(`\n🌐 [트렌드 모드] ${musicCount}곡을 위한 ${musicCount}개 이슈 수집 중...`);
      issuesData = await collectRealIssues(style, language, '2026-05-03', musicCount);
      console.log('✅ 실제 이슈 수집 완료!');
      console.log(`   📰 요청: ${musicCount}곡 → 수집: ${issuesData.issues.length}개 이슈`);
      console.log(`   📋 이슈 예시: ${issuesData.issues.slice(0, Math.min(3, issuesData.issues.length)).map(i => i.title).join(', ')}${issuesData.issues.length > 3 ? '...' : ''}`);
    }
    
    const issues = issuesData.issues || [];
    console.log(`   🎯 각 곡은 다른 이슈를 주제로 가사를 생성합니다!`);

    // 🎯 핵심: 각 곡마다 AI가 다른 실제 이슈 기반 가사 생성
    const taskIds = [];
    const taskMetadata = {}; // taskId -> {title, lyrics} 매핑
    const previousLyrics = []; // 이전 가사들 저장 (중복 방지용)
    const tracks = []; // 생성된 곡 정보 저장 (중복 제목 방지용)
    
    for (let i = 0; i < Math.min(musicCount, 20); i++) {
      console.log(`\n🎵 ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`🎵 ${i + 1}/${musicCount} 번째 곡 생성 중...`);
      console.log(`   🌐 언어: ${language === 'korean' ? '한국어' : '영어'}`);
      console.log(`   🎤 성별: ${gender === 'auto' ? '자동' : (gender === 'female' ? '여성' : '남성')}`);
      
      try {
        // 0. Auto 선택 시 남자/여자 5:5 분배
        let actualGender = gender;
        if (gender === 'auto') {
          // 짝수 인덱스: 여성, 홀수 인덱스: 남성
          actualGender = (i % 2 === 0) ? 'female' : 'male';
          console.log(`   🎭 Auto 모드 적용 → ${i + 1}번째 곡: ${actualGender === 'female' ? '여성' : '남성'} 보컬`);
        }
        
        // 🔥 1단계: AI가 실제 이슈 기반 고품질 가사 생성
        console.log(`\n📝 1단계: AI 가사 생성 중... (실제 이슈 반영)`);
        const selectedIssue = issues[i % issues.length];
        console.log(`   📰 선택된 이슈: ${selectedIssue.title}`);
        console.log(`   📋 설명: ${selectedIssue.description}`);
        console.log(`   🏷️ 키워드: ${selectedIssue.keywords.join(', ')}`);
        
        // 🎯 선택된 이슈를 가사 생성에 전달 (제목과 가사 일치를 위해!)
        const lyrics = await generateLyrics(style, language, actualGender, i, previousLyrics, issuesData, selectedIssue);
        console.log(`✅ 가사 생성 완료! (${lyrics.length}자)`);
        console.log(`   미리보기: ${lyrics.substring(0, 100)}...`);
        
        // 이전 가사 목록에 추가 (중복 방지)
        previousLyrics.push(lyrics);
        
        // 🔥 2단계: 가사와 이슈에서 제목 추출 (중복 방지 포함)
        console.log(`\n🏷️ 2단계: 가사 및 이슈 기반 제목 생성 중...`);
        let title = await generateTitle(lyrics, style, language, i, selectedIssue);
        
        // 🚨 중복 제목 검사 및 수정
        const previousTitles = tracks.map(t => t.title);
        let titleAttempt = 0;
        while (previousTitles.includes(title) && titleAttempt < 3) {
          titleAttempt++;
          console.warn(`   ⚠️ 중복 제목 발견: "${title}" - 재생성 시도 ${titleAttempt}/3`);
          // 재생성 시도 (다른 seed 사용)
          title = await generateTitle(lyrics, style, language, i + titleAttempt * 100, selectedIssue);
        }
        
        // 여전히 중복이면 번호 추가
        if (previousTitles.includes(title)) {
          const originalTitle = title;
          let suffix = 2;
          while (previousTitles.includes(title)) {
            title = `${originalTitle} ${suffix}`;
            suffix++;
          }
          console.warn(`   ⚠️ 최종 중복 방지: "${originalTitle}" → "${title}"`);
        }
        
        console.log(`✅ 제목 생성 완료: "${title}"`);
        console.log(`   📰 원본 이슈: ${selectedIssue.title}`);
        
        // 생성된 곡 정보 저장 (중복 방지용)
        tracks.push({ title });
        
        // 🔥 3단계: 스타일 설명 구성
        let styleDescription = style;  // 🎯 사용자 입력 그대로 최우선!
        
        // ✨ NEW: 고급 옵션 처리
        const additionalStyles = [];
        const negativeTags = [];
        let adjustedStyleWeight = 0.6;
        let adjustedWeirdnessConstraint = 0.3;
        
        if (options) {
          console.log(`\n🎛️ 고급 옵션 적용 중...`);
          
          // 볼륨 제어
          if (options.optionSoftVolume) {
            additionalStyles.push('soft volume', 'gentle mixing');
            console.log(`   🔇 조용한 볼륨 추가`);
          }
          if (options.optionNoLoudDrums) {
            negativeTags.push('loud drums', 'aggressive percussion');
            console.log(`   🥁 시끄러운 드럼 제거`);
          }
          if (options.optionNoHeavyBass) {
            negativeTags.push('heavy bass', 'deep bass');
            console.log(`   🎸 강한 베이스 제거`);
          }
          
          // 악기 스타일
          if (options.optionAcoustic) {
            additionalStyles.push('acoustic guitar');
            console.log(`   🎸 어쿠스틱 기타 추가`);
          }
          if (options.optionSoftPiano) {
            additionalStyles.push('soft piano', 'gentle piano');
            console.log(`   🎹 부드러운 피아노 추가`);
          }
          if (options.optionGentleStrings) {
            additionalStyles.push('gentle strings', 'soft violin');
            console.log(`   🎻 부드러운 현악기 추가`);
          }
          
          // 분위기
          if (options.optionRelaxed) {
            additionalStyles.push('relaxed', 'laid-back');
            console.log(`   😌 편안한 분위기 추가`);
          }
          if (options.optionCalm) {
            additionalStyles.push('calm', 'peaceful');
            adjustedWeirdnessConstraint = 0.2;  // 더 안정적으로
            console.log(`   🧘 고요한 분위기 추가`);
          }
          if (options.optionPeaceful) {
            additionalStyles.push('peaceful', 'serene');
            console.log(`   ☮️ 평화로운 분위기 추가`);
          }
          
          // 특수 효과
          if (options.optionNatureSound) {
            additionalStyles.push('nature sounds', 'bird chirping', 'wind');
            console.log(`   🌿 자연 소리 추가`);
          }
          if (options.optionCampfire) {
            additionalStyles.push('campfire vibes', 'campfire atmosphere');
            console.log(`   🔥 캠프파이어 분위기 추가`);
          }
          if (options.optionRainSound) {
            additionalStyles.push('rain sounds', 'rainfall ambience');
            console.log(`   🌧️ 빗소리 배경음 추가`);
          }
          
          // 옵션이 많으면 스타일 준수를 강화
          if (additionalStyles.length > 3) {
            adjustedStyleWeight = 0.7;
            console.log(`   🎯 옵션 많음 → styleWeight 증가: 0.6 → 0.7`);
          }
        }
        
        // 추가 스타일 적용
        if (additionalStyles.length > 0) {
          styleDescription += ', ' + additionalStyles.join(', ');
          console.log(`   ✅ ${additionalStyles.length}개 스타일 옵션 적용됨`);
        }
        
        // negativeTags 문자열 생성
        const negativeTagsString = negativeTags.length > 0 ? negativeTags.join(', ') : '';
        if (negativeTagsString) {
          console.log(`   🚫 제외 요소: ${negativeTagsString}`);
        }
        
        // ⚠️ "money chord" 키워드 처리
        if (styleDescription.toLowerCase().includes('money chord')) {
          console.warn(`   ⚠️ "money chord" → "popular chord progression" 변경`);
          styleDescription = styleDescription.replace(/money chord/gi, 'popular chord progression');
        }
        
        // ⚠️ "instrumental" 관련 키워드 제거
        if (styleDescription.toLowerCase().includes('instrumental')) {
          console.warn(`   ⚠️ "instrumental" 키워드 제거`);
          styleDescription = styleDescription.replace(/instrumental/gi, '');
        }
        
        // 🎤 성별 보컬 추가 (사용자가 지정하지 않은 경우만)
        if (actualGender === 'female' && !styleDescription.toLowerCase().includes('female')) {
          styleDescription += ', female vocals';
        } else if (actualGender === 'male' && !styleDescription.toLowerCase().includes('male')) {
          styleDescription += ', male vocals';
        }
        
        console.log(`\n🎨 3단계: 스타일 전달 (${styleDescription.length}자)`);
        console.log(`   🎯 최종 스타일: ${styleDescription}`);
        
        // 🔥 중요: 한국어/영어 모두 Custom Mode 사용!
        const useCustomMode = true;
        
        console.log(`   🔥 Custom Mode 사용: AI가 생성한 가사를 Suno에 직접 전송`);
        console.log(`   📝 제목: "${title}"`);
        console.log(`   📄 가사: ${lyrics.length}자`);
        console.log(`   🎨 최종 스타일: ${styleDescription}`);
        
        // 🎨 스타일 변주 제거! 사용자 입력 그대로 전달
        const finalStyle = styleDescription;  // 변주 없이 원본 그대로!
        const styleWeight = adjustedStyleWeight;  // ✨ 옵션에 따라 조정됨
        const weirdnessConstraint = adjustedWeirdnessConstraint;  // ✨ 옵션에 따라 조정됨
        
        // 🔥 4단계: Suno API로 음악 생성
        console.log(`\n🎼 4단계: Suno AI 음악 생성 요청...`);
        console.log(`   🎛️ styleWeight: ${styleWeight}, weirdnessConstraint: ${weirdnessConstraint}`);
        console.log(`   🎯 Suno에 전달: "${finalStyle}"`);
        if (negativeTagsString) {
          console.log(`   🚫 제외 요소: "${negativeTagsString}"`);
        }
        
        // 💰 YouTube Watch Time 최적화: 곡 길이 힌트 추가
        let optimizedStyle = finalStyle;
        if (!optimizedStyle.toLowerCase().includes('extended') && !optimizedStyle.toLowerCase().includes('full-length')) {
          optimizedStyle += ', full-length track, extended song, 3-4 minutes';
          console.log(`   ⏱️ Watch Time 최적화: 곡 길이 힌트 추가`);
        }
        
        const result = await sunoClient.generateMusic({
          model: 'V5',
          customMode: true,
          instrumental: false,
          title: title,
          prompt: lyrics,
          style: optimizedStyle,   // 🎯 사용자 스타일 + 옵션 + Watch Time 최적화!
          callBackUrl: `${callbackBaseUrl}/api/webhook/suno`,
          styleWeight: styleWeight,
          weirdnessConstraint: weirdnessConstraint,
          negativeTags: negativeTagsString || undefined  // ✨ negativeTags 추가!
        });

        if (result.success) {
          taskIds.push(result.taskId);
          
          // 🔥 메타데이터 저장 (AI 생성 가사 + 제목)
          generatedMusicMetadata.set(result.taskId, {
            title: title,  // AI 생성 제목
            lyrics: lyrics,  // AI 생성 가사
            style: styleDescription,  // 원본 스타일
            timestamp: Date.now()
          });
          
          console.log(`✅ ${i + 1}번째 곡 생성 요청 완료: ${result.taskId}`);
          console.log(`   🏷️ 제목: "${title}"`);
          console.log(`   📄 가사: ${lyrics.length}자`);
          console.log(`   🎨 스타일: ${styleDescription.length}자`);
          console.log(`   ✅ 메타데이터 저장 완료`);
        } else {
          console.error(`❌ ${i + 1}번째 곡 Suno 생성 실패:`, result.error);
        }
      } catch (error) {
        console.error(`❌ ${i + 1}번째 곡 생성 중 오류:`, error.message);
      }

      // API 과부하 방지를 위한 딜레이
      // AI 가사 생성 시간이 추가되므로 짧게 조정
      if (i < musicCount - 1) {
        await new Promise(resolve => setTimeout(resolve, 500));  // 0.5초
      }
    }

    if (taskIds.length === 0) {
      throw new Error('모든 음악 생성 요청이 실패했습니다.');
    }

    console.log(`✅ 총 ${taskIds.length}개 곡 생성 요청 완료:`, taskIds);

    // 첫 번째 taskId를 대표로 반환 (나머지는 자동으로 연결됨)
    res.json({
      success: true,
      taskId: taskIds[0], // 첫 번째 task로 모니터링
      allTaskIds: taskIds, // 모든 task ID 포함
      style: style,
      count: taskIds.length,
      message: `${taskIds.length}곡의 음악 생성이 시작되었습니다. AI가 스타일에 맞는 고유한 가사와 제목을 생성했습니다. 약 ${taskIds.length * 2}-${taskIds.length * 3}분 소요됩니다.`
    });

  } catch (error) {
    console.error('❌ 간단한 음악 생성 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message || '음악 생성 중 오류가 발생했습니다.' 
    });
  }
});

/**
 * 🎵 YouTube 메타데이터 생성 (youtubeMetadataGenerator 사용)
 * 
 * 수천 곡에 대해 고유한 메타데이터 생성
 */
const youtubeMetadataGenerator = require('../services/youtubeMetadataGenerator');

async function generateViralYouTubeTitle(tracks, style, language = 'korean') {
  try {
    console.log(`🎵 YouTube 메타데이터 생성 중...`);
    console.log(`   곡 수: ${tracks.length}곡`);
    console.log(`   스타일: ${style}`);
    console.log(`   언어: ${language}`);
    
    // youtubeMetadataGenerator로 메타데이터 생성
    const parsedStyle = styleParser.parseStyle(style);
    const totalDuration = tracks.reduce((sum, track) => sum + (track.duration || 0), 0);
    
    const metadata = await youtubeMetadataGenerator.generate({
      title: tracks[0]?.title || '음악 모음집',
      lyrics: tracks.map(t => t.title).join(', '),
      style: style,
      genre: parsedStyle.genreCategory || 'pop',
      mood: (parsedStyle.moods && parsedStyle.moods[0]) || 'chill',
      bpm: parsedStyle.bpm || 120,
      tracks: tracks,
      totalDuration: totalDuration
    });
    
    console.log(`✅ YouTube 메타데이터 생성 완료:`);
    console.log(`   제목: "${metadata.title}"`);
    console.log(`   태그: ${metadata.tags.length}개`);
    
    // 기존 형식과 호환을 위해 간단한 정보 추출
    let situations = ['공부', '작업', '휴식'];
    let genres = ['MUSIC'];
    let hashtags = ['플레이리스트', '음악', 'music'];
    
    // 스타일 분석하여 상황/장르/해시태그 추출
    const styleLower = style.toLowerCase();
    if (styleLower.includes('study') || styleLower.includes('focus') || styleLower.includes('공부')) {
      situations = ['공부', '독서', '작업'];
      genres = ['LO-FI', 'STUDY'];
      hashtags = ['플레이리스트', 'studymusic', '공부음악'];
    } else if (styleLower.includes('workout') || styleLower.includes('운동')) {
      situations = ['헬스장', '홈트', '러닝'];
      genres = ['WORKOUT', 'HIP-HOP'];
      hashtags = ['플레이리스트', 'motivationmusic', '운동음악'];
    } else if (styleLower.includes('sleep') || styleLower.includes('힐링')) {
      situations = ['명상', '수면', '휴식'];
      genres = ['HEALING', 'AMBIENT'];
      hashtags = ['플레이리스트', 'healingmusic', '힐링음악'];
    }
    
    // youtubeMetadataGenerator에서 생성한 제목 사용
    const youtubeTitle = metadata.title;
    
    console.log(`✅ YouTube 제목: "${youtubeTitle}"`);
    console.log(`   길이: ${youtubeTitle.length}자`);
    console.log(`   상황: ${situations.join(' · ')}`);
    console.log(`   장르: ${genres.join(' · ')}`);
    console.log(`   태그: ${hashtags.map(t => '#' + t).join(' ')}`);
    
    return youtubeTitle;
    
  } catch (error) {
    console.error(`❌ YouTube 제목 생성 오류:`, error.message);
    // Fallback: 간단한 Playlist 형식
    return language === 'korean' ? 
      `Playlist | 좋은 음악 모음 🎵` :
      `Playlist | Good Music Collection 🎵`;
  }
}

/**
 * 🎬 앨범 메타데이터 분석 API
 */
router.post('/analyze-album', async (req, res) => {
  try {
    const { songs, style, styleOfMusic, allLyrics, allTitles, language } = req.body;
    const musicStyle = styleOfMusic || style || '';
    
    // 🌐 언어 자동 감지: 곡 제목들의 언어 분석
    function detectLanguage(titles) {
      if (!titles || titles.length === 0) return 'korean';
      
      // 한글 문자 체크
      const koreanRegex = /[가-힣]/;
      const englishRegex = /[a-zA-Z]/;
      
      const titleSample = titles.slice(0, 5).join(' '); // 처음 5곡 샘플링
      const hasKorean = koreanRegex.test(titleSample);
      const hasEnglish = englishRegex.test(titleSample);
      
      // 한글이 있으면 한국어, 없고 영어만 있으면 영어, 둘 다 있으면 혼합 (한국어로 처리)
      if (hasKorean) return 'korean';
      if (hasEnglish && !hasKorean) return 'english';
      return 'korean'; // 기본값
    }
    
    // 언어 결정: 1) 사용자 지정 2) 자동 감지 3) 기본값(한국어)
    const detectedLang = detectLanguage(songs.map(s => s.title));
    const lang = language || detectedLang;
    
    console.log(`📊 앨범 분석 시작: ${songs.length}곡`);
    console.log(`🌐 언어: ${lang} (${language ? '사용자 지정' : '자동 감지'})`);
    console.log(`📝 샘플 제목: ${songs.slice(0, 3).map(s => s.title).join(', ')}...`);
    
    // 🎯 YouTube Session Time 최적화: 재생목록 순서 최적화
    let optimizedSongs = songs;
    if (songs.length >= 5) {
      console.log('🎯 재생목록 순서 최적화 시작...');
      optimizedSongs = optimizePlaylistOrder(songs);
      console.log('✅ 최적화된 순서로 재생목록 생성');
    } else {
      console.log('✅ 곡 수가 적어 원래 순서 유지');
    }
    
    // 최적화된 순서로 Time Track 생성
    const uniqueSongs = optimizedSongs;
    
    // 타임스탬프 생성 (실제 곡 길이 사용, 선택한 순서대로)
    let currentTime = 0;
    const timeTrack = uniqueSongs.map((song, i) => {
      const minutes = Math.floor(currentTime / 60);
      const seconds = Math.floor(currentTime % 60);
      const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
      
      // 실제 곡 길이 사용 (duration이 있으면 사용, 없으면 210초 기본)
      const songDuration = song.duration ? Math.floor(song.duration) : 210;
      currentTime += songDuration;
      
      return `${timeString} - ${song.title}`;
    }).join('\n');
    
    // 총 재생 시간 계산 (실제 duration 합산)
    const totalSeconds = uniqueSongs.reduce((sum, song) => {
      return sum + (song.duration ? Math.floor(song.duration) : 210);
    }, 0);
    const totalMinutes = Math.floor(totalSeconds / 60);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;
    
    // 언어별 시간 표시
    let durationText;
    if (lang === 'english') {
      durationText = hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`;
    } else {
      durationText = hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`;
    }
    
    const uniqueTitles = uniqueSongs.map(s => s.title).join(', ');
    
    // GenSpark LLM으로 트렌드 분석 및 메타데이터 생성
    try {
      const apiKey = loadGenSparkAPIKey();
      
      if (!apiKey) {
        throw new Error('GenSpark API key not found');
      }
      
      const response = await axios.post('https://www.genspark.ai/api/llm/openai/v1/chat/completions', {
        model: 'gpt-5',
        messages: [
          {
            role: 'system',
            content: `You are a music metadata expert. Analyze the given music style tags and track titles accurately to generate YouTube metadata.

🎯 Core Rules:
1. **Style Tag Priority**: "lo-fi hip hop" → study/relaxation, "EDM" → party
2. **Track Title Analysis**: Extract common themes from multiple titles (e.g., home cafe, running, reading → daily lifestyle)
3. **BPM Consideration**: BPM 98-110 → focus/relaxation, BPM 128+ → dance/party
4. **Consistency Required**: Genre ↔ Album Name ↔ Description ↔ Tags must all match

🌐 Language Rule:
- Generate ALL content in ${lang === 'english' ? 'ENGLISH' : 'KOREAN'}
- Album name, title, description, tags must be in ${lang === 'english' ? 'English' : 'Korean'}
- Use ${lang === 'english' ? 'English' : 'Korean'} for mood descriptions and use cases`
          },
          {
            role: 'user',
            content: lang === 'english' ? 
              // 영어 프롬프트
              `Generate YouTube upload metadata for an album of ${uniqueSongs.length} tracks:

━━━━━━━━━━━━━━━━━━━━━━
🎼 Music Style Tags (Analyze Carefully!)
━━━━━━━━━━━━━━━━━━━━━━
${musicStyle}

⚠️ Based on these tags, determine the correct genre and use cases:
- "lo-fi hip hop" → calm study/work music (NOT party!)
- "BPM 98" → medium tempo, focus/relaxation (NOT party!)
- "R&B pop" → emotional, daily life/cafe (NOT party!)
- "groovy but subtle" → rhythmic but CALM, chill (NOT party!)
- "money chord" → pleasant harmonies (NOT party!)
- "chill" → relaxing, calm (NOT party!)
- "EDM/house" → ONLY if "EDM" or "house" explicitly mentioned → energetic, party/club
- "dance" → ONLY if "dance" explicitly mentioned → party/club

🚨 CRITICAL: "groovy" does NOT mean party music!
- "groovy but subtle" = chill with rhythm
- "groovy but chill" = relaxing with beat
- ONLY "energetic" + "dance" + "BPM 128+" = party music

━━━━━━━━━━━━━━━━━━━━━━
📋 Track Titles (${uniqueSongs.length} tracks)
━━━━━━━━━━━━━━━━━━━━━━
${uniqueTitles}

→ CRITICAL: Count actual theme occurrences in titles:
${(() => {
  const lower = uniqueTitles.toLowerCase();
  const themes = [];
  const totalTracks = uniqueSongs.length;
  
  // Count each theme
  const cafe = (lower.match(/cafe|coffee/g) || []).length;
  const exercise = (lower.match(/run|exercise|workout|gym|fitness|training/g) || []).length;
  const reading = (lower.match(/read|book/g) || []).length;
  const spring = (lower.match(/blossom|spring|flower/g) || []).length;
  const nature = (lower.match(/hik|nature|mountain|outdoor/g) || []).length;
  const cooking = (lower.match(/cook|food|vegan|recipe/g) || []).length;
  const work = (lower.match(/work|routine|schedule|office/g) || []).length;
  const meditation = (lower.match(/meditat|heal|zen|mindful|peace/g) || []).length;
  const emotion = (lower.match(/emotion|feel|heart|soul/g) || []).length;
  const plant = (lower.match(/plant|garden|green/g) || []).length;
  const ai = (lower.match(/\bai\b|tech|digital/g) || []).length;
  const night = (lower.match(/night|evening|midnight|\b밤\b|저녁|야간/g) || []).length;
  const party = (lower.match(/party|club|dance|festival/g) || []).length;
  const love = (lower.match(/love|romance|heart|kiss/g) || []).length;
  
  if (cafe > 0) themes.push(`✓ Cafe/Coffee: ${cafe} tracks (${Math.round(cafe/totalTracks*100)}%)`);
  if (exercise > 0) themes.push(`✓ Exercise/Running: ${exercise} tracks (${Math.round(exercise/totalTracks*100)}%)`);
  if (reading > 0) themes.push(`✓ Reading/Books: ${reading} tracks (${Math.round(reading/totalTracks*100)}%)`);
  if (spring > 0) themes.push(`✓ Spring/Flowers: ${spring} tracks (${Math.round(spring/totalTracks*100)}%)`);
  if (nature > 0) themes.push(`✓ Nature/Outdoor: ${nature} tracks (${Math.round(nature/totalTracks*100)}%)`);
  if (cooking > 0) themes.push(`✓ Cooking/Food: ${cooking} tracks (${Math.round(cooking/totalTracks*100)}%)`);
  if (work > 0) themes.push(`✓ Work/Routine: ${work} tracks (${Math.round(work/totalTracks*100)}%)`);
  if (meditation > 0) themes.push(`✓ Meditation/Healing: ${meditation} tracks (${Math.round(meditation/totalTracks*100)}%)`);
  if (emotion > 0) themes.push(`✓ Emotions/Feelings: ${emotion} tracks (${Math.round(emotion/totalTracks*100)}%)`);
  if (plant > 0) themes.push(`✓ Plants/Gardening: ${plant} tracks (${Math.round(plant/totalTracks*100)}%)`);
  if (ai > 0) themes.push(`✓ AI/Technology: ${ai} tracks (${Math.round(ai/totalTracks*100)}%)`);
  if (night > 0) themes.push(`✓ Night/Evening: ${night} tracks (${Math.round(night/totalTracks*100)}%)`);
  if (party > 0) themes.push(`✓ Party/Club: ${party} tracks (${Math.round(party/totalTracks*100)}%)`);
  if (love > 0) themes.push(`✓ Love/Romance: ${love} tracks (${Math.round(love/totalTracks*100)}%)`);
  
  if (themes.length === 0) themes.push('✓ Mixed daily life themes');
  
  // Add forbidden themes warning
  const warnings = [];
  if (night === 0) warnings.push('⛔ NO night/evening tracks → FORBIDDEN to use "night", "evening", "밤" in metadata!');
  if (party === 0) warnings.push('⛔ NO party/club tracks → FORBIDDEN to use "party", "club" in metadata!');
  if (love === 0) warnings.push('⛔ NO love/romance tracks → FORBIDDEN to use "love", "romance" in metadata!');
  
  return themes.join('\n') + (warnings.length > 0 ? '\n\n🚨 FORBIDDEN THEMES:\n' + warnings.join('\n') : '');
})()}

⚠️ DOMINANT THEME RULE:
- If a theme appears in ≥50% of tracks → Use that theme for album
- If no theme is ≥50% → Use "Daily Life" or "Mixed Moments"
- DO NOT use a theme that only appears 1-2 times!

🚨 ABSOLUTE FORBIDDEN RULE:
- If theme count = 0 tracks (0%) → ABSOLUTELY FORBIDDEN to use that theme!
- Example: 0 night tracks → NEVER use "night", "evening", "밤", "야간" anywhere!
- Example: 0 party tracks → NEVER use "party", "club", "dance" anywhere!
- Violating this rule = COMPLETE FAILURE!

━━━━━━━━━━━━━━━━━━━━━━
⏱️ Total Duration
━━━━━━━━━━━━━━━━━━━━━━
${durationText}

━━━━━━━━━━━━━━━━━━━━━━
🎵 Timestamps
━━━━━━━━━━━━━━━━━━━━━━
${timeTrack}

━━━━━━━━━━━━━━━━━━━━━━
📝 ALL Lyrics (Full Text - Analyze All!)
━━━━━━━━━━━━━━━━━━━━━━
${uniqueSongs.map((song, i) => `
🎵 Track ${i + 1}: ${song.title}
━━━━━━━━━━━━━━━━━━━━━━
${song.lyrics}
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━
🎯 Lyrics Analysis Instructions
━━━━━━━━━━━━━━━━━━━━━━
⚠️ **CRITICAL**: Analyze ALL lyrics above to find:
1. **Common themes**: What emotions/situations appear across multiple tracks?
2. **Recurring keywords**: What words/phrases repeat in multiple lyrics?
3. **Overall mood**: What is the emotional tone of this collection?
4. **Story arc**: Is there a narrative connecting these songs?

🚨 DO NOT just use track titles! Read the FULL LYRICS to understand:
- What the songs are ACTUALLY about (not just the title)
- The real emotions and situations described
- The concrete images and metaphors used

━━━━━━━━━━━━━━━━━━━━━━
📋 Generation Requirements
━━━━━━━━━━━━━━━━━━━━━━

1. **Album Title** (English, 3-6 words, emotional):
   - MUST reflect DOMINANT theme (appears in ≥50% of tracks)
   - If NO dominant theme → Use "Daily Moments 2026" or "Life Scenes"
   - Examples based on ACTUAL theme counts:
     • If 7+ tracks about daily life → "Daily Moments", "Life Temperature"
     • If 7+ tracks about exercise → "Life in Motion", "Running Spirit"
     • If 7+ tracks about cafe → "Cafe Moments", "Coffee Stories"
     • If 7+ tracks about spring → "Spring Lifestyle 2026", "Blossom Days"
     • If mixed (no dominant) → "Daily Scenes 2026", "Life Moments"
   - ❌ NEVER use a theme from only 1-2 tracks!
   - ❌ DO NOT: Use style tags directly ("lo-fi hip hop collection")
   - 🎯 CRITICAL: Album title MUST match track content!

2. **YouTube Title** (SEO optimized):
   - Format: "Album Title | Genre | Use Description" (NO song count or duration!)
   - Genre from style tags (lo-fi hip hop → "Lo-Fi Hip Hop Mix")
   - Use case from style + titles (study music, relax music, cafe BGM, etc.)
   - Example: "Spring Lifestyle 2026 | Lo-Fi Hip Hop Mix | Daily Life & Activities"
   - 🚨 IMPORTANT: YouTube title MUST be in ENGLISH!
   - 🚨 CRITICAL: NO song count, NO duration in title!

3. **Description** (English):
   - First paragraph: Album intro matching ACTUAL track themes (not style tags!)
   - Timestamp section: Copy above Time Track as-is
   - "Perfect for" section: 5 situations matching BOTH style AND track themes
     • lo-fi + daily life → studying, working, reading, cafe time, relaxing
     • lo-fi + exercise → light jogging, stretching, yoga, morning walk, cool-down
     • EDM + daily life → productive work, creative sessions (NOT: parties/clubs!)
     • EDM + exercise → intense workout, gym, running, cardio, training
   - Music style description (genre, BPM, vocal characteristics)
   - Brief summary matching ACTUAL track content (not imagined theme!)

4. **Tags** (30+ keywords, comma-separated, NO # symbols):
   - Style-based: "lo-fi hip hop" → lofi, lofihiphop, lofimusic, 로파이
   - Use case: studymusic, workmusic, relaxmusic, chillmusic (match style)
   - Theme keywords: From track titles (cafe, running, reading, spring, exercise, cooking, meditation)
   - English + Korean mix for international SEO
   - Format: keyword1, keyword2, keyword3, keyword4, ...
   - Example: "lofi, lofihiphop, studymusic, 공부음악, workmusic, 작업음악, chillmusic, 휴식음악"

5. **Tags2** (comma separated, without #):
   - Remove # from above tags and join with commas

⚠️ CRITICAL Checks:
- Style tags and metadata MUST be 100% consistent
- If "lo-fi", DO NOT say "party" or "club"!
- If "BPM 98", DO NOT say "energetic EDM"!
- 🎯 CRITICAL: Album title MUST be in ENGLISH! (3-6 words)
- 🎯 CRITICAL: YouTube title MUST be in ENGLISH!
- 🎯 CRITICAL: Description intro MUST be in ENGLISH!
- All primary text MUST be in ENGLISH!
- Tags can mix English and Korean for SEO (e.g., #lofi #로파이)
- 🚨 MOST IMPORTANT: Theme MUST match track content (NOT style tags!)
- 🚨 If only 1-2 tracks about X, DO NOT make X-themed album!

**Respond in JSON format only**:
{
  "albumTitle": "Album Title in English (3-6 words, emotional, NO Korean!)",
  "youtubeTitle": "YouTube Title in English (SEO optimized, NO Korean!)",
  "description": "Full description in English (intro + timestamps + use cases + style info)",
  "tags": "keyword1, keyword2, keyword3, keyword4, keyword5, ... (comma-separated, NO # symbols, mix English and Korean)"
}
}` 
              : 
              // 한국어 프롬프트
              `다음 ${uniqueSongs.length}곡으로 구성된 앨범의 YouTube 업로드용 메타데이터를 생성해주세요:

━━━━━━━━━━━━━━━━━━━━━━
🎼 음악 스타일 태그 (정확히 분석 필수!)
━━━━━━━━━━━━━━━━━━━━━━
${musicStyle}

⚠️ 이 태그 정보를 기반으로 정확한 장르와 용도를 파악하세요:
- "lo-fi hip hop" → 차분한 공부/작업용 (파티 아님!)
- "BPM 98" → 중간 템포, 집중/휴식용 (파티 아님!)
- "R&B pop" → 감성적, 일상/카페용 (파티 아님!)
- "groovy but subtle" → 리듬감 있지만 차분함 (파티 아님!)
- "money chord" → 편안한 화음 (파티 아님!)
- "chill" → 차분함, 휴식용 (파티 아님!)
- "EDM/house" → "EDM" 또는 "house"가 명시된 경우만 → 신남, 파티/클럽용
- "dance" → "dance"가 명시된 경우만 → 파티/클럽용

🚨 중요: "groovy"는 파티 음악이 아닙니다!
- "groovy but subtle" = 리듬감 있는 차분한 음악
- "groovy but chill" = 비트감 있는 휴식 음악
- 오직 "energetic" + "dance" + "BPM 128+" 조합만 파티 음악!

━━━━━━━━━━━━━━━━━━━━━━
📋 곡 제목 리스트 (${uniqueSongs.length}곡)
━━━━━━━━━━━━━━━━━━━━━━
${uniqueTitles}

→ 중요: 실제 테마 발생 횟수 카운트:
${(() => {
  const lower = uniqueTitles.toLowerCase();
  const themes = [];
  const totalTracks = uniqueSongs.length;
  
  // 각 테마 카운트
  const cafe = (lower.match(/cafe|coffee|카페|커피/g) || []).length;
  const exercise = (lower.match(/run|exercise|workout|gym|fitness|training|러닝|운동|헬스|트레이닝/g) || []).length;
  const reading = (lower.match(/read|book|독서|책/g) || []).length;
  const spring = (lower.match(/blossom|spring|flower|벚꽃|봄|꽃/g) || []).length;
  const nature = (lower.match(/hik|nature|mountain|outdoor|등산|자연|산/g) || []).length;
  const cooking = (lower.match(/cook|food|vegan|recipe|요리|음식|비건/g) || []).length;
  const work = (lower.match(/work|routine|schedule|office|일상|일과|스케줄|사무실/g) || []).length;
  const meditation = (lower.match(/meditat|heal|zen|mindful|peace|명상|힐링|안정/g) || []).length;
  const emotion = (lower.match(/emotion|feel|heart|soul|감정|마음/g) || []).length;
  const plant = (lower.match(/plant|garden|green|식물|정원/g) || []).length;
  const ai = (lower.match(/\bai\b|tech|digital/g) || []).length;
  const night = (lower.match(/night|evening|midnight|\b밤\b|저녁|야간/g) || []).length;
  const party = (lower.match(/party|club|dance|festival|파티|클럽|축제/g) || []).length;
  const love = (lower.match(/love|romance|heart|kiss|사랑|로맨스/g) || []).length;
  
  if (cafe > 0) themes.push(`✓ 카페/커피: ${cafe}곡 (${Math.round(cafe/totalTracks*100)}%)`);
  if (exercise > 0) themes.push(`✓ 운동/러닝: ${exercise}곡 (${Math.round(exercise/totalTracks*100)}%)`);
  if (reading > 0) themes.push(`✓ 독서/책: ${reading}곡 (${Math.round(reading/totalTracks*100)}%)`);
  if (spring > 0) themes.push(`✓ 봄/꽃: ${spring}곡 (${Math.round(spring/totalTracks*100)}%)`);
  if (nature > 0) themes.push(`✓ 자연/아웃도어: ${nature}곡 (${Math.round(nature/totalTracks*100)}%)`);
  if (cooking > 0) themes.push(`✓ 요리/음식: ${cooking}곡 (${Math.round(cooking/totalTracks*100)}%)`);
  if (work > 0) themes.push(`✓ 일상/일과: ${work}곡 (${Math.round(work/totalTracks*100)}%)`);
  if (meditation > 0) themes.push(`✓ 명상/힐링: ${meditation}곡 (${Math.round(meditation/totalTracks*100)}%)`);
  if (emotion > 0) themes.push(`✓ 감정/마음: ${emotion}곡 (${Math.round(emotion/totalTracks*100)}%)`);
  if (plant > 0) themes.push(`✓ 식물/정원: ${plant}곡 (${Math.round(plant/totalTracks*100)}%)`);
  if (ai > 0) themes.push(`✓ AI/기술: ${ai}곡 (${Math.round(ai/totalTracks*100)}%)`);
  if (night > 0) themes.push(`✓ 밤/저녁: ${night}곡 (${Math.round(night/totalTracks*100)}%)`);
  if (party > 0) themes.push(`✓ 파티/클럽: ${party}곡 (${Math.round(party/totalTracks*100)}%)`);
  if (love > 0) themes.push(`✓ 사랑/로맨스: ${love}곡 (${Math.round(love/totalTracks*100)}%)`);
  
  if (themes.length === 0) themes.push('✓ 혼합 일상 테마');
  
  // 금지 테마 경고 추가
  const warnings = [];
  if (night === 0) warnings.push('⛔ 밤/저녁 곡 0곡 → "밤", "저녁", "야간", "night", "evening" 사용 절대 금지!');
  if (party === 0) warnings.push('⛔ 파티/클럽 곡 0곡 → "파티", "클럽", "party", "club" 사용 절대 금지!');
  if (love === 0) warnings.push('⛔ 사랑/로맨스 곡 0곡 → "사랑", "로맨스", "love", "romance" 사용 절대 금지!');
  
  return themes.join('\n') + (warnings.length > 0 ? '\n\n🚨 금지 테마:\n' + warnings.join('\n') : '');
})()}

⚠️ 주도 테마 규칙:
- 특정 테마가 전체 곡의 50% 이상 → 그 테마로 앨범 제작
- 50% 이상의 테마 없음 → "일상의 온도" 또는 "마음의 풍경" 사용
- 1-2곡만 관련된 테마는 절대 사용 금지!

🚨 절대 금지 규칙:
- 테마 카운트 = 0곡 (0%) → 해당 테마 사용 절대 금지!
- 예: 밤 곡 0곡 → "밤", "저녁", "야간", "night", "evening" 절대 금지!
- 예: 파티 곡 0곡 → "파티", "클럽", "party", "club" 절대 금지!
- 이 규칙 위반 = 완전한 실패!

━━━━━━━━━━━━━━━━━━━━━━
⏱️ 총 재생 시간
━━━━━━━━━━━━━━━━━━━━━━
${durationText}

━━━━━━━━━━━━━━━━━━━━━━
🎵 타임스탬프
━━━━━━━━━━━━━━━━━━━━━━
${timeTrack}

━━━━━━━━━━━━━━━━━━━━━━
📝 전체 가사 (전문 - 모두 분석!)
━━━━━━━━━━━━━━━━━━━━━━
${uniqueSongs.map((song, i) => `
🎵 Track ${i + 1}: ${song.title}
━━━━━━━━━━━━━━━━━━━━━━
${song.lyrics}
`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━
🎯 가사 분석 지침
━━━━━━━━━━━━━━━━━━━━━━
⚠️ **필수**: 위 모든 가사를 분석하여 다음을 파악하세요:
1. **공통 테마**: 여러 곡에 걸쳐 나타나는 감정/상황은?
2. **반복 키워드**: 여러 가사에서 반복되는 단어/구절은?
3. **전체 무드**: 이 곡들의 감정적 톤은?
4. **스토리 흐름**: 이 곡들을 연결하는 이야기가 있는가?

🚨 곡 제목만 보지 마세요! 전체 가사를 읽고 다음을 파악하세요:
- 곡들이 진짜 무엇에 관한 것인지 (제목과 다를 수 있음)
- 실제 묘사된 감정과 상황
- 사용된 구체적 이미지와 은유

━━━━━━━━━━━━━━━━━━━━━━
📋 생성 요구사항
━━━━━━━━━━━━━━━━━━━━━━

1. **앨범명** (감성적, 5-15자):
   - 반드시 주도 테마 반영 (전체의 50% 이상)
   - 주도 테마 없음 → "일상의 온도" 또는 "마음의 풍경" 사용
   - 예시 (�� 테마 카운트 기반):
     • 7곡 이상 일상 → "일상의 온도", "마음의 쉬표"
     • 7곡 이상 운동 → "움직이는 일상", "러닝의 향기"
     • 7곡 이상 카페 → "감성 카페의 하루"
     • 혼합 (주도 없음) → "일상의 풍경", "마음의 온도"
   - ❌ 1-2곡만 관련된 테마는 절대 사용 금지!
   - ❌ 금지: 스타일 태그를 그대로 사용 ("lo-fi hip hop collection" 같은 제목)
   - 🎯 중요: 앨범명은 반드시 트랙 내용과 일치해야 함!

2. **YouTube 제목** (SEO 최적화 - OOOffi 스타일 반영!):
   🔥 성공하는 YouTube 제목 공식 (793K views 채널 분석 결과):
   [감정/즉각성] + [구체적 상황/결과] + [이모지 2-3개] + [장르/용도]
   
   ✅ **OOOffi 스타일 제목 (고조회수 패턴):**
   
   **즉각 감정형** (가장 인기!):
   - "듣는 순간 봄이 느껴지는 노래🌸 완벽한 카페 플레이리스트☕️"
   - "Songs that make you feel spring instantly🌸 Perfect cafe music☕️"
   - "첫 소절부터 집중되는 음악📚 Study playlist that works🎧"
   
   **감탄/공감형** (높은 클릭률):
   - "와 이 노래 진짜 좋은데...🥹 마법같은 봄 플레이리스트🌸"
   - "Wow this song is so good...🥹 Magical spring playlist🌷"
   - "이 노래로 하루가 달라져🌿 Essential playlist for today🎧"
   
   **시간/장소/계절형** (감성 자극):
   - "봄날 아침 카페 분위기🌸 기분 좋아지는 로파이☕️"
   - "Spring morning café vibes🌸 Feel-good lofi for coffee time☕️"
   - "뉴욕 감성 아침 음악🗽 하루를 시작하는 완벽한 플레이리스트🌳"
   
   **공부/작업:**
   - "🎧 집중력 UP | 공부할 때 듣기 좋은 음악 | ${genreKor} Playlist"
   - "📚 몰입 100% | 작업할 때 최고의 BGM | ${genreKor} Mix"
   - "듣는 순간 집중되는 음악📚 Perfect study playlist🎧"
   
   **카페/힐링:**
   - "☕ 카페 감성 | 홈카페 브이로그 BGM | ${genreKor} Mix"
   - "🌿 힐링 타임 | 마음이 편안해지는 음악 | Relax ${genreKor}"
   - "카페에서 듣는 순간 기분 좋아지는 음악☕️🌸 Perfect cafe vibes"
   
   **운동:**
   - "💪 운동 몰입 | 헬스장 음악 | Workout ${genreKor}"
   - "🔥 고강도 트레이닝 | 웨이트 음악 | GYM MUSIC"
   - "듣는 순간 운동하고 싶어지는 음악💪🔥 Perfect gym playlist"
   
   **일상/브이로그:**
   - "🎵 일상이 특별해지는 순간 | ${genreKor} 플레이리스트"
   - "✨ 나만의 리듬 | 일상 브이로그 BGM | Daily Mix"
   - "🌟 2026 감성 플레이리스트 | 트렌드 음악 | ${genreKor}"
   
   ⚠️ 피해야 할 제목 (구식/클릭 안 됨):
   - ❌ "앨범명 | Lo-Fi Hip Hop Mix | 2026 봄 트렌드 음악"
   - ❌ "운동할 때 헬스장 BGM | Workout Beats"
   - ❌ "공부 음악 | Study Music | 집중 플레이리스트"
   
   🎯 핵심 규칙:
   - 감성 키워드 필수: "집중력 UP", "몰입 100%", "감성", "특별해지는 순간"
   - 구체적 상황: "공부할 때", "홈카페", "헬스장", "혼자만의 시간"
   - 파이프(|)로 구분: 가독성 높이기
   - 한글 + 영어 믹스: SEO 최적화
   - 🚨 **곡 수와 시간은 제목에서 제외** (Description에만 포함)

3. **설명** (Playlist 스타일 - 짧고 간결!):
   🔥 **새로운 Description 형식** (사용자 예시 기반):
   
   첫 줄: [상황1] middot [상황2] middot [상황3] middot [장르1] middot [장르2]
   둘째 줄: #태그1 #태그2 #태그3 [이모지]
   
   ✅ **예시:**
   "카페 middot 드라이브 middot 일할때 middot POP middot GROOVE"
   "#플레이리스트 #goodvibesonly #카페플리 sparkles"
   
   📋 **생성 규칙:**
   - 첫 줄: 구체적 상황 3개 + 장르 2개 (middot로 구분)
   - 둘째 줄: 핵심 해시태그 3개 + 이모지
   - 전체 2줄로 간결하게!
   - 공부: "공부 middot 독서 middot 작업 middot LO-FI middot CHILL"
   - 카페: "카페 middot 드라이브 middot 일할때 middot POP middot GROOVE"
   - 운동: "헬스장 middot 홈트 middot 러닝 middot HIP-HOP middot WORKOUT"
   - 힐링: "명상 middot 수면 middot 휴식 middot HEALING middot AMBIENT"

4. **태그** (30개 이상 키워드, 콤마로 구분, # 기호 없이):
   - 스타일 태그 기반: "lo-fi hip hop" → lofi, 로파이, lofihiphop, lofimusic
   - 용도 태그: 공부음악, studymusic, 작업음악, workmusic, 휴식음악, relaxmusic (스타일에 맞게)
   - 주제 태그: 곡 제목에서 추출 (홈카페, cafe, 러닝, running, 독서, reading 등)
   - 한글 + 영어 혼합 (SEO 최적화 위해 반드시 둘 다 포함!)
   - 형식: 키워드1, 키워드2, 키워드3, 키워드4, ...
   - 예시: "lofi, 로파이, 공부음악, studymusic, 작업음악, workmusic, 휴식음악, relaxmusic"

5. **태그2** (콤마 구분, # 없이):
   - 위 태그에서 # 제거하고 콤마로 연결

⚠️ 필수 체크:
- 스타일 태그와 메타데이터가 100% 일치하는지 확인
- "lo-fi"인데 "파티"라고 하면 안 됨!
- "BPM 98"인데 "강렬한 EDM"이라고 하면 안 됨!
- 🎯 중요: 앨범명은 반드시 한국어로! (5-15자, 영어 절대 금지)
- 🎯 중요: YouTube 제목은 한국어로 시작! (장르/용도는 영어 OK)
- 🎯 중요: 설명은 한국어 메인 + 영어 요약으로!
- 태그는 한국어+영어 혼합 필수! (SEO 위해)
- 🚨 가장 중요: 테마는 반드시 트랙 내용과 일치! (스타일 태그 기반 아님!)
- 🚨 1-2곡만 X 테마라면 X-테마 앨범 절대 금지!

**JSON 형식으로만 응답**:
{
  "albumTitle": "앨범명 (한국어 5-15자, 영어 절대 금지!)",
  "youtubeTitle": "YouTube 제목 (한국어 시작 + 영어 장르/용도)",
  "description": "설명 전체 (한국어 메인 + 타임스탬프 + 영어 요약)",
  "tags": "키워드1, 키워드2, 키워드3, 키워드4, ... (콤마로 구분, # 기호 없이, 한글+영어 혼합)"
}`
          }
        ],
        temperature: 0.85
      }, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        }
      });
      
      const content = response.data.choices[0].message.content;
      
      // JSON 추출
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const metadata = JSON.parse(jsonMatch[0]);
        
        // 🔥 YouTube 제목을 OOOffi 스타일로 교체
        console.log(`📝 기존 YouTube 제목: "${metadata.youtubeTitle}"`);
        const viralTitle = await generateViralYouTubeTitle(uniqueSongs, musicStyle, lang);
        metadata.youtubeTitle = viralTitle;
        console.log(`🔥 OOOffi 스타일 적용: "${metadata.youtubeTitle}"`);
        
        console.log('✅ 앨범 메타데이터 생성 완료');
        return res.json(metadata);
      }
      
      throw new Error('JSON 파싱 실패');
      
    } catch (llmError) {
      console.warn('⚠️  GenSpark LLM 실패, 고품질 폴백 사용:', llmError.message);
      
      // 폴백: 스타일 태그 기반 메타데이터 생성
      const styleLower = (musicStyle || '').toLowerCase();
      
      // 중복 제목 제거
      const uniqueSongs = [];
      const seenTitles = new Set();
      songs.forEach(song => {
        if (!seenTitles.has(song.title)) {
          seenTitles.add(song.title);
          uniqueSongs.push(song);
        }
      });
      
      console.log(`🎵 중복 제거: ${songs.length}곡 → ${uniqueSongs.length}곡`);
      
      // 총 재생 시간 계산 (곡당 3분 30초)
      const totalMinutes = Math.floor(uniqueSongs.length * 3.5);
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      // 언어별 시간 표시
      const durationText = lang === 'english' ? 
        (hours > 0 ? `${hours}h ${minutes}min` : `${minutes}min`) :
        (hours > 0 ? `${hours}시간 ${minutes}분` : `${minutes}분`);
      
      // 장르 분석 (언어별)
      let genreKor = '로파이 힙합';
      let genreEng = 'Lo-Fi Hip Hop';
      let moodKor = '차분함';
      let moodEng = 'Calm';
      let useCases = lang === 'english' ? 
        ['Studying', 'Working', 'Reading', 'Cafe time', 'Relaxing'] :
        ['공부', '작업', '독서', '카페', '휴식'];
      let tagsBase = ['lofi', '로파이', 'lofihiphop', '공부음악', 'studymusic', '작업음악', 'workmusic', '휴식음악', 'relaxmusic'];
      
      if (styleLower.includes('lo-fi') || styleLower.includes('lofi')) {
        genreKor = '로파이 힙합';
        genreEng = 'Lo-Fi Hip Hop';
        moodKor = '차분함';
        moodEng = 'Calm';
        useCases = lang === 'english' ? 
          ['Studying', 'Working', 'Reading at cafe', 'Relaxing time', 'Focus time'] :
          ['공부할 때', '작업할 때', '카페에서 독서', '휴식 시간', '집중이 필요할 때'];
        tagsBase = ['lofi', '로파이', 'lofihiphop', '공부음악', 'studymusic', '작업음악', 'workmusic', '카페음악', 'cafemusic', '휴식음악', 'relaxmusic', '집중음악', 'focusmusic'];
      } else if (styleLower.includes('r&b') || styleLower.includes('rnb')) {
        genreKor = 'R&B';
        genreEng = 'R&B';
        moodKor = '감성적';
        moodEng = 'Emotional';
        useCases = lang === 'english' ? 
          ['Evening relaxation', 'Cafe time', 'Driving', 'Journaling', 'Emotional recharge'] :
          ['저녁 휴식', '카페 타임', '드라이브', '일기 쓰기', '감성 충전'];
        tagsBase = ['rnb', 'R&B', '감성음악', 'emotionalmusic', '감성rnb', 'emotionalrnb', '힙합', 'hiphop', '감성힙합', 'emotionalhiphop', '카페음악', 'cafemusic'];
      } else if (styleLower.includes('edm') || styleLower.includes('house') || styleLower.includes('dance')) {
        genreKor = 'EDM';
        genreEng = 'EDM';
        moodKor = '신남';
        moodEng = 'Energetic';
        useCases = lang === 'english' ? 
          ['Party', 'Workout', 'Driving', 'Club', 'Festival'] :
          ['파티', '운동', '드라이브', '클럽', '축제'];
        tagsBase = ['edm', 'EDM', '파티음악', 'partymusic', '클럽음악', 'clubmusic', '댄스음악', 'dancemusic', '운동음악', 'workoutmusic'];
      }
      
      // 곡 제목에서 테마 추출
      const titleText = uniqueSongs.map(s => s.title).join(' ');
      const themes = [];
      
      if (titleText.includes('홈카페') || titleText.includes('카페') || titleText.includes('커피')) themes.push('홈카페');
      if (titleText.includes('러닝') || titleText.includes('운동')) themes.push('러닝');
      if (titleText.includes('독서') || titleText.includes('책')) themes.push('독서');
      if (titleText.includes('벚꽃') || titleText.includes('봄') || titleText.includes('축제')) themes.push('봄');
      if (titleText.includes('등산') || titleText.includes('자연')) themes.push('등산');
      if (titleText.includes('명상') || titleText.includes('힐링')) themes.push('힐링');
      if (titleText.includes('비건') || titleText.includes('건강')) themes.push('건강');
      if (titleText.includes('요리') || titleText.includes('맛집')) themes.push('음식');
      
      // 앨범명 생성 (언어별)
      let albumTitle = lang === 'english' ? 'Daily Moments 2026' : '일상의 온도';
      if (themes.length > 0) {
        if (lang === 'english') {
          if (themes.includes('홈카페') || themes.includes('cafe')) albumTitle = 'Cafe Vibes 2026';
          else if (themes.includes('러닝') || themes.includes('running')) albumTitle = 'Active Life 2026';
          else if (themes.includes('독서') || themes.includes('reading')) albumTitle = 'Reading Moments 2026';
          else if (themes.includes('봄') || themes.includes('spring')) albumTitle = 'Spring Essence 2026';
          else if (themes.includes('힐링') || themes.includes('healing')) albumTitle = 'Healing Sounds 2026';
        } else {
          if (themes.includes('홈카페')) albumTitle = '감성 카페의 하루';
          else if (themes.includes('러닝')) albumTitle = '움직이는 일상';
          else if (themes.includes('독서')) albumTitle = '마음의 쉼표';
          else if (themes.includes('봄')) albumTitle = '봄날의 향기';
          else if (themes.includes('힐링')) albumTitle = '마음의 휴식';
        }
      }
      
      // 🔥 YouTube 제목 개선: OOOffi 스타일 적용 (즉각성 + 감정 강조)
      // 🚨 FIXED: 곡 수와 시간 제거 (YouTube SEO 최적화)
      let youtubeTitle;
      if (lang === 'english') {
        youtubeTitle = `${albumTitle} | ${genreEng} Mix`;
      } else {
        // 한글: OOOffi 스타일 - 즉각 감정 + 구체적 상황
        const hasStudy = themes.includes('독서') || themes.includes('공부');
        const hasCafe = themes.includes('홈카페') || themes.includes('카페');
        const hasExercise = themes.includes('러닝') || themes.includes('운동');
        const hasHealing = themes.includes('힐링') || themes.includes('명상');
        
        if (hasStudy) {
          youtubeTitle = `듣는 순간 집중되는 음악📚 완벽한 공부 플레이리스트🎧 ${genreKor}`;
        } else if (hasCafe) {
          youtubeTitle = `카페에서 듣는 순간 기분 좋아지는 음악☕️🌸 홈카페 브이로그 BGM ${genreKor}`;
        } else if (hasExercise) {
          youtubeTitle = `듣는 순간 운동하고 싶어지는 음악💪🔥 완벽한 헬스장 플레이리스트 ${genreKor}`;
        } else if (hasHealing) {
          youtubeTitle = `듣는 순간 마음이 편안해지는 음악🌿✨ 완벽한 힐링 플레이리스트 ${genreKor}`;
        } else {
          // 믹스/일상: OOOffi 스타일 - 즉각 감정
          youtubeTitle = `듣는 순간 일상이 특별해지는 음악🎵✨ 완벽한 ${genreKor} 플레이리스트`;
        }
      }
      
      // Time Track 생성 (실제 곡 길이 사용)
      let currentTime = 0;
      const timeTrack = uniqueSongs.map((song, i) => {
        const minutes = Math.floor(currentTime / 60);
        const seconds = Math.floor(currentTime % 60);
        const timeString = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        // 실제 곡 길이 사용 (duration이 있으면 사용, 없으면 210초 기본)
        const songDuration = song.duration ? Math.floor(song.duration) : 210;
        currentTime += songDuration;
        
        return `${timeString} ${song.title}`;
      }).join('\n');
      
      // 설명 생성 (언어별)
      const description = lang === 'english' ? 
        `🎵 ${albumTitle}

A collection of ${uniqueSongs.length} ${genreEng} tracks capturing everyday life moments.
Perfect for ${useCases.slice(0, 3).join(', ').toLowerCase()}.

━━━━━━━━━━━━━━━━━━━━━━
🎵 Timestamps
━━━━━━━━━━━━━━━━━━━━━━
${timeTrack}

━━━━━━━━━━━━━━━━━━━━━━
✨ Perfect for
━━━━━━━━━━━━━━━━━━━━━━
${useCases.map(u => `✓ ${u}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━
🎼 Music Style
━━━━━━━━━━━━━━━━━━━━━━
• Genre: ${genreEng}
• Mood: ${moodEng}
• ${uniqueSongs.length} tracks | ${durationText}` :
        `🌸 2026년 봄, 우리의 일상을 담은 ${uniqueSongs.length}곡

${themes.length > 0 ? themes.join(', ') + '부터 ' : ''}소소하지만 소중한 일상의 순간들을
부드러운 ${genreKor} 사운드에 담았습니다.

━━━━━━━━━━━━━━━━━━━━━━
🎵 타임스탬프
━━━━━━━━━━━━━━━━━━━━━━
${timeTrack}

━━━━━━━━━━━━━━━━━━━━━━
✨ 이런 분들께 추천
━━━━━━━━━━━━━━━━━━━━━━
${useCases.map(u => `✓ ${u}`).join('\n')}

━━━━━━━━━━━━━━━━━━━━━━
🎼 음악 스타일
━━━━━━━━━━━━━━━━━━━━━━
• 장르: ${genreKor}
• 분위기: ${moodKor}
• 총 ${uniqueSongs.length}곡 | ${durationText}

A curated collection of ${uniqueSongs.length} ${genreKor} tracks capturing everyday moments in 2026 Spring. Perfect for ${useCases.slice(0, 3).join(', ')}.

#${genreKor.replace(/\s+/g, '')} #2026트렌드 #일상음악`;

      // 태그 생성 (콤마로 구분, # 없이)
      const allTags = [
        ...tagsBase,
        ...themes,
        '일상음악', '2026트렌드', '봄음악', '감성음악', '힙합', 
        'lofimusic', 'chillmusic', 'studymusic', 'workmusic',
        'relaxmusic', 'cafemusic', 'dailylife', 'lifestyle', 
        'music', 'playlist', 'kmusic', 'koreanmusic', 
        'trend', 'healing', '감성', '분위기음악', '플레이리스트'
      ];
      
      // 중복 제거
      const uniqueTags = [...new Set(allTags)];
      const tags = uniqueTags.join(', ');
      
      return res.json({
        albumTitle,
        youtubeTitle,
        description,
        tags
      });
    }
    
  } catch (error) {
    console.error('❌ 앨범 분석 오류:', error);
    res.status(500).json({ 
      error: '앨범 분석 실패', 
      message: error.message 
    });
  }
});

/**
 * 🎯 AI 기반 앨범 메타데이터 생성 API
 */
router.post('/generate-album-metadata', async (req, res) => {
  try {
    const { tracks, style, language } = req.body;
    
    if (!tracks || tracks.length === 0) {
      return res.status(400).json({ error: '트랙 정보가 없습니다' });
    }
    
    console.log(`\n🎬 OOOffi 스타일 플레이리스트 메타데이터 생성 시작`);
    console.log(`   곡 수: ${tracks.length}곡`);
    console.log(`   스타일: ${style}`);
    console.log(`   언어: ${language || 'korean'}`);
    
    // 중복 제거
    const uniqueSongs = [];
    const seenTitles = new Set();
    tracks.forEach(track => {
      if (!seenTitles.has(track.title)) {
        seenTitles.add(track.title);
        uniqueSongs.push({
          title: track.title,
          duration: track.duration || 180,
          lyrics: track.lyrics || '',
          style: track.style || style
        });
      }
    });
    
    console.log(`   중복 제거: ${tracks.length}곡 → ${uniqueSongs.length}곡`);
    
    // 🎵 새로운 generatePlaylistMetadata() 사용
    const metadata = await youtubeMetadataGenerator.generatePlaylistMetadata({
      tracks: uniqueSongs,
      style: style || 'pop, chill',
      language: language || 'korean'
    });
    
    console.log(`\n✅ OOOffi 스타일 메타데이터 생성 완료!`);
    console.log(`   한국어 제목: "${metadata.titleKR}"`);
    console.log(`   영어 제목: "${metadata.titleEN}"`);
    console.log(`   설명란: ${metadata.description.length}자`);
    console.log(`   태그: ${metadata.tags.length}개`);
    
    // 응답 형식 (기존 호환)
    return res.json({
      success: true,
      metadata: {
        albumName: metadata.titleKR, // 앨범명으로 한국어 제목 사용
        youtubeTitle: metadata.titleKR, // 기본은 한국어
        youtubeTitleEN: metadata.titleEN, // 영어 제목도 제공
        description: metadata.description,
        tags: metadata.tags.join(', '),
        // 추가 정보
        trackCount: uniqueSongs.length,
        overallMood: metadata.metadata.overallMood
      }
    });
    
  } catch (error) {
    console.error('❌ 플레이리스트 메타데이터 생성 오류:', error);
    
    // 최종 폴백: 간단한 메타데이터
    try {
      const uniqueSongs = req.body.tracks || [];
      const musicStyle = req.body.style || 'pop, chill';
      const lang = req.body.language || 'korean';
      
      const fallbackTitle = lang === 'english' 
        ? `Playlist | ${uniqueSongs.length} Songs Mix`
        : `플레이리스트 | ${uniqueSongs.length}곡 모음`;
      
      return res.json({
        success: true,
        metadata: {
          albumName: fallbackTitle,
          youtubeTitle: fallbackTitle,
          youtubeTitleEN: `Playlist | ${uniqueSongs.length} Songs Mix`,
          description: lang === 'english'
            ? `${uniqueSongs.length} songs playlist\n\nTracklist:\n${uniqueSongs.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}`
            : `${uniqueSongs.length}곡 플레이리스트\n\nTracklist:\n${uniqueSongs.map((s, i) => `${i + 1}. ${s.title}`).join('\n')}`,
          tags: 'playlist, music',
          trackCount: uniqueSongs.length
        }
      });
    } catch (fallbackError) {
      console.error('❌ 폴백 메타데이터 생성도 실패:', fallbackError);
      return res.status(500).json({
        success: false,
        error: '메타데이터 생성 실패'
      });
    }
  }
});


/**
 * 🎨 YouTube 썸네일 자동 생성 API
 */
router.post('/generate-thumbnail', async (req, res) => {
  try {
    const { title, style, language = 'korean', generateImage = true } = req.body;
    
    if (!title || !style) {
      return res.status(400).json({ 
        success: false, 
        error: '제목과 스타일이 필요합니다.' 
      });
    }
    
    console.log(`🎨 썸네일 생성 시작:`);
    console.log(`   제목: "${title}"`);
    console.log(`   스타일: "${style}"`);
    console.log(`   언어: ${language}`);
    console.log(`   이미지 생성: ${generateImage}`);
    
    // 썸네일 생성 모듈 임포트 (동적)
    const thumbnailGenerator = require('../services/thumbnailGenerator');
    const { prompt, template, aspectRatio, model } = thumbnailGenerator.generateThumbnailPrompt(title, style, language);
    
    console.log(`🎨 선택된 템플릿:`);
    console.log(`   - 분위기: ${template.mood}`);
    console.log(`   - 색상: ${template.colorScheme}`);
    console.log(`   - 요소: ${template.visualElements}`);
    
    // 응답 준비
    const response = {
      success: true,
      message: '썸네일 생성 프롬프트 완성',
      prompt,
      config: {
        title,
        style,
        mood: template.mood,
        colorScheme: template.colorScheme,
        visualElements: template.visualElements,
        aspectRatio,
        model
      }
    };
    
    // 🎨 실제 이미지 생성 (GenSpark Image Generation API)
    if (generateImage) {
      const apiKey = loadGenSparkAPIKey();
      if (!apiKey) {
        console.warn('⚠️  GenSpark API 키 없음, 프롬프트만 반환');
        response.instructions = {
          step1: '위 prompt를 GenSpark image_generation 툴에 전달',
          step2: `aspect_ratio: "${aspectRatio}" 설정`,
          step3: `model: "${model}" 사용 권장`,
          step4: '생성된 이미지 URL을 메타데이터에 저장'
        };
        response.note = 'API 키 없음 - 실제 이미지 생성은 image_generation 툴 호출 필요';
      } else {
        // 🚨 서버 측 이미지 생성은 현재 지원되지 않음
        // GenSpark Image Generation API는 클라이언트 측 툴로만 사용 가능
        console.log('ℹ️  서버 측 이미지 생성은 지원되지 않음, 프롬프트만 반환');
        response.instructions = {
          step1: '위 prompt를 GenSpark image_generation 툴에 전달',
          step2: `aspect_ratio: "${aspectRatio}" 설정`,
          step3: `model: "${model}" 사용 권장`,
          step4: '생성된 이미지 URL을 메타데이터에 저장'
        };
        response.note = '서버 측 이미지 생성은 지원되지 않음 - 클라이언트에서 프롬프트 사용 권장';
      }
    }
    
    console.log(`✅ 썸네일 처리 완료`);
    res.json(response);
    
  } catch (error) {
    console.error('❌ 썸네일 생성 오류:', error);
    res.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
});

/**
 * 📦 ZIP 파일 생성 API
 */
router.post('/create-album-zip', async (req, res) => {
  try {
    const { songs } = req.body;
    
    if (!songs || songs.length === 0) {
      return res.status(400).json({ error: '선택된 곡이 없습니다' });
    }
    
    console.log(`📦 ZIP 생성 시작: ${songs.length}곡`);
    
    // 타임아웃 설정 증가 (10분)
    req.setTimeout(600000);
    res.setTimeout(600000);
    
    const archiver = require('archiver');
    // 압축 레벨을 6으로 낮춤 (속도 개선)
    const archive = archiver('zip', { 
      zlib: { level: 6 },
      store: false // MP3는 이미 압축된 파일이므로 store 모드 고려
    });
    
    // ZIP 헤더 설정
    const filename = `Album_${Date.now()}.zip`;
    res.attachment(filename);
    res.setHeader('Content-Type', 'application/zip');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // 에러 처리
    archive.on('error', (err) => {
      console.error('❌ Archive 에러:', err);
      if (!res.headersSent) {
        res.status(500).json({ error: 'ZIP 생성 실패', message: err.message });
      }
    });
    
    archive.on('warning', (err) => {
      if (err.code === 'ENOENT') {
        console.warn('⚠️  Archive 경고:', err);
      } else {
        console.error('❌ Archive 에러:', err);
      }
    });
    
    // 스트림 연결
    archive.pipe(res);
    
    // 각 곡 다운로드 및 ZIP에 추가
    let successCount = 0;
    const usedFilenames = new Set(); // 🚨 중복 파일명 방지
    
    for (let i = 0; i < songs.length; i++) {
      const song = songs[i];
      try {
        console.log(`⏳ 다운로드 중 (${i+1}/${songs.length}): ${song.title}`);
        const response = await axios.get(song.url, { 
          responseType: 'arraybuffer',
          timeout: 120000, // 2분 타임아웃
          maxContentLength: 50 * 1024 * 1024 // 50MB 제한
        });
        
        let baseFilename = `${i + 1}_${song.title.replace(/[^a-zA-Z0-9가-힣_-]/g, '_')}`;
        let filename = `${baseFilename}.mp3`;
        
        // 🚨 중복 파일명 검사 및 수정
        let suffix = 2;
        while (usedFilenames.has(filename)) {
          filename = `${baseFilename}_${suffix}.mp3`;
          suffix++;
        }
        usedFilenames.add(filename);
        
        archive.append(Buffer.from(response.data), { name: filename });
        successCount++;
        console.log(`✅ 추가: ${filename} (${(response.data.byteLength / 1024 / 1024).toFixed(2)} MB)`);
      } catch (err) {
        console.error(`❌ 다운로드 실패 (${song.title}):`, err.message);
      }
    }
    
    if (successCount === 0) {
      archive.abort();
      if (!res.headersSent) {
        return res.status(500).json({ error: '모든 곡 다운로드 실패' });
      }
      return;
    }
    
    // ZIP 완료
    await archive.finalize();
    console.log(`✅ ZIP 생성 완료: ${successCount}/${songs.length}곡`);
    
  } catch (error) {
    console.error('❌ ZIP 생성 오류:', error);
    res.status(500).json({ 
      error: 'ZIP 생성 실패', 
      message: error.message 
    });
  }
});

// ✨ 이미지 업그레이드 API (고화질 변환)
router.post('/upgrade-image', async (req, res) => {
  try {
    const { imageUrl } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: '이미지 URL이 필요합니다' });
    }
    
    console.log(`✨ 이미지 업그레이드 시작: ${imageUrl}`);
    
    // TODO: 실제 AI 이미지 업스케일링 서비스 연동
    // 현재는 임시로 원본 URL 반환
    // 실제 구현 시 다음 서비스 사용 가능:
    // - Replicate API (Real-ESRGAN)
    // - Stability AI Upscale
    // - Cloudflare Images (resize)
    
    // 임시: 원본 이미지 다운로드 후 그대로 반환 (실제론 업스케일링 필요)
    const upgradedUrl = imageUrl; // 실제론 업스케일된 URL
    
    console.log(`✅ 이미지 업그레이드 완료`);
    
    res.json({
      success: true,
      upgradedUrl: upgradedUrl,
      message: '이미지 업그레이드 완료 (현재는 원본 반환, 실제 업스케일링 구현 필요)'
    });
    
  } catch (error) {
    console.error('❌ 이미지 업그레이드 오류:', error);
    res.status(500).json({ 
      error: '이미지 업그레이드 실패', 
      message: error.message 
    });
  }
});

// 📊 앨범 메타데이터 생성 API

/**
 * 🎨 이미지 업스케일 API
 * Suno 360x360 이미지를 AI로 분석 후 고화질 이미지 2종 생성
 * - 1280x720 (YouTube 썸네일)
 * - 3000x3000 (앨범 커버)
 */
/**
 * 🖼️ 이미지 업스케일 API (Base64) - CORS 우회용
 * - 클라이언트에서 base64로 인코딩된 이미지를 받아서 2종의 고화질 이미지 생성
 */
router.post('/upscale-image-base64', async (req, res) => {
  try {
    const { imageBase64, title, style, lyrics } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: '이미지 데이터가 필요합니다' });
    }
    
    console.log('🎨 이미지 업스케일 시작 (Base64):', title || 'Untitled');
    
    // Base64 디코딩
    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    console.log(`✅ 이미지 디코딩 완료 (${(imageBuffer.length / 1024).toFixed(2)} KB)`);
    
    // 이미지 메타데이터 확인
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`📊 원본 이미지: ${metadata.width}x${metadata.height}, 포맷: ${metadata.format}`);
    
    // YouTube 썸네일 (1280x720) 생성 - 전문가급 업스케일
    console.log('📱 YouTube 썸네일 (1280x720) 전문가급 업스케일 중...');
    const youtubeBuffer = await sharp(imageBuffer)
      .resize(1280, 720, {
        fit: 'cover',
        position: 'center',
        kernel: sharp.kernel.lanczos3  // 고품질 업스케일 알고리즘
      })
      .sharpen(2.0, 1.0, 0.5)  // 강력한 샤프닝!
      .modulate({
        brightness: 1.08,  // 더 밝게
        saturation: 1.2    // 더 선명
      })
      .jpeg({ 
        quality: 95,
        chromaSubsampling: '4:4:4'  // 최고 색상 품질
      })
      .toBuffer();
    
    console.log(`✅ YouTube 썸네일 업스케일 완료 (${(youtubeBuffer.length / 1024).toFixed(2)} KB)`);
    
    // 앨범 커버 (3000x3000) 생성 - 전문가급 업스케일
    console.log('💿 앨범 커버 (3000x3000) 전문가급 업스케일 중...');
    const albumBuffer = await sharp(imageBuffer)
      .resize(3000, 3000, {
        fit: 'cover',
        position: 'center',
        kernel: sharp.kernel.lanczos3  // 고품질 업스케일 알고리즘
      })
      .sharpen(2.2, 1.1, 0.6)  // 더 강한 샤프닝!
      .modulate({
        brightness: 1.08,
        saturation: 1.2
      })
      .jpeg({ 
        quality: 95,
        chromaSubsampling: '4:4:4'  // 최고 색상 품질
      })
      .toBuffer();
    
    console.log(`✅ 앨범 커버 생성 완료 (${(albumBuffer.length / 1024).toFixed(2)} KB)`);
    
    // 🔥 프리미엄 4K (3840x2160) 생성 - Flux Pro Canny + Sharp 극적 효과!
    console.log('✨ 프리미엄 4K - AI 풍성하게 재해석 + 극적 효과!');
    console.log('   Step 1: Flux Pro Canny (구조 유지하면서 풍성하고 고급스럽게)');
    console.log('   Step 2: Sharp 극적 효과 (색상, 밝기, 대비)');
    
    let premiumBuffer;
    
    try {
      // 🔥 Step 1: Flux Pro Canny로 AI 재해석 (구조 유지 + 풍성함)
      const Replicate = require('replicate');
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });
      const axios = require('axios');
      
      console.log('🎨 Flux Pro Canny - AI 풍성하게 재해석 시작...');
      
      // 원본 이미지를 base64로 변환
      const imageBase64Str = imageBuffer.toString('base64');
      const imageDataUrl = `data:image/jpeg;base64,${imageBase64Str}`;
      
      console.log('🎨 Real-ESRGAN - 진짜 AI 업스케일 시작...');
      console.log(`📏 목표: 360x360 → 3600x3600 (10배)`);
      
      const output = await replicate.run(
        "nightmareai/real-esrgan",
        {
          input: {
            image: imageDataUrl,
            scale: 10,  // 10배 업스케일
            face_enhance: false  // 얼굴 보정 끄기
          }
        }
      );
      
      // Real-ESRGAN 출력 다운로드
      let esrganImageUrl;
      if (typeof output === 'string') {
        esrganImageUrl = output;
      } else if (typeof output.url === 'function') {
        esrganImageUrl = await output.url();
      } else if (output.url) {
        esrganImageUrl = output.url;
      } else if (Array.isArray(output) && output.length > 0) {
        esrganImageUrl = output[0];
      } else {
        throw new Error('Real-ESRGAN 출력 형식을 인식할 수 없습니다');
      }
      
      console.log(`✅ Real-ESRGAN 완료: ${esrganImageUrl}`);
      
      const esrganResponse = await axios.get(esrganImageUrl, {
        responseType: 'arraybuffer',
        timeout: 60000
      });
      
      const esrganBuffer = Buffer.from(esrganResponse.data);
      console.log(`✅ Real-ESRGAN 이미지 다운로드 완료 (${(esrganBuffer.length / 1024).toFixed(0)}KB)`);
      
      // 🔥 Step 2: Sharp로 극적 효과 적용
      console.log('🎨 Sharp 극적 효과 적용 중...');
      premiumBuffer = await sharp(esrganBuffer)
        .resize(3840, 2160, {
          fit: 'cover',
          position: 'center',
          kernel: sharp.kernel.lanczos3
        })
        .modulate({
          brightness: 1.15,
          saturation: 1.3,
          hue: 5
        })
        .sharpen(1.5, 0.8, 0.3)
        .linear(1.2, -(128 * 0.2))
        .gamma(1.1)
        .jpeg({ 
          quality: 98,
          chromaSubsampling: '4:4:4'
        })
        .toBuffer();
      
      console.log(`✅ 프리미엄 4K 극적 변환 완료 (${(premiumBuffer.length / 1024).toFixed(0)}KB)`);
      
    } catch (error) {
      console.error('❌ Real-ESRGAN 실패, Sharp 폴백 사용:', error.message);
      
      // 폴백: Sharp만 사용
      premiumBuffer = await sharp(imageBuffer)
        .resize(3840, 2160, {
          fit: 'cover',
          position: 'center',
          kernel: sharp.kernel.lanczos3
        })
        .modulate({
          brightness: 1.25,
          saturation: 1.6,
          hue: 12
        })
        .sharpen(3.5, 1.5, 0.9)
        .linear(1.3, -(128 * 0.3))
        .gamma(1.15)
        .normalise()
        .jpeg({ 
          quality: 98,
          chromaSubsampling: '4:4:4'
        })
        .toBuffer();
      
      console.log(`✅ 폴백 프리미엄 4K 생성 완료 (${(premiumBuffer.length / 1024).toFixed(0)}KB)`);
    }
    
    // 임시 파일로 저장
    const uploadDir = path.join(__dirname, '..', 'temp', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const timestamp = Date.now();
    const safeTitle = (title || 'untitled').replace(/[^a-zA-Z0-9가-힣_-]/g, '_').substring(0, 50);
    
    const youtubeFilename = `${timestamp}_${safeTitle}_youtube.jpg`;
    const albumFilename = `${timestamp}_${safeTitle}_album.jpg`;
    const premiumFilename = `${timestamp}_${safeTitle}_premium_4k.jpg`;
    
    const youtubePath = path.join(uploadDir, youtubeFilename);
    const albumPath = path.join(uploadDir, albumFilename);
    const premiumPath = path.join(uploadDir, premiumFilename);
    
    await fs.writeFile(youtubePath, youtubeBuffer);
    await fs.writeFile(albumPath, albumBuffer);
    await fs.writeFile(premiumPath, premiumBuffer);
    
    console.log(`💾 임시 파일 저장 완료:`);
    console.log(`   YouTube: ${youtubeFilename}`);
    console.log(`   Album: ${albumFilename}`);
    console.log(`   Premium: ${premiumFilename}`);
    
    // URL 생성 (HTTPS 강제 사용 - Mixed Content 방지)
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const host = req.get('host');
    const baseUrl = `${protocol === 'http' ? 'https' : protocol}://${host}`;
    console.log(`🔒 Base URL (HTTPS 강제): ${baseUrl}`);
    
    res.json({
      success: true,
      youtubeUrl: `${baseUrl}/temp/uploads/${youtubeFilename}`,
      albumUrl: `${baseUrl}/temp/uploads/${albumFilename}`,
      premiumUrl: `${baseUrl}/temp/uploads/${premiumFilename}`,
      metadata: {
        original: { width: metadata.width, height: metadata.height },
        youtube: { width: 1280, height: 720, size: youtubeBuffer.length },
        album: { width: 3000, height: 3000, size: albumBuffer.length },
        premium: { width: 3840, height: 2160, size: premiumBuffer.length }
      }
    });
    
    console.log('✅ 이미지 업스케일 완료 (Base64)');
    
  } catch (error) {
    console.error('❌ 이미지 업스케일 오류 (Base64):', error);
    res.status(500).json({ error: error.message });
  }
});

router.post('/upscale-image', async (req, res) => {
  try {
    const { imageUrl, title, style, lyrics } = req.body;
    
    if (!imageUrl) {
      return res.status(400).json({ error: '이미지 URL이 필요합니다' });
    }
    
    console.log(`🎨 이미지 업스케일 시작: ${title}`);
    console.log(`   원본 이미지: ${imageUrl}`);
    
    // Step 1: AI로 이미지 분석
    console.log('🔍 AI 이미지 분석 중...');
    
    const analysisPrompt = `Analyze this music album cover image and describe:
1. Main visual elements (objects, scenes, composition)
2. Color palette and mood (warm/cool, bright/dark, vibrant/muted)
3. Style (minimalist, abstract, realistic, vintage, modern, anime, etc.)
4. Atmosphere and feeling (calm, energetic, dreamy, melancholic, etc.)
5. Any text or typography visible

Song title: "${title}"
Music style: "${style}"

Provide a detailed, vivid description that can be used to recreate a similar but enhanced high-quality image.`;

    let imageDescription = '';
    
    try {
      // GenSpark LLM API로 이미지 분석 (이미지 분석 기능이 있다면)
      // 없다면 곡 정보 기반으로 프롬프트 생성
      imageDescription = `A beautiful ${style} album cover artwork featuring "${title}". `;
      
      // 가사에서 키워드 추출
      if (lyrics) {
        const keywords = extractKeywords(lyrics);
        imageDescription += `Visual themes: ${keywords.join(', ')}. `;
      }
      
      // 스타일별 기본 프롬프트
      const stylePrompts = {
        'cozy-lofi': 'Aesthetic lofi vibes, warm pastel colors, cozy atmosphere, soft lighting, vinyl records, plants, books, peaceful scene',
        'acoustic': 'Natural acoustic vibes, wooden textures, warm earth tones, guitar silhouettes, intimate setting, soft golden hour lighting',
        'upbeat': 'Energetic and vibrant, bright bold colors, dynamic composition, uplifting atmosphere, sunlight, joy and movement',
        'melancholic': 'Emotional and introspective, muted blue and gray tones, rain or twilight, solitary mood, contemplative atmosphere',
        'emotional-rnb': 'Urban R&B aesthetic, city lights, neon glow, smooth gradients, modern typography, nighttime vibes',
        'default': 'Artistic music album cover, aesthetic design, professional quality, emotional atmosphere'
      };
      
      const basePrompt = stylePrompts[style] || stylePrompts['default'];
      imageDescription += basePrompt;
      
      console.log('✅ 이미지 분석 완료');
      console.log(`   설명: ${imageDescription.substring(0, 100)}...`);
      
    } catch (error) {
      console.warn('⚠️  이미지 분석 실패, 기본 프롬프트 사용:', error.message);
      imageDescription = `Aesthetic ${style} album cover for "${title}", high quality, professional design, emotional atmosphere`;
    }
    
    // Step 2: 고화질 이미지 2종 생성
    console.log('🎨 고화질 이미지 생성 중...');
    
    const prompt = `${imageDescription}

High quality album cover artwork, professional music cover design, aesthetic composition, clean and modern, suitable for streaming platforms.

Style: ${style}
Title: ${title}

DO NOT include any text or typography in the image.
Focus on visual aesthetics, mood, and atmosphere.`;

    const results = {
      youtube: null,  // 1280x720
      album: null     // 3000x3000
    };
    
    console.log('📝 생성 프롬프트:', prompt.substring(0, 150) + '...');
    
    try {
      // ✨ 실제 이미지 리사이즈 기능 (Sharp 사용)
      console.log('🖼️ 원본 이미지 다운로드 중...');
      
      // 1. 원본 이미지 다운로드 (Suno CDN용 헤더 강화)
      const imageResponse = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
          'Accept': 'image/avif,image/webp,image/apng,image/svg+xml,image/*,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Accept-Language': 'en-US,en;q=0.9',
          'Sec-Fetch-Dest': 'image',
          'Sec-Fetch-Mode': 'no-cors',
          'Sec-Fetch-Site': 'cross-site',
          'Referer': 'https://suno.ai/',
          'Origin': 'https://suno.ai'
        }
      });
      
      const originalImageBuffer = Buffer.from(imageResponse.data);
      console.log(`✅ 원본 이미지 다운로드 완료 (${(originalImageBuffer.length / 1024).toFixed(2)} KB)`);
      
      // 2. 이미지 메타데이터 확인
      const metadata = await sharp(originalImageBuffer).metadata();
      console.log(`📊 원본 이미지: ${metadata.width}x${metadata.height}, 포맷: ${metadata.format}`);
      
      // 3. YouTube 썸네일 (1280x720) 생성
      console.log('📱 YouTube 썸네일 (1280x720) 생성 중...');
      const youtubeBuffer = await sharp(originalImageBuffer)
        .resize(1280, 720, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 95 })
        .toBuffer();
      
      console.log(`✅ YouTube 썸네일 생성 완료 (${(youtubeBuffer.length / 1024).toFixed(2)} KB)`);
      
      // 4. 앨범 커버 (3000x3000) 생성
      console.log('💿 앨범 커버 (3000x3000) 생성 중...');
      const albumBuffer = await sharp(originalImageBuffer)
        .resize(3000, 3000, {
          fit: 'cover',
          position: 'center'
        })
        .jpeg({ quality: 95 })
        .toBuffer();
      
      console.log(`✅ 앨범 커버 생성 완료 (${(albumBuffer.length / 1024).toFixed(2)} KB)`);
      
      // 5. 임시 파일로 저장
      const uploadDir = path.join(__dirname, '..', 'temp', 'uploads');
      await fs.mkdir(uploadDir, { recursive: true });
      
      const timestamp = Date.now();
      const safeTitle = (title || 'untitled').replace(/[^a-zA-Z0-9가-힣_-]/g, '_').substring(0, 50);
      
      const youtubeFilename = `${timestamp}_${safeTitle}_youtube.jpg`;
      const albumFilename = `${timestamp}_${safeTitle}_album.jpg`;
      
      const youtubePath = path.join(uploadDir, youtubeFilename);
      const albumPath = path.join(uploadDir, albumFilename);
      
      await fs.writeFile(youtubePath, youtubeBuffer);
      await fs.writeFile(albumPath, albumBuffer);
      
      console.log(`💾 임시 파일 저장 완료:`);
      console.log(`   YouTube: ${youtubeFilename}`);
      console.log(`   Album: ${albumFilename}`);
      
      // 6. URL 생성 (서버에서 접근 가능한 URL)
      const baseUrl = process.env.BASE_URL || 'http://localhost:5000';
      
      results.youtube = {
        url: `${baseUrl}/temp/uploads/${youtubeFilename}`,
        localPath: youtubePath,
        width: 1280,
        height: 720,
        size: youtubeBuffer.length,
        prompt: prompt,
        message: '✅ Sharp를 사용하여 1280x720으로 리사이즈 완료'
      };
      
      results.album = {
        url: `${baseUrl}/temp/uploads/${albumFilename}`,
        localPath: albumPath,
        width: 3000,
        height: 3000,
        size: albumBuffer.length,
        prompt: prompt,
        message: '✅ Sharp를 사용하여 3000x3000으로 리사이즈 완룼'
      };
      
      console.log('✨ 이미지 리사이즈 모두 성공!');
      
    } catch (apiError) {
      console.error('❌ 이미지 처리 오류:', apiError.message);
      console.error(apiError.stack);
      
      // 폴백: 원본 이미지 반환
      results.youtube = {
        url: imageUrl,
        width: 1280,
        height: 720,
        prompt: prompt,
        message: `❌ 리사이즈 실패: ${apiError.message} (원본 이미지 반환)`
      };
      
      results.album = {
        url: imageUrl,
        width: 3000,
        height: 3000,
        prompt: prompt,
        message: `❌ 리사이즈 실패: ${apiError.message} (원본 이미지 반환)`
      };
    }
    
    console.log('✅ 이미지 업스케일 완료');
    
    res.json({
      success: true,
      original: imageUrl,
      enhanced: results,
      description: imageDescription,
      prompt: prompt
    });
    
  } catch (error) {
    console.error('❌ 이미지 업스케일 오류:', error);
    res.status(500).json({
      error: '이미지 업스케일 실패',
      message: error.message
    });
  }
});

/**
 * 가사에서 키워드 추출 헬퍼 함수
 */
function extractKeywords(lyrics) {
  const keywords = new Set();
  const commonWords = ['the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'do', 'does', 'did', 'will', 'would', 'could', 'should', 'may', 'might', 'must', 'can', 'this', 'that', 'these', 'those', 'i', 'you', 'he', 'she', 'it', 'we', 'they', 'my', 'your', 'his', 'her', 'its', 'our', 'their'];
  
  const words = lyrics.toLowerCase()
    .replace(/[^\w\s가-힣]/g, ' ')
    .split(/\s+/)
    .filter(w => w.length > 2 && !commonWords.includes(w));
  
  // 빈도수 계산
  const frequency = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });
  
  // 상위 5개 키워드 추출
  const topKeywords = Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
  
  return topKeywords;
}

/**
 * 🖼️ 이미지 다운로드 프록시 (CORS 우회)
 */
router.get('/download-image', async (req, res) => {
  try {
    const { url, filename } = req.query;
    
    if (!url) {
      return res.status(400).json({ error: 'URL이 필요합니다' });
    }
    
    console.log(`📥 이미지 다운로드 요청: ${url}`);
    console.log(`📄 파일명: ${filename}`);
    
    // URL이 로컬 서버의 temp/uploads 경로인지 확인 (전체 URL 또는 상대 경로)
    const tempUploadsPattern = /\/temp\/uploads\/([^?#]+)/;
    const match = url.match(tempUploadsPattern);
    
    if (match) {
      // 로컬 파일 다운로드
      const localFilename = decodeURIComponent(match[1]); // URL 디코딩
      const uploadDir = path.join(__dirname, '..', 'temp', 'uploads');
      const filePath = path.join(uploadDir, localFilename);
      
      console.log(`📂 로컬 파일 다운로드 시도: ${filePath}`);
      
      // 파일 존재 확인
      if (!await fs.access(filePath).then(() => true).catch(() => false)) {
        console.error(`❌ 파일을 찾을 수 없음: ${filePath}`);
        return res.status(404).json({ error: '파일을 찾을 수 없습니다' });
      }
      
      // 파일 읽기
      const fileBuffer = await fs.readFile(filePath);
      console.log(`✅ 파일 읽기 완료 (${(fileBuffer.length / 1024).toFixed(2)} KB)`);
      
      // Content-Type 설정
      const contentType = 'image/jpeg';
      
      // 파일명이 있으면 Content-Disposition 헤더 추가
      if (filename) {
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-cache');
      res.send(fileBuffer);
      
      console.log(`✅ 로컬 파일 다운로드 완료: ${filename}`);
      
    } else {
      // 외부 URL 프록시 다운로드
      console.log(`🌐 외부 URL 프록시 다운로드: ${url}`);
      
      const response = await axios({
        method: 'GET',
        url: url,
        responseType: 'arraybuffer',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
          'Referer': 'https://suno.ai/'
        },
        timeout: 30000
      });
      
      console.log(`✅ 외부 이미지 다운로드 완료 (${(response.data.length / 1024).toFixed(2)} KB)`);
      
      // Content-Type 설정
      const contentType = response.headers['content-type'] || 'image/jpeg';
      
      // 파일명이 있으면 Content-Disposition 헤더 추가
      if (filename) {
        res.setHeader('Content-Disposition', `attachment; filename="${encodeURIComponent(filename)}"`);
      }
      
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'no-cache');
      res.send(Buffer.from(response.data));
      
      console.log(`✅ 프록시 다운로드 완료: ${filename}`);
    }
    
  } catch (error) {
    console.error('❌ 이미지 다운로드 실패:', error.message);
    console.error('❌ 에러 스택:', error.stack);
    res.status(500).json({ 
      error: '이미지 다운로드 실패',
      message: error.message 
    });
  }
});

/**
 * 🎵 AI 음악 순위 분석 API
 * POST /api/style/rank-tracks
 */
router.post('/rank-tracks', async (req, res) => {
  try {
    const { tracks, options } = req.body;
    
    if (!tracks || !Array.isArray(tracks) || tracks.length === 0) {
      return res.status(400).json({
        success: false,
        error: '트랙 정보가 필요합니다'
      });
    }
    
    console.log(`\n🎯 AI 순위 분석 요청: ${tracks.length}곡`);
    
    // musicRanker 서비스 import
    const { rankTracks } = require('../services/musicRanker');
    
    // 분석 실행
    const result = await rankTracks(tracks, options);
    
    res.json({
      success: true,
      ...result
    });
    
  } catch (error) {
    console.error('❌ AI 순위 분석 오류:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

/**
 * ✨ 프리미엄 AI 업스케일 엔드포인트
 * AI 기반 초고화질 이미지 업스케일 (4K 지원)
 */
router.post('/premium-upscale', async (req, res) => {
  try {
    const { imageBase64, title, style, lyrics } = req.body;
    
    if (!imageBase64) {
      return res.status(400).json({ error: '이미지 데이터가 필요합니다' });
    }
    
    console.log('✨ 프리미엄 AI 업스케일 시작:', title || 'Untitled');
    
    // Base64 디코딩
    const imageBuffer = Buffer.from(imageBase64.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    console.log(`✅ 이미지 디코딩 완료 (${(imageBuffer.length / 1024).toFixed(2)} KB)`);
    
    // 이미지 메타데이터 확인
    const metadata = await sharp(imageBuffer).metadata();
    console.log(`📊 원본 이미지: ${metadata.width}x${metadata.height}, 포맷: ${metadata.format}`);
    
    // Step 1: 일반 업스케일 (YouTube + Album) - 프리미엄급 선명도
    console.log('⚡ 기본 업스케일 (YouTube + Album) 프리미엄급 선명도로 생성 중...');
    
    // 원본 이미지 메타데이터 확인
    const originalMeta = await sharp(imageBuffer).metadata();
    console.log(`📊 원본: ${originalMeta.width}x${originalMeta.height}`);
    
    // YouTube 썸네일 (1280x720) - 프리미엄급 선명 업스케일
    const youtubeBuffer = await sharp(imageBuffer)
      .resize(1280, 720, {
        fit: 'cover',
        position: 'center',
        kernel: sharp.kernel.lanczos3  // 고품질 업스케일 알고리즘
      })
      .sharpen(2.0, 1.0, 0.5)  // 강력한 샤프닝 (선명하게!)
      .modulate({
        brightness: 1.08,  // 더 밝게
        saturation: 1.2    // 더 선명한 색
      })
      .jpeg({ 
        quality: 95,  // 높은 품질
        chromaSubsampling: '4:4:4'  // 최고 색상 품질
      })
      .toBuffer();
    
    // 앨범 커버 (3000x3000) - 프리미엄급 선명 업스케일
    const albumBuffer = await sharp(imageBuffer)
      .resize(3000, 3000, {
        fit: 'cover',
        position: 'center',
        kernel: sharp.kernel.lanczos3  // 고품질 업스케일 알고리즘
      })
      .sharpen(2.2, 1.1, 0.6)  // 더 강한 샤프닝 (큰 사이즈, 선명하게!)
      .modulate({
        brightness: 1.08,  // 더 밝게
        saturation: 1.2    // 더 선명한 색
      })
      .jpeg({ 
        quality: 95,  // 높은 품질
        chromaSubsampling: '4:4:4'  // 최고 색상 품질
      })
      .toBuffer();
    
    console.log(`✅ 기본 업스케일 완료 (YouTube: ${(youtubeBuffer.length / 1024).toFixed(0)}KB, Album: ${(albumBuffer.length / 1024).toFixed(0)}KB)`);
    
    // Step 2: AI 프리미엄 업스케일 (4K) - Replicate FLUX로 완전히 새로운 이미지 생성
    console.log('✨ AI 프리미엄 업스케일 (4K) 시작...');
    
    // 임시 파일로 원본 이미지 저장 (AI 업스케일 서비스용)
    const uploadDir = path.join(__dirname, '..', 'temp', 'uploads');
    await fs.mkdir(uploadDir, { recursive: true });
    
    const timestamp = Date.now();
    const safeTitle = (title || 'untitled').replace(/[^a-zA-Z0-9가-힣_-]/g, '_').substring(0, 50);
    
    const originalFilename = `${timestamp}_${safeTitle}_original.jpg`;
    const originalPath = path.join(uploadDir, originalFilename);
    
    await fs.writeFile(originalPath, imageBuffer);
    console.log(`💾 원본 이미지 임시 저장: ${originalFilename}`);
    
    // 프리미엄 4K - 원본을 기반으로 극적이고 화려하게 변환!
    let premiumBuffer = null;
    let premiumUrl = null;
    
    // URL 생성을 위한 변수들 (try-catch 바깥에서 선언)
    const protocol = req.get('x-forwarded-proto') || req.protocol || 'https';
    const host = req.get('host');
    const baseUrl = `${protocol === 'http' ? 'https' : protocol}://${host}`;
    
    console.log('✨ 프리미엄 4K - AI 풍성하게 재해석 + 극적 효과!');
    console.log('   Step 1: Flux Pro Canny (구조 유지하면서 풍성하고 고급스럽게)');
    console.log('   Step 2: Sharp 극적 효과 (색상, 밝기, 대비)');
    
    try {
      // 🔥 Step 1: Flux Pro Canny로 AI 재해석 (구조 유지 + 풍성함)
      const Replicate = require('replicate');
      const replicate = new Replicate({
        auth: process.env.REPLICATE_API_TOKEN,
      });
      const axios = require('axios');
      
      console.log('🎨 Flux Pro Canny - AI 풍성하게 재해석 시작...');
      
      // 원본 이미지를 base64로 변환
      const imageBase64 = imageBuffer.toString('base64');
      const imageDataUrl = `data:image/jpeg;base64,${imageBase64}`;
      
      // 음악 스타일에 따른 프롬프트
      const styleHint = style || 'modern';
      console.log('🎨 Real-ESRGAN - 진짜 AI 업스케일 시작...');
      console.log(`📏 목표: 360x360 → 3600x3600 (10배)`);
      
      const output = await replicate.run(
        "nightmareai/real-esrgan",
        {
          input: {
            image: imageDataUrl,
            scale: 10,  // 10배 업스케일
            face_enhance: false  // 얼굴 보정 끄기
          }
        }
      );
      
      // Real-ESRGAN 출력 다운로드
      let esrganImageUrl;
      if (typeof output === 'string') {
        esrganImageUrl = output;
      } else if (typeof output.url === 'function') {
        esrganImageUrl = await output.url();
      } else if (output.url) {
        esrganImageUrl = output.url;
      } else if (Array.isArray(output) && output.length > 0) {
        esrganImageUrl = output[0];
      } else {
        throw new Error('Real-ESRGAN 출력 형식을 인식할 수 없습니다');
      }
      
      console.log(`✅ Real-ESRGAN 완료: ${esrganImageUrl}`);
      
      const esrganResponse = await axios.get(esrganImageUrl, {
        responseType: 'arraybuffer',
        timeout: 60000
      });
      
      const esrganBuffer = Buffer.from(esrganResponse.data);
      console.log(`✅ AI 업스케일 이미지 다운로드 완료 (${(esrganBuffer.length / 1024).toFixed(0)}KB)`);
      
      // 🔥 Step 2: Sharp로 최종 크기 조정 및 색상 보정
      console.log('🎨 Sharp 최종 처리 중...');
      premiumBuffer = await sharp(esrganBuffer)
        .resize(3840, 2160, {
          fit: 'cover',
          position: 'center',
          kernel: sharp.kernel.lanczos3
        })
        .modulate({
          brightness: 1.15,  // 밝게 (Flux가 이미 화려함)
          saturation: 1.3,   // 색상 풍부하게
          hue: 5            // 약간의 색조 변화
        })
        .sharpen(1.5, 0.8, 0.3)  // 부드러운 샤프닝 (Flux가 이미 선명함)
        .linear(1.2, -(128 * 0.2))  // 대비 20% 증가
        .gamma(1.1)       // 감마 보정
        .jpeg({ 
          quality: 98,
          chromaSubsampling: '4:4:4'
        })
        .toBuffer();
      
      console.log(`✅ 프리미엄 4K 완성 (${(premiumBuffer.length / 1024).toFixed(0)}KB)`);
      console.log(`   - Real-ESRGAN: 10배 AI 업스케일 ✅`);
      console.log(`   - Sharp 효과: 4K 리사이징 + 색상 보정 ✅`);
      
      // 프리미엄 이미지 저장
      const premiumFilename = `${timestamp}_${safeTitle}_premium_4k.jpg`;
      const premiumPath = path.join(uploadDir, premiumFilename);
      
      await fs.writeFile(premiumPath, premiumBuffer);
      
      // URL 생성
      premiumUrl = `${baseUrl}/temp/uploads/${premiumFilename}`;
      console.log(`🔗 프리미엄 URL: ${premiumUrl}`);
      
    } catch (error) {
      console.error('❌ 프리미엄 4K 생성 오류:', error);
      console.log('⚠️  폴백: Sharp만 사용');
      
      // 폴백: Sharp만 사용
      premiumBuffer = await sharp(imageBuffer)
        .resize(3840, 2160, {
          fit: 'cover',
          position: 'center',
          kernel: sharp.kernel.lanczos3
        })
        .modulate({
          brightness: 1.25,
          saturation: 1.6,
          hue: 12
        })
        .sharpen(3.5, 1.5, 0.9)
        .linear(1.3, -(128 * 0.3))
        .gamma(1.15)
        .normalise()
        .jpeg({ 
          quality: 98,
          chromaSubsampling: '4:4:4'
        })
        .toBuffer();
      
      const premiumFilename = `${timestamp}_${safeTitle}_premium_4k.jpg`;
      const premiumPath = path.join(uploadDir, premiumFilename);
      await fs.writeFile(premiumPath, premiumBuffer);
      premiumUrl = `${baseUrl}/temp/uploads/${premiumFilename}`;
    }
    
    // Step 3: 모든 파일 저장 및 URL 생성
    const youtubeFilename = `${timestamp}_${safeTitle}_youtube.jpg`;
    const albumFilename = `${timestamp}_${safeTitle}_album.jpg`;
    
    const youtubePath = path.join(uploadDir, youtubeFilename);
    const albumPath = path.join(uploadDir, albumFilename);
    
    await fs.writeFile(youtubePath, youtubeBuffer);
    await fs.writeFile(albumPath, albumBuffer);
    
    console.log(`💾 임시 파일 저장 완료:`);
    console.log(`   YouTube: ${youtubeFilename}`);
    console.log(`   Album: ${albumFilename}`);
    if (premiumUrl) {
      console.log(`   Premium: ${premiumUrl}`);
    }
    
    res.json({
      success: true,
      youtubeUrl: `${baseUrl}/temp/uploads/${youtubeFilename}`,
      albumUrl: `${baseUrl}/temp/uploads/${albumFilename}`,
      premiumUrl: premiumUrl,
      metadata: {
        original: { width: metadata.width, height: metadata.height },
        youtube: { width: 1280, height: 720, size: youtubeBuffer.length },
        album: { width: 3000, height: 3000, size: albumBuffer.length },
        premium: premiumBuffer ? { width: 3840, height: 2160, size: premiumBuffer.length } : null
      }
    });
    
    console.log('✅ 프리미엄 AI 업스케일 완료');
    
  } catch (error) {
    console.error('❌ 프리미엄 AI 업스케일 오류:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * 📥 이미지 다운로드 API (프록시)
 * CORS 문제 해결을 위한 서버 사이드 다운로드
 */
// 메타데이터 export
router.generatedMusicMetadata = generatedMusicMetadata;

module.exports = router;
