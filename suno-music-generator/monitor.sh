#!/bin/bash

# 실시간 모니터링 스크립트

echo "====================================="
echo "🔍 실시간 시스템 모니터링 시작"
echo "====================================="
echo ""

while true; do
    clear
    echo "📊 [$(date '+%Y-%m-%d %H:%M:%S')] 실시간 상태"
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo ""
    
    echo "🟢 서버 상태:"
    if ps aux | grep -q "[n]ode server/index.js"; then
        echo "   ✅ 서버 실행 중 (PID: $(pgrep -f 'node server/index.js'))"
        CPU=$(ps aux | grep "[n]ode server/index.js" | awk '{print $3}')
        MEM=$(ps aux | grep "[n]ode server/index.js" | awk '{print $4}')
        echo "   📈 CPU: ${CPU}% | MEM: ${MEM}%"
    else
        echo "   ❌ 서버 중지됨"
    fi
    echo ""
    
    echo "📋 썸네일 대기열:"
    QUEUE=$(curl -s http://localhost:5000/api/webhook/thumbnail-queue 2>/dev/null | jq -r '.count // 0')
    echo "   📦 대기 중: ${QUEUE}개"
    echo ""
    
    echo "📜 최근 로그 (마지막 10줄):"
    tail -10 /tmp/server-title-only.log 2>/dev/null | sed 's/^/   │ /'
    echo ""
    
    echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
    echo "💡 Ctrl+C로 종료 | 5초마다 자동 갱신"
    echo ""
    
    sleep 5
done
