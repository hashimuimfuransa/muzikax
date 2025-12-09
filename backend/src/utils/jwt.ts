import * as jwt from 'jsonwebtoken';
import { SignOptions } from 'jsonwebtoken';
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
  const options: SignOptions = {
    expiresIn: process.env['JWT_ACCESS_EXPIRE'] ? process.env['JWT_ACCESS_EXPIRE'] : ('15m' as any)
  };
  
  return jwt.sign(payload, secret, options);
};

// Generate refresh token
export const generateRefreshToken = (user: IUser): string => {
  const payload = {
    id: user._id
  };
  
  const secret = process.env['JWT_REFRESH_SECRET'] || 'refresh_secret';
  const options: SignOptions = {
    expiresIn: process.env['JWT_REFRESH_EXPIRE'] ? process.env['JWT_REFRESH_EXPIRE'] : ('7d' as any)
  };
  
  return jwt.sign(payload, secret, options);
};

// Verify access token
export const verifyAccessToken = (token: string): JwtPayload | null => {
  try {
    const secret = process.env['JWT_ACCESS_SECRET'] || 'access_secret';
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    return null;
  }
};

// Verify refresh token
export const verifyRefreshToken = (token: string): JwtPayload | null => {
  try {
    const secret = process.env['JWT_REFRESH_SECRET'] || 'refresh_secret';
    return jwt.verify(token, secret) as JwtPayload;
  } catch (error) {
    return null;
  }
};

// Middleware to protect routes
export const protect = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  let token: string | undefined;

  if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
    try {
      token = req.headers.authorization.split(' ')[1];
      
      if (!token) {
        res.status(401).json({ message: 'Not authorized, token failed' });
        return;
      }
      
      const decoded = verifyAccessToken(token);

      if (!decoded) {
        res.status(401).json({ message: 'Not authorized, token failed' });
        return;
      }

      const user = await User.findById(decoded.id).select('-password');

      if (!user) {
        res.status(401).json({ message: 'Not authorized, user not found' });
        return;
      }

      (req as any).user = user;
      next();
    } catch (error) {
      res.status(401).json({ message: 'Not authorized, token failed' });
      return;
    }
  }

  if (!token) {
    res.status(401).json({ message: 'Not authorized, no token' });
    return;
  }
};

// Middleware for admin authorization
export const admin = (req: Request, res: Response, next: NextFunction): void => {
  if ((req as any).user && (req as any).user.role === 'admin') {
    next();
  } else {
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