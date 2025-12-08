# NeuralGrid 플랫폼 업그레이드 - 빠른 시작 가이드

## 🚀 5분 안에 배포하기

이 가이드는 최소한의 단계로 업그레이드를 완료하는 방법을 제공합니다.

---

## ⚡ 배포 전 준비

### 1. 서버 접속
```bash
ssh azamans@115.91.5.140
```

### 2. 프로젝트 디렉토리 확인
```bash
cd ~/n8n-neuralgrid
ls -la
```

---

## 📋 1단계: 필수 파일 업로드 (2분)

제공받은 12개 파일을 다음 경로에 복사:

| 파일 | 경로 |
|------|------|
| `step1_prisma_schema.prisma` | `~/n8n-neuralgrid/apps/web/prisma/schema.prisma` |
| `step2_nextauth_route.ts` | `~/n8n-neuralgrid/apps/web/app/api/auth/[...nextauth]/route.ts` |
| `step3_signup_api.ts` | `~/n8n-neuralgrid/apps/web/app/api/auth/signup/route.ts` |
| `step4_signin_page.tsx` | `~/n8n-neuralgrid/apps/web/app/auth/signin/page.tsx` |
| `step5_signup_page.tsx` | `~/n8n-neuralgrid/apps/web/app/auth/signup/page.tsx` |
| `step6_mypage.tsx` | `~/n8n-neuralgrid/apps/web/app/mypage/page.tsx` |
| `step7_user_profile_api.ts` | `~/n8n-neuralgrid/apps/web/app/api/user/profile/route.ts` |
| `step8_admin_page.tsx` | `~/n8n-neuralgrid/apps/web/app/admin/page.tsx` |
| `step9_admin_stats_api.ts` | `~/n8n-neuralgrid/apps/web/app/api/admin/stats/route.ts` |
| `step10_monitor_server.js` | `~/n8n-neuralgrid/monitor-server/index.js` |
| `step11_monitor_page.tsx` | `~/n8n-neuralgrid/apps/web/app/monitor/page.tsx` |

**빠른 디렉토리 생성**:
```bash
cd ~/n8n-neuralgrid/apps/web
mkdir -p prisma app/api/auth/{[...nextauth],signup} app/api/{user/profile,admin/stats} app/auth/{signin,signup} app/{mypage,admin,monitor}

cd ~/n8n-neuralgrid
mkdir -p monitor-server
```

---

## 🔧 2단계: 패키지 설치 (1분)

```bash
# Web App
cd ~/n8n-neuralgrid/apps/web
pnpm add @types/bcryptjs @next-auth/prisma-adapter
pnpm add -D prisma

# Monitor Server
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

## 🔑 3단계: 환경 변수 설정 (30초)

```bash
cd ~/n8n-neuralgrid/apps/web

# NEXTAUTH_SECRET 생성
SECRET=$(openssl rand -base64 32)
echo $SECRET

# .env 파일에 추가
echo "" >> .env
echo "NEXTAUTH_SECRET=\"$SECRET\"" >> .env

# 확인
tail -5 .env
```

---

## 🗄️ 4단계: 데이터베이스 설정 (30초)

```bash
cd ~/n8n-neuralgrid/apps/web
pnpm prisma generate
pnpm prisma db push
```

**성공 시 출력**:
```
✔ Generated Prisma Client
✔ Your database is now in sync with your Prisma schema
```

---

## 🌐 5단계: Nginx & SSL 설정 (1분)

### Nginx 설정
```bash
sudo bash -c 'cat > /etc/nginx/sites-available/monitor.neuralgrid.kr << '"'"'EOF'"'"'
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
        proxy_set_header Connection "";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_connect_timeout 300s;
        proxy_read_timeout 300s;
        proxy_buffering off;
    }
}
EOF'

# Symbolic link
sudo ln -sf /etc/nginx/sites-available/monitor.neuralgrid.kr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

### SSL 인증서
```bash
sudo certbot --nginx -d monitor.neuralgrid.kr
```
- 프롬프트에 따라 진행 (Email, ToS 동의)

