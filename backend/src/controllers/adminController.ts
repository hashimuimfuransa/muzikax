import { Request, Response } from 'express';
import User from '../models/User';
import Track from '../models/Track';
import mongoose from 'mongoose';

// Get admin dashboard analytics
export const getAdminAnalytics = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Get total users
    const totalUsers = await User.countDocuments();
    
    // Get total creators
    const totalCreators = await User.countDocuments({ role: 'creator' });
    
    // Get total admins
    const totalAdmins = await User.countDocuments({ role: 'admin' });
    
    // Get total tracks
    const totalTracks = await Track.countDocuments();
    
    // Get total plays
    const allTracks = await Track.find({}, 'plays');
    const totalPlays = allTracks.reduce((sum, track) => sum + track.plays, 0);
    
    // Get trending tracks
    const trendingTracks = await Track.find()
      .sort({ plays: -1 })
      .limit(5)
      .populate('creatorId', 'name');
    
    // Get recent users
    const recentUsers = await User.find()
      .select('-password')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      totalUsers,
      totalCreators,
      totalAdmins,
      totalTracks,
      totalPlays,
      trendingTracks: trendingTracks.map(track => ({
        id: track._id,
        title: track.title,
        creatorId: track.creatorId,
        plays: track.plays,
        likes: track.likes,
        createdAt: track.createdAt
      })),
      recentUsers: recentUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        creatorType: user.creatorType,
        createdAt: user.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Error in getAdminAnalytics:', error);
    res.status(500).json({ message: error.message });
  }
};

