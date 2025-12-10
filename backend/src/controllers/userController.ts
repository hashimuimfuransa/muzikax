import { Request, Response } from 'express';
import User from '../models/User';
import Track from '../models/Track';

// Get all users (admin only)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await User.countDocuments();

    res.json({
      users,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get public creators (accessible to all users)
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

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params['id']).select('-password');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json(user);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update user (admin only)
export const updateUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params['id']);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    const { name, email, role, creatorType, bio, socials, avatar } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.creatorType = creatorType || user.creatorType;
    user.bio = bio || user.bio;
    user.socials = socials || user.socials;
    user.avatar = avatar || user.avatar;

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
    res.status(500).json({ message: error.message });
  }
};

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

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params['id']);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Also delete all tracks by this user
    await Track.deleteMany({ creatorId: user._id });

    await user.deleteOne();
    res.json({ message: 'User removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Approve creator (admin only)
export const approveCreator = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params['id']);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (user.role !== 'creator') {
      res.status(400).json({ message: 'User is not a creator' });
      return;
    }

    // Here you could implement additional approval logic
    // For now, we'll just confirm the creator is approved
    
    res.json({
      message: 'Creator approved',
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        creatorType: user.creatorType,
        avatar: user.avatar,
        bio: user.bio,
        followersCount: user.followersCount
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get creator analytics (creator only)
export const getCreatorAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log the incoming request for debugging
    console.log('getCreatorAnalytics called');
    console.log('User in request:', (req as any).user);
    
    // Check if user is authenticated
    if (!(req as any).user) {
      console.log('No user found in request');
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const creatorId = (req as any).user._id;
    console.log('Creator ID:', creatorId);
    
    // Check if user is a creator
    if ((req as any).user.role !== 'creator') {
      console.log('User is not a creator, role:', (req as any).user.role);
      res.status(401).json({ message: 'Not authorized as creator' });
      return;
    }

    // Get total tracks
    const totalTracks = await Track.countDocuments({ creatorId });
    console.log('Total tracks:', totalTracks);

    // Get total plays for all tracks
    const tracks = await Track.find({ creatorId });
    const totalPlays = tracks.reduce((sum, track) => sum + track.plays, 0);
    console.log('Total plays:', totalPlays);

    // Get total likes for all tracks
    const totalLikes = tracks.reduce((sum, track) => sum + track.likes, 0);
    console.log('Total likes:', totalLikes);

    const response = {
      totalTracks,
      totalPlays,
      totalLikes,
      tracks: tracks.length
    };
    
    console.log('Analytics response:', response);
    res.json(response);
  } catch (error: any) {
    console.error('Error in getCreatorAnalytics:', error);
    res.status(500).json({ message: error.message });
  }
};
