# NeuralGrid 플랫폼 업그레이드 - 요약

## 📊 프로젝트 개요

**목표**: NeuralGrid 플랫폼에 사용자 인증, 마이페이지, 관리자 대시보드, 실시간 서버 모니터링 기능 추가

**서버**: 115.91.5.140 (azamans@)
**프로젝트 경로**: ~/n8n-neuralgrid
**도메인**: neuralgrid.kr

---

## ✨ 추가된 기능

### 1. 사용자 인증 시스템
- **회원가입**: Email + Password (bcrypt 해싱)
- **로그인**: NextAuth.js JWT 세션
- **보안**: NEXTAUTH_SECRET, 비밀번호 해싱
- **세션**: 30일 유효기간

### 2. 역할 기반 접근 제어 (RBAC)
- **USER**: 일반 사용자 (대시보드, 마이페이지)
- **ADMIN**: 관리자 (모든 기능 + 관리자 대시보드)

### 3. 마이페이지
- 프로필 정보 (이름, 이메일, 가입일)
- 구독 플랜 (FREE/STARTER/PROFESSIONAL/ENTERPRISE)
- 사용량 통계 (워크플로우, 실행 횟수, AI 쇼츠, 저장공간)
- 빠른 액세스 링크

### 4. 슈퍼 관리자 대시보드
- 전체 시스템 통계
- 사용자 목록 및 관리
- 최근 가입자 추적
- 모니터링 링크

### 5. 실시간 서버 모니터링
- **도메인**: https://monitor.neuralgrid.kr
- **메트릭**: CPU, 메모리, 디스크, 네트워크
- **PM2 상태**: 프로세스별 상태, 메모리, CPU
- **Nginx 로그**: 접근 로그, 에러 로그
- **자동 갱신**: 5초마다 업데이트

---

## 🗂️ 파일 구조

### 생성된 파일 (12개)

#### Web Application (Next.js)
```
~/n8n-neuralgrid/apps/web/
├── prisma/
│   └── schema.prisma                     [NEW]
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── [...nextauth]/
│   │   │   │   └── route.ts              [NEW]
│   │   │   └── signup/
│   │   │       └── route.ts              [NEW]
│   │   ├── user/
│   │   │   └── profile/
│   │   │       └── route.ts              [NEW]
│   │   └── admin/
│   │       └── stats/
│   │           └── route.ts              [NEW]
│   ├── auth/
│   │   ├── signin/
│   │   │   └── page.tsx                  [NEW]
│   │   └── signup/
│   │       └── page.tsx                  [NEW]
│   ├── mypage/
│   │   └── page.tsx                      [NEW]
│   ├── admin/
│   │   └── page.tsx                      [NEW]
│   └── monitor/
│       └── page.tsx                      [NEW]
└── .env                                   [UPDATED]
```

#### Monitor Server (Express)
```
~/n8n-neuralgrid/monitor-server/
├── index.js                               [NEW]
└── package.json                           [NEW]
```

#### Configuration
```
~/n8n-neuralgrid/
└── ecosystem.config.js                    [UPDATED]

/etc/nginx/sites-available/
└── monitor.neuralgrid.kr                  [NEW]
```

---

## 🗄️ 데이터베이스 스키마

### 새로 추가된 테이블 (7개)

| 테이블 | 설명 | 주요 필드 |
|--------|------|-----------|
| `users` | 사용자 정보 | id, email, password, name, role |
| `accounts` | OAuth 계정 (NextAuth) | userId, provider, providerAccountId |
| `sessions` | 사용자 세션 | id, sessionToken, userId, expires |
| `verification_tokens` | 이메일 인증 | identifier, token, expires |
| `subscriptions` | 구독 정보 | userId, plan, status, startDate |
| `usages` | 사용량 추적 | userId, workflowsCount, executionsCount, aiShortsCount, storageUsed, month |
| `audit_logs` | 관리자 작업 로그 | userId, action, details, ipAddress |

---

## 🚀 배포 아키텍처

### 서비스 구성 (PM2)

| 서비스명 | 포트 | 설명 | 상태 |
|---------|------|------|------|
| `n8n-server` | 5678 | n8n 워크플로우 엔진 | ✅ Online |
| `neuralgrid-web` | 3000 | Next.js 웹 애플리케이션 | ✅ Online |
| `monitor-server` | 3002 | 모니터링 API 서버 | ✅ NEW |
| `youtube-shorts-generator` | 3001 | AI 쇼츠 생성 서비스 | ✅ Online |

### 도메인 매핑 (Nginx)

