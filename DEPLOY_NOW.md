# 🚀 n8n-neuralgrid - Ready to Deploy

## 📊 Current Status

### ✅ Completed
- **GitHub Repository**: Pushed to `genspark_ai_developer` branch
- **Code Quality**: 0 TypeScript errors
- **API Endpoints**: 18 endpoints fully implemented
- **Database Schema**: Complete Prisma schema for PostgreSQL
- **Environment Config**: `.env` template ready
- **Documentation**: Comprehensive guides created

### ⚠️ Sandbox Limitation
- **Issue**: The E2B sandbox has pnpm workspace installation issues
- **Solution**: Deploy directly on your server `115.91.5.140`

## 🎯 Deploy on Server (115.91.5.140)

### Method 1: Quick One-Command Deploy

SSH into your server and run this single command:

```bash
cd ~/n8n-neuralgrid && \
export DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434" && \
pnpm install --no-frozen-lockfile && \
cd packages/database && pnpm prisma generate && pnpm prisma db push && \
cd ../../apps/web && pnpm run build && \
pm2 stop neuralgrid-web 2>/dev/null || true && \
pm2 delete neuralgrid-web 2>/dev/null || true && \
pm2 start npm --name "neuralgrid-web" -- start && \
pm2 save && \
echo "✅ Deployment complete!" && \
pm2 status && \
pm2 logs neuralgrid-web --lines 30 --nostream
```

### Method 2: Step-by-Step Deployment

#### 1. Connect to Server
```bash
ssh user@115.91.5.140
cd ~/n8n-neuralgrid
```

#### 2. Pull Latest Code
```bash
git pull origin genspark_ai_developer
```

#### 3. Install Dependencies
```bash
pnpm install --no-frozen-lockfile
```

#### 4. Setup Database
```bash
cd packages/database
export DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434"
pnpm prisma generate
pnpm prisma db push
```

#### 5. Build Application  
```bash
cd ../../apps/web
pnpm run build
```

#### 6. Start with PM2
```bash
pm2 stop neuralgrid-web 2>/dev/null || true
pm2 delete neuralgrid-web 2>/dev/null || true
pm2 start npm --name "neuralgrid-web" -- start
pm2 save
pm2 status
```

## 🌐 Access Your Application

After successful deployment, access:

- **Main App**: http://115.91.5.140:3000
- **Dashboard**: http://115.91.5.140:3000/dashboard/workflows
- **n8n Editor**: http://115.91.5.140:3000/n8n/
- **API**: http://115.91.5.140:3000/api/workflows

## 📁 Important Files in Repository

### Deployment Guides
- `SERVER_FIX_GUIDE.md` - Comprehensive troubleshooting guide
- `DEPLOY_NOW.md` - This quick start file
- `QUICK_START.md` - Original quick start guide
- `SERVER_DEPLOY_GUIDE.md` - Detailed deployment documentation

### Scripts
- `quick-deploy.sh` - Automated deployment script
- `install-and-deploy.sh` - Alternative deployment with error handling
- `ecosystem.config.js` - PM2 configuration file

### Documentation
- `API.md` - All 18 API endpoints documented
- `FINAL_DEPLOYMENT_SUMMARY.md` - Complete project summary
- `README.md` - Project overview

## 🔧 Environment Variables Required

Create/update `~/n8n-neuralgrid/apps/web/.env`:

```env
# Database (PostgreSQL on port 5434)
DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434"

# NextAuth
NEXTAUTH_URL="http://115.91.5.140:3000"
NEXTAUTH_SECRET="fA51L/U0OBVL0DgscgOeJJyZe4oXRA80fax0x/ybvYA="

# n8n Integration
N8N_WEBHOOK_URL="http://115.91.5.140:5678"
N8N_API_KEY=""

# Toss Payments
TOSS_SECRET_KEY="test_sk_XXX"
TOSS_CLIENT_KEY="test_ck_XXX"
```

## 📝 What You Already Configured

Based on conversation history, you've already:

1. ✅ PostgreSQL installed and running on port 5434
2. ✅ Created `neuralgrid` user
3. ✅ Created `n8n_neuralgrid` database
4. ✅ Configured PostgreSQL to use 'trust' authentication
5. ✅ PM2 installed and ready
6. ✅ Git repository cloned

## 🎯 Expected Results

### Successful `pnpm run build`:
```
✓ Compiled successfully
✓ Linting and checking validity of types  
✓ Collecting page data
✓ Generating static pages (12/12)
✓ Finalizing page optimization

Route (app)                              Size     First Load JS
┌ ○ /                                    ...      ...
└ ○ /dashboard/workflows                 ...      ...
```

### Successful PM2 Status:
```
┌─────┬──────────────────┬─────────┬─────────┐
│ id  │ name             │ status  │ memory  │
├─────┼──────────────────┼─────────┼─────────┤
│ 0   │ neuralgrid-web   │ online  │ 150mb   │
└─────┴──────────────────┴─────────┴─────────┘
```

### PM2 Logs Should Show:
```
Ready in 166ms
Local:        http://localhost:3000
Environment:  production
```

## 🆘 If You Encounter Issues

### Issue: pnpm not found
```bash
curl -fsSL https://get.pnpm.io/install.sh | sh -
source ~/.bashrc
pnpm --version
```

### Issue: Prisma connection error
```bash
# Test PostgreSQL connection
psql -U neuralgrid -h /var/run/postgresql -p 5434 -d n8n_neuralgrid -c "SELECT version();"

# If successful, retry prisma commands with explicit DATABASE_URL
export DATABASE_URL="postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434"
```

### Issue: PM2 says "next: not found"
```bash
# Reinstall dependencies
cd ~/n8n-neuralgrid
rm -rf node_modules apps/web/node_modules
pnpm install --no-frozen-lockfile
cd apps/web
pnpm run build
```

### Issue: Website shows error when clicking buttons
```bash
# Check PM2 logs for specific errors
pm2 logs neuralgrid-web --lines 100

# Common fixes:
# 1. Database not connected → check DATABASE_URL in .env
# 2. NextAuth error → check NEXTAUTH_SECRET in .env
# 3. API errors → check API logs in PM2
```

## 📞 Need Help?

1. Check `SERVER_FIX_GUIDE.md` for detailed troubleshooting
2. Run `pm2 logs neuralgrid-web` to see real-time errors
3. Test database: `psql -U neuralgrid -h /var/run/postgresql -p 5434 -d n8n_neuralgrid`
4. Verify build: `cd ~/n8n-neuralgrid/apps/web && pnpm run build`

## 🎉 Success Checklist

- [ ] Code pulled from `genspark_ai_developer` branch
- [ ] `pnpm install` completed successfully
- [ ] `pnpm prisma generate` generated client
- [ ] `pnpm prisma db push` created database tables
- [ ] `pnpm run build` compiled with 0 errors
- [ ] PM2 shows `neuralgrid-web` as `online`
- [ ] http://115.91.5.140:3000 loads in browser
- [ ] Dashboard accessible at http://115.91.5.140:3000/dashboard/workflows
- [ ] n8n proxy works at http://115.91.5.140:3000/n8n/

---

**Repository**: https://github.com/hompystory-coder/n8n-neuralgrid  
**Branch**: `genspark_ai_developer`  
**Last Update**: 2025-12-07

**Ready to deploy! 🚀 Execute the commands on your server `115.91.5.140`**
