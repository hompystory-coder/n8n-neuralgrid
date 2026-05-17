# 🚀 NeuronStar Music - Deployment Guide

## 📋 Current Status

✅ **Completed**:
- ✅ External 4TB HDD setup and mounted at `/mnt/music-storage`
- ✅ PostgreSQL database `neuronstar_music` created
- ✅ Prisma schema defined and migration applied
- ✅ Next.js project created at `~/n8n-neuralgrid/apps/neuronstar-music`
- ✅ Environment variables configured
- ✅ Suno API service layer implemented
- ✅ Music Manager service with Prisma integration
- ✅ API routes created (/api/music, /api/admin/generate)
- ✅ Homepage with music library and player
- ✅ Admin dashboard for music generation
- ✅ Git repository initialized and committed

🔄 **Next Steps**:
1. Copy project to mini-server
2. Install dependencies and build
3. Test functionality
4. Deploy with PM2
5. Setup Nginx reverse proxy

---

## 📦 Step 1: Copy Project to Mini-Server

**On your local machine** (where this project was created):

```bash
# Navigate to the project
cd ~/n8n-neuralgrid/apps/neuronstar-music

# Create a tarball for transfer
tar -czf /tmp/neuronstar-music.tar.gz .

# Transfer to mini-server (replace with your server IP/hostname)
scp /tmp/neuronstar-music.tar.gz azamans@115.91.5.140:~/
```

**On the mini-server**:

```bash
# Navigate to the apps directory
cd ~/n8n-neuralgrid/apps/

# Create neuronstar-music directory if it doesn't exist
mkdir -p neuronstar-music

# Extract the tarball
cd neuronstar-music
tar -xzf ~/neuronstar-music.tar.gz

# Clean up
rm ~/neuronstar-music.tar.gz
```

---

## 🔧 Step 2: Install Dependencies and Build

**On the mini-server**:

```bash
# Navigate to project directory
cd ~/n8n-neuralgrid/apps/neuronstar-music

# Install dependencies (using pnpm for consistency with neuralgrid)
pnpm install

# Generate Prisma client
npx prisma generate

# Build production bundle
pnpm build
```

**Expected output**:
- Dependencies installed successfully
- Prisma client generated
- Next.js build completed with route `/api/music` and `/api/admin/generate`

---

## ✅ Step 3: Test Functionality

### Test 1: Development Server

```bash
# Start development server
pnpm dev
```

**Expected**: Server running on `http://localhost:3002`

**Test in browser**:
1. Open `http://115.91.5.140:3002` (or your server IP)
2. Should see homepage with "NeuronStar Music" header
3. Since no music is generated yet, it will be empty

### Test 2: Admin Dashboard

1. Open `http://115.91.5.140:3002/admin`
2. Should see admin dashboard with task status (0/20 completed)
3. Enter Admin API Key: `9eZwW+qgElNVnajvVW6BEe/03Lc6qDq+1qM10hNzqJ8=`

### Test 3: API Endpoints

```bash
# Test music list API (will be empty initially)
curl http://localhost:3002/api/music

# Test task status API
curl http://localhost:3002/api/admin/generate

# Test music generation (will take 2-3 minutes)
curl -X POST http://localhost:3002/api/admin/generate \
  -H "Content-Type: application/json" \
  -H "x-api-key: 9eZwW+qgElNVnajvVW6BEe/03Lc6qDq+1qM10hNzqJ8=" \
  -d '{"genre":"pop","count":2,"downloadToHDD":true}'
```

**Expected**:
- First two API calls return success with empty/initial data
- Third API call generates 2 pop songs (takes 2-3 minutes)
- Check `/mnt/music-storage/generated-music/2025/12/pop/` for MP3 files

If tests pass, stop the dev server (Ctrl+C) and proceed to PM2 deployment.

---

## 🚀 Step 4: Deploy with PM2

### Create PM2 Ecosystem Config

```bash
cd ~/n8n-neuralgrid/apps/neuronstar-music

cat > ecosystem.config.js << 'EOF'
module.exports = {
  apps: [{
    name: 'neuronstar-music',
    script: 'node_modules/next/dist/bin/next',
    args: 'start -p 3002',
    cwd: '/home/azamans/n8n-neuralgrid/apps/neuronstar-music',
    instances: 1,
    exec_mode: 'fork',
    env: {
      NODE_ENV: 'production',
      PORT: 3002
    },
    error_file: './logs/error.log',
    out_file: './logs/out.log',
    log_date_format: 'YYYY-MM-DD HH:mm:ss',
    autorestart: true,
    max_restarts: 10,
    min_uptime: '10s',
    max_memory_restart: '1G'
  }]
};
EOF

# Create logs directory
mkdir -p logs
```

### Start with PM2

```bash
# Start the application
pm2 start ecosystem.config.js

# Save PM2 configuration
pm2 save

# Setup PM2 to start on system boot
pm2 startup

# Check status
pm2 status

# View logs
pm2 logs neuronstar-music --lines 50
```

