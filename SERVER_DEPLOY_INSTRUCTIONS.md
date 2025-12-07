# 🚀 서버 배포 가이드 (115.91.5.140)

## 현재 상황
- ✅ PostgreSQL 설치 완료 (port 5434, 사용자: neuralgrid, DB: n8n_neuralgrid)
- ✅ n8n 실행 중 (port 5678)
- ✅ 프로젝트 클론 완료 (`~/n8n-neuralgrid`)

## 🎯 배포 방법

### 방법 1: 자동 배포 스크립트 사용 (권장)

```bash
# 1. 서버에 SSH 접속
ssh user@115.91.5.140

# 2. 배포 스크립트 다운로드 및 실행
cd ~/n8n-neuralgrid
curl -O https://raw.githubusercontent.com/hompystory-coder/n8n-neuralgrid/genspark_ai_developer/SERVER_QUICK_DEPLOY.sh
chmod +x SERVER_QUICK_DEPLOY.sh
./SERVER_QUICK_DEPLOY.sh
```

### 방법 2: 수동 배포 (단계별)

```bash
# 1. 프로젝트 디렉토리로 이동
cd ~/n8n-neuralgrid

# 2. pnpm 설치 (없는 경우)
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

# 3. .npmrc 파일 생성
cat > .npmrc << 'EOF'
shamefully-hoist=true
node-linker=hoisted
public-hoist-pattern[]=*
EOF

# 4. 의존성 설치
rm -rf node_modules packages/*/node_modules apps/*/node_modules pnpm-lock.yaml
pnpm install --no-frozen-lockfile

# 5. Prisma 설정
cd packages/database
npm install prisma@5.22.0 @prisma/client@5.22.0 --save-dev
export DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434"
npx prisma generate
npx prisma db push --skip-generate

# 6. .env 파일 설정
cd ../../apps/web
cat > .env << 'EOF'
DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434"
NEXTAUTH_URL="http://115.91.5.140:3000"
NEXTAUTH_SECRET="fA51L/U0OBVL0DgscgOeJJyZe4oXRA80fax0x/ybvYA="
N8N_WEBHOOK_URL="http://115.91.5.140:5678"
N8N_API_KEY=""
TOSS_SECRET_KEY="test_sk_XXX"
TOSS_CLIENT_KEY="test_ck_XXX"
EOF

# 7. Next.js 빌드
export NODE_ENV=production
pnpm run build

# 8. PM2로 실행
npm install -g pm2
pm2 stop neuralgrid-web 2>/dev/null || true
pm2 delete neuralgrid-web 2>/dev/null || true

# ecosystem.config.js 생성
cat > ../../ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'neuralgrid-web',
    cwd: '/home/user/n8n-neuralgrid/apps/web',
    script: './node_modules/.bin/next',
    args: 'start -p 3000',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434',
      NEXTAUTH_URL: 'http://115.91.5.140:3000',
      NEXTAUTH_SECRET: 'fA51L/U0OBVL0DgscgOeJJyZe4oXRA80fax0x/ybvYA=',
      N8N_WEBHOOK_URL: 'http://115.91.5.140:5678',
      TOSS_SECRET_KEY: 'test_sk_XXX',
      TOSS_CLIENT_KEY: 'test_ck_XXX'
    },
    instances: 1,
    autorestart: true
  }]
}
EOF

cd ../..
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

## ✅ 배포 확인

```bash
# PM2 상태 확인
pm2 status

# 로그 확인
pm2 logs neuralgrid-web --lines 50

# 웹 접속 테스트
curl http://localhost:3000
```

## 🌐 접속 URL

- **메인 페이지**: http://115.91.5.140:3000
- **대시보드**: http://115.91.5.140:3000/dashboard/workflows
- **n8n 프록시**: http://115.91.5.140:3000/n8n/

## 🔧 트러블슈팅

### 1. pnpm workspace 이슈

**증상**: `sh: 1: next: not found` 오류

**해결책**:
```bash
# .npmrc 파일 생성으로 hoisting 강제
cd ~/n8n-neuralgrid
cat > .npmrc << 'EOF'
shamefully-hoist=true
node-linker=hoisted
public-hoist-pattern[]=*
EOF

# 재설치
rm -rf node_modules packages/*/node_modules apps/*/node_modules
pnpm install --no-frozen-lockfile
```

### 2. Prisma 생성 실패

**증상**: `Command "prisma" not found`

**해결책**:
```bash
cd ~/n8n-neuralgrid/packages/database
npm install prisma@5.22.0 @prisma/client@5.22.0 --save-dev
npx prisma generate
```

### 3. 데이터베이스 연결 실패

**증상**: `Authentication failed against database server`

**해결책**:
```bash
# PostgreSQL 소켓 연결 사용
export DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434"

# PostgreSQL 상태 확인
sudo systemctl status postgresql

# 연결 테스트
psql -h /var/run/postgresql -p 5434 -U neuralgrid -d n8n_neuralgrid -c "SELECT version();"
```

### 4. PM2 로그에 JWT_SESSION_ERROR

**증상**: `[next-auth][error][JWT_SESSION_ERROR] decryption operation failed`

**해결책**:
```bash
# NEXTAUTH_SECRET 재생성
openssl rand -base64 32

# .env 파일 업데이트
cd ~/n8n-neuralgrid/apps/web
nano .env  # NEXTAUTH_SECRET 값 업데이트

# PM2 재시작
pm2 restart neuralgrid-web --update-env
```

## 💡 유용한 명령어

```bash
# 로그 실시간 모니터링
pm2 logs neuralgrid-web

# 애플리케이션 재시작
pm2 restart neuralgrid-web

# 애플리케이션 중지
pm2 stop neuralgrid-web

# 애플리케이션 제거
pm2 delete neuralgrid-web

# PM2 프로세스 목록
pm2 list

# 특정 프로세스 상세 정보
pm2 show neuralgrid-web

# PM2 모니터링 대시보드
pm2 monit

# Prisma Studio (데이터베이스 GUI)
cd ~/n8n-neuralgrid/packages/database
npx prisma studio

# 빌드 다시 하기
cd ~/n8n-neuralgrid/apps/web
pnpm run build
pm2 restart neuralgrid-web
```

## 📊 프로젝트 현황

- ✅ TypeScript 에러: 0개
- ✅ Prisma 스키마: 7개 모델 (User, Subscription, Payment, Workflow, WorkflowExecution, Template, UsageRecord)
- ✅ API 엔드포인트: 18개
- ✅ NextAuth 인증: 설정 완료
- ✅ n8n 프록시: 설정 완료
- ✅ Toss Payments 연동: 설정 완료

## 🎉 성공 확인

배포가 성공하면 다음과 같이 확인됩니다:

```bash
$ pm2 status
┌────┬──────────────────┬─────────┬─────────┬────────┬──────┬───────────┐
│ id │ name             │ status  │ cpu     │ memory │ ...  │           │
├────┼──────────────────┼─────────┼─────────┼────────┼──────┼───────────┤
│ 0  │ neuralgrid-web   │ online  │ 0%      │ 150mb  │ ...  │ 10s       │
└────┴──────────────────┴─────────┴─────────┴────────┴──────┴───────────┘

$ pm2 logs neuralgrid-web --lines 5
...
[0] Ready in 166ms
[0] - Local: http://localhost:3000
```

브라우저에서 http://115.91.5.140:3000 접속 시 웹페이지가 표시되면 성공! 🎊
