# NeuralGrid 플랫폼 업그레이드 - 배포 가이드

## 📋 개요
이 가이드는 NeuralGrid 플랫폼에 회원가입/로그인, 마이페이지, 슈퍼 관리자 대시보드, 통합 서버 모니터링 기능을 추가하는 완전한 배포 프로세스를 제공합니다.

---

## 🎯 추가될 기능

### 1. 사용자 인증 시스템
- **회원가입**: `/auth/signup` - 이메일/비밀번호 기반
- **로그인**: `/auth/signin` - NextAuth.js 세션 관리
- **비밀번호 해싱**: bcrypt (보안)
- **세션 관리**: JWT 토큰 (30일 유효)

### 2. 마이페이지
- **프로필 정보**: 이름, 이메일, 가입일, 역할
- **구독 정보**: 플랜 (FREE/STARTER/PROFESSIONAL/ENTERPRISE), 상태
- **사용량 통계**: 워크플로우, 실행 횟수, AI 쇼츠, 저장공간
- **빠른 액세스**: 대시보드, AI 쇼츠, n8n 에디터 링크

### 3. 슈퍼 관리자 대시보드
- **시스템 통계**: 전체 사용자, 활성 사용자, 총 사용량
- **사용자 관리**: 최근 가입 사용자, 역할 표시
- **모니터링 링크**: 서버 모니터링 페이지 바로가기
- **접근 제어**: ADMIN 역할만 접근 가능

### 4. 통합 서버 모니터링
- **실시간 메트릭**: CPU, 메모리, 디스크, 네트워크
- **PM2 상태**: 모든 프로세스 상태, 메모리, CPU 사용률
- **Nginx 로그**: 접근 로그, 에러 로그
- **자동 갱신**: 5초마다 실시간 업데이트

---

## 📦 필요한 파일

서버에 업로드할 파일들:

### 1. Prisma 스키마
- **파일**: `step1_prisma_schema.prisma`
- **경로**: `~/n8n-neuralgrid/apps/web/prisma/schema.prisma`

### 2. NextAuth 설정
- **파일**: `step2_nextauth_route.ts`
- **경로**: `~/n8n-neuralgrid/apps/web/app/api/auth/[...nextauth]/route.ts`

### 3. 회원가입 API
- **파일**: `step3_signup_api.ts`
- **경로**: `~/n8n-neuralgrid/apps/web/app/api/auth/signup/route.ts`

### 4. 로그인 페이지
- **파일**: `step4_signin_page.tsx`
- **경로**: `~/n8n-neuralgrid/apps/web/app/auth/signin/page.tsx`

### 5. 회원가입 페이지
- **파일**: `step5_signup_page.tsx`
- **경로**: `~/n8n-neuralgrid/apps/web/app/auth/signup/page.tsx`

### 6. 마이페이지
- **파일**: `step6_mypage.tsx`
- **경로**: `~/n8n-neuralgrid/apps/web/app/mypage/page.tsx`

### 7. 사용자 프로필 API
- **파일**: `step7_user_profile_api.ts`
- **경로**: `~/n8n-neuralgrid/apps/web/app/api/user/profile/route.ts`

### 8. 관리자 대시보드
- **파일**: `step8_admin_page.tsx`
- **경로**: `~/n8n-neuralgrid/apps/web/app/admin/page.tsx`

### 9. 관리자 통계 API
- **파일**: `step9_admin_stats_api.ts`
- **경로**: `~/n8n-neuralgrid/apps/web/app/api/admin/stats/route.ts`

### 10. 모니터링 서버
- **파일**: `step10_monitor_server.js`
- **경로**: `~/n8n-neuralgrid/monitor-server/index.js`

### 11. 모니터링 페이지
- **파일**: `step11_monitor_page.tsx`
- **경로**: `~/n8n-neuralgrid/apps/web/app/monitor/page.tsx`

### 12. 배포 스크립트
- **파일**: `step12_deploy_script.sh`
- **경로**: `~/n8n-neuralgrid/deploy_upgrade.sh`

---

## 🚀 배포 단계

### 준비 작업

1. **서버 접속**
```bash
ssh azamans@115.91.5.140
```

2. **프로젝트 디렉토리로 이동**
```bash
cd ~/n8n-neuralgrid/apps/web
```

---

### STEP 1: 파일 업로드

모든 파일들을 서버의 올바른 경로에 업로드하세요.

**방법 1: 수동 복사 (권장)**
각 파일의 내용을 복사하여 서버에 생성:

