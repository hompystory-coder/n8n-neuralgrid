# 🎭 Suno API 크레딧 부족 - 데모 모드 활성화됨

## 🔴 현재 상황

```
Error: The current credits are insufficient. Please top up.
```

**Suno API 계정의 크레딧이 소진**되어 실제 음악 생성이 불가능합니다.

---

## ✅ 임시 해결책: 데모 모드

시스템이 자동으로 **데모 모드**로 전환되어, 크레딧 없이도 **전체 워크플로우를 테스트**할 수 있습니다!

### 데모 모드에서 제공되는 것:
- ✅ 실제 Suno API로 생성된 샘플 음악
- ✅ 전체 워크플로우 (가사 생성 → 스타일 선택 → 음악 생성 → 재생)
- ✅ 오디오 플레이어, 다운로드, 공유 기능
- ✅ "🎭 데모 모드" 알림 표시

### 샘플 음악 정보:
- **제목**: Demo Music
- **오디오 URL**: https://cdn1.suno.ai/f8c208e2-30cc-43f8-bbff-257bb7c52424.mp3
- **이미지 URL**: https://cdn2.suno.ai/image_f8c208e2-30cc-43f8-bbff-257bb7c52424.jpeg
- **길이**: 44.8초
- **스타일**: Emotional ballad

---

## 💰 정식 사용 방법: Suno API 크레딧 충전

### 1️⃣ Suno API 사이트 접속
```
https://api.sunoapi.org/
```

### 2️⃣ 계정 로그인
- 현재 사용 중인 API 키로 로그인

### 3️⃣ 크레딧 구매
- 대시보드에서 "Top Up" 또는 "충전" 버튼 클릭
- 원하는 크레딧 패키지 선택
- 결제 진행

### 4️⃣ 자동 전환
- 크레딧 충전 후 **서버 재시작 불필요**
- 다음 음악 생성 요청부터 자동으로 정상 모드로 전환됨
- 데모 모드 알림이 사라지고 실제 음악 생성됨

---

## 🎯 지금 바로 데모 모드 체험!

### 접속 URL:
**https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow**

### 사용 방법:
1. URL 접속
2. "봄날의 설렘" 입력 → 가사 생성
3. "감성 발라드" 프리셋 선택
4. "🎵 음악 생성 시작" 클릭
5. **⚠️ "데모 모드" 알림 표시**
6. 즉시 완료 → ▶️ 재생 버튼 클릭
7. 🎵 샘플 음악 감상!

---

## 📊 데모 모드 vs 정상 모드 비교

| 기능 | 데모 모드 | 정상 모드 |
|------|-----------|-----------|
| 가사 생성 | ✅ 작동 | ✅ 작동 |
| 스타일 선택 | ✅ 작동 | ✅ 작동 |
| 음악 생성 | 🎭 샘플 제공 | 🎵 실제 생성 |
| 오디오 플레이어 | ✅ 작동 | ✅ 작동 |
| 다운로드 | ✅ 샘플 다운로드 | ✅ 실제 다운로드 |
| 커스터마이징 | ❌ 불가 | ✅ 가능 |
| 생성 시간 | ⚡ 즉시 | ⏱️ 30-60초 |
| 크레딧 소모 | 💰 0 | 💰 1회당 크레딧 차감 |

---

## 🔧 기술적 구현 내역

### 서버 측 (server/routes/music.js):
```javascript
// 크레딧 부족 감지
if (result.error?.message?.includes('insufficient')) {
  // 데모 Task ID 생성
  const demoTaskId = 'DEMO_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  
  return res.json({
    success: true,
    taskId: demoTaskId,
    isDemo: true
  });
}

// 데모 상태 반환
if (taskId.startsWith('DEMO_')) {
  return res.json({
    status: 'completed',
    data: {
      audioUrl: 'https://cdn1.suno.ai/f8c208e2-30cc-43f8-bbff-257bb7c52424.mp3',
      isDemo: true
    }
  });
}
```

### 프론트엔드 (client/workflow.html):
```javascript
// 데모 모드 알림
if (result.isDemo) {
  showNotification('⚠️ 데모 모드: Suno API 크레딧이 부족하여 샘플 음악을 제공합니다.', 'warning');
}

// 완료 시 안내
if (result.data.isDemo) {
  showNotification('🎭 샘플 음악이 제공되었습니다. 실제 생성을 위해 크레딧을 충전해주세요.', 'info');
}
```

---

## ❓ FAQ

### Q: 데모 모드에서 여러 음악을 생성할 수 있나요?
A: 네! 무제한으로 테스트 가능합니다. 단, 모두 동일한 샘플 음악이 제공됩니다.

### Q: 샘플 음악을 다운로드할 수 있나요?
A: 네! 다운로드 버튼이 정상 작동하며, 실제 MP3 파일을 받을 수 있습니다.

### Q: 크레딧을 충전하면 어떻게 되나요?
A: 다음 생성 요청부터 자동으로 정상 모드로 전환되어, 사용자가 입력한 가사/스타일로 실제 음악이 생성됩니다.

### Q: 데모 모드가 표시되지 않으면?
A: 이미 크레딧이 충분하거나, 다른 문제가 있을 수 있습니다. 브라우저 콘솔(F12)에서 에러 메시지를 확인해주세요.

---

## 📞 추가 지원

### Suno API 관련 문의:
- 공식 웹사이트: https://api.sunoapi.org/
- 문서: https://docs.sunoapi.org/
- 크레딧 정책: 사이트 내 가격 페이지 참고

### 프로젝트 관련 문의:
- GitHub 이슈 등록
- 또는 개발자에게 직접 연락

---

## 🎉 결론

데모 모드 덕분에 **크레딧 없이도 전체 시스템을 체험**할 수 있습니다!

- ✅ 모든 기능 작동 확인 가능
- ✅ UI/UX 테스트 가능
- ✅ 워크플로우 검증 완료
- 💰 크레딧 충전 → 실제 음악 생성 가능

**지금 바로 체험해보세요!**

---

**접속 URL**: https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow

**상태**: 🎭 Demo Mode Active  
**크레딧 충전 후**: 🎵 Full Production Mode
