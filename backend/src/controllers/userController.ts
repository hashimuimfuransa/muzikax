import { Request, Response } from 'express';
import User from '../models/User';
import Track from '../models/Track';
import Playlist from '../models/Playlist';
import * as bcrypt from 'bcryptjs';
import mongoose from 'mongoose';

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

    const { name, email, role, creatorType, bio, genres, socials, avatar, password } = req.body;

    user.name = name || user.name;
    user.email = email || user.email;
    user.role = role || user.role;
    user.creatorType = creatorType || user.creatorType;
    user.bio = bio || user.bio;
    user.genres = genres || user.genres;
    user.socials = socials || user.socials;
    user.avatar = avatar || user.avatar;
    
    // Only allow password update if provided
    if (password) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(password, salt);
    }

    const updatedUser = await user.save();

    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      creatorType: updatedUser.creatorType,
      avatar: updatedUser.avatar,
      bio: updatedUser.bio,
      genres: updatedUser.genres,
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

;

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

// Follow a creator
export const followCreator = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = (req as any).user._id;
    const creatorId = req.params['id'];

    // Validate creatorId
    if (!creatorId) {
      res.status(400).json({ message: 'Creator ID is required' });
      return;
    }

    // Check if trying to follow self
    if (userId.toString() === creatorId) {
      res.status(400).json({ message: 'You cannot follow yourself' });
      return;
    }

    // Find the user and the creator
    const [user, creator] = await Promise.all([
      User.findById(userId),
      User.findById(creatorId)
    ]);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!creator) {
      res.status(404).json({ message: 'Creator not found' });
      return;
    }

    // Check if user is already following this creator
    const isAlreadyFollowing = user.following.some(id => id.toString() === creatorId);
    if (isAlreadyFollowing) {
      res.status(200).json({ 
        message: 'Already following this creator',
        followersCount: creator.followersCount
      });
      return;
    }

    // Add creator to user's following list
    user.following.push(new mongoose.Types.ObjectId(creatorId));
    await user.save();

    // Increment the creator's followers count
    creator.followersCount = (creator.followersCount || 0) + 1;
    await creator.save();

    res.json({ 
      message: 'Successfully followed creator',
      followersCount: creator.followersCount
    });
  } catch (error: any) {
    console.error('Error in followCreator:', error);
    res.status(500).json({ message: error.message });
  }
};

// Unfollow a creator
export const unfollowCreator = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = (req as any).user._id;
    const creatorId = req.params['id'];

    // Validate creatorId
    if (!creatorId) {
      res.status(400).json({ message: 'Creator ID is required' });
      return;
    }

    // Find the user and the creator
    const [user, creator] = await Promise.all([
      User.findById(userId),
      User.findById(creatorId)
    ]);

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    if (!creator) {
      res.status(404).json({ message: 'Creator not found' });
      return;
    }

    // Check if user is following this creator
    const isFollowing = user.following.some(id => id.toString() === creatorId);
    if (!isFollowing) {
      res.json({ 
        message: 'Not following this creator',
        followersCount: creator.followersCount
      });
      return;
    }

    // Remove creator from user's following list
    user.following = user.following.filter(id => id.toString() !== creatorId);
    await user.save();

    // Decrement the creator's followers count
    creator.followersCount = Math.max(0, (creator.followersCount || 0) - 1);
    await creator.save();

    res.json({ 
      message: 'Successfully unfollowed creator',
      followersCount: creator.followersCount
    });
  } catch (error: any) {
    console.error('Error in unfollowCreator:', error);
    res.status(500).json({ message: error.message });
  }
};

// Check if user is following a creator
export const checkFollowingStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ isFollowing: false });
      return;
    }

    const userId = (req as any).user._id;
    const creatorId = req.params['id'];

    // Validate creatorId
    if (!creatorId) {
      res.status(400).json({ message: 'Creator ID is required' });
      return;
    }

    // Convert string IDs to ObjectId
    const creatorObjectId = new mongoose.Types.ObjectId(creatorId);
    
    // Find the user
    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ isFollowing: false });
      return;
    }

    // Check if user is following this creator
    const isFollowing = user.following.some(id => id.equals(creatorObjectId));
    
    res.json({ isFollowing });
  } catch (error: any) {
    console.error('Error in checkFollowingStatus:', error);
    res.status(500).json({ message: error.message, isFollowing: false });
  }
};

