/**
 * AI 음악 전문가가 스타일을 축약하는 시스템
 */

require('dotenv').config();
const { GoogleGenerativeAI } = require('@google/generative-ai');

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function shortenStyleWithAI(longStyle, targetLength = 80) {
  const systemInstruction = `You are a world-class music producer and composer.

🎯 **Mission**: Shorten long music style descriptions while **preserving the musical essence**.

✅ **Principles**:
1. **Never damage core genre and mood**
2. **Maintain musical relationships** (e.g., "indie pop with funk influences" → "indie pop funk fusion")
3. **Preserve important characteristics** (BPM, vocal style, instrumentation)
4. **Remove only unnecessary words** (create, features, with, track, aesthetic)
5. **Target length: aim for ${targetLength-20} to ${targetLength} characters** (not too short!)
6. **CRITICAL: Output MUST be in ENGLISH**
7. **Include as many key elements as possible within the limit**

❌ **Don't**:
- Simply list words (indie, pop, funk ← this is meaningless!)
- Remove key characteristics (upbeat, bright moods are important!)
- Destroy musical flow
- Translate to other languages

✅ **Good Examples**:
Original (150 chars): "create an upbeat indie pop track with nu disco influences at 110 bpm features clean funk guitar punchy synth bass and bright vocals"
Shortened (80 chars): "upbeat indie pop, nu disco, 110 bpm, funk guitar, synth bass, bright vocals"

Original (180 chars): "lo-fi hip hop with jazz influences features smooth piano and relaxed beats with vinyl crackle atmospheric pads and mellow vibes perfect for studying"
Shortened (90 chars): "lo-fi hip hop jazz, smooth piano, relaxed beats, vinyl crackle, atmospheric, mellow"

**Output Format**: Output ONLY the shortened style in ENGLISH. No explanations!`;

  const userPrompt = `Shorten this music style to ${targetLength-20}-${targetLength} characters (NOT TOO SHORT!):

"${longStyle}"

Include as many key elements as possible: genres, BPM, instruments, mood, vocals.
Keep the musical essence intact. Output in ENGLISH only.

Target: ${targetLength-20}-${targetLength} characters (important: don't make it too short!)`;

  try {
    console.log('🤖 AI 음악 전문가가 스타일 축약 중...\n');
    
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.5-flash',
      generationConfig: {
        temperature: 0.7,  // 좀 더 창의적으로
        maxOutputTokens: 300,
      },
      systemInstruction: systemInstruction
    });

    const result = await model.generateContent(userPrompt);
    const response = await result.response;
    let shortened = response.text().trim();
    
    // 따옴표 제거
    shortened = shortened.replace(/^["']|["']$/g, '').trim();
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 비교 결과:');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━\n');
    console.log('원본 길이:', longStyle.length, '자');
    console.log('원본:\n', longStyle);
    console.log('\n✨ AI 축약 길이:', shortened.length, '자');
    console.log('AI 축약:\n', shortened);
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`💾 압축률: ${((1 - shortened.length / longStyle.length) * 100).toFixed(1)}%`);
    
    return shortened;
    
  } catch (error) {
    console.error('❌ AI 축약 실패:', error.message);
    
    // 폴백: 간단한 축약
    const fallback = longStyle
      .replace(/create an?|features?|with|style|meets|influences?|track|aesthetic/gi, '')
      .replace(/\s+/g, ' ')
      .trim()
      .substring(0, targetLength);
    
    console.log('⚠️ 폴백 축약 사용:', fallback);
    return fallback;
  }
}

// 테스트
const longStyle = process.argv[2] || "lo-fi hip hop, money chord,create an upbeat indie pop track with nu disco influences at 110 bpm features clean funk guitar punchy synth bass four on the floor drums with sidechain compression male falsetto vocals with auto tune aesthetic bright polished production and catchy repetitive hooks style Pop, R&B meets Pop, Dance-Pop, Funk Pop with dance pop energy";

(async () => {
  await shortenStyleWithAI(longStyle, 100);
  console.log('\n✅ 완료!');
  process.exit(0);
})();
