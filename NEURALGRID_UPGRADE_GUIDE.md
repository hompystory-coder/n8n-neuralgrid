# NeuralGrid 플랫폼 업그레이드 가이드

## 📋 개요
이 가이드는 NeuralGrid 플랫폼에 다음 기능들을 추가하는 전체 프로세스를 안내합니다:
- ✅ 회원가입/로그인 (NextAuth + Prisma)
- ✅ 마이페이지 (프로필, 사용량, 결제내역)
- ✅ 슈퍼 관리자 대시보드
- ✅ 통합 서버 모니터링 (monitor.neuralgrid.kr)

## 🚀 실행 순서

### Step 1: Prisma 스키마 생성 및 데이터베이스 마이그레이션
### Step 2: NextAuth 설정 업데이트
### Step 3: 인증 API 라우트 구현
### Step 4: 회원가입/로그인 페이지
### Step 5: 마이페이지
### Step 6: 슈퍼 관리자 대시보드
### Step 7: 서버 모니터링 서브도메인 설정
### Step 8: 네비게이션 업데이트
### Step 9: 빌드 및 배포

---

## 📂 프로젝트 구조

```
~/n8n-neuralgrid/apps/web/
├── prisma/
│   └── schema.prisma          # NEW - 데이터베이스 스키마
├── app/
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx       # NEW - 로그인 페이지
│   │   └── signup/
│   │       └── page.tsx       # NEW - 회원가입 페이지
│   ├── mypage/
│   │   └── page.tsx           # NEW - 마이페이지
│   ├── admin/
│   │   └── page.tsx           # NEW - 슈퍼 관리자 대시보드
│   ├── api/
│   │   └── auth/
│   │       └── [...nextauth]/
│   │           └── route.ts   # UPDATE - NextAuth 설정
│   ├── components/
│   │   ├── Navigation.tsx     # NEW - 네비게이션 컴포넌트
│   │   └── ProtectedRoute.tsx # NEW - 보호된 라우트
│   ├── layout.tsx             # UPDATE - 네비게이션 추가
│   └── page.tsx               # UPDATE - 메인 페이지
└── .env                        # UPDATE - 환경변수 추가
```

---

## 🎯 구현 세부사항

### 기능 1: 사용자 인증
- **기술**: NextAuth.js + Prisma
- **지원**: Email/Password 인증
- **보안**: bcrypt 비밀번호 해싱
- **세션**: JWT 토큰

### 기능 2: 역할 기반 접근 제어 (RBAC)
- **USER**: 일반 사용자 (대시보드, 마이페이지)
- **ADMIN**: 슈퍼 관리자 (모든 권한 + 관리자 대시보드)

### 기능 3: 마이페이지
- 프로필 정보
- 사용량 통계 (워크플로우, AI 쇼츠)
- 결제 내역
- 구독 플랜

### 기능 4: 슈퍼 관리자 대시보드
- 전체 사용자 목록
- 시스템 통계
- 서버 상태 모니터링
- 사용자 관리 (활성화/비활성화)

### 기능 5: 통합 서버 모니터링
- **도메인**: https://monitor.neuralgrid.kr
- **기능**: 실시간 서버 메트릭 (CPU, 메모리, 디스크, 네트워크)
- **접근**: ADMIN 역할만 접근 가능

---

## 📦 필수 패키지

이미 설치된 패키지:
- ✅ next-auth (4.24.0)
- ✅ @prisma/client (5.7.0)
- ✅ bcryptjs
- ✅ zod

추가 설치 필요:
```bash
cd ~/n8n-neuralgrid/apps/web
pnpm add @types/bcryptjs systeminformation
pnpm add -D prisma
```

---

## 🔐 환경변수 설정

`~/n8n-neuralgrid/apps/web/.env` 파일에 추가:

```env
# 기존 설정
DATABASE_URL="postgresql://neuralgrid@localhost:5434/n8n_neuralgrid"
NEXTAUTH_URL="https://neuralgrid.kr"
N8N_WEBHOOK_URL="http://115.91.5.140:5678"

# 새로 추가
NEXTAUTH_SECRET="your-super-secret-nextauth-key-change-this-32chars-min"
```

**중요**: `NEXTAUTH_SECRET`은 반드시 변경하세요!
생성 방법: `openssl rand -base64 32`

---

## 🗄️ 데이터베이스 스키마

이 가이드의 Step 1에서 생성할 `prisma/schema.prisma` 파일 개요:

