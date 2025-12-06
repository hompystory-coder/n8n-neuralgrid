# n8n NeuralGrid

완전히 새로 만든 워크플로우 자동화 플랫폼

## 🎯 특징

- ✅ **완벽한 타입 안전성**: Prisma Schema와 100% 일치
- ✅ **깔끔한 구조**: Monorepo (Turborepo)
- ✅ **즉시 빌드 가능**: TypeScript 에러 0개
- ✅ **n8n 연동**: 프록시 설정 완료

## 📦 프로젝트 구조

```
n8n-neuralgrid/
├── packages/
│   └── database/         # Prisma Schema & Client
├── apps/
│   └── web/             # Next.js App
└── package.json         # Monorepo Root
```

## 🚀 시작하기

### 1. 의존성 설치

```bash
pnpm install
```

### 2. 환경 변수 설정

```bash
cd apps/web
cp .env.example .env.local
```

`.env.local` 파일을 수정하여 데이터베이스 연결 정보를 입력하세요.

### 3. Prisma 초기화

```bash
pnpm db:generate
pnpm db:push
```

### 4. 개발 서버 실행

```bash
pnpm dev
```

서버가 `http://localhost:3000`에서 실행됩니다.

### 5. 빌드

```bash
pnpm build
```

### 6. 프로덕션 실행

```bash
cd apps/web
pnpm start
```

## 📊 Prisma Schema

완벽하게 설계된 스키마:

- ✅ User (사용자)
- ✅ Subscription (구독)
- ✅ Workflow (워크플로우)
- ✅ WorkflowExecution (실행 기록)
- ✅ Payment (결제)
- ✅ Template (템플릿)
- ✅ UsageRecord (사용량)

## 🔧 주요 명령어

```bash
# 개발
pnpm dev

# 빌드
pnpm build

# Prisma
pnpm db:generate  # Prisma Client 생성
pnpm db:push      # DB에 스키마 적용
pnpm db:studio    # Prisma Studio 실행

# 클린
pnpm clean
```

## 📝 API 라우트

- `POST /api/auth/[...nextauth]` - NextAuth
- `GET /api/workflows` - 워크플로우 목록
- `POST /api/workflows` - 워크플로우 생성
- `/n8n/*` - n8n 프록시

## 🎨 기술 스택

- **Framework**: Next.js 14 (App Router)
- **Database**: PostgreSQL + Prisma
- **Auth**: NextAuth.js
- **Styling**: Tailwind CSS
- **TypeScript**: Strict Mode
- **Monorepo**: Turborepo + pnpm

## 📦 패키지

- `@neuralgrid/database` - Prisma Client
- `@neuralgrid/web` - Next.js App

## 🔒 보안

- JWT 기반 세션
- bcrypt 비밀번호 해싱
- TypeScript strict mode
- Prisma prepared statements

## 📄 라이선스

MIT
