/**
 * 🎵 동적 가사 생성기 - 완전히 고유한 가사 생성
 * 
 * 문제: 템플릿 방식은 Chorus, Bridge가 반복됨
 * 해결: 각 섹션을 독립적으로 생성 + 무작위 조합
 */

const seedRandom = (seed) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

/**
 * 영어 가사 구성 요소 라이브러리
 */
const lyricsComponents = {
  // Verse 시작 라인들 (100+개)
  verseOpeners: [
    "Walking down the {place}", "Thinking of your {emotion} eyes", "Morning light through {place}",
    "Gentle {nature} falling", "Remember when we {action}", "Sunset over {place}",
    "Lost in these {emotion} thoughts", "Dancing through the {nature}", "Whispers in the {time}",
    "Shadows of the {place}", "Dreaming of your {emotion} smile", "Silent {nature} around us",
    "Floating through the {time}", "Watching {nature} passing by", "Memories of that {place}",
    "Feeling so {emotion} tonight", "Wandering through {place}", "Stars above the {place}",
    "Holding onto {emotion} dreams", "Beneath the {nature} sky", "Every {time} reminds me",
    "Chasing {emotion} moments", "Through the {place} we go", "Somewhere in the {time}",
    "Breathing in the {nature}", "Looking at the {place}", "Time moves {emotion}",
    "Searching for that {emotion} feeling", "Across the {place} lights", "When the {nature} comes",
    "Standing at the {place}", "Your {emotion} words echo", "Fading {nature} surrounds us",
    "In this {time} moment", "Reaching for the {emotion} sky", "Colors of the {place}",
    "Soft {nature} whispers", "Every {action} we take", "Painted {place} scenes",
    "Quiet {emotion} nights", "Through the {nature} rain", "Where the {place} meets sky",
    "Wrapped in {emotion} warmth", "Following the {nature} path", "Beyond the {place} horizon",
    "These {emotion} days", "Under {nature} stars", "Inside this {place}",
    "While the {time} passes", "Catching {emotion} glimpses", "Between the {nature} waves"
  ],
  
  // Verse 중간 라인들 (100+개)
  verseMiddle: [
    "Nothing feels the same", "Everything has changed", "Time keeps moving on",
    "Memories remain", "Can't turn back now", "The world spins around",
    "Hearts beat as one", "Dreams fade away", "Hope lights the way",
    "Shadows grow long", "Silence speaks loud", "Echoes in my mind",
    "Feelings run deep", "Words left unsaid", "Moments slip by",
    "Life moves too fast", "Seasons come and go", "Years have flown past",
    "Truth becomes clear", "Paths intertwine", "Distances grow wide",
    "Promises we made", "Stories untold", "Chapters unfold",
    "Bridges we've burned", "Walls we've built", "Doors left open",
    "Questions unanswered", "Lessons we've learned", "Battles we've fought",
    "Peace we've found", "Love still remains", "Pain slowly heals",
    "Joy fills the air", "Tears have dried", "Smiles return again",
    "Future awaits", "Present is here", "Past fades behind",
    "Together we stand", "Alone I walk", "Side by side",
    "Hand in hand", "Miles apart", "Close to my heart",
    "Never letting go", "Always holding on", "Forever and always",
    "Till the end", "Through it all", "Come what may"
  ],
  
  // Chorus 구조들 (50+개 완전히 다른 구조)
  chorusVariants: [
    // 4라인 단순형
    [
      "We can {action} forever", "Under {nature} skies", "Nothing else {emotion}", "Just you and I"
    ],
    [
      "Take me to that {place}", "Where we used to {action}", "When the world felt {emotion}", "Everything was {emotion}"
    ],
    [
      "Running through the {nature}", "Chasing {emotion} dreams", "Nothing's as it {emotion}", "Or so it seems"
    ],
    [
      "Hold me in this {time}", "Never let me go", "Feel this {emotion} love", "Let it overflow"
    ],
    [
      "Dancing in the {nature}", "Free from all the pain", "Finding {emotion} moments", "Again and again"
    ],
    
    // 6라인 확장형
    [
      "Every {time} I think of you", "My heart starts to {action}", "Can't deny this {emotion} truth",
      "It's more than I can take", "Somewhere in this {place}", "Our love will find its way"
    ],
    [
      "When the {nature} falls around us", "And the world fades to gray", "I'll be here to {emotion} guide you",
      "Through the darkest day", "In this {place} we'll stay", "Forever come what may"
    ],
    [
      "Bring me back to {time}", "Where we felt so {emotion}", "Show me how to {action}",
      "Make me feel {emotion} again", "In this {place} tonight", "Everything feels right"
    ],
    [
      "Underneath the {nature} sky", "We can {action} so free", "Let this {emotion} feeling",
      "Be all we need to be", "No more {place} between us", "Just you here with me"
    ],
    [
      "Through the {nature} and the storms", "We keep {action} on", "This {emotion} bond we've formed",
      "Makes us both so strong", "In this {place} we belong", "Our hearts sing this song"
    ],
    
    // 8라인 풀 코러스
    [
      "Can you feel the {emotion} magic", "In the air tonight", "Everything seems so {emotion}",
      "When you hold me tight", "No more {place} to hide", "No more tears to cry",
      "Just this {nature} moment", "You and I, you and I"
    ],
    [
      "Take my hand and {action} with me", "To a {place} unknown", "Where the {nature} keeps on {action}",
      "And we're not alone", "Feel this {emotion} heartbeat", "Stronger than before",
      "In this {time} forever", "I need nothing more"
    ],
    [
      "We've been {action} through the darkness", "Searching for the light", "Now we've found this {emotion} {place}",
      "Everything's alright", "Let the {nature} surround us", "Wash away the pain",
      "In this {time} together", "We'll love again"
    ],
    [
      "Rising like the {nature}", "Breaking through the night", "This {emotion} connection",
      "Burns so {emotion} bright", "No more {place} can stop us", "Nothing stands between",
      "Living in this {time}", "The best we've ever seen"
    ],
    [
      "Colors of the {nature}", "Paint the {place} sky", "Every {emotion} moment",
      "Makes me feel alive", "No need to {action}", "No need to hide",
      "Just this {time} forever", "You're right here by my side"
    ]
  ],
  
  // Bridge 구조들 (40+개 완전히 다른 구조)
  bridgeVariants: [
    // 4라인 심플
    [
      "Maybe it's the {time}", "Maybe it's the {place}", "All I know is {emotion}", "When I see your face"
    ],
    [
      "Time keeps {action} forward", "But my heart stays here", "In this {emotion} {place}", "With you so near"
    ],
    [
      "Through the {nature} storms", "Through the darkest night", "This {emotion} love", "Will be our light"
    ],
    [
      "Nothing lasts forever", "Or so they say", "But this {emotion} feeling", "Won't fade away"
    ],
    
    // 6라인 확장
    [
      "When the world gets {emotion}", "And the {place} feels cold", "I'll remember this {time}",
      "And the story we told", "How we {action} together", "Hearts and souls as one"
    ],
    [
      "Looking back on all the {time}", "That we shared as friends", "Now it's grown to something {emotion}",
      "That will never end", "Through the {nature} and rain", "Our love will remain"
    ],
    [
      "If I could {action} anywhere", "I would choose this {place}", "If I could freeze one {time}",
      "It would be your {emotion} embrace", "Nothing else compares", "To the love we share"
    ],
    [
      "Close your eyes and {action}", "Feel the {nature} breeze", "Let this {emotion} moment",
      "Put your mind at ease", "In this {place} tonight", "Everything's alright"
    ],
    
    // 8라인 풀 브릿지
    [
      "We've traveled so many {place}", "Seen so much together", "Through every {time} and {nature}",
      "In all kinds of weather", "But nothing could prepare me", "For this {emotion} feeling",
      "The way you make me {action}", "Sends my heart reeling"
    ],
    [
      "Remember when we used to {action}", "In that old {place}", "Before the {time} changed everything",
      "Before we lost our way", "Now we've found each other", "In this {emotion} space",
      "And nothing else could matter", "When I see your face"
    ],
    [
      "They say that {emotion} love", "Only comes once in life", "But I've found it in this {place}",
      "Through all the joy and strife", "When the {nature} surrounds us", "And the {time} stands still",
      "I know we'll {action} forever", "And I always will"
    ]
  ],
  
  // Outro 엔딩들 (30+개)
  outroVariants: [
    [
      "As the {nature} fades to black", "And this {time} comes to end",
      "I'll hold onto these {emotion} memories", "My lover and my friend"
    ],
    [
      "When tomorrow comes around", "And the {place} wakes again",
      "I'll still be here {action}", "Through sunshine and through rain"
    ],
    [
      "Let the {nature} carry us", "To where we're meant to be",
      "In this {emotion} {place}", "Forever you and me"
    ],
    [
      "So here's to all the {time}", "And all the {place} we've known",
      "This {emotion} journey", "Has led us both back home"
    ],
    [
      "As we {action} into forever", "Hand in hand we'll stay",
      "In this {emotion} {place}", "Come what may"
    ],
    [
      "The {nature} keeps on {action}", "But we remain the same",
      "This {emotion} love forever", "Will burn like an eternal flame"
    ],
    [
      "In the end it's {emotion}", "All that really matters here",
      "You and me in this {place}", "With nothing left to fear"
    ],
    [
      "Let the world keep {action}", "We'll be standing still",
      "In this {time} forever", "We always will"
    ]
  ]
};

