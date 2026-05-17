#!/bin/bash

echo "=== 🎨 스타일 API 테스트 ==="
echo ""

echo "1️⃣ 저장된 스타일 목록 조회..."
curl -s http://localhost:5000/api/style/list | jq '.'
echo ""

echo "2️⃣ 테마 기반 가사 생성 테스트 (IU 스타일, '사랑' 테마)..."
curl -s -X POST http://localhost:5000/api/style/generate-lyrics \
  -H "Content-Type: application/json" \
  -d '{
    "style": "K-pop Ballad, soft tender female vocals, clear sweet voice, emotional delivery, acoustic guitar, gentle piano, subtle strings, warm pad synths, light percussion, intimate atmosphere, romantic mood, 70-80 BPM, contemporary Korean ballad style, delicate vocal techniques, breathy tone, perfect pitch control, IU-inspired vocal color",
    "theme": "사랑",
    "language": "korean",
    "gender": "female"
  }' | jq '.data.lyrics' | head -30

echo ""
echo "✅ 테스트 완료!"
