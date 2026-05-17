const Queue = require('bull');
const sunoClient = require('./sunoClient');
const MusicJob = require('../models/MusicJob');
const fs = require('fs').promises;
const path = require('path');

let musicQueue;
let io;

/**
 * Initialize the music generation queue
 */
async function initializeQueue(socketIO) {
  io = socketIO;
  
  // Create Bull queue (if Redis is available, it will use it; otherwise, fallback)
  try {
    musicQueue = new Queue('music-generation', {
      redis: {
        host: process.env.REDIS_HOST || 'localhost',
        port: process.env.REDIS_PORT || 6379,
        password: process.env.REDIS_PASSWORD || undefined
      }
    });

    // Queue event handlers
    musicQueue.on('completed', (job, result) => {
      console.log(`✅ Job ${job.id} completed`);
      io.emit('job:completed', { jobId: job.id, result });
    });

    musicQueue.on('failed', (job, err) => {
      console.error(`❌ Job ${job.id} failed:`, err.message);
      io.emit('job:failed', { jobId: job.id, error: err.message });
    });

    musicQueue.on('progress', (job, progress) => {
      console.log(`⏳ Job ${job.id} progress: ${progress}%`);
      io.emit('job:progress', { jobId: job.id, progress });
    });

    // Process jobs
    musicQueue.process(parseInt(process.env.MAX_CONCURRENT_JOBS) || 3, processJob);

    console.log('✅ Bull queue initialized with Redis');
  } catch (error) {
    console.warn('⚠️  Redis not available, using in-memory queue');
    musicQueue = createInMemoryQueue();
  }

  return musicQueue;
}

/**
 * Process a single music generation job
 */
async function processJob(job) {
  const { params, userId } = job.data;
  
  try {
    // Update job status
    await job.progress(10);
    io.emit('job:started', { jobId: job.id, params });

    // Generate music using Suno API
    console.log(`🎵 Generating music: ${params.title || 'Untitled'}`);
    const generateResult = await sunoClient.generateMusic(params);

    if (!generateResult.success) {
      throw new Error(generateResult.error?.message || 'Generation failed');
    }

    await job.progress(30);

    // Poll for completion using Suno API taskId
    const sunoTaskId = generateResult.taskId;
    console.log(`⏳ Waiting for task: ${sunoTaskId}`);
    
    const statusResult = await sunoClient.waitForCompletion(sunoTaskId, 600000, 10000);
    
    if (!statusResult.success || statusResult.status !== 'SUCCESS') {
      throw new Error('Generation failed or timeout');
    }

    await job.progress(90);

    // Extract audio URL from response
    const responseData = statusResult.response?.data;
    if (!responseData || responseData.length === 0) {
      throw new Error('No audio generated');
    }

    const audioUrl = responseData[0].audio_url;

    await job.progress(92);

    // Download audio file
    console.log(`📥 Downloading audio for job ${job.id}`);
    const downloadResult = await sunoClient.downloadAudio(audioUrl);

    if (!downloadResult.success) {
      throw new Error(downloadResult.error);
    }

    await job.progress(95);

    // Save to local storage
    const storageDir = path.join(__dirname, '../../storage/music');
    const filename = `${Date.now()}_${params.title?.replace(/[^a-z0-9]/gi, '_') || 'music'}.mp3`;
    const filepath = path.join(storageDir, filename);

    await fs.writeFile(filepath, downloadResult.data);
    console.log(`💾 Saved to ${filename}`);

    await job.progress(100);

    // Save to database with correct taskId
    const musicJob = new MusicJob({
      jobId: job.id,
      userId,
      params,
      status: 'completed',
      audioUrl: `/music/${filename}`,
      sunoTaskId: sunoTaskId, // Suno API taskId
      metadata: responseData[0], // 전체 메타데이터 저장
      completedAt: new Date()
    });

    await musicJob.save().catch(err => {
      console.warn('DB save failed (using memory mode):', err.message);
    });

    return {
      success: true,
      jobId: job.id,
      audioUrl: `/music/${filename}`,
      params
    };

  } catch (error) {
    console.error(`Job ${job.id} error:`, error.message);
    
    // Update database
    await MusicJob.findOneAndUpdate(
      { jobId: job.id },
      { status: 'failed', error: error.message }
    ).catch(() => {});

    throw error;
  }
}

/**
 * Add a new music generation job to the queue
 */
async function addJob(params, userId = 'anonymous') {
  try {
    const job = await musicQueue.add({
      params,
      userId,
      createdAt: new Date()
    }, {
      attempts: 3,
      backoff: {
        type: 'exponential',
        delay: 2000
      }
    });

    // Save to database
    const musicJob = new MusicJob({
      jobId: job.id,
      userId,
      params,
      status: 'queued',
      createdAt: new Date()
    });

    await musicJob.save().catch(err => {
      console.warn('DB save failed (using memory mode):', err.message);
    });

    console.log(`➕ Added job ${job.id} to queue`);

    return {
      success: true,
      jobId: job.id,
      position: await job.getPosition()
    };
  } catch (error) {
    console.error('Add job error:', error.message);
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Add multiple jobs in batch
 */
async function addBatchJobs(requestsArray, userId = 'anonymous') {
  const results = [];
  
  for (const params of requestsArray) {
    const result = await addJob(params, userId);
    results.push(result);
  }

  return results;
}

/**
 * Get job status
 */
async function getJobStatus(jobId) {
  try {
    const job = await musicQueue.getJob(jobId);
    
    if (!job) {
      return { success: false, error: 'Job not found' };
    }

    const state = await job.getState();
    const progress = job.progress();

    return {
      success: true,
      jobId: job.id,
      state,
      progress,
      data: job.data,
      result: job.returnvalue
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Get queue statistics
 */
async function getQueueStats() {
  try {
    const [waiting, active, completed, failed] = await Promise.all([
      musicQueue.getWaitingCount(),
      musicQueue.getActiveCount(),
      musicQueue.getCompletedCount(),
      musicQueue.getFailedCount()
    ]);

    return {
      success: true,
      stats: {
        waiting,
        active,
        completed,
        failed,
        total: waiting + active + completed + failed
      }
    };
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
}

/**
 * Fallback in-memory queue (when Redis is not available)
 */
function createInMemoryQueue() {
  const jobs = [];
  let isProcessing = false;

  return {
    add: async (data, options) => {
      const job = {
        id: Date.now().toString(),
        data,
        progress: () => 0,
        getState: async () => 'waiting',
        getPosition: async () => jobs.length
      };
      jobs.push(job);
      processNext();
      return job;
    },
    getJob: async (id) => jobs.find(j => j.id === id),
    getWaitingCount: async () => jobs.filter(j => j.state === 'waiting').length,
    getActiveCount: async () => jobs.filter(j => j.state === 'active').length,
    getCompletedCount: async () => jobs.filter(j => j.state === 'completed').length,
    getFailedCount: async () => jobs.filter(j => j.state === 'failed').length,
    on: () => {},
    process: (fn) => { this.processFn = fn; }
  };

  async function processNext() {
    if (isProcessing) return;
    const job = jobs.find(j => !j.state);
    if (!job) return;
    
    isProcessing = true;
    job.state = 'active';
    
    try {
      const result = await processJob(job);
      job.state = 'completed';
      job.returnvalue = result;
    } catch (error) {
      job.state = 'failed';
      job.error = error.message;
    }
    
    isProcessing = false;
    processNext();
  }
}

module.exports = {
  initializeQueue,
  addJob,
  addBatchJobs,
  getJobStatus,
  getQueueStats
};
