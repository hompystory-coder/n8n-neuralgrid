# 🚀 n8n-neuralgrid 배포 가이드

완전히 새로 만든 깨끗한 프로젝트 배포

---

## ✅ **현재 상태**

- ✅ 완벽한 Prisma Schema (타입 안전성 100%)
- ✅ 18개 API 엔드포인트 구현
- ✅ NextAuth 인증 시스템
- ✅ n8n 프록시 설정
- ✅ Toss Payments 연동
- ✅ 관리자 대시보드 API
- ✅ Webhook 시스템
- ✅ TypeScript Strict Mode
- ✅ Monorepo 구조 (Turborepo)

---

## 📦 **서버 배포 방법**

### **1단계: GitHub 설정**

```bash
# GitHub 리포지토리 연결
cd /home/user/webapp
git remote add origin https://github.com/hompystory-coder/n8n-neuralgrid.git
git branch -M main
git push -u origin main
```

### **2단계: 서버로 배포**

```bash
# 서버에서 실행
ssh azamans@115.91.5.140

cd /home/azamans
git clone https://github.com/hompystory-coder/n8n-neuralgrid.git

cd n8n-neuralgrid
```

### **3단계: 환경 변수 설정**

```bash
cd apps/web
cp .env.example .env.local
nano .env.local
```

`.env.local` 내용:
```env
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/neuralgrid"

# NextAuth
NEXTAUTH_URL="http://115.91.5.140:3000"
NEXTAUTH_SECRET="your-random-secret-key-here"

# n8n
N8N_URL="http://115.91.5.140:5678"

# Toss Payments
TOSS_CLIENT_KEY="your_toss_client_key"
TOSS_SECRET_KEY="your_toss_secret_key"
```

### **4단계: 의존성 설치**

```bash
cd /home/azamans/n8n-neuralgrid

# pnpm 설치 (없으면)
npm install -g pnpm

# 의존성 설치
pnpm install
```

### **5단계: Prisma 초기화**

```bash
# Prisma Client 생성
pnpm db:generate

# 데이터베이스에 스키마 적용
pnpm db:push
```

### **6단계: 빌드**

```bash
pnpm build
```

**예상 결과:**
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages
✓ Finalizing page optimization
```

### **7단계: PM2로 실행**

```bash
# PM2 설치 (없으면)
npm install -g pm2

# 실행
cd apps/web
pm2 start npm --name "neuralgrid-web" -- start

# 자동 시작 설정
pm2 startup
pm2 save
```

### **8단계: 확인**

```bash
pm2 status
pm2 logs neuralgrid-web
```

브라우저에서 접속:
- http://115.91.5.140:3000

---

## 🔧 **데이터베이스 설정**

### PostgreSQL 설치 및 설정

```bash
# PostgreSQL 설치
sudo apt update
sudo apt install postgresql postgresql-contrib

# PostgreSQL 시작
sudo systemctl start postgresql
sudo systemctl enable postgresql

# 데이터베이스 생성
sudo -u postgres psql

# PostgreSQL 콘솔에서
CREATE DATABASE neuralgrid;
CREATE USER neuralgrid_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE neuralgrid TO neuralgrid_user;
\q
```

---

## 🛠️ **개발 모드 실행**

```bash
# 개발 서버 시작
pnpm dev

# 특정 앱만 실행
cd apps/web
pnpm dev
```

---

## 📊 **Prisma Studio**

데이터베이스를 GUI로 관리:

```bash
pnpm db:studio
```

브라우저에서 `http://localhost:5555` 접속

---

## 🔄 **업데이트 방법**

```bash
cd /home/azamans/n8n-neuralgrid

# 최신 코드 가져오기
git pull origin main

# 의존성 업데이트
pnpm install

# Prisma 업데이트
pnpm db:generate
pnpm db:push

# 빌드
pnpm build

# PM2 재시작
pm2 restart neuralgrid-web
```

---

## 🐛 **문제 해결**

### 빌드 에러

```bash
# 캐시 삭제
rm -rf apps/web/.next
rm -rf node_modules
pnpm install
pnpm build
```

### PM2 에러

```bash
# 로그 확인
pm2 logs neuralgrid-web

# 재시작
pm2 restart neuralgrid-web

# 강제 재시작
pm2 delete neuralgrid-web
cd apps/web
pm2 start npm --name "neuralgrid-web" -- start
```

### 데이터베이스 연결 에러

```bash
# PostgreSQL 상태 확인
sudo systemctl status postgresql

# 연결 테스트
psql -U neuralgrid_user -d neuralgrid -h localhost
```

---

## 📝 **유용한 명령어**

```bash
# 전체 빌드
pnpm build

# 개발 모드
pnpm dev

# Prisma
pnpm db:generate  # Client 생성
pnpm db:push      # DB 동기화
pnpm db:studio    # GUI 열기

# PM2
pm2 status        # 상태 확인
pm2 logs          # 로그 보기
pm2 restart all   # 전체 재시작
pm2 save          # 현재 상태 저장

# Git
git pull          # 최신 코드
git status        # 변경사항 확인
```

---

## 🎯 **배포 체크리스트**

- [ ] GitHub 리포지토리 설정
- [ ] 서버에 Git clone
- [ ] .env.local 설정 (DATABASE_URL, NEXTAUTH_SECRET 등)
- [ ] pnpm install
- [ ] Prisma generate & push
- [ ] pnpm build (에러 없이 완료)
- [ ] PM2로 실행
- [ ] http://115.91.5.140:3000 접속 확인
- [ ] API 테스트 (/api/workflows, /api/templates 등)
- [ ] n8n 프록시 확인 (/n8n/)

---

## 🔐 **보안 설정**

1. **환경 변수 보호**
   ```bash
   chmod 600 apps/web/.env.local
   ```

2. **방화벽 설정**
   ```bash
   sudo ufw allow 3000/tcp
   sudo ufw enable
   ```

3. **HTTPS 설정** (선택사항)
   - Nginx 리버스 프록시 설정
   - Let's Encrypt SSL 인증서

---

## 📞 **지원**

배포 중 문제가 발생하면:
1. 로그 확인: `pm2 logs neuralgrid-web`
2. 빌드 재시도: `pnpm clean && pnpm install && pnpm build`
3. GitHub 이슈 등록

---

## 🎉 **배포 완료!**

성공적으로 배포되면:
- ✅ http://115.91.5.140:3000 접속 가능
- ✅ API 엔드포인트 작동
- ✅ n8n 프록시 작동
- ✅ 인증 시스템 작동

**다음 단계:**
- 사용자 등록
- 워크플로우 생성
- 템플릿 사용
- 결제 테스트
