#!/bin/bash
set -e

echo "=========================================="
echo "NeuralGrid 플랫폼 업그레이드 시작"
echo "=========================================="

# 1. 디렉토리 생성
echo "[1/12] 디렉토리 구조 생성 중..."
cd ~/n8n-neuralgrid/apps/web
mkdir -p prisma
mkdir -p app/api/auth/\[...nextauth\]
mkdir -p app/api/auth/signup
mkdir -p app/api/user/profile
mkdir -p app/api/admin/stats
mkdir -p app/auth/signin
mkdir -p app/auth/signup
mkdir -p app/mypage
mkdir -p app/admin
mkdir -p app/monitor

cd ~/n8n-neuralgrid
mkdir -p monitor-server

echo "✓ 디렉토리 생성 완료"

# 2. Prisma 스키마 생성
echo "[2/12] Prisma 스키마 생성 중..."
cat > ~/n8n-neuralgrid/apps/web/prisma/schema.prisma << 'EOF'
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id            String    @id @default(cuid())
  name          String?
  email         String    @unique
  emailVerified DateTime?
  image         String?
  password      String?
  role          Role      @default(USER)
  createdAt     DateTime  @default(now())
  updatedAt     DateTime  @updatedAt
  
  accounts      Account[]
  sessions      Session[]
  subscriptions Subscription[]
  usages        Usage[]
  auditLogs     AuditLog[]
  
  @@map("users")
}

enum Role {
  USER
  ADMIN
}

model Account {
  id                String  @id @default(cuid())
  userId            String
  type              String
  provider          String
  providerAccountId String
  refresh_token     String? @db.Text
  access_token      String? @db.Text
  expires_at        Int?
  token_type        String?
  scope             String?
  id_token          String? @db.Text
  session_state     String?

  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([provider, providerAccountId])
  @@map("accounts")
}

model Session {
  id           String   @id @default(cuid())
  sessionToken String   @unique
  userId       String
  expires      DateTime
  user         User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@map("sessions")
}

model VerificationToken {
  identifier String
  token      String   @unique
  expires    DateTime

  @@unique([identifier, token])
  @@map("verification_tokens")
}

model Subscription {
  id        String   @id @default(cuid())
  userId    String
  plan      Plan     @default(FREE)
  status    SubscriptionStatus @default(ACTIVE)
  startDate DateTime @default(now())
  endDate   DateTime?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("subscriptions")
}

enum Plan {
  FREE
  STARTER
  PROFESSIONAL
  ENTERPRISE
}

enum SubscriptionStatus {
  ACTIVE
  INACTIVE
  CANCELLED
  EXPIRED
}

model Usage {
  id              String   @id @default(cuid())
  userId          String
  workflowsCount  Int      @default(0)
  executionsCount Int      @default(0)
  aiShortsCount   Int      @default(0)
  storageUsed     Float    @default(0)
  month           String
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@unique([userId, month])
  @@map("usages")
}

model AuditLog {
  id        String   @id @default(cuid())
  userId    String
  action    String
  details   String?  @db.Text
  ipAddress String?
  createdAt DateTime @default(now())
  
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)
  
  @@map("audit_logs")
}
EOF

echo "✓ Prisma 스키마 생성 완료"

# 3. 패키지 설치
echo "[3/12] 패키지 설치 중..."
cd ~/n8n-neuralgrid/apps/web
pnpm add @types/bcryptjs @next-auth/prisma-adapter >/dev/null 2>&1
pnpm add -D prisma >/dev/null 2>&1
echo "✓ 패키지 설치 완료"

# 4. 환경변수 설정
echo "[4/12] 환경변수 설정 중..."
if ! grep -q "NEXTAUTH_SECRET" .env; then
  SECRET=$(openssl rand -base64 32)
  echo "" >> .env
  echo "NEXTAUTH_SECRET=\"$SECRET\"" >> .env
  echo "✓ NEXTAUTH_SECRET 생성 완료"
fi

# NEXTAUTH_URL 업데이트
sed -i 's|NEXTAUTH_URL="http://115.91.5.140:3000"|NEXTAUTH_URL="https://neuralgrid.kr"|g' .env
echo "✓ 환경변수 업데이트 완료"

# 5. Prisma 초기화
echo "[5/12] Prisma 초기화 중..."
pnpm prisma generate >/dev/null 2>&1
pnpm prisma db push >/dev/null 2>&1
echo "✓ Prisma 초기화 완료"

echo ""
echo "=========================================="
echo "✓ 1단계 완료!"
echo "다음 명령어를 실행하세요:"
echo "  bash ~/n8n-neuralgrid/deploy_files.sh"
echo "=========================================="
