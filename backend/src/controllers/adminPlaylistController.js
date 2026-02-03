const Playlist = require('../models/Playlist');
const Track = require('../models/Track');
const User = require('../models/User');

// Get all playlists (admin view)
const getAllPlaylists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const playlists = await Playlist.find()
      .populate('userId', 'name email')
      .populate('tracks', 'title creatorId plays coverURL audioURL')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Playlist.countDocuments();
    
    res.json({
      playlists,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error in getAllPlaylists:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create playlist (admin)
const createAdminPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, trackIds, createdBy } = req.body;
    
    // Validate required fields
    if (!name) {
      return res.status(400).json({ message: 'Playlist name is required' });
    }
    
    // Create the playlist
    const playlist = new Playlist({
      name,
      description: description || '',
      userId: createdBy || req.user._id, // Allow specifying creator or use admin
      tracks: trackIds || [],
      isPublic: isPublic !== undefined ? isPublic : true
    });
    
    const savedPlaylist = await playlist.save();
    
    // Populate the response
    await savedPlaylist.populate('userId', 'name email');
    await savedPlaylist.populate('tracks', 'title creatorId');
    
    res.status(201).json({ 
      message: 'Playlist created successfully',
      playlist: savedPlaylist
    });
  } catch (error) {
    console.error('Error in createAdminPlaylist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update playlist (admin)
const updatePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, isPublic, trackIds } = req.body;
    
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Update fields if provided
    if (name !== undefined) playlist.name = name;
    if (description !== undefined) playlist.description = description;
    if (isPublic !== undefined) playlist.isPublic = isPublic;
    if (trackIds !== undefined) playlist.tracks = trackIds;
    
    const updatedPlaylist = await playlist.save();
    
    // Populate the response
    await updatedPlaylist.populate('userId', 'name email');
    await updatedPlaylist.populate('tracks', 'title creatorId');
    
    res.json({
      message: 'Playlist updated successfully',
      playlist: updatedPlaylist
    });
  } catch (error) {
    console.error('Error in updatePlaylist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete playlist (admin)
const deletePlaylist = async (req, res) => {
  try {
    const { id } = req.params;
    
    const playlist = await Playlist.findById(id);
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    await playlist.deleteOne();
    
    // Remove playlist reference from user
    await User.updateOne(
      { _id: playlist.userId },
      { $pull: { playlists: playlist._id } }
    );
    
    res.json({ message: 'Playlist deleted successfully' });
  } catch (error) {
    console.error('Error in deletePlaylist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Search tracks for playlist creation
const searchTracks = async (req, res) => {
  try {
    const { query, genre, type, limit = 50 } = req.query;
    
    let searchQuery = {};
    
    // Add text search if query provided
    if (query) {
      searchQuery.$or = [
        { title: { $regex: query, $options: 'i' } },
        { description: { $regex: query, $options: 'i' } }
      ];
    }
    
    // Add genre filter
    if (genre && genre !== 'all') {
      searchQuery.genre = genre;
    }
    
    // Add type filter
    if (type && type !== 'all') {
      searchQuery.type = type;
    }
    
    const tracks = await Track.find(searchQuery)
      .populate('creatorId', 'name')
      .select('title creatorId genre type plays coverURL audioURL')
      .sort({ createdAt: -1, plays: -1 })
      .limit(parseInt(limit));
    
    res.json(tracks);
  } catch (error) {
    console.error('Error in searchTracks:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get recommended playlists for home page
const getRecommendedPlaylists = async (req, res) => {
  try {
    // Get popular playlists based on various criteria
    const popularPlaylists = await Playlist.find({ isPublic: true })
      .populate('userId', 'name')
      .populate({
        path: 'tracks',
        select: 'title creatorId plays coverURL audioURL',
        populate: {
          path: 'creatorId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Get genre-based playlists
    const genrePlaylists = await Playlist.aggregate([
      { $match: { isPublic: true } },
      { $lookup: {
          from: 'tracks',
          localField: 'tracks',
          foreignField: '_id',
          as: 'trackDetails'
      }},
      { $unwind: '$trackDetails' },
      { $group: {
          _id: '$trackDetails.genre',
          playlist: { $first: '$$ROOT' },
          trackCount: { $sum: 1 },
          avgPlays: { $avg: '$trackDetails.plays' }
      }},
      { $match: { trackCount: { $gte: 3 } } }, // Only playlists with 3+ tracks
      { $sort: { avgPlays: -1 } },
      { $limit: 8 }
    ]);
    
    // Get recently created playlists
    const recentPlaylists = await Playlist.find({ isPublic: true })
      .populate('userId', 'name')
      .populate('tracks', 'title creatorId plays coverURL audioURL')
      .sort({ createdAt: -1 })
      .limit(5);
    
    res.json({
      popular: popularPlaylists,
      byGenre: genrePlaylists,
      recent: recentPlaylists
    });
  } catch (error) {
    console.error('Error in getRecommendedPlaylists:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllPlaylists,
  createAdminPlaylist,
  updatePlaylist,
  deletePlaylist,
  searchTracks,
  getRecommendedPlaylists
};