| 도메인 | 프록시 대상 | SSL | 설명 |
|--------|-------------|-----|------|
| neuralgrid.kr | 127.0.0.1:3000 | ✅ | 메인 웹 앱 |
| n8n.neuralgrid.kr | 127.0.0.1:5678 | ✅ | n8n 에디터 |
| shorts.neuralgrid.kr | 127.0.0.1:3001 | ✅ | AI 쇼츠 자동화 |
| monitor.neuralgrid.kr | 127.0.0.1:3002 | ✅ NEW | 서버 모니터링 |

---

## 🔐 보안 설정

### 환경 변수
```env
DATABASE_URL="postgresql://neuralgrid@localhost:5434/n8n_neuralgrid"
NEXTAUTH_URL="https://neuralgrid.kr"
NEXTAUTH_SECRET="[32+ 문자 랜덤 시크릿]"
N8N_WEBHOOK_URL="http://115.91.5.140:5678"
```

### SSL 인증서
- **발급 기관**: Let's Encrypt
- **유효기간**: 90일 (자동 갱신)
- **도메인**: neuralgrid.kr, n8n.neuralgrid.kr, shorts.neuralgrid.kr, monitor.neuralgrid.kr

### 비밀번호 보안
- **알고리즘**: bcrypt
- **Salt Rounds**: 12
- **최소 길이**: 8자

---

## 📈 성능 지표

### 메모리 사용량 (예상)
- n8n-server: ~200-300MB
- neuralgrid-web: ~100-150MB
- monitor-server: ~50-80MB
- youtube-shorts-generator: ~100-150MB
- **Total**: ~450-680MB

### 응답 시간
- 페이지 로드: <2초
- API 응답: <500ms
- 모니터링 갱신: 5초 주기
- PM2 상태 조회: <200ms

---

## 🎯 접속 URL

### 사용자 페이지
- **메인**: https://neuralgrid.kr
- **로그인**: https://neuralgrid.kr/auth/signin
- **회원가입**: https://neuralgrid.kr/auth/signup
- **대시보드**: https://neuralgrid.kr/dashboard
- **마이페이지**: https://neuralgrid.kr/mypage

### 관리자 페이지 (ADMIN만)
- **관리자 대시보드**: https://neuralgrid.kr/admin
- **서버 모니터링**: https://monitor.neuralgrid.kr

### 외부 서비스
- **AI 쇼츠 자동화**: https://shorts.neuralgrid.kr
- **n8n 에디터**: https://n8n.neuralgrid.kr
- **API 문서**: https://neuralgrid.kr/api-docs

---

## 📦 설치된 패키지

### Web App (Next.js)
```json
{
  "dependencies": {
    "@next-auth/prisma-adapter": "^1.0.7",
    "@prisma/client": "^5.7.0",
    "next-auth": "^4.24.0",
    "bcryptjs": "^2.4.3",
    "zod": "^3.22.4"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "prisma": "^5.7.0"
  }
}
```

### Monitor Server (Express)
```json
{
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "systeminformation": "^5.21.20"
  }
}
```

---

## 🔄 배포 플로우

### 1. 파일 업로드
12개 파일을 서버의 지정된 경로에 복사

### 2. 패키지 설치
```bash
pnpm add @types/bcryptjs @next-auth/prisma-adapter
pnpm add -D prisma
```

### 3. 환경 설정
- NEXTAUTH_SECRET 생성
- .env 파일 업데이트

### 4. 데이터베이스 초기화
```bash
pnpm prisma generate
pnpm prisma db push
```

### 5. Nginx 설정
- monitor.neuralgrid.kr 설정 추가
- SSL 인증서 발급

### 6. PM2 설정 업데이트
- monitor-server 앱 추가
- ecosystem.config.js 수정

### 7. 빌드 & 배포
```bash
pnpm run build
pm2 restart all
```

### 8. 관리자 계정 생성
- 회원가입 후 데이터베이스에서 역할 변경

---

## ✅ 배포 체크리스트

### 서비스 확인
- [ ] PM2에서 4개 프로세스 모두 `online`
- [ ] neuralgrid-web 정상 실행 (포트 3000)
- [ ] monitor-server 정상 실행 (포트 3002)

### URL 접근 테스트
- [ ] https://neuralgrid.kr (200 OK)
- [ ] https://neuralgrid.kr/auth/signin (200 OK)
- [ ] https://neuralgrid.kr/auth/signup (200 OK)
- [ ] https://neuralgrid.kr/dashboard (200 OK)
- [ ] https://neuralgrid.kr/mypage (인증 필요)
- [ ] https://neuralgrid.kr/admin (ADMIN만)
- [ ] https://monitor.neuralgrid.kr (200 OK)

