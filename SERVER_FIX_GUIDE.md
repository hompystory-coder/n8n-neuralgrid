# Server Deployment Fix Guide

## ⚠️ Current Issues

1. **pnpm workspace installation problems** - not creating `node_modules` properly in sandbox
2. **PostgreSQL connection on port 5434** -  verified working  
3. **Environment variables** - `.env` file created correctly
4. **PM2 not running** - needs proper build first

## ✅ Solution: Execute on Server `115.91.5.140`

### Prerequisites on Server
```bash
# Verify you're on the correct server
ssh user@115.91.5.140

# Check current directory
cd ~/n8n-neuralgrid  # or your project directory
pwd
```

### Step 1: Install pnpm Correctly on Server
```bash
# Remove any broken installations
rm -rf node_modules packages/*/node_modules apps/*/node_modules
rm -f pnpm-lock.yaml

# Install pnpm properly
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc

# Verify pnpm
pnpm --version
```

### Step 2: Install Dependencies
```bash
cd ~/n8n-neuralgrid

# Install all dependencies
pnpm install --no-frozen-lockfile

# Wait for completion (may take 2-3 minutes)
```

### Step 3: Setup Database with Prisma
```bash
cd ~/n8n-neuralgrid/packages/database

# Set environment variable
export DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434"

# Generate Prisma Client
pnpm prisma generate

# Push database schema
pnpm prisma db push
```

### Step 4: Build Application
```bash
cd ~/n8n-neuralgrid/apps/web

# Build Next.js application
pnpm run build

# This should show:
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Collecting page data
# ✓ Generating static pages (12/12)
```

### Step 5: Start with PM2
```bash
cd ~/n8n-neuralgrid/apps/web

# Stop any existing process
pm2 stop neuralgrid-web 2>/dev/null || true
pm2 delete neuralgrid-web 2>/dev/null || true

# Start fresh
pm2 start npm --name "neuralgrid-web" -- start

# Save PM2 configuration
pm2 save

# Check status
pm2 status

# View logs
pm2 logs neuralgrid-web --lines 50
```

### Step 6: Verify Deployment
```bash
# Check PM2 status
pm2 status
# Should show: neuralgrid-web | online | 0 | ...

# Check logs for "Ready in XXXms"
pm2 logs neuralgrid-web --lines 20 --nostream

# Test locally on server
curl http://localhost:3000

# Access from browser
open http://115.91.5.140:3000
```

## 🌐 Access URLs

After successful deployment:

- **Main Application**: http://115.91.5.140:3000
- **Dashboard**: http://115.91.5.140:3000/dashboard/workflows  
- **n8n Proxy**: http://115.91.5.140:3000/n8n/
- **API Test**: http://115.91.5.140:3000/api/workflows

## 📝 PM2 Useful Commands

```bash
# View real-time logs
pm2 logs neuralgrid-web

# Restart application
pm2 restart neuralgrid-web

# Stop application
pm2 stop neuralgrid-web

# Delete application
pm2 delete neuralgrid-web

# View detailed status
pm2 show neuralgrid-web

# Monitor resources
pm2 monit
```

## 🔧 Troubleshooting

### If `pnpm install` fails:
```bash
# Try with force
pnpm install --force

# Or clear cache
pnpm store prune
pnpm install
```

### If Prisma connection fails:
```bash
# Test PostgreSQL connection
psql -U neuralgrid -h /var/run/postgresql -p 5434 -d n8n_neuralgrid -c "SELECT version();"

# If that works, retry:
cd ~/n8n-neuralgrid/packages/database
export DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434"
pnpm prisma db push
```

### If build fails with TypeScript errors:
```bash
# Check which files have errors
cd ~/n8n-neuralgrid/apps/web
pnpm run build 2>&1 | grep "Type error"

# The errors should already be fixed in the code
# If you see errors, report them
```

### If PM2 shows "sh: 1: next: not found":
```bash
# This means node_modules is not properly set up
cd ~/n8n-neuralgrid
rm -rf node_modules apps/web/node_modules
pnpm install --no-frozen-lockfile

cd apps/web  
pnpm run build
pm2 restart neuralgrid-web
```

## ✅ Expected Successful Output

### pnpm install:
```
dependencies:
+ @neuralgrid/database 1.0.0
+ next 14.2.33
+ react 18.2.0
...
Done in Xs
```

### pnpm prisma generate:
```
✔ Generated Prisma Client (5.22.0)
```

### pnpm run build:
```
✓ Compiled successfully
✓ Linting and checking validity of types
✓ Collecting page data
✓ Generating static pages (12/12)
✓ Finalizing page optimization
```

### pm2 status:
```
│ neuralgrid-web │ online │ 0 │ 150mb │
```

### pm2 logs:
```
Ready in 166ms
Local:        http://localhost:3000
Environment:  production
```

## 🎯 Quick All-in-One Command

If you want to run everything at once:

```bash
cd ~/n8n-neuralgrid && \
export DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434" && \
pnpm install --no-frozen-lockfile && \
cd packages/database && pnpm prisma generate && pnpm prisma db push && \
cd ../../apps/web && pnpm run build && \
pm2 stop neuralgrid-web 2>/dev/null || true && \
pm2 delete neuralgrid-web 2>/dev/null || true && \
pm2 start npm --name "neuralgrid-web" -- start && \
pm2 save && pm2 status && pm2 logs neuralgrid-web --lines 30 --nostream
```

---

## 📊 Project Status

- ✅ **Code**: 0 TypeScript errors, 18 API endpoints
- ✅ **Database**: PostgreSQL on port 5434, schema ready  
- ✅ **Environment**: `.env` configured correctly
- ⏳ **Deployment**: Waiting for successful pnpm install → build → PM2 start

**Next Step**: Execute these commands on the server `115.91.5.140` via SSH.
