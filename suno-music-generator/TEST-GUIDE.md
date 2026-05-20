# 🎵 Suno Music Generator - 15곡 테스트 가이드

## 📋 테스트 진행 방법

### 1단계: 웹 UI에서 15곡 생성

1. **워크플로우 페이지 열기:**
   ```
   https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow
   ```

2. **설정 입력:**
   - **스타일:** `cozy-lofi acoustic emotional dreamy`
   - **곡 수:** `15`
   - **언어:** `English`
   - **보컬 성별:** `neutral`

3. **생성 버튼 클릭:**
   - `🎵 음악 생성` 버튼 클릭
   - 약 30-45분 대기 (Suno API 처리 시간)

---

### 2단계: 생성 완료 후 자동 분석

생성이 완료되면 다음 명령으로 자동 분석:

```bash
cd /home/user/webapp/suno-music-generator
node analyze-songs.js
```

**분석 항목:**
1. ✅ 15곡 생성 확인
2. ✅ 가사 중복 검사 (1,700+ 단어 사전 효과 검증)
3. ✅ 이미지 업스케일 테스트 (3곡 선택, 1280×720 + 3000×3000)
4. ✅ 앨범 메타데이터 생성 (YouTube 업로드 정보)
5. ✅ 다운로드 기능 테스트 (3곡 선택)

---

### 3단계: 테스트 결과 확인

**생성되는 보고서:**
- `FINAL-TEST-REPORT.json` - 상세 JSON 보고서
- `FINAL-TEST-REPORT.md` - 마크다운 보고서

**예상 결과:**
```
✅ 15곡 생성 완료
✅ 가사 중복 0건 (모두 고유)
✅ 이미지 업스케일 3개 완료
✅ 앨범 메타데이터 생성 완료
✅ 다운로드 3개 완료
```

---

## 🚀 빠른 테스트 (현재 상태)

이미 생성된 곡이 있다면 바로 분석 가능:

```bash
# 서버 상태 확인
cd /home/user/webapp/suno-music-generator
ps aux | grep node

# 최근 15곡 분석
node analyze-songs.js
```

---

## 🔧 문제 발생 시

### 메타데이터 생성 실패
```bash
# API 엔드포인트 확인
curl -X POST https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/api/style/generate-album-metadata \
  -H "Content-Type: application/json" \
  -d '{"songs":[{"title":"Test","lyrics":"test","duration":180}]}'
```

### 이미지 업스케일 실패
```bash
# Sharp 라이브러리 확인
cd /home/user/webapp/suno-music-generator
npm list sharp
```

### 서버 재시작
```bash
cd /home/user/webapp/suno-music-generator
pm2 restart all
# 또는
lsof -ti:5000 | xargs kill -9
PORT=5000 node server/index.js > server.log 2>&1 &
```

---

## 📊 현재 시스템 상태

### ✅ 완료된 기능

1. **가사 생성 시스템**
   - 한국어: 730+ 단어
   - 영어: 975+ 단어 + 100+ 패턴
   - 총 1,700+ 단어 사전
   - 중복 방지 알고리즘

2. **이미지 업스케일**
   - Sharp 라이브러리 사용
   - YouTube 썸네일: 1280×720 (16:9)
   - 앨범 커버: 3000×3000 (1:1)
   - JPEG 95% 품질

3. **Time Track**
   - 실제 곡 길이 기반 계산
   - MM:SS 타임스탬프
   - 누적 재생 시간

4. **메타데이터 자동 생성**
   - 앨범 제목
   - YouTube 제목 (총 재생 시간 포함)
   - 설명 (Time Track 포함)
   - 50+ 태그 (한국어/영어)

---

## 📝 테스트 체크리스트

- [ ] 15곡 생성 요청
- [ ] 생성 완료 확인 (30-45분 대기)
- [ ] 가사 중복 검사 실행
- [ ] 3곡 이미지 업스케일 테스트
- [ ] 앨범 메타데이터 생성 테스트
- [ ] 3곡 다운로드 테스트
- [ ] 최종 보고서 확인
- [ ] 문제 발견 시 수정
- [ ] Git 커밋 및 PR 생성

---

**테스트 실행 URL:**
https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai/workflow

**서버 로그 확인:**
```bash
tail -f /home/user/webapp/suno-music-generator/server.log
```
