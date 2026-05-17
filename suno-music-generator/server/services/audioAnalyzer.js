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
              content: `You are an expert music analyst. Create a detailed technical analysis for Suno AI music replication.

EXAMPLE OUTPUT:
"Neo-soul and contemporary R&B track at 90 BPM in G major. Clean chorus-heavy electric guitar plays syncopated jazz chords. Deep rounded bass follows kick drum with melodic slides. Tight dry snare, punchy kick, crisp sixteenth-note hi-hats. Rhodes-style piano provides harmonic depth with sustained chords. Subtle vinyl crackle and low-pass filter sweeps on transitions. Steady groove with slight swing."

REQUIRED JSON FORMAT:
{
  "genre": "Primary genre",
  "subgenre": "Specific subgenre", 
  "bpm": 90,
  "key": "G major",
  "timeSignature": "4/4",
  "technicalDescription": "Single flowing paragraph with ALL technical details",
  "sunoTags": "Comma-separated tags: genre, subgenre, BPM, key, instruments, effects, production style"
}

ANALYSIS REQUIREMENTS:
1. Start with genre, BPM, key
2. Describe each instrument: type, tone, technique, effects
3. Detail drums separately: kick tone, snare character, hi-hat pattern
4. Specify rhythm feel: straight/swing/shuffle
5. Include production: reverb, compression, stereo width, special FX
6. Write as ONE flowing paragraph like studio notes

SUNO TAG FORMAT:
"genre, subgenre, BPM, key, instrument1 with details, instrument2 with details, drum characteristics, production qualities, mood"

EXAMPLE TAGS:
"neo-soul, R&B, 90 BPM, G major, chorus electric guitar, syncopated jazz chords, deep bass, tight snare, Rhodes piano, vinyl crackle, warm production"`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Analyze this audio and create a technical description for Suno AI replication.

Include:
- Genre, BPM, key
- Each instrument: type, tone, technique, effects
- Drums: kick, snare, hi-hat details
- Production: reverb, compression, special FX
- Write as ONE paragraph

Provide comprehensive Suno AI tags.

Respond with JSON only.`
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

      // Generate thumbnail prompts
      const thumbnailPrompts = this.generateThumbnailPrompts(analysis);

      return {
        success: true,
        analysis: analysis,
        tags: analysis.sunoTags,
        rawResponse: content,
        thumbnailPrompts: thumbnailPrompts
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
   * 분석 결과로부터 썸네일 프롬프트 생성
   * @param {Object} analysis - 음악 분석 결과
   * @returns {Array<string>} 썸네일 프롬프트 배열
   */
  generateThumbnailPrompts(analysis) {
    const prompts = [];
    
    // 기본 정보
    const genre = analysis.genre || 'music';
    const subgenre = analysis.subgenre || '';
    const mood = analysis.mood || 'neutral';
    const key = analysis.key || '';
    
    // 프롬프트 1: 장르 기반 추상적 이미지
    prompts.push(
      `Abstract ${genre} ${subgenre} album cover, vibrant colors representing ${mood} mood, modern design, professional music artwork, high quality, 16:9 ratio`
    );
    
    // 프롬프트 2: 악기 기반 이미지
    if (analysis.instruments && analysis.instruments.length > 0) {
      const instruments = Array.isArray(analysis.instruments) 
        ? analysis.instruments.slice(0, 3).join(', ')
        : analysis.instruments;
      prompts.push(
        `${genre} music scene featuring ${instruments}, artistic lighting, professional photography, album cover style, cinematic, 16:9 ratio`
      );
    }
    
    // 프롬프트 3: 무드와 에너지 기반
    const energy = analysis.energy || 'moderate';
    prompts.push(
      `${mood} ${energy} energy album artwork, ${genre} vibes, abstract shapes and gradients, modern minimal design, professional quality, 16:9 ratio`
    );
    
    return prompts;
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
