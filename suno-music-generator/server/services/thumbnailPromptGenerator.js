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

    // 🎭 시나리오 템플릿 (음악 장르별 + 다양한 생활 시나리오)
    this.scenarios = {
      // === 기존 시나리오 ===
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

      // === 🆕 음식/요리 관련 (5개) ===
      cooking_kitchen: {
        name: 'Cooking in Kitchen',
        outfit: 'casual',
        setting: 'standing at kitchen counter cooking, wearing apron over casual clothes',
        elements: 'Bright modern kitchen, ingredients spread out, pots on stove, steam rising. Sunlight through kitchen window, plants on windowsill',
        mood: 'cheerful and creative cooking mood',
        colors: 'Warm kitchen lighting with natural daylight, cozy home atmosphere',
        activity: 'stirring pot with wooden spoon, happy expression',
        extras: 'Home cooking aesthetic, food blogger vibe'
      },

      food_truck_visit: {
        name: 'Food Truck Adventure',
        outfit: 'street',
        setting: 'standing at colorful food truck window ordering food',
        elements: 'Vibrant food truck with neon signs, urban street background, other people in line. Street art on nearby walls',
        mood: 'excited and hungry mood',
        colors: 'Bright daylight with colorful truck graphics',
        activity: 'looking at menu board with excited expression',
        extras: 'Street food culture, urban exploration vibe'
      },

      baking_cookies: {
        name: 'Baking Time',
        outfit: 'cozy',
        setting: 'sitting at kitchen table decorating cookies',
        elements: 'Baking sheets with cookies, icing bags, sprinkles, flour dusted on table. Oven in background, warm kitchen lighting',
        mood: 'focused and sweet mood',
        colors: 'Warm golden kitchen lights, cozy baking atmosphere',
        activity: 'carefully decorating cookie with icing',
        extras: 'Home baking aesthetic, cozy domestic vibe'
      },

      picnic_park: {
        name: 'Park Picnic',
        outfit: 'casual',
        setting: 'sitting on picnic blanket in sunny park with food basket',
        elements: 'Checkered blanket, sandwich, fruits, thermos. Trees and grass around, blue sky, butterflies flying',
        mood: 'relaxed outdoor mood',
        colors: 'Bright natural daylight, fresh green and blue tones',
        activity: 'unpacking picnic basket with happy smile',
        extras: 'Outdoor dining, nature picnic aesthetic'
      },

      restaurant_dining: {
        name: 'Restaurant Night',
        outfit: 'professional',
        setting: 'sitting at elegant restaurant table with candles',
        elements: 'Fancy table setting, wine glass, plated food, soft candlelight. Blurred restaurant interior, other diners in background',
        mood: 'sophisticated and relaxed mood',
        colors: 'Warm ambient restaurant lighting, elegant atmosphere',
        activity: 'enjoying meal with content expression',
        extras: 'Fine dining aesthetic, date night vibe'
      },

      // === 🆕 동물/펫 관련 (5개) ===
      walking_dog: {
        name: 'Dog Walking',
        outfit: 'casual',
        setting: 'walking in park holding dog leash',
        elements: 'Cute dog beside, park path, trees, other people walking. Sunny day, birds in sky',
        mood: 'happy and energetic mood',
        colors: 'Bright daylight with natural park colors',
        activity: 'walking with dog, big happy smile',
        extras: 'Pet owner life, outdoor exercise vibe'
      },

      cat_cafe_visit: {
        name: 'Cat Cafe',
        outfit: 'cafe',
        setting: 'sitting at cat cafe table with cats around',
        elements: 'Cats on table and nearby, coffee cup, cat toys, cat trees in background. Cozy cafe interior',
        mood: 'peaceful and cute mood',
        colors: 'Soft warm cafe lighting, pastel colors',
        activity: 'petting cat while smiling gently',
        extras: 'Cat cafe aesthetic, animal lover vibe'
      },

      pet_grooming: {
        name: 'Pet Care Time',
        outfit: 'cozy',
        setting: 'at home grooming a small pet, surrounded by pet care supplies',
        elements: 'Pet brush, shampoo bottles, towels, bathroom or living room setting. Pet looking happy',
        mood: 'caring and gentle mood',
        colors: 'Soft indoor lighting, clean and bright',
        activity: 'gently brushing pet with loving expression',
        extras: 'Pet care routine, responsible owner vibe'
      },

      aquarium_visit: {
        name: 'Aquarium Wonder',
        outfit: 'casual',
        setting: 'standing in front of large aquarium tank with fish swimming',
        elements: 'Blue aquarium glow, colorful fish, jellyfish, rays. Silhouettes of other visitors. Underwater atmosphere',
        mood: 'mesmerized and peaceful mood',
        colors: 'Blue aquarium lighting, mysterious underwater ambiance',
        activity: 'watching fish with amazed expression, hand on glass',
        extras: 'Aquarium visit aesthetic, marine life wonder'
      },

      bird_watching: {
        name: 'Bird Watching',
        outfit: 'casual',
        setting: 'sitting on park bench with binoculars looking at birds',
        elements: 'Bird feeder nearby, birds flying and perching, nature notebook open. Trees and greenery around',
        mood: 'curious and patient mood',
        colors: 'Natural outdoor lighting, fresh morning atmosphere',
        activity: 'looking through binoculars with focused expression',
        extras: 'Nature observation, birding hobby vibe'
      },

      // === 🆕 운동/활동 (5개) ===
      yoga_morning: {
        name: 'Morning Yoga',
        outfit: 'cozy',
        setting: 'on yoga mat in sunrise position on balcony or room',
        elements: 'Yoga mat, plants around, sunrise through window, candles, incense. Peaceful home setting',
        mood: 'zen and balanced mood',
        colors: 'Soft golden sunrise light, calm pastels',
        activity: 'in yoga pose with eyes closed, serene expression',
        extras: 'Wellness routine, mindfulness aesthetic'
      },

      jogging_park: {
        name: 'Morning Jog',
        outfit: 'street',
        setting: 'jogging on park path with earbuds in',
        elements: 'Park trail, trees, morning mist, sun rays through trees. Other joggers in distance',
        mood: 'energetic and determined mood',
        colors: 'Fresh morning light, natural green tones',
        activity: 'jogging with focused determined expression',
        extras: 'Fitness routine, active lifestyle vibe'
      },

      gym_workout: {
        name: 'Gym Session',
        outfit: 'work',
        setting: 'at gym with workout equipment around',
        elements: 'Dumbbells, weight racks, mirrors, gym equipment. Bright gym lighting, motivational posters',
        mood: 'strong and motivated mood',
        colors: 'Bright gym lighting, energetic atmosphere',
        activity: 'lifting weights with determined expression',
        extras: 'Fitness dedication, workout motivation'
      },

      cycling_city: {
        name: 'City Cycling',
        outfit: 'casual',
        setting: 'riding bicycle on city bike lane',
        elements: 'Bicycle, city buildings, bike lane markings, traffic lights. Other cyclists and pedestrians',
        mood: 'free and adventurous mood',
        colors: 'Bright daylight, urban colors',
        activity: 'cycling with wind in face, happy expression',
        extras: 'Eco-friendly transport, city exploration'
      },

      skateboarding: {
        name: 'Skate Session',
        outfit: 'street',
        setting: 'skateboarding at skate park',
        elements: 'Skateboard ramps, graffiti walls, other skaters. Urban skate park, afternoon sun',
        mood: 'cool and confident mood',
        colors: 'Bright outdoor lighting, urban gritty aesthetic',
        activity: 'riding skateboard with focused cool expression',
        extras: 'Skate culture, street sports vibe'
      },

      // === 🆕 여행/장소 (5개) ===
      airport_departure: {
        name: 'Airport Adventure',
        outfit: 'casual',
        setting: 'sitting at airport gate with backpack and boarding pass',
        elements: 'Airport terminal, departure boards, airplanes visible through window. Other travelers around',
        mood: 'excited travel mood',
        colors: 'Bright airport lighting, modern terminal atmosphere',
        activity: 'looking at boarding pass with excited expression',
        extras: 'Travel beginning, adventure awaits vibe'
      },

      beach_sunset: {
        name: 'Beach Sunset',
        outfit: 'casual',
        setting: 'sitting on beach sand during sunset',
        elements: 'Ocean waves, sunset sky, beach chair, surfboard nearby. Seagulls flying, palm trees silhouette',
        mood: 'peaceful beach mood',
        colors: 'Warm sunset orange and purple sky, cool blue ocean',
        activity: 'watching sunset with peaceful expression',
        extras: 'Beach vacation, tropical paradise vibe'
      },

      mountain_hiking: {
        name: 'Mountain Summit',
        outfit: 'casual',
        setting: 'standing on mountain peak with hiking gear',
        elements: 'Mountain vista, clouds below, hiking backpack, walking stick. Epic landscape view',
        mood: 'accomplished and refreshed mood',
        colors: 'Clear blue sky, dramatic mountain lighting',
        activity: 'arms spread wide celebrating, victorious expression',
        extras: 'Hiking achievement, nature conquest'
      },

      cherry_blossom: {
        name: 'Cherry Blossom Walk',
        outfit: 'casual',
        setting: 'walking under cherry blossom trees in full bloom',
        elements: 'Pink cherry blossom petals falling, tree-lined path, spring atmosphere. Other people enjoying blossoms',
        mood: 'romantic spring mood',
        colors: 'Soft pink blossoms, fresh spring lighting',
        activity: 'looking up at blossoms with wonder, petals in air',
        extras: 'Spring festival, hanami aesthetic'
      },

      city_night_walk: {
        name: 'Night City Walk',
        outfit: 'street',
        setting: 'walking on busy city street at night',
        elements: 'Neon signs, street lights, shops, crowds. Reflections on wet pavement, urban energy',
        mood: 'mysterious urban mood',
        colors: 'Neon lights reflecting, vibrant night city',
        activity: 'walking with hands in pockets, cool confident walk',
        extras: 'Urban exploration, night life vibe'
      },

      // === 🆕 취미/문화 (5개) ===
      bookstore_browse: {
        name: 'Bookstore Visit',
        outfit: 'professional',
        setting: 'browsing books in cozy bookstore',
        elements: 'Tall bookshelves, stacks of books, reading nooks, warm lighting. Other book lovers browsing',
        mood: 'curious and intellectual mood',
        colors: 'Warm bookstore lighting, cozy literary atmosphere',
        activity: 'reading book cover with interested expression',
        extras: 'Book lover, literary culture vibe'
      },

      art_gallery: {
        name: 'Gallery Viewing',
        outfit: 'professional',
        setting: 'standing in modern art gallery looking at paintings',
        elements: 'White gallery walls, framed artworks, sculptures, spotlights. Polished floors reflecting',
        mood: 'contemplative art appreciation mood',
        colors: 'Clean white gallery space, focused artwork lighting',
        activity: 'studying artwork with thoughtful expression',
        extras: 'Art appreciation, cultural sophistication'
      },

      gaming_setup: {
        name: 'Gaming Session',
        outfit: 'work',
        setting: 'sitting at gaming desk with RGB setup',
        elements: 'Gaming PC with RGB lights, dual monitors, gaming keyboard and mouse, LED strips. Gaming chair',
        mood: 'focused gaming mood',
        colors: 'RGB rainbow lighting, dark room with colorful accents',
        activity: 'intensely focused on game, hands on controls',
        extras: 'Gamer lifestyle, esports aesthetic'
      },

      photography_city: {
        name: 'Street Photography',
        outfit: 'casual',
        setting: 'holding camera taking photos on city street',
        elements: 'Professional camera, camera bag, interesting urban architecture. Golden hour lighting',
        mood: 'creative photographer mood',
        colors: 'Golden hour street lighting, artistic atmosphere',
        activity: 'looking through camera viewfinder, focused expression',
        extras: 'Photography hobby, creative pursuit'
      },

      record_store: {
        name: 'Vinyl Shopping',
        outfit: 'casual',
        setting: 'browsing vinyl records in record store',
        elements: 'Record bins, posters on walls, turntable display, vintage aesthetic. Warm store lighting',
        mood: 'nostalgic music lover mood',
        colors: 'Warm vintage store lighting, retro colors',
        activity: 'flipping through vinyl records with excited expression',
        extras: 'Music collector, vinyl culture vibe'
      },

      // === 🆕 사회/일상 (5개) ===
      video_call_work: {
        name: 'Remote Meeting',
        outfit: 'professional',
        setting: 'at home desk on video call meeting',
        elements: 'Laptop with video call interface, clean background with plants, professional home setup',
        mood: 'professional work mood',
        colors: 'Natural window lighting, clean modern workspace',
        activity: 'speaking to camera with professional smile',
        extras: 'Remote work life, work from home'
      },

      shopping_mall: {
        name: 'Mall Shopping',
        outfit: 'casual',
        setting: 'walking in shopping mall with shopping bags',
        elements: 'Modern mall interior, store fronts, shopping bags in hand. Other shoppers around',
        mood: 'happy shopping mood',
        colors: 'Bright mall lighting, commercial atmosphere',
        activity: 'looking at store windows with excited expression',
        extras: 'Retail therapy, shopping spree vibe'
      },

      laundromat_wait: {
        name: 'Laundromat Chill',
        outfit: 'cozy',
        setting: 'sitting at laundromat with phone while waiting',
        elements: 'Washing machines running, dryers, folding table. Fluorescent lights, retro laundromat vibe',
        mood: 'patient waiting mood',
        colors: 'Bright fluorescent lighting, nostalgic aesthetic',
        activity: 'scrolling phone while sitting, relaxed expression',
        extras: 'Life errands, mundane beauty'
      },

      bus_ride: {
        name: 'Bus Commute',
        outfit: 'casual',
        setting: 'sitting on public bus looking out window',
        elements: 'Bus interior, window seat, cityscape passing by. Other passengers in background',
        mood: 'contemplative commute mood',
        colors: 'Soft interior bus lighting, blurred outside movement',
        activity: 'gazing out window with thoughtful expression',
        extras: 'Daily commute, urban life routine'
      },

      waiting_subway: {
        name: 'Subway Wait',
        outfit: 'street',
        setting: 'standing on subway platform waiting for train',
        elements: 'Subway tiles, platform edge line, digital signs, other commuters. Tunnel with approaching train lights',
        mood: 'patient urban mood',
        colors: 'Fluorescent platform lighting, urban underground',
        activity: 'standing with backpack, checking phone',
        extras: 'Metro life, urban transit culture'
      },

      // === 🆕 감정/특별한 순간 (5개) ===
      birthday_cake: {
        name: 'Birthday Celebration',
        outfit: 'casual',
        setting: 'sitting at table with birthday cake and candles',
        elements: 'Birthday cake with lit candles, balloons, party decorations, presents. Warm festive lighting',
        mood: 'joyful celebration mood',
        colors: 'Warm candlelight glow, colorful party decorations',
        activity: 'about to blow out candles with happy smile',
        extras: 'Birthday party, celebration vibes'
      },

      stargazing_night: {
        name: 'Stargazing',
        outfit: 'cozy',
        setting: 'lying on blanket under starry night sky',
        elements: 'Millions of stars, Milky Way visible, telescope nearby. Dark open field, peaceful night',
        mood: 'wonder and contemplative mood',
        colors: 'Deep blue night sky with bright stars',
        activity: 'lying back looking at stars with peaceful expression',
        extras: 'Astronomy hobby, cosmic wonder'
      },

      first_snow: {
        name: 'First Snow',
        outfit: 'cozy',
        setting: 'standing outside catching snowflakes on hand',
        elements: 'Snowflakes falling gently, winter trees, soft snow on ground. Peaceful winter atmosphere',
        mood: 'magical winter mood',
        colors: 'Soft white snow, cool blue winter tones',
        activity: 'looking up at falling snow with wonder, hand outstretched',
        extras: 'Winter magic, first snow tradition'
      },

      graduation_day: {
        name: 'Graduation',
        outfit: 'professional',
        setting: 'wearing graduation cap and gown holding diploma',
        elements: 'Graduation ceremony setting, other graduates, campus background. Celebratory atmosphere',
        mood: 'accomplished proud mood',
        colors: 'Bright ceremony lighting, formal academic setting',
        activity: 'holding diploma with proud smile',
        extras: 'Life milestone, academic achievement'
      },

      sunset_proposal: {
        name: 'Romantic Sunset',
        outfit: 'professional',
        setting: 'sitting with someone special during romantic sunset',
        elements: 'Beautiful sunset sky, romantic location like beach or hill. Soft romantic lighting',
        mood: 'romantic and emotional mood',
        colors: 'Warm romantic sunset colors, dreamy atmosphere',
        activity: 'sharing tender moment with gentle expression',
        extras: 'Love story, romantic milestone'
      },

      // === 기존 시나리오 (계속) ===
      library_study: {
        name: 'Library Study',
        outfit: 'study',
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

    // 🎯 키워드 → 시나리오 매핑 (1번 곡 분석용)
    this.keywordToScenario = {
      // === 음식/요리 키워드 ===
      '푸드트럭|food truck|음식|요리|레시피|cook|recipe': ['cooking_kitchen', 'food_truck_visit', 'baking_cookies', 'picnic_park', 'restaurant_dining'],
      '커피|coffee|카페|cafe|latte|라떼|카페인': ['cafe_jazz', 'morning_chill'],
      '쿠키|cookie|베이킹|baking|케이크|cake': ['baking_cookies', 'birthday_cake'],
      '피크닉|picnic|소풍': ['picnic_park'],
      '레스토랑|restaurant|식당|dining': ['restaurant_dining'],
      
      // === 동물/펫 키워드 ===
      '강아지|puppy|dog|반려견|멍멍이|산책': ['walking_dog', 'pet_grooming', 'park_bench'],
      '고양이|cat|냥|kitty': ['cat_cafe_visit', 'pet_grooming'],
      '펫|pet|반려동물': ['walking_dog', 'cat_cafe_visit', 'pet_grooming'],
      '물고기|fish|수족관|aquarium': ['aquarium_visit'],
      '새|bird|조류': ['bird_watching'],
      
      // === 운동/활동 키워드 ===
      '운동|workout|exercise|피트니스|fitness': ['gym_workout', 'jogging_park', 'yoga_morning'],
      '요가|yoga|명상|meditation': ['yoga_morning'],
      '조깅|jogging|달리기|running': ['jogging_park'],
      '헬스|gym|웨이트': ['gym_workout'],
      '자전거|bicycle|cycling|사이클': ['cycling_city'],
      '스케이트보드|skateboard': ['skateboarding'],
      
      // === 여행/장소 키워드 ===
      '여행|travel|trip|journey': ['airport_departure', 'train_commute', 'beach_sunset', 'mountain_hiking'],
      '공항|airport|비행기|airplane|plane': ['airport_departure'],
      '해변|beach|바다|ocean|sea': ['beach_sunset'],
      '산|mountain|등산|hiking': ['mountain_hiking'],
      '벚꽃|cherry blossom|봄|spring': ['cherry_blossom', 'park_bench'],
      '도시|city|시내|downtown': ['city_night_walk', 'city_night', 'shopping_mall'],
      
      // === 취미/문화 키워드 ===
      '책|book|독서|reading|서점|bookstore': ['bookstore_browse', 'library_study'],
      '미술|art|그림|gallery|갤러리': ['art_gallery'],
      '게임|gaming|game': ['gaming_setup'],
      '사진|photography|photo|카메라|camera': ['photography_city'],
      '음반|vinyl|레코드|record': ['record_store', 'vinyl_shop'],
      '도서관|library': ['library_study'],
      
      // === 일상/사회 키워드 ===
      '회의|meeting|업무|work|재택|remote': ['video_call_work'],
      '쇼핑|shopping|mall': ['shopping_mall'],
      '빨래|laundry|세탁': ['laundromat_wait'],
      '버스|bus': ['bus_ride'],
      '지하철|subway|metro': ['waiting_subway'],
      '출퇴근|commute': ['train_commute', 'bus_ride', 'waiting_subway'],
      
      // === 감정/특별한 순간 키워드 ===
      '생일|birthday|파티|party|축하|celebration': ['birthday_cake'],
      '별|star|밤하늘|starry|stargazing': ['stargazing_night'],
      '눈|snow|겨울|winter': ['first_snow', 'winter_cabin'],
      '졸업|graduation': ['graduation_day'],
      '사랑|love|연인|romantic|로맨틱': ['sunset_proposal', 'restaurant_dining'],
      
      // === 시간대/날씨 키워드 ===
      '새벽|dawn|아침|morning|sunrise': ['morning_chill', 'yoga_morning', 'jogging_park', 'cafe_jazz'],
      '밤|night|심야|midnight|저녁|evening': ['night_drive', 'bedroom_chill', 'city_night', 'city_night_walk', 'stargazing_night'],
      '비|rain|우산|rainy': ['rain_window'],
      '석양|sunset|황혼': ['sunset_rooftop', 'beach_sunset', 'sunset_proposal'],
      
      // === 감정 상태 키워드 ===
      '행복|happy|즐거운|joyful|기쁜': ['birthday_cake', 'picnic_park', 'beach_sunset'],
      '슬픈|sad|우울|melancholic|눈물': ['rain_window', 'train_commute'],
      '평화|peaceful|고요한|calm|평온': ['yoga_morning', 'library_study', 'rain_window'],
      '외로운|lonely|혼자|alone': ['bedroom_chill', 'rain_window', 'train_commute']
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
   * 🎯 1번 곡 분석해서 매칭되는 시나리오 찾기
   * @param {Object} track - 곡 정보 객체
   * @param {string} track.title - 곡 제목
   * @param {string} track.lyrics - 가사 (선택적)
   * @returns {string|null} 매칭된 시나리오 키, 없으면 null
   */
  analyzeFirstTrackForScenario(track) {
    if (!track || !track.title) {
      console.log('❌ [Thumbnail] 분석할 곡 정보가 없습니다.');
      return null;
    }

    // 제목 + 가사를 합쳐서 분석 텍스트 생성
    const textToAnalyze = `${track.title} ${track.lyrics || ''}`.toLowerCase();
    
    console.log(`🎵 [Thumbnail] 1번 곡 분석 중: "${track.title}"`);

    // 키워드 매칭 시도
    for (const [keywords, scenarios] of Object.entries(this.keywordToScenario)) {
      const keywordPattern = new RegExp(keywords, 'i'); // case-insensitive
      if (keywordPattern.test(textToAnalyze)) {
        // 매칭된 시나리오들 중 랜덤 선택 (다양성 확보)
        const selectedScenario = scenarios[Math.floor(Math.random() * scenarios.length)];
        console.log(`✅ [Thumbnail] 키워드 매칭 성공!`);
        console.log(`   - 매칭 키워드: ${keywords}`);
        console.log(`   - 선택된 시나리오: ${selectedScenario}`);
        return selectedScenario;
      }
    }

    console.log(`⚠️  [Thumbnail] 키워드 매칭 실패 → 랜덤 다양한 시나리오 선택`);
    return null;
  }

  /**
   * 메인 프롬프트 생성 함수
   * @param {Object} options - 생성 옵션
   * @param {Object} options.firstTrack - 🆕 1번 곡 정보 (title, lyrics)
   * @param {string} options.genre - 음악 장르 (예: 'lofi', 'hip hop', 'jazz')
   * @param {string} options.mood - 분위기 (예: 'chill', 'energetic', 'peaceful')
   * @param {string} options.timeOfDay - 시간대 (예: 'morning', 'night', 'afternoon')
   * @param {string} options.scenario - 직접 시나리오 지정 (선택적)
   * @param {boolean} options.includeText - 텍스트 오버레이 포함 여부 (기본값: true)
   * @param {string} options.customText - 커스텀 텍스트 (선택적)
   * @returns {string} DALL-E용 프롬프트
   */
  generate(options = {}) {
    const { firstTrack, genre, mood, timeOfDay, scenario, includeText = true, customText } = options;

    // 시나리오 선택 우선순위:
    // 1. 직접 지정된 시나리오
    // 2. 🆕 1번 곡 분석 기반 시나리오
    // 3. 장르/무드/시간대 기반 시나리오
    let selectedScenario;
    
    if (scenario && this.scenarios[scenario]) {
      // 1. 직접 지정된 시나리오 사용
      selectedScenario = this.scenarios[scenario];
      console.log(`🎯 [Thumbnail] 직접 지정된 시나리오 사용: ${scenario}`);
    } else if (firstTrack) {
      // 2. 🆕 1번 곡 분석 시도
      const matchedScenarioKey = this.analyzeFirstTrackForScenario(firstTrack);
      if (matchedScenarioKey && this.scenarios[matchedScenarioKey]) {
        selectedScenario = this.scenarios[matchedScenarioKey];
        console.log(`🎯 [Thumbnail] 1번 곡 매칭 시나리오 사용: ${selectedScenario.name}`);
      } else {
        // 매칭 실패 → 랜덤 다양한 시나리오
        selectedScenario = this._selectRandomDiverseScenario();
        console.log(`🎲 [Thumbnail] 랜덤 다양한 시나리오 선택: ${selectedScenario.name}`);
      }
    } else {
      // 3. 장르/무드 기반 선택
      selectedScenario = this._selectScenarioByGenre(genre, mood, timeOfDay);
      console.log(`🎵 [Thumbnail] 장르 기반 시나리오 선택: ${selectedScenario.name}`);
    }

    // 프롬프트 조합
    const prompt = this._buildPrompt(selectedScenario, { includeText, customText });

    return prompt;
  }

  /**
   * 🎲 랜덤 다양한 시나리오 선택 (반복 방지)
   */
  _selectRandomDiverseScenario() {
    const allScenarioKeys = Object.keys(this.scenarios);
    const randomIndex = Math.floor(Math.random() * allScenarioKeys.length);
    return this.scenarios[allScenarioKeys[randomIndex]];
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
  _buildPrompt(scenario, options = {}) {
    const outfit = this.outfits[scenario.outfit] || this.outfits.casual;
    const { includeText = true, customText } = options;

    // 기본 장면 프롬프트
    let prompt = `YouTube thumbnail for ${scenario.name.toLowerCase()} music. ${this.character.base} ${outfit}, ${scenario.setting}. ${scenario.elements}. ${scenario.colors}, ${scenario.mood}. The hedgehog ${scenario.activity}. ${scenario.extras}`;

    // 텍스트 오버레이 추가 (CTR 향상을 위해)
    if (includeText) {
      const textContent = customText || this._generateCatchyText(scenario);
      prompt += `. IMPORTANT: Include bold, eye-catching text overlay: "${textContent}" in large, modern bold font at the top. Use high-contrast colors (white text with black outline or shadow) to make it pop. The text should be highly visible and professional, following YouTube thumbnail best practices for maximum click-through rate`;
    }

    prompt += `. 1280x720px, professional YouTube thumbnail style, high quality, sharp details`;

    return prompt;
  }

  /**
   * 시나리오별 매력적인 텍스트 생성 (CTR 최적화)
   */
  _generateCatchyText(scenario) {
    const textTemplates = {
      lofi_study: ['STUDY BEATS', 'FOCUS MODE', 'STUDY VIBES'],
      hip_hop_production: ['HIP HOP BEATS', 'PRODUCER MODE', 'BEAT MAKING'],
      morning_chill: ['MORNING CHILL', 'SUNRISE VIBES', 'WAKE UP MUSIC'],
      night_drive: ['NIGHT DRIVE', 'LATE NIGHT', 'MIDNIGHT VIBES'],
      cafe_jazz: ['CAFE JAZZ', 'COFFEE MUSIC', 'JAZZ VIBES'],
      sunset_rooftop: ['SUNSET CHILL', 'GOLDEN HOUR', 'EVENING VIBES'],
      library_study: ['DEEP FOCUS', 'STUDY TIME', 'LIBRARY VIBES'],
      bedroom_chill: ['BEDROOM LOFI', 'CHILL BEATS', 'LATE NIGHT'],
      train_commute: ['TRAVEL MUSIC', 'JOURNEY VIBES', 'ON THE ROAD'],
      rain_window: ['RAINY DAY', 'COZY VIBES', 'RAIN SOUNDS'],
      park_bench: ['NATURE SOUNDS', 'PARK VIBES', 'OUTDOOR CHILL'],
      vinyl_shop: ['VINYL VIBES', 'CLASSIC BEATS', 'RECORD STORE'],
      beach_sunset: ['BEACH CHILL', 'SUMMER VIBES', 'OCEAN SOUNDS'],
      winter_cabin: ['WINTER COZY', 'FIREPLACE VIBES', 'SNOWY DAY'],
      city_night: ['CITY NIGHTS', 'URBAN VIBES', 'NEON LIGHTS']
    };

    const scenarioKey = Object.keys(this.scenarios).find(
      key => this.scenarios[key] === scenario
    );

    const templates = textTemplates[scenarioKey] || ['LOFI BEATS', 'CHILL VIBES', 'STUDY MUSIC'];
    const randomIndex = Math.floor(Math.random() * templates.length);
    return templates[randomIndex];
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
   * @param {Object} options - 생성 옵션
   * @param {Object} options.firstTrack - 🆕 1번 곡 정보 (우선 시나리오 선택용)
   * @param {number} count - 생성할 프롬프트 개수
   */
  generateBatch(options = {}, count = 5) {
    const prompts = [];
    const { firstTrack, genre, mood, timeOfDay, includeText = true } = options;

    // 🆕 1번 곡이 있으면 첫 번째 프롬프트는 매칭 시나리오 사용
    if (firstTrack) {
      const matchedScenarioKey = this.analyzeFirstTrackForScenario(firstTrack);
      if (matchedScenarioKey && this.scenarios[matchedScenarioKey]) {
        const scenario = this.scenarios[matchedScenarioKey];
        const prompt = this._buildPrompt(scenario, { includeText });
        prompts.push({
          scenario: matchedScenarioKey,
          name: scenario.name,
          prompt,
          isMatched: true // 1번 곡 매칭 표시
        });
        count--; // 이미 1개 추가했으므로 카운트 감소
      }
    }

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
      const prompt = this._buildPrompt(scenario, { includeText });
      prompts.push({
        scenario: key,
        name: scenario.name,
        prompt,
        isMatched: false
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
      keywordMappings: Object.keys(this.keywordToScenario).length,
      genres: Object.keys(this.genreMapping).length,
      outfits: Object.keys(this.outfits).length,
      character: this.character.name
    };
  }
}

module.exports = new ThumbnailPromptGenerator();
