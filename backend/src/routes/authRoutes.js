const express = require('express');
const { register, login, refreshToken, getUserProfile } = require('../controllers/authController');
const { googleLogin } = require('../controllers/googleAuthController');

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
router.get('/me', jwt_1.protect, authController_1.getUserProfile);

// Refresh token route
router.post('/refresh-token', refreshToken);

module.exports = router;