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
    }
  }]
};
