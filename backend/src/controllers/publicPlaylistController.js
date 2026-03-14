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
    
    // Filter by creator role (only show playlists from creators or admins)
    const popularPlaylists = popularPlaylistsRaw
      .filter(playlist => playlist.userId && (playlist.userId.role === 'creator' || playlist.userId.role === 'admin'))
      .slice(0, 10);
    
    // Get recently created public playlists
    const recentPlaylistsRaw = await Playlist.find({ 
      isPublic: true,
      name: { $not: { $regex: /^(dox|test|mock|sample|demo)/i } } // Filter out test playlists
    })
      .populate('userId', 'name role')
      .populate('tracks', 'title creatorId plays coverURL audioURL')
      .sort({ createdAt: -1 });

    // Filter by creator role (only show playlists from creators or admins)
    const recentPlaylists = recentPlaylistsRaw
      .filter(playlist => playlist.userId && (playlist.userId.role === 'creator' || playlist.userId.role === 'admin'))
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

    // Filter by creator role (only show playlists from creators or admins)
    const playlists = playlistsRaw
      .filter(playlist => playlist.userId && (playlist.userId.role === 'creator' || playlist.userId.role === 'admin'))
      .slice(skip, skip + limit);
    
    const total = playlistsRaw.filter(playlist => playlist.userId && (playlist.userId.role === 'creator' || playlist.userId.role === 'admin')).length;
    
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

module.exports = {
  getRecommendedPlaylists,
  getPublicPlaylists
};