```bash
# 예시: Prisma 스키마
cd ~/n8n-neuralgrid/apps/web
mkdir -p prisma
nano prisma/schema.prisma
# (파일 내용 붙여넣기)
```

**방법 2: SCP 사용**
로컬 컴퓨터에서:
```bash
scp step*.* azamans@115.91.5.140:~/n8n-neuralgrid/
```

---

### STEP 2: 패키지 설치

```bash
cd ~/n8n-neuralgrid/apps/web

# 추가 의존성 설치
pnpm add @types/bcryptjs @next-auth/prisma-adapter
pnpm add -D prisma

# 모니터링 서버 설정
cd ~/n8n-neuralgrid
mkdir -p monitor-server
cd monitor-server

# package.json 생성
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

### STEP 3: 환경 변수 설정

```bash
cd ~/n8n-neuralgrid/apps/web

# NEXTAUTH_SECRET 생성
openssl rand -base64 32

# .env 파일 편집
nano .env
```

**추가할 내용**:
```env
# 기존 설정 유지
DATABASE_URL="postgresql://neuralgrid@localhost:5434/n8n_neuralgrid"
NEXTAUTH_URL="https://neuralgrid.kr"
N8N_WEBHOOK_URL="http://115.91.5.140:5678"

# 새로 추가 (위에서 생성한 값 사용)
NEXTAUTH_SECRET="여기에_생성한_시크릿_붙여넣기"
```

---

### STEP 4: Prisma 초기화

```bash
cd ~/n8n-neuralgrid/apps/web

# Prisma Client 생성
pnpm prisma generate

# 데이터베이스에 스키마 적용
pnpm prisma db push
```

**확인**:
```bash
# 데이터베이스 테이블 확인
psql -U neuralgrid -p 5434 -d n8n_neuralgrid -c "\dt"
```

예상 출력:
```
 users
 accounts
 sessions
 verification_tokens
 subscriptions
 usages
 audit_logs
```

---

### STEP 5: Nginx 설정 (monitor.neuralgrid.kr)

```bash
# Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/monitor.neuralgrid.kr
```

**내용**:
```nginx
server {
    listen 80;
    server_name monitor.neuralgrid.kr;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name monitor.neuralgrid.kr;

    ssl_certificate /etc/letsencrypt/live/monitor.neuralgrid.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/monitor.neuralgrid.kr/privkey.pem;
    
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    location / {
        proxy_pass http://127.0.0.1:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        
        proxy_connect_timeout 300s;
        proxy_send_timeout 300s;
        proxy_read_timeout 300s;
        
        proxy_buffering off;
    }
}
```

**Symbolic Link 생성**:
```bash
sudo ln -sf /etc/nginx/sites-available/monitor.neuralgrid.kr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

### STEP 6: SSL 인증서 설정

```bash
sudo certbot --nginx -d monitor.neuralgrid.kr
```

**프롬프트**:
- Email: (기존 이메일 사용)
- Terms of Service: `Y`
- Share email: `N` (선택)

**확인**:
```bash
sudo certbot certificates | grep monitor.neuralgrid.kr
```

---

### STEP 7: PM2 설정 업데이트

```bash
cd ~/n8n-neuralgrid

# 기존 설정 백업
cp ecosystem.config.js ecosystem.config.js.backup

# 새 설정 작성
nano ecosystem.config.js
```

**내용** (중요: 비밀번호와 시크릿 업데이트 필요):
```javascript
module.exports = {
  apps: [
    {
      name: 'n8n-server',
      cwd: '/home/azamans/n8n-neuralgrid',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        N8N_PORT: '5678',
        N8N_HOST: '0.0.0.0',
        WEBHOOK_URL: 'https://n8n.neuralgrid.kr',
        DB_TYPE: 'postgresdb',
        DB_POSTGRESDB_HOST: 'localhost',
        DB_POSTGRESDB_PORT: '5434',
        DB_POSTGRESDB_DATABASE: 'n8n_neuralgrid',
        DB_POSTGRESDB_USER: 'neuralgrid',
        DB_POSTGRESDB_PASSWORD: 'YOUR_ACTUAL_PASSWORD',
      },
    },
    {
      name: 'neuralgrid-web',
      cwd: '/home/azamans/n8n-neuralgrid/apps/web',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
        DATABASE_URL: 'postgresql://neuralgrid@localhost:5434/n8n_neuralgrid',
        NEXTAUTH_URL: 'https://neuralgrid.kr',
        NEXTAUTH_SECRET: 'YOUR_NEXTAUTH_SECRET_FROM_ENV',
        N8N_WEBHOOK_URL: 'http://115.91.5.140:5678',
      },
    },
    {
      name: 'monitor-server',
      cwd: '/home/azamans/n8n-neuralgrid/monitor-server',
      script: 'index.js',
      env: {
        NODE_ENV: 'production',
        PORT: '3002',
      },
    },
    {
      name: 'youtube-shorts-generator',
      cwd: '/home/azamans/youtube-shorts-generator',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
      },
    },
  ],
};
```

