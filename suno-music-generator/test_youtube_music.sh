#!/bin/bash

# 아이유 - 밤편지 (Through the Night)
YOUTUBE_URL="https://www.youtube.com/watch?v=BzYnNdJhZQw"

echo "🎵 YouTube 음악 분석 및 가사 생성 테스트"
echo "URL: $YOUTUBE_URL"
echo ""

curl -X POST http://localhost:5000/api/youtube/analyze \
  -H "Content-Type: application/json" \
  -d "{
    \"youtubeUrl\": \"$YOUTUBE_URL\",
    \"lyricCount\": 1,
    \"language\": \"korean\"
  }" \
  -s | jq '.'
