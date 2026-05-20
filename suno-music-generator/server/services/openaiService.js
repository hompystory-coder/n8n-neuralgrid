const OpenAI = require('openai');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const TitleDatabase = require('./titleDatabase');

class OpenAIService {
  constructor() {
    // .env 파일에서 직접 읽기 (dotenv 우회)
    let apiKey = process.env.OPENAI_API_KEY;
    
    // 환경변수가 없으면 .env 파일에서 직접 파싱
    if (!apiKey || apiKey.trim() === '') {
      console.log('⚠️ OPENAI_API_KEY not in env, reading from .env file...');
      try {
        const envPath = path.join(__dirname, '../../.env');
        const envContent = fs.readFileSync(envPath, 'utf8');
        
        // OPENAI_API_KEY= 라인 찾기
        const lines = envContent.split('\n');
        for (const line of lines) {
          if (line.startsWith('OPENAI_API_KEY=')) {
            apiKey = line.substring('OPENAI_API_KEY='.length).trim();
            console.log(`✅ Found API key in .env file (length: ${apiKey.length})`);
            break;
          }
        }
      } catch (error) {
        console.error('❌ Failed to read .env file:', error.message);
      }
    }
    
    if (!apiKey || apiKey.trim() === '') {
      console.error('❌ OPENAI_API_KEY not found!');
      throw new Error('OPENAI_API_KEY is required');
    }
    
    console.log(`✅ OpenAI API Key loaded: ${apiKey.substring(0, 20)}... (length: ${apiKey.length})`);
    
    // API 키를 인스턴스 변수로 저장
    this.apiKey = apiKey.trim();
    
    // 기존 SDK 클라이언트도 유지 (fallback용)
    this.client = new OpenAI({
      apiKey: this.apiKey
    });
    
    console.log('✅ OpenAI Service initialized');
    
    // 제목 데이터베이스 초기화 (개선된 버전)
    this.titleDB = new TitleDatabase();
  }

  // ===== 레거시 함수들 (새 TitleDatabase로 대체됨) =====
  // loadUsedTitles() 및 saveUsedTitles()는 더 이상 사용되지 않음
  
  /**
   * 제목 다양성을 위한 시드 생성
   */
  generateDiversitySeed() {
    const timestamp = Date.now();
    const random = Math.random();
    const hash = crypto.createHash('md5').update(`${timestamp}-${random}`).digest('hex').substring(0, 8);
    return hash;
  }

  /**
   * 가사 생성 (프롬프트 기반)
   */
  async generateLyrics(userPrompt, systemPrompt = null, options = {}) {
    try {
      const {
        quantity = 1,
        duration = 120,
        titleStrategy = 'emotional',
        titleCount = 3,
        referenceLyrics = [], // 🔥 추가: 레퍼런스 가사 배열
        genreInfo = null // 🔥 추가: 장르 정보 (styleService에서 전달)
      } = options;

      console.log(`🤖 OpenAI: Generating ${quantity} lyrics with deep titles...`);
      if (referenceLyrics.length > 0) {
        console.log(`🎵 Using ${referenceLyrics.length} reference songs for style`);
      }

      // 기본 시스템 프롬프트 (대폭 강화)
      let defaultSystemPrompt = `당신은 한국 대중음악계의 최정상 작사가입니다. 
수백만 명이 공감하고 따라 부르는 명곡 가사를 써야 합니다.

**핵심 작사 철학:**
1. **스토리텔링**: 단순 감정 나열이 아닌, 영화처럼 전개되는 이야기
   - Verse 1: 상황 설정, 인물 소개, 분위기 조성
   - Chorus: 핵심 메시지, 감정의 절정, 후렴구 (쉽고 강렬하게)
   - Verse 2: 갈등 심화, 새로운 관점, 이야기 전환
   - Bridge: 반전, 깨달음, 감정의 고조
   - Outro: 여운, 메시지 정리
   
2. **디테일한 묘사**: 추상적 단어만 쓰지 말고 구체적 이미지 사용
   - 나쁜 예: "슬픈 마음", "아픈 추억"
   - 좋은 예: "새벽 두 시 네 연락이 오지 않아", "빈 카페에 혼자 남은 잔"

3. **감각적 표현**: 오감을 자극하는 가사
   - 시각: 색깔, 풍경, 빛과 그림자
   - 청각: 소리, 음악, 침묵
   - 촉각: 온도, 질감, 느낌
   - 후각/미각: 향기, 맛
   
4. **은유와 상징**: 직접 말하지 말고 비유로 표현
   - "사랑해" → "네가 있어 숨을 쉴 수 있어"
   - "이별" → "우리 사이 계절이 바뀌었어"

5. **운율과 리듬**: 자연스럽게 노래로 부를 수 있게
   - 각 줄의 음절 수 비슷하게 (7-9음절 권장)
   - 각운 적절히 활용 (끝 음절 맞추기)
   - 강세와 쉼표 자연스럽게

**가사 구조:**
[Verse 1] - 4줄 (상황 전개)
[Chorus] - 4줄 (강렬한 후렴구, 쉽게 따라 부를 수 있게)
[Verse 2] - 4줄 (이야기 심화)
[Chorus] - 4줄 (같은 후렴 반복, 단 마지막 줄은 변형 가능)
[Bridge] - 4줄 (감정 전환점, 새로운 시각)
[Chorus] - 4줄 (최종 감정 폭발)
[Outro] - 2-3줄 (여운 남기기)

**🌍 영어 가사 작성 지침 (절대 필수!):**

⚠️ **가장 중요: 영어 가사는 완전한 문장으로!**

🚫 **절대 금지 - 이렇게 쓰면 안 됩니다:**

❌ 틀린 예시 (절대 이렇게 쓰지 마세요!):
[LYRICS_EN]
[Verse 1]
" spring ?"
" you "
Love heart
You

[Chorus]
Love heart
You
Spring end

**위 예시의 문제점:**
- 단어만 나열 (spring ?, you)
- 주어/동사 없음
- 따옴표만 있고 내용 없음
- 완전한 문장이 아님
- **이런 식으로 절대 쓰지 마세요!**

---

✅ **올바른 예시 - 반드시 이렇게 써야 합니다:**

✅ 정답 예시 (이렇게 써야 합니다!):
[LYRICS_EN]
[Verse 1]
When spring arrives, I think of you
The memories we made, they feel so true
Walking through the park where flowers bloom
Every step reminds me of our afternoon

[Chorus]
My heart still loves you, can't let go
Even though our spring has come to end
These feelings deep inside continue to grow
I'm waiting for the day we'll meet again

**위 예시가 올바른 이유:**
- ✅ 완전한 영어 문장
- ✅ 주어+동사+목적어 모두 있음
- ✅ 자연스러운 어순
- ✅ 축약형 사용 (can't, I'm)
- ✅ 전치사 정확 (of you, through the park)
- ✅ 노래로 부를 수 있음

---

1. **단어 나열 절대 금지**:
   - ❌ 최악의 예: "heart time memories love you night"
   - ❌ 나쁜 예: "love you I always forever"
   - ❌ 최악: "Love heart / You / Spring end"
   - ✅ 올바른 예: "I will love you forever, through every night"
   - ✅ 올바른 예: "My heart holds memories of you"
   - ✅ 올바른 예: "My heart still loves you, even as spring ends"

2. **영어 문법 필수 준수**:
   - 주어 + 동사 + 목적어 순서
   - 시제 일관성 (과거면 과거, 현재면 현재)
   - 단수/복수 구분
   - 관사 사용 (a, an, the)
   
   예시:
   ❌ "You not exist night is long"
   ✅ "Nights without you feel so long"
   
   ❌ "Heart broken memory fade"
   ✅ "My broken heart watches memories fade"
   
   ❌ "Spring end you I"
   ✅ "Even as spring ends, I still think of you"

3. **영어 노래 표현 패턴**:
   
   **A. 축약형 필수 사용:**
   - I am → I'm
   - You are → You're  
   - Do not → Don't
   - Can not → Can't
   - I will → I'll
   - It is → It's
   
   **B. 자연스러운 전치사 조합:**
   - in love (사랑에 빠진)
   - through the pain (고통을 통과하며)
   - on my mind (내 마음속에)
   - under the stars (별 아래)
   - without you (너 없이)
   - beside me (내 곁에)
   
   **C. 영어 노래 관용 표현:**
   - "Falling in love" (not "Love falling")
   - "Break my heart" (not "Heart break do")
   - "Hold me tight" (not "Me hold tight")
   - "Let it go" (not "It go let")

4. **한글→영어 번역 예시 (반드시 참고!):**

   한글: "네가 없는 밤은 너무 길어"
   ❌ 틀린 영어: "You not exist night is too long"
   ❌ 어색한 영어: "The night you absence is very long"
   ✅ 자연스러운 영어: "Nights without you feel endless"
   ✅ 자연스러운 영어: "Every night's too long when you're not here"
   
   한글: "봄날의 햇살이 나를 감싸면"
   ❌ 틀린 영어: "Spring day sunshine me wrap when"
   ❌ 어색한 영어: "When spring day sunshine wraps me"
   ✅ 자연스러운 영어: "When spring sunshine wraps around me"
   ✅ 자연스러운 영어: "As the warm spring sun embraces me"
   
   한글: "다시 만날 그날을 기다려"
   ❌ 틀린 영어: "Again meet that day wait I"
   ❌ 어색한 영어: "The day meet again I'm waiting"
   ✅ 자연스러운 영어: "I'm waiting for the day we meet again"
   ✅ 자연스러운 영어: "Waiting for that day when we'll reunite"
   
   한글: "너의 목소리가 그리워"
   ❌ 틀린 영어: "Your voice miss I"
   ❌ 어색한 영어: "Your voice I'm missing it"
   ✅ 자연스러운 영어: "I miss the sound of your voice"
   ✅ 자연스러운 영어: "Your voice is what I long to hear"

5. **영어 가사 체크리스트:**
   
   각 줄마다 확인할 것:
   □ 주어가 있는가?
   □ 동사가 있는가?
   □ 어순이 자연스러운가?
   □ 축약형을 썼는가? (I'm, don't 등)
   □ 전치사가 올바른가?
   □ 영어 네이티브가 이렇게 말하는가?
   □ 노래로 불렀을 때 자연스러운가?

**⚠️ 최종 경고:**
- 영어 가사가 단어 나열이면 **즉시 거부됩니다**
- 반드시 **완전한 영어 문장**으로 작성하세요
- "heart time love"가 아니라 "**My heart loves you all the time**"
- 한글 가사를 직역하지 말고, **영어로 자연스럽게 재창작**하세요`;

      // 🔥 레퍼런스 가사가 있으면 시스템 프롬프트에 추가
      if (referenceLyrics.length > 0) {
        defaultSystemPrompt += `\n\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n**📊 인기 차트 분석 - 현재 트렌드**\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        defaultSystemPrompt += `\n다음은 현재 인기 차트 상위권 곡들입니다. 이들의 공통점과 성공 요소를 깊이 분석하세요:\n\n`;
        
        referenceLyrics.forEach((ref, index) => {
          if (ref.lyrics && ref.lyrics.trim()) {
            // 가사 일부만 사용 (토큰 절약)
            const lyricsPreview = ref.lyrics.substring(0, 600);
            defaultSystemPrompt += `\n📌 [인기곡 ${index + 1}] "${ref.title}" - ${ref.artist}\n`;
            defaultSystemPrompt += `장르: ${ref.genre || '발라드/팝'}\n`;
            defaultSystemPrompt += `\n참고 가사:\n${lyricsPreview}${ref.lyrics.length > 600 ? '...\n' : '\n'}`;
            defaultSystemPrompt += `\n💡 이 곡에서 배울 점:\n`;
            defaultSystemPrompt += `  1. **표현 기법**: 어떤 은유와 비유를 사용했는가?\n`;
            defaultSystemPrompt += `  2. **감정 전달**: 어떻게 청자의 공감을 이끌어냈는가?\n`;
            defaultSystemPrompt += `  3. **구조적 특징**: Verse/Chorus 전개 방식\n`;
            defaultSystemPrompt += `  4. **핵심 메시지**: 한 문장으로 요약한다면?\n\n`;
          } else {
            // 가사가 없어도 곡 정보는 활용
            defaultSystemPrompt += `\n📌 [인기곡 ${index + 1}] "${ref.title}" - ${ref.artist}\n`;
            defaultSystemPrompt += `장르: ${ref.genre || '발라드/팝'}\n`;
            defaultSystemPrompt += `→ 현재 차트 상위권 곡으로, 대중의 트렌드를 반영하고 있습니다.\n\n`;
          }
        });
        
        defaultSystemPrompt += `\n━━━━━━━━━━━━━━━━━━━━━━━━━━\n`;
        defaultSystemPrompt += `**✅ 작사 지침:**\n`;
        defaultSystemPrompt += `1. 위 인기곡들의 **감성 톤, 표현 방식, 구조적 특징**을 참고하세요\n`;
        defaultSystemPrompt += `2. 하지만 **절대 복사/표절하지 말고**, 완전히 새로운 이야기와 표현을 만드세요\n`;
        defaultSystemPrompt += `3. 대중이 좋아하는 스타일을 유지하면서도 **독창성**을 더하세요\n`;
        defaultSystemPrompt += `4. 특히 **후렴구(Chorus)**는 쉽고 강렬하게, 한 번 들으면 기억에 남도록\n\n`;
      }

      defaultSystemPrompt += `
**제목 생성 규칙 (매우 중요!):**
━━━━━━━━━━━━━━━━━━━━

제목은 곡의 첫인상이자 마지막 기억입니다. 다음 기준을 **반드시** 따르세요:

1. **가사 분석 우선**:
   - 가사 전체를 읽고 핵심 메시지 1-2문장으로 요약
   - Chorus에서 가장 강렬한 구절 찾기
   - 반복되는 키워드/이미지 파악

2. **제목 유형 선택** (상황에 맞게):
   a) **핵심 가사 직접 인용형**: "네가 없는 밤", "다시 만날 그날"
   b) **은유/상징형**: "봄날의 약속", "별이 진 곳"
   c) **질문/대화형**: "사랑이 뭐길래", "괜찮니 물어봐"
   d) **단어 조합형**: "그리움과 기다림", "추억 속의 너"
   e) **시간/장소 특정형**: "2시의 카페", "금요일 밤"
   f) **감각 묘사형**: "차가운 손끝", "따뜻한 목소리"
   g) **행동/상태형**: "혼자 걷는 길", "멈춘 시계"

