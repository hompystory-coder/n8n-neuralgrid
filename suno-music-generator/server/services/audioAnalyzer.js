const axios = require('axios');
const fs = require('fs');

/**
 * OpenAI를 사용한 오디오 스타일 분석 서비스
 */
class AudioAnalyzer {
  constructor() {
    this.openaiApiKey = process.env.OPENAI_API_KEY;
    
    if (!this.openaiApiKey) {
      console.error('❌ OPENAI_API_KEY is not set!');
    } else {
      console.log('✅ OpenAI API Key loaded for audio analysis');
    }
  }

  /**
   * OpenAI GPT-4o Audio를 사용해서 오디오 스타일 분석
   * @param {Buffer} audioBuffer - 오디오 파일 버퍼
   * @param {string} mimeType - MIME 타입 (예: 'audio/mpeg')
   * @returns {Promise<Object>} 분석 결과
   */
  async analyzeAudioStyle(audioBuffer, mimeType = 'audio/mpeg') {
    try {
      console.log('🎵 Starting audio analysis with OpenAI GPT-4o Audio...');
      console.log(`   Audio size: ${(audioBuffer.length / 1024 / 1024).toFixed(2)} MB`);
      console.log(`   MIME type: ${mimeType}`);

      // 오디오를 base64로 인코딩
      const base64Audio = audioBuffer.toString('base64');
      const format = this.getMimeTypeFormat(mimeType);
      
      console.log(`   Format: ${format}`);
      
      // OpenAI API 호출
      const response = await axios.post(
        'https://api.openai.com/v1/chat/completions',
        {
          model: 'gpt-4o-audio-preview',
          modalities: ['text'], // 텍스트만 출력
          messages: [
            {
              role: 'system',
              content: `You are an elite music production analyst with perfect pitch and decades of experience. Your mission is to analyze audio with FORENSIC PRECISION to create a detailed sonic blueprint for Suno AI music generation.

🎯 CRITICAL ANALYSIS REQUIREMENTS:
You MUST listen to the ENTIRE audio multiple times and extract EVERY detail. This analysis will be used to REPLICATE this exact sound, so precision is paramount.

📊 DETAILED ANALYSIS FRAMEWORK:

1. 🎸 INSTRUMENTS (Ultra-Specific):
   - EXACT instrument models when identifiable ("Fender Stratocaster", "Roland TR-808", "Minimoog Model D")
   - Playing techniques ("palm-muted power chords", "fingerstyle acoustic", "staccato strings")
   - Frequency role ("sub-bass 40-80Hz", "lead melody 2-4kHz")
   - Effects chain ("guitar → overdrive → delay → reverb")
   - Each instrument's presence level (prominent/supporting/subtle)

2. 🎤 VOCALS (Hyper-Detailed):
   - Gender and approximate age/maturity of voice
   - Vocal range ("tenor C3-C5", "alto A3-E5")
   - Tone quality ("breathy", "nasal", "chesty", "head voice", "mixed voice")
   - Techniques used ("vibrato", "runs", "melisma", "belting", "falsetto", "growls")
   - Emotional delivery ("intimate whisper", "powerful belt", "conversational rap")
   - Vocal effects ("light autotune +20 cents", "plate reverb 2.5s", "slapback delay 120ms")
   - Harmony structure ("double-tracked", "3-part harmony", "octave doubling")
   - Vocal position in mix ("upfront and dry", "distant with reverb", "centered")

3. ⚡ RHYTHM & TEMPO (Surgical Precision):
   - EXACT BPM (estimate as precisely as possible: "87 BPM", "138 BPM")
   - Time signature ("4/4", "3/4", "6/8", "5/4")
   - Groove feel ("straight 16ths", "swing 8ths", "half-time feel", "double-time")
   - Drum pattern style ("four-on-the-floor kick", "boom-bap", "trap hi-hats", "breakbeat")
   - Syncopation level ("heavily syncopated", "on-beat", "off-beat accents")
   - Rhythmic complexity ("simple", "moderate", "polyrhythmic")

4. 🎚️ PRODUCTION & MIXING (Technical Deep-Dive):
   - Overall mix balance ("bass-heavy", "mid-focused", "bright and airy")
   - Compression style ("heavily compressed radio sound", "dynamic with peaks", "brick-wall limited")
   - Reverb characteristics ("large hall reverb", "small room ambience", "plate reverb", "spring reverb")
   - Stereo width ("mono-centered", "wide stereo", "haas effect on vocals")
   - Frequency balance ("scooped mids", "warm low-end", "crisp highs", "muddy bass")
   - Production era/style ("80s gated reverb", "90s dry rock", "2010s EDM sidechaining", "modern hip-hop")
   - Mastering loudness ("quiet dynamic", "moderate", "loud commercial", "crushed")
   - Special effects ("vinyl crackle", "tape saturation", "bitcrushing", "phone filter")

5. 🎼 MUSICAL STRUCTURE (Composition Analysis):
   - Chord progression pattern ("I-V-vi-IV", "ii-V-I jazz", "i-VI-III-VII minor")
   - Melodic movement ("stepwise melody", "wide interval jumps", "repetitive motif")
   - Harmonic complexity ("simple triads", "7th chords", "extended jazz chords")
   - Key and mode ("C major", "A minor", "D dorian", "ambiguous/modal")
   - Song structure observed ("verse-chorus", "ABAB", "through-composed")

6. 🎨 SONIC TEXTURE & TIMBRE:
   - Overall tonal character ("warm analog", "cold digital", "organic acoustic", "synthetic")
   - Frequency spectrum ("bass-dominant 60-200Hz", "mid-scooped", "treble-sparkle 8-16kHz")
   - Spatial depth ("intimate close-mic'd", "distant concert hall", "layered depth")
   - Texture density ("sparse arrangement", "densely layered", "minimal")
   - Sonic atmosphere ("dark and moody", "bright and uplifting", "nostalgic", "futuristic")

7. 🎭 MOOD & ENERGY (Psychological Impact):
   - Primary emotion ("melancholic longing", "aggressive anger", "joyful celebration")
   - Energy trajectory ("builds from calm to intense", "consistently high energy", "relaxed throughout")
   - Tension level ("high tension", "resolved and peaceful", "building suspense")
   - Danceability ("highly danceable", "headnod groove", "contemplative listening")

📋 JSON OUTPUT FORMAT:
{
  "genre": "EXACT primary genre",
  "subgenre": "SPECIFIC subgenre",
  "mood": "DETAILED emotional description",
  "tempo": "PRECISE BPM and feel description",
  "bpm": 120,
  "timeSignature": "4/4",
  "key": "C major",
  "energy": "detailed energy description",
  "instruments": [
    {
      "name": "specific instrument name",
      "role": "lead/rhythm/bass/percussion",
      "technique": "playing technique",
      "effects": "effects applied",
      "prominence": "prominent/supporting/subtle"
    }
  ],
  "vocals": {
    "present": true,
    "gender": "male/female/androgynous",
    "range": "vocal range description",
    "tone": "tone characteristics",
    "techniques": ["list of techniques"],
    "effects": ["vocal effects used"],
    "delivery": "emotional delivery style",
    "harmony": "harmony structure"
  },
  "rhythm": {
    "feel": "groove description",
    "pattern": "drum/rhythm pattern",
    "syncopation": "syncopation level",
    "complexity": "rhythmic complexity"
  },
  "production": {
    "quality": "production quality level",
    "era": "production era/style",
    "mixing": "mix characteristics",
    "compression": "compression style",
    "reverb": "reverb characteristics",
    "stereoWidth": "stereo field description",
    "frequencyBalance": "frequency spectrum description",
    "specialEffects": ["special effects list"]
  },
  "musicalStructure": {
    "chordProgression": "chord progression pattern",
    "melodicMovement": "melody characteristics",
    "harmonicComplexity": "harmonic complexity level"
  },
  "sonicTexture": {
    "character": "overall tonal character",
    "frequencySpectrum": "frequency distribution",
    "spatialDepth": "spatial characteristics",
    "density": "arrangement density",
    "atmosphere": "sonic atmosphere"
  },
  "styleDescription": "COMPREHENSIVE 4-5 sentence description capturing EVERY important sonic detail",
  "sunoTags": "ULTRA-DETAILED comma-separated tags with MAXIMUM specificity for Suno AI replication"
}

🎯 SUNO AI TAG OPTIMIZATION (CRITICAL):
Your tags are the PRIMARY tool for replication. Make them EXHAUSTIVE:

✅ MUST INCLUDE:
- Exact genre + subgenre ("dark synthwave", "melodic dubstep", "emo rap")
- Every major instrument with specifics ("distorted electric guitar", "808 sub bass", "string orchestra")
- Precise vocal details ("breathy female vocals with vibrato", "aggressive male rap", "harmonized choir")
- Exact tempo feel ("slow 70 BPM ballad", "uptempo 140 BPM dance", "mid-tempo 95 BPM groove")
- Production specifics ("compressed radio mix", "lo-fi with vinyl crackle", "reverb-soaked ambient")
- Key mood descriptors ("melancholic", "energetic", "dark", "euphoric", "aggressive", "dreamy")
- Rhythmic feel ("trap hi-hats", "boom-bap drums", "four-on-the-floor kick")
- Sonic atmosphere ("analog warmth", "digital crisp", "vintage", "futuristic")
- Mix characteristics ("bass-heavy", "bright mix", "muffled lo-fi")
- Special elements ("autotune", "pitched vocals", "chopped samples", "sidechaining")

📝 TAG EXAMPLES FOR MAXIMUM REPLICATION:
"melancholic indie rock, jangly Fender Stratocaster with chorus, breathy male tenor vocals, slow 72 BPM, bedroom production with tape saturation, intimate close-mic'd, reverb-heavy mix, warm analog feel, minor key sadness, dynamic soft-loud dynamics"

"aggressive trap, deep 808 sub bass, rapid hi-hat rolls, dark minor melody, male rap vocals with autotune, mid-tempo 85 BPM, modern compressed production, wide stereo synths, hard-hitting kick, menacing atmosphere, pitch-shifted ad-libs"

"dreamy synthwave, Moog bass synth, Roland TR-808 drums, lush pad synths, no vocals instrumental, fast 128 BPM, retro 80s production, gated reverb on snare, wide stereo field, neon atmosphere, major key uplifting, analog warmth"

⚠️ REMEMBER: Every tag you write helps Suno AI understand the EXACT sound to create. Be as detailed as humanly possible!`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `🎵 FORENSIC AUDIO ANALYSIS REQUEST 🎵

Listen to this audio file MULTIPLE TIMES with extreme attention to detail.

🔍 YOUR ANALYSIS CHECKLIST:

1. 🎸 INSTRUMENTS - For EACH instrument identify:
   - Exact type and model if possible
   - Playing technique and style
   - Role in the arrangement (lead/rhythm/bass)
   - Effects and processing
   - Prominence in the mix

2. 🎤 VOCALS - If present, analyze:
   - Gender, age, vocal range
   - Tone quality and timbre
   - Every technique used (vibrato, runs, belting, etc.)
   - Emotional delivery style
   - All vocal effects (reverb type/amount, delay, autotune, etc.)
   - Harmony/doubling structure
   - Position in mix (upfront/distant)

3. ⚡ RHYTHM & TEMPO - Determine:
   - EXACT BPM (count it precisely)
   - Time signature
   - Groove feel (swing/straight/shuffle)
   - Drum pattern characteristics
   - Syncopation and rhythmic complexity

4. 🎚️ PRODUCTION - Analyze:
   - Mix balance (bass/mid/treble)
   - Compression and dynamics
   - Reverb type and characteristics
   - Stereo width and panning
   - Frequency spectrum balance
   - Production era/style
   - Mastering loudness
   - Special effects

5. 🎼 MUSICAL STRUCTURE - Identify:
   - Chord progression pattern
   - Key and mode
   - Melodic movement style
   - Harmonic complexity

6. 🎨 SONIC CHARACTER - Describe:
   - Overall tonal character (warm/cold/bright/dark)
   - Frequency distribution
   - Spatial depth and width
   - Arrangement density
   - Atmospheric qualities

7. 🎭 MOOD & ENERGY - Capture:
   - Primary emotions evoked
   - Energy level and trajectory
   - Tension and release
   - Danceability

🎯 CRITICAL MISSION:
This analysis will be used to REPLICATE this exact sound with Suno AI. Your tags and descriptions are the BLUEPRINT for recreation. Every detail you provide increases the accuracy of the replication.

Be EXHAUSTIVELY detailed. Don't hold back. Include EVERY sonic element you can identify.

Provide your complete analysis in the detailed JSON format specified in the system prompt.`
                },
                {
                  type: 'input_audio',
                  input_audio: {
                    data: base64Audio,
                    format: format
                  }
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Authorization': `Bearer ${this.openaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000 // 2분 타임아웃
        }
      );

      console.log('✅ OpenAI analysis complete');
      
      // JSON 응답 파싱
      const content = response.data.choices[0].message.content;
      console.log('📝 Raw response preview:', content.substring(0, 200) + '...');
      
      let analysis;
      try {
        // JSON 블록에서 추출 시도
        const jsonMatch = content.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          analysis = JSON.parse(jsonMatch[0]);
        } else {
          analysis = JSON.parse(content);
        }
      } catch (parseError) {
        console.error('❌ JSON parsing failed:', parseError);
        console.error('Response content:', content);
        throw new Error('Failed to parse OpenAI response as JSON');
      }

      // 분석 결과 로깅
      console.log('🎨 ===== DETAILED ANALYSIS SUMMARY =====');
      console.log(`   📊 Genre: ${analysis.genre} / ${analysis.subgenre || 'N/A'}`);
      console.log(`   ⚡ Tempo: ${analysis.tempo} (${analysis.bpm || 'N/A'} BPM)`);
      console.log(`   🎵 Key: ${analysis.key || 'N/A'}`);
      console.log(`   🎤 Vocals: ${typeof analysis.vocals === 'object' ? JSON.stringify(analysis.vocals) : analysis.vocals}`);
      console.log(`   🎸 Instruments (${Array.isArray(analysis.instruments) ? analysis.instruments.length : 0}):`);
      if (Array.isArray(analysis.instruments)) {
        analysis.instruments.forEach((inst, idx) => {
          if (typeof inst === 'object') {
            console.log(`      ${idx + 1}. ${inst.name} - ${inst.role} (${inst.prominence})`);
          } else {
            console.log(`      ${idx + 1}. ${inst}`);
          }
        });
      }
      console.log(`   🎚️ Production: ${typeof analysis.production === 'object' ? JSON.stringify(analysis.production) : analysis.production}`);
      console.log(`   🎭 Mood: ${analysis.mood}`);
      console.log(`   💎 Suno Tags (${analysis.sunoTags.length} chars):`);
      console.log(`      ${analysis.sunoTags}`);
      console.log('🎨 ======================================');

      return {
        success: true,
        analysis: analysis,
        tags: analysis.sunoTags,
        rawResponse: content
      };

    } catch (error) {
      console.error('❌ Audio analysis error:', error.response?.data || error.message);
      
      // 에러 타입별 처리
      if (error.response?.status === 401) {
        throw new Error('OpenAI API 인증 실패. API 키를 확인해주세요.');
      } else if (error.response?.status === 429) {
        throw new Error('OpenAI API 요청 한도 초과. 잠시 후 다시 시도해주세요.');
      } else if (error.code === 'ECONNABORTED') {
        throw new Error('분석 시간 초과. 더 짧은 오디오 파일을 시도해주세요.');
      } else if (error.response?.status === 400) {
        throw new Error('잘못된 오디오 파일 형식입니다. MP3, WAV, M4A 형식을 사용해주세요.');
      }
      
      // Fallback: 기본 분석 정보 제공
      console.warn('⚠️ Using fallback analysis due to error');
      return {
        success: false,
        error: error.message,
        fallbackTags: 'contemporary music, balanced production, moderate tempo, mixed instrumentation, engaging arrangement, professional quality',
        analysis: {
          genre: 'Contemporary',
          subgenre: 'Mixed',
          mood: 'Neutral',
          tempo: 'Moderate',
          energy: 'Moderate',
          instruments: ['Various'],
          vocals: 'Unknown',
          production: 'Professional',
          styleDescription: 'Analysis failed. Using general fallback tags. Please try again or provide a different audio file.',
          sunoTags: 'contemporary music, balanced production, moderate tempo, mixed instrumentation, engaging arrangement, professional quality'
        },
        tags: 'contemporary music, balanced production, moderate tempo, mixed instrumentation, engaging arrangement, professional quality'
      };
    }
  }

  /**
   * MIME 타입을 OpenAI 형식으로 변환
   * @param {string} mimeType 
   * @returns {string}
   */
  getMimeTypeFormat(mimeType) {
    const formatMap = {
      'audio/mpeg': 'mp3',
      'audio/mp3': 'mp3',
      'audio/wav': 'wav',
      'audio/wave': 'wav',
      'audio/x-wav': 'wav',
      'audio/mp4': 'mp4',
      'audio/m4a': 'm4a',
      'audio/x-m4a': 'm4a',
      'audio/webm': 'webm',
      'audio/ogg': 'ogg'
    };
    
    return formatMap[mimeType.toLowerCase()] || 'mp3';
  }

  /**
   * 폴백 분석 (OpenAI 실패 시)
   * @param {string} filename 
   * @returns {Object}
   */
  getFallbackAnalysis(filename) {
    console.log('⚠️ Using fallback analysis');
    
    return {
      success: false,
      analysis: {
        genre: 'Unknown',
        mood: 'Neutral',
        tempo: 'Moderate',
        sunoTags: 'Contemporary music, diverse instrumentation, engaging melody'
      },
      tags: 'Contemporary music, diverse instrumentation, engaging melody',
      fallback: true
    };
  }
}

module.exports = AudioAnalyzer;
