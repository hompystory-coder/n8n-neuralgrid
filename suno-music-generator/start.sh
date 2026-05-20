#!/bin/bash

# Suno Music Generator - Quick Start Script
# This script helps you quickly set up and run the application

set -e

echo "🎵 Suno Music Generator - Quick Start"
echo "======================================"
echo ""

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed!"
    echo "Please install Node.js 16 or higher from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 16 ]; then
    echo "❌ Node.js version is too old (need v16+, have v$NODE_VERSION)"
    exit 1
fi

echo "✅ Node.js $(node -v) detected"
echo ""

# Check if .env exists
if [ ! -f ".env" ]; then
    echo "⚠️  .env file not found! Creating from .env.example..."
    cp .env.example .env
    echo "✅ Created .env file"
    echo ""
    echo "📝 IMPORTANT: Please edit .env file and add your Suno API key:"
    echo "   nano .env"
    echo ""
    read -p "Press Enter after you've configured your API key..."
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
    echo "✅ Dependencies installed"
    echo ""
fi

# Create storage directory
mkdir -p storage/music
echo "✅ Storage directory ready"
echo ""

# Check Redis (optional)
if command -v redis-cli &> /dev/null; then
    if redis-cli ping &> /dev/null; then
        echo "✅ Redis is running"
    else
        echo "⚠️  Redis is installed but not running"
        echo "   Start it with: redis-server"
        echo "   (The app will work without Redis using in-memory mode)"
    fi
else
    echo "ℹ️  Redis not detected (optional)"
    echo "   The app will use in-memory queue mode"
fi
echo ""

# Check MongoDB (optional)
if command -v mongod &> /dev/null; then
    echo "✅ MongoDB is installed"
else
    echo "ℹ️  MongoDB not detected (optional)"
    echo "   The app will work without MongoDB"
fi
echo ""

echo "🚀 Starting Suno Music Generator..."
echo ""
echo "📡 Server will start on: http://localhost:5000"
echo "🌐 Web UI: http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""
echo "======================================"
echo ""

# Start the server
npm start
