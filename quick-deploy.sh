#!/bin/bash

set -e

echo "🚀 n8n-neuralgrid Quick Deployment Script"
echo "=========================================="
echo ""

# Set environment
export PNPM_HOME="$HOME/.local/share/pnpm"
export PATH="$PNPM_HOME:$PATH"

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 1. Install pnpm if needed
echo -e "${YELLOW}📦 Step 1: Checking pnpm installation...${NC}"
if ! command -v pnpm &> /dev/null; then
    echo "Installing pnpm..."
    curl -fsSL https://get.pnpm.io/install.sh | sh -
    export PNPM_HOME="$HOME/.local/share/pnpm"
    export PATH="$PNPM_HOME:$PATH"
fi
echo -e "${GREEN}✓ pnpm version: $(pnpm --version)${NC}"
echo ""

# 2. Install dependencies
echo -e "${YELLOW}📦 Step 2: Installing dependencies...${NC}"
cd /home/user/webapp
pnpm install --force || pnpm install --no-frozen-lockfile
echo -e "${GREEN}✓ Dependencies installed${NC}"
echo ""

# 3. Generate Prisma Client
echo -e "${YELLOW}🗄️  Step 3: Generating Prisma Client...${NC}"
cd /home/user/webapp/packages/database
export DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434"
pnpm prisma generate
echo -e "${GREEN}✓ Prisma Client generated${NC}"
echo ""

# 4. Push Database Schema  
echo -e "${YELLOW}🗄️  Step 4: Pushing database schema...${NC}"
pnpm prisma db push --skip-generate || echo "⚠️  Database push failed - will try to continue"
echo ""

# 5. Build the application
echo -e "${YELLOW}🔨 Step 5: Building application...${NC}"
cd /home/user/webapp/apps/web
pnpm run build
echo -e "${GREEN}✓ Application built successfully${NC}"
echo ""

# 6. Setup PM2
echo -e "${YELLOW}🔄 Step 6: Setting up PM2...${NC}"
pm2 stop neuralgrid-web 2>/dev/null || true
pm2 delete neuralgrid-web 2>/dev/null || true

# Start with PM2
cd /home/user/webapp/apps/web
pm2 start npm --name "neuralgrid-web" -- start
pm2 save
echo -e "${GREEN}✓ PM2 process started${NC}"
echo ""

# 7. Check status
echo -e "${YELLOW}📊 Step 7: Checking deployment status...${NC}"
pm2 status
echo ""
pm2 logs neuralgrid-web --lines 20 --nostream
echo ""

echo -e "${GREEN}✅ Deployment Complete!${NC}"
echo ""
echo "🌐 Access your application at:"
echo "   Main:      http://115.91.5.140:3000"
echo "   Dashboard: http://115.91.5.140:3000/dashboard/workflows"
echo "   n8n Proxy: http://115.91.5.140:3000/n8n/"
echo ""
echo "📝 Useful commands:"
echo "   pm2 logs neuralgrid-web       # View logs"
echo "   pm2 restart neuralgrid-web    # Restart app"
echo "   pm2 stop neuralgrid-web       # Stop app"
echo ""
