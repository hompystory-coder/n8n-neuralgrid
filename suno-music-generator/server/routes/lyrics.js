const express = require('express');
const router = express.Router();
const OpenAIService = require('../services/openaiService');

// OpenAI 서비스 인스턴스 (lazy initialization)
let openaiService = null;

function getOpenAIService() {
  if (!openaiService) {
    openaiService = new OpenAIService();
  }
  return openaiService;
}

/**
 * 1단계: 가사 생성 API
 */

// 1. 프롬프트로 가사 생성 (OpenAI 연동)
router.post('/generate-from-prompt', async (req, res) => {
  try {
    const { 
      prompt, 
      quantity = 1, 
      duration = 120, 
      variationLevel = 50,
      systemPrompt = null,
      titleStrategy = 'emotional',
      titleCount = 3,
      referenceLyrics = [], // 🔥 추가: 레퍼런스 가사
      genreInfo = null // 🔥 추가: 장르 정보
    } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'Prompt is required' });
    }

    console.log(`📝 Generating ${quantity} lyrics from prompt:`, prompt);
    console.log(`   System Prompt: ${systemPrompt ? 'Custom' : 'Default'}`);
    console.log(`   Title Strategy: ${titleStrategy}, Count: ${titleCount}`);
    if (referenceLyrics.length > 0) {
      console.log(`   🎵 Reference Lyrics: ${referenceLyrics.length} songs`);
    }
    if (genreInfo) {
      console.log(`   🎸 Genre: ${genreInfo.genre.nameKo} (${genreInfo.genre.name})`);
    }

    // OpenAI로 가사 생성
    const ai = getOpenAIService();
    const lyrics = await ai.generateLyrics(
      prompt,
      systemPrompt,
      {
        quantity,
        duration,
        titleStrategy,
        titleCount,
        referenceLyrics, // 🔥 레퍼런스 가사 전달
        genreInfo // 🔥 장르 정보 전달
      }
    );

    res.json({
      success: true,
      count: lyrics.length,
      lyrics: lyrics,
      metadata: {
        systemPromptUsed: !!systemPrompt,
        titleStrategy: titleStrategy,
        titleCount: titleCount,
        referenceCount: referenceLyrics.length, // 🔥 추가
        genre: genreInfo ? `${genreInfo.genre.nameKo} (${genreInfo.genre.name})` : null, // 🔥 추가
        aiModel: 'gpt-4o-mini'
      }
    });

  } catch (error) {
    console.error('❌ Lyrics generation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 2. 샘플 가사 분석 및 유사 가사 생성 (OpenAI 연동)
router.post('/generate-from-sample', async (req, res) => {
  try {
    const { sampleLyrics, quantity = 1 } = req.body;

    if (!sampleLyrics) {
      return res.status(400).json({ error: 'Sample lyrics is required' });
    }

    console.log(`📄 Analyzing sample lyrics and generating ${quantity} variations`);

    // OpenAI로 샘플 분석 및 가사 생성
    const ai = getOpenAIService();
    const lyrics = await ai.generateFromSample(sampleLyrics, quantity);

    res.json({
      success: true,
      count: lyrics.length,
      lyrics: lyrics,
      metadata: {
        aiModel: 'gpt-4o-mini',
        sourceType: 'sample'
      }
    });

  } catch (error) {
    console.error('❌ Sample analysis error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 3. 음악 URL/파일에서 가사 추출
router.post('/extract-from-music', async (req, res) => {
  try {
    const { musicUrl, quantity = 1 } = req.body;

    if (!musicUrl) {
      return res.status(400).json({ error: 'Music URL is required' });
    }

    console.log(`🎵 Extracting lyrics from music:`, musicUrl);

    // TODO: 음악 분석 및 가사 추출 구현
    // - YouTube: yt-dlp로 오디오 다운로드 + Whisper로 음성 인식
    // - Suno: API로 메타데이터 가져오기
    // - 파일: 오디오 분석

    const extractedLyrics = await extractLyricsFromUrl(musicUrl);
    const lyrics = [];
    
    for (let i = 1; i <= quantity; i++) {
      lyrics.push({
        id: Date.now() + i,
        title: `Extracted Song ${i}`,
        lyrics: extractedLyrics,
        sourceUrl: musicUrl,
        createdAt: new Date().toISOString()
      });
    }

    res.json({
      success: true,
      sourceUrl: musicUrl,
      count: lyrics.length,
      lyrics: lyrics
    });

  } catch (error) {
    console.error('❌ Music extraction error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 4. 배치 가사 생성 (테마 자동 생성) (OpenAI 연동)
router.post('/generate-batch', async (req, res) => {
  try {
    const { mainTheme, count = 10, genres = [] } = req.body;

    if (!mainTheme) {
      return res.status(400).json({ error: 'Main theme is required' });
    }

    console.log(`🎯 Generating ${count} lyrics variations on theme: ${mainTheme}`);

    // OpenAI로 배치 가사 생성
    const ai = getOpenAIService();
    const lyrics = await ai.generateBatch(mainTheme, count, genres);

    res.json({
      success: true,
      mainTheme: mainTheme,
      count: lyrics.length,
      lyrics: lyrics,
      metadata: {
        aiModel: 'gpt-4o-mini',
        batchGeneration: true
      }
    });

  } catch (error) {
    console.error('❌ Batch generation error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 5. 가사 편집
router.put('/:lyricsId', async (req, res) => {
  try {
    const { lyricsId } = req.params;
    const { title, lyrics, theme } = req.body;

    // TODO: 데이터베이스에 저장된 가사 업데이트
    
    res.json({
      success: true,
      lyricsId: lyricsId,
      updated: {
        title,
        lyrics,
        theme,
        updatedAt: new Date().toISOString()
      }
    });

  } catch (error) {
    console.error('❌ Lyrics update error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// 6. 가사 삭제
router.delete('/:lyricsId', async (req, res) => {
  try {
    const { lyricsId } = req.params;

    // TODO: 데이터베이스에서 가사 삭제
    
    res.json({
      success: true,
      lyricsId: lyricsId,
      message: 'Lyrics deleted successfully'
    });

  } catch (error) {
    console.error('❌ Lyrics deletion error:', error);
    res.status(500).json({ 
      success: false,
      error: error.message 
    });
  }
});

// ===== 헬퍼 함수들 =====

// 데모 가사 생성
function generateDemoLyrics(prompt, variation) {
  const verses = [
    `Walking down the lonely street at night\nThinking about you under the moonlight\nMemories fade but feelings stay\nWishing you were here today`,
    
    `In the silence of the evening glow\nI hear your voice from long ago\nThough we're apart, you're still so near\nIn every song, I feel you here`,
    
    `Stars above remind me of your eyes\nBright and clear beneath the skies\nDistance can't erase what's true\nMy heart will always belong to you`,
  ];

  const choruses = [
    `Don't let go, hold on tight\nWe'll make it through the darkest night\nTogether we are stronger than before\nLove will always open every door`,
    
    `Forever in my heart you'll stay\nNo matter how far away\nThis feeling will never die\nYou and I, we're meant to fly`,
  ];

  const verse1 = verses[variation % verses.length];
  const chorus = choruses[variation % choruses.length];
  const verse2 = verses[(variation + 1) % verses.length];

  return `[Verse 1]\n${verse1}\n\n[Chorus]\n${chorus}\n\n[Verse 2]\n${verse2}\n\n[Chorus]\n${chorus}\n\n[Outro]\n${verses[(variation + 2) % verses.length].split('\n').slice(0, 2).join('\n')}`;
}

// 가사 스타일 분석
function analyzeLyricsStyle(lyrics) {
  // TODO: AI로 실제 스타일 분석
  const hasChorus = lyrics.includes('[Chorus]') || lyrics.includes('[후렴]');
  const hasBridge = lyrics.includes('[Bridge]') || lyrics.includes('[브릿지]');
  const lineCount = lyrics.split('\n').filter(l => l.trim()).length;
  
  return {
    structure: hasChorus ? 'Verse-Chorus' : 'Free Form',
    hasBridge: hasBridge,
    complexity: lineCount > 20 ? 'Complex' : 'Simple',
    estimatedGenre: 'Pop/Ballad',
    mood: 'Emotional'
  };
}

// 가사 변형 생성
function generateVariation(sampleLyrics, variation) {
  // TODO: AI로 실제 변형 생성
  return sampleLyrics + `\n\n[Variation ${variation} - Modified by AI]`;
}

// URL에서 가사 추출
async function extractLyricsFromUrl(url) {
  // TODO: 실제 구현
  // - YouTube: yt-dlp + Whisper
  // - Suno: API 호출
  // - 기타: 메타데이터 파싱
  
  if (url.includes('youtube.com') || url.includes('youtu.be')) {
    return `[Extracted from YouTube]\n\n[Verse 1]\nExtracted lyrics from video\nUsing speech recognition\n\n[Chorus]\nThis is placeholder\nFor demo purposes`;
  }
  
  if (url.includes('suno')) {
    return `[Extracted from Suno]\n\n[Verse 1]\nSuno music lyrics\nExtracted from metadata\n\n[Chorus]\nOriginal style preserved\nReady for variation`;
  }
  
  return `[Extracted from ${url}]\n\n[Verse 1]\nLyrics extracted\nFrom the source\n\n[Chorus]\nReady to use\nFor music generation`;
}

// 서브 테마 생성
function generateSubThemes(mainTheme, count) {
  // TODO: AI로 실제 서브 테마 생성
  const variations = [
    `${mainTheme} - Morning feelings`,
    `${mainTheme} - Late night thoughts`,
    `${mainTheme} - Rainy day version`,
    `${mainTheme} - Summer vibes`,
    `${mainTheme} - Winter memories`,
    `${mainTheme} - City lights`,
    `${mainTheme} - Acoustic version`,
    `${mainTheme} - Energetic mix`,
    `${mainTheme} - Melancholic mood`,
    `${mainTheme} - Hopeful ending`,
  ];
  
  return variations.slice(0, count);
}

// 제목 생성 함수
function generateTitles(lyricsText, prompt, strategy, count) {
  // TODO: AI로 실제 제목 생성 (가사 분석 후 제목 추천)
  
  const titles = [];
  
  // 전략별 제목 생성
  switch(strategy) {
    case 'keyword':
      // SEO 최적화 키워드 기반
      titles.push(
        `${extractKeyword(prompt)} Music`,
        `${extractKeyword(prompt)} Song Collection`,
        `Best ${extractKeyword(prompt)} Playlist`,
        `${extractKeyword(prompt)} Hits 2026`
      );
      break;
      
    case 'emotional':
      // 감성적 표현
      titles.push(
        `${extractEmotion(prompt)}의 순간`,
        `그대라는 ${extractKeyword(prompt)}`,
        `혼자인 ${extractKeyword(prompt)}`,
        `떠나보낸 ${extractEmotion(prompt)}`,
        `너를 기억해`
      );
      break;
      
    case 'metaphor':
      // 은유적 표현
      titles.push(
        `별이 된 ${extractKeyword(prompt)}`,
        `시간이 멈춘 곳`,
        `바람의 노래`,
        `달빛 아래서`,
        `기억 속의 멜로디`
      );
      break;
      
    case 'direct':
      // 직설적 표현
      titles.push(
        extractKeyword(prompt),
        `${extractKeyword(prompt)} Story`,
        `About ${extractKeyword(prompt)}`,
        `${extractEmotion(prompt)} Song`,
        `My ${extractKeyword(prompt)}`
      );
      break;
      
    case 'trending':
      // 트렌드 키워드 포함
      const trendingWords = ['VIBE', 'MOOD', 'FEEL', 'SCENE', 'MOMENT'];
      const keyword = extractKeyword(prompt);
      titles.push(
        `${keyword} ${trendingWords[0]}`,
        `${trendingWords[1]}: ${keyword}`,
        `${keyword} ${trendingWords[2]}S`,
        `${trendingWords[3]} - ${keyword}`,
        `${keyword} ${trendingWords[4]}`
      );
      break;
      
    default:
      titles.push(
        `${extractKeyword(prompt)}`,
        `${extractEmotion(prompt)}의 노래`,
        `Untitled Love Song`
      );
  }
  
  // 요청된 개수만큼 반환
  return titles.slice(0, count);
}

// 키워드 추출
function extractKeyword(text) {
  // TODO: AI로 실제 키워드 추출
  const keywords = ['사랑', '이별', '그리움', '외로움', '추억', '슬픔', '행복', '희망'];
  
  for (const keyword of keywords) {
    if (text.includes(keyword)) {
      return keyword;
    }
  }
  
  return 'Love';
}

// 감정 추출
function extractEmotion(text) {
  // TODO: AI로 실제 감정 분석
  const emotions = {
    '사랑': '사랑',
    '이별': '이별',
    '그리움': '그리움',
    '외로움': '외로움',
    '슬픔': '슬픔',
    '행복': '행복',
    '아픔': '아픔'
  };
  
  for (const [keyword, emotion] of Object.entries(emotions)) {
    if (text.includes(keyword)) {
      return emotion;
    }
  }
  
  return '감성';
}

/**
 * 🆕 통합 가사 생성 API
 * 
 * POST /api/lyrics/generate
 * 
 * 모든 메서드를 통합하여 처리:
 * - method: 'prompt' | 'youtube-style' | 'sample' | 'batch'
 */
router.post('/generate', async (req, res) => {
  try {
    const { 
      method = 'prompt',
      prompt,
      lyricsLang = 'korean',
      quantity = 5,
      youtubeAnalysis,
      referenceLyrics,
      titleStrategy = 'emotional',
      titleCount = 3
    } = req.body;

    console.log(`🎵 통합 가사 생성 시작: method=${method}, quantity=${quantity}, lang=${lyricsLang}`);

    const ai = getOpenAIService();
    let allLyrics = [];

    // YouTube 스타일 기반 생성
    if (method === 'youtube-style' && youtubeAnalysis) {
      console.log(`🎬 YouTube 스타일 기반 가사 생성 (병렬 처리):`, youtubeAnalysis);
      
      // 🚀 병렬 처리: Promise.all로 동시 생성
      const lyricPromises = [];
      
      for (let i = 0; i < quantity; i++) {
        const stylePrompt = lyricsLang === 'korean' ? 
          `${youtubeAnalysis.genre || 'pop'} 장르의 ${lyricsLang === 'ko' ? '한국어' : '영어'} 노래 가사 1곡을 작성해주세요.

🎵 **스타일 분석 결과:**
- 장르: ${youtubeAnalysis.genre || 'pop'}
- 분위기: ${youtubeAnalysis.mood || 'emotional'}
- 템포: ${youtubeAnalysis.bpm || 120} BPM
- 보컬: ${youtubeAnalysis.vocal?.gender || 'auto'} ${youtubeAnalysis.vocal?.style || 'standard'}
- 사용 악기: ${youtubeAnalysis.instruments?.join(', ') || 'vocals, drums, bass'}

📝 **작사 요구사항:**
- ${youtubeAnalysis.genre} 장르의 특징을 살려서 작성
- ${youtubeAnalysis.mood} 분위기를 담아야 함
- ${youtubeAnalysis.bpm} BPM에 맞는 리듬감
- ⚠️ **반드시 [LYRICS_KO] 섹션에 한글 가사를 먼저 작성하고, [LYRICS_EN] 섹션에 영어 가사를 작성하세요**
- Verse, Chorus, Bridge 구조 포함
- ${i + 1}번째 곡이므로 다른 관점의 이야기로 작성`
          :
          `Create 1 ${lyricsLang === 'english' ? 'English' : 'Korean'} song lyrics inspired by:
- Genre: ${youtubeAnalysis.genre || 'pop'}
- Mood: ${youtubeAnalysis.mood || 'emotional'}
- BPM: ${youtubeAnalysis.bpm || 120}
- Vocal Style: ${youtubeAnalysis.vocal?.gender || 'auto'} ${youtubeAnalysis.vocal?.style || 'standard'}
- Instruments: ${youtubeAnalysis.instruments?.join(', ') || 'vocals, drums, bass'}

Song ${i + 1} should:
- Reflect the ${youtubeAnalysis.genre} genre characteristics
- Match the ${youtubeAnalysis.mood} mood
- Be suitable for ${youtubeAnalysis.bpm} BPM tempo
- ⚠️ **YOU MUST write Korean lyrics in [LYRICS_KO] section first, then English lyrics in [LYRICS_EN] section**
- Include verse, chorus, and bridge sections
- Be complete and performance-ready
- Have a unique perspective or story (different from other songs)`;

        // Promise 배열에 추가 (병렬 실행)
        lyricPromises.push(
          ai.generateLyrics(
            stylePrompt,  // userPrompt
            null,  // systemPrompt
            {
              quantity: 1,  // 한 번에 1개만 생성
              titleStrategy,
              titleCount
            }
          ).then(lyrics => {
            console.log(`✅ 가사 ${i + 1}/${quantity} 생성 완료`);
            return lyrics;
          })
        );
      }
      
      // 🚀 모든 가사를 동시에 생성 (병렬 처리)
      const results = await Promise.all(lyricPromises);
      allLyrics = results.flat(); // 2차원 배열을 1차원으로 평탄화
    }
    // 프롬프트 기반 생성 (기본)
    else if (method === 'prompt' || !method) {
      const finalPrompt = prompt || `Create ${quantity} ${lyricsLang === 'korean' ? 'Korean' : 'English'} song lyrics about love and emotions`;
      
      console.log(`📝 프롬프트 기반 가사 생성:`, finalPrompt);
      
      allLyrics = await ai.generateLyrics(
        finalPrompt,  // userPrompt
        null,  // systemPrompt
        {
          quantity,
          titleStrategy,
          titleCount,
          referenceLyrics: referenceLyrics || []
        }
      );
    }
    // 샘플 기반 생성
    else if (method === 'sample' && referenceLyrics) {
      console.log(`🎼 샘플 기반 가사 생성:`, referenceLyrics.length);
      
      const samplePrompt = `Create ${quantity} ${lyricsLang === 'korean' ? 'Korean' : 'English'} song lyrics similar to the reference samples provided`;
      
      allLyrics = await ai.generateLyrics(
        samplePrompt,  // userPrompt
        null,  // systemPrompt
        {
          quantity,
          titleStrategy,
          titleCount,
          referenceLyrics
        }
      );
    }
    else {
      return res.status(400).json({
        success: false,
        error: 'Invalid method or missing required parameters'
      });
    }

    console.log(`✅ 총 ${allLyrics.length}개 가사 생성 완료`);

    res.json({
      success: true,
      data: {
        lyrics: allLyrics,
        method: method,
        language: lyricsLang,
        count: allLyrics.length
      }
    });

  } catch (error) {
    console.error('❌ 통합 가사 생성 실패:', error);
    res.status(500).json({
      success: false,
      error: error.message || '가사 생성 중 오류가 발생했습니다'
    });
  }
});

module.exports = router;
