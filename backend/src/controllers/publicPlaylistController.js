const Playlist = require('../models/Playlist');

// Get recommended playlists for public access
const getRecommendedPlaylists = async (req, res) => {
  try {
    // Get popular public playlists
    const popularPlaylistsRaw = await Playlist.find({ 
      isPublic: true, 
      name: { $not: { $regex: /^(dox|test|mock|sample|demo)/i } } // Filter out test playlists
    })
      .populate('userId', 'name role')
      .populate({
        path: 'tracks',
        select: 'title creatorId plays coverURL audioURL',
        populate: {
          path: 'creatorId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });
    
    // Sort to prioritize MuzikaX (admin) playlists first, then by total plays/recent
    const popularPlaylists = popularPlaylistsRaw
      .filter(playlist => playlist.userId) // Ensure userId exists
      .map(playlist => {
        const playlistObj = playlist.toObject();
        // Calculate total plays for sorting
        playlistObj.totalPlays = (playlistObj.tracks || []).reduce((sum, track) => sum + (track.plays || 0), 0);
        
        if (playlistObj.userId && playlistObj.userId.role === 'admin') {
          playlistObj.userId.name = 'MuzikaX';
        }
        return playlistObj;
      })
      .sort((a, b) => {
        // Prioritize admins (MuzikaX)
        const isAdminA = a.userId?.role === 'admin';
        const isAdminB = b.userId?.role === 'admin';
        if (isAdminA && !isAdminB) return -1;
        if (!isAdminA && isAdminB) return 1;
        
        // Then by total plays
        return (b.totalPlays || 0) - (a.totalPlays || 0);
      })
      .slice(0, 10);
    
    // Get recently created public playlists
    const recentPlaylistsRaw = await Playlist.find({ 
      isPublic: true,
      name: { $not: { $regex: /^(dox|test|mock|sample|demo)/i } } // Filter out test playlists
    })
      .populate('userId', 'name role')
      .populate('tracks', 'title creatorId plays coverURL audioURL')
      .sort({ createdAt: -1 });

    // Include fan playlists in recent as well, prioritizing admin
    const recentPlaylists = recentPlaylistsRaw
      .filter(playlist => playlist.userId)
      .map(playlist => {
        const playlistObj = playlist.toObject();
        if (playlistObj.userId && playlistObj.userId.role === 'admin') {
          playlistObj.userId.name = 'MuzikaX';
        }
        return playlistObj;
      })
      .sort((a, b) => {
        const isAdminA = a.userId?.role === 'admin';
        const isAdminB = b.userId?.role === 'admin';
        if (isAdminA && !isAdminB) return -1;
        if (!isAdminA && isAdminB) return 1;
        return 0; // Keep original sort (recent) for the rest
      })
      .slice(0, 5);
    
    res.json({
      popular: popularPlaylists,
      recent: recentPlaylists
    });
  } catch (error) {
    console.error('Error in getRecommendedPlaylists:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all public playlists (for browse page)
const getPublicPlaylists = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    const playlistsRaw = await Playlist.find({ 
      isPublic: true,
      name: { $not: { $regex: /^(dox|test|mock|sample|demo)/i } } // Filter out test playlists
    })
      .populate('userId', 'name role')
      .populate({
        path: 'tracks',
        select: 'title creatorId plays coverURL',
        populate: {
          path: 'creatorId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 });

    // Include fan playlists, prioritizing admins
    const playlists = playlistsRaw
      .filter(playlist => playlist.userId)
      .map(playlist => {
        const playlistObj = playlist.toObject();
        if (playlistObj.userId && playlistObj.userId.role === 'admin') {
          playlistObj.userId.name = 'MuzikaX';
        }
        return playlistObj;
      })
      .sort((a, b) => {
        const isAdminA = a.userId?.role === 'admin';
        const isAdminB = b.userId?.role === 'admin';
        if (isAdminA && !isAdminB) return -1;
        if (!isAdminA && isAdminB) return 1;
        return 0; // Keep original sort (recent) for the rest
      })
      .slice(skip, skip + limit);
    
    const total = playlistsRaw.filter(playlist => playlist.userId).length;
    
    res.json({
      playlists,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error) {
    console.error('Error in getPublicPlaylists:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get a single public playlist by ID
const getPublicPlaylistById = async (req, res) => {
  try {
    const { id } = req.params;
    
    const playlist = await Playlist.findById(id)
      .populate('userId', 'name role')
      .populate({
        path: 'tracks',
        select: 'title creatorId plays coverURL audioURL duration likes',
        populate: {
          path: 'creatorId',
          select: 'name'
        }
      });
    
    if (!playlist) {
      return res.status(404).json({ message: 'Playlist not found' });
    }
    
    // Only allow access to public playlists
    if (!playlist.isPublic) {
      return res.status(403).json({ message: 'This playlist is not public' });
    }
    
    const playlistObj = playlist.toObject();
    
    // Rename admin user to MuzikaX
    if (playlistObj.userId && playlistObj.userId.role === 'admin') {
      playlistObj.userId.name = 'MuzikaX';
    }
    
    res.json({ playlist: playlistObj });
  } catch (error) {
    console.error('Error in getPublicPlaylistById:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getRecommendedPlaylists,
  getPublicPlaylists,
  getPublicPlaylistById
};