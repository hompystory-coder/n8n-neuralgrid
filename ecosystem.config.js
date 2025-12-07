module.exports = {
  apps: [{
    name: 'neuralgrid-web',
    cwd: '/home/user/webapp/apps/web',
    script: 'node_modules/.bin/next',
    args: 'start',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://neuralgrid@/n8n_neuralgrid?host=/var/run/postgresql&port=5434',
      NEXTAUTH_URL: 'http://115.91.5.140:3000',
      NEXTAUTH_SECRET: 'fA51L/U0OBVL0DgscgOeJJyZe4oXRA80fax0x/ybvYA=',
      N8N_WEBHOOK_URL: 'http://115.91.5.140:5678',
      TOSS_SECRET_KEY: 'test_sk_XXX',
      TOSS_CLIENT_KEY: 'test_ck_XXX'
    }
  }]
}
