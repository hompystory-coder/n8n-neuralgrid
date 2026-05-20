const express = require('express');
const router = express.Router();
const sunoClient = require('../services/sunoClient');
const os = require('os');

/**
 * GET /api/status/health
 * Server health check
 */
router.get('/health', (req, res) => {
  res.json({
    success: true,
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024) + ' MB',
      total: Math.round(os.totalmem() / 1024 / 1024) + ' MB'
    }
  });
});

/**
 * GET /api/status/suno
 * Check Suno API connection and account info
 */
router.get('/suno', async (req, res) => {
  try {
    const result = await sunoClient.getCredits();

    if (!result.success) {
      return res.status(500).json({
        success: false,
        error: 'Suno API connection failed',
        details: result.error
      });
    }

    res.json({
      success: true,
      suno: {
        connected: true,
        credits: result.credits
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

module.exports = router;