---

### STEP 8: Next.js 애플리케이션 빌드

```bash
cd ~/n8n-neuralgrid/apps/web
pnpm run build
```

**예상 출력**:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Creating an optimized production build
✓ Compiled successfully

Route (app)                              Size     First Load JS
┌ ○ /                                    X kB          XX kB
├ ○ /auth/signin                         X kB          XX kB
├ ○ /auth/signup                         X kB          XX kB
├ ○ /dashboard                           X kB          XX kB
├ ○ /mypage                              X kB          XX kB
├ ○ /admin                               X kB          XX kB
└ ○ /monitor                             X kB          XX kB
```

---

### STEP 9: PM2 서비스 재시작

```bash
cd ~/n8n-neuralgrid

# 모든 PM2 프로세스 정지 및 삭제
pm2 delete all

# 새 설정으로 시작
pm2 start ecosystem.config.js

# PM2 설정 저장
pm2 save

# 상태 확인
pm2 status
```

**예상 출력**:
```
┌────┬────────────────────────────┬─────────┬─────────┬───────┐
│ id │ name                       │ status  │ restart │ memory│
├────┼────────────────────────────┼─────────┼─────────┼───────┤
│ 0  │ n8n-server                 │ online  │ 0       │ XXX MB│
│ 1  │ neuralgrid-web             │ online  │ 0       │ XXX MB│
│ 2  │ monitor-server             │ online  │ 0       │ XXX MB│
│ 3  │ youtube-shorts-generator   │ online  │ 0       │ XXX MB│
└────┴────────────────────────────┴─────────┴─────────┴───────┘
```

---

### STEP 10: 배포 확인

```bash
# 웹 서비스 확인
curl -I https://neuralgrid.kr/auth/signin
curl -I https://neuralgrid.kr/auth/signup
curl -I https://monitor.neuralgrid.kr

# PM2 로그 확인
pm2 logs neuralgrid-web --lines 20
pm2 logs monitor-server --lines 20

# 데이터베이스 연결 확인
psql -U neuralgrid -p 5434 -d n8n_neuralgrid -c "SELECT COUNT(*) FROM users;"
```

**모든 curl 명령에서 `HTTP/2 200 OK` 응답을 받아야 합니다.**

---

### STEP 11: 첫 번째 관리자 계정 생성

1. **회원가입**
   - 브라우저에서 https://neuralgrid.kr/auth/signup 접속
   - 이메일, 이름, 비밀번호 입력
   - 계정 생성

2. **ADMIN 역할 부여**
```bash
psql -U neuralgrid -p 5434 -d n8n_neuralgrid

# SQL 명령
UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';

# 확인
SELECT id, name, email, role FROM users;

# 종료
\q
```

3. **관리자 로그인**
   - https://neuralgrid.kr/auth/signin 에서 로그인
   - https://neuralgrid.kr/admin 에서 관리자 대시보드 확인

---

## ✅ 최종 확인 체크리스트

### 서비스 상태
- [ ] PM2에서 4개 프로세스 모두 `online` 상태
- [ ] `neuralgrid-web` 메모리 사용량 정상 (100-150MB)
- [ ] `monitor-server` 실행 중

### 웹 페이지 접근
- [ ] https://neuralgrid.kr (메인 페이지)
- [ ] https://neuralgrid.kr/auth/signin (로그인)
- [ ] https://neuralgrid.kr/auth/signup (회원가입)
- [ ] https://neuralgrid.kr/dashboard (대시보드)
- [ ] https://neuralgrid.kr/mypage (마이페이지)
- [ ] https://neuralgrid.kr/admin (관리자 - ADMIN만)
- [ ] https://monitor.neuralgrid.kr (모니터링)

### 기능 테스트
- [ ] 회원가입 (신규 계정 생성)
- [ ] 로그인 (세션 유지)
- [ ] 마이페이지 (프로필, 사용량 표시)
- [ ] 관리자 대시보드 (통계 표시)
- [ ] 서버 모니터링 (실시간 메트릭)

### 데이터베이스
- [ ] Users 테이블 생성됨
- [ ] Subscriptions 테이블 생성됨
- [ ] Usages 테이블 생성됨
- [ ] 첫 번째 사용자 ADMIN 역할 부여됨

---

## 🔧 트러블슈팅

### 문제 1: "next: not found" 에러
**원인**: Next.js 빌드 실패 또는 경로 문제
**해결**:
```bash
cd ~/n8n-neuralgrid/apps/web
rm -rf .next node_modules
pnpm install
pnpm run build
pm2 restart neuralgrid-web
```

### 문제 2: Prisma 연결 실패
**원인**: 데이터베이스 연결 문제
**해결**:
```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# 포트 확인
netstat -tuln | grep 5434