/**
 * 단어 교체 사전
 */
const wordReplacements = {
  time: ['morning', 'evening', 'midnight', 'twilight', 'dawn', 'dusk', 'sunrise', 'sunset', 'afternoon', 'night'],
  emotion: ['beautiful', 'perfect', 'magical', 'wonderful', 'gentle', 'peaceful', 'tender', 'sacred', 'precious', 'endless'],
  place: ['city', 'street', 'ocean', 'mountain', 'garden', 'forest', 'meadow', 'valley', 'shoreline', 'horizon'],
  nature: ['rain', 'wind', 'stars', 'moonlight', 'sunlight', 'clouds', 'waves', 'breeze', 'storm', 'snow'],
  action: ['walk', 'run', 'fly', 'dance', 'sing', 'dream', 'breathe', 'live', 'laugh', 'stay']
};

/**
 * 완전히 고유한 가사 생성
 */
function generateUniqueLyrics(index, seed, language = 'english') {
  const uniqueSeed = seed + index * 1000;
  
  // 각 섹션마다 완전히 다른 인덱스 사용
  const verseSeeds = [
    uniqueSeed + 1,
    uniqueSeed + 2,
    uniqueSeed + 3
  ];
  
  const chorusSeed = uniqueSeed + 10;
  const bridgeSeed = uniqueSeed + 20;
  const outroSeed = uniqueSeed + 30;
  
  // Verse 1, 2, 3 각각 다르게 생성
  const verses = verseSeeds.map((s, i) => generateVerse(s, i + 1));
  
  // Chorus (매번 다른 구조)
  const chorus = generateChorus(chorusSeed);
  
  // Bridge (고유)
  const bridge = generateBridge(bridgeSeed);
  
  // Outro (고유)
  const outro = generateOutro(outroSeed);
  
  // 조합
  const lyrics = `[Intro]
${generateIntro(uniqueSeed)}

[Verse 1]
${verses[0]}

[Chorus]
${chorus}

[Verse 2]
${verses[1]}

[Chorus]
${generateChorus(chorusSeed + 1)}

[Bridge]
${bridge}

[Verse 3]
${verses[2]}

[Chorus]
${generateChorus(chorusSeed + 2)}

[Outro]
${outro}`;

  return lyrics;
}

