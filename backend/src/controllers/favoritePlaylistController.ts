import { Request, Response } from 'express';
import User from '../models/User';
import Track from '../models/Track';
import Playlist from '../models/Playlist';

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

    // Check if track is in favorites before removing
    const favoriteIndex = user.favorites.indexOf(trackId);
    if (favoriteIndex !== -1) {
      // Remove track from favorites
      user.favorites.splice(favoriteIndex, 1);
      await user.save();
      
      // Decrement the track's likes count (but not below 0)
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