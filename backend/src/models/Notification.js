const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  title: {
    type: String,
    required: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['info', 'warning', 'error', 'success', 'track_deleted', 'reply', 'new_track', 'playlist_recommendation'],
    default: 'info'
  },
  read: {
    type: Boolean,
    default: false
  },
  pushSent: {
    type: Boolean,
    default: false
  },
  pushDelivered: {
    type: Boolean,
    default: false
  },
  data: {
    type: Object
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('Notification', notificationSchema);