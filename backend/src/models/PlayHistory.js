const mongoose = require('mongoose');

const PlayHistorySchema = new mongoose.Schema({
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false // Can be anonymous
  },
  ipAddress: {
    type: String,
    required: true
  },
  userAgent: {
    type: String,
    required: false
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  // Monthly aggregation fields for performance
  year: {
    type: Number,
    required: true
  },
  month: {
    type: Number,
    required: true,
    min: 1,
    max: 12
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PlayHistorySchema.index({ trackId: 1 });
PlayHistorySchema.index({ userId: 1 });
PlayHistorySchema.index({ year: 1, month: 1 });
PlayHistorySchema.index({ timestamp: -1 });
PlayHistorySchema.index({ trackId: 1, year: 1, month: 1 }); // For monthly play counts

module.exports = mongoose.model('PlayHistory', PlayHistorySchema);