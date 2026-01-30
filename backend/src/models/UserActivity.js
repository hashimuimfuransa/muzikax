const mongoose = require('mongoose');

const userActivitySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  activityType: {
    type: String,
    enum: [
      'post_created', 'post_liked', 'post_shared', 'comment_added', 
      'comment_liked', 'circle_joined', 'challenge_participated',
      'challenge_won', 'live_room_attended', 'live_room_hosted',
      'track_uploaded', 'track_streamed', 'profile_updated'
    ],
    required: true
  },
  activityData: {
    postId: mongoose.Schema.Types.ObjectId,
    commentId: mongoose.Schema.Types.ObjectId,
    circleId: mongoose.Schema.Types.ObjectId,
    challengeId: mongoose.Schema.Types.ObjectId,
    liveRoomId: mongoose.Schema.Types.ObjectId,
    trackId: mongoose.Schema.Types.ObjectId,
    extraData: mongoose.Schema.Types.Mixed
  },
  pointsEarned: {
    type: Number,
    default: 0
  },
  xpEarned: {
    type: Number,
    default: 0
  },
  isCompleted: {
    type: Boolean,
    default: true
  },
  metadata: {
    ip: String,
    userAgent: String,
    location: {
      country: String,
      city: String,
      coordinates: {
        lat: Number,
        lng: Number
      }
    }
  }
}, {
  timestamps: true
});

// Indexes for better query performance
userActivitySchema.index({ userId: 1 });
userActivitySchema.index({ activityType: 1 });
userActivitySchema.index({ createdAt: -1 });
userActivitySchema.index({ pointsEarned: 1 });
userActivitySchema.index({ xpEarned: 1 });

module.exports = mongoose.model('UserActivity', userActivitySchema);