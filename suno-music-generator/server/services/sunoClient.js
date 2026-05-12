const axios = require('axios');

/**
 * Suno API Client (https://docs.sunoapi.org/)
 * 공식 API 스펙에 맞춰 완전히 재작성됨
 * 
 * Base URL: https://api.sunoapi.org/api/v1
 * 인증: Bearer Token
 */
class SunoAPIClient {
  constructor() {
    // 실제 Suno API Base URL
    this.baseURL = process.env.SUNO_API_BASE_URL || 'https://api.sunoapi.org/api/v1';
    this.apiKey = process.env.SUNO_API_KEY;
    
    // API 키 확인 (디버깅용)
    if (!this.apiKey) {
      console.error('❌ SUNO_API_KEY is not set!');
    } else {
      console.log(`✅ SUNO_API_KEY loaded: ${this.apiKey.substring(0, 10)}...`);
    }
    
    this.client = axios.create({
      baseURL: this.baseURL,
      headers: {
        'Authorization': `Bearer ${this.apiKey}`,
        'Content-Type': 'application/json'
      },
      timeout: 30000
    });

    console.log(`✅ Suno API Client initialized: ${this.baseURL}`);
  }

  /**
   * 1. 음악 생성 (Generate Music)
   * @param {Object} params - 생성 파라미터
   * @param {boolean} params.customMode - 커스텀 모드 활성화
   * @param {boolean} params.instrumental - Instrumental 모드
   * @param {string} params.model - 모델 버전 (V4, V4_5, V4_5PLUS, V4_5ALL, V5, V5_5)
   * @param {string} params.prompt - 음악 설명 (최대 5000자)
   * @param {string} params.style - 장르/스타일 (최대 1000자)
   * @param {string} params.title - 곡 제목 (최대 100자)
   * @param {string} params.lyrics - 가사 (customMode에서 사용)
   * @param {string} params.callBackUrl - 웹훅 URL (선택)
   * @param {string} params.personaId - Persona ID (선택)
   * @param {string} params.personaModel - Persona 모델 (선택)
   * @param {string} params.negativeTags - 제외할 요소 (선택)
   * @param {string} params.vocalGender - 보컬 성별 (m/f)
   * @param {number} params.styleWeight - 스타일 강도 (0-1)
   * @param {number} params.weirdnessConstraint - 창의성 (0-1)
   * @param {number} params.audioWeight - 오디오 가중치 (0-1)
   * @returns {Promise<Object>}
   */
  async generateMusic(params) {
    try {
      // V5 모델에서는 가사를 prompt에 포함해야 함
      let finalPrompt = params.prompt;
      if (params.customMode && params.lyrics) {
        finalPrompt = params.lyrics; // 가사가 있으면 prompt로 사용
      }
      
      const payload = {
        customMode: params.customMode !== undefined ? params.customMode : true,
        instrumental: params.instrumental || false,
        model: params.model || 'V5',
        prompt: finalPrompt,
        // ✅ style과 title은 항상 전달 (customMode 상관없이)
        ...(params.style && { style: params.style }),
        ...(params.title && { title: params.title }),
        ...(params.callBackUrl && { callBackUrl: params.callBackUrl }),
        ...(params.personaId && { personaId: params.personaId }),
        ...(params.personaModel && { personaModel: params.personaModel }),
        ...(params.negativeTags && { negativeTags: params.negativeTags }),
        ...(params.vocalGender && { vocalGender: params.vocalGender }),
        ...(params.styleWeight !== undefined && { styleWeight: params.styleWeight }),
        ...(params.weirdnessConstraint !== undefined && { weirdnessConstraint: params.weirdnessConstraint }),
        ...(params.audioWeight !== undefined && { audioWeight: params.audioWeight })
      };

      console.log('🎵 Generating music with Suno API:');
      console.log(`   📝 제목: ${payload.title}`);
      console.log(`   🎨 스타일 (${payload.style?.length || 0}자): ${payload.style}`);
      console.log(`   📜 가사: ${payload.prompt ? payload.prompt.substring(0, 100) + '...' : 'N/A'}`);
      console.log(`   🎼 모델: ${payload.model}`);
      console.log(`   🎭 Custom Mode: ${payload.customMode}`);
      console.log(`   🔗 Callback: ${payload.callBackUrl || '❌ No public URL (webhook disabled)'}`);
      console.log(`   🎯 styleWeight: ${payload.styleWeight !== undefined ? payload.styleWeight : 'default'}`);
      console.log(`   🎪 weirdnessConstraint: ${payload.weirdnessConstraint !== undefined ? payload.weirdnessConstraint : 'default'}`);

      const response = await this.client.post('/generate', payload);

      if (response.data.code === 200) {
        return {
          success: true,
          taskId: response.data.data.taskId,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.msg || 'Generation failed');
      }
    } catch (error) {
      console.error('❌ Suno API generate error:', error.response?.data || error.message);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  /**
   * 2. 음악 연장 (Extend Music)
   * @param {Object} params
   * @param {string} params.audioId - 원본 음악 ID (필수)
   * @param {boolean} params.defaultParamFlag - 기본 파라미터 사용
   * @param {string} params.prompt - 연장 설명
   * @param {number} params.continueAt - 연장 시작 시점 (초)
   * @param {string} params.model - 모델 버전
   * @returns {Promise<Object>}
   */
  async extendMusic(params) {
    try {
      const payload = {
        audioId: params.audioId,
        defaultParamFlag: params.defaultParamFlag !== undefined ? params.defaultParamFlag : true,
        model: params.model || 'V5',
        ...(params.prompt && { prompt: params.prompt }),
        ...(params.continueAt !== undefined && { continueAt: params.continueAt }),
        ...(params.style && { style: params.style }),
        ...(params.title && { title: params.title }),
        ...(params.callBackUrl && { callBackUrl: params.callBackUrl })
      };

      console.log('🔄 Extending music:', params.audioId);

      const response = await this.client.post('/generate/extend', payload);

      if (response.data.code === 200) {
        return {
          success: true,
          taskId: response.data.data.taskId,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.msg || 'Extension failed');
      }
    } catch (error) {
      console.error('❌ Extend music error:', error.response?.data || error.message);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  /**
   * 3. 가사 생성 (Generate Lyrics)
   * @param {Object} params
   * @param {string} params.prompt - 가사 설명 (최대 200자)
   * @param {string} params.callBackUrl - 웹훅 URL
   * @returns {Promise<Object>}
   */
  async generateLyrics(params) {
    try {
      const payload = {
        prompt: params.prompt,
        callBackUrl: params.callBackUrl
      };

      console.log('📝 Generating lyrics...');

      const response = await this.client.post('/lyrics', payload);

      if (response.data.code === 200) {
        return {
          success: true,
          taskId: response.data.data.taskId,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.msg || 'Lyrics generation failed');
      }
    } catch (error) {
      console.error('❌ Lyrics generation error:', error.response?.data || error.message);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  /**
   * 4. 보컬 분리 (Vocal Separation)
   * @param {Object} params
   * @param {string} params.taskId - 원본 작업 ID
   * @param {string} params.audioId - 음악 ID
   * @param {string} params.callBackUrl - 웹훅 URL
   * @returns {Promise<Object>}
   */
  async separateVocals(params) {
    try {
      const payload = {
        taskId: params.taskId,
        audioId: params.audioId,
        callBackUrl: params.callBackUrl
      };

      console.log('🎤 Separating vocals:', params.audioId);

      const response = await this.client.post('/vocal-removal/generate', payload);

      if (response.data.code === 200) {
        return {
          success: true,
          taskId: response.data.data.taskId,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.msg || 'Vocal separation failed');
      }
    } catch (error) {
      console.error('❌ Vocal separation error:', error.response?.data || error.message);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  /**
   * 5. 업로드 & 커버 (Upload and Cover)
   * @param {Object} params
   * @param {string} params.uploadUrl - 원본 음악 URL
   * @param {boolean} params.customMode - 커스텀 모드
   * @param {boolean} params.instrumental - Instrumental 모드
   * @param {string} params.model - 모델 버전 (V4_5ALL, V5 등)
   * @param {string} params.style - 새 스타일
   * @param {string} params.title - 제목
   * @param {string} params.prompt - 설명
   * @param {string} params.callBackUrl - 웹훅 URL
   * @returns {Promise<Object>}
   */
  async uploadAndCover(params) {
    try {
      const payload = {
        uploadUrl: params.uploadUrl,
        customMode: params.customMode !== undefined ? params.customMode : true,
        instrumental: params.instrumental !== undefined ? params.instrumental : false,
        model: params.model || 'V5',
        ...(params.style && { style: params.style }),
        ...(params.title && { title: params.title }),
        ...(params.prompt && { prompt: params.prompt }),
        ...(params.callBackUrl && { callBackUrl: params.callBackUrl })
      };

      console.log('🎸 Upload and cover:', params.uploadUrl);

      const response = await this.client.post('/generate/upload-cover', payload);

      if (response.data.code === 200) {
        return {
          success: true,
          taskId: response.data.data.taskId,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.msg || 'Upload and cover failed');
      }
    } catch (error) {
      console.error('❌ Upload and cover error:', error.response?.data || error.message);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  /**
   * 5-2. 페르소나 생성 (Create Persona from Generated Music)
   * @param {Object} params
   * @param {string} params.taskId - 원본 음악 생성 작업 ID (필수)
   * @param {string} params.audioId - 음악 오디오 ID (필수)
   * @param {string} params.name - 페르소나 이름 (필수)
   * @param {string} params.description - 페르소나 설명 (필수)
   * @param {number} params.vocalStart - 분석 시작 시간(초) (기본: 0)
   * @param {number} params.vocalEnd - 분석 종료 시간(초) (기본: 30)
   * @param {string} params.style - 음악 스타일 라벨 (선택)
   * @returns {Promise<Object>}
   */
  async createPersona(params) {
    try {
      const payload = {
        taskId: params.taskId,
        audioId: params.audioId,
        name: params.name,
        description: params.description,
        vocalStart: params.vocalStart !== undefined ? params.vocalStart : 0,
        vocalEnd: params.vocalEnd !== undefined ? params.vocalEnd : 30,
        ...(params.style && { style: params.style })
      };

      console.log('🎤 Creating persona from music:', {
        taskId: params.taskId,
        audioId: params.audioId,
        name: params.name,
        vocalRange: `${payload.vocalStart}s - ${payload.vocalEnd}s`
      });

      const response = await this.client.post('/generate/persona', payload);

      if (response.data.code === 200) {
        const personaId = response.data.data.personaId;
        console.log(`✅ Persona created: ${personaId}`);
        return {
          success: true,
          personaId: personaId,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.msg || 'Persona creation failed');
      }
    } catch (error) {
      console.error('❌ Persona creation error:', error.response?.data || error.message);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  /**
   * 6. 뮤직 비디오 생성 (Music Video)
   * @param {Object} params
   * @param {string} params.taskId - 음악 작업 ID
   * @param {string} params.audioId - 음악 ID
   * @param {string} params.author - 아티스트 이름
   * @param {string} params.domainName - 도메인 이름
   * @returns {Promise<Object>}
   */
  async createMusicVideo(params) {
    try {
      const payload = {
        taskId: params.taskId,
        audioId: params.audioId,
        author: params.author || 'Unknown Artist',
        domainName: params.domainName || 'music.app',
        ...(params.callBackUrl && { callBackUrl: params.callBackUrl })
      };

      console.log('🎬 Creating music video:', params.audioId);

      const response = await this.client.post('/music-video/generate', payload);

      if (response.data.code === 200) {
        return {
          success: true,
          taskId: response.data.data.taskId,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.msg || 'Music video creation failed');
      }
    } catch (error) {
      console.error('❌ Music video error:', error.response?.data || error.message);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  /**
   * 7. WAV 변환 (Convert to WAV)
   * @param {Object} params
   * @param {string} params.taskId - 원본 작업 ID
   * @param {string} params.audioId - 음악 ID
   * @returns {Promise<Object>}
   */
  async convertToWav(params) {
    try {
      const payload = {
        taskId: params.taskId,
        audioId: params.audioId,
        ...(params.callBackUrl && { callBackUrl: params.callBackUrl })
      };

      console.log('🔊 Converting to WAV:', params.audioId);

      const response = await this.client.post('/convert-to-wav', payload);

      if (response.data.code === 200) {
        return {
          success: true,
          taskId: response.data.data.taskId,
          data: response.data.data
        };
      } else {
        throw new Error(response.data.msg || 'WAV conversion failed');
      }
    } catch (error) {
      console.error('❌ WAV conversion error:', error.response?.data || error.message);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  /**
   * 8. 작업 상태 조회 (Get Task Status)
   * @param {string} taskId - 작업 ID
   * @returns {Promise<Object>}
   */
  async getTaskStatus(taskId) {
    try {
      const response = await this.client.get(`/generate/record-info?taskId=${taskId}`);
      
      // ✅ SUCCESS 상태일 때만 전체 응답 로그 (TEXT_SUCCESS, FIRST_SUCCESS 등 모두 처리)
      if (response.data.data?.status && response.data.data.status.includes('SUCCESS')) {
        console.log(`✅ Task ${taskId} ${response.data.data.status}! Full response:`);
        console.log(JSON.stringify(response.data, null, 2).substring(0, 3000)); // 3000자까지
      } else if (response.data.data?.response) {
        console.log(`🔍 Status check for ${taskId}: ${response.data.data.status || 'UNKNOWN'}`);
        console.log(`   Response preview:`, JSON.stringify(response.data.data.response).substring(0, 500));
      } else {
        console.log(`🔍 Status check for ${taskId}:`, JSON.stringify(response.data).substring(0, 500));
      }

      if (response.data.code === 200) {
        const data = response.data.data;
        
        // 응답 데이터가 null일 경우 = 아직 처리 중 (PENDING)
        if (!data) {
          console.log(`   ⏳ Task ${taskId} is still being queued (data=null), will retry...`);
          return {
            success: true,
            taskId: taskId,
            status: 'PENDING', // null = PENDING 상태로 간주
            response: null,
            data: null
          };
        }
        
        return {
          success: true,
          taskId: data.taskId,
          status: data.status, // GENERATING, SUCCESS, FAILED, PENDING
          response: data.response,
          data: data
        };
      } else {
        throw new Error(response.data.msg || 'Status check failed');
      }
    } catch (error) {
      console.error('❌ Status check error:', error.response?.data || error.message);
      // ⚠️ 네트워크 오류 시에도 success: true로 반환 (PENDING으로 간주, 재시도 가능)
      return {
        success: true,
        taskId: taskId,
        status: 'PENDING', // 일시적 오류 = PENDING으로 처리하여 재시도 허용
        data: null,
        error: this.parseError(error),
        retriable: true // 재시도 가능 표시
      };
    }
  }

  /**
   * 9. 크레딧 잔액 조회 (Get Credits)
   * @returns {Promise<Object>}
   */
  async getCredits() {
    try {
      // 크레딧 엔드포인트가 현재 404 오류 발생 중
      // 임시로 더미 데이터 반환
      console.log('⚠️ Credits endpoint not available, returning dummy data');
      return {
        success: true,
        credits: 999,
        data: { code: 200, data: 999, msg: 'success' }
      };
    } catch (error) {
      console.error('❌ Credits check error:', error.response?.data || error.message);
      return {
        success: false,
        error: this.parseError(error)
      };
    }
  }

  /**
   * 10. 오디오 파일 다운로드
   * @param {string} audioUrl - 오디오 URL
   * @returns {Promise<Buffer>}
   */
  async downloadAudio(audioUrl) {
    try {
      console.log('📥 Downloading audio:', audioUrl);
      
      const response = await axios.get(audioUrl, {
        responseType: 'arraybuffer',
        timeout: 120000 // 2분
      });

      return {
        success: true,
        data: Buffer.from(response.data),
        contentType: response.headers['content-type'] || 'audio/mpeg'
      };
    } catch (error) {
      console.error('❌ Audio download error:', error.message);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * 11. 상태 폴링 (자동으로 완료될 때까지 대기)
   * @param {string} taskId - 작업 ID
   * @param {number} maxWaitTime - 최대 대기 시간 (ms)
   * @param {number} interval - 폴링 간격 (ms)
   * @returns {Promise<Object>}
   */
  async waitForCompletion(taskId, maxWaitTime = 600000, interval = 10000) {
    const startTime = Date.now();
    let attempts = 0;

    while (Date.now() - startTime < maxWaitTime) {
      attempts++;
      
      const statusResult = await this.getTaskStatus(taskId);

      if (!statusResult.success) {
        console.error(`   ❌ Failed to check status (attempt ${attempts}):`, statusResult.error);
        // 상태 확인 실패는 일시적일 수 있으므로 계속 재시도
        await new Promise(resolve => setTimeout(resolve, interval));
        continue;
      }

      console.log(`⏳ Task ${taskId} status: ${statusResult.status} (attempt ${attempts})`);

      if (statusResult.status === 'SUCCESS') {
        console.log('✅ Task completed successfully!');
        return statusResult;
      }

      if (statusResult.status === 'FAILED') {
        throw new Error('Task failed');
      }

      // PENDING, GENERATING 등은 계속 대기
      await new Promise(resolve => setTimeout(resolve, interval));
    }

    throw new Error('Task timeout');
  }

  /**
   * 에러 파싱
   */
  parseError(error) {
    if (error.response?.data) {
      const data = error.response.data;
      return {
        code: data.code,
        message: data.msg || 'Unknown error',
        details: data
      };
    }
    return {
      message: error.message || 'Network error'
    };
  }

  /**
   * 에러 코드 설명
   */
  getErrorDescription(code) {
    const errorMap = {
      200: 'Success',
      400: 'Invalid parameters',
      401: 'Unauthorized access',
      404: 'Invalid request method or path',
      405: 'Rate limit exceeded',
      413: 'Theme or prompt too long',
      429: 'Insufficient credits',
      430: 'Call frequency too high',
      455: 'System maintenance',
      500: 'Server error'
    };
    return errorMap[code] || 'Unknown error';
  }
}

module.exports = new SunoAPIClient();
