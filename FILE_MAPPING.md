# NeuralGrid 업그레이드 - 파일 매핑 가이드

## 📁 전체 파일 목록 및 설치 경로

### 서버 경로: `115.91.5.140` (azamans@)

---

## 1️⃣ Prisma 데이터베이스 스키마

| 소스 파일 | 서버 경로 | 설명 |
|-----------|-----------|------|
| `step1_prisma_schema.prisma` | `~/n8n-neuralgrid/apps/web/prisma/schema.prisma` | 사용자, 구독, 사용량 테이블 정의 |

**설치 명령**:
```bash
mkdir -p ~/n8n-neuralgrid/apps/web/prisma
# 파일 내용을 복사하여 schema.prisma로 저장
```

---

## 2️⃣ NextAuth 인증 설정

| 소스 파일 | 서버 경로 | 설명 |
|-----------|-----------|------|
| `step2_nextauth_route.ts` | `~/n8n-neuralgrid/apps/web/app/api/auth/[...nextauth]/route.ts` | NextAuth.js 설정 및 Credentials Provider |

**설치 명령**:
```bash
mkdir -p ~/n8n-neuralgrid/apps/web/app/api/auth/\[...nextauth\]
# 파일 내용을 route.ts로 저장
```

---

## 3️⃣ 회원가입 API

| 소스 파일 | 서버 경로 | 설명 |
|-----------|-----------|------|
| `step3_signup_api.ts` | `~/n8n-neuralgrid/apps/web/app/api/auth/signup/route.ts` | 회원가입 API 엔드포인트 |

**설치 명령**:
```bash
mkdir -p ~/n8n-neuralgrid/apps/web/app/api/auth/signup
# 파일 내용을 route.ts로 저장
```

---

## 4️⃣ 로그인 페이지

| 소스 파일 | 서버 경로 | 설명 |
|-----------|-----------|------|
| `step4_signin_page.tsx` | `~/n8n-neuralgrid/apps/web/app/auth/signin/page.tsx` | 로그인 UI 페이지 |

**설치 명령**:
```bash
mkdir -p ~/n8n-neuralgrid/apps/web/app/auth/signin
# 파일 내용을 page.tsx로 저장
```

---

## 5️⃣ 회원가입 페이지

| 소스 파일 | 서버 경로 | 설명 |
|-----------|-----------|------|
| `step5_signup_page.tsx` | `~/n8n-neuralgrid/apps/web/app/auth/signup/page.tsx` | 회원가입 UI 페이지 |

**설치 명령**:
```bash
mkdir -p ~/n8n-neuralgrid/apps/web/app/auth/signup
# 파일 내용을 page.tsx로 저장
```

---

## 6️⃣ 마이페이지

| 소스 파일 | 서버 경로 | 설명 |
|-----------|-----------|------|
| `step6_mypage.tsx` | `~/n8n-neuralgrid/apps/web/app/mypage/page.tsx` | 사용자 프로필 및 사용량 페이지 |

**설치 명령**:
```bash
mkdir -p ~/n8n-neuralgrid/apps/web/app/mypage
# 파일 내용을 page.tsx로 저장
```

---

## 7️⃣ 사용자 프로필 API

| 소스 파일 | 서버 경로 | 설명 |
|-----------|-----------|------|
| `step7_user_profile_api.ts` | `~/n8n-neuralgrid/apps/web/app/api/user/profile/route.ts` | 사용자 데이터 조회 API |

**설치 명령**:
```bash
mkdir -p ~/n8n-neuralgrid/apps/web/app/api/user/profile
# 파일 내용을 route.ts로 저장
```

---

## 8️⃣ 관리자 대시보드

| 소스 파일 | 서버 경로 | 설명 |
|-----------|-----------|------|
| `step8_admin_page.tsx` | `~/n8n-neuralgrid/apps/web/app/admin/page.tsx` | 슈퍼 관리자 전용 대시보드 |

**설치 명령**:
```bash
mkdir -p ~/n8n-neuralgrid/apps/web/app/admin
# 파일 내용을 page.tsx로 저장
```

---

## 9️⃣ 관리자 통계 API

| 소스 파일 | 서버 경로 | 설명 |
|-----------|-----------|------|
| `step9_admin_stats_api.ts` | `~/n8n-neuralgrid/apps/web/app/api/admin/stats/route.ts` | 시스템 통계 조회 API |

**설치 명령**:
```bash
mkdir -p ~/n8n-neuralgrid/apps/web/app/api/admin/stats
# 파일 내용을 route.ts로 저장
```

---

## 🔟 모니터링 서버

| 소스 파일 | 서버 경로 | 설명 |
|-----------|-----------|------|
| `step10_monitor_server.js` | `~/n8n-neuralgrid/monitor-server/index.js` | Express 기반 모니터링 API 서버 |

**설치 명령**:
```bash
mkdir -p ~/n8n-neuralgrid/monitor-server
# 파일 내용을 index.js로 저장

# package.json 생성
cd ~/n8n-neuralgrid/monitor-server
cat > package.json << 'EOF'
{
  "name": "neuralgrid-monitor",
  "version": "1.0.0",
  "main": "index.js",
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "systeminformation": "^5.21.20"
  }
}
EOF

pnpm install
```

---

## 1️⃣1️⃣ 모니터링 페이지

| 소스 파일 | 서버 경로 | 설명 |
|-----------|-----------|------|
| `step11_monitor_page.tsx` | `~/n8n-neuralgrid/apps/web/app/monitor/page.tsx` | 실시간 서버 모니터링 UI |

**설치 명령**:
```bash
mkdir -p ~/n8n-neuralgrid/apps/web/app/monitor
# 파일 내용을 page.tsx로 저장
```

---

