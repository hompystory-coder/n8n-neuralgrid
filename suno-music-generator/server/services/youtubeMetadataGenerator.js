/**
 * 🎬 유튜브 메타데이터 생성기
 * 
 * 각 곡마다 고유한 유튜브 제목/설명/태그 생성
 * - 제목 앞에 "Playlist" 필수
 * - 스타일 기반 태그 자동 생성
 * - 중복 방지 (수천 개 업로드 대비)
 * - CTR 최적화
 */

const styleParser = require('./styleParser');

class YouTubeMetadataGenerator {
  constructor() {
    // 🎲 제목 템플릿 (모두 "Playlist"로 시작) - 20가지로 확장
    this.titleTemplates = [
      'Playlist | {title} | {mood} {genre} | {bpm} BPM {atmosphere}',
      'Playlist - {title} | {genre} Mix for {purpose} | {year}',
      'Playlist 🎵 {title} | {adjective} {genre} Vibes | {special}',
      'Playlist [{genre}] {title} | {timeOfDay} Music | {feature}',
      'Playlist: {title} - {mood} {genre} Beat | {description}',
      'Playlist | {title} ({genre} Ver.) | {emotion} Sounds | {bpm} BPM',
      'Playlist ✨ {title} | {style} {genre} Collection | {context}',
      'Playlist - {title} | {adjective} {genre} Session | {atmosphere}',
      'Playlist 🌙 {title} | {mood} {genre} Flow | {purpose} Music',
      'Playlist | {title} - {genre} Journey | {feature} | {year}',
      'Playlist 🎧 {title} | {adjective} {bpm} BPM | {timeOfDay} Vibes',
      'Playlist • {title} • {genre} {mood} Mix • {year}',
      'Playlist [{bpm} BPM] {title} | {adjective} {genre} | {purpose}',
      'Playlist: {title} | {timeOfDay} {genre} Selection | {atmosphere}',
      'Playlist 🎶 {title} - {mood} {genre} Edition | {feature}',
      'Playlist | {title} ({year}) | {adjective} {genre} Beats',
      'Playlist ⭐ {title} | {genre} {purpose} Music | {bpm} BPM',
      'Playlist - {title} | {style} {genre} Compilation | {context}',
      'Playlist 💫 {title} | {timeOfDay} {mood} {genre} | {special}',
      'Playlist • {title} • {adjective} {genre} Experience • {year}'
    ];

    // 설명 템플릿 (10가지 스타일)
    this.descriptionStyles = [
      'emotional_storytelling',
      'purpose_focused',
      'trend_reflection',
      'technical_description',
      'mood_expression',
      'lifestyle_connection',
      'time_place_setting',
      'audience_engagement',
      'music_journey',
      'benefit_focused'
    ];

    // 🎨 형용사 풀 (고유성 보장) - 50가지로 확장
    this.adjectives = [
      'Smooth', 'Dreamy', 'Vibrant', 'Mellow', 'Groovy', 
      'Atmospheric', 'Soulful', 'Fresh', 'Cosmic', 'Ethereal',
      'Warm', 'Cool', 'Bright', 'Deep', 'Soft',
      'Rich', 'Pure', 'Dynamic', 'Elegant', 'Funky',
      'Mystical', 'Golden', 'Silver', 'Crystal', 'Velvet',
      'Chill', 'Smooth', 'Serene', 'Peaceful', 'Tranquil',
      'Upbeat', 'Lively', 'Energetic', 'Powerful', 'Bold',
      'Gentle', 'Tender', 'Sweet', 'Lovely', 'Beautiful',
      'Modern', 'Classic', 'Retro', 'Vintage', 'Contemporary',
      'Unique', 'Special', 'Premium', 'Deluxe', 'Supreme'
    ];

    // 🌈 분위기/용도 키워드 - 30가지로 확장
    this.atmospheres = [
      'Chill Beats', 'Study Vibes', 'Cafe Mood', 'Night Drive',
      'Morning Energy', 'Sunset Mood', 'Rainy Day', 'Cozy Night',
      'Urban Vibes', 'Nature Sounds', 'Dreamy Nights', 'Focus Zone',
      'Relaxation Time', 'Creative Flow', 'Midnight Session',
      'Summer Breeze', 'Winter Chill', 'Spring Energy', 'Autumn Vibes',
      'City Lights', 'Beach Waves', 'Mountain Air', 'Forest Walk',
      'Starry Night', 'Golden Hour', 'Blue Hour', 'Magic Moments',
      'Peaceful Mind', 'Happy Mood', 'Deep Thoughts'
    ];

    // 🎯 용도별 키워드 - 25가지로 확장
    this.purposes = [
      'Study', 'Work', 'Sleep', 'Focus', 'Relaxation',
      'Meditation', 'Reading', 'Cooking', 'Exercise', 'Driving',
      'Coffee Time', 'Night Routine', 'Morning Ritual', 'Creative Work',
      'Yoga', 'Walking', 'Running', 'Gaming', 'Drawing',
      'Writing', 'Thinking', 'Dreaming', 'Chilling', 'Dancing', 'Partying'
    ];

    // 이모지 풀
    this.emojis = {
      music: ['🎵', '🎶', '🎧', '🎼', '🎹', '🎸', '🥁'],
      mood: ['✨', '🌙', '☀️', '🌟', '💫', '🌈', '🌸', '🍃'],
      time: ['🌅', '🌄', '🌃', '🌆', '🌇', '🌉'],
      activity: ['📚', '☕', '🏃', '🧘', '💭', '🖋️', '🎨']
    };

    // 태그 생성용 장르별 키워드 맵
    this.genreTagMap = {
      'lo-fi': ['lofi', 'lo-fi hip hop', 'chill beats', 'study music', 'relaxing music'],
      'hip-hop': ['hip hop', 'rap', 'beats', 'urban music', 'hiphop'],
      'r&b': ['rnb', 'r&b', 'soul', 'smooth', 'rhythm and blues'],
      'jazz': ['jazz', 'smooth jazz', 'jazz fusion', 'instrumental jazz'],
      'pop': ['pop music', 'k-pop', 'pop hits', 'mainstream'],
      'electronic': ['edm', 'electronic', 'house', 'techno', 'dance music'],
      'ballad': ['ballad', 'emotional', 'slow song', 'love song'],
      'trap': ['trap', 'trap music', 'bass', 'hard beats'],
      'indie': ['indie', 'indie music', 'alternative', 'indie pop'],
      'rock': ['rock', 'rock music', 'guitar', 'band music']
    };

    // BPM 범위별 태그
    this.bpmTags = {
      slow: ['slow tempo', 'relaxing', 'calm', 'peaceful', 'meditation'],
      mid: ['moderate tempo', 'comfortable', 'easy listening', 'background music'],
      fast: ['upbeat', 'energetic', 'uptempo', 'lively', 'dynamic']
    };

    // 무드별 태그
    this.moodTags = {
      chill: ['chill', 'relax', 'calm', 'peaceful', 'tranquil', 'soothing'],
      energetic: ['energetic', 'upbeat', 'lively', 'active', 'vibrant', 'dynamic'],
      emotional: ['emotional', 'sentimental', 'touching', 'heartfelt', 'deep'],
      romantic: ['romantic', 'love', 'sweet', 'tender', 'intimate'],
      dark: ['dark', 'moody', 'intense', 'atmospheric', 'dramatic'],
      dreamy: ['dreamy', 'ambient', 'ethereal', 'floating', 'cosmic']
    };
  }