**Expected output**:
```
┌─────┬─────────────────────┬─────────────┬─────────┬─────────┬──────────┬────────┐
│ id  │ name                │ namespace   │ version │ mode    │ pid      │ status │
├─────┼─────────────────────┼─────────────┼─────────┼─────────┼──────────┼────────┤
│ 0   │ n8n-server          │ default     │ N/A     │ fork    │ 12345    │ online │
│ 1   │ neuralgrid-web      │ default     │ N/A     │ fork    │ 12346    │ online │
│ 2   │ neuronstar-music    │ default     │ N/A     │ fork    │ 12347    │ online │
└─────┴─────────────────────┴─────────────┴─────────┴─────────┴──────────┴────────┘
```

### Verify Deployment

```bash
# Check if port 3002 is listening
sudo lsof -i :3002

# Test API
curl http://localhost:3002/api/music

# Test from browser
# Open http://115.91.5.140:3002
```

---

## 🌐 Step 5: Setup Nginx Reverse Proxy

### Create Nginx Configuration

```bash
sudo nano /etc/nginx/sites-available/music.neuralgrid.kr
```

**Paste this configuration**:

```nginx
# NeuronStar Music - Subdomain Configuration
server {
    listen 80;
    server_name music.neuralgrid.kr;

    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name music.neuralgrid.kr;

    # SSL Configuration (using existing neuralgrid.kr certificate)
    ssl_certificate /etc/letsencrypt/live/neuralgrid.kr/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/neuralgrid.kr/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Security Headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Client Body Size (for future uploads)
    client_max_body_size 100M;

    # Proxy to Next.js application
    location / {
        proxy_pass http://localhost:3002;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        # Timeouts
        proxy_connect_timeout 60s;
        proxy_send_timeout 60s;
        proxy_read_timeout 60s;
    }

    # Direct serving of music files from external HDD (optional optimization)
    location /music-files/ {
        alias /mnt/music-storage/generated-music/;
        autoindex off;
        add_header Content-Type audio/mpeg;
        add_header Cache-Control "public, max-age=31536000";
        add_header Access-Control-Allow-Origin "*";
    }

    # Logs
    access_log /var/log/nginx/music.neuralgrid.kr.access.log;
    error_log /var/log/nginx/music.neuralgrid.kr.error.log;
}
```

### Enable and Test Nginx Configuration

```bash
# Enable the site
sudo ln -sf /etc/nginx/sites-available/music.neuralgrid.kr /etc/nginx/sites-enabled/

# Test configuration
sudo nginx -t

# If test passes, reload Nginx
sudo systemctl reload nginx

# Check Nginx status
sudo systemctl status nginx
```

### Update DNS (if not already done)

Add a DNS record for `music.neuralgrid.kr`:
- **Type**: A or CNAME
- **Name**: music
- **Value**: Your server IP (115.91.5.140) or @neuralgrid.kr

**Wait for DNS propagation** (usually 5-10 minutes, up to 24 hours).

### Test SSL Certificate

If using Let's Encrypt wildcard certificate for `*.neuralgrid.kr`, it should already cover `music.neuralgrid.kr`.

If not, request a new certificate:

```bash
# Using certbot for Let's Encrypt
sudo certbot --nginx -d music.neuralgrid.kr

# Or request wildcard certificate (recommended)
sudo certbot certonly --dns-cloudflare -d *.neuralgrid.kr -d neuralgrid.kr
```

---

## 🎉 Step 6: Verify Deployment

### Access Points

1. **Homepage**: `https://music.neuralgrid.kr`
   - Should show music library (empty initially)
   - Genre filters should work
   - UI should be responsive

2. **Admin Dashboard**: `https://music.neuralgrid.kr/admin`
   - Enter API Key: `9eZwW+qgElNVnajvVW6BEe/03Lc6qDq+1qM10hNzqJ8=`
   - Should show task status (0/20)
   - Try generating 2 tracks

3. **API Endpoints**:
   ```bash
   # Get music list
   curl https://music.neuralgrid.kr/api/music
   
   # Generate music (replace API_KEY)
   curl -X POST https://music.neuralgrid.kr/api/admin/generate \
     -H "Content-Type: application/json" \
     -H "x-api-key: 9eZwW+qgElNVnajvVW6BEe/03Lc6qDq+1qM10hNzqJ8=" \
     -d '{"genre":"pop","count":2}'
   ```

### Check Logs

```bash
# PM2 logs
pm2 logs neuronstar-music --lines 100

# Nginx logs
sudo tail -f /var/log/nginx/music.neuralgrid.kr.access.log
sudo tail -f /var/log/nginx/music.neuralgrid.kr.error.log

# Database logs
sudo tail -f /var/log/postgresql/postgresql-16-main.log
```

---

## 🎵 Step 7: Generate Your First Music