3. **금지 사항**:
   ❌ "#1", "Pattern", "Song" 등 메타 단어
   ❌ "황혼에 피어난", "별빛 아래" 같은 상투적 표현 반복
   ❌ 가사와 무관한 제목
   ❌ 지나치게 추상적이거나 난해한 표현
   ❌ 이미 많이 쓰인 흔한 제목

4. **좋은 제목의 조건**:
   ✅ 3-7단어 (한글 기준 10-30자)
   ✅ 가사의 핵심 메시지 반영
   ✅ 감정적 울림이 있음
   ✅ 기억하기 쉬움
   ✅ 검색 가능성 (너무 일반적이지도, 특이하지도 않게)
   ✅ **완전히 독창적이고 유일무이한 제목**

5. **한영 병기**:
   - 한글 제목: 자연스러운 한국어 표현
   - 영어 제목: 단순 번역이 아닌, 영어권에서도 멋진 제목
   - 형식: "한글제목 / English Title"

**예시:**
- 가사가 이별 후 일상을 그린다면:
  "네가 없는 하루 / Days Without You" (O)
  "황혼에 피어난 그리움 / Twilight Longing" (X - 상투적)
  
- 가사가 새로운 사랑을 노래한다면:
  "처음 그날처럼 / Like The First Day" (O)
  "별빛 아래 약속 / Promise Under Starlight" (X - 진부함)

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ 출력 형식 (정확히 따를 것!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

[LYRICS_KO]
[Verse 1]
첫 번째 줄 (구체적이고 감각적으로)
두 번째 줄 (이야기가 있어야 함)
세 번째 줄
네 번째 줄

[Chorus]
강렬한 후렴구 첫 줄 (쉽고 기억에 남게)
후렴구 둘째 줄
후렴구 셋째 줄
후렴구 마지막 줄

[Verse 2]
...

[Bridge]
...

[Outro]
...

[LYRICS_EN]
[Verse 1]
First line with natural English grammar (complete sentences!)
Second line with proper verb tenses
Third line with contractions (I'm, you're, don't)
Fourth line with good rhyme if possible

[Chorus]
Catchy chorus with native expressions
Using proper prepositions (in, on, through)
Natural word order (Subject + Verb + Object)
Easy to sing and remember

[Verse 2]
...

[Bridge]
...

[Outro]
...

[SUGGESTED_TITLES]
1. 한글제목 / English Title
2. 한글제목2 / English Title2
3. 한글제목3 / English Title3

⚠️ 영어 가사 필수 체크리스트:
✅ 완전한 문장 (주어+동사+목적어)
✅ 자연스러운 어순 (Never "heart time love you")
✅ 축약형 사용 (I'm, you're, don't, can't)
✅ 전치사 정확히 (in love, through pain, on my mind)
✅ 동사 시제 일관성
✅ 영어 노래 같은 운율
✅ 네이티브가 쓸 법한 표현`;

      const finalSystemPrompt = systemPrompt || defaultSystemPrompt;

      // 가사 생성
      const results = [];
      
      // 최근 사용된 제목 샘플 (중복 방지용)
      const recentTitles = this.titleDB.getRecentTitles(50); // 최근 50개
      
      for (let i = 0; i < quantity; i++) {
        // 매번 다른 창의성 레벨 적용 (다양성 극대화)
        const creativityLevel = 0.7 + (Math.random() * 0.3); // 0.7 ~ 1.0
        const uniqueSeed = Date.now() + i * 1000 + Math.random() * 10000;
        const diversitySeed = this.generateDiversitySeed(); // 고유 해시
        
        // 🔥 장르 정보 섹션 추가
        const genreSection = genreInfo ? `
🎸 **장르 가이드:**
- 장르: ${genreInfo.genre.nameKo} (${genreInfo.genre.name})
- 스타일: ${genreInfo.genre.description}
- BPM: ${genreInfo.bpm || genreInfo.genre.bpm.default} (${genreInfo.genre.bpm.min}-${genreInfo.genre.bpm.max})
- 무드: ${genreInfo.mood ? genreInfo.mood.join(', ') : genreInfo.genre.mood.join(', ')}
- 주요 악기: ${genreInfo.instruments ? genreInfo.instruments.join(', ') : genreInfo.genre.instruments.join(', ')}
- 예시 아티스트: ${genreInfo.genre.examples.join(', ')}

⚠️ **작사 시 반영할 장르 특성:**
${generateGenreWritingGuidelines(genreInfo)}
` : '';

        const userMessage = `━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
🎵 작사 의뢰서 #${i + 1}/${quantity}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

📝 **주제/상황:**
${userPrompt}
${genreSection}
🎯 **요구사항:**
- 곡 길이: 약 ${duration}초 (${Math.floor(duration/30)} 파트 구성)
- 제목 개수: ${titleCount}개 제안
- 창의성 레벨: ${(creativityLevel * 100).toFixed(0)}% (${creativityLevel > 0.85 ? '매우 실험적' : creativityLevel > 0.75 ? '적절히 독창적' : '안정적'})
- 고유 시드: ${uniqueSeed}
- 다양성 해시: ${diversitySeed}

${recentTitles.length > 0 ? `🚫 **절대 사용 금지 제목 (최근 사용됨):**
${recentTitles.slice(-20).map((t, idx) => `${idx + 1}. ${t}`).join('\n')}

⚠️ 위 제목들과 유사하거나 겹치는 제목은 절대 생성하지 마세요!
⚠️ 완전히 새롭고 독창적인 제목만 만들어주세요!\n\n` : ''}🔥 **핵심 지시사항:**

1. **스토리텔링**: 주제를 단순 반복하지 말고, 영화처럼 전개
   - Verse 1: 상황 설정 (구체적 장면 묘사)
   - Chorus: 핵심 메시지 (강렬하고 기억하기 쉽게)
   - Verse 2: 갈등/전환 (새로운 관점)
   - Bridge: 감정 폭발/깨달음
   - Outro: 여운

2. **디테일한 묘사**: 추상적 단어 피하고 구체적 이미지 사용
   ❌ "슬픈 마음", "아픈 추억"
   ✅ "새벽 두 시 네 연락이 오지 않아", "빈 카페에 혼자 남은 잔"

3. **감각적 표현**: 오감을 자극하는 가사
   - 시각: 색깔, 풍경, 빛
   - 청각: 소리, 음악, 침묵
   - �각: 온도, 질감
   - 후각/미각: 향기, 맛

4. **자연스러운 운율**: 노래로 부를 수 있게
   - 각 줄 7-9음절 권장
   - 적절한 각운 배치

5. **제목은 가사 완성 후**:
   - 전체 가사 읽고 핵심 메시지 추출
   - Chorus의 가장 강렬한 구절 활용
   - 독창적이고 기억에 남을 제목 ${titleCount}개
   - 형식: "한글제목 / English Title"

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
⚠️ 주의사항 (매우 중요!)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

1. **번호(#1, #2)나 패턴 단어 사용 금지!**

2. **🚨 영어 가사 - 필수 체크 (가장 중요!) 🚨**
   
   ❌ **절대 금지 - 단어만 나열:**
   "heart time love memories you night"
   "pain tears goodbye forever alone"
   
   ✅ **필수 - 완전한 영어 문장:**
   "My heart holds memories of you every night"
   "Through the pain and tears, I'll say goodbye forever"
   
   **영어 가사 작성 필수 규칙:**
   
   ✅ 1) 주어 + 동사 + 목적어 (완전한 문장)
      예: "I miss you" (나는 너를 그리워해)
      금지: "Miss you I" (단어 나열)
   
   ✅ 2) 축약형 반드시 사용
      I am → I'm
      You are → You're
      Do not → Don't
      예: "I'm falling in love" (O)
      금지: "I am fall love" (X)
   
   ✅ 3) 전치사 정확히 사용
      in love (사랑에)
      through pain (고통을 통해)
      without you (너 없이)
      예: "I'm lost without you" (O)
      금지: "I lost you not exist" (X)
   
   ✅ 4) 동사 시제 일관성
      과거: loved, missed, cried
      현재: love, miss, cry
      미래: will love, will miss
      예: "I loved you then, I love you now" (O)
      금지: "Love you then, loved now" (X)
   
   ✅ 5) 영어 노래 관용 표현
      "Break my heart" (내 심장을 부수다)
      "Hold me tight" (나를 꽉 안아줘)
      "Let it go" (놔버려)
      "Falling apart" (무너지고 있어)
   
   **🔴 최종 확인 질문 (각 영어 가사 줄마다):**
   □ 이 문장에 주어가 있는가?
   □ 이 문장에 동사가 있는가?
   □ 영어 네이티브가 이렇게 말하는가?
   □ 노래로 불렀을 때 자연스러운가?
   
   **만약 하나라도 "아니오"면 다시 쓰세요!**