### 기능 테스트
- [ ] 회원가입 (신규 계정 생성)
- [ ] 로그인 (세션 생성)
- [ ] 로그아웃 (세션 삭제)
- [ ] 마이페이지 (프로필, 사용량 표시)
- [ ] 관리자 대시보드 (통계 표시)
- [ ] 서버 모니터링 (실시간 메트릭)

### 데이터베이스
- [ ] 7개 테이블 생성됨
- [ ] 첫 번째 사용자 생성됨
- [ ] ADMIN 역할 부여됨

### SSL/보안
- [ ] 모든 도메인 HTTPS 적용
- [ ] Let's Encrypt 인증서 유효
- [ ] NEXTAUTH_SECRET 설정됨
- [ ] 비밀번호 bcrypt 해싱

---

## 📚 참고 문서

### 제공된 가이드
1. **NEURALGRID_UPGRADE_GUIDE.md** - 전체 업그레이드 개요
2. **DEPLOYMENT_INSTRUCTIONS.md** - 상세 배포 가이드 (단계별)
3. **FILE_MAPPING.md** - 파일 경로 매핑
4. **QUICK_START.md** - 5분 빠른 배포 가이드
5. **SUMMARY.md** - 이 문서 (프로젝트 요약)

### 소스 파일
- `step1_prisma_schema.prisma` - Prisma 스키마
- `step2_nextauth_route.ts` - NextAuth 설정
- `step3_signup_api.ts` - 회원가입 API
- `step4_signin_page.tsx` - 로그인 페이지
- `step5_signup_page.tsx` - 회원가입 페이지
- `step6_mypage.tsx` - 마이페이지
- `step7_user_profile_api.ts` - 프로필 API
- `step8_admin_page.tsx` - 관리자 대시보드
- `step9_admin_stats_api.ts` - 관리자 통계 API
- `step10_monitor_server.js` - 모니터링 서버
- `step11_monitor_page.tsx` - 모니터링 페이지
- `step12_deploy_script.sh` - 자동 배포 스크립트

---

## 🆘 문제 해결

### 일반적인 문제

#### 1. 빌드 실패
```bash
cd ~/n8n-neuralgrid/apps/web
rm -rf .next node_modules
pnpm install
pnpm run build
```

#### 2. Prisma 연결 실패
```bash
sudo systemctl status postgresql
psql -U neuralgrid -p 5434 -d n8n_neuralgrid -c "SELECT 1;"
```

#### 3. NextAuth 세션 오류
```bash
cat ~/n8n-neuralgrid/apps/web/.env | grep NEXTAUTH_SECRET
# 누락 시 재생성
openssl rand -base64 32
```

#### 4. 502 Bad Gateway
```bash
pm2 status
sudo tail -50 /var/log/nginx/neuralgrid.kr.error.log
pm2 logs neuralgrid-web
```

---

## 🎉 배포 완료 후

### 첫 단계
1. 브라우저에서 https://neuralgrid.kr/auth/signup 접속
2. 관리자 계정 생성
3. 데이터베이스에서 ADMIN 역할 부여
4. https://neuralgrid.kr/auth/signin 로그인
5. https://neuralgrid.kr/admin 관리자 대시보드 확인

### 모니터링
- https://monitor.neuralgrid.kr 에서 실시간 서버 상태 확인
- PM2: `pm2 monit` 명령으로 프로세스 모니터링
- Logs: `pm2 logs` 또는 `/var/log/nginx/`

### 백업
```bash
# 데이터베이스 백업
pg_dump -U neuralgrid -p 5434 n8n_neuralgrid > backup_$(date +%Y%m%d).sql

# 코드 백업
cd ~/n8n-neuralgrid
tar -czf neuralgrid_backup_$(date +%Y%m%d).tar.gz apps/ ecosystem.config.js
```

---

## 📊 통계

### 개발 정보
- **프로젝트 이름**: NeuralGrid Platform Upgrade
- **버전**: 2.0
- **생성 파일**: 12개
- **새 테이블**: 7개
- **새 도메인**: 1개 (monitor.neuralgrid.kr)
- **새 PM2 프로세스**: 1개 (monitor-server)
- **예상 배포 시간**: 7-10분
- **난이도**: ⭐⭐⭐ (중급)

### 기술 스택
- **Frontend**: Next.js 14.2.33, React 18, TailwindCSS
- **Backend**: Node.js, Express
- **Database**: PostgreSQL 5434, Prisma ORM
- **Authentication**: NextAuth.js, bcrypt
- **Process Manager**: PM2
- **Web Server**: Nginx
- **SSL**: Let's Encrypt (Certbot)
- **Monitoring**: systeminformation

---

**최종 업데이트**: 2025-12-07
**작성자**: AI Assistant
**문서 버전**: 1.0
