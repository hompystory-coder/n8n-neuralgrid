# ⚡ Quick Start Guide - n8n-neuralgrid

## 🚀 서버 배포 (5분 완성)

### Step 1: SSH 접속
```bash
ssh azamans@115.91.5.140
```

### Step 2: 프로젝트 클론
```bash
cd /home/azamans
rm -rf n8n-neuralgrid
git clone -b genspark_ai_developer https://github.com/hompystory-coder/n8n-neuralgrid.git
cd n8n-neuralgrid
```

### Step 3: 환경변수 설정
```bash
cp apps/web/.env.example apps/web/.env
nano apps/web/.env
```

**필수 설정:**
```env
DATABASE_URL="postgresql://USER:PASSWORD@localhost:5432/n8n_neuralgrid"
NEXTAUTH_URL="http://115.91.5.140:3000"
NEXTAUTH_SECRET="change-this-secret-key"
TOSS_SECRET_KEY="your-toss-key"
N8N_WEBHOOK_URL="http://115.91.5.140:5678"
```

### Step 4: 설치 & 빌드
```bash
corepack enable && pnpm install
cd packages/database && pnpm prisma generate && pnpm prisma db push
cd ../../apps/web && pnpm run build
```

### Step 5: 실행
```bash
pm2 delete neuralgrid-web 2>/dev/null
pm2 start npm --name "neuralgrid-web" -- start
pm2 save
pm2 status
```

### Step 6: 확인
브라우저에서 접속: **http://115.91.5.140:3000**

---

## 🎯 완료!

- ✅ 0개 TypeScript 에러
- ✅ 18개 API 엔드포인트
- ✅ 즉시 배포 가능

문제 발생 시: `SERVER_DEPLOY_GUIDE.md` 참고
