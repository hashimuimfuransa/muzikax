import { Request, Response } from 'express';
import User from '../models/User';
import Track from '../models/Track';

// Get all users (admin only)
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
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

// Get user by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id).select('-password');

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
    const user = await User.findById(req.params.id);

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

// Delete user (admin only)
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.params.id);

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
    const user = await User.findById(req.params.id);

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
    const creatorId = (req as any).user._id;

    // Get total tracks
    const totalTracks = await Track.countDocuments({ creatorId });

    // Get total plays for all tracks
    const tracks = await Track.find({ creatorId });
    const totalPlays = tracks.reduce((sum, track) => sum + track.plays, 0);

    // Get total likes for all tracks
    const totalLikes = tracks.reduce((sum, track) => sum + track.likes, 0);

    res.json({
      totalTracks,
      totalPlays,
      totalLikes,
      tracks: tracks.length
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};