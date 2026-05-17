const express = require('express');
const router = express.Router();
const fs = require('fs').promises;
const path = require('path');
const { exec } = require('child_process');
const { promisify } = require('util');
const execPromise = promisify(exec);
const fetch = require('node-fetch'); // YouTube oEmbed API 호출용

/**
 * 🎬 유튜브 음악 분석 API
 * 
 * POST /api/music/analyze-youtube
 * 
 * Body:
 * {
 *   "url": "https://www.youtube.com/watch?v=...",
 *   "maxDuration": 180 // 최대 3분
 * }
 */
router.post('/analyze-youtube', async (req, res) => {
  const { url, maxDuration = 180 } = req.body;

  if (!url || !url.includes('youtube')) {
    return res.status(400).json({
      success: false,
      error: '올바른 유튜브 URL을 입력해주세요'
    });
  }

  const tempDir = path.join(__dirname, '../temp');
  const timestamp = Date.now();
  const audioFile = path.join(tempDir, `youtube_${timestamp}.mp3`);

  try {
    console.log(`🎬 유튜브 분석 시작: ${url}`);

    // 임시 디렉토리 생성
    await fs.mkdir(tempDir, { recursive: true });

    let videoInfo = null;
    let downloadSuccess = false;

    // 1️⃣ yt-dlp로 메타데이터 가져오기 (여러 옵션 시도)
    console.log('📊 유튜브 메타데이터 로드 중...');
    
    // 여러 방법으로 시도
    const attempts = [
      {
        name: '쿠키 + Firefox',
        command: `yt-dlp --cookies-from-browser firefox --dump-json --no-warnings "${url}"`
      },
      {
        name: '쿠키 + Chrome',
        command: `yt-dlp --cookies-from-browser chrome --dump-json --no-warnings "${url}"`
      },
      {
        name: 'User-Agent 회전',
        command: `yt-dlp --dump-json --no-warnings --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36" "${url}"`
      },
      {
        name: '기본 모드',
        command: `yt-dlp --dump-json --no-warnings --no-check-certificates "${url}"`
      }
    ];
    
    for (const attempt of attempts) {
      try {
        console.log(`🔍 시도: ${attempt.name}`);
        const { stdout: infoJson } = await execPromise(attempt.command, { 
          timeout: 30000,
          maxBuffer: 10 * 1024 * 1024 
        });
        videoInfo = JSON.parse(infoJson);
        console.log(`✅ 성공! 영상 정보: ${videoInfo.title} (${attempt.name})`);
        break;
      } catch (error) {
        console.warn(`⚠️ ${attempt.name} 실패:`, error.message.split('\n')[0]);
        continue;
      }
    }
    
    // 모든 시도 실패 시
    if (!videoInfo) {
      console.warn('⚠️ 모든 메타데이터 로드 방법 실패, 웹 스크래핑 시도...');
      
      try {
        // YouTube oEmbed API 사용 (공식)
        const videoId = url.match(/(?:v=|\/)([\w-]{11})/)?.[1];
        if (videoId) {
          const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
          const response = await fetch(oembedUrl);
          if (response.ok) {
            const data = await response.json();
            videoInfo = {
              title: data.title,
              uploader: data.author_name,
              duration: maxDuration,
              thumbnail: data.thumbnail_url,
              description: '',
              videoId: videoId
            };
            console.log(`✅ oEmbed API로 정보 획득: ${videoInfo.title}`);
          }
        }
      } catch (e) {
        console.warn('⚠️ oEmbed API 실패:', e.message);
      }
      
      // 최종 폴백
      if (!videoInfo) {
        const videoId = url.match(/(?:v=|\/)([\w-]{11})/)?.[1];
        videoInfo = {
          title: videoId ? `YouTube Video ${videoId}` : 'YouTube Music',
          uploader: 'Unknown Artist',
          duration: maxDuration,
          thumbnail: videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : 'https://via.placeholder.com/480x360',
          description: '',
          videoId: videoId
        };
        console.log('⚠️ 폴백 데이터 사용');
      }
    }

    // 2️⃣ 오디오 다운로드 시도 (여러 옵션)
    console.log(`🎵 오디오 다운로드 시도 중... (최대 ${maxDuration}초)`);
    
    const downloadAttempts = [
      {
        name: '쿠키 + Firefox',
        command: `yt-dlp -x --audio-format mp3 --cookies-from-browser firefox \
          --postprocessor-args "ffmpeg:-t ${maxDuration}" \
          --no-warnings --max-filesize 10M \
          -o "${audioFile}" "${url}"`
      },
      {
        name: '쿠키 + Chrome',
        command: `yt-dlp -x --audio-format mp3 --cookies-from-browser chrome \
          --postprocessor-args "ffmpeg:-t ${maxDuration}" \
          --no-warnings --max-filesize 10M \
          -o "${audioFile}" "${url}"`
      },
      {
        name: 'User-Agent + Referer',
        command: `yt-dlp -x --audio-format mp3 \
          --postprocessor-args "ffmpeg:-t ${maxDuration}" \
          --no-warnings --no-check-certificates \
          --user-agent "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36" \
          --referer "https://www.youtube.com/" \
          --max-filesize 10M \
          -o "${audioFile}" "${url}"`
      }
    ];
    
    for (const attempt of downloadAttempts) {
      try {
        console.log(`🔍 다운로드 시도: ${attempt.name}`);
        await execPromise(attempt.command, { 
          timeout: 30000, // 30초 타임아웃 (빠른 폴백)
          maxBuffer: 50 * 1024 * 1024 
        });

        // 파일 존재 확인
        await fs.access(audioFile);
        downloadSuccess = true;
        console.log(`✅ 오디오 다운로드 완료! (${attempt.name})`);
        break;
      } catch (error) {
        console.warn(`⚠️ ${attempt.name} 다운로드 실패:`, error.message.split('\n')[0]);
        continue;
      }
    }
    
    if (!downloadSuccess) {
      console.warn('⚠️ 모든 다운로드 방법 실패 (제목 기반 분석으로 계속)');
    }

    // 2️⃣-A 실제 오디오 분석 (다운로드 성공 시)
    let audioAnalysis = null;
    if (downloadSuccess) {
      console.log('🎼 실제 오디오 파일 분석 중... (librosa)');
      try {
        const analyzeScript = path.join(__dirname, 'analyze_audio.py');
        const { stdout } = await execPromise(`python3 "${analyzeScript}" "${audioFile}"`, {
          timeout: 60000,
          maxBuffer: 10 * 1024 * 1024
        });
        audioAnalysis = JSON.parse(stdout);
        
        if (audioAnalysis.success) {
          console.log('✅ 오디오 분석 완료:', {
            tempo: audioAnalysis.tempo,
            instruments: audioAnalysis.instruments,
            energy: audioAnalysis.energy_level,
            genre_hints: audioAnalysis.genre_hints
          });
        } else {
          console.warn('⚠️ 오디오 분석 실패:', audioAnalysis.error);
          audioAnalysis = null;
        }
      } catch (err) {
        console.warn('⚠️ 오디오 분석 스크립트 오류:', err.message);
        audioAnalysis = null;
      }
    }

    // 3️⃣ 음악 분석 (AI 기반 정밀 분석)
    console.log('🔍 AI 기반 정밀 음악 분석 중...');
    
    // GenSpark LLM API로 제목/설명 분석 (더 정밀하게)
    let aiAnalysis = null;
    try {
      const OpenAI = require('openai');
      const fs = require('fs');
      const yaml = require('js-yaml');
      const os = require('os');
      const configPath = path.join(os.homedir(), '.genspark_llm.yaml');
      
      // GenSpark LLM 설정 로드
      let config = null;
      if (fs.existsSync(configPath)) {
        const fileContents = fs.readFileSync(configPath, 'utf8');
        config = yaml.load(fileContents);
      }
      
      // OpenAI 클라이언트 초기화
      // 1순위: .env의 OPENAI_API_KEY (실제 OpenAI API)
      // 2순위: 환경변수 GSK_TOKEN (GenSpark LLM Proxy)
      // 3순위: yaml 파일
      let apiKey = process.env.OPENAI_API_KEY || process.env.GSK_TOKEN;
      let baseURL = 'https://api.openai.com/v1'; // OpenAI 기본 URL
      
      // GenSpark LLM Proxy 사용 시
      if (process.env.GSK_TOKEN && !process.env.OPENAI_API_KEY) {
        apiKey = process.env.GSK_TOKEN;
        baseURL = 'https://www.genspark.ai/api/llm_proxy/v1';
      } else if (config?.openai?.base_url) {
        baseURL = config.openai.base_url;
      }
      
      if (!apiKey && config?.openai?.api_key) {
        // yaml에서 ${GENSPARK_TOKEN} 치환
        apiKey = config.openai.api_key.replace('${GENSPARK_TOKEN}', process.env.GSK_TOKEN || '');
      }
      
      const openai = new OpenAI({
        apiKey: apiKey,
        baseURL: baseURL
      });
      
      console.log('🔑 Using LLM API at:', baseURL);
      console.log('🔑 API Key length:', apiKey?.length || 0);
      
      const analysisPrompt = `당신은 전문 음악 프로듀서, 음악학자, Suno AI 전문가입니다. 다음 YouTube 음악 정보를 분석해서 **Suno AI로 재현 가능한 수준으로 극도로 정밀하게** 파악해주세요:

제목: ${videoInfo.title}
${videoInfo.description ? `설명: ${videoInfo.description.substring(0, 500)}` : ''}
아티스트/업로더: ${videoInfo.uploader || videoInfo.channel || 'Unknown'}

🎯 **목표: Suno AI에서 유사한 음악 생성을 위한 최적 파라미터 추출**

🎼 **음악 이론 + 프로덕션 기반 초정밀 분석:**

1️⃣ **장르 & 서브장르 (매우 구체적으로)**:
   - 메인 장르: hip-hop, pop, rock, electronic, r&b, ballad, jazz, indie, k-pop, etc.
   - **서브장르 필수**: lo-fi hip-hop, trap, boom-bap, synth-pop, indie-folk, dream-pop, etc.
   - 장르 퓨전인 경우: 두 장르 명시 (예: "indie-pop with electronic elements")

2️⃣ **BPM 정밀 추정 (±5 BPM 이내)**:
   - Ballad/Emotional: 60-80 BPM
   - Lo-fi/Chill/Cafe: 70-95 BPM
   - R&B/Soul: 85-105 BPM
   - Pop/Rock: 100-130 BPM
   - House/Dance/EDM: 120-135 BPM
   - Trap (Half-time feel): 135-160 BPM
   - Drum & Bass: 160-180 BPM
   - **제목 키워드 우선**: "빠른"(+20), "느린"(-20), "댄스"(128), "칠"(85)

3️⃣ **보컬 스타일 초정밀 분석 (Suno 태그용)**:
   - **성별**: male/female/mixed/instrumental (명확히 판단)
   - **음역대**: low(저음), mid(중음), high(고음), soprano, tenor, etc.
   - **발성 스타일**: 
     * R&B/Soul: smooth, soulful, melismatic, runs
     * K-pop: bright, clear, powerful, belting
     * Indie: raw, emotional, natural, breathy
     * Rap: rhythmic, flow, staccato, melodic-rap
     * Ballad: delicate, soft, emotional, vibrato
   - **톤 특성**: warm, bright, husky, breathy, airy, rich, raspy
   - **표현 기법**: vibrato, falsetto, belting, whisper, vocal-fry

4️⃣ **악기 구성 (Suno에서 인식 가능한 악기명)**:
   - 리듬: 808-bass, hi-hat, snare, kick, trap-drums, lo-fi-drums
   - 화성: piano, rhodes, synth, pad, guitar (acoustic/electric/jazz)
   - 베이스: bass, 808, sub-bass, synth-bass
   - 효과: vinyl-crackle, tape-hiss, ambient-noise
   - 기타: strings, brass, orchestral, choir

5️⃣ **프로덕션 & 사운드 디자인**:
   - 공간감: dry(intimate), ambient, reverb, spacious, wide-stereo
   - 음색: warm, bright, dark, clean, lo-fi, vintage, modern
   - 레이어링: minimal, layered, orchestral, dense
   - 시대: vintage(70s-80s), retro(90s), modern(2010s+)

6️⃣ **무드 & 에너지**:
   - 무드: chill, energetic, emotional, romantic, dark, dreamy, upbeat
   - 에너지 (1-10): 
     * 1-3: ambient, meditation
     * 4-5: chill, study, cafe
     * 6-7: pop, upbeat
     * 8-10: dance, party, workout

📋 **다음 JSON 형식으로 응답 (다른 텍스트 절대 금지)**:
{
  "genre": "메인 장르 (한 단어)",
  "subGenre": "구체적 서브장르 (필수)",
  "vocal": {
    "gender": "male/female/mixed/instrumental",
    "range": "low/mid/high 또는 구체적 음역",
    "style": "구체적 스타일 (2-3단어)",
    "tone": "톤 특성 (2-3단어)",
    "delivery": "표현 기법",
    "technique": "발성 기법"
  },
  "bpm": 120,
  "mood": "구체적 무드",
  "energy": 8,
  "instruments": ["악기1", "악기2", "악기3"],
  "production": "프로덕션 스타일",
  "soundDesign": "사운드 특성",
  "era": "시대",
  "tags": ["태그1", "태그2"]
}

⚠️ **매우 중요**:
1. 제목 키워드 최우선 반영: "카페" = chill/lo-fi, "춤" = energetic/dance
2. 아티스트명 고려: 유명 아티스트면 스타일 추론 가능
3. JSON만 출력 (마크다운, 설명, 기타 텍스트 절대 금지)
4. instruments는 최대 6개까지만
5. tags는 Suno에서 사용 가능한 영문 태그로`;

      const response = await openai.chat.completions.create({
        model: baseURL.includes('openai.com') ? 'gpt-4o-mini' : 'gpt-5-mini', // OpenAI는 gpt-4o-mini, GenSpark는 gpt-5-mini
        messages: [
          {
            role: 'system',
            content: '당신은 전문 음악 프로듀서이자 Suno AI 전문가입니다. YouTube 제목/설명을 분석하여 Suno AI 생성에 최적화된 정밀 파라미터를 JSON으로만 응답합니다. 절대 다른 텍스트를 포함하지 마세요.'
          },
          {
            role: 'user',
            content: analysisPrompt
          }
        ],
        temperature: 0.2, // 더 정확한 분석을 위해 낮춤
        max_tokens: 800 // 더 상세한 분석을 위해 증가
      });
      
      console.log('✅ AI 분석 응답 수신 완료');
      const aiResponse = response.choices[0].message.content.trim();
      // JSON 파싱
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        aiAnalysis = JSON.parse(jsonMatch[0]);
        console.log('✅ AI 분석 완료:', aiAnalysis);
      }
    } catch (aiError) {
      console.warn('⚠️ AI 분석 실패, 기본 분석 사용:', aiError.message);
    }
    
    // 🎯 분석 우선순위: 실제 오디오 > AI 분석 > 텍스트 추론
    // BPM: 오디오 분석이 가장 정확함
    const detectedBPM = audioAnalysis?.tempo || 
                        aiAnalysis?.bpm || 
                        detectBPMFromText(videoInfo.title, videoInfo.description);
    
    // 장르: AI 분석 우선, 오디오는 힌트로만 사용
    let detectedGenre = aiAnalysis?.genre || detectGenreFromText(videoInfo.title, videoInfo.description);
    if (audioAnalysis?.genre_hints?.length > 0 && !aiAnalysis) {
      // AI 분석 없으면 오디오 힌트 사용
      detectedGenre = audioAnalysis.genre_hints[0];
    }
    
    // 무드: AI 또는 텍스트 기반
    const detectedMood = aiAnalysis?.mood || detectMoodFromText(videoInfo.title, videoInfo.description);
    
    // 악기: 오디오 분석 우선
    let detectedInstruments = audioAnalysis?.instruments || 
                              aiAnalysis?.instruments || 
                              detectInstrumentsFromText(videoInfo.title, videoInfo.description, detectedGenre);
    
    // 🎚️ 에너지 레벨 자동 계산 (오디오 > AI > 장르+무드)
    let detectedEnergy = audioAnalysis?.energy_level || aiAnalysis?.energy || 5;
    
    if (!audioAnalysis?.energy_level && !aiAnalysis?.energy) {
      // 폴백: 무드와 장르로 추정
      if (detectedMood === 'energetic') {
        detectedEnergy = 8;
      } else if (detectedMood === 'dark' || detectedMood === 'intense') {
        detectedEnergy = 7;
      } else if (detectedMood === 'chill' || detectedMood === 'dreamy') {
        detectedEnergy = 4;
      } else if (detectedMood === 'emotional' || detectedMood === 'romantic') {
        detectedEnergy = 5;
      }
      
      // 장르별 조정
      if (detectedGenre === 'trap' || detectedGenre === 'edm') {
        detectedEnergy = Math.max(detectedEnergy, 7);
      } else if (detectedGenre === 'lo-fi' || detectedGenre === 'ballad') {
        detectedEnergy = Math.min(detectedEnergy, 5);
      }
      
      console.log(`🎚️ 에너지 자동 계산: ${detectedMood} + ${detectedGenre} = ${detectedEnergy}/10`);
    }
    
    const analysis = {
      title: videoInfo.title || 'Unknown Title',
      artist: videoInfo.uploader || videoInfo.channel || 'Unknown Artist',
      duration: Math.min(parseInt(videoInfo.duration || maxDuration), maxDuration),
      thumbnail: videoInfo.thumbnail || videoInfo.thumbnails?.[0]?.url,
      description: videoInfo.description || '',
      
      // 보컬: 오디오 분석 > AI > 텍스트 추론
      vocal: audioAnalysis?.vocal_style?.type === 'vocal' 
        ? {
            gender: aiAnalysis?.vocal?.gender || detectGenderFromText(videoInfo.title, videoInfo.description),
            style: audioAnalysis.vocal_style.style,
            tone: audioAnalysis.vocal_style.tone,
            range: aiAnalysis?.vocal?.range || 'mid'
          }
        : (aiAnalysis?.vocal || {
            gender: detectGenderFromText(videoInfo.title, videoInfo.description),
            style: 'standard',
            tone: 'neutral'
          }),
      
      genre: detectedGenre,
      subGenre: aiAnalysis?.subGenre || null,
      bpm: detectedBPM,
      mood: detectedMood,
      energy: detectedEnergy,
      instruments: detectedInstruments,
      production: aiAnalysis?.production || 'standard',
      soundDesign: aiAnalysis?.soundDesign || null,
      era: aiAnalysis?.era || 'modern',
      
      // Suno 프롬프트
      sunoPrompt: null,
      
      // 오디오 파일 경로 (있으면)
      audioPath: downloadSuccess ? audioFile : null,
      
      // 오디오 분석 상세 (있으면)
      audioFeatures: audioAnalysis?.audio_features || null,
      
      // 분석 소스
      analysisSource: audioAnalysis 
        ? 'audio-analysis' 
        : (aiAnalysis ? 'ai-analysis' : 'metadata-only')
    };

    // 4️⃣ Suno 프롬프트 생성
    analysis.sunoPrompt = generateSunoPrompt(analysis);

    console.log('✅ 분석 완료:', {
      title: analysis.title,
      genre: analysis.genre,
      vocal: analysis.vocal,
      bpm: analysis.bpm,
      source: analysis.analysisSource
    });

    res.json({
      success: true,
      data: analysis
    });

    // 5분 후 파일 삭제 (있으면)
    if (downloadSuccess) {
      setTimeout(async () => {
        try {
          await fs.unlink(audioFile);
          console.log(`🗑️ 임시 파일 삭제: ${audioFile}`);
        } catch (err) {
          console.error('파일 삭제 실패:', err);
        }
      }, 5 * 60 * 1000);
    }

  } catch (error) {
    console.error('❌ 유튜브 분석 실패:', error);
    
    // 에러 시 파일 삭제 시도
    try {
      await fs.unlink(audioFile);
    } catch (e) {
      // 무시
    }

    res.status(500).json({
      success: false,
      error: error.message || '음악 분석 중 오류가 발생했습니다'
    });
  }
});

