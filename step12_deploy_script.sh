#!/bin/bash
# Save this as: ~/n8n-neuralgrid/deploy_upgrade.sh
# NeuralGrid Platform Upgrade - Complete Deployment Script

set -e  # Exit on error

echo "=========================================="
echo "NeuralGrid 플랫폼 업그레이드 시작"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Step 1: Install dependencies
echo -e "${BLUE}[1/12] 패키지 설치 중...${NC}"
cd ~/n8n-neuralgrid/apps/web
pnpm add @types/bcryptjs @next-auth/prisma-adapter
pnpm add -D prisma

# Step 2: Create Prisma schema
echo -e "${BLUE}[2/12] Prisma 스키마 생성 중...${NC}"
mkdir -p prisma
# Note: Copy the schema from step1_prisma_schema.prisma to prisma/schema.prisma

# Step 3: Update .env file
echo -e "${BLUE}[3/12] 환경 변수 업데이트 중...${NC}"
if ! grep -q "NEXTAUTH_SECRET" .env; then
  echo "" >> .env
  echo "# NextAuth Configuration" >> .env
  SECRET=$(openssl rand -base64 32)
  echo "NEXTAUTH_SECRET=\"${SECRET}\"" >> .env
  echo -e "${GREEN}✓ NEXTAUTH_SECRET 생성 완료${NC}"
fi

# Update NEXTAUTH_URL to production URL
sed -i 's|NEXTAUTH_URL="http://115.91.5.140:3000"|NEXTAUTH_URL="https://neuralgrid.kr"|g' .env
echo -e "${GREEN}✓ NEXTAUTH_URL 업데이트 완료${NC}"

# Step 4: Initialize Prisma
echo -e "${BLUE}[4/12] Prisma 초기화 중...${NC}"
pnpm prisma generate
pnpm prisma db push

# Step 5: Create directory structure
echo -e "${BLUE}[5/12] 디렉토리 구조 생성 중...${NC}"
mkdir -p app/auth/signin
mkdir -p app/auth/signup
mkdir -p app/mypage
mkdir -p app/admin
mkdir -p app/monitor
mkdir -p app/api/auth/signup
mkdir -p app/api/user/profile
mkdir -p app/api/admin/stats

# Step 6: Setup monitoring server
echo -e "${BLUE}[6/12] 모니터링 서버 설정 중...${NC}"
cd ~/n8n-neuralgrid
mkdir -p monitor-server
cd monitor-server

# Create package.json for monitor server
cat > package.json << 'EOF'
{
  "name": "neuralgrid-monitor",
  "version": "1.0.0",
  "description": "NeuralGrid Server Monitoring API",
  "main": "index.js",
  "scripts": {
    "start": "node index.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "systeminformation": "^5.21.20"
  }
}
EOF

pnpm install
echo -e "${GREEN}✓ 모니터링 서버 패키지 설치 완료${NC}"

# Step 7: Update ecosystem.config.js
echo -e "${BLUE}[7/12] PM2 설정 업데이트 중...${NC}"
cd ~/n8n-neuralgrid

# Backup existing config
cp ecosystem.config.js ecosystem.config.js.backup

# Add monitor-server to ecosystem config
cat > ecosystem.config.js << 'EOF'
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
        DB_POSTGRESDB_PASSWORD: 'your-password-here',
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
        NEXTAUTH_SECRET: 'your-secret-from-env',
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
EOF

echo -e "${GREEN}✓ PM2 설정 업데이트 완료${NC}"

# Step 8: Setup Nginx for monitor subdomain
echo -e "${BLUE}[8/12] Nginx 설정 (monitor.neuralgrid.kr)${NC}"
sudo bash -c 'cat > /etc/nginx/sites-available/monitor.neuralgrid.kr << '"'"'EOF'"'"'
server {
    listen 80;
    server_name monitor.neuralgrid.kr;
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name monitor.neuralgrid.kr;

    # SSL Configuration (will be configured by certbot)
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
        proxy_request_buffering off;
        proxy_buffer_size 16k;
        proxy_buffers 8 16k;
    }
}
EOF'

# Create symbolic link
sudo ln -sf /etc/nginx/sites-available/monitor.neuralgrid.kr /etc/nginx/sites-enabled/

# Test Nginx configuration
echo -e "${BLUE}Nginx 설정 테스트 중...${NC}"
sudo nginx -t

# Reload Nginx
echo -e "${BLUE}Nginx 재시작 중...${NC}"
sudo systemctl reload nginx

echo -e "${GREEN}✓ Nginx 설정 완료${NC}"

# Step 9: Setup SSL for monitor subdomain
echo -e "${BLUE}[9/12] SSL 인증서 설정 (monitor.neuralgrid.kr)${NC}"
echo -e "${YELLOW}다음 명령어를 실행하세요:${NC}"
echo -e "${YELLOW}sudo certbot --nginx -d monitor.neuralgrid.kr${NC}"
echo ""
read -p "SSL 설정을 완료했나요? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
  echo -e "${GREEN}✓ SSL 설정 완료${NC}"
fi

# Step 10: Build Next.js application
echo -e "${BLUE}[10/12] Next.js 애플리케이션 빌드 중...${NC}"
cd ~/n8n-neuralgrid/apps/web
pnpm run build
echo -e "${GREEN}✓ 빌드 완료${NC}"

# Step 11: Restart PM2 services
echo -e "${BLUE}[11/12] PM2 서비스 재시작 중...${NC}"
cd ~/n8n-neuralgrid
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
echo -e "${GREEN}✓ PM2 재시작 완료${NC}"

# Step 12: Verify deployment
echo -e "${BLUE}[12/12] 배포 확인 중...${NC}"
echo ""
sleep 5

pm2 status

echo ""
echo -e "${GREEN}=========================================="
echo -e "NeuralGrid 플랫폼 업그레이드 완료!"
echo -e "==========================================${NC}"
echo ""
echo "접속 URL:"
echo "  - 메인: https://neuralgrid.kr"
echo "  - 로그인: https://neuralgrid.kr/auth/signin"
echo "  - 회원가입: https://neuralgrid.kr/auth/signup"
echo "  - 대시보드: https://neuralgrid.kr/dashboard"
echo "  - 마이페이지: https://neuralgrid.kr/mypage"
echo "  - 관리자: https://neuralgrid.kr/admin"
echo "  - 모니터링: https://monitor.neuralgrid.kr"
echo "  - AI 쇼츠: https://shorts.neuralgrid.kr"
echo "  - n8n: https://n8n.neuralgrid.kr"
echo ""
echo -e "${YELLOW}다음 단계:${NC}"
echo "1. https://neuralgrid.kr/auth/signup 에서 계정 생성"
echo "2. 데이터베이스에서 첫 번째 사용자를 ADMIN으로 승급"
echo "   psql -U neuralgrid -p 5434 -d n8n_neuralgrid"
echo "   UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
echo "3. https://neuralgrid.kr/auth/signin 에서 로그인"
echo "4. https://neuralgrid.kr/admin 에서 관리자 기능 확인"
echo ""
