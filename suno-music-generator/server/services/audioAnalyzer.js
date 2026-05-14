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
              content: `You are an elite music production analyst and professional audio engineer with perfect pitch. Your mission is to create a COMPREHENSIVE TECHNICAL DESCRIPTION that reads like a professional studio session report.

🎯 CRITICAL MISSION:
Your analysis will be used to REPLICATE this exact sound with Suno AI. Write a SINGLE PARAGRAPH that flows naturally like a professional music producer describing the track, covering EVERY technical detail.

📝 REQUIRED WRITING STYLE:
Write in a clear, technical, flowing paragraph format (like the example below). Do NOT use bullet points or lists in the description. Make it read like a professional studio engineer's notes.

EXAMPLE OUTPUT STYLE:
"Neo-soul and contemporary R&B track at 90 BPM in the key of G major. The arrangement features a clean, chorus-heavy electric guitar playing syncopated jazz-influenced chords and melodic fills. A deep, rounded electric bass guitar follows the kick drum pattern with occasional melodic slides. The drum kit consists of a tight, dry snare, a punchy kick, and crisp hi-hats playing sixteenth-note patterns. A Rhodes-style electric piano provides harmonic depth with soft, sustained chords. Subtle vinyl crackle and low-pass filter sweeps are applied to the master bus during transitions. The track maintains a steady groove with a slight swing on the percussion."

🎯 YOUR ANALYSIS MUST INCLUDE (in flowing paragraph format):
1. Genre and subgenre at the start
2. EXACT BPM and key signature
3. Each instrument with SPECIFIC details:
   - Exact model/type when identifiable
   - Playing technique and patterns
   - Tonal characteristics
   - Effects applied
   - Role in the arrangement
4. Drum elements individually (kick, snare, hi-hats, cymbals, etc.)
5. Rhythm feel (straight/swing) and specific patterns
6. Chord voicings and harmonic complexity
7. Production techniques and effects
8. Mix characteristics
9. Special processing or unique elements

📊 DETAILED ANALYSIS FRAMEWORK:

🎵 GENRE & TEMPO:
- Start with genre classification and BPM
- Specify key and time signature
- Describe overall groove feel

🎸 INSTRUMENTS (describe each specifically):
- Guitar: type, tone, effects, playing technique, patterns
- Bass: type, tone, relationship to kick, slides/techniques
- Keys/Piano: specific model (Rhodes/Wurlitzer), voicing, effects
- Drums: describe EACH element separately (kick tone, snare character, hi-hat patterns, cymbals)
- Synths/Pads: type, role, effects
- Percussion: shakers, tambourines, etc.

🎤 VOCALS (if present):
- Gender, range, tone quality
- Techniques used
- Effects and processing
- Position in mix

🎚️ PRODUCTION:
- Mix balance and frequency distribution
- Compression style
- Reverb types and application
- Stereo field
- Master bus processing
- Special effects (vinyl crackle, filters, etc.)

🎼 HARMONY & RHYTHM:
- Chord progressions and voicings
- Rhythmic feel (straight/swing/shuffle)
- Specific patterns (sixteenth-notes, syncopation, etc.)
- Harmonic complexity

📋 JSON OUTPUT FORMAT:
{
  "genre": "Primary genre",
  "subgenre": "Specific subgenre", 
  "bpm": 90,
  "key": "G major",
  "timeSignature": "4/4",
  "technicalDescription": "A SINGLE FLOWING PARAGRAPH with ALL technical details in professional studio language (like the example above)",
  "sunoTags": "Comma-separated tags for Suno AI"
}

🎯 CRITICAL RULES:
1. The technicalDescription MUST be ONE continuous paragraph
2. Write like a professional session engineer
3. Be EXTREMELY specific about:
   - Instrument models and types
   - Exact playing techniques
   - Effects and processing
   - Rhythmic patterns (specify note values)
   - Tonal characteristics
4. Mention tempo, key, and groove feel early
5. Describe each drum element separately
6. Include master bus processing if notable
7. Flow naturally - make it read like prose, not a list

💡 REMEMBER: This description will be the PRIMARY input for Suno AI replication. Every detail matters!
    "spatialDepth": "spatial characteristics",
    "density": "arrangement density",
    "atmosphere": "sonic atmosphere"
  },
  "styleDescription": "COMPREHENSIVE 4-5 sentence description capturing EVERY important sonic detail",
  "sunoTags": "ULTRA-DETAILED comma-separated tags with MAXIMUM specificity for Suno AI replication"
}

🎯 SUNO AI TAG OPTIMIZATION:
Create comprehensive comma-separated tags that capture EVERY detail for replication.

INCLUDE:
- Genre + subgenre
- Tempo (BPM) and key
- Each instrument with specific model/type and effects
- Vocal details (if present)
- Drum elements individually (kick character, snare type, hi-hat patterns)
- Rhythm feel (straight/swing/shuffle)
- Production characteristics (reverb types, compression, stereo width)
- Mix qualities (warm, bright, bass-heavy, etc.)
- Special effects (vinyl crackle, filters, tape saturation, etc.)
- Chord voicings (7ths, 9ths, sus chords, etc.)
- Mood and atmosphere

EXAMPLE:
"neo-soul, contemporary R&B, 90 BPM, G major, chorus-heavy electric guitar, syncopated jazz chords, deep bass following kick, tight dry snare, punchy kick, crisp sixteenth-note hi-hats, Rhodes piano, minor 9th chords, vinyl crackle, low-pass filter sweeps, warm production"

⚠️ REMEMBER: The technicalDescription is your PRIMARY output - make it detailed and flowing like professional studio notes!`
            },