/**
 * 텍스트에서 성별 감지
 */
function detectGenderFromText(title, description = '') {
  const text = (title + ' ' + description).toLowerCase();
  
  // 여성 가수 키워드
  const femaleKeywords = ['아이유', '태연', '블랙핑크', 'iu', 'taeyeon', 'blackpink', 'twice', 'red velvet', 
                          'female', 'girl', 'woman', '여성', '여자', 'she', 'her'];
  
  // 남성 가수 키워드
  const maleKeywords = ['방탄소년단', 'bts', 'exo', '엑소', 'male', 'boy', 'man', '남성', '남자', 'he', 'his'];
  
  for (const keyword of femaleKeywords) {
    if (text.includes(keyword)) return 'female';
  }
  
  for (const keyword of maleKeywords) {
    if (text.includes(keyword)) return 'male';
  }
  
  return 'auto'; // 기본값
}

/**
 * 텍스트에서 장르 감지 (강화 버전)
 */
function detectGenreFromText(title, description = '') {
  const text = (title + ' ' + description).toLowerCase();
  
  // 🎯 세부 장르 우선 감지 (더 구체적)
  const detailedGenreMap = {
    'lo-fi': ['lo-fi', 'lofi', '로파이', 'chill beat', 'study', '카페', 'cafe'],
    'trap': ['trap', '트랩'],
    'boom-bap': ['boom bap', 'boom-bap', '붐뱁', '90s hip'],
    'r&b': ['알앤비', 'r&b', 'rnb', 'r and b', 'soul', '소울'],
    'ballad': ['발라드', 'ballad'],
    'indie-pop': ['인디팝', 'indie pop'],
    'k-pop': ['k-pop', 'kpop', '케이팝', '아이돌'],
    'edm': ['edm', 'electronic', 'house', 'techno', '일렉트로닉'],
    'jazz': ['재즈', 'jazz', '쟈즈'],
    'rock': ['록', 'rock', '밴드']
  };
  
  // 세부 장르 먼저 체크
  for (const [genre, keywords] of Object.entries(detailedGenreMap)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        console.log(`🎵 장르 감지: "${keyword}" → ${genre}`);
        return genre;
      }
    }
  }
  
  // 메인 장르 체크
  const mainGenreMap = {
    'hip-hop': ['힙합', 'hip hop', 'rap', '랩', 'hiphop', '힙플', '플리'],
    'pop': ['팝', 'pop'],
    'indie': ['인디', 'indie']
  };
  
  for (const [genre, keywords] of Object.entries(mainGenreMap)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        console.log(`🎵 장르 감지: "${keyword}" → ${genre}`);
        return genre;
      }
    }
  }
  
  return 'pop'; // 기본값
}

