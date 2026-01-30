const Playlist = require('../models/Playlist');

// Get recommended playlists for public access
const getRecommendedPlaylists = async (req, res) => {
  try {
    // Get popular public playlists
    const popularPlaylists = await Playlist.find({ 
      isPublic: true, 
      name: { $not: { $regex: /^(dox|test|mock|sample|demo)/i } } // Filter out test playlists
    })
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
    
    // Get recently created public playlists
    const recentPlaylists = await Playlist.find({ 
      isPublic: true,
      name: { $not: { $regex: /^(dox|test|mock|sample|demo)/i } } // Filter out test playlists
    })
      .populate('userId', 'name')
      .populate('tracks', 'title creatorId plays coverURL audioURL')
      .sort({ createdAt: -1 })
      .limit(5);
    
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
    
    const playlists = await Playlist.find({ 
      isPublic: true,
      name: { $not: { $regex: /^(dox|test|mock|sample|demo)/i } } // Filter out test playlists
    })
      .populate('userId', 'name')
      .populate({
        path: 'tracks',
        select: 'title creatorId plays coverURL',
        populate: {
          path: 'creatorId',
          select: 'name'
        }
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);
    
    const total = await Playlist.countDocuments({ isPublic: true });
    
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