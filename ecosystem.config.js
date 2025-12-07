module.exports = {
  apps: [
    {
      name: 'n8n-server',
      cwd: '/home/azamans/n8n-neuralgrid',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        N8N_PORT: '5678',
        N8N_HOST: '0.0.0.0',
        WEBHOOK_URL: 'https://n8n.neuralgrid.kr',
        DB_TYPE: 'postgresdb',
        DB_POSTGRESDB_HOST: 'localhost',
        DB_POSTGRESDB_PORT: '5434',
        DB_POSTGRESDB_DATABASE: 'n8n_neuralgrid',
        DB_POSTGRESDB_USER: 'neuralgrid',
      },
    },
    {
      name: 'neuralgrid-web',
      cwd: '/home/azamans/n8n-neuralgrid/apps/web',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '3000',
      },
    },
    {
      name: 'monitor-server',
      cwd: '/home/azamans/n8n-neuralgrid/monitor-server',
      script: 'index.js',
      env: {
        NODE_ENV: 'production',
        PORT: '3002',
      },
    },
    {
      name: 'youtube-shorts-generator',
      cwd: '/home/azamans/youtube-shorts-generator',
      script: 'pnpm',
      args: 'start',
      env: {
        NODE_ENV: 'production',
        PORT: '3001',
      },
    },
  ],
};
