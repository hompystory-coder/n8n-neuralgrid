const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const path = require('path');
const http = require('http');
const socketIO = require('socket.io');

// Load environment variables (override existing empty vars)
const result = dotenv.config({ path: path.join(__dirname, '../.env'), override: true });

// 환경변수가 빈 문자열인 경우 parsed 값으로 강제 설정
if (result.parsed) {
  Object.keys(result.parsed).forEach(key => {
    if (process.env[key] === '' || process.env[key] === undefined) {
      process.env[key] = result.parsed[key];
    }
  });
}

console.log('🔑 Environment check:');
console.log('  SUNO_API_KEY:', process.env.SUNO_API_KEY ? '✅ Loaded' : '❌ Missing');
console.log('  OPENAI_API_KEY:', process.env.OPENAI_API_KEY ? '✅ Loaded' : '❌ Missing');

// Import routes
const musicRoutes = require('./routes/music');
const queueRoutes = require('./routes/queue');
const statusRoutes = require('./routes/status');
const lyricsRoutes = require('./routes/lyrics');
const chartsRoutes = require('./routes/charts'); // 🔥 추가
const statsRoutes = require('./routes/stats'); // 🔥 통계 라우트 추가
const genresRoutes = require('./routes/genres'); // 🔥 장르 라우트 추가
const youtubeRoutes = require('./routes/youtube'); // 🎬 유튜브 분석 라우트 추가
const youtubeMetadataRoutes = require('./routes/youtube-metadata'); // 🎬 유튜브 메타데이터 생성 라우트 추가
const webhookRoutes = require('./routes/webhook'); // 📥 웹훅 라우트 추가
const personaRoutes = require('./routes/persona'); // 🎤 페르소나 라우트 추가
const styleRoutes = require('./routes/style'); // 🎨 스타일 기반 생성 라우트 추가
const rankerRoutes = require('./routes/ranker'); // 🎵 AI 음악 순위 추천 라우트 추가
const textOverlayRoutes = require('./routes/textOverlay'); // 🎨 텍스트 오버레이 라우트 추가

// Import services
const { initializeQueue } = require('./services/queueService');
const { connectDB } = require('./config/database');
const { clearCache } = require('./services/styleService'); // 🔥 캐시 초기화 함수 추가

// Initialize Express app
const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files (for serving generated music)
app.use('/music', express.static(path.join(__dirname, '../storage/music')));

// 📤 Serve uploaded audio files
app.use('/uploads', express.static(path.join(__dirname, 'temp/uploads')));

// 🖼️ Serve temporary image files (upscaled images)
app.use('/temp/uploads', express.static(path.join(__dirname, 'temp/uploads')));

// 🎨 Serve client static files (CSS, JS, images, etc.)
app.use(express.static(path.join(__dirname, '../client')));

// Serve frontend
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// Serve workflow page
app.get('/workflow', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/workflow.html'));
});

// Make io accessible to routes
app.set('io', io);

// Routes
app.use('/api/music', musicRoutes);
app.use('/api/music', youtubeRoutes); // 🎬 유튜브 분석 (/api/music/analyze-youtube)
app.use('/api/youtube', youtubeMetadataRoutes); // 🎬 유튜브 메타데이터 생성 (/api/youtube/generate-metadata)
app.use('/api/queue', queueRoutes);
app.use('/api/status', statusRoutes);
app.use('/api/lyrics', lyricsRoutes);
app.use('/api/charts', chartsRoutes); // 🔥 추가
app.use('/api/stats', statsRoutes); // 🔥 통계 API 추가
app.use('/api/genres', genresRoutes); // 🔥 장르 API 추가
app.use('/api/webhook', webhookRoutes); // 📥 웹훅 API 추가
app.use('/api/persona', personaRoutes); // 🎤 페르소나 API 추가
app.use('/api/style', styleRoutes); // 🎨 스타일 기반 생성 API 추가
app.use('/api/ranker', rankerRoutes); // 🎵 AI 음악 순위 추천 API 추가
app.use('/api/text-overlay', textOverlayRoutes); // 🎨 텍스트 오버레이 API 추가

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    service: 'Suno Music Generator API'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: {
      message: err.message || 'Internal Server Error',
      status: err.status || 500
    }
  });
});

// Socket.IO connection handling
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('Client disconnected:', socket.id);
  });
});

// Initialize services
const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Create storage directory first
    const fs = require('fs');
    const storageDir = path.join(__dirname, '../storage/music');
    if (!fs.existsSync(storageDir)) {
      fs.mkdirSync(storageDir, { recursive: true });
    }
    console.log('✅ Storage directory ready');
    
    // Create uploads directory
    const uploadsDir = path.join(__dirname, 'temp/uploads');
    if (!fs.existsSync(uploadsDir)) {
      fs.mkdirSync(uploadsDir, { recursive: true });
    }
    console.log('✅ Uploads directory ready');
    
    // Connect to MongoDB (optional)
    await connectDB();
    
    // 🔥 캐시 초기화 (새 장르 데이터 반영)
    clearCache();
    console.log('✅ Genre/Preset cache cleared - new data will be loaded');
    
    // Initialize queue system
    await initializeQueue(io);
    console.log('✅ Queue system initialized');
    
    // Start server
    server.listen(PORT, () => {
      console.log(`\n╔════════════════════════════════════════════╗`);
      console.log(`║  🎵 Suno Music Generator API Server      ║`);
      console.log(`╚════════════════════════════════════════════╝`);
      console.log(`\n📡 Server:    http://localhost:${PORT}`);
      console.log(`🌐 Web UI:    http://localhost:${PORT}`);
      console.log(`🔌 Socket.IO: Ready for real-time updates`);
      console.log(`\n💡 Open http://localhost:${PORT} in your browser\n`);
    });
  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

startServer();

module.exports = { app, io };
