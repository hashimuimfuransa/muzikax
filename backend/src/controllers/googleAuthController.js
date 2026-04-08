const User = require('../models/User');
const { generateAccessToken, generateRefreshToken } = require('../utils/jwt');
const https = require('https');
const http = require('http');

// Create custom agents with longer timeout
const httpsAgent = new https.Agent({
  keepAlive: true,
  timeout: 30000, // 30 seconds timeout
});

const httpAgent = new http.Agent({
  keepAlive: true,
  timeout: 30000,
});

// Helper function to fetch with retry logic
async function fetchWithRetry(url, options, retries = 3, backoff = 1000) {
  for (let i = 0; i < retries; i++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30s timeout
      
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
        dispatcher: url.startsWith('https') ? httpsAgent : httpAgent,
      });
      
      clearTimeout(timeoutId);
      return response;
    } catch (error) {
      console.log(`Attempt ${i + 1} failed for ${url}:`, error.message);
      
      if (i === retries - 1) {
        throw error; // Throw on last attempt
      }
      
      // Wait before retrying (exponential backoff)
      await new Promise(resolve => setTimeout(resolve, backoff * Math.pow(2, i)));
    }
  }
}

// Google login
const googleLogin = async (req, res) => {
  try {
    const { code } = req.body;
    
    console.log('Received Google authorization code:', code);
    console.log('Environment variables:');
    console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID ? '[SET]' : '[NOT SET]');
    console.log('GOOGLE_CLIENT_SECRET:', process.env.GOOGLE_CLIENT_SECRET ? '[SET]' : '[NOT SET]');
    console.log('FRONTEND_URL:', process.env.FRONTEND_URL);
    console.log('GOOGLE_REDIRECT_URI:', process.env.GOOGLE_REDIRECT_URI);
    console.log('Request origin:', req.get('origin'));
    console.log('Request headers:', req.headers);
    
    // Check if code exists
    if (!code) {
      return res.status(400).json({ message: 'No Google authorization code provided' });
    }

    // Use environment variables for redirect URI to match Google Console settings
    // For production, we should use the production frontend URL
    const redirectUri = process.env.GOOGLE_REDIRECT_URI || process.env.FRONTEND_URL || 
                       (process.env.NODE_ENV === 'production' ? 'https://muzikax.com' : 'http://localhost:3000');
    console.log('Using redirect URI:', redirectUri);

    // Exchange authorization code for access token with retry logic
    console.log('Exchanging authorization code for tokens...');
    const tokenResponse = await fetchWithRetry('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env['GOOGLE_CLIENT_ID'],
        client_secret: process.env['GOOGLE_CLIENT_SECRET'],
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed with status:', tokenResponse.status);
      console.error('Token exchange response text:', errorText);
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (parseError) {
        console.error('Could not parse error response as JSON');
        errorData = { error: 'unknown_error', error_description: errorText };
      }
      console.error('Token exchange failed:', errorData);
      return res.status(400).json({ 
        message: errorData.error_description || 'Failed to exchange authorization code for tokens',
        error: errorData.error || 'unauthorized_client'
      });
    }

    const tokenData = await tokenResponse.json();
    console.log('Token exchange successful:', tokenData);

    // Get user info using the access token with retry logic
    console.log('Retrieving user info from Google...');
    const userInfoResponse = await fetchWithRetry('https://www.googleapis.com/oauth2/v2/userinfo', {
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
      whatsappContact: user.whatsappContact || '', // Include WhatsApp contact
      accessToken,
      refreshToken
    });
  } catch (error) {
    console.error('Google login error:', error);
    
    // Provide more specific error messages based on error type
    let errorMessage = 'Google login failed';
    let statusCode = 500;
    
    if (error.name === 'AbortError') {
      errorMessage = 'Request to Google servers timed out. Please check your internet connection and try again.';
      statusCode = 504; // Gateway Timeout
    } else if (error.code === 'UND_ERR_CONNECT_TIMEOUT' || error.code === 'ETIMEDOUT') {
      errorMessage = 'Cannot connect to Google authentication servers. This may be due to network restrictions or firewall settings.';
      statusCode = 503; // Service Unavailable
    } else if (error.code === 'ECONNREFUSED') {
      errorMessage = 'Connection refused. Please check your network configuration.';
      statusCode = 503;
    } else if (error.message?.includes('fetch failed')) {
      errorMessage = 'Network error while connecting to Google. Please verify your internet connection.';
      statusCode = 503;
    }
    
    return res.status(statusCode).json({ 
      message: errorMessage,
      error: error.code || error.name || 'unknown_error',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  googleLogin
};