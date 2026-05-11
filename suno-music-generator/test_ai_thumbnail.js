/**
 * 🧪 AI 썸네일 매칭 시스템 테스트
 * 다양한 장르에 대해 자동으로 시각적 제약조건이 생성되는지 확인
 */

const { selectTemplate, generateThumbnailPrompt } = require('./server/services/thumbnailGenerator');

console.log('='.repeat(80));
console.log('🤖 AI 기반 썸네일 자동 매칭 시스템 테스트');
console.log('='.repeat(80));

// 테스트 케이스: 다양한 장르
const testCases = [
  { style: 'dance-pop', title: '신나는 댄스팝 파티' },
  { style: 'dark-trap', title: '어둡고 강렬한 트랩 비트' },
  { style: 'jazz-lounge', title: '세련된 재즈 라운지' },
  { style: 'k-pop', title: 'K-POP 에너지 넘치는 노래' },
  { style: 'ambient-meditation', title: '명상과 힐링을 위한 음악' },
  { style: 'metal', title: '강렬한 메탈 사운드' },
  { style: 'upbeat', title: '틀자마자상쾌해짐.. 가볍게기분업!!' }
];

testCases.forEach((testCase, index) => {
  console.log(`\n${'='.repeat(80)}`);
  console.log(`테스트 ${index + 1}: ${testCase.style}`);
  console.log(`제목: ${testCase.title}`);
  console.log('='.repeat(80));
  
  const template = selectTemplate(testCase.style);
  
  console.log(`\n📊 템플릿 분석 결과:`);
  console.log(`  - 장르명: ${template.name}`);
  console.log(`  - 무드: ${template.mood}`);
  console.log(`  - 에너지: ${template.energy || 'N/A'}`);
  console.log(`  - 타겟 CTR: ${template.targetCTR}`);
  
  console.log(`\n✅ MUST INCLUDE:`);
  if (template.mustHave && template.mustHave.length > 0) {
    template.mustHave.slice(0, 5).forEach(item => {
      console.log(`     - ${item}`);
    });
    if (template.mustHave.length > 5) {
      console.log(`     ... 외 ${template.mustHave.length - 5}개`);
    }
  } else {
    console.log(`     (없음)`);
  }
  
  console.log(`\n❌ MUST AVOID:`);
  if (template.mustAvoid && template.mustAvoid.length > 0) {
    template.mustAvoid.slice(0, 5).forEach(item => {
      console.log(`     - ${item}`);
    });
    if (template.mustAvoid.length > 5) {
      console.log(`     ... 외 ${template.mustAvoid.length - 5}개`);
    }
  } else {
    console.log(`     (없음)`);
  }
  
  console.log(`\n🎨 컬러 팔레트:`);
  console.log(`  - Main: ${template.primaryColors.main}`);
  console.log(`  - Secondary: ${template.primaryColors.secondary}`);
  console.log(`  - Accent: ${template.primaryColors.accent}`);
  
  console.log(`\n🎬 분위기: ${template.atmosphere}`);
  console.log(`📚 참고 스타일: ${template.referenceStyle}`);
});

console.log('\n' + '='.repeat(80));
console.log('✅ 테스트 완료!');
console.log('='.repeat(80));
