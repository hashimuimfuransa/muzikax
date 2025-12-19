const Track = require('../models/Track');
const User = require('../models/User');
const Album = require('../models/Album');

// Search across tracks, artists, and albums
const searchAll = async (req, res) => {
  try {
    const query = req.query['q'] || '';
    const type = req.query['type'] || 'all';
    
    if (!query.trim()) {
      return res.status(400).json({ message: 'Search query is required' });
    }

    // Build search criteria
    const searchRegex = new RegExp(query.trim(), 'i'); // Case insensitive
    
    const results = {};
    
    // Search tracks if type is 'all' or 'tracks'
    if (type === 'all' || type === 'tracks') {
      const tracks = await Track.find({
        $or: [
          { title: searchRegex },
          { description: searchRegex }
        ]
      })
      .populate('creatorId', 'name avatar')
      .limit(20)
      .sort({ plays: -1, createdAt: -1 });
      
      results.tracks = tracks.map(track => ({
        id: track._id,
        title: track.title,
        artist: track.creatorId ? track.creatorId.name : 'Unknown Artist',
        album: '', // Album info would need to be added to the Track model
        plays: track.plays,
        likes: track.likes,
        coverImage: track.coverURL || '',
        duration: '', // Duration would need to be added to the Track model
        audioURL: track.audioURL
      }));
    }
    
    // Search artists/creators if type is 'all' or 'artists'
    if (type === 'all' || type === 'artists') {
      const artists = await User.default.find({
        role: 'creator',
        $or: [
          { name: searchRegex },
          { bio: searchRegex }
        ]
      })
      .select('-password')
      .limit(20)
      .sort({ followersCount: -1, createdAt: -1 });
      
      results.artists = artists.map(artist => ({
        id: artist._id,
        name: artist.name,
        type: artist.creatorType || 'artist',
        followers: artist.followersCount || 0,
        avatar: artist.avatar || '',
        verified: false // Verification status would need to be added to the User model
      }));
    }
    
    // Search albums if type is 'all' or 'albums'
    if (type === 'all' || type === 'albums') {
      const albums = await Album.default.find({
        title: searchRegex
      })
      .populate('creatorId', 'name')
      .limit(20)
      .sort({ createdAt: -1 });
      
      results.albums = albums.map(album => ({
        id: album._id,
        title: album.title,
        artist: album.creatorId ? album.creatorId.name : 'Unknown Artist',
        coverImage: album.coverURL || '',
        year: album.releaseDate ? new Date(album.releaseDate).getFullYear() : new Date().getFullYear(),
        tracks: album.tracks ? album.tracks.length : 0
      }));
    }
    
    res.json(results);
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  searchAll
};