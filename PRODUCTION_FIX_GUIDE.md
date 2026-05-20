# NeuronStar Music - Production Server Fix Guide

## Problem Identified
The admin page was showing "Unexpected token '<', "<!DOCTYPE"... is not valid JSON" error because the API route files were **completely missing** on the production server.

## Root Cause
The API files (`app/api/music/route.ts` and `app/api/admin/generate/route.ts`) and service files (`lib/services/suno.service.ts` and `lib/services/music-manager.service.ts`) were not present on the production deployment.

---

## Files Created/Fixed (Development Environment)

### 1. Service Layer
✅ **lib/services/suno.service.ts**
- Suno AI API client
- Functions: `generateMusic()`, `getGenerationStatus()`, `waitForTracks()`, `getGenrePrompt()`
- Handles music generation via Suno API

✅ **lib/services/music-manager.service.ts**
- Music management service with Prisma integration
- Database operations: `saveMusicToDB()`, `bulkSaveMusic()`
- File download: `downloadMusicFile()` - saves to `/mnt/music-storage/generated-music/YYYY/MM/genre/`
- Main orchestrator: `generateAndSaveMusic()` - generates AI music and saves to DB + HDD
- Task tracking: `getTodayTaskProgress()` - tracks daily generation limit (0/20)

### 2. API Routes
✅ **app/api/music/route.ts**
- `GET /api/music` endpoint
- Fetches music list with pagination and genre filtering
- Returns JSON with music data and pagination info

✅ **app/api/admin/generate/route.ts**
- `POST /api/admin/generate` - Generate AI music (admin only)
- `GET /api/admin/generate` - Get today's task progress (admin only)
- Requires `x-admin-key` header for authentication

### 3. Documentation
✅ **API_GUIDE.md**
- Complete API documentation
- Request/response examples
- Error codes and testing guide

✅ **deploy-to-production.sh**
- Automated deployment script
- Handles: stop PM2 → install deps → build → restart PM2

---

## Deployment Steps (Production Server)

### Option 1: Manual File Transfer (Recommended)

Execute these commands on your **production server** (`azamans@115.91.5.140`):

```bash
# Navigate to project directory
cd ~/n8n-neuralgrid/apps/neuronstar-music

# Step 1: Create directories
mkdir -p lib/services app/api/music app/api/admin/generate

# Step 2: Copy the 4 key files from development
# You need to transfer these files from /home/user/webapp/:
# - lib/services/suno.service.ts
# - lib/services/music-manager.service.ts
# - app/api/music/route.ts
# - app/api/admin/generate/route.ts

# Step 3: Run deployment script
chmod +x deploy-to-production.sh
./deploy-to-production.sh
```

### Option 2: Git-based Deployment (If Git is Configured)

```bash
# On production server
cd ~/n8n-neuralgrid/apps/neuronstar-music
git pull origin main
./deploy-to-production.sh
```

### Option 3: SCP Transfer from Development

If you want to transfer files directly:

```bash
# From development environment, run:
cd /home/user/webapp

# Create tarball of essential files
tar -czf neuronstar-api-fix.tar.gz \
  lib/services/suno.service.ts \
  lib/services/music-manager.service.ts \
  app/api/music/route.ts \
  app/api/admin/generate/route.ts \
  deploy-to-production.sh \
  API_GUIDE.md

# Transfer to production
scp neuronstar-api-fix.tar.gz azamans@115.91.5.140:~/

# Then on production server:
cd ~/n8n-neuralgrid/apps/neuronstar-music
tar -xzf ~/neuronstar-api-fix.tar.gz
./deploy-to-production.sh
```

---

## Verification Steps

After deployment, verify everything works:

### 1. Check PM2 Status
```bash
pm2 status neuronstar-music
pm2 logs neuronstar-music --lines 30
```

Expected: Process should be "online" with no errors in logs.

### 2. Test Music Listing API (No Auth)
```bash
curl "http://localhost:3002/api/music"
```

Expected: JSON response with `{"success": true, "data": [], "pagination": {...}}`

### 3. Test Task Progress API (Admin Auth)
```bash
curl "http://localhost:3002/api/admin/generate" \
  -H "x-admin-key: 9eZwW+qgElNVnajvVW6BEe/03Lc6qDq+1qM10hNzqJ8="
```