/**
 * 텍스트에서 BPM 감지 (강화 버전)
 */
function detectBPMFromText(title, description = '') {
  const text = (title + ' ' + description).toLowerCase();
  
  // BPM 숫자 직접 추출
  const bpmMatch = text.match(/(\d+)\s*bpm/i);
  if (bpmMatch) {
    return parseInt(bpmMatch[1]);
  }
  
  // 🎯 장르별 BPM 추정 (더 정확하게)
  if (text.includes('lo-fi') || text.includes('lofi') || text.includes('chill') || text.includes('카페')) {
    return 85; // Lo-fi는 느림
  }
  if (text.includes('trap') || text.includes('트랩')) {
    return 140; // Trap은 빠름
  }
  if (text.includes('ballad') || text.includes('발라드') || text.includes('느린')) {
    return 70; // 발라드는 매우 느림
  }
  if (text.includes('edm') || text.includes('house') || text.includes('댄스')) {
    return 128; // EDM은 빠름
  }
  if (text.includes('r&b') || text.includes('soul')) {
    return 95; // R&B는 중간
  }
  
  // 템포 키워드
  if (text.includes('slow')) return 75;
  if (text.includes('fast')) return 130;
  
  return 120; // 기본값
}

/**
 * 텍스트에서 무드 감지 (강화 버전)
 */
