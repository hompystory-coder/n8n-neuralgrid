const mongoose = require('mongoose');

const MusicJobSchema = new mongoose.Schema({
  jobId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  userId: {
    type: String,
    default: 'anonymous'
  },
  params: {
    prompt: String,
    style: String,
    title: String,
    instrumental: Boolean,
    model: String,
    customMode: Boolean,
    // 고급 파라미터
    personaId: String,
    personaModel: String,
    negativeTags: String,
    vocalGender: String,
    styleWeight: Number,
    weirdnessConstraint: Number,
    audioWeight: Number
  },
  status: {
    type: String,
    enum: ['queued', 'processing', 'completed', 'failed'],
    default: 'queued'
  },
  progress: {
    type: Number,
    default: 0
  },
  audioUrl: String,
  sunoTaskId: String, // Suno API taskId
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  error: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  completedAt: Date
}, {
  timestamps: true
});

// Create indexes
MusicJobSchema.index({ userId: 1, createdAt: -1 });
MusicJobSchema.index({ status: 1 });

// Check if model already exists to prevent OverwriteModelError
const MusicJob = mongoose.models.MusicJob || mongoose.model('MusicJob', MusicJobSchema);

module.exports = MusicJob;