3. **영어는 네이티브 표현으로!**
   ❌ "You not exist night is long" (직역)
   ✅ "Nights without you feel endless" (자연스러운 영어)

4. **축약형 사용**: I'm, you're, don't, can't

5. **Rhyme(각운) 고려**: love/above, time/shine

지금 바로 명곡을 만들어주세요! 🎵✨`;

        let response;
        let validationAttempts = 0;
        const maxValidationAttempts = 3; // 최대 3번 재시도
        
        try {
          // 영어 가사 검증이 통과할 때까지 반복
          while (validationAttempts < maxValidationAttempts) {
            validationAttempts++;
            
            console.log(`🎵 Generating song ${i + 1}/${quantity} (validation attempt ${validationAttempts}/${maxValidationAttempts})`);
            
            // ✅ axios로 직접 OpenAI API 호출 (SDK 우회)
            console.log(`🔑 Using direct axios call with API key length: ${this.apiKey.length}`);
            
            const apiResponse = await axios.post('https://api.openai.com/v1/chat/completions', {
              model: 'gpt-4o-mini',
              messages: [
                { 
                  role: 'system', 
                  content: finalSystemPrompt + (validationAttempts > 1 ? '\n\n🚨 CRITICAL: Previous attempt had invalid English lyrics. Every English lyric line MUST be a complete sentence with subject, verb, and object. NO single words or fragments like "Love heart" or "You"!' : '')
                },
                { 
                  role: 'user', 
                  content: userMessage + (validationAttempts > 1 ? `\n\n🚨🚨🚨 경고! (재시도 ${validationAttempts}/${maxValidationAttempts}) 🚨🚨🚨
이전 시도에서 영어 가사가 단어만 나열되는 문제가 발생했습니다.
절대로 "Love heart", "You", "Spring end" 같은 단어 나열을 하지 마세요!

반드시 완전한 영어 문장으로 작성하세요:
✅ "My heart still loves you"
✅ "Even as spring comes to an end"
✅ "I can't forget the memories we made"

