const express = require('express');
const router = express.Router();
const { getJobStatus, getQueueStats } = require('../services/queueService');

/**
 * GET /api/queue/status/:jobId
 * Get status of a specific job
 */
router.get('/status/:jobId', async (req, res) => {
  try {
    const { jobId } = req.params;
    const result = await getJobStatus(jobId);

    if (!result.success) {
      return res.status(404).json({ error: result.error });
    }

    res.json({
      success: true,
      job: {
        jobId: result.jobId,
        state: result.state,
        progress: result.progress,
        data: result.data,
        result: result.result
      }
    });

  } catch (error) {
    console.error('Queue status error:', error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * GET /api/queue/stats
 * Get overall queue statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const result = await getQueueStats();

    if (!result.success) {
      return res.status(500).json({ error: result.error });
    }

    res.json({
      success: true,
      stats: result.stats
    });

  } catch (error) {
    console.error('Queue stats error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
