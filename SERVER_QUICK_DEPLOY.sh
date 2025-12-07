#!/bin/bash

# 서버(115.91.5.140)에서 직접 실행할 배포 스크립트
# SSH로 서버 접속 후 이 명령어들을 순서대로 실행하세요

echo "🚀 n8n-neuralgrid 서버 배포 스크립트"
echo "======================================"
echo ""

# 색상 정의
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 프로젝트 디렉토리로 이동
cd ~/n8n-neuralgrid

echo -e "${YELLOW}Step 1: pnpm 설치 확인...${NC}"
# pnpm이 없으면 설치
if ! command -v pnpm &> /dev/null; then
    echo "pnpm 설치 중..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    export PNPM_HOME="$HOME/.local/share/pnpm"
    export PATH="$PNPM_HOME:$PATH"
    source ~/.bashrc
fi
echo -e "${GREEN}✓ pnpm 버전: $(pnpm --version)${NC}"
echo ""

echo -e "${YELLOW}Step 2: 의존성 설치...${NC}"
# .npmrc 파일 생성 (hoisting 강제)
cat > .npmrc << 'NPMRC'
shamefully-hoist=true
node-linker=hoisted
public-hoist-pattern[]=*
NPMRC

# 깨끗하게 재설치
rm -rf node_modules packages/*/node_modules apps/*/node_modules pnpm-lock.yaml
pnpm install --no-frozen-lockfile
echo -e "${GREEN}✓ 의존성 설치 완료${NC}"
echo ""

echo -e "${YELLOW}Step 3: Prisma Client 생성...${NC}"
cd packages/database
export DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434"

# Prisma 설치 (로컬에)
npm install prisma@5.22.0 @prisma/client@5.22.0 --save-dev

# Prisma generate
npx prisma generate

# DB Push (스키마 동기화)
npx prisma db push --skip-generate || echo "⚠️  DB push failed - 계속 진행합니다"

echo -e "${GREEN}✓ Prisma 설정 완료${NC}"
echo ""

echo -e "${YELLOW}Step 4: Next.js 빌드...${NC}"
cd ../../apps/web

# .env 파일이 없으면 생성
if [ ! -f .env ]; then
    cp .env.example .env || cat > .env << 'ENVFILE'
# Database
DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434"

# NextAuth
NEXTAUTH_URL="http://115.91.5.140:3000"
NEXTAUTH_SECRET="fA51L/U0OBVL0DgscgOeJJyZe4oXRA80fax0x/ybvYA="

# n8n
N8N_WEBHOOK_URL="http://115.91.5.140:5678"
N8N_API_KEY=""

# Toss Payments
TOSS_SECRET_KEY="test_sk_XXX"
TOSS_CLIENT_KEY="test_ck_XXX"
ENVFILE
fi

# Next.js 빌드
export NODE_ENV=production
pnpm run build

echo -e "${GREEN}✓ 빌드 완료${NC}"
echo ""

echo -e "${YELLOW}Step 5: PM2 설정 및 시작...${NC}"
# PM2가 없으면 설치
if ! command -v pm2 &> /dev/null; then
    npm install -g pm2
fi

# 기존 프로세스 정리
pm2 stop neuralgrid-web 2>/dev/null || true
pm2 delete neuralgrid-web 2>/dev/null || true

# PM2 ecosystem 파일 생성
cat > ../../ecosystem.config.js << 'PM2CONFIG'
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
    autorestart: true,
    watch: false,
    max_memory_restart: '1G'
  }]
}
PM2CONFIG

# PM2로 시작
cd ../..
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -1 | bash || true

echo -e "${GREEN}✓ PM2 설정 완료${NC}"
echo ""

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}✅ 배포 완료!${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "📊 PM2 상태:"
pm2 status
echo ""
echo "📝 로그 확인:"
pm2 logs neuralgrid-web --lines 20 --nostream
echo ""
echo "🌐 접속 URL:"
echo "   메인:      http://115.91.5.140:3000"
echo "   대시보드:  http://115.91.5.140:3000/dashboard/workflows"
echo "   n8n 프록시: http://115.91.5.140:3000/n8n/"
echo ""
echo "💡 유용한 명령어:"
echo "   pm2 logs neuralgrid-web       # 로그 보기"
echo "   pm2 restart neuralgrid-web    # 재시작"
echo "   pm2 stop neuralgrid-web       # 중지"
echo "   pm2 delete neuralgrid-web     # 삭제"
echo ""