각 줄이 최소 5-8 단어로 구성된 완전한 문장이어야 합니다!` : '')
                }
              ],
              temperature: validationAttempts === 1 ? creativityLevel : 0.7,
              max_tokens: 2500, // 4000 → 2500으로 줄여서 속도 향상
              presence_penalty: validationAttempts === 1 ? 0.7 : 0.8,
              frequency_penalty: validationAttempts === 1 ? 0.9 : 0.8,
              top_p: validationAttempts === 1 ? 0.95 : 0.9
            }, {
              headers: {
                'Authorization': `Bearer ${this.apiKey}`,
                'Content-Type': 'application/json'
              },
              timeout: 25000 // 30초 → 25초로 줄여서 더 빠른 응답
            });

            response = apiResponse.data.choices[0].message.content;
            console.log(`✅ OpenAI API success for song ${i + 1} (attempt ${validationAttempts})`);
            
            // 🚨 영어 가사 품질 검증
            if (this.hasInvalidEnglishLyrics(response)) {
              console.warn(`⚠️ Song ${i + 1}: Invalid English lyrics detected (attempt ${validationAttempts})`);
              
              if (validationAttempts < maxValidationAttempts) {
                console.log(`🔄 Retrying with stricter prompt... (${validationAttempts + 1}/${maxValidationAttempts})`);
                continue; // 다음 시도
              } else {
                console.error(`❌ Song ${i + 1}: Failed validation after ${maxValidationAttempts} attempts`);
                // 최대 시도 횟수 초과, 일단 그대로 진행 (사용자에게 알림)
              }
            } else {
              console.log(`✅ Song ${i + 1}: English lyrics validation passed!`);
              break; // 검증 통과, 루프 탈출
            }
          }
          
        } catch (apiError) {
          console.error(`❌ OpenAI API Error Details:`);
          console.error(`   Message: ${apiError.message}`);
          console.error(`   Status: ${apiError.status}`);
          console.error(`   Code: ${apiError.code}`);
          console.error(`   Type: ${apiError.type}`);
          if (apiError.response) {
            console.error(`   Response Status: ${apiError.response.status}`);
            console.error(`   Response Data:`, apiError.response.data);
          }
          console.warn(`⚠️ OpenAI API failed, using advanced mock...`);
          
          // API 실패 시 고급 Mock 데이터 생성
          response = this.generateAdvancedMockLyrics(userPrompt, i + 1, quantity, titleCount, uniqueSeed);
        }
        
        // 가사와 제목 파싱
        const parsed = this.parseLyricsResponse(response, titleCount);
        
        // 제목 중복 체크: OpenAI 생성 제목 우선 사용, 중복 시 변형만 추가
        let finalTitles = parsed.titles;
        
        // OpenAI 제목이 중복인지 체크
        if (this.hasDuplicateTitle(finalTitles)) {
          console.warn(`⚠️ OpenAI title duplicates detected, applying minor variations...`);
          
          finalTitles = finalTitles.map((title, idx) => {
            const cleanTitle = title.split('/')[0].trim();
            const englishTitle = title.split('/')[1]?.trim() || 'Untitled';
            
            if (this.titleDB.isDuplicate(title)) {
              // 타임스탬프 기반 변형만 추가 (의미는 유지)
              const variant = this.createTitleVariant(cleanTitle);
              return `${variant} / ${englishTitle}`;
            }
            return title;
          });
        }
        
        // 제목 등록 (영구 저장 with 메타데이터)
        this.titleDB.addTitles(finalTitles, {
          theme: userPrompt,
          strategy: titleStrategy
        });
        
        results.push({
          id: Date.now() + i * 10,
          title: finalTitles[0] || `Generated Song ${i + 1}`,
          lyrics: parsed.lyrics,          // 하위 호환성 유지
          lyricsKo: parsed.lyricsKo,      // 한글 가사
          lyricsEn: parsed.lyricsEn,      // 영어 가사
          suggestedTitles: finalTitles,
          theme: userPrompt,
          duration: duration,
          titleStrategy: titleStrategy,
          rawResponse: response,
          createdAt: new Date().toISOString()
        });

        // API 레이트 리밋 방지 (여러 개 생성 시)
        if (i < quantity - 1) {
          await new Promise(resolve => setTimeout(resolve, 800));
        }
      }

      console.log(`✅ OpenAI: Generated ${results.length} unique lyrics with deep titles`);
      return results;

    } catch (error) {
      console.error('❌ OpenAI lyrics generation error:', error.message);
      throw error;
    }
  }

  /**
   * 영어 가사 품질 검증
   * 단어만 나열되거나 불완전한 문장이 있는지 체크
   */
  hasInvalidEnglishLyrics(response) {
    try {
      // [LYRICS_EN] 섹션 추출
      const enMatch = response.match(/\[LYRICS_EN\]([\s\S]*?)(?=\[SUGGESTED_TITLES\]|$)/);
      if (!enMatch) return false;
      
      const englishLyrics = enMatch[1];
      
      // 문제 패턴 감지
      const invalidPatterns = [
        /^[A-Z][a-z]*\s*$/m,                    // 단어 하나만 (예: "You", "Love")
        /^[A-Z][a-z]*\s+[a-z]+\s*$/m,          // 단어 두 개만 (예: "Love heart")
        /^"\s*[a-z]+\s*\?\s*"$/m,              // 따옴표만 (예: " spring ?")
        /^"\s*"\s*$/m,                          // 빈 따옴표 (예: " ")
        /^[A-Z][a-z]*\s+end\s*$/m,             // "Spring end" 같은 패턴
        /^\.\.\.\s*$/m,                         // "..." 만 있는 줄
        /^[A-Za-z]{1,15}\s*$/m                 // 15자 이하 단어만 (너무 짧음)
      ];
      
      for (const pattern of invalidPatterns) {
        if (pattern.test(englishLyrics)) {
          console.log(`🚨 Invalid pattern detected: ${pattern}`);
          return true;
        }
      }
      
      // 각 줄 검사 (섹션 헤더 제외)
      const lines = englishLyrics
        .split('\n')
        .map(l => l.trim())
        .filter(l => l && !l.startsWith('[') && !l.endsWith(']'));
      
      for (const line of lines) {
        // 3단어 미만은 불완전한 문장으로 간주
        const wordCount = line.split(/\s+/).filter(w => w.length > 0).length;
        if (wordCount < 3) {
          console.log(`🚨 Too few words in line: "${line}" (${wordCount} words)`);
          return true;
        }
        
        // 동사가 없는 경우 (간단한 체크)
        const hasVerb = /\b(am|is|are|was|were|be|been|being|have|has|had|do|does|did|will|would|can|could|shall|should|may|might|must|'m|'s|'re|'ve|'ll|'d)\b/i.test(line);
        if (!hasVerb && wordCount < 5) {
          console.log(`🚨 No verb detected in line: "${line}"`);
          return true;
        }
      }
      
      return false;
      
    } catch (error) {
      console.error('검증 오류:', error);
      return false; // 검증 오류 시 일단 통과
    }
  }
  
  /**
   * 제목 중복 체크
   */
  hasDuplicateTitle(titles) {
    for (const title of titles) {
      if (this.titleDB.isDuplicate(title)) {
        const cleanTitle = title.split('/')[0].trim().toLowerCase();
        console.log(`🔴 Duplicate detected: "${cleanTitle}"`);
        return true;
      }
    }
    return false;
  }
  
  /**
   * 제목 변형 생성 (중복 방지용 최후의 수단)
   */
  createTitleVariant(baseTitle) {
    // 의미를 유지하면서 변형
    const variants = [
      `${baseTitle} (Reprise)`,
      `${baseTitle}의 이야기`,
      `${baseTitle}, 그리고`,
      `다시 ${baseTitle}`,
      `또 다른 ${baseTitle}`,
      `${baseTitle}의 기억`,
      `${baseTitle} II`,
      `${baseTitle}에게`,
      `${baseTitle}처럼`,
      `${baseTitle}의 시간`
    ];
    
    // 아직 사용되지 않은 변형 찾기
    for (const variant of variants) {
      if (!this.titleDB.isDuplicate(variant)) {
        console.log(`🔄 Created variant: "${baseTitle}" → "${variant}"`);
        return variant;
      }
    }
    
    // 모든 변형이 사용됨 → 타임스탬프 추가
    const timestamp = Date.now().toString().slice(-4);
    return `${baseTitle} ${timestamp}`;
  }

  /**
   * 가사 내용 기반 고유 제목 생성 (개선 버전)
   */
  generateUniqueTitlesFromLyrics(lyrics, count, songNumber, retryAttempt = 0) {
    // 가사에서 핵심 키워드 추출 (조사 제거 강화)
    const lines = lyrics.split('\n').filter(l => l.trim() && !l.startsWith('['));
    const words = lines.join(' ')
      .match(/[\uAC00-\uD7A3]{2,}/g) || [];
    
    // 조사 및 불용어 제거 (더 엄격하게)
    const stopWords = ['있어', '없어', '같아', '않아', '줘', '게', '도', '만', '까지', '에서', '부터', '에게', '의', '는', '은', '를', '을', '가', '이', '와', '과', '에', '로', '으로', '으로서', '며', '면서', '거든', '지만', '지', '죠', '요', '네', '데', '테', '께', '한테', '더', '든지', '라도', '하는', '되는', '하고', '되고', '있는', '없는', '그런', '이런', '저런', '어떤', '모든', '아무', '다른', '또', '혹은', '그리고'];
    
    const cleanedWords = words.filter(w => {
      // 조사로 끝나는 단어 제외
      const endsWithJosa = stopWords.some(josa => w.endsWith(josa) && w.length <= josa.length + 2);
      // 불용어 제외
      const isStopWord = stopWords.includes(w);
      // 너무 짧은 단어 제외 (2글자 미만)
      const tooShort = w.length < 2;
      
      return !endsWithJosa && !isStopWord && !tooShort;
    });
    
    // 빈도수 계산
    const wordFreq = {};
    cleanedWords.forEach(w => {
      wordFreq[w] = (wordFreq[w] || 0) + 1;
    });
    
    // 🎯 감정/명사 우선 키워드 추출 (의미있는 단어)
    // 1-3회 나온 단어를 우선 (반복되지 않으면서 의미있는 단어)
    const emotionalWords = ['사랑', '이별', '그리움', '외로움', '아픔', '행복', '슬픔', '기억', '추억', '약속', '꿈', '희망', '시간', '계절', '별', '바람', '눈물', '마음', '세상', '하루', '밤', '새벽', '날', '순간', '영원', '인연', '운명'];
    
    const keywords = Object.entries(wordFreq)
      .filter(([w, freq]) => {
        // 의미있는 단어: 1-3회 반복 또는 감정어
        return (freq >= 1 && freq <= 3 && w.length >= 2) || emotionalWords.includes(w);
      })
      .sort((a, b) => {
        // 감정어를 우선 정렬
        const aIsEmotional = emotionalWords.includes(a[0]);
        const bIsEmotional = emotionalWords.includes(b[0]);
        if (aIsEmotional && !bIsEmotional) return -1;
        if (!aIsEmotional && bIsEmotional) return 1;
        // 같은 등급이면 빈도순
        return b[1] - a[1];
      })
      .slice(0, 25) // 20 → 25로 증가 (더 많은 선택지)
      .map(([w]) => w);
    
    // 🎨 시적이고 의미 있는 제목 패턴 (20가지 고품질 패턴)
    const titlePatterns = [
      // 1. 가사 직접 추출 (Chorus/Verse 핵심 구절) - 최우선 ⭐
      () => {
        // 🎯 Chorus 첫 줄 우선 추출 (가장 기억에 남는 부분)
        const chorusLines = lyrics.match(/\[Chorus\]([\s\S]*?)(?=\[|$)/);
        if (chorusLines) {
          const lines = chorusLines[1].split('\n').filter(l => l.trim() && !l.match(/^[\d\s]*$/));
          
          // 첫 줄 우선 (가장 임팩트 있는 부분)
          if (lines.length > 0) {
            const firstLine = lines[0].trim().replace(/[,.!?~…]/g, '').trim();
            if (firstLine.length >= 4 && firstLine.length <= 30) {
              return firstLine;
            }
          }
          
          // 두 번째 줄도 시도
          if (lines.length > 1) {
            const secondLine = lines[1].trim().replace(/[,.!?~…]/g, '').trim();
            if (secondLine.length >= 4 && secondLine.length <= 30) {
              return secondLine;
            }
          }
        }
        
        // 🎵 Verse 1 첫 줄 추출 (서사의 시작)
        const verseLines = lyrics.match(/\[Verse 1?\]([\s\S]*?)(?=\[|$)/);
        if (verseLines) {
          const lines = verseLines[1].split('\n').filter(l => l.trim() && !l.match(/^[\d\s]*$/));
          if (lines.length > 0) {
            const firstLine = lines[0].trim().replace(/[,.!?~…]/g, '').trim();
            if (firstLine.length >= 4 && firstLine.length <= 30) {
              return firstLine;
            }
          }
        }
        
        // Fallback: 키워드 조합 (시적)
        return `${kw[0] || '별빛'} 아래 ${kw[1] || '우리'}`;
      },
      
      // 2. "의" 연결형 (은유적, 시적)
      (kw) => `${kw[0] || '봄날'}의 ${kw[1] || '약속'}`,
      (kw) => `${kw[0] || '별'}의 ${kw[1] || '궤적'}`,
      (kw) => `${kw[0] || '시간'}의 ${kw[1] || '틈'}`,
      (kw) => `${kw[0] || '기억'}의 ${kw[1] || '파편'}`,
      (kw) => `${kw[0] || '꿈'}의 ${kw[1] || '끝자락'}`,
      
      // 3. 질문형 (감정 표현, 완전 문장)
      (kw) => `${kw[0] || '사랑'}이 뭐길래`,
      (kw) => `${kw[0] || '왜'} ${kw[1] || '떠났'}을까`,
      (kw) => `${kw[0] || '괜찮니'} 물어봐`,
      (kw) => `${kw[0] || '어디'} ${kw[1] || '있니'} 지금`,
      (kw) => `${kw[0] || '기억'}하나요 ${kw[1] || '그날'}을`,
      
      // 4. 시간/장소 특정형 (구체적 이미지, 감성적)
      (kw) => `${['새벽 두 시', '금요일 밤', '12월의 끝', '첫 눈 오던 날', '여름밤 꿈', '가을 끝자락'][(songNumber + retryAttempt) % 6]}`,
      (kw) => `${['텅 빈', '낡은', '마지막', '처음', '잊혀진', '오래된'][(songNumber + retryAttempt) % 6]} ${kw[0] || '카페'}`,
      (kw) => `${kw[0] || '그날'} ${kw[1] || '그곳'}에서`,
      
      // 5. 부정형/결핍형 (감정 강조, 시적)
      (kw) => `${kw[0] || '너'}없는 ${['하루', '밤', '세상', '계절', '아침', '시간'][(songNumber + retryAttempt) % 6]}`,
      (kw) => `${kw[0] || '돌아갈'} 수 없는 ${kw[1] || '그곳'}`,
      (kw) => `${kw[0] || '다시'} 올 수 없는 ${kw[1] || '봄'}`,
      (kw) => `${kw[0] || '끝나지'} 않는 ${kw[1] || '이별'}`,
      
      // 6. 완전문장형 (서사적, 감정 표현)
      (kw) => `${kw[0] || '우리'} ${kw[1] || '이야기'}는 ${['계속돼', '끝나지 않아', '영원해', '아름다워', '남아있어', '살아있어'][(songNumber + retryAttempt) % 6]}`,
      (kw) => `${kw[0] || '네'}가 ${kw[1] || '그리워'}`,
      (kw) => `${kw[0] || '너'} 때문에 ${['웃었어', '울었어', '행복했어', '아팠어', '살았어', '꿈꿨어'][(songNumber + retryAttempt) % 6]}`,
      (kw) => `${kw[0] || '이별'}은 ${kw[1] || '또 다른'} ${['시작', '끝', '약속', '기억', '노래', '이야기'][(songNumber + retryAttempt) % 6]}`,
      
      // 7. 감각 묘사형 (오감 자극, 시적)
      (kw) => `${['차가운', '따뜻한', '뜨거운', '시린', '부드러운', '거친'][(songNumber + retryAttempt) % 6]} ${kw[0] || '손끝'}`,
      (kw) => `${kw[0] || '목소리'}의 온도`,
      (kw) => `${kw[0] || '향기'} 남은 ${kw[1] || '자리'}`,
      
      // 8. 시적 표현형 (고급 문학적, 은유)
      (kw) => `${kw[0] || '별'}이 ${kw[1] || '지는'} 곳`,
      (kw) => `${kw[0] || '시간'}이 ${['멈춘', '흐르는', '거슬러가는', '돌아가는', '멈춰선', '흘러간'][(songNumber + retryAttempt) % 6]} 순간`,
      (kw) => `${kw[0] || '빛'}이 ${kw[1] || '닿는'} ${['곳까지', '그곳', '저편', '너에게', '세상', '우리'][(songNumber + retryAttempt) % 6]}`,
      
      // 9. 대비/역설형 (감정의 복잡함)
      (kw) => `${kw[0] || '아픈'} ${kw[1] || '행복'}`,
      (kw) => `${kw[0] || '달콤한'} ${kw[1] || '슬픔'}`,
      (kw) => `${kw[0] || '외로운'} ${kw[1] || '축제'}`,
      
      // 10. 명령/청유형 (직접 호소, 감정적)
      (kw) => `${kw[0] || '떠나'}지 마`,
      (kw) => `${kw[0] || '나'} 좀 ${['내버려둬', '안아줘', '잊어줘', '기억해줘', '불러줘', '찾아줘'][(songNumber + retryAttempt) % 6]}`,
      (kw) => `${kw[0] || '그냥'} ${kw[1] || '있어'}줘`,
      
      // 11. 계절/자연 연계형 (감성적 이미지)
      (kw) => `${['봄비', '여름밤', '가을바람', '겨울 아침', '첫눈', '낙엽'][(songNumber + retryAttempt) % 6]} ${kw[0] || '이야기'}`,
      (kw) => `${kw[0] || '별빛'} 아래 ${kw[1] || '우리'}`,
      
      // 12. 행동/상태 표현형 (진행형, 감정적)
      (kw) => `${['혼자', '다시', '천천히', '멀리', '조용히', '그렇게'][(songNumber + retryAttempt) % 6]} ${kw[0] || '걷다'}`,
      (kw) => `${kw[0] || '멈춘'} ${kw[1] || '시간'} 속에서`
    ];
    
    const titles = [];
    const usedCombinations = new Set();
    
    for (let i = 0; i < count; i++) {
      let titleKo, titleEn;
      let attempts = 0;
      const maxAttempts = 30; // 50 → 30으로 감소 (더 빠르게 생성)
      
      do {
        // 🎯 1순위: Chorus/Verse 직접 추출 시도 (처음 5번 시도)
        if (attempts < 5) {
          const chorusPattern = titlePatterns[0]; // Chorus 직접 추출 패턴
          titleKo = chorusPattern(keywords);
          
          // Chorus에서 추출 성공 & 로컬 중복 아니면 바로 사용
          if (titleKo && titleKo.length >= 4 && 
              !usedCombinations.has(titleKo) &&
              !titleKo.includes('별빛') && 
              !titleKo.includes('우리')) { // Fallback이 아닌 경우
            titleEn = this.translateToEnglishTitle(titleKo);
            console.log(`✅ Chorus 추출 성공 (곡 ${i+1}): "${titleKo} / ${titleEn}"`);
            break;
          }
        }
        
        // 🎨 2순위: 시적인 패턴 사용 (Chorus 추출 실패 시)
        // 패턴을 순차적으로 시도 (랜덤 대신)
        const patternIndex = (i * 3 + attempts) % titlePatterns.length;
        const pattern = titlePatterns[patternIndex];
        
        // 키워드 선택 (곡마다 다른 키워드 세트)
        const keywordStartIdx = (i * 4 + attempts * 2) % Math.max(1, keywords.length);
        const selectedKeywords = keywords.slice(
          keywordStartIdx,
          keywordStartIdx + 3
        );
        
        titleKo = pattern(selectedKeywords);
        
        // 로컬 중복만 체크 (전역 DB 체크 제거)
        const isDuplicate = usedCombinations.has(titleKo);
        
        if (!isDuplicate) {
          titleEn = this.translateToEnglishTitle(titleKo);
          console.log(`✅ 패턴 생성 (곡 ${i+1}, 패턴 ${patternIndex}): "${titleKo} / ${titleEn}"`);
          break;
        }
        
        attempts++;
        
        // ⚠️ maxAttempts 도달 시 강제 생성
        if (attempts >= maxAttempts) {
          console.warn(`⚠️ 최대 시도 횟수 도달 (곡 ${i+1}), 강제 생성`);
          // 곡 번호를 활용한 고유 제목 생성
          const uniquePatterns = [
            `${keywords[i % keywords.length] || '이야기'}의 ${['시작', '끝', '여정', '기억', '순간', '약속'][i % 6]}`,
            `${['새로운', '마지막', '잊혀진', '숨겨진', '떠나간', '남겨진'][i % 6]} ${keywords[(i + 1) % keywords.length] || '노래'}`,
            `${keywords[(i + 2) % keywords.length] || '별빛'} ${['너머', '아래', '속에서', '뒤에', '사이', '끝에'][i % 6]}`
          ];
          titleKo = uniquePatterns[i % 3];
          titleEn = this.translateToEnglishTitle(titleKo);
          console.log(`🔧 강제 생성 (곡 ${i+1}): "${titleKo} / ${titleEn}"`);
          break;
        }
      } while (attempts < maxAttempts);
      
      usedCombinations.add(titleKo);
      titles.push(`${titleKo} / ${titleEn}`);
    }
    
    return titles;
  }

  /**
   * 한글 제목을 영어로 번역 (개선 버전)
   */
  translateToEnglishTitle(koreanTitle) {
    // 더 포괄적인 번역 딕셔너리
    const dict = {
      // 감정/상태
      '황혼에': 'At Twilight', '별빛': 'Starlight', '잃어버린': 'Lost', '기억': 'Memory',
      '눈물': 'Tears', '그리움': 'Longing', '희망': 'Hope', '마지막': 'Last',
      '첫': 'First', '첫번째': 'First', '영원한': 'Eternal', '흩어진': 'Scattered',
      '숨겨진': 'Hidden', '떠나간': 'Departed', '남겨진': 'Left Behind', '지워진': 'Erased',
      '사라진': 'Vanished', '잊혀진': 'Forgotten', '끊어진': 'Broken', '멈춘': 'Stopped',
      '설렘': 'Excitement', '아픔': 'Pain', '미소': 'Smile', '한숨': 'Sigh',
      '외침': 'Shout', '울림': 'Echo', '속삭임': 'Whisper', '온기': 'Warmth',
      '새로운': 'New', '오래된': 'Old', '깊은': 'Deep', '높은': 'High', '낮은': 'Low',
      '밝은': 'Bright', '어두운': 'Dark', '따뜻한': 'Warm', '차가운': 'Cold',
      '아름다운': 'Beautiful', '슬픈': 'Sad', '기쁜': 'Joyful', '행복한': 'Happy',
      '외로운': 'Lonely', '쓸쓸한': 'Desolate', '그리운': 'Longed For', '그립던': 'Missed',
      '아련한': 'Faint', '애틋한': 'Tender',
      
      // 명사
      '약속': 'Promise', '노래': 'Song', '이야기': 'Story', '순간': 'Moment',
      '추억': 'Memories', '멜로디': 'Melody', '향기': 'Scent', '여정': 'Journey',
      '빛': 'Light', '그림자': 'Shadow', '사랑': 'Love', '이별': 'Farewell',
      '마음': 'Heart', '별': 'Star', '달': 'Moon', '해': 'Sun',
      '바람': 'Wind', '시간': 'Time', '날개': 'Wings', '꿈': 'Dream',
      '새벽': 'Dawn', '밤': 'Night', '아침': 'Morning', '저녁': 'Evening',
      '연락': 'Call', '전화': 'Phone', '편지': 'Letter', '메시지': 'Message',
      '카페': 'Cafe', '거리': 'Street', '길': 'Road', '자리': 'Place',
      '기억': 'Memory', '눈물': 'Tears', '웃음': 'Smile', '그리움': 'Longing',
      '발자국': 'Footstep', '그곳': 'That Place', '소리': 'Sound', '노래': 'Song',
      '목소리': 'Voice', '손끝': 'Fingertip', '온도': 'Temperature', '인사': 'Greeting',
      '골목길': 'Alley', '불빛': 'Light', '공기': 'Air', '커피잔': 'Coffee Cup',
      '조각': 'Piece', '궤적': 'Trace', '틈': 'Gap', '끝자락': 'Edge',
      '파편': 'Fragment', '흔적': 'Trace', '잔상': 'Afterimage',
      '두 시': 'Two AM', '금요일 밤': 'Friday Night',
      
      // 자연/계절
      '봄날의': 'Spring Day', '봄날': 'Spring Day', '봄': 'Spring', '여름': 'Summer',
      '가을': 'Autumn', '겨울': 'Winter', '달빛': 'Moonlight', '하늘': 'Sky',
      '비': 'Rain', '눈': 'Snow', '구름': 'Cloud', '무지개': 'Rainbow',
      '봄비': 'Spring Rain', '여름밤': 'Summer Night', '가을바람': 'Autumn Wind', '겨울 아침': 'Winter Morning',
      '첫눈': 'First Snow', '낙엽': 'Fallen Leaves', '별빛': 'Starlight',
      
      // 조사 및 어미 (더 자연스러운 번역)
      '피어난': 'Blooming', '아래': 'Under', '속에': 'Within', '뒤의': 'Behind',
      '된': '', '전한': 'Conveyed', '멈춘': 'Stopped', '가득한': 'Full of',
      '준': 'Given', '와': 'and', '와의': 'with', '의': '', // '의'는 대부분 생략
      '에': 'in', '이': '', '을': '', '를': '', // 조사 대부분 생략
      '고': 'and', '로': 'to', '부터': 'from',
      
      // 동사
      '담은': 'Held', '남긴': 'Left', '잊은': 'Forgotten', '그린': 'Drawn',
      '만난': 'Met', '떠난': 'Left', '돌아온': 'Returned', '시작': 'Beginning',
      '끝낸': 'Finished', '멈춘': 'Stopped', '흐르는': 'Flowing', '날아가는': 'Flying',
      
      // 기타
      '함께': 'Together', '혼자': 'Alone', '항상': 'Always', '다시': 'Again',
      '처음': 'Beginning', '끝': 'End', '내일': 'Tomorrow', '어제': 'Yesterday',
      '오늘': 'Today', '과거': 'Past', '미래': 'Future', '현재': 'Present',
      '그대': 'You', '너': 'You', '나': 'I', '우리': 'We',
      
      // 자주 쓰이는 명사 추가
      '인사': 'Greeting', '생각': 'Thought', '세상': 'World', '하루': 'Day',
      '밤': 'Night', '아침': 'Morning', '저녁': 'Evening', '길': 'Road',
      '문': 'Door', '창문': 'Window', '거리': 'Street', '집': 'Home',
      '손': 'Hand', '발': 'Foot', '목소리': 'Voice', '얼굴': 'Face',
      
      // 동사 형태 추가
      '걷는': 'Walking', '서는': 'Standing', '앉은': 'Sitting', '뛰는': 'Running',
      '기다리는': 'Waiting', '보는': 'Seeing', '듣는': 'Hearing', '말하는': 'Speaking',
      '걷다': 'Walk', '떠나다': 'Leave', '돌아오다': 'Return', '사라지다': 'Disappear',
      
      // 🎨 시적 표현 대폭 추가 (K-POP 스타일)
      '계절': 'Season', '순간': 'Moment', '영원': 'Forever', '영원히': 'Forever',
      '운명': 'Destiny', '인연': 'Fate', '인연의': 'Fateful', '끝': 'End',
      '시작': 'Beginning', '멈추다': 'Stop', '흐르다': 'Flow', '흘러가다': 'Flow Away',
      '거슬러가다': 'Go Back', '돌아가다': 'Go Back', '돌아가는': 'Returning',
      '닿는': 'Reaching', '지는': 'Setting', '뜨는': 'Rising', '피는': 'Blooming',
      '지다': 'Fall', '피다': 'Bloom', '떨어지다': 'Fall', '날아가다': 'Fly Away',
      '별이': 'Stars', '시간이': 'Time', '빛이': 'Light', '바람이': 'Wind',
      '그곳': 'There', '저편': 'Beyond', '너에게': 'To You', '우리': 'Us',
      '곳까지': 'Place', '순간': 'Moment', '온도': 'Temperature', '향기': 'Scent',
      '파편': 'Fragment', '궤적': 'Path', '틈': 'Gap', '끝자락': 'Edge',
      '두 시': 'Two O\'clock', '금요일': 'Friday', '12월': 'December',
      '오던': 'Coming', '날': 'Day', '꿈': 'Dream', '텅 빈': 'Empty',
      '낡은': 'Old', '잊혀진': 'Forgotten', '오래된': 'Aged', '처음': 'First',
      '없는': 'Without', '수 없는': 'Cannot', '않는': 'Not', '지 않아': 'Not',
      '계속돼': 'Continue', '끝나지 않아': 'Never End', '남아있어': 'Remain',
      '살아있어': 'Alive', '그리워': 'Miss You', '때문에': 'Because Of',
      '웃었어': 'Smiled', '울었어': 'Cried', '행복했어': 'Was Happy',
      '아팠어': 'Hurt', '살았어': 'Lived', '꿈꿨어': 'Dreamed',
      '또 다른': 'Another', '차가운': 'Cold', '따뜻한': 'Warm', '뜨거운': 'Hot',
      '시린': 'Chilly', '부드러운': 'Soft', '거친': 'Rough', '손끝': 'Fingertip',
      '떠나지': 'Don\'t Leave', '마': 'Don\'t', '내버려둬': 'Leave Me Alone',
      '안아줘': 'Hold Me', '잊어줘': 'Forget Me', '기억해줘': 'Remember Me',
      '불러줘': 'Call Me', '찾아줘': 'Find Me', '있어줘': 'Stay With Me',
      '혼자': 'Alone', '다시': 'Again', '천천히': 'Slowly', '멀리': 'Far Away',
      '조용히': 'Quietly', '그렇게': 'That Way', '속에서': 'Inside', '아래': 'Under'
    };
    
    let english = koreanTitle;
    
    // 긴 구문부터 먼저 치환 (순서 중요!)
    const sortedEntries = Object.entries(dict).sort((a, b) => b[0].length - a[0].length);
    
    sortedEntries.forEach(([ko, en]) => {
      english = english.replace(new RegExp(ko, 'g'), en ? ` ${en} ` : ' ');
    });
    
    // ⚠️ 남은 한글은 로마자 변환 대신 제거 (의미 없는 번역 방지)
    // 로마자로 변환하면 "Sae To Un" 같은 이상한 제목이 생성됨
    english = english.replace(/[\uAC00-\uD7A3]+/g, '').trim();
    
    // 연속된 공백 제거 및 정리
    english = english.replace(/\s+/g, ' ').trim();
    
    // 첫 글자 대문자, 나머지는 소문자/대문자 적절히
    english = english.split(' ')
      .filter(w => w.length > 0)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ');
    
    return english || 'Untitled';
  }
  
  /**
   * 한글을 로마자로 변환 (간단 버전)
   */
  romanizeKorean(hangul) {
    // 기본 매핑 (간소화)
    const chosung = ['g','kk','n','d','tt','r','m','b','pp','s','ss','','j','jj','ch','k','t','p','h'];
    const jungsung = ['a','ae','ya','yae','eo','e','yeo','ye','o','wa','wae','oe','yo','u','wo','we','wi','yu','eu','ui','i'];
    const jongsung = ['','g','kk','gs','n','nj','nh','d','l','lg','lm','lb','ls','lt','lp','lh','m','b','bs','s','ss','ng','j','ch','k','t','p','h'];
    
    let result = '';
    
    for (let i = 0; i < hangul.length; i++) {
      const code = hangul.charCodeAt(i) - 0xAC00;
      if (code >= 0 && code < 11172) {
        const cho = Math.floor(code / 588);
        const jung = Math.floor((code % 588) / 28);
        const jong = code % 28;
        result += chosung[cho] + jungsung[jung] + jongsung[jong];
      } else {
        result += hangul[i];
      }
    }
    
    // 대문자로 변환
    return result.charAt(0).toUpperCase() + result.slice(1);
  }

  /**
   * 고급 Mock 가사 생성 (완전히 다른 50+ 스타일)
   */
  generateAdvancedMockLyrics(prompt, number, totalCount, titleCount = 3, uniqueSeed) {
    // 50+ 다양한 스타일 템플릿
    const templates = this.get50PlusTemplates();
    const templateIndex = (number + uniqueSeed) % templates.length;
    const template = templates[templateIndex];
    
    // 프롬프트 심층 분석
    const analysis = this.analyzePromptDeeply(prompt, number);
    
    // 고유한 가사 생성
    const lyricsKo = this.generateUniqueLyrics(analysis, template, number);
    const lyricsEn = this.translateLyricsToEnglish(lyricsKo);
    
    // 가사 내용 기반 깊이 있는 제목 생성
    const titles = this.generateUniqueTitlesFromLyrics(lyricsKo, titleCount, number);
    
    return `[LYRICS_KO]
