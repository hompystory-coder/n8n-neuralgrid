/**
 * 🎵 Jjimplay YouTube 플레이리스트 메타데이터
 * 
 * 각 플레이리스트의 제목과 설명을 가사와 완벽하게 매칭되도록
 * 시적이고 감성적으로 작성했습니다.
 * 
 * 💡 특징:
 * - 제목: 감성적이고 시적인 표현 (3-6단어)
 * - 설명: 가사 내용과 매칭되는 상황/감정 묘사 (2-3문장)
 * - 해시태그: SEO 최적화된 키워드
 */

const JJIMPLAY_PLAYLISTS = [
  {
    id: 1,
    category: '새벽감성',
    originalTitle: '새벽감성',
    enhancedTitle: '고요 속 울림, 새벽의 속삭임',
    originalDescription: '새벽의 정적을 깨우는 부드러운 멜로디와 잔잔한 리듬. 하루를 시작하기 전, 나만의 시간 속에서 감성을 충전하는 음악.',
    enhancedDescription: '아직 세상이 잠든 새벽, 고요한 정적 속에서 나만의 시간을 가져보세요. 부드러운 어쿠스틱 기타와 따뜻한 보컬이 어우러져 당신의 내면을 깨우는 음악. 커피 한 잔과 함께 창밖을 바라보며 듣기 좋은, 감성 충전 플레이리스트.',
    hashtags: '#새벽감성 #새벽음악 #힐링음악 #감성충전 #어쿠스틱 #인디음악 #새벽명상',
    mood: 'calm, introspective, peaceful',
    keywords: ['새벽', '고요', '정적', '성찰', '평화', '내면', '충전']
  },
  {
    id: 2,
    category: '공부/집중',
    originalTitle: '공부/집중',
    enhancedTitle: '몰입의 리듬, 집중력을 깨우는 시간',
    originalDescription: '집중력을 높이는 리듬감 있는 비트와 깔끔한 멜로디. 공부나 업무 중 흐름을 유지하고 생산성을 극대화할 수 있는 음악.',
    enhancedDescription: '책장을 넘기는 소리, 키보드를 두드리는 리듬에 맞춰 흐르는 음악. Lo-fi 비트와 앰비언트 사운드가 만들어내는 완벽한 집중 환경. 방해받지 않고 깊은 몰입 상태로 빠져드는, 공부와 업무를 위한 최적의 BGM.',
    hashtags: '#공부음악 #집중음악 #스터디플레이리스트 #로파이비트 #생산성향상 #업무bgm #집중력',
    mood: 'focused, productive, steady',
    keywords: ['집중', '몰입', '생산성', '리듬', '효율', '공부', '업무']
  },
  {
    id: 3,
    category: '드라이브',
    originalTitle: '드라이브',
    enhancedTitle: '바람과 함께, 자유를 향한 질주',
    originalDescription: '시원한 바람과 함께하는 드라이브에 어울리는 경쾌하고 상쾌한 사운드. 창밖 풍경과 함께 자유로움을 느낄 수 있는 음악.',
    enhancedDescription: '도로 위를 가르는 순간, 창문을 열고 들어오는 시원한 바람. 경쾌한 드럼 비트와 신나는 기타 리프가 당신의 드라이브를 특별하게 만듭니다. 해안도로든 도심 속이든, 자유를 만끽할 수 있는 완벽한 드라이빙 플레이리스트.',
    hashtags: '#드라이브음악 #드라이빙 #자유로움 #상쾌함 #여행음악 #로드트립 #경쾌한음악',
    mood: 'energetic, free, uplifting',
    keywords: ['드라이브', '바람', '자유', '질주', '상쾌', '여행', '도로']
  },
  {
    id: 4,
    category: '아침/모닝',
    originalTitle: '아침/모닝',
    enhancedTitle: '첫 빛과 함께, 희망의 하루를 열다',
    originalDescription: '상쾌한 아침을 여는 밝고 경쾌한 멜로디. 긍정적인 에너지로 하루를 시작하며 활력을 불어넣는 음악.',
    enhancedDescription: '커튼 사이로 스며드는 따스한 햇살, 새로운 하루가 시작됩니다. 상쾌한 어쿠스틱 사운드와 밝은 멜로디가 당신의 아침을 활기차게 깨워줍니다. 스트레칭하며 듣기 좋은, 긍정 에너지 가득한 모닝 루틴 플레이리스트.',
    hashtags: '#아침음악 #모닝루틴 #긍정에너지 #활력충전 #상쾌한아침 #하루시작 #goodmorning',
    mood: 'bright, hopeful, energizing',
    keywords: ['아침', '햇살', '희망', '시작', '활력', '긍정', '상쾌']
  },
  {
    id: 5,
    category: '이별/슬픔',
    originalTitle: '이별/슬픔',
    enhancedTitle: '눈물 속에 남은, 우리의 계절',
    originalDescription: '마음을 위로하는 잔잔한 발라드와 애틋한 멜로디. 이별의 아픔을 공감하고 감정을 정화할 수 있는 음악.',
    enhancedDescription: '떠나간 사람의 빈자리, 그 속에 남은 추억들. 애틋한 피아노 선율과 슬픈 보컬이 당신의 마음을 어루만집니다. 울고 싶을 때, 혼자만의 시간이 필요할 때 들으며 감정을 정화하는 이별 발라드 모음.',
    hashtags: '#이별노래 #슬픈음악 #발라드 #감성발라드 #눈물 #위로 #힐링발라드',
    mood: 'melancholic, tender, healing',
    keywords: ['이별', '슬픔', '눈물', '추억', '위로', '아픔', '치유']
  },
  {
    id: 6,
    category: '운동/헬스장',
    originalTitle: '운동/헬스장',
    enhancedTitle: '한계를 넘어, 불타는 에너지',
    originalDescription: '강렬한 비트와 역동적인 리듬으로 운동 효과를 극대화하는 파워풀한 사운드. 헬스장에서 최고의 퍼포먼스를 끌어내는 음악.',
    enhancedDescription: '땀방울이 떨어지는 순간, 심장이 뛰는 리듬에 맞춰 폭발하는 에너지. 강렬한 EDM 비트와 파워풀한 베이스가 당신의 한계를 돌파하게 만듭니다. 운동 강도를 높이고 동기부여가 필요할 때, 최고의 워크아웃 플레이리스트.',
    hashtags: '#운동음악 #헬스장음악 #워크아웃 #동기부여 #운동bgm #gym #fitness',
    mood: 'powerful, intense, motivating',
    keywords: ['운동', '에너지', '파워', '한계', '동기부여', '강렬', '열정']
  },
  {
    id: 7,
    category: '밤/R&B',
    originalTitle: '밤/R&B',
    enhancedTitle: '깊은 밤, 네온 아래 흐르는 그루브',
    originalDescription: '도시의 밤을 수놓는 부드러운 R&B 그루브와 세련된 베이스 라인. 감각적이고 무드 있는 밤 시간을 위한 음악.',
    enhancedDescription: '네온사인이 반짝이는 도심 속, 조용히 흐르는 R&B 그루브. 부드러운 보컬과 세련된 베이스 라인이 만들어내는 무드 있는 밤. 와인 한 잔과 함께, 혹은 야경을 바라보며 듣기 좋은 어반 나이트 플레이리스트.',
    hashtags: '#밤음악 #rnb #알앤비 #도시감성 #무드있는음악 #나이트드라이브 #urbannight',
    mood: 'smooth, sensual, sophisticated',
    keywords: ['밤', '도시', '그루브', '세련', '감각', '네온', '무드']
  },
  {
    id: 8,
    category: '파티/축제',
    originalTitle: '파티/축제',
    enhancedTitle: '함성 속에, 터지는 축제의 밤',
    originalDescription: '신나는 비트와 중독성 있는 멜로디로 파티 분위기를 최고조로 끌어올리는 음악. 친구들과 함께 즐기는 축제 같은 시간.',
    enhancedDescription: '손을 들고 뛰어오르는 순간, 터지는 베이스와 함께 폭발하는 에너지. EDM과 팝이 만나 만들어낸 완벽한 파티 사운드. 친구들과의 모임, 클럽, 홈파티 어디서든 분위기를 최고조로 끌어올리는 축제 플레이리스트.',
    hashtags: '#파티음악 #축제 #클럽음악 #edm #파티플레이리스트 #신나는음악 #party',
    mood: 'exciting, festive, explosive',
    keywords: ['파티', '축제', '열광', '흥', '신남', '에너지', '폭발']
  },
  {
    id: 9,
    category: '봄/상큼함',
    originalTitle: '봄/상큼함',
    enhancedTitle: '꽃잎 사이로, 봄바람이 춤추다',
    originalDescription: '따스한 봄 햇살 아래 어울리는 상큼하고 경쾌한 멜로디. 새로운 시작과 희망을 담은 봄날의 음악.',
    enhancedDescription: '벚꽃이 흩날리는 봄날, 따스한 햇살 아래 걷는 산책길. 상큼한 어쿠스틱 팝과 경쾌한 멜로디가 당신의 발걸음을 가볍게 만듭니다. 봄 소풍, 피크닉, 데이트 어디서든 완벽한 봄날의 감성 플레이리스트.',
    hashtags: '#봄음악 #상큼한음악 #봄날 #벚꽃 #피크닉음악 #봄감성 #spring',
    mood: 'fresh, cheerful, hopeful',
    keywords: ['봄', '꽃', '상큼', '희망', '시작', '따스함', '설렘']
  },
  {
    id: 10,
    category: '수면/휴식',
    originalTitle: '수면/휴식',
    enhancedTitle: '깊은 밤, 별빛 속으로 스며들다',
    originalDescription: '편안한 수면과 깊은 휴식을 돕는 차분한 앰비언트와 자연의 소리. 마음과 몸을 이완시키는 음악.',
    enhancedDescription: '하루의 모든 긴장을 내려놓는 시간, 잔잔한 앰비언트 사운드와 자연의 소리가 당신을 깊은 휴식으로 안내합니다. 부드러운 피아노와 빗소리, 파도 소리가 어우러져 만드는 완벽한 수면 환경. 불면증 해소와 깊은 명상을 위한 릴랙스 플레이리스트.',
    hashtags: '#수면음악 #휴식 #명상음악 #힐링 #불면증해소 #릴랙스 #sleepmusic',
    mood: 'peaceful, relaxing, meditative',
    keywords: ['수면', '휴식', '이완', '평화', '명상', '고요', '안정']
  }
];