  /**
   * 메인 메타데이터 생성 함수
   */
  async generate(songData) {
    const {
      title,           // 곡 제목
      lyrics,          // 가사
      style,           // 스타일 문자열 (예: "lo-fi hip hop, 85 BPM, chill mood")
      genre,           // 장르
      mood,            // 무드
      bpm,             // BPM
      artist = 'Various Artists',
      year = new Date().getFullYear()
    } = songData;

    // 스타일 문자열 파싱
    const parsedStyle = styleParser.parseStyle(style || `${genre}, ${bpm} BPM, ${mood}`);
    
    // styleParser 결과를 우리 형식으로 변환
    const styleInfo = {
      genre: genre || parsedStyle.genreCategory || 'pop',
      mood: mood || (parsedStyle.moods && parsedStyle.moods[0]) || 'chill',
      bpm: bpm || parsedStyle.bpm || 120,
      category: parsedStyle.isHighEnergy ? 'energetic' : (parsedStyle.isCalm ? 'calm' : 'neutral')
    };

    // 🎲 진짜 랜덤 생성 (매번 다른 결과)
    // 고유 ID (제목 기반) + 타임스탬프 + 랜덤값 조합
    const uniqueId = this._generateUniqueId(title);
    const timestamp = Date.now();
    const randomFactor = Math.floor(Math.random() * 10000);
    
    // 템플릿 선택 (타임스탬프 + 랜덤으로 매번 달라짐)
    const templateIndex = (uniqueId + timestamp + randomFactor) % this.titleTemplates.length;
    const descStyleIndex = (uniqueId + timestamp + randomFactor + 3) % this.descriptionStyles.length;

    // 유튜브 제목 생성
    const youtubeTitle = this._generateTitle(
      title, 
      styleInfo, 
      templateIndex,
      year
    );

    // 유튜브 설명 생성
    const youtubeDescription = this._generateDescription(
      title,
      lyrics,
      styleInfo,
      this.descriptionStyles[descStyleIndex],
      year
    );

    // 태그 생성 (스타일 분석 기반)
    const tags = this._generateTags(styleInfo, title, lyrics);

    return {
      title: youtubeTitle,
      description: youtubeDescription,
      tags: tags,
      metadata: {
        templateIndex,
        descriptionStyle: this.descriptionStyles[descStyleIndex],
        uniqueId,
        generatedAt: new Date().toISOString()
      }
    };
  }