${lyricsKo}

[LYRICS_EN]
${lyricsEn}

[SUGGESTED_TITLES]
${titles.map((t, i) => `${i + 1}. ${t}`).join('\n')}`;
  }

  /**
   * 50+ 다양한 스타일 템플릿
   */
  get50PlusTemplates() {
    return [
      // 발라드 스타일 (1-10)
      { style: 'emotional_ballad', mood: 'sad', tempo: 'slow' },
      { style: 'hopeful_ballad', mood: 'hopeful', tempo: 'moderate' },
      { style: 'nostalgic_ballad', mood: 'nostalgic', tempo: 'slow' },
      { style: 'dramatic_ballad', mood: 'intense', tempo: 'slow' },
      { style: 'romantic_ballad', mood: 'love', tempo: 'moderate' },
      { style: 'farewell_ballad', mood: 'sad', tempo: 'slow' },
      { style: 'confession_ballad', mood: 'love', tempo: 'moderate' },
      { style: 'longing_ballad', mood: 'longing', tempo: 'slow' },
      { style: 'healing_ballad', mood: 'peaceful', tempo: 'slow' },
      { style: 'winter_ballad', mood: 'cold', tempo: 'slow' },
      
      // 팝 스타일 (11-20)
      { style: 'upbeat_pop', mood: 'happy', tempo: 'fast' },
      { style: 'synth_pop', mood: 'energetic', tempo: 'fast' },
      { style: 'indie_pop', mood: 'quirky', tempo: 'moderate' },
      { style: 'dream_pop', mood: 'dreamy', tempo: 'moderate' },
      { style: 'electro_pop', mood: 'energetic', tempo: 'fast' },
      { style: 'folk_pop', mood: 'warm', tempo: 'moderate' },
      { style: 'tropical_pop', mood: 'bright', tempo: 'fast' },
      { style: 'city_pop', mood: 'sophisticated', tempo: 'moderate' },
      { style: 'acoustic_pop', mood: 'gentle', tempo: 'slow' },
      { style: 'retro_pop', mood: 'nostalgic', tempo: 'moderate' },
      
      // R&B/소울 (21-30)
      { style: 'smooth_rnb', mood: 'sensual', tempo: 'slow' },
      { style: 'neo_soul', mood: 'groovy', tempo: 'moderate' },
      { style: 'urban_rnb', mood: 'cool', tempo: 'moderate' },
      { style: 'gospel_soul', mood: 'spiritual', tempo: 'moderate' },
      { style: 'jazz_soul', mood: 'sophisticated', tempo: 'slow' },
      { style: 'funk_soul', mood: 'groovy', tempo: 'fast' },
      { style: 'blues_soul', mood: 'melancholic', tempo: 'slow' },
      { style: 'modern_rnb', mood: 'trendy', tempo: 'moderate' },
      { style: 'alternative_rnb', mood: 'experimental', tempo: 'moderate' },
      { style: 'classic_soul', mood: 'timeless', tempo: 'moderate' },
      
      // 록/인디 (31-40)
      { style: 'indie_rock', mood: 'rebellious', tempo: 'fast' },
      { style: 'soft_rock', mood: 'gentle', tempo: 'moderate' },
      { style: 'post_rock', mood: 'atmospheric', tempo: 'slow' },
      { style: 'punk_rock', mood: 'angry', tempo: 'fast' },
      { style: 'alternative_rock', mood: 'edgy', tempo: 'moderate' },
      { style: 'psychedelic_rock', mood: 'trippy', tempo: 'moderate' },
      { style: 'garage_rock', mood: 'raw', tempo: 'fast' },
      { style: 'prog_rock', mood: 'complex', tempo: 'varied' },
      { style: 'folk_rock', mood: 'storytelling', tempo: 'moderate' },
      { style: 'surf_rock', mood: 'carefree', tempo: 'fast' },
      
      // 특수 스타일 (41-50+)
      { style: 'ambient', mood: 'ethereal', tempo: 'very_slow' },
      { style: 'new_age', mood: 'meditative', tempo: 'slow' },
      { style: 'trip_hop', mood: 'moody', tempo: 'slow' },
      { style: 'bossa_nova', mood: 'relaxed', tempo: 'moderate' },
      { style: 'reggae', mood: 'laid_back', tempo: 'moderate' },
      { style: 'ska', mood: 'upbeat', tempo: 'fast' },
      { style: 'latin_pop', mood: 'passionate', tempo: 'fast' },
      { style: 'country_pop', mood: 'heartfelt', tempo: 'moderate' },
      { style: 'gospel', mood: 'uplifting', tempo: 'moderate' },
      { style: 'musical_theater', mood: 'dramatic', tempo: 'varied' },
      { style: 'cabaret', mood: 'theatrical', tempo: 'moderate' },
      { style: 'swing', mood: 'jazzy', tempo: 'fast' },
      { style: 'blues', mood: 'soulful', tempo: 'slow' },
      { style: 'folk', mood: 'traditional', tempo: 'moderate' },
      { style: 'world_music', mood: 'exotic', tempo: 'varied' }
    ];
  }

  /**
   * 프롬프트 심층 분석
   */
  analyzePromptDeeply(prompt, number) {
    const keywords = prompt.match(/[\uAC00-\uD7A3]+|[a-zA-Z]+/g) || [];
    
    // 감정 분석
    const emotions = {
      happy: /기쁨|행복|즐거|설렘|신나|밝은|경쾌|유쾌/.test(prompt),
      sad: /슬픔|아픔|이별|그리움|외로|눈물|상처|슬픈/.test(prompt),
      love: /사랑|연인|그대|너|마음|설레|고백/.test(prompt),
      hope: /희망|꿈|미래|시작|새로|내일|빛/.test(prompt),
      nostalgia: /추억|기억|그때|옛날|과거|회상|그리/.test(prompt),
      freedom: /자유|날개|해방|떠나|여행|모험/.test(prompt),
      passion: /열정|도전|불타|강렬|뜨거|힘/.test(prompt),
      peace: /평화|고요|조용|편안|휴식|여유/.test(prompt),
      anger: /분노|화|짜증|억울|복수/.test(prompt),
      longing: /그리움|보고|만나|기다|그립/.test(prompt)
    };
    
    // 주요 감정 선택
    const primaryEmotion = Object.entries(emotions)
      .filter(([_, value]) => value)
      .map(([key]) => key)[0] || 'neutral';
    
    // 계절/시간 감지
    const season = /봄|벚꽃|따뜻/.test(prompt) ? 'spring' :
                   /여름|바다|햇살/.test(prompt) ? 'summer' :
                   /가을|단풍|낙엽/.test(prompt) ? 'autumn' :
                   /겨울|눈|추운/.test(prompt) ? 'winter' : 'none';
    
    const timeOfDay = /아침|새벽|sunrise/.test(prompt) ? 'morning' :
                      /점심|낮|day/.test(prompt) ? 'afternoon' :
                      /저녁|노을|sunset/.test(prompt) ? 'evening' :
                      /밤|달|midnight/.test(prompt) ? 'night' : 'none';
    
    return {
      keywords,
      primaryEmotion,
      emotions,
      season,
      timeOfDay,
      number,
      uniqueId: Date.now() + number * 1000
    };
  }

  /**
   * 고유한 가사 생성 (템플릿 + 분석 기반)
   */
  generateUniqueLyrics(analysis, template, number) {
    const { keywords, primaryEmotion, season, timeOfDay } = analysis;
    const mainKeyword = keywords[0] || '마음';
    const secondKeyword = keywords[1] || '시간';
    const thirdKeyword = keywords[2] || '추억';
    
    // 감정별 표현 라이브러리
    const emotionPhrases = {
      happy: ['미소 짓게 해', '설레는 마음', '빛나는 순간', '행복한 시간'],
      sad: ['눈물 흘리며', '아픈 마음', '외로운 밤', '슬픈 기억'],
      love: ['사랑하는 마음', '너를 향한', '함께한 시간', '그대의 미소'],
      hope: ['희망의 빛', '새로운 시작', '꿈꾸는 내일', '밝은 미래'],
      nostalgia: ['그리운 날들', '추억 속에', '그때 그 시절', '돌아가고 싶은'],
      longing: ['보고 싶은 마음', '그리움에 잠겨', '기다리는 시간', '만나고 싶어']
    };
    
    const phrases = emotionPhrases[primaryEmotion] || emotionPhrases['love'];
    
    // 다양한 가사 패턴 (number에 따라 변경)
    const patterns = [
      // 패턴 1: 시적 표현
      () => `[Verse 1]
