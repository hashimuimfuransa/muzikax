const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  recipientId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
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
    enum: ['info', 'warning', 'error', 'success', 'track_deleted'],
    default: 'info'
  },
  read: {
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