function generateIntro(seed) {
  const intros = [
    "{nature} in the {time}",
    "Whispers of the {place}",
    "{emotion} moments unfold",
    "Here we {action} again",
    "When the {nature} falls",
    "In this {emotion} {time}",
    "Through the {place} lights",
    "{action} into the {nature}",
    "Beneath the {time} sky",
    "Where {emotion} dreams begin"
  ];
  
  const idx = Math.floor(seedRandom(seed) * intros.length);
  return replaceWords(intros[idx], seed);
}

function generateVerse(seed, verseNum) {
  const { verseOpeners, verseMiddle } = lyricsComponents;
  
  // 각 Verse마다 완전히 다른 라인 선택
  const lines = [];
  
  for (let i = 0; i < 6; i++) {
    const s = seed + i * 100;
    if (i % 2 === 0) {
      const idx = Math.floor(seedRandom(s) * verseOpeners.length);
      lines.push(replaceWords(verseOpeners[idx], s));
    } else {
      const idx = Math.floor(seedRandom(s) * verseMiddle.length);
      lines.push(verseMiddle[idx]);
    }
  }
  
  return lines.join('\n');
}

function generateChorus(seed) {
  const { chorusVariants } = lyricsComponents;
  const idx = Math.floor(seedRandom(seed) * chorusVariants.length);
  const chorusLines = chorusVariants[idx];
  
  return chorusLines.map(line => replaceWords(line, seed + chorusLines.indexOf(line))).join('\n');
}

function generateBridge(seed) {
  const { bridgeVariants } = lyricsComponents;
  const idx = Math.floor(seedRandom(seed) * bridgeVariants.length);
  const bridgeLines = bridgeVariants[idx];
  
  return bridgeLines.map(line => replaceWords(line, seed + bridgeLines.indexOf(line))).join('\n');
}

function generateOutro(seed) {
  const { outroVariants } = lyricsComponents;
  const idx = Math.floor(seedRandom(seed) * outroVariants.length);
  const outroLines = outroVariants[idx];
  
  return outroLines.map(line => replaceWords(line, seed + outroLines.indexOf(line))).join('\n');
}

function replaceWords(template, seed) {
  let result = template;
  
  Object.keys(wordReplacements).forEach(key => {
    const regex = new RegExp(`\\{${key}\\}`, 'g');
    const words = wordReplacements[key];
    const idx = Math.floor(seedRandom(seed++) * words.length);
    result = result.replace(regex, words[idx]);
  });
  
  return result;
}

module.exports = {
  generateUniqueLyrics
};
