const mongoose = require('mongoose');

const CircleSchema = new mongoose.Schema({
  name: {
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
    enum: ['fan', 'artist'],
    required: true
  },
  genre: {
    type: String
  },
  location: {
    type: String
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ownerName: {
    type: String,
    required: true
  },
  ownerAvatar: {
    type: String,
    default: ''
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  moderators: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  posts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CommunityPost'
  }],
  memberCount: {
    type: Number,
    default: 0
  },
  verified: {
    type: Boolean,
    default: false
  },
  isPublic: {
    type: Boolean,
    default: true
  },
  rules: [{
    type: String,
    maxlength: 200
  }],
  coverImage: {
    type: String
  },
  bannerImage: {
    type: String
  },
  language: {
    type: String,
    default: 'en'
  },
  tags: [{
    type: String,
    maxlength: 30
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
CircleSchema.index({ name: 1 });
CircleSchema.index({ type: 1 });
CircleSchema.index({ genre: 1 });
CircleSchema.index({ location: 1 });
CircleSchema.index({ ownerId: 1 });
CircleSchema.index({ memberCount: -1 });
CircleSchema.index({ isPublic: 1 });
CircleSchema.index({ verified: 1 });
CircleSchema.index({ tags: 1 });

module.exports = mongoose.model('Circle', CircleSchema);