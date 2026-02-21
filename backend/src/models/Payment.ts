import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema({
  trackId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Track',
    required: true
  },
  buyerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  sellerId: {
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
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  momoTransactionId: {
    type: String,
    unique: true
  },
  momoReferenceId: {
    type: String
  },
  paymentMethod: {
    type: String,
    enum: ['momo', 'whatsapp'],
    default: 'momo'
  },
  buyerPhoneNumber: {
    type: String,
    required: true
  },
  sellerPhoneNumber: {
    type: String
  },
  transactionDate: {
    type: Date,
    default: Date.now
  },
  completedDate: {
    type: Date
  },
  failureReason: {
    type: String
  }
}, {
  timestamps: true
});

// Index for faster queries
paymentSchema.index({ trackId: 1, buyerId: 1 });
paymentSchema.index({ momoTransactionId: 1 });
paymentSchema.index({ status: 1 });

export default mongoose.model('Payment', paymentSchema);