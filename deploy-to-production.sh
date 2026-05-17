#!/bin/bash

# NeuronStar Music - Production Deployment Script
# This script should be run on the PRODUCTION server at:
# /home/azamans/n8n-neuralgrid/apps/neuronstar-music/

echo "🚀 NeuronStar Music - Production Deployment"
echo "============================================="
echo ""

# Step 1: Stop the current PM2 process
echo "📋 Step 1: Stopping current PM2 process..."
pm2 stop neuronstar-music || echo "⚠️  Process not running"
echo "✅ Process stopped"
echo ""

# Step 2: Pull latest code (if using git)
echo "📋 Step 2: Git pull (if configured)..."
if [ -d ".git" ]; then
  git pull origin main
  echo "✅ Code updated"
else
  echo "⚠️  Not a git repository - skipping"
fi
echo ""

# Step 3: Install dependencies
echo "📋 Step 3: Installing dependencies..."
pnpm install
echo "✅ Dependencies installed"
echo ""

# Step 4: Generate Prisma Client
echo "📋 Step 4: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# Step 5: Build Next.js application
echo "📋 Step 5: Building Next.js application..."
pnpm build
echo "✅ Build complete"
echo ""

# Step 6: Restart PM2 process
echo "📋 Step 6: Restarting PM2 process..."
pm2 restart neuronstar-music
echo "✅ Process restarted"
echo ""

# Step 7: Check PM2 status
echo "📋 Step 7: Checking PM2 status..."
pm2 status neuronstar-music
echo ""

# Step 8: Display logs
echo "📋 Step 8: Recent logs (last 20 lines)..."
pm2 logs neuronstar-music --lines 20 --nostream
echo ""

# Final message
echo "============================================="
echo "✅ Deployment Complete!"
echo ""
echo "📍 Access Points:"
echo "   - Homepage: https://music.neuralgrid.kr"
echo "   - Admin: https://music.neuralgrid.kr/admin"
echo ""
echo "🔧 Monitoring Commands:"
echo "   - pm2 status"
echo "   - pm2 logs neuronstar-music"
echo "   - pm2 restart neuronstar-music"
echo ""
echo "🎵 Test Music Generation:"
echo "   curl -X POST \"https://music.neuralgrid.kr/api/admin/generate\" \\"
echo "     -H \"x-admin-key: 9eZwW+qgElNVnajvVW6BEe/03Lc6qDq+1qM10hNzqJ8=\" \\"
echo "     -H \"Content-Type: application/json\" \\"
echo "     -d '{\"genre\": \"pop\", \"count\": 2, \"downloadToHDD\": true}'"
echo ""
echo "============================================="
