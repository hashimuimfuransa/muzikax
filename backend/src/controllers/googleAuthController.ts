import { Request, Response } from 'express';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { setOAuthResponseHeaders } from '../utils/oauthUtils';

// Google login
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    console.log('Received Google authorization code:', code);
    
    // Check if code exists
    if (!code) {
      res.status(400).json({ message: 'No Google authorization code provided' });
      return;
    }

    // Use environment variables for redirect URI to match Google Console settings
    const redirectUri = process.env['GOOGLE_REDIRECT_URI'] || process.env['FRONTEND_URL'] || 'http://localhost:3000';

    // Exchange authorization code for access token
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        client_id: process.env['GOOGLE_CLIENT_ID'] || '',
        client_secret: process.env['GOOGLE_CLIENT_SECRET'] || '',
        code: code,
        grant_type: 'authorization_code',
        redirect_uri: redirectUri
      })
    });

    if (!tokenResponse.ok) {
      const errorData: any = await tokenResponse.json();
      console.error('Token exchange failed:', errorData);
      res.status(400).json({ 
        message: errorData.error_description || 'Failed to exchange authorization code for tokens',
        error: errorData.error || 'unauthorized_client'
      });
      return;
    }

    const tokenData: any = await tokenResponse.json();
    console.log('Token exchange successful:', tokenData);

    // Get user info using the access token
    const userInfoResponse = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`
      }
    });

    if (!userInfoResponse.ok) {
      const errorData: any = await userInfoResponse.json();
      console.error('User info retrieval failed:', errorData);
      res.status(400).json({ message: 'Failed to retrieve user information' });
      return;
    }

    const userInfo: any = await userInfoResponse.json();
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

    // Prepare user data
    const userData = {
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
    };

    // Set appropriate headers to handle OAuth response using utility function
    setOAuthResponseHeaders(res);

    res.json(userData);
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({ message: error.message || 'Google login failed' });
  }
};