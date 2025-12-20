import { Request, Response } from 'express';
import User from '../models/User';
import { generateAccessToken, generateRefreshToken } from '../utils/jwt';
import { OAuth2Client } from 'google-auth-library';

const client = new OAuth2Client(process.env['GOOGLE_CLIENT_ID']);

// Google login
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
  try {
    const { token } = req.body;

    // Verify the token with Google
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env['GOOGLE_CLIENT_ID'] || ''
    });

    const payload = (await ticket).getPayload?.();
    
    if (!payload) {
      res.status(400).json({ message: 'Invalid Google token' });
      return;
    }

    const { sub: googleId, email, name, picture } = payload;

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

    res.json({
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
  } catch (error: any) {
    console.error('Google login error:', error);
    res.status(500).json({ message: error.message || 'Google login failed' });
  }
};