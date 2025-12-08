# NeuralGrid 플랫폼 업그레이드 패키지 v2.0

> 사용자 인증, 마이페이지, 관리자 대시보드, 실시간 서버 모니터링을 추가하는 완전한 업그레이드 패키지

---

## 📦 패키지 내용

이 패키지에는 NeuralGrid 플랫폼을 업그레이드하는 데 필요한 모든 파일과 가이드가 포함되어 있습니다.

### 📄 문서 (5개)
1. **README.md** - 이 문서 (시작 가이드)
2. **QUICK_START.md** - 5분 빠른 배포 가이드 ⚡
3. **DEPLOYMENT_INSTRUCTIONS.md** - 상세 배포 단계 📋
4. **FILE_MAPPING.md** - 파일 경로 매핑 정보 🗂️
5. **SUMMARY.md** - 프로젝트 전체 요약 📊

### 💻 소스 파일 (12개)
- `step1_prisma_schema.prisma` - 데이터베이스 스키마
- `step2_nextauth_route.ts` - NextAuth 인증 설정
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

## 🚀 빠른 시작

### 처음 사용자라면?
👉 **[QUICK_START.md](./QUICK_START.md)** 를 읽고 5분 안에 배포하세요!

### 상세한 가이드가 필요하다면?
👉 **[DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md)** 를 따라 단계별로 진행하세요!

### 파일 경로가 헷갈린다면?
👉 **[FILE_MAPPING.md](./FILE_MAPPING.md)** 에서 모든 파일 경로를 확인하세요!

### 전체 프로젝트 개요가 필요하다면?
👉 **[SUMMARY.md](./SUMMARY.md)** 에서 완전한 정보를 확인하세요!

---

## ✨ 새로운 기능

### 1. 🔐 사용자 인증 시스템
- 이메일/비밀번호 기반 회원가입 및 로그인
- NextAuth.js를 이용한 세션 관리 (JWT)
- bcrypt 비밀번호 해싱 (보안)
- 30일 세션 유효기간

### 2. 👤 마이페이지
- 프로필 정보 (이름, 이메일, 가입일, 역할)
- 구독 플랜 (FREE/STARTER/PROFESSIONAL/ENTERPRISE)
- 이번 달 사용량 통계 (워크플로우, 실행 횟수, AI 쇼츠, 저장공간)
- 빠른 액세스 링크 (대시보드, AI 쇼츠, n8n)

### 3. 👨‍💼 슈퍼 관리자 대시보드
- 전체 시스템 통계 (사용자, 워크플로우, AI 쇼츠 등)
- 사용자 목록 및 관리
- 최근 가입 사용자 추적
- 모니터링 및 관리 도구 링크

### 4. 📊 실시간 서버 모니터링
- **새 도메인**: https://monitor.neuralgrid.kr
- CPU, 메모리, 디스크, 네트워크 실시간 메트릭
- PM2 프로세스 상태 모니터링
- Nginx 로그 확인
- 5초마다 자동 갱신

### 5. 🛡️ 역할 기반 접근 제어 (RBAC)
- **USER**: 일반 사용자 (대시보드, 마이페이지 접근)
- **ADMIN**: 관리자 (모든 기능 + 관리자 대시보드 + 모니터링)

---

## 📋 필수 요구사항

### 서버 환경
- **OS**: Ubuntu/Debian Linux
- **Node.js**: v18 이상
- **PostgreSQL**: 포트 5434에서 실행 중
- **Nginx**: 설치 및 실행 중
- **PM2**: 글로벌 설치
- **pnpm**: 패키지 관리자

### 기존 설정
- NeuralGrid 프로젝트가 `~/n8n-neuralgrid`에 위치
- 도메인: `neuralgrid.kr`, `n8n.neuralgrid.kr`, `shorts.neuralgrid.kr`
- SSL 인증서 설정됨
- PM2에서 3개 서비스 실행 중:
  - n8n-server (포트 5678)
  - neuralgrid-web (포트 3000)
  - youtube-shorts-generator (포트 3001)

---

## 🎯 배포 목표

### Before (현재 상태)
```
✅ n8n 워크플로우 자동화
✅ AI 쇼츠 자동 생성
✅ 웹 대시보드
✅ API 문서
⛔ 사용자 인증 없음
⛔ 사용자 관리 없음
⛔ 관리자 도구 없음
⛔ 서버 모니터링 없음
```

### After (업그레이드 후)
```
✅ n8n 워크플로우 자동화
✅ AI 쇼츠 자동 생성
✅ 웹 대시보드
✅ API 문서
✅ 회원가입/로그인 시스템
✅ 마이페이지 (프로필, 사용량)
✅ 슈퍼 관리자 대시보드
✅ 실시간 서버 모니터링
```

---

## 🗺️ 배포 로드맵

