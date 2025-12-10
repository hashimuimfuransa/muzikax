import { Request, Response } from 'express';
import User from '../models/User';

/**
 * Get public creators (accessible to all users)
 * This endpoint is completely public and requires no authentication
 */
export const getPublicCreators = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query['limit'] as string) || 10;
    
    // Find users with role 'creator' and sort by followersCount descending
    const creators = await User.find({ role: 'creator' })
      .select('-password')
      .sort({ followersCount: -1, createdAt: -1 })
      .limit(limit);

    res.json({
      users: creators
    });
  } catch (error: any) {
    console.error('Error fetching public creators:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get a specific creator's public profile by ID
 * This endpoint is completely public and requires no authentication
 */
export const getPublicCreatorProfile = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.params['id'];
    
    // Find user with role 'creator' by ID
    const creator = await User.findOne({ _id: creatorId, role: 'creator' })
      .select('-password');

    if (!creator) {
      res.status(404).json({ message: 'Creator not found' });
      return;
    }

    res.json(creator);
  } catch (error: any) {
    console.error('Error fetching public creator profile:', error);
    res.status(500).json({ message: error.message });
  }
};