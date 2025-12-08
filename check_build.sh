#!/bin/bash

echo "=== 1. next.config.js 확인 ==="
cat ~/n8n-neuralgrid/apps/web/next.config.js

echo ""
echo "=== 2. standalone 빌드 여부 확인 ==="
if [ -d ~/n8n-neuralgrid/apps/web/.next/standalone ]; then
    echo "✅ standalone 빌드 존재"
    ls -la ~/n8n-neuralgrid/apps/web/.next/standalone/
else
    echo "❌ standalone 빌드 없음 - next.config.js에 output: 'standalone' 추가 필요"
fi

echo ""
echo "=== 3. server.js 파일 확인 ==="
if [ -f ~/n8n-neuralgrid/apps/web/.next/standalone/apps/web/server.js ]; then
    echo "✅ server.js 존재"
else
    echo "❌ server.js 없음"
    # 대안: .next/standalone/server.js가 있는지 확인
    if [ -f ~/n8n-neuralgrid/apps/web/.next/standalone/server.js ]; then
        echo "✅ 대안 경로에 server.js 존재: .next/standalone/server.js"
    fi
fi

echo ""
echo "=== 4. 일반 빌드 파일 확인 ==="
ls -la ~/n8n-neuralgrid/apps/web/.next/ | grep -E "server|standalone"