${mainKeyword} 속에 담긴 ${phrases[0]}
${secondKeyword}이 흘러가도 변하지 않는
${thirdKeyword}의 조각들이 떠올라
네가 남긴 흔적을 따라서

[Chorus]
이 ${mainKeyword}이 멈추지 않기를
영원히 ${phrases[1]} 수 있기를
${secondKeyword} 너머 어딘가에서
우리의 이야기가 계속되기를

[Verse 2]
${season !== 'none' ? season + '의 바람이' : '바람이'} 스쳐 지나가고
${timeOfDay !== 'none' ? timeOfDay + '의' : ''} 하늘은 물들어가
${thirdKeyword}을 안고 걸어가는
이 길의 끝에 네가 있기를

[Chorus]
이 ${mainKeyword}이 멈추지 않기를
영원히 ${phrases[1]} 수 있기를
${secondKeyword} 너머 어딘가에서
우리의 이야기가 계속되기를

[Bridge]
혹시 너도 나처럼
같은 하늘을 보며
${phrases[2]}을 느끼는지
알고 싶어

[Chorus]
이 ${mainKeyword}이 멈추지 않기를
영원히 ${phrases[1]} 수 있기를
${secondKeyword} 너머 어딘가에서
우리의 이야기가 계속되기를

[Outro]
${mainKeyword} 속에 너를 담아
영원히 기억할게`,

      // 패턴 2: 스토리텔링
      () => `[Verse 1]
