import { Request, Response } from 'express';
import User from '../models/User';

// Upgrade user to creator (user can upgrade themselves)
export const upgradeToCreator = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = (req as any).user._id;
    const { creatorType } = req.body;

    // Validate creatorType
    const validCreatorTypes = ['artist', 'dj', 'producer'];
    if (!creatorType || !validCreatorTypes.includes(creatorType)) {
      res.status(400).json({ message: 'Valid creatorType is required: artist, dj, or producer' });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Update user role and creatorType
    user.role = 'creator';
    user.creatorType = creatorType;

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      creatorType: updatedUser.creatorType,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      followersCount: updatedUser.followersCount,
      socials: updatedUser.socials,
      createdAt: updatedUser.createdAt
    });
  } catch (error: any) {
    console.error('Error in upgradeToCreator:', error);
    res.status(500).json({ message: error.message });
  }
};