function detectMoodFromText(title, description = '') {
  const text = (title + ' ' + description).toLowerCase();
  
  const moodMap = {
    'energetic': ['춤추고', '신나는', '에너지', 'energetic', 'upbeat', 'exciting', 'party', 'dance', '댄스', '일어날', 'hype', 'pump'],
    'chill': ['chill', '칠', '편안', '카페', 'cafe', 'relax', 'study', 'lofi', 'lo-fi', '아침', '힐링'],
    'emotional': ['감성', '애절', '슬픈', 'sad', 'emotional', 'melancholic', '눈물'],
    'romantic': ['로맨틱', '사랑', 'love', 'romantic', 'sweet'],
    'dark': ['다크', '어두운', 'dark', 'aggressive', '강렬', 'intense'],
    'dreamy': ['몽환', 'dreamy', 'ambient', '감미로운']
  };
  
  // 우선순위대로 체크 (energetic이 chill보다 우선)
  for (const [mood, keywords] of Object.entries(moodMap)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        console.log(`🎭 무드 감지: "${keyword}" → ${mood}`);
        return mood;
      }
    }
  }
  
  return 'chill'; // 기본값
}

/**
 * 텍스트에서 악기 감지 (강화 버전)
 */
function detectInstrumentsFromText(title, description = '', genre = '') {
  const text = (title + ' ' + description).toLowerCase();
  
  const instruments = [];
  
  // 🎹 장르별 기본 악기 세트
  const genreInstruments = {
    'lo-fi': ['piano', 'rhodes', 'jazz guitar', 'vinyl crackle', '808 bass', 'lo-fi drums'],
    'trap': ['808', 'hi-hat', 'snare', 'synth'],
    'r&b': ['piano', 'bass', 'drums', 'electric guitar'],
    'ballad': ['piano', 'strings', 'acoustic guitar'],
    'rock': ['electric guitar', 'bass', 'drums'],
    'jazz': ['piano', 'saxophone', 'double bass', 'drums']
  };
  
  // 장르로 악기 결정
  if (genre && genreInstruments[genre]) {
    console.log(`🎸 장르 "${genre}"의 기본 악기 사용:`, genreInstruments[genre]);
    return genreInstruments[genre];
  }
  
  // 제목에서 장르 감지
  for (const [genreName, instrumentList] of Object.entries(genreInstruments)) {
    if (text.includes(genreName) || text.includes(genreName.replace('-', ''))) {
      console.log(`🎸 장르 "${genreName}"의 기본 악기 사용`);
      return instrumentList;
    }
  }
  
  // 개별 악기 키워드 감지
  const instrumentKeywords = {
    'piano': ['piano', '피아노'],
    'guitar': ['guitar', '기타'],
    'drums': ['drums', '드럼'],
    'bass': ['bass', '베이스'],
    'strings': ['strings', '스트링', 'violin', '바이올린', 'orchestra'],
    'synth': ['synth', '신스', 'synthesizer'],
    'saxophone': ['saxophone', '색소폰', 'sax']
  };
  
  for (const [instrument, keywords] of Object.entries(instrumentKeywords)) {
    for (const keyword of keywords) {
      if (text.includes(keyword)) {
        instruments.push(instrument);
        break;
      }
    }
  }
  
  // 기본값 (힙합)
  if (instruments.length === 0) {
    instruments.push('vocals', 'drums', 'bass');
  }
  
  return instruments;
}

