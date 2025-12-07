# 🌐 neuralgrid.kr 배포 가이드

## ✅ 완료된 작업

### 1. 전문적인 랜딩 페이지 생성
- **홈페이지** (`/`): 
  - Hero 섹션
  - 6가지 주요 기능 소개
  - 3가지 가격 플랜 (Free, Pro, Enterprise)
  - 시작하는 방법 (3단계)
  - 개발자 리소스
  - 전문적인 Footer

- **API 문서 페이지** (`/api-docs`):
  - 18개 API 엔드포인트 상세 설명
  - 워크플로우 API
  - 템플릿 API
  - 결제 API
  - 관리자 API
  - 웹훅
  - 에러 코드 및 속도 제한

### 2. 반응형 디자인
- Tailwind CSS 사용
- 모바일, 태블릿, 데스크톱 최적화
- 현대적이고 깔끔한 UI/UX

### 3. Git 커밋 완료
- ✅ 모든 변경사항 커밋
- ✅ `genspark_ai_developer` 브랜치 푸시

---

## 🚀 서버 배포 방법

### 서버 접속
```bash
ssh azamans@115.91.5.140
# 비밀번호: 7009011226119
```

### 전체 배포 명령어 (한번에 실행)
```bash
cd ~/n8n-neuralgrid

# Git 충돌 해결 및 최신 코드 받기
git stash
git pull origin genspark_ai_developer
git stash drop

# 배포 스크립트 실행 (5-10분 소요)
bash SERVER_QUICK_DEPLOY.sh

# n8n 확인 및 시작
pm2 status

# n8n이 없으면 시작
if ! pm2 list | grep -q "n8n-server"; then
    npm install -g n8n
    pm2 start n8n --name n8n-server -- start -p 5678
    pm2 save
fi

# 최종 확인
pm2 logs neuralgrid-web --lines 20 --nostream
```

---

## 🌐 도메인 설정 (neuralgrid.kr → 115.91.5.140:3000)

### 옵션 1: Nginx 리버스 프록시 (권장)

#### 1. Nginx 설치
```bash
sudo apt update
sudo apt install nginx -y
```

#### 2. Nginx 설정 파일 생성
```bash
sudo nano /etc/nginx/sites-available/neuralgrid.kr
```

다음 내용 입력:
```nginx
server {
    listen 80;
    server_name neuralgrid.kr www.neuralgrid.kr;

    # Next.js 애플리케이션
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # n8n 에디터
    location /n8n/ {
        proxy_pass http://localhost:5678/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 3. 설정 활성화
```bash
sudo ln -s /etc/nginx/sites-available/neuralgrid.kr /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

#### 4. SSL 인증서 설치 (HTTPS)
```bash
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d neuralgrid.kr -d www.neuralgrid.kr
```

### 옵션 2: 포트 포워딩 (간단)

라우터 설정에서:
- 외부 포트 80 → 내부 115.91.5.140:3000
- 외부 포트 443 → 내부 115.91.5.140:3000 (HTTPS)

---

## 📋 배포 후 확인 사항

### 1. 서비스 상태 확인
```bash
# PM2 상태
pm2 status

# 예상 출력:
# ┌────┬──────────────────┬─────────┬─────────┬────────┐
# │ id │ name             │ status  │ cpu     │ memory │
# ├────┼──────────────────┼─────────┼─────────┼────────┤
# │ 0  │ neuralgrid-web   │ online  │ 0%      │ 150mb  │
# │ 1  │ n8n-server       │ online  │ 0%      │ 80mb   │
# └────┴──────────────────┴─────────┴─────────┴────────┘
```

### 2. 로그 확인
```bash
# neuralgrid-web 로그
pm2 logs neuralgrid-web --lines 30

# 정상이면 다음과 같이 표시:
# Ready in 165ms
# - Local: http://localhost:3000
```

### 3. 웹 접속 테스트
```bash
# 로컬에서 테스트
curl http://localhost:3000

# 외부에서 테스트
curl http://115.91.5.140:3000
```

### 4. 브라우저 접속
- **로컬 네트워크**: http://115.91.5.140:3000
- **도메인 (설정 후)**: http://neuralgrid.kr
- **n8n 에디터**: http://115.91.5.140:3000/n8n/
- **API 문서**: http://115.91.5.140:3000/api-docs

