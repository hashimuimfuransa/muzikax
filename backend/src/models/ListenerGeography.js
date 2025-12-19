const mongoose = require('mongoose');

const ListenerGeographySchema = new mongoose.Schema({
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: true
  },
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ListenerGeographySchema.index({ trackId: 1 });
ListenerGeographySchema.index({ creatorId: 1 });
ListenerGeographySchema.index({ country: 1 });
ListenerGeographySchema.index({ timestamp: -1 });

module.exports = mongoose.model('ListenerGeography', ListenerGeographySchema);