/**
 * Suno 프롬프트 생성 (초정밀 버전)
 */
function generateSunoPrompt(analysis) {
  const parts = [];
  
  // 🎵 1. 장르 (서브장르 우선, 없으면 메인장르)
  if (analysis.subGenre) {
    parts.push(analysis.subGenre);  // "lo-fi hip-hop", "synth-pop"
  } else {
    parts.push(analysis.genre);
  }
  
  // 🎤 2. 보컬 스타일 (매우 구체적으로)
  if (analysis.vocal && analysis.vocal.gender && analysis.vocal.gender !== 'auto' && analysis.vocal.gender !== 'instrumental') {
    const vocalTags = [];
    
    // 성별
    vocalTags.push(`${analysis.vocal.gender} vocals`);
    
    // 음역대 (Suno가 이해 가능한 형태)
    if (analysis.vocal.range && analysis.vocal.range !== 'mid') {
      vocalTags.push(`${analysis.vocal.range} voice`);  // "high voice", "low voice"
    }
    
    // 스타일 + 톤 조합 (짧고 명료하게)
    const styleDescriptors = [];
    if (analysis.vocal.style && analysis.vocal.style !== 'standard') {
      styleDescriptors.push(analysis.vocal.style);
    }
    if (analysis.vocal.tone && analysis.vocal.tone !== 'neutral') {
      styleDescriptors.push(analysis.vocal.tone);
    }
    if (styleDescriptors.length > 0) {
      vocalTags.push(styleDescriptors.join(', '));
    }
    
    // 발성 기법 (중요도 높은 것만)
    if (analysis.vocal.technique) {
      vocalTags.push(analysis.vocal.technique);
    }
    
    parts.push(vocalTags.join(', '));
  } else if (analysis.vocal && analysis.vocal.gender === 'instrumental') {
    parts.push('instrumental');
  }
  
  // 🎭 3. 무드 (감정적 특성)
  if (analysis.mood) {
    parts.push(`${analysis.mood} mood`);
  }
  
  // ⏱️ 4. BPM (정확한 템포)
  if (analysis.bpm) {
    parts.push(`${analysis.bpm} BPM`);
  }
  
  // 🎹 5. 악기 (Suno가 인식 가능한 형태, 최대 5개)
  if (analysis.instruments && analysis.instruments.length > 0) {
    // vocals 제외, 중요 악기 우선
    const cleanedInstruments = analysis.instruments
      .filter(inst => inst && inst !== 'vocals' && inst !== 'voice')
      .slice(0, 5);
    
    if (cleanedInstruments.length > 0) {
      parts.push(`featuring ${cleanedInstruments.join(', ')}`);
    }
  }
  
  // 🎚️ 6. 프로덕션 스타일 (구체적인 것만)
  if (analysis.production && !['standard', 'modern', 'contemporary'].includes(analysis.production)) {
    parts.push(analysis.production);
  }
  
  // 🎨 7. 사운드 디자인 (공간감, 음색 등)
  if (analysis.soundDesign && analysis.soundDesign !== 'standard') {
    parts.push(analysis.soundDesign);
  }
  
  // 🕰️ 8. 시대감 (특이한 경우만)
  if (analysis.era && !['modern', 'contemporary', '2020s'].includes(analysis.era)) {
    parts.push(`${analysis.era} vibe`);
  }
  
  // ⚡ 9. 에너지 표현 (7 이상이면 추가)
  if (analysis.energy && analysis.energy >= 8) {
    parts.push('high energy, intense');
  } else if (analysis.energy && analysis.energy <= 3) {
    parts.push('low energy, mellow');
  }
  
  // 🏷️ 10. 추가 태그 (AI가 제공한 경우)
  if (analysis.tags && Array.isArray(analysis.tags)) {
    // 중복 제거 후 추가 (이미 프롬프트에 있는 것은 제외)
    const promptLower = parts.join(' ').toLowerCase();
    const uniqueTags = analysis.tags
      .filter(tag => !promptLower.includes(tag.toLowerCase()))
      .slice(0, 3);  // 최대 3개
    
    if (uniqueTags.length > 0) {
      parts.push(...uniqueTags);
    }
  }
  
  return parts.filter(p => p).join(', ');  // 빈 항목 제거 후 조합
}

module.exports = router;
