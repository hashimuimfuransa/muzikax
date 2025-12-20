const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const { OAuth2Client } = require('google-auth-library');

const client = new OAuth2Client(process.env['GOOGLE_CLIENT_ID']);

// Google login
const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    
    console.log('Received Google authorization code:', code);
    
    // Check if code exists
    if (!code) {
      return res.status(400).json({ message: 'No Google authorization code provided' });
    }

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env['GOOGLE_CLIENT_ID'],
        client_secret: process.env['GOOGLE_CLIENT_SECRET'],
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: 'http://localhost:3000' // Adjust this to your actual redirect URI
      })
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
      return res.status(400).json({ message: 'Failed to exchange authorization code for tokens' });
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful:', tokenData);

    // Get user info using the access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!userInfoResponse.ok) {
      const errorData = await userInfoResponse.json();
      console.error('User info retrieval failed:', errorData);
      return res.status(400).json({ message: 'Failed to retrieve user information' });
    }

    const userInfo = await userInfoResponse.json();
    console.log('User info retrieved:', userInfo);

    const { id: googleId, email, name, picture } = userInfo;

    // Check if user exists
    let user = await User.findOne({ email: email || '' });

    if (!user) {
      // Create new user if doesn't exist
      user = await User.create({
        name: name || email?.split('@')[0] || 'User',
        email: email || '',
        password: '', // No password for Google users
        role: 'fan',
        avatar: picture || '',
        googleId: googleId
      });
    } else if (!user.googleId) {
      // If user exists but doesn't have a googleId, update it
      user.googleId = googleId;
      user.avatar = picture || '';
      await user.save();
    }

    // Generate tokens
    const accessToken = generateAccessToken(user);
    const refreshToken = generateRefreshToken(user);

    return res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      creatorType: user.creatorType,
      avatar: user.avatar,
      followersCount: user.followersCount,
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Google login error:', error);
    return res.status(500).json({ message: error.message || 'Google login failed' });
  }
};

module.exports = {
  googleLogin
};