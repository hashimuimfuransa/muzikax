const express = require('express');
const { register, login, refreshToken, getUserProfile, updateUserProfile, requestPasswordReset, resetPassword } = require('../controllers/authController');
const { googleLogin } = require('../controllers/googleAuthController');
const { requestOTP, verifyOTPAndLogin, resendOTP, enable2FA, get2FAStatus } = require('../controllers/twoFAController');
const { protect } = require('../utils/jwt');

console.log('AUTH ROUTES FILE LOADED');

const router = express.Router();

console.log('SETTING UP AUTH ROUTES');

// Register route
router.post('/register', register);

// Login route
router.post('/login', login);

// Google Login route
router.post('/google', googleLogin);

// Logout route - simple implementation
router.post('/logout', (req, res) => {
  // For JWT, logout is typically handled on the client side
  // by removing the tokens. This endpoint can be used to 
  // invalidate tokens if we implement token blacklisting.
  res.json({ message: 'Logged out successfully' });
});

// Get user profile route
router.get('/me', protect, getUserProfile);

// Profile routes
router.route('/profile')
  .put(protect, updateUserProfile);

// Refresh token route
router.post('/refresh-token', refreshToken);

// Password reset routes
router.post('/forgot-password', requestPasswordReset);
router.post('/reset-password', resetPassword);

// 2FA routes for artists
router.post('/2fa/request', requestOTP);
router.post('/2fa/verify', verifyOTPAndLogin);
router.post('/2fa/resend', resendOTP);
router.put('/2fa/enable', protect, enable2FA);
router.get('/2fa/status', protect, get2FAStatus);

module.exports = router;