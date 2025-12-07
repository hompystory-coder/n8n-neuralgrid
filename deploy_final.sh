#!/bin/bash
set -e

echo "=========================================="
echo "최종 빌드 및 배포 시작"
echo "=========================================="

# PM2 ecosystem 업데이트
echo "[8/10] PM2 설정 업데이트..."
cd ~/n8n-neuralgrid
cp ecosystem.config.js ecosystem.config.js.backup-$(date +%Y%m%d-%H%M%S)

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

echo "✓ PM2 설정 업데이트 완료"

# Next.js 빌드
echo "[9/10] Next.js 빌드 중... (2-3분 소요)"
cd ~/n8n-neuralgrid/apps/web
pnpm run build

echo "✓ 빌드 완료"

# PM2 재시작
echo "[10/10] PM2 재시작 중..."
cd ~/n8n-neuralgrid
pm2 restart all
pm2 save

echo ""
echo "=========================================="
echo "✓ 배포 완료!"
echo "=========================================="
echo ""
echo "PM2 상태 확인 중..."
pm2 status

echo ""
echo "=========================================="
echo "🎉 NeuralGrid 업그레이드 완료!"
echo "=========================================="
echo ""
echo "접속 URL:"
echo "  - 메인: https://neuralgrid.kr"
echo "  - 로그인: https://neuralgrid.kr/auth/signin"
echo "  - 회원가입: https://neuralgrid.kr/auth/signup"
echo "  - 대시보드: https://neuralgrid.kr/dashboard"
echo "  - 마이페이지: https://neuralgrid.kr/mypage"
echo "  - 관리자: https://neuralgrid.kr/admin"
echo ""
echo "다음 단계:"
echo "1. 브라우저에서 https://neuralgrid.kr/auth/signup 접속"
echo "2. 계정 생성"
echo "3. 데이터베이스에서 ADMIN 역할 부여:"
echo "   psql -U neuralgrid -p 5434 -d n8n_neuralgrid"
echo "   UPDATE users SET role = 'ADMIN' WHERE email = 'your@email.com';"
echo "4. https://neuralgrid.kr/auth/signin 로그인"
echo "5. https://neuralgrid.kr/admin 관리자 대시보드 확인"
echo ""
