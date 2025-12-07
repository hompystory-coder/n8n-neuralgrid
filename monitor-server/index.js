const express = require('express');
const cors = require('cors');
const si = require('systeminformation');
const { exec } = require('child_process');
const util = require('util');
const execPromise = util.promisify(exec);

const app = express();
const PORT = 3002;

app.use(cors({
  origin: ['https://neuralgrid.kr', 'https://monitor.neuralgrid.kr'],
  credentials: true
}));

app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

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
        total: (mem.total / (1024 ** 3)).toFixed(2),
        used: (mem.used / (1024 ** 3)).toFixed(2),
        free: (mem.free / (1024 ** 3)).toFixed(2),
        usagePercent: ((mem.used / mem.total) * 100).toFixed(2)
      },
      disk: disk.map(d => ({
        fs: d.fs,
        type: d.type,
        size: (d.size / (1024 ** 3)).toFixed(2),
        used: (d.used / (1024 ** 3)).toFixed(2),
        available: (d.available / (1024 ** 3)).toFixed(2),
        usePercent: d.use.toFixed(2)
      })),
      network: network.map(n => ({
        iface: n.iface,
        rx_sec: (n.rx_sec / (1024 ** 2)).toFixed(2),
        tx_sec: (n.tx_sec / (1024 ** 2)).toFixed(2),
      })),
      os: {
        platform: osInfo.platform,
        distro: osInfo.distro,
        release: osInfo.release,
        arch: osInfo.arch,
        uptime: Math.floor(osInfo.uptime / 3600) + 'h',
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

app.get('/api/pm2-status', async (req, res) => {
  try {
    const { stdout } = await execPromise('pm2 jlist');
    const processes = JSON.parse(stdout);
    
    const formattedProcesses = processes.map(proc => ({
      name: proc.name,
      status: proc.pm2_env.status,
      uptime: Math.floor((Date.now() - proc.pm2_env.pm_uptime) / 1000 / 60),
      memory: (proc.monit.memory / (1024 ** 2)).toFixed(2),
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

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Monitor server running on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully...');
  process.exit(0);
});
