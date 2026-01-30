import * as jwt from 'jsonwebtoken';
import { Request, Response, NextFunction } from 'express';
import User, { IUser } from '../models/User';

interface JwtPayload {
  id: string;
  role: string;
  creatorType: string | null;
}

// Generate access token
export const generateAccessToken = (user: IUser): string => {
  const payload = {
    id: user._id,
    role: user.role,
    creatorType: user.creatorType
  };
  
  const secret = process.env['JWT_ACCESS_SECRET'] || 'access_secret';
  const options: any = {
    expiresIn: process.env['JWT_ACCESS_EXPIRE'] || '15m'
  };
  
  console.log('Generating access token with secret:', secret.substring(0, 10) + '...');
  return jwt.sign(payload, secret, options);
};

// Generate refresh token
export const generateRefreshToken = (user: IUser): string => {
  const payload = {
    id: user._id
  };
  
  const secret = process.env['JWT_REFRESH_SECRET'] || 'refresh_secret';
  const options: any = {
    expiresIn: process.env['JWT_REFRESH_EXPIRE'] || '7d'
  };
  
  console.log('Generating refresh token with secret:', secret.substring(0, 10) + '...');
  return jwt.sign(payload, secret, options);
};

// Verify access token
export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    const secret = process.env['JWT_ACCESS_SECRET'] || 'access_secret';
    console.log('Verifying access token with secret:', secret.substring(0, 10) + '...');
    const decoded = jwt.verify(token, secret) as JwtPayload;
    console.log('Token verified successfully');
    return decoded;
  } catch (error) {
    console.error('Token verification failed:', error);
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    const secret = process.env['JWT_REFRESH_SECRET'] || 'refresh_secret';
    console.log('Verifying refresh token with secret:', secret.substring(0, 10) + '...');
    const decoded = jwt.verify(token, secret) as JwtPayload;
    console.log('Refresh token verified successfully');
    return decoded;
  } catch (error) {
    console.error('Refresh token verification failed:', error);
    return null;
  }
};

// Middleware to protect routes
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      // Log token info for debugging
      console.log('Token extracted from header:', token ? `${token.substring(0, 10)}...` : 'No token');
      
      if (!token) {
        res.status(401).json({ message: 'Not authorized, token missing' });
        return;
      }
      
      const decoded = verifyAccessToken(token);
      
      // Log decoded token info (without sensitive data)
      console.log('Token verification result:', decoded ? 'Valid' : 'Invalid');

      if (!decoded) {
        res.status(401).json({ message: 'Not authorized, invalid or expired token' });
        return;
      }

      const user = await User.findById(decoded.id).select('-password');
      
      console.log('User found from token:', user ? user._id : 'Not found');

      if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      // Attach user to request object
      (req as any).user = user;
      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(401).json({ message: 'Not authorized, token validation failed', error: error instanceof Error ? error.message : 'Unknown error' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token provided' });
    return;
  }
};

// Middleware for admin authorization
export const admin = (req: Request, res: Response, next: NextFunction): void => {
  console.log('ADMIN MIDDLEWARE CALLED');
  console.log('Request URL:', req.originalUrl);
  console.log('User in request:', (req as any).user);
  
  if ((req as any).user && (req as any).user.role === 'admin') {
    console.log('Admin check passed');
    next();
  } else {
    console.log('Admin check failed - user role:', (req as any).user?.role);
    res.status(401).json({ message: 'Not authorized as admin' });
    return;
  }
};

// Middleware for creator authorization
export const creator = (req: Request, res: Response, next: NextFunction): void => {
  if ((req as any).user && (req as any).user.role === 'creator') {
    next();
  } else {
    res.status(401).json({ message: 'Not authorized as creator' });
    return;
  }
};

// Middleware for specific creator types
export const creatorType = (types: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (
      (req as any).user &&
      (req as any).user.role === 'creator' &&
      (req as any).user.creatorType &&
      types.includes((req as any).user.creatorType)
    ) {
      next();
    } else {
      res.status(401).json({ message: 'Not authorized for this creator type' });
      return;
    }
  };
};