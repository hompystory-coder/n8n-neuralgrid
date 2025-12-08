#!/bin/bash

echo "🚀 NeuronStar Music - Production Deployment"
echo "============================================="
echo ""

# Step 1: Stop the current PM2 process
echo "📋 Step 1: Stopping current PM2 process..."
pm2 stop neuronstar-music || echo "⚠️  Process not running"
echo "✅ Process stopped"
echo ""

# Step 2: Install dependencies
echo "📋 Step 2: Installing dependencies..."
pnpm install
echo "✅ Dependencies installed"
echo ""

# Step 3: Generate Prisma Client
echo "📋 Step 3: Generating Prisma Client..."
npx prisma generate
echo "✅ Prisma Client generated"
echo ""

# Step 4: Build Next.js application
echo "📋 Step 4: Building Next.js application..."
pnpm build
echo "✅ Build complete"
echo ""

# Step 5: Restart PM2 process
echo "📋 Step 5: Restarting PM2 process..."
pm2 restart neuronstar-music
echo "✅ Process restarted"
echo ""

# Step 6: Check PM2 status
echo "📋 Step 6: Checking PM2 status..."
pm2 status neuronstar-music
echo ""

echo "============================================="
echo "✅ Deployment Complete!"
echo ""
echo "📍 Access Points:"
echo "   - Homepage: https://music.neuralgrid.kr"
echo "   - Admin: https://music.neuralgrid.kr/admin"
echo ""
