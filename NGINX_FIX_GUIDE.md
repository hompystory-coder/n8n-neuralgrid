# 🔧 Nginx 설정 수정 가이드 - Next.js 앱 연결

## 🚨 문제 발견!

현재 `https://neuralgrid.kr`이 **정적 HTML 페이지**를 보여주고 있습니다.  
Next.js 앱(`localhost:3000`)으로 프록시되지 않고 있습니다!

---

## 🎯 해결 방법

### 1️⃣ 현재 Nginx 설정 확인

```bash
# 서버에서 실행
ssh azamans@115.91.5.140

# Nginx 설정 파일 확인
sudo cat /etc/nginx/sites-available/neuralgrid.kr
```

---

### 2️⃣ 올바른 Nginx 설정

아래 내용으로 `/etc/nginx/sites-available/neuralgrid.kr` 파일을 수정하세요:

```nginx
# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    listen [::]:80;
    server_name neuralgrid.kr www.neuralgrid.kr;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS - Next.js 프록시
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name neuralgrid.kr www.neuralgrid.kr;

    # SSL 인증서 (Certbot이 자동 추가)
    ssl_certificate /etc/letsencrypt/live/neuralgrid.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/neuralgrid.kr/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    # 보안 헤더
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Next.js 앱으로 프록시 (localhost:3000)
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
        proxy_read_timeout 300s;
        proxy_connect_timeout 75s;
    }

    # Next.js 정적 파일
    location /_next/static {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 로그
    access_log /var/log/nginx/neuralgrid.kr.access.log;
    error_log /var/log/nginx/neuralgrid.kr.error.log;
}
```

---

### 3️⃣ 설정 파일 수정 명령어

```bash
# 서버에서 실행 (ssh azamans@115.91.5.140)

# 1. 기존 설정 백업
sudo cp /etc/nginx/sites-available/neuralgrid.kr /etc/nginx/sites-available/neuralgrid.kr.backup

# 2. 새로운 설정 파일 생성
sudo nano /etc/nginx/sites-available/neuralgrid.kr
```

**위의 Nginx 설정 전체를 복사해서 붙여넣으세요!**

```bash
# 3. 설정 저장
# Ctrl+O (저장)
# Enter (확인)
# Ctrl+X (종료)

# 4. Nginx 설정 테스트
sudo nginx -t

# 5. Nginx 재시작
sudo systemctl reload nginx

# 6. 확인
curl -I https://neuralgrid.kr
```

---

### 4️⃣ PM2 상태 확인

Next.js 앱이 실행 중인지 확인:

```bash
pm2 status
# neuralgrid-web가 'online' 상태여야 함

pm2 logs neuralgrid-web --lines 20
# "Ready in XXXms" 메시지 확인

# 포트 3000 확인
curl http://localhost:3000
# Next.js 페이지 HTML이 출력되어야 함
```

---

### 5️⃣ 빠른 수정 스크립트

한 번에 실행하려면:

```bash
# 서버에서 실행 (ssh azamans@115.91.5.140)

cat > /tmp/neuralgrid-nginx.conf << 'EOF'
# HTTP → HTTPS 리다이렉트
server {
    listen 80;
    listen [::]:80;
    server_name neuralgrid.kr www.neuralgrid.kr;
    
    return 301 https://$server_name$request_uri;
}

# HTTPS - Next.js 프록시
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name neuralgrid.kr www.neuralgrid.kr;

    ssl_certificate /etc/letsencrypt/live/neuralgrid.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/neuralgrid.kr/privkey.pem;
    include /etc/letsencrypt/options-ssl-nginx.conf;
    ssl_dhparam /etc/letsencrypt/ssl-dhparams.pem;

    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;

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

    location /_next/static {
        proxy_pass http://localhost:3000;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    access_log /var/log/nginx/neuralgrid.kr.access.log;
    error_log /var/log/nginx/neuralgrid.kr.error.log;
}
EOF

# 백업 후 적용
sudo cp /etc/nginx/sites-available/neuralgrid.kr /etc/nginx/sites-available/neuralgrid.kr.backup
sudo cp /tmp/neuralgrid-nginx.conf /etc/nginx/sites-available/neuralgrid.kr
sudo nginx -t && sudo systemctl reload nginx

echo "✅ Nginx 설정 완료!"
```

---

## 🧪 테스트 방법

### 1. localhost:3000 직접 확인
```bash
# 서버에서 실행
curl http://localhost:3000 | head -50
```

**Next.js HTML이 출력되어야 함** (<!DOCTYPE html>, _next 등)

### 2. Nginx 프록시 확인
```bash
curl https://neuralgrid.kr | head -50
```

**위와 동일한 HTML이 출력되어야 함**

### 3. 브라우저 확인
- https://neuralgrid.kr - 모던한 랜딩 페이지 (Purple/Pink)
- https://neuralgrid.kr/api-docs - API 문서
- https://neuralgrid.kr/dashboard - 대시보드

---

## 🚨 만약 PM2가 실행 안 되고 있다면

```bash
# PM2 상태 확인
pm2 status

# neuralgrid-web가 없거나 errored 상태라면
cd ~/n8n-neuralgrid
pm2 delete neuralgrid-web
pm2 start ecosystem.config.js
pm2 save

# 로그 확인
pm2 logs neuralgrid-web --lines 30
```

---

## 📊 예상 결과

### ✅ 성공 시

```bash
# curl http://localhost:3000
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="utf-8"/>
    <title>NeuralGrid</title>
    ...
    <script src="/_next/static/..."></script>
</head>
<body class="min-h-screen bg-black text-white">
    <div id="__next">
        <div class="min-h-screen bg-black text-white">
            <nav class="fixed top-0 w-full bg-black/80...">
            ...
```

---

## 🆘 트러블슈팅

### 문제 1: "502 Bad Gateway"
```bash
# PM2 상태 확인
pm2 status
pm2 restart neuralgrid-web

# 포트 확인
sudo lsof -i :3000
```

### 문제 2: "정적 페이지 계속 보임"
```bash
# 브라우저 캐시 삭제
# Ctrl+Shift+R (강력 새로고침)

# Nginx 설정 재확인
sudo nginx -t
sudo systemctl reload nginx
```

### 문제 3: "CSS 스타일 안 먹힘"
```bash
# Next.js 재빌드
cd ~/n8n-neuralgrid/apps/web
pnpm run build
pm2 restart neuralgrid-web
```

---

**이 가이드대로 따라하시고 결과를 알려주세요!** 🚀
