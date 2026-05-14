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
              content: `You are a professional music analyst specializing in Suno AI music generation. Your task is to LISTEN CAREFULLY to the provided audio and extract EXACT musical characteristics.

CRITICAL: You must analyze the ACTUAL SOUND, not guess. Listen for:
1. The EXACT instruments being played (not generic, be specific: "electric guitar with distortion", "Roland TR-808 drum machine", "Moog synthesizer bass")
2. The EXACT vocal style if present (gender, tone, technique: "breathy female vocals", "raspy male rock vocals", "autotuned pop vocals")
3. The EXACT tempo and rhythm feel (be precise: "128 BPM four-on-the-floor", "70 BPM trap hi-hats", "90 BPM boom-bap")
4. The EXACT production style (be specific: "compressed radio-ready pop", "raw garage rock", "lush orchestral arrangement")

Your response MUST be a valid JSON object with this exact structure:
{
  "genre": "EXACT primary genre heard in the audio",
  "subgenre": "SPECIFIC subgenre that matches the sound",
  "mood": "PRECISE emotional tone (melancholic/energetic/dark/uplifting/aggressive/peaceful)",
  "tempo": "ACTUAL tempo description (slow 60-80 BPM/moderate 80-110 BPM/fast 110-140 BPM/energetic 140+ BPM)",
  "energy": "ACTUAL energy level (calm/moderate/high/intense)",
  "instruments": ["EXACT instruments you hear - be specific"],
  "vocals": "EXACT vocal description or 'instrumental' (include gender, style, technique)",
  "production": "EXACT production quality and style (lo-fi/bedroom pop/professional/radio-ready/raw/polished/vintage)",
  "styleDescription": "2-3 sentences describing the ACTUAL sound you hear",
  "sunoTags": "PRECISE comma-separated Suno AI tags that EXACTLY match what you heard"
}

SUNO AI TAG GUIDELINES:
- Use SPECIFIC genre tags: "synthwave", "trap", "bedroom pop", "indie rock", "lo-fi hip-hop"
- Include EXACT instruments: "808 bass", "electric guitar", "analog synth", "live drums"
- Add PRECISE vocal descriptors: "male vocals", "female vocals", "autotuned", "harmonized", "rap"
- Include ACCURATE tempo/rhythm: "fast tempo", "slow ballad", "mid-tempo groove"
- Add SPECIFIC production: "reverb-heavy", "compressed", "lo-fi", "orchestral"
- Include MOOD accurately: "melancholic", "upbeat", "dark", "dreamy", "aggressive"

EXAMPLE GOOD TAGS:
"melancholic indie rock, electric guitar with reverb, male breathy vocals, slow tempo 70 BPM, bedroom recording, analog warmth"
"energetic synthwave, Moog bass, 808 drums, no vocals, fast tempo 140 BPM, retro production, neon atmosphere"
"trap hip-hop, 808 bass, hi-hat rolls, male rap vocals, mid-tempo 85 BPM, modern production, dark mood"

BE ACCURATE - Don't guess! Listen carefully and describe EXACTLY what you hear.`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: `Listen to this audio file CAREFULLY and analyze it in detail.

I need you to:
1. Identify the EXACT genre and subgenre you hear
2. List ALL instruments you can clearly identify
3. Describe the vocal style precisely (if present) - gender, tone, technique
4. Determine the ACTUAL tempo (estimate BPM if possible)
5. Assess the production quality and style
6. Capture the overall mood and energy

This analysis will be used to generate similar music with Suno AI, so accuracy is CRITICAL. The tags you generate must capture the essence of THIS specific sound.

Provide your analysis in the JSON format specified in the system prompt.`
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
      console.log('🎨 Analysis Summary:');
      console.log(`   Genre: ${analysis.genre} / ${analysis.subgenre || 'N/A'}`);
      console.log(`   Tempo: ${analysis.tempo}`);
      console.log(`   Vocals: ${analysis.vocals}`);
      console.log(`   Instruments: ${analysis.instruments?.join(', ') || 'N/A'}`);
      console.log(`   Suno Tags: ${analysis.sunoTags.substring(0, 100)}...`);

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
