/**
 * 🦔 블루 고슴도치 캐릭터 기반 썸네일 프롬프트 생성기
 * 
 * 힙합/로파이 음악 채널을 위한 일관된 캐릭터 썸네일 시스템
 */

class ThumbnailPromptGenerator {
  constructor() {
    // 🦔 메인 캐릭터 정의
    this.character = {
      name: 'Blue Hedgehog',
      base: 'A cute chubby blue hedgehog character',
      personality: 'calm, focused, and friendly',
      features: 'soft blue spikes, big friendly eyes, gentle smile'
    };

    // 👔 의상 스타일
    this.outfits = {
      casual: 'wearing cozy beanie and chunky headphones',
      study: 'wearing beanie and headphones',
      work: 'wearing hoodie and headphones',
      street: 'wearing casual streetwear and headphones',
      cafe: 'wearing denim jacket and headphones',
      cozy: 'wearing cozy sweater and headphones',
      professional: 'wearing beanie, scarf and headphones'
    };

    // 🎭 시나리오 템플릿 (음악 장르별)
    this.scenarios = {
      lofi_study: {
        name: 'Late Night Study',
        outfit: 'study',
        setting: 'sitting at a cozy desk by a rainy window at night',
        elements: 'Warm desk lamp lighting, laptop open, steaming coffee cup, potted plant, books stacked. Rain drops on window with blurred city lights outside',
        mood: 'peaceful studying vibe',
        colors: 'Warm orange and blue color scheme, soft atmospheric lighting',
        activity: 'focused on the laptop screen',
        extras: 'Lofi aesthetic with vinyl records and speakers visible'
      },
      
      hip_hop_production: {
        name: 'Hip Hop Production',
        outfit: 'work',
        setting: 'sitting at a music production studio setup with dual monitors, MIDI keyboard, and audio interface',
        elements: 'Neon purple and blue lighting, LED strips on walls, urban studio atmosphere. Hip hop aesthetic with posters and speakers in background, nighttime city view through window',
        mood: 'energetic but focused mood',
        colors: 'Neon purple and blue lighting',
        activity: 'adjusting knobs on equipment with focused expression',
        extras: 'Professional producer vibe'
      },

      morning_chill: {
        name: 'Morning Chill',
        outfit: 'cozy',
        setting: 'sitting on a balcony with coffee cup during sunrise',
        elements: 'Golden morning light, city skyline in background, plants and flowers around. Bird flying in sky, clouds with orange glow',
        mood: 'inspiring and peaceful mood',
        colors: 'Warm golden and soft blue color palette, fresh morning atmosphere',
        activity: 'looks peaceful and content with eyes gently closed, enjoying the music and sunrise',
        extras: 'Fresh morning atmosphere'
      },

      night_drive: {
        name: 'Late Night Groove',
        outfit: 'street',
        setting: 'sitting in a car driver seat at night with dashboard lights glowing',
        elements: 'Neon city lights outside window, purple and orange street lights reflecting. Rearview mirror showing city lights, cozy car interior with warm ambient lighting',
        mood: 'cool and laid-back mood',
        colors: 'Purple and orange street lights, urban nighttime atmosphere',
        activity: 'has a relaxed expression, one hand on steering wheel',
        extras: 'Night drive aesthetic'
      },

      cafe_jazz: {
        name: 'Cafe Jazz',
        outfit: 'cafe',
        setting: 'sitting at a wooden cafe table with latte art coffee, croissant, and open notebook',
        elements: 'Warm afternoon sunlight streaming through large windows, blurred cafe interior background with plants and bookshelves',
        mood: 'relaxed creative mood',
        colors: 'Warm brown and cream tones with soft blue accents',
        activity: 'writing in the notebook with a gentle smile',
        extras: 'Cozy cafe atmosphere, vintage aesthetic with film photography feel'
      },

      // 🆕 추가 시나리오들
      
      sunset_rooftop: {
        name: 'Sunset Vibes',
        outfit: 'casual',
        setting: 'sitting on a rooftop terrace with city view during golden hour',
        elements: 'Sunset sky with orange and pink clouds, string lights overhead, plants and cushions around. City buildings in distance',
        mood: 'dreamy and contemplative mood',
        colors: 'Warm sunset orange and purple tones',
        activity: 'lying back on cushions with eyes closed, peaceful expression',
        extras: 'Golden hour aesthetic, urban rooftop vibe'
      },

      library_study: {
        name: 'Library Focus',
        outfit: 'professional',
        setting: 'sitting at a wooden desk in a quiet library with tall bookshelves',
        elements: 'Warm reading lamp, stacks of books, vintage library atmosphere. Large windows with soft natural light',
        mood: 'concentrated and scholarly mood',
        colors: 'Warm brown wood tones with soft golden lighting',
        activity: 'reading a book with focused expression',
        extras: 'Classic library aesthetic, academic vibe'
      },

      bedroom_chill: {
        name: 'Bedroom Lofi',
        outfit: 'cozy',
        setting: 'lying on bed with pillows in a cozy bedroom at night',
        elements: 'Fairy lights on wall, posters, small desk with laptop in background. Window showing night sky with moon',
        mood: 'super relaxed and sleepy mood',
        colors: 'Soft purple and blue ambient lighting',
        activity: 'relaxing with phone, peaceful sleepy expression',
        extras: 'Cozy bedroom aesthetic, late night vibes'
      },

      train_commute: {
        name: 'Train Journey',
        outfit: 'casual',
        setting: 'sitting by train window with scenic countryside or city passing by',
        elements: 'Train interior, window seat, backpack beside. Blurred scenery outside window, soft interior lighting',
        mood: 'contemplative travel mood',
        colors: 'Warm interior lights with cool blue exterior views',
        activity: 'gazing out window with thoughtful expression',
        extras: 'Travel aesthetic, commuter vibe'
      },

      rain_window: {
        name: 'Rainy Day',
        outfit: 'cozy',
        setting: 'sitting by large window with heavy rain outside',
        elements: 'Rain streaming down window, blurred grey cityscape. Warm blanket, hot tea cup, candles lit inside',
        mood: 'cozy and melancholic mood',
        colors: 'Cool grey and blue tones outside, warm orange candlelight inside',
        activity: 'watching rain with calm expression, holding tea cup',
        extras: 'Rainy day aesthetic, hygge vibes'
      },

      park_bench: {
        name: 'Park Afternoon',
        outfit: 'casual',
        setting: 'sitting on park bench under a tree',
        elements: 'Green grass, trees with leaves, people walking in background. Sunshine filtering through leaves, birds nearby',
        mood: 'peaceful outdoor mood',
        colors: 'Fresh green and warm sunlight colors',
        activity: 'relaxing on bench with coffee, enjoying nature',
        extras: 'Outdoor nature aesthetic, spring/summer vibes'
      },

      vinyl_shop: {
        name: 'Record Store',
        outfit: 'cafe',
        setting: 'browsing vinyl records in a vintage record store',
        elements: 'Wooden crates full of records, posters on walls, vintage turntable on counter. Warm vintage lighting',
        mood: 'nostalgic and discovery mood',
        colors: 'Warm amber and brown vintage tones',
        activity: 'flipping through records with interested expression',
        extras: 'Vintage record store aesthetic, music lover vibe'
      },

      beach_sunset: {
        name: 'Beach Chill',
        outfit: 'casual',
        setting: 'sitting on beach during sunset with ocean view',
        elements: 'Sand, ocean waves, palm trees, sunset colors in sky. Beach towel, cooler nearby',
        mood: 'ultimate relaxation mood',
        colors: 'Warm orange sunset and turquoise ocean colors',
        activity: 'sitting cross-legged on sand, watching sunset peacefully',
        extras: 'Beach vacation aesthetic, summer vibes'
      },

      winter_cabin: {
        name: 'Winter Cozy',
        outfit: 'cozy',
        setting: 'sitting by fireplace in a wooden cabin with snow outside window',
        elements: 'Stone fireplace with fire, wooden interior, snow-covered trees visible through window. Thick blanket, hot chocolate',
        mood: 'warm and cozy winter mood',
        colors: 'Warm orange firelight with cool blue winter tones outside',
        activity: 'wrapped in blanket by fire with content expression',
        extras: 'Winter cabin aesthetic, hygge vibes'
      },

      city_night: {
        name: 'City Nightscape',
        outfit: 'street',
        setting: 'standing on city street at night with neon signs and lights',
        elements: 'Neon signs, busy street lights, skyscrapers in background. Rain-wet pavement reflecting lights',
        mood: 'urban nightlife mood',
        colors: 'Neon pink, purple, and blue lighting',
        activity: 'walking with hands in pockets, looking at city lights',
        extras: 'Cyberpunk aesthetic, urban night vibes'
      }
    };

    // 🎵 음악 장르 → 시나리오 매핑
    this.genreMapping = {
      'lofi': ['lofi_study', 'bedroom_chill', 'rain_window', 'cafe_jazz'],
      'lo-fi': ['lofi_study', 'bedroom_chill', 'rain_window', 'cafe_jazz'],
      'study': ['lofi_study', 'library_study', 'cafe_jazz'],
      'chill': ['morning_chill', 'sunset_rooftop', 'beach_sunset', 'park_bench'],
      'hip hop': ['hip_hop_production', 'city_night', 'night_drive'],
      'hip-hop': ['hip_hop_production', 'city_night', 'night_drive'],
      'hiphop': ['hip_hop_production', 'city_night', 'night_drive'],
      'beats': ['hip_hop_production', 'bedroom_chill', 'night_drive'],
      'jazz': ['cafe_jazz', 'vinyl_shop', 'sunset_rooftop'],
      'groove': ['night_drive', 'city_night', 'cafe_jazz'],
      'ambient': ['rain_window', 'winter_cabin', 'sunset_rooftop'],
      'sleep': ['bedroom_chill', 'rain_window', 'winter_cabin'],
      'morning': ['morning_chill', 'cafe_jazz', 'park_bench'],
      'night': ['night_drive', 'city_night', 'bedroom_chill'],
      'travel': ['train_commute', 'night_drive', 'beach_sunset'],
      'work': ['lofi_study', 'cafe_jazz', 'library_study'],
      'workout': ['morning_chill', 'park_bench', 'city_night'],
      'party': ['city_night', 'night_drive', 'hip_hop_production']
    };
  }

