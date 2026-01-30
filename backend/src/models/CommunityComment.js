const mongoose = require('mongoose');

const CommunityCommentSchema = new mongoose.Schema({
  postId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost',
    required: true
  },
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
  text: {
    type: String,
    required: true,
    maxlength: 1000
  },
  likes: {
    type: Number,
    default: 0
  },
  replies: {
    type: Number,
    default: 0
  },
  likedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  parentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityComment'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  language: {
    type: String,
    default: 'en'
  },
  isReported: {
    type: Boolean,
    default: false
  },
  reportedBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  reportedReason: {
    type: String
  }
}, {
  timestamps: true
});

// Indexes for better query performance
CommunityCommentSchema.index({ postId: 1 });
CommunityCommentSchema.index({ userId: 1 });
CommunityCommentSchema.index({ parentId: 1 });
CommunityCommentSchema.index({ createdAt: -1 }); // For sorting by newest
CommunityCommentSchema.index({ isReported: 1 });

module.exports = mongoose.model('CommunityComment', CommunityCommentSchema);