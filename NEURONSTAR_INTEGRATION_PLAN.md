# 🎵 뉴런스타뮤직 통합 계획서

## 📋 목차
1. [프로젝트 개요](#프로젝트-개요)
2. [서버 사양 및 스토리지 전략](#서버-사양-및-스토리지-전략)
3. [도메인 및 네트워크 구조](#도메인-및-네트워크-구조)
4. [NeuralGrid 통합 방안](#neuralgrid-통합-방안)
5. [단계별 이전 계획](#단계별-이전-계획)
6. [외장 HDD 설정](#외장-hdd-설정)
7. [프로젝트 구조 및 포트 할당](#프로젝트-구조-및-포트-할당)

---

## 프로젝트 개요

### 🎯 목표
- **기존**: 알파스타뮤직 (독립 프로젝트)
- **신규**: 뉴런스타뮤직 (NeuralGrid 서브 콘텐츠)
- **기능**: Suno AI API를 통한 자동 음악 생성 및 무료 다운로드

### 🏷️ 브랜딩
```
NeuronStar Music (뉴런스타뮤직)
├─ NeuralGrid의 음악 생성 서비스
├─ Suno AI 기반 자동 음악 생성
├─ 대용량 음악 라이브러리
└─ 유튜브 쇼츠/영상 BGM 제공
```

---

## 서버 사양 및 스토리지 전략

### 💻 GMKtec K12 미니PC 사양
```
CPU: AMD Ryzen 7 8845HS (8코어/16스레드)
RAM: 32GB DDR5
내장: 1TB NVMe SSD (PCIe 4.0)
외장: 2TB USB HDD (구매 완료)
네트워크: Gigabit Ethernet
OS: Ubuntu 22.04 LTS (권장)
```

**평가**: ⭐⭐⭐⭐⭐ (AI 서비스 운영에 최적)

### 💾 스토리지 전략

#### **내장 1TB NVMe SSD** (고속 작업용)
```
/ (Root)
├─ OS (Ubuntu 22.04)                    20GB
├─ /opt/applications/                    
│   ├─ neuralgrid/                      10GB (기존 프로젝트)
│   └─ neuronstar-music/                10GB (신규 프로젝트)
├─ /var/lib/postgresql/                 10GB (데이터베이스 - 메타데이터만)
├─ /var/log/                            5GB  (로그)
├─ /home/azamans/                       10GB (사용자 홈)
└─ 여유 공간                            935GB
```

#### **외장 2TB USB HDD** (대용량 저장용)
```
/mnt/music-storage/
├─ generated-music/                     1.5TB (Suno AI 생성 음악)
│   ├─ 2024/
│   │   ├─ 12/
│   │   │   ├─ pop/
│   │   │   ├─ rock/
│   │   │   └─ jazz/
│   │   └─ ...
│   └─ 2025/
├─ user-uploads/                        200GB (사용자 업로드)
├─ neuralgrid-storage/                  100GB (NeuralGrid 관련 파일)
├─ backups/                             100GB (자동 백업)
│   ├─ daily/
│   ├─ weekly/
│   └─ monthly/
└─ temp/                                100GB (임시 파일)
```

### 📂 파일명 규칙
```bash
# 음악 파일 저장 형식
/mnt/music-storage/generated-music/{YEAR}/{MONTH}/{GENRE}/{suno_id}.mp3
/mnt/music-storage/generated-music/{YEAR}/{MONTH}/{GENRE}/{suno_id}_thumb.jpg

# 예시
/mnt/music-storage/generated-music/2025/01/pop/suno_abc123.mp3
/mnt/music-storage/generated-music/2025/01/pop/suno_abc123_thumb.jpg
```

---

## 도메인 및 네트워크 구조

### 🌐 권장 도메인 구조 (서브도메인 방식)

```
https://neuralgrid.kr                   ← 메인 사이트 (포트 3000)
├─ Dashboard
├─ MyPage
├─ Admin
└─ [🎵 Music] → https://music.neuralgrid.kr

https://music.neuralgrid.kr             ← 뉴런스타뮤직 (포트 3001)
├─ 홈 (음악 라이브러리)
├─ 음악 생성 대시보드
├─ 장르별 필터
├─ 검색 및 재생
└─ 다운로드
```

### 🔧 Nginx 리버스 프록시 설정

```nginx
# /etc/nginx/sites-available/neuralgrid

# NeuralGrid 메인 사이트
server {
    listen 443 ssl http2;
    server_name neuralgrid.kr www.neuralgrid.kr;

    ssl_certificate /etc/letsencrypt/live/neuralgrid.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/neuralgrid.kr/privkey.pem;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}

# NeuronStar Music (신규)
server {
    listen 443 ssl http2;
    server_name music.neuralgrid.kr;

    ssl_certificate /etc/letsencrypt/live/music.neuralgrid.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/music.neuralgrid.kr/privkey.pem;

    # 음악 파일 직접 서빙 (외장 HDD)
    location /music-files/ {
        alias /mnt/music-storage/generated-music/;
        expires 7d;
        add_header Cache-Control "public, immutable";
        add_header Access-Control-Allow-Origin "*";
    }

    # Next.js 애플리케이션
    location / {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 큰 파일 업로드 지원
        client_max_body_size 500M;
    }
}

# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    server_name neuralgrid.kr www.neuralgrid.kr music.neuralgrid.kr;
    return 301 https://$server_name$request_uri;
}
```

### 🔐 SSL 인증서 발급
```bash
# Certbot 설치
sudo apt install certbot python3-certbot-nginx

# NeuralGrid 메인 인증서 (이미 있음)
sudo certbot --nginx -d neuralgrid.kr -d www.neuralgrid.kr

# NeuronStar Music 인증서 (신규)
sudo certbot --nginx -d music.neuralgrid.kr

# 자동 갱신 설정
sudo certbot renew --dry-run
```

---

## NeuralGrid 통합 방안

### 🔗 메뉴 통합 (Navigation)

#### **NeuralGrid 메인 사이트 수정**
```typescript
// apps/web/components/Navigation.tsx (또는 해당 레이아웃 파일)

const navigation = [
  { 
    name: 'Dashboard', 
    href: '/dashboard',
    icon: '📊'
  },
  { 
    name: 'MyPage', 
    href: '/mypage',
    icon: '👤'
  },
  { 
    name: 'Admin', 
    href: '/admin',
    icon: '⚙️',
    adminOnly: true
  },
  { 
    name: 'Music', 
    href: 'https://music.neuralgrid.kr',
    icon: '🎵',
    badge: 'NEW',
    external: true,
    description: '뉴런스타뮤직 - AI 음악 생성'
  },
]
```

#### **NeuronStar Music 사이트 헤더**
```typescript
// NeuronStar Music 프로젝트 헤더

<header>
  <div className="logo">
    <span>🎵 NeuronStar Music</span>
    <span className="subtitle">by NeuralGrid</span>
  </div>
  
  <nav>
    <a href="https://neuralgrid.kr">← Back to NeuralGrid</a>
    <a href="/library">Music Library</a>
    <a href="/generate">Generate</a>
    <a href="/mypage">MyPage</a>
  </nav>
</header>
```

### 🔄 사용자 인증 통합 (SSO)

#### **옵션 1: JWT 공유 (권장)**
```typescript
// NeuralGrid에서 JWT 발급
// NeuronStar Music에서 같은 JWT 시크릿으로 검증

// Shared JWT Secret (환경 변수)
JWT_SECRET=your-shared-secret-key

// NeuralGrid (포트 3000)
const token = jwt.sign({ userId, email }, process.env.JWT_SECRET);

// NeuronStar Music (포트 3001)
const decoded = jwt.verify(token, process.env.JWT_SECRET);
```

#### **옵션 2: OAuth 2.0 (고급)**
- NeuralGrid를 OAuth 제공자로 설정
- NeuronStar Music에서 OAuth 클라이언트로 연동

### 📊 데이터베이스 통합

#### **PostgreSQL 공유 사용**
```
PostgreSQL (localhost:5432)
├─ neuralgrid_db        ← 기존 DB
└─ neuronstar_music_db  ← 신규 DB (별도 테이블)

또는

neuralgrid_db (하나의 DB)
├─ users (공유)
├─ subscriptions (공유)
├─ ... (NeuralGrid 테이블)
├─ music (NeuronStar)
├─ music_downloads (NeuronStar)
└─ music_cart (NeuronStar)
```

**권장**: 별도 DB 사용 + users 테이블 공유

---

## 단계별 이전 계획

### 📅 Phase 1: 외장 HDD 설정 (현재 서버에서 테스트)
**기간**: 1일  
**목표**: 외장 HDD 마운트 및 테스트

```bash
# 1. 외장 HDD 연결 확인
lsblk

# 2. 포맷 (ext4)
sudo mkfs.ext4 /dev/sda1

# 3. 마운트 포인트 생성
sudo mkdir -p /mnt/music-storage

# 4. 자동 마운트 설정
sudo blkid /dev/sda1  # UUID 확인
sudo nano /etc/fstab
# 추가: UUID=xxx /mnt/music-storage ext4 defaults,nofail 0 2

# 5. 마운트 및 테스트
sudo mount -a
df -h | grep music-storage

# 6. 권한 설정
sudo chown -R azamans:azamans /mnt/music-storage
sudo chmod -R 755 /mnt/music-storage

# 7. 디렉토리 구조 생성
cd /mnt/music-storage
mkdir -p generated-music/{2024,2025}/{01..12}/{pop,rock,jazz,electronic,hiphop,classical,ambient,lofi}
mkdir -p user-uploads backups/{daily,weekly,monthly} temp
```

### 📅 Phase 2: 미니서버 OS 설치 및 기본 환경
**기간**: 1일  
**목표**: Ubuntu 설치 및 필수 패키지 설정

```bash
# 1. Ubuntu 22.04 LTS 설치 (USB 부팅)
# 2. 시스템 업데이트
sudo apt update && sudo apt upgrade -y

# 3. 필수 패키지 설치
sudo apt install -y \
  build-essential \
  git \
  curl \
  wget \
  nginx \
  postgresql \
  postgresql-contrib \
  redis-server \
  certbot \
  python3-certbot-nginx

# 4. Node.js 20.x 설치
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs

# 5. pnpm 설치
npm install -g pnpm

# 6. PM2 설치
npm install -g pm2

# 7. 외장 HDD 마운트 (Phase 1 참조)
```

### 📅 Phase 3: NeuralGrid 이전
**기간**: 1~2일  
**목표**: 기존 프로젝트 완전 이전

```bash
# 1. 프로젝트 클론
cd /opt/applications
git clone https://github.com/hompystory-coder/n8n-neuralgrid.git neuralgrid

# 2. 환경 변수 설정
cd neuralgrid
cp .env.example .env
nano .env  # DATABASE_URL 등 설정

# 3. 의존성 설치
pnpm install

# 4. PostgreSQL 데이터 이전
# 기존 서버에서 덤프
pg_dump -U postgres neuralgrid_db > neuralgrid_backup.sql

# 미니서버에서 복원
psql -U postgres -d neuralgrid_db < neuralgrid_backup.sql

# 5. 빌드 및 테스트
cd apps/web
pnpm run build

# 6. PM2로 실행
pm2 start ecosystem.config.cjs --name neuralgrid-web
pm2 save
```

### 📅 Phase 4: NeuronStar Music 프로젝트 설정
**기간**: 2~3일  
**목표**: 새 음악 프로젝트 구축 및 통합

#### **4-1. 프로젝트 초기화**
```bash
# 1. 프로젝트 생성
cd /opt/applications
mkdir neuronstar-music
cd neuronstar-music

# 2. Next.js 프로젝트 초기화
npx create-next-app@latest . --typescript --tailwind --app --no-src-dir

# 3. 기존 코드 통합
# 알파스타뮤직 백업에서 필요한 파일 복사
```

#### **4-2. 데이터베이스 설정**
```sql
-- PostgreSQL 데이터베이스 생성
CREATE DATABASE neuronstar_music_db;

-- 테이블 생성 (기존 알파스타뮤직 스키마 기반)
-- migrations/ 디렉토리의 SQL 파일 실행
psql -U postgres -d neuronstar_music_db < /path/to/migrations/*.sql
```

#### **4-3. 환경 변수**
```bash
# /opt/applications/neuronstar-music/.env

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/neuronstar_music_db

# Suno AI API
SUNO_API_KEY=8f0a7203efd6da0d23b741abbbcbc9c2

# JWT (NeuralGrid와 공유)
JWT_SECRET=your-shared-secret-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXTAUTH_URL=https://music.neuralgrid.kr

# Storage Path
MUSIC_STORAGE_PATH=/mnt/music-storage/generated-music
UPLOAD_PATH=/mnt/music-storage/user-uploads

# Server
PORT=3001
NODE_ENV=production
```

#### **4-4. PM2 설정**
```javascript
// /opt/applications/neuronstar-music/ecosystem.config.cjs

module.exports = {
  apps: [{
    name: 'neuronstar-music',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3001',
    cwd: '/opt/applications/neuronstar-music',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 3001
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss'
  }]
}
```

### 📅 Phase 5: Nginx 및 도메인 설정
**기간**: 1일  
**목표**: 리버스 프록시 및 SSL 설정

```bash
# 1. Nginx 설정 파일 생성
sudo nano /etc/nginx/sites-available/neuralgrid
# (위 Nginx 설정 참조)

# 2. 심볼릭 링크
sudo ln -s /etc/nginx/sites-available/neuralgrid /etc/nginx/sites-enabled/

# 3. 설정 테스트
sudo nginx -t

# 4. DNS 설정 (도메인 제공업체에서)
# A 레코드 추가: music.neuralgrid.kr → 미니서버 IP

# 5. SSL 인증서 발급
sudo certbot --nginx -d music.neuralgrid.kr

# 6. Nginx 재시작
sudo systemctl restart nginx
```

### 📅 Phase 6: 통합 테스트 및 최적화
**기간**: 2~3일  
**목표**: 전체 시스템 검증

```bash
# 1. 모든 서비스 시작
pm2 start all

# 2. 접속 테스트
curl https://neuralgrid.kr
curl https://music.neuralgrid.kr

# 3. Suno API 테스트
# 관리자 페이지에서 음악 생성 테스트

# 4. 파일 저장 확인
ls -lh /mnt/music-storage/generated-music/

# 5. 성능 모니터링
pm2 monit
htop
```

---

## 외장 HDD 설정

### 🔧 상세 설정 가이드

#### **1. 디스크 확인**
```bash
# 연결된 디스크 확인
lsblk
# 예상 출력:
# NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
# sda      8:0    0   1.8T  0 disk 
# └─sda1   8:1    0   1.8T  0 part 
# nvme0n1  259:0  0   953G  0 disk 
# ├─nvme0n1p1 ...
# └─nvme0n1p2 ...
```

#### **2. 파티션 생성 (필요시)**
```bash
# 파티션 테이블 확인
sudo fdisk -l /dev/sda

# 새 파티션 생성 (이미 있으면 생략)
sudo fdisk /dev/sda
# n (new partition)
# p (primary)
# 1 (partition number)
# Enter (first sector)
# Enter (last sector)
# w (write)
```

#### **3. 파일시스템 포맷**
```bash
# ext4로 포맷 (Linux 최적화)
sudo mkfs.ext4 -L MUSIC_STORAGE /dev/sda1

# 또는 exFAT (Windows 호환 필요시)
sudo apt install exfat-fuse exfat-utils
sudo mkfs.exfat -n MUSIC_STORAGE /dev/sda1
```

#### **4. UUID 확인**
```bash
sudo blkid /dev/sda1
# UUID="12345678-1234-1234-1234-123456789abc"
```

#### **5. 자동 마운트 설정**
```bash
# /etc/fstab 편집
sudo nano /etc/fstab

# 아래 줄 추가 (ext4)
UUID=12345678-1234-1234-1234-123456789abc /mnt/music-storage ext4 defaults,nofail,x-systemd.device-timeout=10 0 2

# exFAT 사용시
UUID=12345678-1234-1234-1234-123456789abc /mnt/music-storage exfat defaults,nofail,uid=1000,gid=1000 0 0
```

**fstab 옵션 설명**:
- `defaults`: 기본 옵션
- `nofail`: 디스크 연결 안 되어도 부팅 계속
- `x-systemd.device-timeout=10`: 10초 대기 후 다음 진행
- `uid=1000,gid=1000`: 소유자 설정 (exFAT)

#### **6. 마운트 및 확인**
```bash
# 마운트 포인트 생성
sudo mkdir -p /mnt/music-storage

# 마운트
sudo mount -a

# 확인
df -h | grep music-storage
# /dev/sda1       1.8T   77M  1.7T   1% /mnt/music-storage

# 속도 테스트
sudo hdparm -tT /dev/sda1
```

#### **7. 권한 설정**
```bash
# 소유자 변경
sudo chown -R azamans:azamans /mnt/music-storage

# 권한 설정
sudo chmod -R 755 /mnt/music-storage

# 확인
ls -la /mnt/music-storage
```

---

## 프로젝트 구조 및 포트 할당

### 📁 최종 디렉토리 구조

```
/opt/applications/
├─ neuralgrid/                          # NeuralGrid (포트 3000)
│   ├─ apps/
│   │   ├─ web/                        # Next.js 앱
│   │   └─ n8n/                        # n8n 워크플로우
│   ├─ packages/
│   ├─ prisma/
│   ├─ .env
│   ├─ package.json
│   └─ pnpm-workspace.yaml
│
└─ neuronstar-music/                    # NeuronStar Music (포트 3001)
    ├─ app/                             # Next.js 14 App Router
    │   ├─ (auth)/
    │   │   ├─ login/
    │   │   └─ register/
    │   ├─ library/                     # 음악 라이브러리
    │   ├─ music/[id]/                  # 음악 상세
    │   ├─ generate/                    # 음악 생성 (관리자)
    │   ├─ mypage/                      # 마이페이지
    │   ├─ api/
    │   │   ├─ auth/
    │   │   ├─ music/
    │   │   ├─ suno/                    # Suno API 통합
    │   │   └─ admin/
    │   ├─ layout.tsx
    │   └─ page.tsx
    ├─ components/
    │   ├─ MusicPlayer.tsx
    │   ├─ MusicCard.tsx
    │   └─ GenreFilter.tsx
    ├─ lib/
    │   ├─ db.ts                        # Prisma/PostgreSQL
    │   ├─ suno.ts                      # Suno API 클라이언트
    │   └─ storage.ts                   # 파일 저장 로직
    ├─ prisma/
    │   └─ schema.prisma
    ├─ public/
    ├─ .env
    ├─ ecosystem.config.cjs
    ├─ next.config.js
    └─ package.json

/mnt/music-storage/                     # 외장 HDD 2TB
├─ generated-music/                     # 1.5TB
│   ├─ 2024/
│   │   └─ 12/
│   │       ├─ pop/
│   │       │   ├─ suno_abc123.mp3
│   │       │   └─ suno_abc123_thumb.jpg
│   │       ├─ rock/
│   │       └─ ...
│   └─ 2025/
├─ user-uploads/                        # 200GB
├─ neuralgrid-storage/                  # 100GB
├─ backups/                             # 100GB
└─ temp/                                # 100GB
```

### 🔌 포트 할당

| 서비스 | 포트 | 프로토콜 | 설명 |
|--------|------|----------|------|
| **NeuralGrid Web** | 3000 | HTTP | Next.js 메인 사이트 |
| **NeuronStar Music** | 3001 | HTTP | Next.js 음악 사이트 |
| **n8n Server** | 5678 | HTTP | n8n 워크플로우 에디터 |
| **PostgreSQL** | 5432 | TCP | 데이터베이스 |
| **Redis** | 6379 | TCP | 캐시 서버 |
| **Nginx** | 80, 443 | HTTP/HTTPS | 리버스 프록시 |

### 🚀 PM2 프로세스 관리

```bash
# 현재 실행 중인 프로세스
pm2 list
┌────┬──────────────────┬──────────┬──────┬───────────┬──────────┬──────────┐
│ id │ name             │ mode     │ ↺    │ status    │ cpu      │ memory   │
├────┼──────────────────┼──────────┼──────┼───────────┼──────────┼──────────┤
│ 0  │ neuralgrid-web   │ fork     │ 0    │ online    │ 0%       │ 250mb    │
│ 1  │ neuronstar-music │ fork     │ 0    │ online    │ 0%       │ 180mb    │
│ 2  │ n8n-server       │ fork     │ 0    │ online    │ 0.3%     │ 320mb    │
└────┴──────────────────┴──────────┴──────┴───────────┴──────────┴──────────┘

# 전체 시작
pm2 start all

# 개별 재시작
pm2 restart neuralgrid-web
pm2 restart neuronstar-music

# 로그 확인
pm2 logs neuronstar-music --lines 50

# 모니터링
pm2 monit
```

---

## 📊 예상 용량 계산

### 음악 파일 크기 (Suno AI 기준)
- MP3 (128kbps): 약 3~5MB per track
- 썸네일 (JPG): 약 50~200KB per image

### 연간 생성량 예측
```
하루 20곡 × 365일 = 7,300곡/년
7,300곡 × 4MB = 29.2GB/년 (음악 파일)
7,300곡 × 100KB = 730MB/년 (썸네일)

→ 연간 약 30GB
→ 2TB HDD로 약 60년 이상 저장 가능 ✅
```

---

## ✅ 최종 체크리스트

### Phase 1: 외장 HDD 준비
- [ ] 외장 HDD 2TB 연결
- [ ] ext4 포맷
- [ ] `/mnt/music-storage` 마운트
- [ ] 자동 마운트 설정 (`/etc/fstab`)
- [ ] 디렉토리 구조 생성
- [ ] 권한 설정 완료
- [ ] 속도 테스트 (hdparm)

### Phase 2: 미니서버 설정
- [ ] Ubuntu 22.04 LTS 설치
- [ ] 시스템 업데이트
- [ ] Node.js 20.x 설치
- [ ] pnpm, PM2 설치
- [ ] PostgreSQL 설치
- [ ] Nginx 설치
- [ ] 방화벽 설정 (ufw)

### Phase 3: NeuralGrid 이전
- [ ] 프로젝트 클론
- [ ] 환경 변수 설정
- [ ] 의존성 설치
- [ ] 데이터베이스 마이그레이션
- [ ] 빌드 및 테스트
- [ ] PM2 등록
- [ ] 도메인 연결 확인

### Phase 4: NeuronStar Music 구축
- [ ] Next.js 프로젝트 초기화
- [ ] 기존 코드 통합
- [ ] 데이터베이스 스키마 생성
- [ ] Suno API 연동 테스트
- [ ] 파일 저장 로직 구현
- [ ] PM2 등록
- [ ] 빌드 및 테스트

### Phase 5: Nginx 및 SSL
- [ ] Nginx 설정 파일 작성
- [ ] DNS A 레코드 추가 (`music.neuralgrid.kr`)
- [ ] SSL 인증서 발급 (Certbot)
- [ ] HTTPS 리다이렉트 설정
- [ ] 음악 파일 서빙 테스트

### Phase 6: 통합 및 테스트
- [ ] 메뉴 통합 (Navigation)
- [ ] JWT 인증 공유
- [ ] 데이터베이스 연동
- [ ] 음악 생성 테스트
- [ ] 다운로드 테스트
- [ ] 성능 모니터링
- [ ] 백업 시스템 구축

---

## 🚀 배포 후 운영

### 일일 체크사항
```bash
# 시스템 상태
pm2 status
df -h
free -h

# 로그 확인
pm2 logs --lines 20

# 디스크 I/O
iostat -x 1
```

### 주간 체크사항
```bash
# 백업 실행
pg_dump neuralgrid_db > backup_$(date +%Y%m%d).sql
tar -czf music_backup_$(date +%Y%m%d).tar.gz /mnt/music-storage/generated-music/

# SSL 인증서 확인
sudo certbot renew --dry-run

# 시스템 업데이트
sudo apt update && sudo apt upgrade -y
```

### 월간 체크사항
```bash
# 로그 로테이션
pm2 flush

# 디스크 정리
sudo apt autoremove -y
sudo apt autoclean

# 외장 HDD 건강 체크
sudo smartctl -a /dev/sda
```

---

## 📞 지원 및 문의

**문서 버전**: 1.0  
**최종 업데이트**: 2025-12-08  
**작성자**: Claude (Genspark AI Developer)

---

**다음 단계**: Phase 1 (외장 HDD 설정) 부터 시작하시겠습니까?
