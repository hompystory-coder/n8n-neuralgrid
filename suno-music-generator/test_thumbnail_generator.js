/**
 * 🦔 블루 고슴도치 썸네일 프롬프트 생성기 테스트
 * 
 * 힙합/로파이 음악 채널용 썸네일 시스템 검증
 */

const thumbnailPromptGenerator = require('./server/services/thumbnailPromptGenerator');

console.log('🦔 블루 고슴도치 썸네일 시스템 테스트');
console.log('='.repeat(80));

// 1. 시스템 통계
console.log('\n📊 시스템 통계:');
const stats = thumbnailPromptGenerator.getStats();
console.log(JSON.stringify(stats, null, 2));

// 2. 장르별 프롬프트 생성 테스트
console.log('\n🎵 장르별 프롬프트 생성 테스트:');
console.log('='.repeat(80));

const testCases = [
  { genre: 'lofi', mood: 'calm', timeOfDay: 'night', name: 'Lo-fi Study Night' },
  { genre: 'hip hop', mood: 'energetic', timeOfDay: null, name: 'Hip Hop Production' },
  { genre: 'chill', mood: 'peaceful', timeOfDay: 'morning', name: 'Morning Chill' },
  { genre: 'jazz', mood: 'relaxed', timeOfDay: 'afternoon', name: 'Cafe Jazz' },
  { genre: 'groove', mood: 'cool', timeOfDay: 'night', name: 'Night Drive' }
];

testCases.forEach((testCase, index) => {
  console.log(`\n${index + 1}. ${testCase.name}`);
  console.log(`   장르: ${testCase.genre}, 무드: ${testCase.mood}, 시간: ${testCase.timeOfDay || 'any'}`);
  
  const prompt = thumbnailPromptGenerator.generate({
    genre: testCase.genre,
    mood: testCase.mood,
    timeOfDay: testCase.timeOfDay
  });
  
  console.log(`   프롬프트 길이: ${prompt.length} chars`);
  console.log(`   프롬프트: ${prompt.substring(0, 150)}...`);
});

// 3. 특정 시나리오 직접 지정 테스트
console.log('\n\n🎭 특정 시나리오 지정 테스트:');
console.log('='.repeat(80));

const specificScenarios = ['lofi_study', 'hip_hop_production', 'cafe_jazz', 'night_drive', 'winter_cabin'];

specificScenarios.forEach((scenarioKey, index) => {
  console.log(`\n${index + 1}. Scenario: ${scenarioKey}`);
  
  const prompt = thumbnailPromptGenerator.generate({ scenario: scenarioKey });
  
  console.log(`   프롬프트: ${prompt.substring(0, 120)}...`);
});

// 4. 배치 생성 테스트
console.log('\n\n📦 배치 생성 테스트 (5개 변형):');
console.log('='.repeat(80));

const batchPrompts = thumbnailPromptGenerator.generateBatch({ genre: 'lofi' }, 5);

batchPrompts.forEach((item, index) => {
  console.log(`\n${index + 1}. ${item.name} (${item.scenario})`);
  console.log(`   ${item.prompt.substring(0, 100)}...`);
});

// 5. 모든 시나리오 목록
console.log('\n\n📋 사용 가능한 모든 시나리오:');
console.log('='.repeat(80));

const allScenarios = thumbnailPromptGenerator.getAllScenarios();
console.log(`총 ${allScenarios.length}개 시나리오:`);
allScenarios.forEach((scenario, index) => {
  console.log(`${index + 1}. [${scenario.key}] ${scenario.name}`);
  console.log(`   ${scenario.description.substring(0, 80)}...`);
});

// 6. 장르별 추천 시나리오
console.log('\n\n🎸 장르별 추천 시나리오:');
console.log('='.repeat(80));

const genres = ['lofi', 'hip hop', 'jazz', 'chill', 'sleep', 'work'];

genres.forEach(genre => {
  const recommended = thumbnailPromptGenerator.getRecommendedScenariosForGenre(genre);
  console.log(`\n${genre.toUpperCase()}: ${recommended.length}개 추천`);
  recommended.forEach((scenario, index) => {
    console.log(`  ${index + 1}. ${scenario.name} (${scenario.key})`);
  });
});

// 7. 다양성 테스트 (같은 조건으로 10번 생성)
console.log('\n\n🎲 다양성 테스트 (lofi 장르로 10번 생성):');
console.log('='.repeat(80));

const diversityTest = [];
for (let i = 0; i < 10; i++) {
  const prompt = thumbnailPromptGenerator.generate({ genre: 'lofi' });
  // 시나리오 이름 추출 (프롬프트에서 'for' 다음 단어들)
  const scenarioMatch = prompt.match(/for ([\w\s]+) music\./);
  const scenarioName = scenarioMatch ? scenarioMatch[1] : 'unknown';
  diversityTest.push(scenarioName);
}

console.log('생성된 시나리오들:');
diversityTest.forEach((scenario, index) => {
  console.log(`${index + 1}. ${scenario}`);
});

const uniqueScenarios = new Set(diversityTest);
console.log(`\n다양성: ${uniqueScenarios.size}/10 (${(uniqueScenarios.size / 10 * 100).toFixed(0)}% 중복 없음)`);

console.log('\n\n✅ 테스트 완료!');
console.log('='.repeat(80));