Expected: JSON response with `{"success": true, "taskProgress": {"completed": 0, "target": 20}}`

### 4. Test Music Generation API (Admin Auth)
```bash
curl -X POST "http://localhost:3002/api/admin/generate" \
  -H "x-admin-key: 9eZwW+qgElNVnajvVW6BEe/03Lc6qDq+1qM10hNzqJ8=" \
  -H "Content-Type: application/json" \
  -d '{"genre": "pop", "count": 2, "downloadToHDD": true}'
```

Expected: Music generation starts (takes 2-3 minutes), returns success with track details.

### 5. Test in Browser
- Homepage: `http://115.91.5.140:3002` or `https://music.neuralgrid.kr`
- Admin Page: `http://115.91.5.140:3002/admin` or `https://music.neuralgrid.kr/admin`

Expected: Admin page loads without JSON error, shows "Music Generation Admin" interface.

### 6. Verify File Downloads
After generating music, check external HDD:
```bash
ls -lh /mnt/music-storage/generated-music/2025/12/pop/
```

Expected: Downloaded `.mp3` files should appear.

---

## Important Notes

### Environment Variables
Ensure `.env` file on production server contains:
```bash
DATABASE_URL="postgresql://neuralgrid:QAZa1226119@localhost:5434/neuronstar_music"
SUNO_API_KEY="your_suno_api_key_here"
ADMIN_API_KEY="9eZwW+qgElNVnajvVW6BEe/03Lc6qDq+1qM10hNzqJ8="
MUSIC_STORAGE_PATH="/mnt/music-storage/generated-music"
PORT=3002
```

### Admin API Key
The admin API key is: `9eZwW+qgElNVnajvVW6BEe/03Lc6qDq+1qM10hNzqJ8=`

Use this in:
- Admin page UI (input field)
- API requests (`x-admin-key` header)

### Daily Limit
The system is configured to generate maximum **20 tracks per day**. This can be changed in `lib/services/music-manager.service.ts` by modifying the `target` value in `getTodayTaskProgress()` function.

### File Storage Path
Music files are saved to: `/mnt/music-storage/generated-music/YYYY/MM/genre/`

Example: `/mnt/music-storage/generated-music/2025/12/pop/Suno_AI_Summer_Vibes_1733644876000.mp3`

---

## Troubleshooting

### If API still returns HTML instead of JSON:
1. Verify files exist: `ls -la app/api/admin/generate/route.ts`
2. Check build output: `pnpm build` should show no errors
3. Restart PM2: `pm2 restart neuronstar-music`
4. Check logs: `pm2 logs neuronstar-music`

### If "Invalid admin API key" error:
1. Check `.env` file has correct `ADMIN_API_KEY`
2. Restart PM2 after updating `.env`: `pm2 restart neuronstar-music`

### If database connection fails:
1. Check PostgreSQL is running: `systemctl status postgresql`
2. Verify database exists: `psql -U neuralgrid -h localhost -p 5434 -l`
3. Check `.env` has correct `DATABASE_URL`

### If file download fails:
1. Check HDD is mounted: `df -h | grep music-storage`
2. Check permissions: `ls -ld /mnt/music-storage/generated-music`
3. Create directory if needed: `sudo mkdir -p /mnt/music-storage/generated-music && sudo chown -R azamans:azamans /mnt/music-storage`

---

## Git Commits Made

All fixes have been committed to the `main` branch:

1. **b3e6f49** - fix: Recreate complete API routes and services
2. **0c510f2** - docs: Add comprehensive API documentation
3. **5d067a7** - chore: Add production deployment script

---

## Next Steps After Deployment

1. ✅ Deploy files to production server
2. ✅ Run `./deploy-to-production.sh`
3. ✅ Verify API endpoints with curl commands
4. ✅ Test admin page in browser
5. ✅ Generate first 2 test tracks (genre: Pop)
6. ✅ Verify files downloaded to `/mnt/music-storage/`
7. ✅ Check homepage shows the generated music
8. ✅ Configure DNS for `music.neuralgrid.kr` (if not done)

---

## Support

If you encounter any issues, check:
1. PM2 logs: `pm2 logs neuronstar-music`
2. Nginx logs: `sudo tail -f /var/log/nginx/music.neuralgrid.kr.error.log`
3. System logs: `journalctl -u postgresql -n 50`