  /**
   * 유튜브 제목 생성 (항상 "Playlist"로 시작)
   */
  _generateTitle(title, styleInfo, templateIndex, year) {
    const template = this.titleTemplates[templateIndex];
    
    // 형용사 선택 (고유성 위해 다양하게)
    const adjective = this._selectRandom(this.adjectives, templateIndex);
    const atmosphere = this._selectRandom(this.atmospheres, templateIndex + 1);
    const purpose = this._selectRandom(this.purposes, templateIndex + 2);
    
    // 시간대 키워드 (랜덤 선택)
    const timeOptions = ['Morning', 'Afternoon', 'Evening', 'Night', 'Midnight', 'Dawn', 'Sunrise', 'Sunset'];
    const timeOfDay = timeOptions[Math.floor(Math.random() * timeOptions.length)];
    
    // 특징 키워드 (랜덤 선택)
    const features = [
      'Official Audio',
      'Extended Mix',
      'Playlist Collection',
      'Music Session',
      'Best Collection',
      'Premium Selection',
      'Special Edition',
      'Deluxe Version',
      'Ultimate Mix',
      'Exclusive Release'
    ];
    const feature = features[Math.floor(Math.random() * features.length)];

    // 템플릿 변수 치환
    const youtubeTitle = template
      .replace('{title}', title)
      .replace('{genre}', this._capitalizeGenre(styleInfo.genre))
      .replace('{mood}', this._capitalize(styleInfo.mood))
      .replace('{bpm}', styleInfo.bpm || '120')
      .replace('{adjective}', adjective)
      .replace('{atmosphere}', atmosphere)
      .replace('{purpose}', purpose)
      .replace('{timeOfDay}', timeOfDay)
      .replace('{feature}', feature)
      .replace('{year}', year)
      .replace('{special}', `${styleInfo.bpm || 120} BPM`)
      .replace('{emotion}', this._capitalize(styleInfo.mood))
      .replace('{style}', this._capitalize(styleInfo.category || 'Chill'))
      .replace('{context}', atmosphere)
      .replace('{description}', `${adjective} Vibes`);

    return youtubeTitle;
  }