1. Open `https://music.neuralgrid.kr/admin`
2. Enter Admin API Key: `9eZwW+qgElNVnajvVW6BEe/03Lc6qDq+1qM10hNzqJ8=`
3. Select settings:
   - **Genre**: Pop (or any genre)
   - **Count**: 2 (generates 1 pair)
   - **Custom Prompt**: (optional) "Create an upbeat summer pop song with catchy chorus"
   - **Options**:
     - ☑️ Download to External HDD
4. Click "🎵 Generate 2 Tracks"
5. Wait 2-3 minutes
6. Check results:
   - Success message with track count
   - Task status updated (2/20)
   - Files saved to `/mnt/music-storage/generated-music/2025/12/pop/`
7. Go to homepage `https://music.neuralgrid.kr`
8. See your generated music in the library
9. Click to play!

---

## 🔧 Maintenance Commands

### PM2 Management

```bash
# Restart service
pm2 restart neuronstar-music

# Stop service
pm2 stop neuronstar-music

# Delete service
pm2 delete neuronstar-music

# View resource usage
pm2 monit

# Clear logs
pm2 flush neuronstar-music
```

### Database Management

```bash
# Connect to database
psql -U neuralgrid -h localhost -p 5434 -d neuronstar_music

# Check music count
psql -U neuralgrid -h localhost -p 5434 -d neuronstar_music -c "SELECT COUNT(*) FROM music;"

# Check today's task
psql -U neuralgrid -h localhost -p 5434 -d neuronstar_music -c "SELECT * FROM suno_tasks ORDER BY task_date DESC LIMIT 1;"

# Backup database
pg_dump -U neuralgrid -h localhost -p 5434 neuronstar_music > /mnt/music-storage/backups/neuronstar_music_$(date +%Y%m%d).sql
```

### Storage Management

```bash
# Check disk usage
df -h /mnt/music-storage

# Count generated files
find /mnt/music-storage/generated-music -type f -name "*.mp3" | wc -l

# Check recent files
ls -lhtr /mnt/music-storage/generated-music/2025/12/*/ | tail -20

# Calculate storage used
du -sh /mnt/music-storage/generated-music
```

---

## 🐛 Troubleshooting

### Issue: Port 3002 already in use

```bash
# Find process
sudo lsof -i :3002

# Kill if necessary
sudo kill -9 <PID>

# Restart PM2
pm2 restart neuronstar-music
```

### Issue: Database connection failed

```bash
# Check PostgreSQL status
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql

# Test connection
psql -U neuralgrid -h localhost -p 5434 -d neuronstar_music -c "SELECT NOW();"
```

### Issue: External HDD not accessible

```bash
# Check mount
df -h | grep music-storage

# Remount
sudo mount /dev/sda2 /mnt/music-storage

# Check permissions
ls -la /mnt/music-storage
sudo chown -R azamans:azamans /mnt/music-storage
```

### Issue: Suno API errors

- Verify API key in `.env`
- Check Suno API service status at https://docs.sunoapi.org/
- Review error message in PM2 logs
- Try again after 2-3 minutes (rate limiting)

### Issue: Nginx 502 Bad Gateway

```bash
# Check if Next.js is running
pm2 status neuronstar-music

# Check port
sudo lsof -i :3002

# Restart services
pm2 restart neuronstar-music
sudo systemctl reload nginx
```

---

## 📊 Integration with NeuralGrid

### Add Menu Link in NeuralGrid

Edit `~/n8n-neuralgrid/apps/web/components/Navigation.tsx`:

```typescript
// Add to navigation items
{
  name: 'Music',
  href: 'https://music.neuralgrid.kr',
  icon: '🎵',
  external: true
}
```

### Shared Authentication (Future)

- Use same PostgreSQL database
- Share NextAuth configuration
- Implement JWT token verification
- Enable single sign-on (SSO)

---

## 📈 Performance Optimization

### Enable Caching

Add to Nginx config:

```nginx
# Cache static assets
location /_next/static/ {
    alias /home/azamans/n8n-neuralgrid/apps/neuronstar-music/.next/static/;
    expires 365d;
    add_header Cache-Control "public, immutable";
}
```

### Database Indexing

Already optimized with indexes on:
- `music.genre`
- `music.status`
- `music.createdAt`
- `music.sunoId` (unique)

### Connection Pooling

Update `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
  connection_limit = 10
}
```

---

## 🎯 Next Steps

1. **Test thoroughly** on mini-server
2. **Generate 20 songs** to test daily task completion
3. **Monitor performance** (CPU, RAM, disk I/O)
4. **Setup automated backups** (daily PostgreSQL dump)
5. **Implement user authentication** (future phase)
6. **Add download functionality** for users
7. **Integrate with NeuralGrid menu**

---

## 📞 Support

For issues or questions:
1. Check logs: `pm2 logs neuronstar-music`
2. Review this guide's troubleshooting section
3. Verify all environment variables in `.env`
4. Ensure external HDD is mounted properly

---

**Deployment Status**: ✅ Ready for mini-server deployment

**Last Updated**: 2025-12-08

**Version**: 1.0.0
