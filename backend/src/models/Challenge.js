const mongoose = require('mongoose');

const challengeSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    maxlength: 100,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 500,
    trim: true
  },
  type: {
    type: String,
    enum: ['music', 'dance', 'cover', 'remix', 'other'],
    required: true
  },
  theme: {
    type: String,
    maxlength: 100
  },
  genre: {
    type: String
  },
  startDate: {
    type: Date,
    required: true
  },
  endDate: {
    type: Date,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  maxParticipants: {
    type: Number,
    default: 0 // 0 means unlimited
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    submission: {
      type: String, // URL to submission
      required: true
    },
    submittedAt: {
      type: Date,
      default: Date.now
    },
    votes: {
      type: Number,
      default: 0
    },
    votedBy: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  winner: {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    prize: String,
    announcementDate: Date
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdByName: {
    type: String,
    required: true
  },
  tags: [{
    type: String,
    maxlength: 30
  }],
  language: {
    type: String,
    default: 'en'
  },
  prize: {
    type: String,
    maxlength: 200
  },
  rules: [{
    type: String,
    maxlength: 500
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
challengeSchema.index({ startDate: 1 });
challengeSchema.index({ endDate: 1 });
challengeSchema.index({ isActive: 1 });
challengeSchema.index({ createdBy: 1 });
challengeSchema.index({ type: 1 });
challengeSchema.index({ genre: 1 });
challengeSchema.index({ tags: 1 });

module.exports = mongoose.model('Challenge', challengeSchema);