---

## 🔧 환경 변수 확인

배포 스크립트가 자동으로 `.env` 파일을 생성하지만, 확인이 필요한 경우:

```bash
cd ~/n8n-neuralgrid/apps/web
cat .env
```

**필수 환경 변수:**
```env
DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434"
NEXTAUTH_URL="http://neuralgrid.kr"  # 도메인으로 변경!
NEXTAUTH_SECRET="fA51L/U0OBVL0DgscgOeJJyZe4oXRA80fax0x/ybvYA="
N8N_WEBHOOK_URL="http://115.91.5.140:5678"
TOSS_SECRET_KEY="test_sk_XXX"  # 실제 키로 변경
TOSS_CLIENT_KEY="test_ck_XXX"  # 실제 키로 변경
```

**도메인 설정 후 환경 변수 업데이트:**
```bash
cd ~/n8n-neuralgrid/apps/web
nano .env
# NEXTAUTH_URL을 "http://neuralgrid.kr" 또는 "https://neuralgrid.kr"로 변경

# 변경 후 재시작
pm2 restart neuralgrid-web --update-env
```

---

## 📊 성능 최적화

### 1. PM2 클러스터 모드 (선택사항)
```bash
cd ~/n8n-neuralgrid
nano ecosystem.config.js
```

`instances: 1`을 `instances: 'max'`로 변경하여 모든 CPU 코어 활용.

### 2. Nginx 캐싱 (선택사항)
Nginx 설정에 다음 추가:
```nginx
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=my_cache:10m max_size=1g inactive=60m;
proxy_cache my_cache;
```

---

## 🆘 트러블슈팅

### 문제 1: Git Pull 실패 (로컬 변경사항 충돌)
```bash
cd ~/n8n-neuralgrid
git stash  # 로컬 변경사항 임시 저장
git pull origin genspark_ai_developer
git stash drop  # 임시 저장 삭제 (최신 코드 사용)
```

### 문제 2: PM2 프로세스가 계속 재시작
```bash
# 에러 로그 확인
pm2 logs neuralgrid-web --err --lines 50

# 일반적인 원인:
# - 데이터베이스 연결 실패
# - 환경 변수 누락
# - 포트 충돌
```

### 문제 3: n8n 연결 실패
```bash
# n8n이 실행 중인지 확인
pm2 list | grep n8n

# n8n 시작
npm install -g n8n
pm2 start n8n --name n8n-server -- start -p 5678
pm2 save

# 로그 확인
pm2 logs n8n-server
```

### 문제 4: 페이지가 로드되지 않음
```bash
# Nginx 상태 확인 (설치한 경우)
sudo systemctl status nginx
sudo nginx -t

# 방화벽 확인
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

---

## 🎉 배포 성공 확인

모든 것이 정상이면:

1. ✅ `pm2 status`에서 모든 프로세스가 **online**
2. ✅ http://115.91.5.140:3000 접속 가능
3. ✅ 랜딩 페이지가 정상 표시
4. ✅ http://115.91.5.140:3000/api-docs 접속 가능
5. ✅ http://115.91.5.140:3000/n8n/ 접속 가능
6. ✅ 도메인 (neuralgrid.kr) 접속 가능 (Nginx 설정 후)

---

## 📝 다음 단계

1. ✅ **서버 배포** ← 지금 해야 할 일!
2. ⏳ Nginx 리버스 프록시 설정
3. ⏳ SSL 인증서 설치 (HTTPS)
4. ⏳ 실제 Toss Payments 키 설정
5. ⏳ n8n API 키 설정
6. ⏳ 데이터베이스 백업 자동화
7. ⏳ 모니터링 설정 (선택)

---

## 🚀 빠른 시작 (서버에서 실행)

```bash
# 1. 서버 접속
ssh azamans@115.91.5.140

# 2. 배포 실행
cd ~/n8n-neuralgrid && \
git stash && \
git pull origin genspark_ai_developer && \
git stash drop && \
bash SERVER_QUICK_DEPLOY.sh

# 3. 확인
pm2 status
pm2 logs neuralgrid-web --lines 20 --nostream

# 4. 브라우저에서 접속
# http://115.91.5.140:3000
```

완료! 🎊