// Search users with filters
export const searchUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const { query, role, page = 1, limit = 10 } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    
    // Build search criteria
    const searchCriteria: any = {};
    
    if (query) {
      searchCriteria.$or = [
        { name: { $regex: query as string, $options: 'i' } },
        { email: { $regex: query as string, $options: 'i' } }
      ];
    }
    
    if (role && role !== 'all') {
      searchCriteria.role = role;
    }
    
    const users = await User.find(searchCriteria)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit));
    
    const total = await User.countDocuments(searchCriteria);
    
    res.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        creatorType: user.creatorType,
        createdAt: user.createdAt
      })),
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
      total
    });
  } catch (error: any) {
    console.error('Error in searchUsers:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get platform statistics
export const getPlatformStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Get user growth data (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const userGrowth = await User.aggregate([
      {
        $match: {
          createdAt: { $gte: thirtyDaysAgo }
        }
      },
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { _id: 1 }
      }
    ]);
    
    // Get content statistics by type
    const contentStats = await Track.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 },
          totalPlays: { $sum: "$plays" }
        }
      }
    ]);
    
    // Get top creators by play count
    const topCreators = await Track.aggregate([
      {
        $group: {
          _id: "$creatorId",
          totalPlays: { $sum: "$plays" },
          trackCount: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "creator"
        }
      },
      {
        $unwind: "$creator"
      },
      {
        $project: {
          _id: "$creator._id",
          name: "$creator.name",
          totalPlays: 1,
          trackCount: 1
        }
      },
      {
        $sort: { totalPlays: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    res.json({
      userGrowth,
      contentStats,
      topCreators
    });
  } catch (error: any) {
    console.error('Error in getPlatformStats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get detailed user statistics
export const getUserStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Count users by role
    const userRoles = await User.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Count creators by type
    const creatorTypes = await User.aggregate([
      {
        $match: { role: "creator" }
      },
      {
        $group: {
          _id: "$creatorType",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Recently joined users
    const recentUsers = await User.find()
      .select('name email role creatorType createdAt')
      .sort({ createdAt: -1 })
      .limit(10);
    
    res.json({
      userRoles,
      creatorTypes,
      recentUsers: recentUsers.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        creatorType: user.creatorType,
        createdAt: user.createdAt
      }))
    });
  } catch (error: any) {
    console.error('Error in getUserStats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get content statistics
export const getContentStats = async (_req: Request, res: Response): Promise<void> => {
  try {
    // Total tracks
    const totalTracks = await Track.countDocuments();
    
    // Tracks by type
    const tracksByType = await Track.aggregate([
      {
        $group: {
          _id: "$type",
          count: { $sum: 1 }
        }
      }
    ]);
    
    // Tracks by genre
    const tracksByGenre = await Track.aggregate([
      {
        $group: {
          _id: "$genre",
          count: { $sum: 1 }
        }
      },
      {
        $sort: { count: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Most played tracks
    const mostPlayedTracks = await Track.find()
      .sort({ plays: -1 })
      .limit(10)
      .populate('creatorId', 'name');
    
    res.json({
      totalTracks,
      tracksByType,
      tracksByGenre,
      mostPlayedTracks: mostPlayedTracks.map(track => ({
        id: track._id,
        title: track.title,
        creator: track.creatorId ? (track.creatorId as any).name : 'Unknown',
        plays: track.plays,
        likes: track.likes
      }))
    });
  } catch (error: any) {
    console.error('Error in getContentStats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user details by ID
export const getUserById = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate that id exists and is valid
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    const user = await User.findById(id).select('-password');
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      creatorType: user.creatorType,
      avatar: user.avatar,
      bio: user.bio,
      socials: user.socials,
      followersCount: user.followersCount,
      createdAt: user.createdAt
    });
  } catch (error: any) {
    console.error('Error in getUserById:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update user role
export const updateUserRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { role, creatorType } = req.body;
    
    // Validate that id exists and is valid
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    // Validate role
    const validRoles = ['fan', 'creator', 'admin'];
    if (!validRoles.includes(role)) {
      res.status(400).json({ message: 'Invalid role' });
      return;
    }
    
    // Validate creatorType if role is creator
    if (role === 'creator') {
      const validCreatorTypes = ['artist', 'dj', 'producer'];
      if (!creatorType || !validCreatorTypes.includes(creatorType)) {
        res.status(400).json({ message: 'Valid creatorType is required for creator role' });
        return;
      }
    }
    
    const updateData: any = { role };
    if (role === 'creator') {
      updateData.creatorType = creatorType;
    } else {
      updateData.creatorType = null;
    }
    
    const user = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, select: '-password' }
    );
    
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      creatorType: user.creatorType,
      createdAt: user.createdAt
    });
  } catch (error: any) {
    console.error('Error in updateUserRole:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete user
export const deleteUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    
    // Validate that id exists and is valid
    if (!id || typeof id !== 'string' || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({ message: 'Invalid user ID' });
      return;
    }
    
    // Prevent deleting admin users
    const user = await User.findById(id);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }
    
    if (user.role === 'admin') {
      res.status(400).json({ message: 'Cannot delete admin users' });
      return;
    }
    
    // Delete user
    await User.findByIdAndDelete(id);
    
    // TODO: Also delete associated content (tracks, playlists, etc.)
    
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    console.error('Error in deleteUser:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get geographic distribution of listeners
export const getGeographicDistribution = async (_req: Request, res: Response): Promise<void> => {
  try {
    const ListenerGeography = require('../models/ListenerGeography');
    
    // Get top countries by play count
    const countryStats = await ListenerGeography.aggregate([
      {
        $group: {
          _id: "$country",
          playCount: { $sum: 1 },
          uniqueListeners: { $addToSet: "$ipAddress" }
        }
      },
      {
        $project: {
          _id: 1,
          playCount: 1,
          uniqueListeners: { $size: "$uniqueListeners" }
        }
      },
      {
        $sort: { playCount: -1 }
      },
      {
        $limit: 10
      }
    ]);
    
    // Get total play count by country for percentage calculation
    const totalPlays = countryStats.reduce((sum: number, stat: any) => sum + stat.playCount, 0);
    
    // Format the data to include percentages
    const formattedCountryStats = countryStats.map((stat: any) => ({
      country: stat._id,
      playCount: stat.playCount,
      uniqueListeners: stat.uniqueListeners,
      percentage: totalPlays > 0 ? parseFloat(((stat.playCount / totalPlays) * 100).toFixed(2)) : 0
    }));
    
    res.json({
      countryStats: formattedCountryStats,
      totalPlays
    });
  } catch (error: any) {
    console.error('Error in getGeographicDistribution:', error);
    res.status(500).json({ message: error.message });
  }
}