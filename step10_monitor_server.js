// Save this as: ~/n8n-neuralgrid/monitor-server/index.js
// This is a standalone Express server for real-time server monitoring

const express = require('express');
const cors = require('cors');
const si = require('systeminformation');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
const PORT = 3002;

// CORS configuration
app.use(cors({
  origin: ['https://neuralgrid.kr', 'https://monitor.neuralgrid.kr'],
  credentials: true
}));

app.use(express.json());

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Get system metrics
app.get('/api/metrics', async (req, res) => {
  try {
    const [cpu, mem, disk, network, osInfo, load] = await Promise.all([
      si.currentLoad(),
      si.mem(),
      si.fsSize(),
      si.networkStats(),
      si.osInfo(),
      si.currentLoad(),
    ]);

    const metrics = {
      timestamp: new Date().toISOString(),
      cpu: {
        usage: cpu.currentLoad.toFixed(2),
        cores: cpu.cpus.length,
        details: cpu.cpus.map(core => ({
          load: core.load.toFixed(2)
        }))
      },
      memory: {
        total: (mem.total / (1024 ** 3)).toFixed(2), // GB
        used: (mem.used / (1024 ** 3)).toFixed(2), // GB
        free: (mem.free / (1024 ** 3)).toFixed(2), // GB
        usagePercent: ((mem.used / mem.total) * 100).toFixed(2)
      },
      disk: disk.map(d => ({
        fs: d.fs,
        type: d.type,
        size: (d.size / (1024 ** 3)).toFixed(2), // GB
        used: (d.used / (1024 ** 3)).toFixed(2), // GB
        available: (d.available / (1024 ** 3)).toFixed(2), // GB
        usePercent: d.use.toFixed(2)
      })),
      network: network.map(n => ({
        iface: n.iface,
        rx_sec: (n.rx_sec / (1024 ** 2)).toFixed(2), // MB/s
        tx_sec: (n.tx_sec / (1024 ** 2)).toFixed(2), // MB/s
      })),
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        uptime: Math.floor(osInfo.uptime / 3600) + 'h', // hours
      },
      load: {
        current: load.currentLoad.toFixed(2),
        avg1: load.avgLoad.toFixed(2),
      }
    };

    res.json(metrics);
  } catch (error) {
    console.error('Metrics error:', error);
    res.status(500).json({ error: 'Failed to fetch metrics' });
  }
});

// Get PM2 status
app.get('/api/pm2-status', async (req, res) => {
  try {
    const { stdout } = await execPromise('pm2 jlist');
    const processes = JSON.parse(stdout);
    
    const formattedProcesses = processes.map(proc => ({
      name: proc.name,
      status: proc.pm2_env.status,
      uptime: Math.floor((Date.now() - proc.pm2_env.pm_uptime) / 1000 / 60), // minutes
      memory: (proc.monit.memory / (1024 ** 2)).toFixed(2), // MB
      cpu: proc.monit.cpu,
      restarts: proc.pm2_env.restart_time,
    }));

    res.json({
      processes: formattedProcesses,
      total: processes.length,
      online: processes.filter(p => p.pm2_env.status === 'online').length,
    });
  } catch (error) {
    console.error('PM2 status error:', error);
    res.status(500).json({ error: 'Failed to fetch PM2 status' });
  }
});

// Get Nginx logs (last 100 lines)
app.get('/api/nginx-logs', async (req, res) => {
  try {
    const { stdout: accessLogs } = await execPromise('sudo tail -n 50 /var/log/nginx/neuralgrid.kr.access.log');
    const { stdout: errorLogs } = await execPromise('sudo tail -n 50 /var/log/nginx/neuralgrid.kr.error.log');

    res.json({
      access: accessLogs.split('\n').filter(line => line),
      errors: errorLogs.split('\n').filter(line => line),
    });
  } catch (error) {
    console.error('Nginx logs error:', error);
    res.status(500).json({ error: 'Failed to fetch Nginx logs' });
  }
});

// Get database status
app.get('/api/database-status', async (req, res) => {
  try {
    const { stdout } = await execPromise('sudo -u postgres psql -p 5434 -c "SELECT count(*) FROM pg_stat_activity;" n8n_neuralgrid');
    
    res.json({
      status: 'connected',
      connections: stdout,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Database status error:', error);
    res.json({
      status: 'error',
      message: error.message
    });
  }
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Monitor server running on port ${PORT}`);
  console.log(`Endpoints available:`);
  console.log(`  - GET /health`);
  console.log(`  - GET /api/metrics`);
  console.log(`  - GET /api/pm2-status`);
  console.log(`  - GET /api/nginx-logs`);
  console.log(`  - GET /api/database-status`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