# Prisma 재생성
cd ~/n8n-neuralgrid/apps/web
pnpm prisma generate
pnpm prisma db push
```

### 문제 3: NextAuth 세션 오류
**원인**: NEXTAUTH_SECRET 누락 또는 잘못됨
**해결**:
```bash
cd ~/n8n-neuralgrid/apps/web

# .env 확인
cat .env | grep NEXTAUTH_SECRET

# 새 시크릿 생성
openssl rand -base64 32

# .env 업데이트
nano .env
# NEXTAUTH_SECRET="새로_생성한_값"

# 재시작
pm2 restart neuralgrid-web
```

### 문제 4: 모니터링 서버 실행 안 됨
**원인**: 패키지 설치 또는 포트 충돌
**해결**:
```bash
cd ~/n8n-neuralgrid/monitor-server

# 패키지 재설치
rm -rf node_modules
pnpm install

# 포트 확인
netstat -tuln | grep 3002

# PM2 재시작
pm2 restart monitor-server
pm2 logs monitor-server
```

### 문제 5: 502 Bad Gateway
**원인**: Nginx와 애플리케이션 간 연결 실패
**해결**:
```bash
# PM2 상태 확인
pm2 status

# Nginx 에러 로그
sudo tail -50 /var/log/nginx/neuralgrid.kr.error.log

# 애플리케이션 로그
pm2 logs neuralgrid-web --lines 50

# Nginx 재시작
sudo systemctl restart nginx
```

---

## 📊 성공 확인

배포가 성공적으로 완료되면:

### 브라우저 테스트
1. https://neuralgrid.kr/auth/signup - 회원가입 폼 표시
2. 계정 생성 후 https://neuralgrid.kr/auth/signin - 로그인
3. https://neuralgrid.kr/mypage - 프로필 및 사용량 표시
4. https://neuralgrid.kr/admin - 관리자 대시보드 (ADMIN만)
5. https://monitor.neuralgrid.kr - 실시간 서버 메트릭

### 서버 확인
```bash
pm2 status
# 모든 프로세스 'online' 상태

curl -I https://neuralgrid.kr
# HTTP/2 200 OK

curl -I https://monitor.neuralgrid.kr
# HTTP/2 200 OK
```

---

## 📞 지원

배포 중 문제가 발생하면:

1. **PM2 로그 확인**
```bash
pm2 logs neuralgrid-web
pm2 logs monitor-server
```

2. **Nginx 로그 확인**
```bash
sudo tail -100 /var/log/nginx/neuralgrid.kr.error.log
```

3. **데이터베이스 연결 테스트**
```bash
psql -U neuralgrid -p 5434 -d n8n_neuralgrid -c "SELECT 1;"
```

---

## 🎉 완료!

모든 단계가 완료되면 NeuralGrid 플랫폼은 다음 기능을 제공합니다:

- ✅ 사용자 인증 (회원가입/로그인)
- ✅ 마이페이지 (프로필, 사용량)
- ✅ 슈퍼 관리자 대시보드
- ✅ 실시간 서버 모니터링
- ✅ 역할 기반 접근 제어
- ✅ SSL 보안 통신
- ✅ PM2 프로세스 관리

**접속 URL**:
- Main: https://neuralgrid.kr
- Dashboard: https://neuralgrid.kr/dashboard
- My Page: https://neuralgrid.kr/mypage
- Admin: https://neuralgrid.kr/admin
- Monitor: https://monitor.neuralgrid.kr
- AI Shorts: https://shorts.neuralgrid.kr
- n8n: https://n8n.neuralgrid.kr

---

**업그레이드 버전**: 2.0
**최종 업데이트**: 2025-12-07
