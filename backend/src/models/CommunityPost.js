const mongoose = require('mongoose');

const CommunityPostSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  userName: {
    type: String,
    required: true
  },
  userAvatar: {
    type: String,
    default: ''
  },
  userRole: {
    type: String,
    default: 'User'
  },
  circleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Circle'
  },
  circleName: {
    type: String
  },
  postType: {
    type: String,
    enum: ['text', 'image', 'video', 'audio'],
    default: 'text',
    required: true
  },
  content: {
    type: String,
    required: true,
    maxlength: 2000
  },
  mediaUrl: {
    type: String
  },
  mediaThumbnail: {
    type: String
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: {
    type: Number,
    default: 0
  },
  shares: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  sharedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  viewedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  isPinned: {
    type: Boolean,
    default: false
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en'
  },
  location: {
    type: String
  },
  genre: {
    type: String
  },
  tags: [{
    type: String,
    maxlength: 30
  }],
  relatedTrackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track'
  },
  relatedArtistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  challengeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Challenge'
  },
  pollOptions: [{
    option: String,
    votes: {
      type: Number,
      default: 0
    },
    voters: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }],
  pollEndsAt: {
    type: Date
  }
}, {
  timestamps: true
});

// Indexes for better query performance
CommunityPostSchema.index({ createdAt: -1 }); // For sorting by newest
CommunityPostSchema.index({ userId: 1 });
CommunityPostSchema.index({ circleId: 1 });
CommunityPostSchema.index({ postType: 1 });
CommunityPostSchema.index({ language: 1 });
CommunityPostSchema.index({ location: 1 });
CommunityPostSchema.index({ genre: 1 });
CommunityPostSchema.index({ tags: 1 });

module.exports = mongoose.model('CommunityPost', CommunityPostSchema);