### Phase 1: 준비 (5분)
1. 서버 접속 및 프로젝트 확인
2. 패키지 다운로드 및 압축 해제
3. 가이드 문서 읽기

### Phase 2: 파일 업로드 (10분)
1. 디렉토리 구조 생성
2. 12개 소스 파일을 지정된 경로에 복사
3. 파일 권한 설정

### Phase 3: 의존성 설치 (5분)
1. Web app 패키지 설치
2. Monitor server 패키지 설치
3. Prisma 설치 및 초기화

### Phase 4: 환경 설정 (5분)
1. NEXTAUTH_SECRET 생성
2. .env 파일 업데이트
3. 데이터베이스 스키마 적용

### Phase 5: 인프라 설정 (10분)
1. Nginx 설정 (monitor.neuralgrid.kr)
2. SSL 인증서 발급
3. PM2 설정 업데이트

### Phase 6: 빌드 & 배포 (5분)
1. Next.js 애플리케이션 빌드
2. PM2 서비스 재시작
3. 배포 확인

### Phase 7: 계정 생성 (5분)
1. 회원가입 (첫 번째 사용자)
2. ADMIN 역할 부여
3. 관리자 로그인 테스트

**총 예상 시간**: 약 45분 (처음 배포 시)

---

## 📊 아키텍처 다이어그램

```
┌─────────────────────────────────────────────────────────────┐
│                       Internet (HTTPS)                       │
└─────────────────────┬───────────────────────────────────────┘
                      │
              ┌───────▼────────┐
              │  Nginx (443)   │
              │  Reverse Proxy │
              └───────┬────────┘
                      │
        ┌─────────────┼─────────────┬─────────────┐
        │             │             │             │
┌───────▼──────┐ ┌───▼────┐ ┌──────▼──────┐ ┌───▼────────┐
│ neuralgrid.kr│ │n8n.kr  │ │ shorts.kr   │ │ monitor.kr │
│   (3000)     │ │(5678)  │ │   (3001)    │ │   (3002)   │
└───────┬──────┘ └───┬────┘ └──────┬──────┘ └─────┬──────┘
        │            │             │              │
        │            │             │              │
┌───────▼────────────▼─────────────▼──────────────▼──────┐
│                    PM2 Process Manager                   │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌────────────┐│
│  │   n8n    │ │ web-app  │ │ shorts   │ │  monitor   ││
│  │  server  │ │ (Next.js)│ │ generator│ │   server   ││
│  └────┬─────┘ └─────┬────┘ └──────────┘ └─────┬──────┘│
└───────┼─────────────┼────────────────────────────┼──────┘
        │             │                            │
        └─────────────┼────────────────────────────┘
                      │
              ┌───────▼────────┐
              │  PostgreSQL    │
              │    (5434)      │
              │  n8n_neuralgrid│
              └────────────────┘
```

---

## 🗂️ 데이터베이스 스키마

### 새로 추가되는 테이블

```sql
users                   -- 사용자 정보
├── id (cuid)
├── email (unique)
├── password (hashed)
├── name
├── role (USER/ADMIN)
└── timestamps

accounts               -- OAuth 계정 (NextAuth)
sessions               -- 사용자 세션 (NextAuth)
verification_tokens    -- 이메일 인증

subscriptions          -- 구독 정보
├── userId
├── plan (FREE/STARTER/PROFESSIONAL/ENTERPRISE)
├── status (ACTIVE/INACTIVE/CANCELLED/EXPIRED)
└── timestamps

usages                 -- 월별 사용량
├── userId
├── month (YYYY-MM)
├── workflowsCount
├── executionsCount
├── aiShortsCount
└── storageUsed (GB)

audit_logs            -- 관리자 작업 로그
├── userId
├── action
├── details
├── ipAddress
└── timestamp
```

---

## 🌐 최종 접속 URL

### 일반 사용자
| URL | 설명 | 인증 필요 |
|-----|------|-----------|
| https://neuralgrid.kr | 메인 페이지 | ❌ |
| https://neuralgrid.kr/auth/signin | 로그인 | ❌ |
| https://neuralgrid.kr/auth/signup | 회원가입 | ❌ |
| https://neuralgrid.kr/dashboard | 대시보드 | ✅ |
| https://neuralgrid.kr/mypage | 마이페이지 | ✅ |

### 관리자 (ADMIN만)
| URL | 설명 | 역할 |
|-----|------|------|
| https://neuralgrid.kr/admin | 관리자 대시보드 | ADMIN |
| https://monitor.neuralgrid.kr | 서버 모니터링 | ADMIN |

### 외부 서비스
| URL | 설명 |
|-----|------|
| https://shorts.neuralgrid.kr | AI 쇼츠 자동화 |
| https://n8n.neuralgrid.kr | n8n 워크플로우 에디터 |
| https://neuralgrid.kr/api-docs | API 문서 |