## 1️⃣2️⃣ 배포 스크립트 (선택사항)

| 소스 파일 | 서버 경로 | 설명 |
|-----------|-----------|------|
| `step12_deploy_script.sh` | `~/n8n-neuralgrid/deploy_upgrade.sh` | 자동 배포 스크립트 |

**설치 명령**:
```bash
cd ~/n8n-neuralgrid
# 파일 내용을 deploy_upgrade.sh로 저장
chmod +x deploy_upgrade.sh

# 실행 (수동 배포를 권장)
# ./deploy_upgrade.sh
```

---

## 📋 빠른 설치 체크리스트

### Phase 1: 파일 생성 (Web App)
```bash
cd ~/n8n-neuralgrid/apps/web

# 디렉토리 구조 생성
mkdir -p prisma
mkdir -p app/api/auth/\[...nextauth\]
mkdir -p app/api/auth/signup
mkdir -p app/api/user/profile
mkdir -p app/api/admin/stats
mkdir -p app/auth/signin
mkdir -p app/auth/signup
mkdir -p app/mypage
mkdir -p app/admin
mkdir -p app/monitor
```

### Phase 2: 파일 생성 (Monitor Server)
```bash
cd ~/n8n-neuralgrid
mkdir -p monitor-server
```

### Phase 3: 파일 복사
각 `step*` 파일의 내용을 해당하는 서버 경로로 복사

---

## 🔄 파일 복사 순서 (권장)

### 1단계: 데이터베이스 스키마
```bash
# step1_prisma_schema.prisma → prisma/schema.prisma
nano ~/n8n-neuralgrid/apps/web/prisma/schema.prisma
```

### 2단계: API 라우트
```bash
# NextAuth 설정
nano ~/n8n-neuralgrid/apps/web/app/api/auth/\[...nextauth\]/route.ts

# 회원가입 API
nano ~/n8n-neuralgrid/apps/web/app/api/auth/signup/route.ts

# 프로필 API
nano ~/n8n-neuralgrid/apps/web/app/api/user/profile/route.ts

# 관리자 통계 API
nano ~/n8n-neuralgrid/apps/web/app/api/admin/stats/route.ts
```

### 3단계: 페이지 컴포넌트
```bash
# 로그인 페이지
nano ~/n8n-neuralgrid/apps/web/app/auth/signin/page.tsx

# 회원가입 페이지
nano ~/n8n-neuralgrid/apps/web/app/auth/signup/page.tsx

# 마이페이지
nano ~/n8n-neuralgrid/apps/web/app/mypage/page.tsx

# 관리자 페이지
nano ~/n8n-neuralgrid/apps/web/app/admin/page.tsx

# 모니터링 페이지
nano ~/n8n-neuralgrid/apps/web/app/monitor/page.tsx
```

### 4단계: 모니터링 서버
```bash
# 모니터링 서버 메인 파일
nano ~/n8n-neuralgrid/monitor-server/index.js

# package.json 생성 (위의 명령 참조)
nano ~/n8n-neuralgrid/monitor-server/package.json
```

---

## 📦 필요한 의존성 설치

### Web App
```bash
cd ~/n8n-neuralgrid/apps/web
pnpm add @types/bcryptjs @next-auth/prisma-adapter
pnpm add -D prisma
```

### Monitor Server
```bash
cd ~/n8n-neuralgrid/monitor-server
pnpm install
```

---

## 🌐 Nginx 설정 파일

### monitor.neuralgrid.kr
```bash
sudo nano /etc/nginx/sites-available/monitor.neuralgrid.kr
```

**내용**: 위의 STEP 5 참조 (DEPLOYMENT_INSTRUCTIONS.md)

---

## 🔐 환경 변수 업데이트

```bash
cd ~/n8n-neuralgrid/apps/web
nano .env
```

**추가할 내용**:
```env
NEXTAUTH_SECRET="your-generated-secret-here"
```

---

## 🎯 최종 검증

### 파일 존재 확인
```bash
# Web App 파일 확인
ls -la ~/n8n-neuralgrid/apps/web/prisma/schema.prisma
ls -la ~/n8n-neuralgrid/apps/web/app/api/auth/\[...nextauth\]/route.ts
ls -la ~/n8n-neuralgrid/apps/web/app/auth/signin/page.tsx
ls -la ~/n8n-neuralgrid/apps/web/app/auth/signup/page.tsx
ls -la ~/n8n-neuralgrid/apps/web/app/mypage/page.tsx
ls -la ~/n8n-neuralgrid/apps/web/app/admin/page.tsx
ls -la ~/n8n-neuralgrid/apps/web/app/monitor/page.tsx

# Monitor Server 파일 확인
ls -la ~/n8n-neuralgrid/monitor-server/index.js
ls -la ~/n8n-neuralgrid/monitor-server/package.json
```

### Nginx 설정 확인
```bash
ls -la /etc/nginx/sites-available/monitor.neuralgrid.kr
ls -la /etc/nginx/sites-enabled/monitor.neuralgrid.kr
```

---

## 📊 총 파일 수

- **Prisma**: 1 파일
- **API Routes**: 4 파일
- **Pages**: 5 파일
- **Monitor Server**: 2 파일 (index.js + package.json)
- **Nginx**: 1 파일
- **Scripts**: 1 파일 (선택)

**총 14개 파일**

---

## 🚀 배포 후 단계

1. Prisma 마이그레이션: `pnpm prisma db push`
2. Next.js 빌드: `pnpm run build`
3. PM2 재시작: `pm2 restart all`
4. SSL 설정: `sudo certbot --nginx -d monitor.neuralgrid.kr`

---

상세한 배포 단계는 `DEPLOYMENT_INSTRUCTIONS.md`를 참조하세요.