  /**
   * 유튜브 설명 생성 (🎲 매번 다른 버전 랜덤 선택)
   */
  _generateDescription(title, lyrics, styleInfo, descStyle, year) {
    const emoji = this._getRandomEmoji('mood');
    const musicEmoji = this._getRandomEmoji('music');
    
    // 가사에서 키워드 추출
    const lyricsKeywords = this._extractKeywordsFromLyrics(lyrics);
    
    // 🎲 각 스타일마다 3가지 버전 준비
    const variations = {
      'emotional_storytelling': [
        `${emoji} ${title}

${year}년, 우리의 일상 속 소중한 순간들을 담은 음악입니다.
${this._capitalize(styleInfo.mood)}한 ${this._capitalizeGenre(styleInfo.genre)} 사운드가
당신의 하루에 특별한 감성을 더해줍니다.

${lyricsKeywords.length > 0 ? `이 곡은 ${lyricsKeywords.slice(0, 3).join(', ')}을(를) 테마로 하여
깊은 감성을 전달합니다.` : '음악이 전하는 이야기에 귀 기울여보세요.'}`,
        
        `${emoji} 특별한 순간을 위한 음악

"${title}"

${this._capitalizeGenre(styleInfo.genre)}의 따뜻한 선율이
당신의 감성을 깊이 울립니다.
${styleInfo.bpm || 120} BPM의 ${this._capitalize(styleInfo.mood)}한 리듬과 함께
소중한 시간을 만들어가세요.`,

        `${emoji} ${title} - ${year}

일상에 특별함을 더하는 ${this._capitalizeGenre(styleInfo.genre)} 사운드.
${this._capitalize(styleInfo.mood)}한 분위기 속에서
당신만의 순간을 경험하세요.

${lyricsKeywords.length > 0 ? `${lyricsKeywords.slice(0, 2).join('와 ')}가 어우러진 깊은 감성.` : ''}`
      ],
      
      'purpose_focused': [
        `${musicEmoji} Perfect for Study, Work & Focus

이 ${this._capitalizeGenre(styleInfo.genre)} 플레이리스트는
집중력이 필요한 모든 순간을 위해 제작되었습니다.

${musicEmoji} Ideal for:
• 공부 및 학습
• 업무 및 작업
• 독서 시간
• 창작 활동
• 카페 분위기`,

        `${musicEmoji} 집중력 향상을 위한 음악

${styleInfo.bpm || 120} BPM의 ${this._capitalizeGenre(styleInfo.genre)} 사운드로
생산성을 극대화하세요.

✅ 이런 분들께 추천:
- 시험 준비 중인 학생
- 마감이 있는 직장인
- 창의적인 작업이 필요한 분
- 조용한 카페 분위기를 원하는 분`,

        `${musicEmoji} ${this._capitalizeGenre(styleInfo.genre)} for Productivity

집중이 필요한 순간, 이 음악과 함께하세요.
${this._capitalize(styleInfo.mood)}한 분위기가
당신의 효율을 높여줍니다.

🎯 Perfect for: Study • Work • Focus • Reading`
      ],
      
      'trend_reflection': [
        `${emoji} ${year} Trending Music

지금 가장 핫한 ${this._capitalizeGenre(styleInfo.genre)} 사운드!
최신 트렌드를 반영한 ${styleInfo.bpm || 120} BPM의 ${this._capitalize(styleInfo.mood)} 비트.

#${year}트렌드 #${styleInfo.genre} #인기음악`,

        `${emoji} 지금 뜨는 음악 🔥

${year}년 최신 ${this._capitalizeGenre(styleInfo.genre)} 트렌드!
${this._capitalize(styleInfo.mood)}한 바이브로
당신의 플레이리스트를 업데이트하세요.

#trending #${styleInfo.genre} #${year}music`,

        `${emoji} ${year} Must-Listen

트렌디한 ${this._capitalizeGenre(styleInfo.genre)} 사운드로
최신 음악 감성을 경험하세요.
${styleInfo.bpm || 120} BPM • ${this._capitalize(styleInfo.mood)} Vibes

🔥 #HotNow #${styleInfo.genre}Trend`
      ],
      
      'technical_description': [
        `${musicEmoji} Technical Details

Genre: ${this._capitalizeGenre(styleInfo.genre)}
BPM: ${styleInfo.bpm || 120}
Mood: ${this._capitalize(styleInfo.mood)}
Style: ${this._capitalize(styleInfo.category || 'Modern')}

${this._getInstrumentsDescription(styleInfo)}

Professional ${this._capitalizeGenre(styleInfo.genre)} production with carefully crafted sound design.`,

        `${musicEmoji} Production Info

🎹 Genre: ${this._capitalizeGenre(styleInfo.genre)}
⏱️ Tempo: ${styleInfo.bpm || 120} BPM
🎨 Mood: ${this._capitalize(styleInfo.mood)}

${this._getInstrumentsDescription(styleInfo)}

High-quality audio engineering with attention to detail.`,

        `${musicEmoji} Audio Specifications

Style: ${this._capitalizeGenre(styleInfo.genre)}
Rhythm: ${styleInfo.bpm || 120} BPM
Atmosphere: ${this._capitalize(styleInfo.mood)}

${this._getInstrumentsDescription(styleInfo)}

Professionally mixed and mastered for optimal listening experience.`
      ],
      
      'mood_expression': [
        `${emoji} ${this._capitalize(styleInfo.mood)} Vibes Only

"${title}"

이 곡이 전하는 ${this._capitalize(styleInfo.mood)}한 분위기 속에서
일상의 특별한 순간을 경험하세요.

${styleInfo.bpm || 120} BPM의 완벽한 템포로
당신의 감성을 자극합니다.`,

        `${emoji} ${this._capitalize(styleInfo.mood)} 감성 충전

"${title}"

${this._capitalizeGenre(styleInfo.genre)}의 ${this._capitalize(styleInfo.mood)}한 에너지가
당신의 하루를 채웁니다.

${musicEmoji} ${styleInfo.bpm || 120} BPM • ${this._capitalize(styleInfo.category || 'Modern')} Style`,

        `${emoji} Feel the ${this._capitalize(styleInfo.mood)} Energy

${this._capitalizeGenre(styleInfo.genre)} 사운드로 표현되는
${this._capitalize(styleInfo.mood)}한 순간들.

"${title}"

${styleInfo.bpm || 120} BPM의 완벽한 그루브 🎵`
      ]
    };

    // 🎲 랜덤으로 버전 선택
    const styleVariations = variations[descStyle] || [
      `${emoji} ${title}

${this._capitalizeGenre(styleInfo.genre)} 사운드로 만나는 일상의 여유.
${styleInfo.bpm || 120} BPM의 ${this._capitalize(styleInfo.mood)}한 리듬이
당신의 라이프스타일에 완벽하게 어울립니다.

${musicEmoji} 추천 청취 시간:
• 아침 루틴
• 출퇴근길
• 카페 타임
• 휴식 시간
• 취침 전`,

      `${emoji} Lifestyle Music

"${title}"

${this._capitalize(styleInfo.mood)}한 ${this._capitalizeGenre(styleInfo.genre)} 비트로
하루의 모든 순간을 특별하게.

${musicEmoji} Best Moments:
Morning • Commute • Cafe • Relax • Sleep`,

      `${emoji} ${this._capitalizeGenre(styleInfo.genre)} for Daily Life

${styleInfo.bpm || 120} BPM의 ${this._capitalize(styleInfo.mood)}한 사운드가
당신의 일상에 완벽한 BGM이 됩니다.

"${title}"

${musicEmoji} 언제 어디서나 함께하세요`
    ];

    const description = styleVariations[Math.floor(Math.random() * styleVariations.length)];

    // 공통 푸터 추가
    description += `

━━━━━━━━━━━━━━━━━━━
${musicEmoji} More Playlists
━━━━━━━━━━━━━━━━━━━
구독하고 매주 새로운 음악을 만나보세요!

#${styleInfo.genre} #${styleInfo.mood} #playlist #music${year}`;

    return description;
  }