  /**
   * 메인 프롬프트 생성 함수
   * @param {Object} options - 생성 옵션
   * @param {string} options.genre - 음악 장르 (예: 'lofi', 'hip hop', 'jazz')
   * @param {string} options.mood - 분위기 (예: 'chill', 'energetic', 'peaceful')
   * @param {string} options.timeOfDay - 시간대 (예: 'morning', 'night', 'afternoon')
   * @param {string} options.scenario - 직접 시나리오 지정 (선택적)
   * @returns {string} DALL-E용 프롬프트
   */
  generate(options = {}) {
    const { genre, mood, timeOfDay, scenario } = options;

    // 시나리오 선택
    let selectedScenario;
    if (scenario && this.scenarios[scenario]) {
      // 직접 지정된 시나리오 사용
      selectedScenario = this.scenarios[scenario];
    } else {
      // 장르 기반으로 시나리오 선택
      selectedScenario = this._selectScenarioByGenre(genre, mood, timeOfDay);
    }

    // 프롬프트 조합
    const prompt = this._buildPrompt(selectedScenario);

    return prompt;
  }

  /**
   * 장르/무드/시간대 기반 시나리오 선택
   */
  _selectScenarioByGenre(genre, mood, timeOfDay) {
    let candidates = [];

    // 1. 장르 기반 필터링
    if (genre) {
      const genreKey = genre.toLowerCase().trim();
      if (this.genreMapping[genreKey]) {
        candidates = this.genreMapping[genreKey].map(key => this.scenarios[key]);
      }
    }

    // 2. 시간대 기반 필터링
    if (timeOfDay && candidates.length > 0) {
      const timeKey = timeOfDay.toLowerCase();
      if (timeKey.includes('morning') || timeKey.includes('sunrise')) {
        candidates = candidates.filter(s => 
          s.name.includes('Morning') || s.name.includes('Cafe')
        );
      } else if (timeKey.includes('night') || timeKey.includes('evening')) {
        candidates = candidates.filter(s => 
          s.name.includes('Night') || s.name.includes('Late') || s.name.includes('City')
        );
      }
    }

    // 3. 무드 기반 필터링 (선택적)
    if (mood && candidates.length > 1) {
      const moodKey = mood.toLowerCase();
      if (moodKey.includes('study') || moodKey.includes('focus')) {
        candidates = candidates.filter(s => 
          s.name.includes('Study') || s.name.includes('Library') || s.name.includes('Focus')
        );
      }
    }

    // 4. 후보가 없으면 기본 시나리오들 사용
    if (candidates.length === 0) {
      candidates = [
        this.scenarios.lofi_study,
        this.scenarios.cafe_jazz,
        this.scenarios.morning_chill
      ];
    }

    // 5. 랜덤 선택 (다양성 확보)
    const randomIndex = Math.floor(Math.random() * candidates.length);
    return candidates[randomIndex];
  }

