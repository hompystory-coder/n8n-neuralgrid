# 🚀 NeuralGrid Server Update Guide

## 랜딩 페이지 업데이트 완료! 

새로운 **젊고 트렌디한 UI**와 **풍부한 AI 쇼츠 자동화 콘텐츠**가 추가되었습니다! 🎉

---

## ✨ 업데이트 내용

### 🎨 UI/UX 개선
- **모던 그라데이션 디자인** (Purple/Pink/Orange)
- **부드러운 애니메이션**과 호버 효과
- **반응형 레이아웃** (모바일 최적화)
- **글래스모피즘 네비게이션**

### 📋 콘텐츠 구조

#### 1️⃣ **Hero Section** (첫 화면)
- "자동화로 미래를 만드세요" - 강렬한 헤드라인
- 노코드 워크플로우 + AI 쇼츠 생성 소개
- CTA 버튼: "무료로 시작하기" / "AI 쇼츠 보기"

#### 2️⃣ **Two Solutions** (핵심 솔루션)

**A. 워크플로우 자동화 (n8n 기반)**
- 300+ 앱 통합 (Slack, Gmail, Notion)
- 비주얼 워크플로우 에디터
- 실시간 모니터링 & 알림
- 커스텀 로직 & 조건부 실행
- 🔗 [n8n 에디터 바로가기](http://n8n.neuralgrid.kr)

**B. AI 쇼츠 자동 생성** 🔥
- AI 스크립트 자동 생성
- TTS 보이스오버 (한국어/영어)
- 자동 자막 생성 & 디자인
- 멀티 플랫폼 최적화 렌더링

#### 3️⃣ **AI Shorts Detailed Section** (AI 쇼츠 상세)

**3분이면 쇼츠 영상 완성!**

**제작 프로세스 (4단계):**
1. **주제 입력** - 트렌드 키워드 입력
2. **AI 자동 생성** - 스크립트, 음성, 자막
3. **영상 렌더링** - 플랫폼별 최적화
4. **자동 업로드** - YouTube, Instagram, TikTok 동시 업로드

**지원 플랫폼:**
- 🎥 **YouTube Shorts** (9:16 최적화)
- 📷 **Instagram Reels** (9:16 최적화)
- 🎵 **TikTok** (9:16 최적화)

**핵심 기능:**
- ✍️ **AI 스크립트 작성** - 바이럴 콘텐츠 패턴 분석
- 🎙️ **자연스러운 TTS** - ElevenLabs 기반 고품질 음성
- 🎨 **자동 자막 & 효과** - 트렌디한 디자인, 배경 음악

#### 4️⃣ **Features Grid** (플랫폼 기능)
- ⚡ **초고속 렌더링** - GPU 가속, 3분 안에 풀HD 완성
- 🎨 **템플릿 라이브러리** - 100+ 프리미엄 템플릿
- 📊 **분석 대시보드** - 실시간 조회수, 참여율 통계
- 🔗 **API 통합** - RESTful API 외부 연동
- 🌐 **멀티 계정 관리** - 여러 SNS 계정 통합 관리
- 🔐 **안전한 저장소** - 클라우드 스토리지

#### 5️⃣ **Pricing** (가격 플랜)

| 플랜 | 가격 | 워크플로우 | 실행 | AI 쇼츠 | 특징 |
|------|------|------------|------|---------|------|
| **Starter** | ₩0/월 | 3개 | 1,000회/월 | 5개/월 | 기본 템플릿, 커뮤니티 지원 |
| **Pro** 🔥 | ₩29,000/월 | 무제한 | 10,000회/월 | 50개/월 | 프리미엄 템플릿, 우선 지원, API |
| **Business** | ₩99,000/월 | 무제한 | 무제한 | 무제한 | 커스텀 템플릿, 24/7 지원, 화이트라벨 |

#### 6️⃣ **Footer** (푸터)
- 솔루션/리소스/회사 정보
- 빠른 링크 (API 문서, n8n 에디터, 대시보드 등)

---

## 🔧 서버에 업데이트 적용하기

### **빠른 업데이트 (30초 완료)**

```bash
# SSH 접속
ssh azamans@115.91.5.140
# 비밀번호: 7009011226119

# 프로젝트 디렉토리로 이동
cd ~/n8n-neuralgrid

# 최신 코드 가져오기
git pull origin genspark_ai_developer

# 프로덕션 빌드 & 재시작
cd apps/web && pnpm run build && cd ~/n8n-neuralgrid && pm2 restart neuralgrid-web && pm2 logs neuralgrid-web --lines 20
```

### **전체 단계별 가이드**

```bash
# 1. SSH 접속
ssh azamans@115.91.5.140

# 2. 최신 코드 Pull
cd ~/n8n-neuralgrid
git pull origin genspark_ai_developer

# 3. Next.js 빌드
cd apps/web
pnpm run build

# 4. PM2 재시작
cd ~/n8n-neuralgrid
pm2 restart neuralgrid-web

# 5. 로그 확인 (성공 확인)
pm2 logs neuralgrid-web --lines 30

# 6. PM2 설정 저장
pm2 save
```

### **성공 확인 방법**

빌드 성공 메시지:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (7/7)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    15.3 kB        103 kB
└ ○ /api-docs                            8.2 kB         95.9 kB
```

PM2 로그 확인:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
✓ Ready in XXXms
```

---

## 🌐 접속 URL

배포 완료 후 아래 URL에서 확인하세요:

| 서비스 | URL | 설명 |
|--------|-----|------|
| 🏠 **메인 랜딩페이지** | http://neuralgrid.kr | 또는 http://115.91.5.140:3000 |
| 📖 **API 문서** | http://neuralgrid.kr/api-docs | RESTful API 18개 엔드포인트 |
| 🔄 **n8n 에디터** | http://n8n.neuralgrid.kr | 워크플로우 자동화 에디터 |
| 📊 **대시보드** | http://neuralgrid.kr/dashboard | (로그인 필요) |

---

## 🆘 트러블슈팅

### ❌ 빌드 실패 시

```bash
# 1. node_modules 재설치
cd ~/n8n-neuralgrid
rm -rf node_modules
pnpm install

# 2. 다시 빌드
cd apps/web
pnpm run build
```

### ❌ PM2 프로세스 오류 시

```bash
# PM2 완전 재시작
pm2 delete neuralgrid-web
pm2 start ~/n8n-neuralgrid/ecosystem.config.js
pm2 save
pm2 logs neuralgrid-web --lines 30
```

### ❌ Nginx 502 에러 시

```bash
# Nginx 상태 확인
sudo systemctl status nginx

# Nginx 재시작
sudo systemctl reload nginx

# 포트 3000 확인
sudo lsof -i :3000
curl http://localhost:3000
```

### ❌ Git Pull 충돌 시

```bash
# 로컬 변경사항 임시 저장
git stash

# 최신 코드 가져오기
git pull origin genspark_ai_developer

# 임시 저장 삭제
git stash drop
```

---

## 📊 현재 프로젝트 상태

✅ **완료된 작업:**
- TypeScript 에러 0개 ✅
- Prisma Schema 7개 모델 ✅
- API 엔드포인트 18개 ✅
- NextAuth 인증 구현 ✅
- Toss Payments 연동 ✅
- n8n Proxy 설정 ✅
- PM2 프로덕션 설정 ✅
- Nginx 리버스 프록시 ✅
- 도메인 연결 (neuralgrid.kr, n8n.neuralgrid.kr) ✅
- **🆕 모던 랜딩 페이지 UI/UX** ✅
- **🆕 AI 쇼츠 자동화 콘텐츠** ✅

🔄 **실행 중인 서비스:**
- `neuralgrid-web` (Next.js) - Port 3000
- `n8n-server` (n8n) - Port 5678
- `youtube-shorts-generator` (AI 쇼츠)

---

## 🎯 다음 단계

1. **서버 업데이트 실행** (위 명령어 참고)
2. **http://neuralgrid.kr 접속하여 확인**
3. **SSL 인증서 설치** (선택사항):
   ```bash
   sudo certbot --nginx -d neuralgrid.kr -d www.neuralgrid.kr -d n8n.neuralgrid.kr
   ```

---

## 📞 지원

문제가 발생하면 아래 정보와 함께 문의하세요:
- PM2 로그: `pm2 logs neuralgrid-web --err --lines 50`
- Nginx 로그: `sudo tail -n 50 /var/log/nginx/error.log`
- 시스템 로그: `journalctl -xe`

---

**Made with 💜 by NeuralGrid Team**
**Last Updated: 2025-12-07**
