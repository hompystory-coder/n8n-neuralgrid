/**
 * 🎵 간단한 가사 생성기 - Suno API 호환
 * 
 * Suno V5는 짧고 간결한 가사를 선호합니다
 * 구조: Verse + Chorus (반복)
 * 총 길이: ~300자 이하
 */

const seedRandom = (seed) => {
  const x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
};

// 간단한 라인 풀
const simpleLyricsPool = {
  verse1: [
    "Walking down the street", "Thinking of you tonight", "Morning light so bright",
    "Gentle breeze tonight", "Remember those days", "Sunset fading away",
    "Lost in my thoughts", "Dancing in the rain", "Whispers in the wind",
    "Shadows all around", "Dreaming of your smile", "Silent night so calm",
    "Floating on a cloud", "Watching time go by", "Memories come back",
    "Feeling so alive", "Wandering through town", "Stars shine above",
    "Holding onto dreams", "Beneath the sky", "Every moment counts"
  ],
  
  verse2: [
    "Nothing stays the same", "Everything has changed", "Time keeps moving on",
    "Memories remain", "Can't look back now", "The world spins around",
    "Hearts beat as one", "Dreams fade away", "Hope lights the way",
    "Life moves too fast", "Seasons come and go", "Years fly by",
    "Together we stand", "Hand in hand", "Never let go"
  ],
  
  chorus: [
    "Take me higher now", "We'll find our way somehow", "This feeling won't fade",
    "Dancing through the night", "Everything's alright", "Together we shine",
    "Let the music play", "Living for today", "Nothing in our way",
    "Reach for the sky", "Never say goodbye", "You and I",
    "Feel the beat tonight", "Hold me tight", "Everything's right"
  ]
};

/**
 * 간단한 가사 생성 (Verse + Chorus만)
 */
function generateSimpleLyrics(index, seed) {
  const v1Index = Math.floor(seedRandom(seed + index * 100) * simpleLyricsPool.verse1.length);
  const v2Index = Math.floor(seedRandom(seed + index * 200) * simpleLyricsPool.verse2.length);
  const cIndex = Math.floor(seedRandom(seed + index * 300) * simpleLyricsPool.chorus.length);
  
  const verse1Line1 = simpleLyricsPool.verse1[v1Index];
  const verse1Line2 = simpleLyricsPool.verse2[v2Index];
  
  const verse2Line1 = simpleLyricsPool.verse1[(v1Index + 5) % simpleLyricsPool.verse1.length];
  const verse2Line2 = simpleLyricsPool.verse2[(v2Index + 5) % simpleLyricsPool.verse2.length];
  
  const chorusLine1 = simpleLyricsPool.chorus[cIndex];
  const chorusLine2 = simpleLyricsPool.chorus[(cIndex + 1) % simpleLyricsPool.chorus.length];
  
  const lyrics = `[Verse 1]
${verse1Line1}
${verse1Line2}

[Chorus]
${chorusLine1}
${chorusLine2}

[Verse 2]
${verse2Line1}
${verse2Line2}

[Chorus]
${chorusLine1}
${chorusLine2}`;

  console.log(`✅ 간단한 가사 생성 완료 (${lyrics.length}자)`);
  
  return lyrics;
}

module.exports = { generateSimpleLyrics };
