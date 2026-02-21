const mongoose = require('mongoose');

const withdrawalSchema = new mongoose.Schema({
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'RWF'
  },
  mobileNumber: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'paid', 'cancelled'],
    default: 'pending'
  },
  requestDate: {
    type: Date,
    default: Date.now
  },
  approvalDate: {
    type: Date
  },
  paymentDate: {
    type: Date
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  rejectReason: {
    type: String
  },
  transactionReference: {
    type: String
  },
  notes: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
withdrawalSchema.index({ artistId: 1, status: 1 });
withdrawalSchema.index({ status: 1 });
withdrawalSchema.index({ requestDate: -1 });

module.exports = mongoose.model('Withdrawal', withdrawalSchema);
