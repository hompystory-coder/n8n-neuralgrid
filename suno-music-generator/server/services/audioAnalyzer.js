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
              content: `You are a professional music analyst. Analyze the provided audio and generate style tags suitable for Suno AI music generation.

Your response MUST be a valid JSON object with this exact structure:
{
  "genre": "primary genre",
  "subgenre": "specific subgenre if applicable",
  "mood": "overall emotional tone",
  "tempo": "slow/moderate/fast/energetic",
  "energy": "calm/moderate/high/intense",
  "instruments": ["list", "of", "main", "instruments"],
  "vocals": "none/male/female/mixed/instrumental",
  "production": "lo-fi/professional/raw/polished",
  "styleDescription": "detailed 2-3 sentence description",
  "sunoTags": "comma-separated tags optimized for Suno AI (max 1000 characters)"
}

Focus on:
- Musical genre and style
- Tempo and rhythm
- Instrumentation
- Vocal characteristics (if any)
- Mood and atmosphere
- Production quality

Generate Suno-style tags that are descriptive, specific, and use keywords like: genre names, instruments, moods, tempo indicators (e.g., "upbeat electronic", "melancholic piano", "energetic rock guitar", "smooth jazz saxophone").`
            },
            {
              role: 'user',
              content: [
                {
                  type: 'text',
                  text: 'Analyze this audio track and provide detailed style information in JSON format.'
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
      console.log('📝 Raw response:', content);
      
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

      console.log('🎨 Extracted Suno tags:', analysis.sunoTags);

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
      }
      
      return {
        success: false,
        error: error.message,
        fallbackTags: 'Contemporary music, diverse instrumentation, engaging melody'
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
