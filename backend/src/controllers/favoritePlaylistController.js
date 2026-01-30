const User = require('../models/User');
const Track = require('../models/Track');
const Playlist = require('../models/Playlist');

// Add track to user's favorites
const addFavorite = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = req.user._id;
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
  } catch (error) {
    console.error('Error in addFavorite:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove track from user's favorites
const removeFavorite = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = req.user._id;
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
  } catch (error) {
    console.error('Error in removeFavorite:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's favorite tracks
const getFavorites = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = req.user._id;

    // Find the user and populate favorites
    const user = await User.findById(userId).populate('favorites');
    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    res.json({ 
      favorites: user.favorites
    });
  } catch (error) {
    console.error('Error in getFavorites:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new playlist for the user
const createPlaylist = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = req.user._id;
    const { name, description, isPublic, trackIds } = req.body;

    // Validate name
    if (!name) {
      res.status(400).json({ message: 'Playlist name is required' });
      return;
    }

    // Validate that at least one track is provided
    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      res.status(400).json({ message: 'At least one track is required to create a playlist' });
      return;
    }

    // Create the playlist
    const playlist = new Playlist({
      name,
      description: description || '',
      userId,
      tracks: trackIds,
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
  } catch (error) {
    console.error('Error in createPlaylist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Add track to playlist
const addTrackToPlaylist = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = req.user._id;
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
  } catch (error) {
    console.error('Error in addTrackToPlaylist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's playlists
const getPlaylists = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = req.user._id;

    // Find the user's playlists and populate tracks
    const playlists = await Playlist.find({ userId }).populate('tracks');

    res.json({ 
      playlists
    });
  } catch (error) {
    console.error('Error in getPlaylists:', error);
    res.status(500).json({ message: error.message });
  }
};

// Remove track from playlist
const removeTrackFromPlaylist = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = req.user._id;
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

    // Remove track from playlist if present
    const initialLength = playlist.tracks.length;
    playlist.tracks = playlist.tracks.filter(id => id.toString() !== trackId);
    const finalLength = playlist.tracks.length;
    
    if (initialLength > finalLength) {
      await playlist.save();
      res.json({ 
        message: 'Track removed from playlist',
        playlist
      });
    } else {
      res.json({ 
        message: 'Track was not in playlist',
        playlist
      });
    }
  } catch (error) {
    console.error('Error in removeTrackFromPlaylist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update playlist - allows adding/removing multiple tracks at once
const updatePlaylist = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = req.user._id;
    const { playlistId, trackIds, action } = req.body;

    // Validate playlistId
    if (!playlistId) {
      res.status(400).json({ message: 'Playlist ID is required' });
      return;
    }
    
    // Validate trackIds
    if (!trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      res.status(400).json({ message: 'At least one track ID is required' });
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

    // Validate all track IDs exist
    for (const trackId of trackIds) {
      const track = await Track.findById(trackId);
      if (!track) {
        res.status(404).json({ message: `Track with ID ${trackId} not found` });
        return;
      }
    }

    // Perform the requested action
    let updatedTracks = [...playlist.tracks];
    
    switch(action) {
      case 'replace':
        // Replace all tracks with new list
        updatedTracks = trackIds;
        break;
      case 'add':
        // Add new tracks to existing ones (without duplicates)
        for (const trackId of trackIds) {
          if (!updatedTracks.some(id => id.toString() === trackId)) {
            updatedTracks.push(trackId);
          }
        }
        break;
      case 'remove':
        // Remove specified tracks from the playlist
        updatedTracks = updatedTracks.filter(id => !trackIds.some(removeId => removeId === id.toString()));
        break;
      default:
        res.status(400).json({ message: 'Action must be one of: replace, add, remove' });
        return;
    }

    // Update the playlist tracks
    playlist.tracks = updatedTracks;
    await playlist.save();

    res.json({ 
      message: 'Playlist updated successfully',
      playlist
    });
  } catch (error) {
    console.error('Error in updatePlaylist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete playlist
const deletePlaylist = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = req.user._id;
    const playlistId = req.params.id; // Get playlistId from URL params

    // Validate playlistId
    if (!playlistId) {
      res.status(400).json({ message: 'Playlist ID is required' });
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
      res.status(403).json({ message: 'Not authorized to delete this playlist' });
      return;
    }

    // Delete the playlist
    await playlist.deleteOne();
    
    // Remove playlist reference from user
    await User.updateOne(
      { _id: userId },
      { $pull: { playlists: playlist._id } }
    );

    res.json({ 
      message: 'Playlist deleted successfully'
    });
  } catch (error) {
    console.error('Error in deletePlaylist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update playlist metadata
const updatePlaylistMetadata = async (req, res) => {
  try {
    // Check if user is authenticated
    if (!req.user) {
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const userId = req.user._id;
    const playlistId = req.params.id; // Get playlistId from URL params
    const { name, description, isPublic } = req.body;

    // Validate playlistId
    if (!playlistId) {
      res.status(400).json({ message: 'Playlist ID is required' });
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
      res.status(403).json({ message: 'Not authorized to update this playlist' });
      return;
    }

    // Update playlist metadata if provided
    if (name !== undefined) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;

    await playlist.save();

    res.json({ 
      message: 'Playlist updated successfully',
      playlist
    });
  } catch (error) {
    console.error('Error in updatePlaylistMetadata:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addFavorite,
  removeFavorite,
  getFavorites,
  createPlaylist,
  addTrackToPlaylist,
  getPlaylists,
  removeTrackFromPlaylist,
  updatePlaylist,
  deletePlaylist,
  updatePlaylistMetadata
};