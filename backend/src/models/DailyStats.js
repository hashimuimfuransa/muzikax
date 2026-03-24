const mongoose = require('mongoose');

const DailyStatsSchema = new mongoose.Schema({
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: true,
    index: true
  },
  
  // Date for this统计
  date: {
    type: Date,
    required: true,
    index: true
  },
  
  // Play statistics
  plays: {
    type: Number,
    default: 0
  },
  uniqueListeners: {
    type: Number,
    default: 0
  },
  uniqueIPs: {
    type: Number,
    default: 0
  },
  
  // Engagement metrics
  likes: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  reposts: {
    type: Number,
    default: 0
  },
  playlistAdditions: {
    type: Number,
    default: 0
  },
  
  // Location breakdown
  countries: [{
    country: String,
    plays: Number,
    uniqueListeners: Number
  }],
  
  // Time-based analysis (hourly breakdown)
  hourlyPlays: [{
    hour: Number,  // 0-23
    plays: Number
  }],
  
  // Fraud detection flags
  suspiciousPlays: {
    type: Number,
    default: 0
  },
  filteredPlays: {
    type: Number,
    default: 0
  },
  
  // Calculated at timestamp
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Compound indexes for efficient queries
DailyStatsSchema.index({ trackId: 1, date: -1 });
DailyStatsSchema.index({ date: -1, plays: -1 });
DailyStatsSchema.index({ date: -1, uniqueListeners: -1 });

// Static method to get stats for date range
DailyStatsSchema.statics.getStatsForDateRange = async function(trackId, startDate, endDate) {
  return await this.aggregate([
    {
      $match: {
        trackId: new mongoose.Types.ObjectId(trackId),
        date: {
          $gte: startDate,
          $lte: endDate
        }
      }
    },
    {
      $sort: { date: -1 }
    },
    {
      $group: {
        _id: null,
        totalPlays: { $sum: '$plays' },
        totalUniqueListeners: { $sum: '$uniqueListeners' },
        totalLikes: { $sum: '$likes' },
        totalShares: { $sum: '$shares' },
        totalReposts: { $sum: '$reposts' },
        totalPlaylistAdditions: { $sum: '$playlistAdditions' },
        avgDailyPlays: { $avg: '$plays' },
        days: { $sum: 1 }
      }
    }
  ]);
};

module.exports = mongoose.model('DailyStats', DailyStatsSchema);