// Get followed creators for a user
export const getFollowedCreators = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = (req as any).user._id;

    // Find the user and populate the following field
    const user = await User.findById(userId).populate('following', 'name avatar bio followersCount creatorType');

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ 
      creators: user.following,
      count: user.following.length
    });
  } catch (error: any) {
    console.error('Error in getFollowedCreators:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add track to user's favorites
export const addFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = (req as any).user._id;
    const { trackId } = req.body;

    // Validate trackId
    if (!trackId) {
      res.status(400).json({ message: 'Track ID is required' });
      return;
    }

    // Find the track
    const track = await Track.findById(trackId);
    if (!track) {
      res.status(404).json({ message: 'Track not found' });
      return;
    }

    // Find the user and add track to favorites
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Check if track is already in favorites
    if (!user.favorites.includes(trackId)) {
      user.favorites.push(trackId);
      await user.save();
      
      // Increment the track's likes count
      track.likes = (track.likes || 0) + 1;
      await track.save();
    }

    res.json({ 
      message: 'Track added to favorites',
      favorites: user.favorites
    });
  } catch (error: any) {
    console.error('Error in addFavorite:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove track from user's favorites
export const removeFavorite = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = (req as any).user._id;
    const { trackId } = req.body;

    // Validate trackId
    if (!trackId) {
      res.status(400).json({ message: 'Track ID is required' });
      return;
    }

    // Find the user and remove track from favorites
    const user = await User.findById(userId);
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Remove track from favorites
    const initialLength = user.favorites.length;
    user.favorites = user.favorites.filter(id => id.toString() !== trackId);
    const finalLength = user.favorites.length;
    await user.save();

    // Decrement the track's likes count if the track was actually removed
    if (initialLength > finalLength) {
      const track = await Track.findById(trackId);
      if (track) {
        track.likes = Math.max(0, (track.likes || 0) - 1);
        await track.save();
      }
    }

    res.json({ 
      message: 'Track removed from favorites',
      favorites: user.favorites
    });
  } catch (error: any) {
    console.error('Error in removeFavorite:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's favorite tracks
export const getFavorites = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = (req as any).user._id;

    // Find the user and populate favorites
    const user = await User.findById(userId).populate('favorites');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ 
      favorites: user.favorites
    });
  } catch (error: any) {
    console.error('Error in getFavorites:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new playlist for the user
export const createPlaylist = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = (req as any).user._id;
    const { name, description, isPublic, trackIds } = req.body;

    // Validate name
    if (!name) {
      res.status(400).json({ message: 'Playlist name is required' });
      return;
    }

    // Create the playlist
    const playlist = new Playlist({
      name,
      description: description || '',
      userId,
      tracks: trackIds || [],
      isPublic: isPublic !== undefined ? isPublic : true
    });

    const savedPlaylist = await playlist.save();

    // Add playlist to user's playlists
    const user = await User.findById(userId);
    if (user) {
      user.playlists.push(savedPlaylist._id);
      await user.save();
    }

    res.status(201).json({ 
      message: 'Playlist created successfully',
      playlist: savedPlaylist
    });
  } catch (error: any) {
    console.error('Error in createPlaylist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add track to playlist
export const addTrackToPlaylist = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = (req as any).user._id;
    const { playlistId, trackId } = req.body;

    // Validate playlistId and trackId
    if (!playlistId || !trackId) {
      res.status(400).json({ message: 'Playlist ID and Track ID are required' });
      return;
    }

    // Find the playlist
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
      res.status(404).json({ message: 'Playlist not found' });
      return;
    }

    // Check if user owns the playlist
    if (playlist.userId.toString() !== userId.toString()) {
      res.status(403).json({ message: 'Not authorized to modify this playlist' });
      return;
    }

    // Find the track
    const track = await Track.findById(trackId);
    if (!track) {
      res.status(404).json({ message: 'Track not found' });
      return;
    }

    // Add track to playlist if not already present
    if (!playlist.tracks.includes(trackId)) {
      playlist.tracks.push(trackId);
      await playlist.save();
    }

    res.json({ 
      message: 'Track added to playlist',
      playlist
    });
  } catch (error: any) {
    console.error('Error in addTrackToPlaylist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's playlists
export const getPlaylists = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if user is authenticated
    if (!(req as any).user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = (req as any).user._id;

    // Find the user's playlists and populate tracks
    const playlists = await Playlist.find({ userId }).populate('tracks');

    res.json({ 
      playlists
    });
  } catch (error: any) {
    console.error('Error in getPlaylists:', error);
    res.status(500).json({ message: error.message });
  }
};