---

## ⚙️ 6단계: PM2 설정 업데이트 (30초)

```bash
cd ~/n8n-neuralgrid
cp ecosystem.config.js ecosystem.config.js.backup

# 새 ecosystem.config.js 작성 (monitor-server 추가)
nano ecosystem.config.js
```

**추가할 앱**:
```javascript
{
  name: 'monitor-server',
  cwd: '/home/azamans/n8n-neuralgrid/monitor-server',
  script: 'index.js',
  env: {
    NODE_ENV: 'production',
    PORT: '3002',
  },
}
```

---

## 🏗️ 7단계: 빌드 & 배포 (1분)

```bash
# Next.js 빌드
cd ~/n8n-neuralgrid/apps/web
pnpm run build

# PM2 재시작
cd ~/n8n-neuralgrid
pm2 delete all
pm2 start ecosystem.config.js
pm2 save

# 상태 확인
pm2 status
```

**예상 출력**:
```
┌─────┬────────────────────────────┬─────────┬─────────┐
│ id  │ name                       │ status  │ restart │
├─────┼────────────────────────────┼─────────┼─────────┤
│ 0   │ n8n-server                 │ online  │ 0       │
│ 1   │ neuralgrid-web             │ online  │ 0       │
│ 2   │ monitor-server             │ online  │ 0       │
│ 3   │ youtube-shorts-generator   │ online  │ 0       │
└─────┴────────────────────────────┴─────────┴─────────┘
```

---

## ✅ 8단계: 배포 확인 (30초)

```bash
# 서비스 확인
curl -I https://neuralgrid.kr/auth/signin
curl -I https://neuralgrid.kr/auth/signup
curl -I https://monitor.neuralgrid.kr

# 모두 HTTP/2 200 OK 반환해야 함
```

---

## 👤 9단계: 관리자 계정 생성 (1분)

### 1. 회원가입
브라우저에서 https://neuralgrid.kr/auth/signup 접속하여 계정 생성

### 2. ADMIN 역할 부여
```bash
psql -U neuralgrid -p 5434 -d n8n_neuralgrid -c "UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
```

### 3. 로그인
https://neuralgrid.kr/auth/signin 에서 로그인 후 https://neuralgrid.kr/admin 접속

---

## 🎉 완료!

### 접속 URL
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

## 🔧 문제 해결

### 빌드 실패
```bash
cd ~/n8n-neuralgrid/apps/web
rm -rf .next node_modules
pnpm install
pnpm run build
```

### PM2 프로세스 오류
```bash
pm2 logs neuralgrid-web --lines 50
pm2 logs monitor-server --lines 50
```

### Nginx 502 에러
```bash
# PM2 상태 확인
pm2 status

# Nginx 에러 로그
sudo tail -50 /var/log/nginx/neuralgrid.kr.error.log

# Nginx 재시작
sudo systemctl restart nginx
```

### 데이터베이스 연결 실패
```bash
# PostgreSQL 확인
sudo systemctl status postgresql

# 연결 테스트
psql -U neuralgrid -p 5434 -d n8n_neuralgrid -c "SELECT 1;"
```

---

## 📚 추가 정보

- **상세 가이드**: `DEPLOYMENT_INSTRUCTIONS.md`
- **파일 매핑**: `FILE_MAPPING.md`
- **업그레이드 가이드**: `NEURALGRID_UPGRADE_GUIDE.md`

---

## 🆘 긴급 롤백

문제 발생 시 이전 상태로 되돌리기:

```bash
cd ~/n8n-neuralgrid

# ecosystem.config.js 복원
cp ecosystem.config.js.backup ecosystem.config.js

# PM2 재시작
pm2 delete all
pm2 start ecosystem.config.js

# Web app 재빌드
cd apps/web
pnpm run build
cd ~/n8n-neuralgrid
pm2 restart neuralgrid-web
```

---

**배포 시간**: 약 7분
**난이도**: ⭐⭐⭐ (중급)
**필요 지식**: Linux, Node.js, PostgreSQL, Nginx
