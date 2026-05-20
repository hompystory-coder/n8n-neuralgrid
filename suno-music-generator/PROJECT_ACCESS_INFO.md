# 🔐 Suno Music Generator - 프로젝트 접속 정보

**작성일:** 2026-05-17 00:57 UTC
**목적:** 나중에 AI가 프로젝트에 다시 접속할 때 참고용

---

## 📋 샌드박스 정보

```
샌드박스 ID: iivtan8dhgihp36f7am7d-a402f90a
Public URL: https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai
플랫폼: Novita AI Sandbox
```

---

## 📁 프로젝트 경로

```bash
프로젝트 루트: /home/user/webapp/suno-music-generator
사용자: user
홈 디렉토리: /home/user
```

---

## 🗂️ 주요 파일 구조

```
/home/user/webapp/suno-music-generator/
├── server/
│   ├── index.js (메인 서버 엔트리)
│   ├── services/
│   │   ├── audioAnalyzer.js (13K) ✅ OpenAI GPT-4o Audio 분석
│   │   ├── openaiImageGenerator.js (3.9K) ✅ DALL-E 3 이미지 생성
│   │   ├── thumbnailGenerator.js (썸네일 템플릿)
│   │   ├── sunoClient.js (Suno API)
│   │   └── lyricsGenerator.js (가사 생성)
│   ├── routes/
│   │   └── music.js (19K) ✅ 음악 관련 API 라우터
│   └── models/
├── client/
│   └── workflow.html (330K) ✅ 프론트엔드 UI
├── backups/ (백업 폴더)
├── storage/ (음악 파일 저장)
├── package.json
└── .env (환경 변수)
```

---

## 🔧 환경 설정

### Node.js
```bash
Node.js: v20.19.6
npm: 10.8.2
```

### 환경 변수 (.env)
```bash
OPENAI_API_KEY=sk-proj-EWS7got... (164자)
SUNO_API_KEY=ed2ac381296182c4891cfec2d22138a5
```

### 서버 포트
```bash
PORT: 5000
```

---

## 🚀 서버 관리

### 서버 시작
```bash
cd /home/user/webapp/suno-music-generator
node server/index.js
# 또는 백그라운드
nohup node server/index.js > server.log 2>&1 &
```

### 서버 상태 확인
```bash
ps aux | grep "node server/index.js" | grep -v grep
# PID 확인 후
kill <PID>  # 종료
```

### 현재 실행 중 (2026-05-17 기준)
```bash
PID: 718
Shell ID: bash_3c0c82a3 (백그라운드)
상태: Running ✅
```

---

## 📊 주요 API 엔드포인트

### 오디오 업로드 & 분석
```
POST /api/music/upload-audio
- 파일: multipart/form-data (최대 25MB)
- 반환: { success, tags, analysis }
```

### 음악 생성
```
POST /api/music/generate
- Body: { prompt, style, title, lyrics, model }
- 반환: { success, taskId, data }
```

### 상태 확인
```
GET /api/music/status/:taskId
- 반환: { success, status, data }
```

### Health Check
```
GET /api/health
- 반환: { status: "healthy", timestamp, service }
```

---

## 🔄 백업 정보

### 최근 백업
```bash
backups/audioAnalyzer.js.20260517_005741
backups/music.js.20260517_005741
```

### 백업 생성 명령어
```bash
BACKUP_TIME=$(date +%Y%m%d_%H%M%S)
cp server/services/audioAnalyzer.js "backups/audioAnalyzer.js.$BACKUP_TIME"
cp server/routes/music.js "backups/music.js.$BACKUP_TIME"
cp client/workflow.html "backups/workflow.html.$BACKUP_TIME"
```

---

## 🎯 현재 작업 상태

### 완료된 것
- ✅ OpenAI GPT-4o Audio 분석 시스템
- ✅ Suno API 음악 생성
- ✅ DALL-E 3 이미지 생성 (별도 파일)
- ✅ 썸네일 템플릿 시스템
- ✅ 서버 실행 중

### 진행 중 (2026-05-17)
- 🔄 오디오 분석 → 자동 썸네일 생성 통합
- 🔄 프론트엔드 썸네일 미리보기 추가

### 해야 할 것
1. `audioAnalyzer.js`에 `generateThumbnailPrompts()` 메서드 추가
2. `music.js`의 `/upload-audio`에 이미지 생성 통합
3. `workflow.html`에 썸네일 미리보기 UI 추가

---

## 🛠️ Genspark AI 도구 사용법

AI가 샌드박스에 접근할 때 사용하는 도구:

### Bash Tool
```typescript
cd /home/user/webapp/suno-music-generator
# 모든 Linux 명령어 실행 가능
```

### Read Tool
```typescript
파일 경로: /home/user/webapp/suno-music-generator/server/services/audioAnalyzer.js
```

### Edit Tool
```typescript
파일 수정 (find & replace)
old_string → new_string
```

### Write Tool
```typescript
새 파일 생성 또는 전체 덮어쓰기
```

---

## 📝 중요 참고사항

1. **작업 디렉토리 항상 확인**
   ```bash
   cd /home/user/webapp/suno-music-generator && pwd
   ```

2. **서버 재시작 필요 시**
   ```bash
   # 현재 프로세스 종료
   pkill -f "node server/index.js"
   # 재시작
   node server/index.js &
   ```

3. **파일 수정 전 항상 백업**
   ```bash
   cp <original> "backups/<filename>.$(date +%Y%m%d_%H%M%S)"
   ```

4. **Public URL 접속**
   - 브라우저: https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai
   - API 테스트: 위 URL + /api/...

---

## ⚡ Quick Start (다음 세션용)

```bash
# 1. 프로젝트 디렉토리 이동
cd /home/user/webapp/suno-music-generator

# 2. 서버 상태 확인
ps aux | grep "node server/index.js" | grep -v grep

# 3. 파일 확인
ls -lh server/services/audioAnalyzer.js
ls -lh server/routes/music.js
ls -lh client/workflow.html

# 4. 최근 백업 확인
ls -lt backups/ | head -5

# 5. 환경 변수 확인
cat .env | grep -E "(OPENAI|SUNO)"

# 6. Public URL 확인
echo "https://5000-iivtan8dhgihp36f7am7d-a402f90a.sandbox.novita.ai"
```

---

## 🔗 관련 문서

- `README.md` - 프로젝트 개요
- `SUNO_AUDIO_UPLOAD_API_TEST_COMPLETE.md` - 오디오 업로드 테스트
- `ADVANCED_ANALYZER.md` - 분석기 문서
- `AI-STYLE-ANALYSIS.md` - AI 스타일 분석

---

**마지막 업데이트:** 2026-05-17 00:57:41 UTC
**작성자:** AI Assistant (Claude)
**목적:** 프로젝트 컨텍스트 보존