  /**
   * 프롬프트 조합 생성
   */
  _buildPrompt(scenario) {
    const outfit = this.outfits[scenario.outfit] || this.outfits.casual;

    const prompt = `YouTube thumbnail for ${scenario.name.toLowerCase()} music. ${this.character.base} ${outfit}, ${scenario.setting}. ${scenario.elements}. ${scenario.colors}, ${scenario.mood}. The hedgehog ${scenario.activity}. ${scenario.extras}. 1280x720px, professional YouTube thumbnail style`;

    return prompt;
  }

  /**
   * 모든 시나리오 목록 반환
   */
  getAllScenarios() {
    return Object.keys(this.scenarios).map(key => ({
      key,
      name: this.scenarios[key].name,
      description: this.scenarios[key].setting
    }));
  }

  /**
   * 특정 장르의 추천 시나리오들 반환
   */
  getRecommendedScenariosForGenre(genre) {
    const genreKey = genre.toLowerCase().trim();
    const scenarioKeys = this.genreMapping[genreKey] || [];
    
    return scenarioKeys.map(key => ({
      key,
      name: this.scenarios[key].name,
      description: this.scenarios[key].setting
    }));
  }

  /**
   * 배치 생성: 여러 변형 프롬프트 생성
   */
  generateBatch(options = {}, count = 5) {
    const prompts = [];
    const { genre, mood, timeOfDay } = options;

    // 장르 기반 후보 시나리오들 가져오기
    let scenarioKeys = [];
    if (genre) {
      const genreKey = genre.toLowerCase().trim();
      scenarioKeys = this.genreMapping[genreKey] || Object.keys(this.scenarios);
    } else {
      scenarioKeys = Object.keys(this.scenarios);
    }

    // count만큼 다른 시나리오 선택
    const shuffled = [...scenarioKeys].sort(() => Math.random() - 0.5);
    const selected = shuffled.slice(0, Math.min(count, shuffled.length));

    for (const key of selected) {
      const scenario = this.scenarios[key];
      const prompt = this._buildPrompt(scenario);
      prompts.push({
        scenario: key,
        name: scenario.name,
        prompt
      });
    }

    return prompts;
  }

  /**
   * 시나리오 통계 정보
   */
  getStats() {
    return {
      totalScenarios: Object.keys(this.scenarios).length,
      genres: Object.keys(this.genreMapping).length,
      outfits: Object.keys(this.outfits).length,
      character: this.character.name
    };
  }
}

module.exports = new ThumbnailPromptGenerator();