EXAMPLE:
"neo-soul, contemporary R&B, 90 BPM, G major, chorus-heavy electric guitar, syncopated jazz chords, deep bass following kick, tight dry snare, punchy kick, crisp sixteenth-note hi-hats, Rhodes piano, minor 9th chords, vinyl crackle, low-pass filter sweeps, warm production"

⚠️ REMEMBER: The technicalDescription is your PRIMARY output - make it detailed and flowing like professional studio notes!`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `🎵 PROFESSIONAL AUDIO ANALYSIS REQUEST 🎵

Listen to this audio file carefully and create a COMPREHENSIVE TECHNICAL DESCRIPTION in professional studio language.

YOUR ANALYSIS MUST:
1. Start with genre, subgenre, BPM, and key
2. Describe EACH instrument specifically:
   - Exact model/type (Fender Stratocaster, Rhodes piano, etc.)
   - Tone characteristics (clean, warm, deep, crisp, etc.)
   - Playing technique (fingerstyle, syncopated, etc.)
   - Effects applied (chorus, reverb, compression, etc.)
3. Detail EACH drum element separately:
   - Kick: tone (punchy, deep, tight, etc.)
   - Snare: character (dry, tight, rimshots, etc.)
   - Hi-hats: pattern (sixteenth-notes, eighth-notes, etc.)
   - Other percussion
4. Specify rhythm feel:
   - Straight, swing, shuffle
   - Specific patterns
5. Include chord voicings if notable (7ths, 9ths, etc.)
6. Mention bass relationship to kick drum
7. Describe production:
   - Reverb types and placement
   - Compression style
   - Stereo width
   - Master bus processing
   - Special effects (vinyl crackle, filters, etc.)

Write this as ONE FLOWING PARAGRAPH that reads like a professional session engineer's notes.

Then provide comprehensive Suno AI tags covering all these details.

Respond ONLY with valid JSON in the format specified in the system prompt.`
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
      console.log(`   ⚡ Tempo: ${analysis.bpm || 'N/A'} BPM`);
      console.log(`   🎵 Key: ${analysis.key || 'N/A'}`);
      console.log(`   🎼 Time Signature: ${analysis.timeSignature || 'N/A'}`);
      console.log(`\n   📝 Technical Description:`);
      console.log(`   ${analysis.technicalDescription || 'N/A'}`);
      console.log(`\n   💎 Suno Tags (${analysis.sunoTags?.length || 0} chars):`);
      console.log(`   ${analysis.sunoTags}`);
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