처음 ${mainKeyword}을 마주한 그 순간
세상이 멈춘 것 같았어
${secondKeyword}의 흐름 속에서
너와 나, 단둘이 있었지

[Chorus]
${phrases[0]}, ${phrases[1]}
이 ${mainKeyword}이 영원하길
${thirdKeyword}로 남을 이 순간
절대 잊지 않을게

[Verse 2]
${season !== 'none' ? season + '이 오고' : '계절이 바뀌고'}
${timeOfDay !== 'none' ? timeOfDay + '이 되어도' : '시간이 흘러도'}
변하지 않는 건 하나
너를 향한 내 ${mainKeyword}

[Chorus]
${phrases[0]}, ${phrases[1]}
이 ${mainKeyword}이 영원하길
${thirdKeyword}로 남을 이 순간
절대 잊지 않을게

[Bridge]
만약 다시 돌아갈 수 있다면
그날 그 자리에서
너에게 전하지 못한 말들을
모두 전할 텐데

[Chorus]
${phrases[0]}, ${phrases[1]}
이 ${mainKeyword}이 영원하길
${thirdKeyword}로 남을 이 순간
절대 잊지 않을게

[Outro]
${mainKeyword}, ${secondKeyword}, ${thirdKeyword}
모든 것이 너였어`,

      // 패턴 3: 은유적 표현
      () => `[Verse 1]
${mainKeyword}은 바다처럼 깊고
${secondKeyword}은 파도처럼 밀려와
${thirdKeyword}의 해변에 남겨진
우리의 발자국을 찾아

[Chorus]
${phrases[2]} 속으로
천천히 걸어가
${mainKeyword}의 끝에서
너를 만날 수 있다면

[Verse 2]
${season !== 'none' ? season + '의 노래가' : '노래가'}
${timeOfDay !== 'none' ? timeOfDay + '을' : '하늘을'} 물들이고
${phrases[3]} 가득한
이 순간을 간직해

[Chorus]
${phrases[2]} 속으로
천천히 걸어가
${mainKeyword}의 끝에서
너를 만날 수 있다면

[Bridge]
별빛이 내린 밤
너의 목소리가 들려와
${secondKeyword} 너머에서도
영원히 닿을 수 있도록

[Chorus]
${phrases[2]} 속으로
천천히 걸어가
${mainKeyword}의 끝에서
너를 만날 수 있다면

[Outro]
${mainKeyword}, 그 안에 너
${secondKeyword}, 그 속에 우리
${thirdKeyword}, 영원히`,

      // 패턴 4: 대화 형식
      () => `[Verse 1]
"${mainKeyword}이 뭐야?" 네가 물었지
"너야" 난 대답했어
${secondKeyword}이 지나고
${thirdKeyword}이 쌓여도

[Chorus]
${phrases[0]} 해
${phrases[1]} 해줘
이 ${mainKeyword} 끝까지
함께 있어줘

[Verse 2]
"${season !== 'none' ? season : '언젠가'}에 만나자" 약속했었지
"${timeOfDay !== 'none' ? timeOfDay : '그때'}에 기다릴게"
하지만 ${thirdKeyword}만 남고
너는 떠나갔어

[Chorus]
${phrases[0]} 해
${phrases[1]} 해줘
이 ${mainKeyword} 끝까지
함께 있어줘

[Bridge]
"미안해" 하고 싶었어
"사랑해" 말하고 싶었어
${secondKeyword}을 되돌릴 수 없지만
${mainKeyword}은 변하지 않아

[Chorus]
${phrases[0]} 해
${phrases[1]} 해줘
이 ${mainKeyword} 끝까지
함께 있어줘

[Outro]
"기억해줘" 마지막 말
${mainKeyword} 속에 forever`,

      // 패턴 5: 반복과 변주
      () => `[Verse 1]
${mainKeyword} ${mainKeyword} ${mainKeyword}
너를 부르는 이 이름
${secondKeyword} ${secondKeyword} ${secondKeyword}
멈출 수 없는 이 흐름

[Chorus]
${phrases[0]}, 너와 나
${phrases[1]}, 이 순간
${thirdKeyword}으로 남을
우리의 ${mainKeyword}

[Verse 2]
${season !== 'none' ? season + ' ' + season : '계절 계절'}
지나가도 변하지 않아
${timeOfDay !== 'none' ? timeOfDay + ' ' + timeOfDay : '매일 매일'}
너를 생각해

[Chorus]
${phrases[0]}, 너와 나
${phrases[1]}, 이 순간
${thirdKeyword}으로 남을
우리의 ${mainKeyword}

[Bridge]
la la la la la
${mainKeyword}이 흐르고
la la la la la
${secondKeyword}이 지나고
la la la la la
${thirdKeyword}만 남아도

[Chorus]
${phrases[0]}, 너와 나
${phrases[1]}, 이 순간
${thirdKeyword}으로 남을
우리의 ${mainKeyword}

