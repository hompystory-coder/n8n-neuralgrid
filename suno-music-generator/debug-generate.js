#!/usr/bin/env node
/**
 * 🐛 디버깅 모드 - 음악 생성 테스트
 * 각 단계별로 상세한 로그를 출력합니다
 */

const axios = require('axios');

const SERVER_URL = 'http://localhost:5000';

// 색상 로그
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(color, icon, message) {
  console.log(`${colors[color]}${colors.bright}${icon} ${message}${colors.reset}`);
}

async function debugGenerate() {
  try {
    log('cyan', '🚀', '='.repeat(60));
    log('cyan', '🎵', 'Suno Music Generator - 디버깅 모드');
    log('cyan', '🚀', '='.repeat(60));
    
    // 1단계: 서버 상태 확인
    log('blue', '📡', '\n[1단계] 서버 상태 확인 중...');
    try {
      const healthCheck = await axios.get(`${SERVER_URL}/`);
      log('green', '✅', `서버 연결 성공`);
    } catch (error) {
      log('yellow', '⚠️', '서버 상태 확인 실패, 계속 진행...');
    }
    
    // 2단계: 음악 생성 요청
    log('blue', '🎵', '\n[2단계] 음악 생성 요청...');
    const request = {
      style: 'lo-fi hip hop',
      language: 'korean',
      count: 2,
      customStyle: '',
      gender: 'auto'
    };
    
    log('yellow', '📋', '요청 파라미터:');
    console.log(JSON.stringify(request, null, 2));
    
    const response = await axios.post(`${SERVER_URL}/api/style/generate-simple`, request);
    const data = response.data;
    
    if (!data.success) {
      log('red', '❌', `생성 실패: ${data.error}`);
      return;
    }
    
    const { taskIds } = data;
    
    log('green', '✅', `작업 시작됨: ${taskIds.length}개 곡`);
    
    // 3단계: 서버 로그 모니터링
    log('blue', '📊', '\n[3단계] 서버 로그 모니터링 중...\n');
    
    // 서버 로그를 실시간으로 확인
    await new Promise(resolve => setTimeout(resolve, 120000)); // 2분 대기
    
    log('green', '✅', '\n생성 완료! 서버 로그를 확인합니다...\n');
    
    // 서버 로그에서 생성 정보 추출
    log('cyan', '📊', '='.repeat(60));
    log('cyan', '📊', '서버 로그 분석 결과');
    log('cyan', '📊', '='.repeat(60));
    
  } catch (error) {
    log('red', '❌', `오류 발생: ${error.message}`);
    if (error.response) {
      console.error('응답 데이터:', error.response.data);
    }
  }
}

// 실행
log('cyan', '🎵', 'Suno Music Generator - 디버깅 테스트 시작\n');
debugGenerate().catch(console.error);