---

## ✅ 배포 체크리스트

### 배포 전
- [ ] 서버 백업 완료
- [ ] PostgreSQL 실행 중 (포트 5434)
- [ ] Nginx 실행 중
- [ ] PM2 프로세스 정상 작동
- [ ] 도메인 DNS 설정 확인

### 배포 중
- [ ] 12개 파일 모두 업로드됨
- [ ] 패키지 설치 완료
- [ ] Prisma 마이그레이션 완료
- [ ] Nginx 설정 추가됨
- [ ] SSL 인증서 발급됨
- [ ] PM2 설정 업데이트됨

### 배포 후
- [ ] 모든 PM2 프로세스 `online` 상태
- [ ] 모든 URL HTTP 200 응답
- [ ] 회원가입 기능 작동
- [ ] 로그인 기능 작동
- [ ] 마이페이지 표시됨
- [ ] 관리자 대시보드 접근 가능 (ADMIN)
- [ ] 모니터링 페이지 실시간 업데이트

---

## 🆘 문제 해결

### 자주 발생하는 문제

#### 빌드 실패
```bash
cd ~/n8n-neuralgrid/apps/web
rm -rf .next node_modules
pnpm install
pnpm run build
```

#### Prisma 연결 실패
```bash
# PostgreSQL 확인
sudo systemctl status postgresql
# 연결 테스트
psql -U neuralgrid -p 5434 -d n8n_neuralgrid -c "SELECT 1;"
```

#### NextAuth 세션 에러
```bash
# NEXTAUTH_SECRET 확인
cat ~/n8n-neuralgrid/apps/web/.env | grep NEXTAUTH_SECRET
# 재생성
openssl rand -base64 32
```

#### 502 Bad Gateway
```bash
# PM2 상태
pm2 status
# 로그 확인
pm2 logs neuralgrid-web --lines 50
# Nginx 에러 로그
sudo tail -50 /var/log/nginx/neuralgrid.kr.error.log
```

더 많은 문제 해결 방법은 **[DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md#-트러블슈팅)** 참조

---

## 📞 지원

### 배포 중 문제 발생 시

1. **로그 확인**
   ```bash
   pm2 logs neuralgrid-web
   pm2 logs monitor-server
   sudo tail -100 /var/log/nginx/error.log
   ```

2. **상태 확인**
   ```bash
   pm2 status
   sudo systemctl status nginx
   sudo systemctl status postgresql
   ```

3. **문서 참조**
   - [DEPLOYMENT_INSTRUCTIONS.md](./DEPLOYMENT_INSTRUCTIONS.md) - 상세 가이드
   - [QUICK_START.md](./QUICK_START.md) - 빠른 배포
   - [FILE_MAPPING.md](./FILE_MAPPING.md) - 파일 경로

---

## 🎓 추가 학습 자료

### 사용된 기술
- **Next.js**: https://nextjs.org/docs
- **NextAuth.js**: https://next-auth.js.org/
- **Prisma**: https://www.prisma.io/docs
- **PM2**: https://pm2.keymetrics.io/docs
- **Nginx**: https://nginx.org/en/docs/

### 관련 개념
- JWT (JSON Web Tokens)
- bcrypt 비밀번호 해싱
- RBAC (역할 기반 접근 제어)
- Reverse Proxy
- SSL/TLS 인증서

---

## 📝 버전 정보

- **패키지 버전**: 2.0
- **최초 생성일**: 2025-12-07
- **최종 업데이트**: 2025-12-07
- **호환성**: NeuralGrid v1.x
- **Node.js**: >=18.0.0
- **PostgreSQL**: >=13.0

---

## 📜 라이선스

이 업그레이드 패키지는 NeuralGrid 프로젝트를 위한 내부 사용 전용입니다.

---

## 🎉 시작하기

준비되셨나요? 다음 단계를 선택하세요:

### 빠르게 시작하고 싶다면
```bash
# 1. 서버 접속
ssh azamans@115.91.5.140

# 2. Quick Start 가이드 열기
cat QUICK_START.md

# 3. 5분 안에 배포!
```

### 단계별로 진행하고 싶다면
```bash
# 1. 서버 접속
ssh azamans@115.91.5.140

# 2. 상세 가이드 열기
cat DEPLOYMENT_INSTRUCTIONS.md

# 3. Step by Step 배포
```

### 파일 구조를 먼저 이해하고 싶다면
```bash
# 1. 파일 매핑 확인
cat FILE_MAPPING.md

# 2. 프로젝트 요약 읽기
cat SUMMARY.md

# 3. 배포 시작
```

---

**행운을 빕니다! 🚀**

문제가 발생하면 문서를 참조하거나 로그를 확인하세요.
배포가 성공하면 https://neuralgrid.kr 에서 새로운 기능을 확인할 수 있습니다!