### 모델:
- **User**: 사용자 정보 (email, password, name, role)
- **Account**: OAuth 계정 (NextAuth 연동)
- **Session**: 사용자 세션
- **VerificationToken**: 이메일 인증 토큰
- **Subscription**: 구독 정보
- **Usage**: 사용량 통계
- **AuditLog**: 관리자 작업 로그

---

## 🌐 서브도메인 설정

### monitor.neuralgrid.kr

1. **Nginx 설정**:
   - `/etc/nginx/sites-available/monitor.neuralgrid.kr`
   - Proxy to `http://127.0.0.1:3002` (모니터링 API)

2. **SSL 인증서**:
   ```bash
   sudo certbot --nginx -d monitor.neuralgrid.kr
   ```

3. **PM2 프로세스**:
   - 새 서비스: `monitor-server` (포트 3002)

---

## 📊 모니터링 API

실시간 서버 메트릭을 제공하는 별도 Express 서버:
- **포트**: 3002
- **엔드포인트**: `/api/metrics`, `/api/pm2-status`, `/api/nginx-logs`
- **인증**: NextAuth 세션 토큰 검증
- **권한**: ADMIN만 접근

---

## 🎨 디자인 가이드

기존 NeuralGrid 디자인 유지:
- **컬러**: Purple (#A855F7) / Pink (#EC4899) 그라데이션
- **테마**: Dark mode
- **스타일**: Glassmorphism, backdrop-blur
- **폰트**: Inter (기본), 나눔고딕 (한글)

---

## ✅ 테스트 체크리스트

### 인증 테스트
- [ ] 회원가입 (신규 사용자)
- [ ] 로그인 (등록된 사용자)
- [ ] 로그아웃
- [ ] 세션 유지 (페이지 새로고침)
- [ ] 보호된 라우트 접근 (미인증 시 리다이렉트)

### 마이페이지 테스트
- [ ] 프로필 정보 표시
- [ ] 사용량 통계 표시
- [ ] 구독 정보 표시

### 관리자 대시보드 테스트
- [ ] ADMIN 계정으로 접근
- [ ] USER 계정으로 접근 (거부됨)
- [ ] 사용자 목록 표시
- [ ] 시스템 통계 표시

### 모니터링 테스트
- [ ] https://monitor.neuralgrid.kr 접근
- [ ] 실시간 메트릭 표시
- [ ] PM2 상태 표시
- [ ] Nginx 로그 표시

---

## 🔄 배포 프로세스

### 최종 배포 명령어:
```bash
# 1. 데이터베이스 마이그레이션
cd ~/n8n-neuralgrid/apps/web
pnpm prisma db push

# 2. Next.js 빌드
pnpm run build

# 3. PM2 재시작
cd ~/n8n-neuralgrid
pm2 restart neuralgrid-web

# 4. 모니터링 서버 시작 (새로 추가)
pm2 start ecosystem.config.js --only monitor-server

# 5. PM2 저장
pm2 save
```

### 검증:
```bash
# PM2 상태 확인
pm2 status

# 로그 확인
pm2 logs neuralgrid-web --lines 50

# 웹사이트 접근 테스트
curl -I https://neuralgrid.kr
curl -I https://neuralgrid.kr/auth/signin
curl -I https://neuralgrid.kr/dashboard
curl -I https://monitor.neuralgrid.kr
```

---

## 📞 트러블슈팅

### 문제 1: Prisma 연결 실패
```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql
# 포트 확인
netstat -tuln | grep 5434
```

### 문제 2: NextAuth 세션 오류
```bash
# NEXTAUTH_SECRET 확인
cat ~/n8n-neuralgrid/apps/web/.env | grep NEXTAUTH_SECRET
```

### 문제 3: 빌드 오류
```bash
# 캐시 삭제 후 재빌드
cd ~/n8n-neuralgrid/apps/web
rm -rf .next
pnpm run build
```

---

## 🎉 완료 후 접근 URL

- **메인**: https://neuralgrid.kr
- **로그인**: https://neuralgrid.kr/auth/signin
- **회원가입**: https://neuralgrid.kr/auth/signup
- **대시보드**: https://neuralgrid.kr/dashboard
- **마이페이지**: https://neuralgrid.kr/mypage
- **관리자**: https://neuralgrid.kr/admin
- **모니터링**: https://monitor.neuralgrid.kr
- **AI 쇼츠**: https://shorts.neuralgrid.kr
- **n8n**: https://n8n.neuralgrid.kr

---

다음 단계로 진행하시겠습니까? 각 Step별 상세 코드를 생성해드리겠습니다.