/**
 * 플레이리스트 ID로 메타데이터 조회
 */
function getPlaylistById(id) {
  return JJIMPLAY_PLAYLISTS.find(p => p.id === id);
}

/**
 * 카테고리로 플레이리스트 조회
 */
function getPlaylistByCategory(category) {
  return JJIMPLAY_PLAYLISTS.find(p => p.category === category);
}

/**
 * 모든 플레이리스트 조회
 */
function getAllPlaylists() {
  return JJIMPLAY_PLAYLISTS;
}

/**
 * 플레이리스트 메타데이터를 YouTube 형식으로 포맷
 */
function formatForYouTube(playlistId) {
  const playlist = getPlaylistById(playlistId);
  if (!playlist) return null;

  return {
    title: playlist.enhancedTitle,
    description: `${playlist.enhancedDescription}\n\n${playlist.hashtags}`,
    category: playlist.category,
    mood: playlist.mood,
    keywords: playlist.keywords
  };
}

/**
 * 여러 플레이리스트를 JSON 형식으로 출력
 */
function exportPlaylistsJSON() {
  return JSON.stringify(JJIMPLAY_PLAYLISTS, null, 2);
}

/**
 * 여러 플레이리스트를 CSV 형식으로 출력
 */
function exportPlaylistsCSV() {
  const headers = ['ID', 'Category', 'Enhanced Title', 'Enhanced Description', 'Hashtags'];
  const rows = JJIMPLAY_PLAYLISTS.map(p => [
    p.id,
    p.category,
    `"${p.enhancedTitle}"`,
    `"${p.enhancedDescription}"`,
    `"${p.hashtags}"`
  ]);
  
  return [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
}

module.exports = {
  JJIMPLAY_PLAYLISTS,
  getPlaylistById,
  getPlaylistByCategory,
  getAllPlaylists,
  formatForYouTube,
  exportPlaylistsJSON,
  exportPlaylistsCSV
};