  /**
   * 태그 생성 (스타일 분석 기반)
   */
  _generateTags(styleInfo, title, lyrics) {
    const tags = new Set();

    // 1. 기본 태그
    tags.add('playlist');
    tags.add('music');
    tags.add(`${new Date().getFullYear()}`);

    // 2. 장르 기반 태그
    const genre = styleInfo.genre.toLowerCase();
    if (this.genreTagMap[genre]) {
      this.genreTagMap[genre].forEach(tag => tags.add(tag));
    } else {
      tags.add(genre);
      tags.add(`${genre} music`);
    }

    // 3. BPM 범위 기반 태그
    const bpm = styleInfo.bpm || 120;
    let bpmCategory = 'mid';
    if (bpm < 90) bpmCategory = 'slow';
    else if (bpm > 120) bpmCategory = 'fast';
    
    this.bpmTags[bpmCategory].forEach(tag => tags.add(tag));

    // 4. 무드 기반 태그
    const mood = styleInfo.mood.toLowerCase();
    if (this.moodTags[mood]) {
      this.moodTags[mood].forEach(tag => tags.add(tag));
    }

    // 5. 카테고리 기반 태그
    if (styleInfo.category === 'energetic') {
      tags.add('workout music');
      tags.add('exercise');
      tags.add('gym music');
    } else if (styleInfo.category === 'calm') {
      tags.add('study music');
      tags.add('focus music');
      tags.add('background music');
    }

    // 6. 용도별 태그
    const purposes = ['study', 'work', 'sleep', 'relax', 'focus', 'cafe', 'coffee'];
    purposes.forEach(purpose => {
      if (mood.includes(purpose) || genre.includes(purpose)) {
        tags.add(`${purpose} music`);
      }
    });

    // 7. 가사에서 키워드 추출
    const lyricsKeywords = this._extractKeywordsFromLyrics(lyrics);
    lyricsKeywords.slice(0, 3).forEach(keyword => {
      if (keyword.length > 2) {
        tags.add(keyword);
      }
    });

    // 8. 한글 태그 추가
    const koreanGenres = {
      'lo-fi': '로파이',
      'hip-hop': '힙합',
      'r&b': '알앤비',
      'ballad': '발라드',
      'jazz': '재즈',
      'pop': '팝',
      'rock': '록'
    };
    if (koreanGenres[genre]) {
      tags.add(koreanGenres[genre]);
    }

    // 9. 공통 인기 태그
    const popularTags = [
      'instrumental',
      'beats',
      'chill vibes',
      'mood music',
      'playlist compilation'
    ];
    popularTags.slice(0, 3).forEach(tag => tags.add(tag));

    // 최대 25개로 제한 (유튜브 권장)
    return Array.from(tags).slice(0, 25);
  }

