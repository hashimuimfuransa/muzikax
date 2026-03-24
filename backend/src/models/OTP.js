const mongoose = require('mongoose');
const crypto = require('crypto');

const OTPSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    lowercase: true,
    trim: true
  },
  otp: {
    type: String,
    required: true
  },
  purpose: {
    type: String,
    enum: ['login', 'email-verification', 'password-reset'],
    required: true
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 } // MongoDB will auto-delete expired documents
  },
  isUsed: {
    type: Boolean,
    default: false
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  }
}, {
  timestamps: true
});

// Index for efficient queries
OTPSchema.index({ email: 1, purpose: 1, expiresAt: -1 });

/**
 * Generate a random OTP
 * @param {number} length - Length of OTP
 * @returns {string} Generated OTP
 */
OTPSchema.statics.generateOTP = function(length = 6) {
  const digits = '0123456789';
  let otp = '';
  for (let i = 0; i < length; i++) {
    otp += digits[Math.floor(Math.random() * 10)];
  }
  return otp;
};

/**
 * Create a new OTP record
 * @param {Object} options - OTP options
 * @param {string} options.email - User email
 * @param {string} options.purpose - OTP purpose
 * @param {number} options.expiresInMinutes - Expiration time in minutes
 * @returns {Promise<Object>} Created OTP
 */
OTPSchema.statics.createOTP = async function({ email, purpose, expiresInMinutes = 10 }) {
  const otp = this.generateOTP();
  const expiresAt = new Date(Date.now() + expiresInMinutes * 60 * 1000);
  
  // Delete any existing unused OTPs for this email and purpose
  await this.deleteMany({ 
    email, 
    purpose, 
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
  
  const otpRecord = await this.create({
    email,
    otp,
    purpose,
    expiresAt,
    isUsed: false,
    attempts: 0
  });
  
  return { otp, ...otpRecord.toObject() };
};

/**
 * Verify OTP
 * @param {Object} options - Verification options
 * @param {string} options.email - User email
 * @param {string} options.otp - OTP to verify
 * @param {string} options.purpose - OTP purpose
 * @returns {Promise<Object>} Verification result
 */
OTPSchema.statics.verifyOTP = async function({ email, otp, purpose }) {
  const otpRecord = await this.findOne({
    email,
    otp,
    purpose,
    isUsed: false,
    expiresAt: { $gt: new Date() }
  });
  
  if (!otpRecord) {
    return {
      valid: false,
      message: 'Invalid or expired OTP'
    };
  }
  
  if (otpRecord.attempts >= otpRecord.maxAttempts) {
    await this.deleteOne({ _id: otpRecord._id });
    return {
      valid: false,
      message: 'Maximum attempts exceeded. Please request a new OTP.'
    };
  }
  
  // Mark as used
  otpRecord.isUsed = true;
  await otpRecord.save();
  
  return {
    valid: true,
    message: 'OTP verified successfully'
  };
};

/**
 * Increment attempt counter
 * @param {string} email - User email
 * @param {string} purpose - OTP purpose
 */
OTPSchema.statics.incrementAttempts = async function(email, purpose) {
  await this.findOneAndUpdate(
    {
      email,
      purpose,
      isUsed: false,
      expiresAt: { $gt: new Date() }
    },
    {
      $inc: { attempts: 1 }
    }
  );
};

/**
 * Clean up expired OTPs
 */
OTPSchema.statics.cleanupExpired = async function() {
  const result = await this.deleteMany({
    expiresAt: { $lt: new Date() }
  });
  return result.deletedCount;
};

module.exports = mongoose.model('OTP', OTPSchema);