[Outro]
${mainKeyword} 속에
영원히 Together`
    ];
    
    // number에 따라 패턴 선택 (순환)
    const patternIndex = number % patterns.length;
    return patterns[patternIndex]();
  }

  /**
   * 한글 가사를 영어로 번역 (한글 완전 제거 + 개선된 번역)
   */
  translateLyricsToEnglish(koreanLyrics) {
    const lines = koreanLyrics.split('\n');
    let lineIndex = 0; // 줄 번호 추적
    
    const translated = lines.map(line => {
      if (line.startsWith('[')) {
        return line; // 구조 태그는 그대로
      }
      
      if (line.trim() === '') {
        return line; // 빈 줄 유지
      }
      
      lineIndex++;
      
      // 🚨 각 키워드마다 여러 문장 변형 추가 (매번 다르게!)
      const sentenceVariations = {
        'spring': [
          'When the spring day arrives with gentle warmth',
          'Spring brings new hope into my life',
          'As flowers bloom in the morning light',
          'The season of spring reminds me of you',
          'Walking through springtime memories with you'
        ],
        'sea': [
          'The ocean waves whisper stories to me',
          'Standing by the endless blue sea',
          'Waves crash against the shore tonight',
          'The sea carries my thoughts to you',
          'Lost in the sound of ocean waves'
        ],
        'time': [
          'As time flows by without stopping',
          'Every moment feels like eternity',
          'Time cannot heal this aching heart',
          'Through the passage of endless time',
          'Memories fade but time remains'
        ],
        'love': [
          'My love for you grows stronger every day',
          'This love will never fade away',
          'Falling deeper into love with you',
          'A love that lasts through every season',
          'Your love is all I need to breathe'
        ],
        'heart': [
          'My heart still beats only for you',
          'You hold the key to my heart',
          'Every heartbeat calls your name tonight',
          'This heart belongs to you alone',
          'My broken heart still dreams of you'
        ],
        'miss': [
          'I miss you more than words can say',
          'Missing you through every lonely night',
          'The pain of missing you never ends',
          'I miss the way you used to smile',
          'Every moment without you feels incomplete'
        ],
        'you': [
          'Thinking of you brings me through the night',
          'You are the reason I believe',
          'Everything reminds me of you',
          'You made my world complete and whole',
          'Without you life feels empty now'
        ],
        'night': [
          'Every night feels endless without you here',
          'The darkness falls and I think of you',
          'Lonely nights remind me what I lost',
          'Through the silent hours of the night',
          'Stars shine bright on this quiet night'
        ],
        'memory': [
          'These precious memories will never fade away',
          'Holding onto every memory of us',
          'Your memory lives forever in my soul',
          'I cherish every moment we shared',
          'Memories of you keep me going strong'
        ],
        'sky': [
          'Under the endless sky above',
          'The sky reminds me of your eyes',
          'Looking up at the infinite sky',
          'Clouds drift across the morning sky',
          'The blue sky holds our promises'
        ],
        'wind': [
          'The wind carries your voice to me',
          'A gentle breeze brings back your touch',
          'Whispers in the wind call your name',
          'The autumn wind feels cold without you',
          'Dancing with the wind under the stars'
        ],
        'star': [
          'Stars shine bright in the midnight sky',
          'You are my guiding star tonight',
          'A million stars could never match your light',
          'Under the stars I make my wish',
          'The starlight reminds me of your smile'
        ],
        'dream': [
          'Dreams of us together fill my mind',
          'This dream feels too real to let go',
          'I dream of you every single night',
          'Living in a dream where you are mine',
          'My dreams are filled with memories of you'
        ],
        'rain': [
          'Rain falls gently on this quiet evening',
          'The rain reminds me of your tears',
          'Dancing together in the summer rain',
          'Raindrops wash away the pain tonight',
          'I remember walking in the rain with you'
        ],
        'forever': [
          'This feeling will last forever in my soul',
          'I promise to love you forever and always',
          'Forever is not long enough with you',
          'Our love will shine forever bright',
          'Together forever is all I wish for'
        ],
        'wait': [
          'I am waiting for the day we meet again',
          'Waiting for you feels like eternity',
          'Every day I wait for your return',
          'Still waiting for a sign from you',
          'I will wait for you until the end'
        ],
        'tear': [
          'Tears fall down like rain tonight',
          'I hide my tears behind a smile',
          'Your tears broke my heart that day',
          'Through all the tears I still believe',
          'Tears cannot express how much I care'
        ],
        'smile': [
          'Your smile lights up my darkest days',
          'I remember the way you used to smile',
          'A smile is all I need from you',
          'Your smile made everything worthwhile',
          'I live to see you smile again'
        ],
        'together': [
          'We walked together through the seasons',
          'Being together feels like coming home',
          'Forever together is my only dream',
          'Every moment together was a gift',
          'I miss the days we spent together'
        ],
        'promise': [
          'I promise to keep you in my heart',
          'A promise made beneath the stars',
          'This promise will never be broken',
          'I keep the promise that we made',
          'Our promise remains unspoken but true'
        ]
      };
      
      // 한글 가사에서 키워드 찾기
      let foundMatch = false;
      for (const [key, variations] of Object.entries(sentenceVariations)) {
        const pattern = new RegExp(key, 'i');
        if (pattern.test(line)) {
          // lineIndex를 사용해서 변형 선택 (매번 다르게)
          const index = (lineIndex + line.length) % variations.length;
          foundMatch = true;
          return variations[index];
        }
      }
      
      // 한글 패턴도 체크
      const koreanPatterns = {
        '봄': 'spring',
        '바다': 'sea',
        '파도': 'sea',
        '시간': 'time',
        '사랑': 'love',
        '마음': 'heart',
        '그리움': 'miss',
        '보고': 'miss',
        '너': 'you',
        '그대': 'you',
        '밤': 'night',
        '추억': 'memory',
        '기억': 'memory',
        '하늘': 'sky',
        '바람': 'wind',
        '별': 'star',
        '꿈': 'dream',
        '비': 'rain',
        '영원': 'forever',
        '기다': 'wait',
        '눈물': 'tear',
        '미소': 'smile',
        '웃음': 'smile',
        '함께': 'together',
        '우리': 'together',
        '약속': 'promise'
      };
      
      for (const [korKey, engKey] of Object.entries(koreanPatterns)) {
        if (line.includes(korKey) && sentenceVariations[engKey]) {
          const variations = sentenceVariations[engKey];
          const index = (lineIndex + line.length) % variations.length;
          return variations[index];
        }
      }
      
      // 매칭 안 되면 기본 문장 (lineIndex로 다양하게)
      const defaultSentences = [
        'Through every moment I am thinking of you',
        'My feelings for you will never change',
        'I hold you close inside my heart forever',
        'Every day brings new memories of us',
        'Nothing can break the bond between our hearts',
        'Your presence fills my life with meaning',
        'I carry your love with me everywhere I go',
        'Time cannot erase what we shared together',
        'You will always be the one I cherish most',
        'My soul finds peace when I think of you',
        'Every step I take leads me back to you',
        'Your memory keeps me strong through every trial',
        'I believe our paths will cross again someday',
        'The love we shared will never fade away',
        'This moment will remain in my heart always',
        'I see your face in everything around me',
        'The distance cannot weaken what we have',
        'My world revolves around you endlessly',
        'I treasure every second we spent together',
        'Your love gives me strength to carry on'
      ];
      
      const index = (lineIndex + line.length) % defaultSentences.length;
      return defaultSentences[index];
    });
    
    return translated.join('\n');
  }
  
  /**

  /**
   * 샘플 가사 기반 생성
   */
  async generateFromSample(sampleLyrics, quantity = 1) {
    try {
      const results = [];
      
      for (let i = 0; i < quantity; i++) {
        const completion = await this.client.chat.completions.create({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: '당신은 전문 작사가입니다. 주어진 참고 가사의 스타일을 분석하고, 비슷한 감성과 구조로 완전히 새로운 독창적인 가사를 창작하세요.'
            },
            {
              role: 'user',
              content: `다음 참고 가사의 스타일을 분석하여, 완전히 새로운 독창적인 가사를 작성해주세요:

${sampleLyrics}

요구사항:
- 참고 가사와 비슷한 감성과 분위기를 유지
- 동일한 구조 ([Verse], [Chorus] 등)
- 한글 가사와 영어 가사 모두 제공
- 깊이 있는 제목 3개 추천 (한글/영문 병기)
- ⚠️ 중요: "샘플", "참고", "레퍼런스" 같은 메타 단어는 가사에 절대 사용하지 마세요`
            }
          ],
          temperature: 0.9,
          max_tokens: 2000
        });

        const response = completion.choices[0].message.content;
        const parsed = this.parseLyricsResponse(response, 3);
        
        results.push({
          id: Date.now() + i,
          title: parsed.titles[0] || `Sample-based Song ${i + 1}`,
          lyrics: parsed.lyrics,
          suggestedTitles: parsed.titles,
          sourceType: 'sample',
          createdAt: new Date().toISOString()
        });

        if (i < quantity - 1) {
          await new Promise(resolve => setTimeout(resolve, 500));
        }
      }

      return results;

    } catch (error) {
      console.error('샘플 기반 가사 생성 실패:', error);
      throw error;
    }
  }

  /**
   * 배치 생성 (여러 테마)
   */
  async generateBatch(mainTheme, subThemes = []) {
    const allThemes = [mainTheme, ...subThemes];
    const results = [];

    for (const theme of allThemes) {
      const lyrics = await this.generateLyrics(theme, null, { quantity: 1 });
      results.push(...lyrics);
    }

    return results;
  }

  /**
   * 응답 파싱 (한글/영어 분리 버전)
   */
  parseLyricsResponse(response, titleCount = 3) {
    // 한글 가사 추출
    const lyricsKoMatch = response.match(/\[LYRICS_KO\]([\s\S]*?)(?=\[LYRICS_EN\]|\[SUGGESTED_TITLES\]|$)/);
    const lyricsKo = lyricsKoMatch ? lyricsKoMatch[1].trim() : '';
    
    // 영어 가사 추출
    const lyricsEnMatch = response.match(/\[LYRICS_EN\]([\s\S]*?)(?=\[SUGGESTED_TITLES\]|$)/);
    const lyricsEn = lyricsEnMatch ? lyricsEnMatch[1].trim() : '';
    
    // 제목 추출 (두 가지 형식 지원)
    // 형식 1: [SUGGESTED_TITLES]
    let titlesMatch = response.match(/\[SUGGESTED_TITLES\]([\s\S]*?)$/);
    // 형식 2: ### 제목 제안
    if (!titlesMatch) {
      titlesMatch = response.match(/###\s*제목 제안[\s\S]*?\n([\s\S]*?)(?=\n###|$)/);
    }
    
    const titlesSection = titlesMatch ? titlesMatch[1].trim() : '';
    
    const titles = [];
    const titleLines = titlesSection.split('\n');
    
    for (const line of titleLines) {
      // 형식: "1. **제목 / English Title**" 또는 "1. 제목 / English Title"
      const match = line.match(/^\d+\.\s*\*{0,2}(.+?)\*{0,2}$/);
      if (match) {
        titles.push(match[1].trim());
      }
    }
    
    // 최소 titleCount개 보장
    while (titles.length < titleCount) {
      titles.push(`Untitled Song ${titles.length + 1}`);
    }
    
    // 한글/영어 가사 분리 반환
    return {
      lyrics: lyricsKo || response, // 기본값 (하위 호환성)
      lyricsKo: lyricsKo || '[Verse 1]\n가사를 생성하지 못했습니다.',
      lyricsEn: lyricsEn || '[Verse 1]\nFailed to generate lyrics.',
      titles: titles.slice(0, titleCount)
    };
  }
}

/**
 * 장르별 작사 가이드라인 생성
 */
function generateGenreWritingGuidelines(genreInfo) {
  const { genre } = genreInfo;
  const guidelines = [];
  
  // 무드 기반 가이드라인
  if (genre.mood) {
    if (genre.mood.includes('emotional') || genre.mood.includes('sad') || genre.mood.includes('melancholic')) {
      guidelines.push('- 감정이 진하게 드러나는 가사 (구체적 감정 묘사)');
      guidelines.push('- 과거 회상이나 그리움을 담은 스토리');
    }
    if (genre.mood.includes('upbeat') || genre.mood.includes('energetic') || genre.mood.includes('party')) {
      guidelines.push('- 밝고 긍정적인 메시지');
      guidelines.push('- 반복적이고 따라 부르기 쉬운 후렴구');
    }
    if (genre.mood.includes('dark') || genre.mood.includes('aggressive')) {
      guidelines.push('- 강렬하고 도발적인 표현');
      guidelines.push('- 어두운 분위기와 비유적 표현');
    }
    if (genre.mood.includes('romantic') || genre.mood.includes('love')) {
      guidelines.push('- 로맨틱한 감정 표현');
      guidelines.push('- 사랑의 순간을 구체적으로 묘사');
    }
  }
  
  // BPM 기반 가이드라인
  const bpm = genreInfo.bpm || genre.bpm.default;
  if (bpm < 90) {
    guidelines.push('- 느린 템포에 맞는 긴 문장과 여유로운 전개');
  } else if (bpm > 140) {
    guidelines.push('- 빠른 템포에 맞는 짧고 강렬한 문장');
  }
  
  // 장르별 특수 가이드라인
  const genreSpecificGuidelines = {
    'k-pop': '- K-POP 특유의 에너지 넘치는 표현과 킬링 파트 강조',
    'trap': '- 트랩 특유의 쿨하고 자신감 있는 태도',
    'ballad': '- 발라드 특유의 깊은 감성과 진솔한 고백',
    'rock': '- 록 특유의 열정과 반항적 정신',
    'hip-hop': '- 힙합 특유의 라임과 스토리텔링',
    'edm': '- EDM 특유의 반복적 훅과 빌드업',
    'jazz': '- 재즈 특유의 세련되고 즉흥적인 표현'
  };
  
  for (const [key, guideline] of Object.entries(genreSpecificGuidelines)) {
    if (genre.id.includes(key) || genre.name.toLowerCase().includes(key)) {
      guidelines.push(guideline);
    }
  }
  
  return guidelines.length > 0 ? guidelines.join('\n') : '- 장르 특성을 살린 자연스러운 가사';
}

module.exports = OpenAIService;
