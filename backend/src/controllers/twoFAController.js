const OTP = require('../models/OTP');
const User = require('../models/User');
const { sendOTPEmail } = require('../services/emailService');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const bcrypt = require('bcryptjs');

/**
 * Request OTP for login
 * POST /api/auth/2fa/request
 */
const requestOTP = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Find user
    const user = await User.findOne({ email }).select('+twoFactorSecret');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is an artist or admin (both require 2FA)
    if ((user.role !== 'creator' || user.creatorType !== 'artist') && user.role !== 'admin') {
      return res.status(403).json({ 
        message: '2FA is only required for artist and admin accounts',
        requires2FA: false
      });
    }

    // Generate and save OTP
    const otpRecord = await OTP.createOTP({
      email: user.email,
      purpose: 'login',
      expiresInMinutes: 10
    });

    // Send OTP via email
    const emailResult = await sendOTPEmail(user.email, otpRecord.otp, user.name);

    if (!emailResult.success) {
      console.error('❌ Failed to send OTP email:', emailResult);
      return res.status(500).json({ 
        message: 'Failed to send verification code. Please try again.',
        error: emailResult.error,
        details: emailResult.details,
        statusCode: emailResult.statusCode
      });
    }

    console.log('✅ OTP email sent successfully');

    res.json({
      message: 'Verification code sent to your email',
      email: user.email,
      requires2FA: true,
      expiresInSeconds: 600 // 10 minutes
    });
  } catch (error) {
    console.error('Error requesting OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Verify OTP and complete login
 * POST /api/auth/2fa/verify
 */
const verifyOTPAndLogin = async (req, res) => {
  try {
    const { email, otp, password } = req.body;

    // Validate required fields
    if (!email || !otp || !password) {
      return res.status(400).json({ message: 'Email, OTP, and password are required' });
    }

    // Find user
    const user = await User.findOne({ email }).select('+password +twoFactorSecret');
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Check if user is an artist or admin
    if ((user.role !== 'creator' || user.creatorType !== 'artist') && user.role !== 'admin') {
      return res.status(403).json({ message: '2FA login is only for artist and admin accounts' });
    }

    // First verify password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    
    if (!isPasswordValid) {
      // Increment failed attempt
      await OTP.incrementAttempts(email, 'login');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Now verify OTP
    const otpVerification = await OTP.verifyOTP({
      email,
      otp,
      purpose: 'login'
    });

    if (!otpVerification.valid) {
      // Increment failed attempt
      await OTP.incrementAttempts(email, 'login');
      
      return res.status(401).json({ 
        message: otpVerification.message,
        verified: false
      });
    }

    // OTP verified successfully - now generate tokens and complete login
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      creatorType: user.creatorType,
      avatar: user.avatar,
      bio: user.bio,
      followersCount: user.followersCount,
      accessToken,
      refreshToken,
      verified: true,
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Error verifying OTP:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Resend OTP
 * POST /api/auth/2fa/resend
 */
const resendOTP = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    const user = await User.findOne({ email });
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if ((user.role !== 'creator' || user.creatorType !== 'artist') && user.role !== 'admin') {
      return res.status(403).json({ message: '2FA is only for artist and admin accounts' });
    }

    // Generate new OTP
    const otpRecord = await OTP.createOTP({
      email: user.email,
      purpose: 'login',
      expiresInMinutes: 10
    });

    console.log(`📧 Sending OTP to ${user.email} (${user.name})...`);
    
    // Send OTP via email
    const emailResult = await sendOTPEmail(user.email, otpRecord.otp, user.name);

    if (!emailResult.success) {
      console.error('❌ Email service returned error:', emailResult);
      return res.status(500).json({ 
        message: 'Failed to resend verification code',
        error: emailResult.error,
        details: emailResult.details,
        statusCode: emailResult.statusCode
      });
    }

    console.log('✅ OTP email sent successfully');
    
    res.json({
      message: 'Verification code resent successfully',
      expiresInSeconds: 600
    });
  } catch (error) {
    console.error('❌ Error resending OTP:', error);
    console.error('Stack trace:', error.stack);
    res.status(500).json({ 
      message: 'Internal server error',
      error: error.message
    });
  }
};

/**
 * Enable 2FA for user (admin or self-service)
 * PUT /api/auth/2fa/enable
 */
const enable2FA = async (req, res) => {
  try {
    const userId = req.user._id;
    const { enable } = req.body;

    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Only creators can enable/disable 2FA
    if (user.role !== 'creator') {
      return res.status(403).json({ message: '2FA is only available for creators' });
    }

    user.is2FAEnabled = enable === true;
    await user.save();

    res.json({
      message: `2FA ${enable ? 'enabled' : 'disabled'} successfully`,
      is2FAEnabled: user.is2FAEnabled
    });
  } catch (error) {
    console.error('Error toggling 2FA:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get 2FA status
 * GET /api/auth/2fa/status
 */
const get2FAStatus = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json({
      is2FAEnabled: user.is2FAEnabled,
      role: user.role,
      creatorType: user.creatorType
    });
  } catch (error) {
    console.error('Error getting 2FA status:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
  requestOTP,
  verifyOTPAndLogin,
  resendOTP,
  enable2FA,
  get2FAStatus
};