  /**
   * 가사에서 키워드 추출
   */
  _extractKeywordsFromLyrics(lyrics) {
    if (!lyrics) return [];

    // 간단한 키워드 추출 (명사 위주)
    const keywords = lyrics
      .toLowerCase()
      .replace(/[^\w\sㄱ-ㅎㅏ-ㅣ가-힣]/g, ' ')
      .split(/\s+/)
      .filter(word => word.length > 2 && word.length < 10)
      .filter(word => !['the', 'and', 'for', 'with', 'that', 'this'].includes(word));

    // 빈도수 계산
    const frequency = {};
    keywords.forEach(word => {
      frequency[word] = (frequency[word] || 0) + 1;
    });

    // 빈도순 정렬 후 상위 5개
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([word]) => word);
  }

  /**
   * 악기 설명 생성
   */
  _getInstrumentsDescription(styleInfo) {
    const instruments = {
      'lo-fi': 'Rhodes Piano, Jazz Guitar, Vinyl Crackle, 808 Bass',
      'hip-hop': '808 Drums, Hi-Hats, Snare, Bass',
      'r&b': 'Electric Piano, Bass Guitar, Smooth Drums',
      'jazz': 'Piano, Saxophone, Double Bass, Brush Drums',
      'electronic': 'Synthesizer, Pad, Bass, Electronic Drums'
    };

    const genre = styleInfo.genre.toLowerCase();
    return instruments[genre] 
      ? `Instruments: ${instruments[genre]}`
      : `Genre: ${this._capitalizeGenre(styleInfo.genre)}`;
  }

  /**
   * 고유 ID 생성 (제목 해시)
   */
  _generateUniqueId(title) {
    let hash = 0;
    for (let i = 0; i < title.length; i++) {
      const char = title.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
  }

  /**
   * 배열에서 랜덤 선택 (진짜 랜덤)
   */
  _selectRandom(arr, seed) {
    // seed는 기본 다양성을 위해 사용하되, 랜덤 요소 추가
    const randomOffset = Math.floor(Math.random() * arr.length);
    return arr[(seed + randomOffset) % arr.length];
  }

  /**
   * 랜덤 이모지 선택
   */
  _getRandomEmoji(category) {
    const emojis = this.emojis[category] || this.emojis.music;
    return emojis[Math.floor(Math.random() * emojis.length)];
  }

  /**
   * 첫 글자 대문자
   */
  _capitalize(str) {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
  }

  /**
   * 장르 대문자 처리
   */
  _capitalizeGenre(genre) {
    if (!genre) return 'Music';
    
    const specialCases = {
      'lo-fi': 'Lo-Fi',
      'r&b': 'R&B',
      'hip-hop': 'Hip Hop',
      'k-pop': 'K-Pop',
      'edm': 'EDM'
    };

    const lower = genre.toLowerCase();
    return specialCases[lower] || this._capitalize(genre);
  }
}

module.exports = new YouTubeMetadataGenerator();
