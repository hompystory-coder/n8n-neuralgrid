# 🚀 빠른 배포 가이드

## 로컬 테스트

```bash
cd /home/user/webapp/suno-music-generator

# 간편 시작
./start.sh

# 또는 수동 시작
npm install
npm start
```

서버 실행 후: http://localhost:5000

---

## PM2로 프로덕션 배포

### 1. PM2 설치
```bash
npm install -g pm2
```

### 2. 애플리케이션 시작
```bash
cd /home/user/webapp/suno-music-generator

# 프로덕션 모드로 시작
pm2 start server/index.js --name "suno-music-api" --time

# 환경 변수 설정
pm2 start server/index.js --name "suno-music-api" \
  --env production \
  --time \
  --max-memory-restart 500M
```

### 3. 자동 시작 설정
```bash
# 시스템 부팅 시 자동 시작
pm2 startup
pm2 save
```

### 4. 모니터링
```bash
# 상태 확인
pm2 status

# 로그 보기
pm2 logs suno-music-api

# 실시간 모니터링
pm2 monit

# 재시작
pm2 restart suno-music-api

# 중지
pm2 stop suno-music-api

# 삭제
pm2 delete suno-music-api
```

---

## Nginx 리버스 프록시 설정

### /etc/nginx/sites-available/suno-music

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Static files
    location / {
        root /home/user/webapp/suno-music-generator/client;
        try_files $uri $uri/ /index.html;
    }

    # API proxy
    location /api/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Socket.IO proxy
    location /socket.io/ {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "Upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Music files
    location /music/ {
        alias /home/user/webapp/suno-music-generator/storage/music/;
        expires 30d;
        add_header Cache-Control "public, immutable";
    }
}
```

### 활성화
```bash
sudo ln -s /etc/nginx/sites-available/suno-music /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

---

## 환경 변수 (프로덕션)

### .env 파일
```env
# Suno API (필수)
SUNO_API_KEY=your_production_api_key
SUNO_API_BASE_URL=https://api.suno.ai/v1

# Server
PORT=5000
NODE_ENV=production

# MongoDB
MONGODB_URI=mongodb://localhost:27017/suno-music-production

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=your_redis_password

# Performance
MAX_CONCURRENT_JOBS=10
MAX_REQUESTS_PER_HOUR=500
```

---

## Docker 배포 (예정)

### Dockerfile
```dockerfile
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

RUN mkdir -p storage/music

EXPOSE 5000

CMD ["node", "server/index.js"]
```

### docker-compose.yml
```yaml
version: '3.8'

services:
  app:
    build: .
    ports:
      - "5000:5000"
    environment:
      - NODE_ENV=production
    env_file:
      - .env
    volumes:
      - ./storage:/app/storage
    depends_on:
      - redis
      - mongodb
    restart: unless-stopped

  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    restart: unless-stopped

  mongodb:
    image: mongo:6
    ports:
      - "27017:27017"
    volumes:
      - mongo-data:/data/db
    restart: unless-stopped

volumes:
  redis-data:
  mongo-data:
```

### 실행
```bash
docker-compose up -d
docker-compose logs -f
```

---

## 보안 체크리스트

- [ ] `.env` 파일을 `.gitignore`에 추가
- [ ] Suno API Key를 안전하게 관리
- [ ] CORS를 특정 도메인으로 제한
- [ ] Rate limiting 설정
- [ ] HTTPS 설정 (Let's Encrypt)
- [ ] 방화벽 설정 (포트 5000 보호)
- [ ] 사용자 인증 시스템 추가 (프로덕션)

---

## 모니터링

### 로그 확인
```bash
# PM2 로그
pm2 logs suno-music-api --lines 100

# 특정 시간대 로그
pm2 logs suno-music-api --timestamp

# 에러만 보기
pm2 logs suno-music-api --err
```

### 성능 모니터링
```bash
# 실시간 모니터링
pm2 monit

# 메모리/CPU 사용량
pm2 status

# 상세 정보
pm2 show suno-music-api
```

### 헬스 체크
```bash
# API 헬스 체크
curl http://localhost:5000/api/health

# Suno API 연결 확인
curl http://localhost:5000/api/status/suno

# 큐 상태 확인
curl http://localhost:5000/api/queue/stats
```

---

## 백업

### 데이터 백업
```bash
# MongoDB 백업
mongodump --db suno-music-production --out /backup/mongodb/

# Redis 백업
redis-cli SAVE
cp /var/lib/redis/dump.rdb /backup/redis/

# 음악 파일 백업
tar -czf music-backup-$(date +%Y%m%d).tar.gz storage/music/
```

### 복원
```bash
# MongoDB 복원
mongorestore --db suno-music-production /backup/mongodb/suno-music-production/

# Redis 복원
cp /backup/redis/dump.rdb /var/lib/redis/
systemctl restart redis

# 음악 파일 복원
tar -xzf music-backup-20260421.tar.gz
```

---

## 문제 해결

### 서버가 시작되지 않음
```bash
# 포트 충돌 확인
lsof -i :5000
netstat -tlnp | grep 5000

# 로그 확인
pm2 logs suno-music-api --err --lines 50
```

### 메모리 부족
```bash
# 메모리 사용량 확인
pm2 status

# 메모리 제한 설정
pm2 start server/index.js --max-memory-restart 500M

# 재시작
pm2 restart suno-music-api
```

### Redis 연결 실패
```bash
# Redis 상태 확인
systemctl status redis
redis-cli ping

# Redis 시작
systemctl start redis

# 연결 테스트
redis-cli
> PING
> EXIT
```

---

## 성능 튜닝

### Node.js 최적화
```bash
# 더 많은 메모리 할당
node --max-old-space-size=4096 server/index.js

# PM2에서 설정
pm2 start server/index.js \
  --name "suno-music-api" \
  --node-args="--max-old-space-size=4096"
```

### 동시 작업 조정
```env
# .env
MAX_CONCURRENT_JOBS=10  # CPU 코어 수에 맞게 조정
```

### Redis 최적화
```bash
# redis.conf
maxmemory 2gb
maxmemory-policy allkeys-lru
```

---

## 업데이트

```bash
# 코드 업데이트
cd /home/user/webapp/suno-music-generator
git pull

# 의존성 업데이트
npm install

# PM2 재시작 (무중단)
pm2 reload suno-music-api

# 또는 완전 재시작
pm2 restart suno-music-api
```

---

**배포 완료 후 테스트:**

1. ✅ http://your-domain.com 접속 확인
2. ✅ 음악 생성 테스트
3. ✅ WebSocket 실시간 업데이트 확인
4. ✅ 다운로드 기능 테스트
5. ✅ 대량 생성 테스트
