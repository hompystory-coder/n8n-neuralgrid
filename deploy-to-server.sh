#!/bin/bash

# n8n-neuralgrid 서버 배포 스크립트

echo "=================================================="
echo "🚀 n8n-neuralgrid 서버 배포 시작"
echo "=================================================="
echo ""

# 현재 위치 확인
if [ ! -f "package.json" ]; then
    echo "❌ 에러: package.json을 찾을 수 없습니다."
    echo "프로젝트 루트 디렉토리에서 실행해주세요."
    exit 1
fi

echo "📍 현재 디렉토리: $(pwd)"
echo ""

# 의존성 설치
echo "📦 1단계: 의존성 설치 중..."
pnpm install
if [ $? -ne 0 ]; then
    echo "❌ 의존성 설치 실패"
    exit 1
fi
echo "✅ 의존성 설치 완료"
echo ""

# Prisma Client 생성
echo "🗄️  2단계: Prisma Client 생성 중..."
pnpm db:generate
if [ $? -ne 0 ]; then
    echo "❌ Prisma Client 생성 실패"
    exit 1
fi
echo "✅ Prisma Client 생성 완료"
echo ""

# 데이터베이스 스키마 적용
echo "🗄️  3단계: 데이터베이스 스키마 적용 중..."
echo "⚠️  이 단계는 .env.local에 DATABASE_URL이 설정되어 있어야 합니다."
read -p "계속하시겠습니까? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    pnpm db:push
    if [ $? -ne 0 ]; then
        echo "⚠️  데이터베이스 스키마 적용 실패 (나중에 수동으로 실행하세요)"
    else
        echo "✅ 데이터베이스 스키마 적용 완료"
    fi
else
    echo "⏭️  데이터베이스 스키마 적용 건너뛰기"
fi
echo ""

# Next.js 빌드
echo "🔨 4단계: Next.js 빌드 중..."
pnpm build
if [ $? -ne 0 ]; then
    echo "❌ 빌드 실패"
    exit 1
fi
echo "✅ 빌드 완료"
echo ""

# PM2 확인
echo "🔧 5단계: PM2 설정 중..."
if ! command -v pm2 &> /dev/null; then
    echo "⚠️  PM2가 설치되지 않았습니다."
    read -p "PM2를 설치하시겠습니까? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        npm install -g pm2
    else
        echo "PM2 없이 계속 진행..."
    fi
fi

# PM2로 실행
if command -v pm2 &> /dev/null; then
    echo "PM2로 애플리케이션 시작 중..."
    
    # 기존 프로세스 확인
    if pm2 list | grep -q "neuralgrid-web"; then
        echo "기존 프로세스 재시작 중..."
        pm2 restart neuralgrid-web
    else
        echo "새 프로세스 시작 중..."
        cd apps/web
        pm2 start npm --name "neuralgrid-web" -- start
        cd ../..
    fi
    
    pm2 save
    echo "✅ PM2 설정 완료"
else
    echo "⚠️  PM2가 없습니다. 수동으로 실행하세요:"
    echo "   cd apps/web"
    echo "   pnpm start"
fi
echo ""

echo "=================================================="
echo "🎉 배포 완료!"
echo "=================================================="
echo ""
echo "✅ 접속 URL: http://115.91.5.140:3000"
echo ""
echo "📊 PM2 상태 확인: pm2 status"
echo "📝 로그 확인: pm2 logs neuralgrid-web"
echo ""
