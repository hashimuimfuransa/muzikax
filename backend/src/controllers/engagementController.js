const DailyStats = require('../models/DailyStats');
const ChartScore = require('../models/ChartScore');
const Track = require('../models/Track');
const redisCache = require('../utils/redisCache');

// Lazy load to avoid circular dependency
let broadcastChartUpdate;
const getBroadcastFunction = () => {
  if (!broadcastChartUpdate) {
    const server = require('../server');
    broadcastChartUpdate = server.broadcastChartUpdate;
  }
  return broadcastChartUpdate;
};

/**
 * Track share event with modern share API support
 * @route POST /api/engagement/share
 * @body {string} trackId - Track ID
 * @body {string} platform - Sharing platform (whatsapp, twitter, facebook, web_share, etc.)
 */
const trackShare = async (req, res) => {
  try {
    const { trackId, platform } = req.body;
    const userId = req.user?._id; // Optional user from JWT token
    
    if (!trackId) {
      return res.status(400).json({ message: 'Track ID is required' });
    }
    
    // Verify track exists
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    
    // Increment share count
    await Track.findByIdAndUpdate(trackId, {
      $inc: { shares: 1 },
      $set: { lastSharedAt: new Date() }
    });
    
    // Log to daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await DailyStats.findOneAndUpdate(
      { trackId, date: today },
      {
        $inc: { shares: 1 },
        $setOnInsert: { trackId, date: today, userId }
      },
      { upsert: true, new: true }
    );
    
    // Update chart score
    await updateChartScoreForTrack(trackId);
    
    // Broadcast real-time update
    const broadcast = getBroadcastFunction();
    if (broadcast) {
      broadcast('shares', { trackId, platform, totalShares: track.shares + 1, userId });
    }
    
    // Invalidate cache for this track's charts
    await redisCache.invalidatePattern('charts:*');
    
    res.json({
      success: true,
      message: 'Share tracked successfully',
      totalShares: track.shares + 1,
      platform,
      shareUrl: `${process.env.FRONTEND_URL || 'https://muzikax.rw'}/tracks/${trackId}`,
      sharedBy: userId ? 'authenticated_user' : 'anonymous'
    });
  } catch (error) {
    console.error('Error tracking share:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Track repost event
 * @route POST /api/engagement/repost
 * @body {string} trackId - Track ID
 */
const trackRepost = async (req, res) => {
  try {
    const { trackId } = req.body;
    
    if (!trackId) {
      return res.status(400).json({ message: 'Track ID is required' });
    }
    
    // Verify track exists
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    
    // Increment repost count
    await Track.findByIdAndUpdate(trackId, {
      $inc: { reposts: 1 }
    });
    
    // Log to daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await DailyStats.findOneAndUpdate(
      { trackId, date: today },
      {
        $inc: { reposts: 1 },
        $setOnInsert: { trackId, date: today }
      },
      { upsert: true, new: true }
    );
    
    // Update chart score
    await updateChartScoreForTrack(trackId);
    
    res.json({
      success: true,
      message: 'Repost tracked successfully',
      totalReposts: track.reposts + 1
    });
  } catch (error) {
    console.error('Error tracking repost:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Track playlist addition
 * @route POST /api/engagement/playlist
 * @body {string} trackId - Track ID
 * @body {string} playlistId - Playlist ID
 */
const trackPlaylistAdd = async (req, res) => {
  try {
    const { trackId, playlistId } = req.body;
    
    if (!trackId) {
      return res.status(400).json({ message: 'Track ID is required' });
    }
    
    if (!playlistId) {
      return res.status(400).json({ message: 'Playlist ID is required' });
    }
    
    // Verify track exists
    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ message: 'Track not found' });
    }
    
    // Increment playlist addition count
    await Track.findByIdAndUpdate(trackId, {
      $inc: { playlistAdditions: 1 }
    });
    
    // Log to daily stats
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    await DailyStats.findOneAndUpdate(
      { trackId, date: today },
      {
        $inc: { playlistAdditions: 1 },
        $setOnInsert: { trackId, date: today }
      },
      { upsert: true, new: true }
    );
    
    // Update chart score
    await updateChartScoreForTrack(trackId);
    
    res.json({
      success: true,
      message: 'Playlist addition tracked successfully',
      totalPlaylistAdditions: track.playlistAdditions + 1
    });
  } catch (error) {
    console.error('Error tracking playlist addition:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Bulk update engagement metrics
 * @route POST /api/engagement/bulk
 * @body {Array} events - Array of engagement events
 */
const bulkTrackEngagement = async (req, res) => {
  try {
    const { events } = req.body;
    
    if (!events || !Array.isArray(events)) {
      return res.status(400).json({ message: 'Events array is required' });
    }
    
    const results = {
      shares: 0,
      reposts: 0,
      playlistAdditions: 0,
      errors: []
    };
    
    for (const event of events) {
      try {
        const { type, trackId, playlistId } = event;
        
        const track = await Track.findById(trackId);
        if (!track) continue;
        
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        switch (type) {
          case 'share':
            await Track.findByIdAndUpdate(trackId, { $inc: { shares: 1 } });
            await DailyStats.findOneAndUpdate(
              { trackId, date: today },
              { $inc: { shares: 1 } },
              { upsert: true }
            );
            results.shares += 1;
            break;
            
          case 'repost':
            await Track.findByIdAndUpdate(trackId, { $inc: { reposts: 1 } });
            await DailyStats.findOneAndUpdate(
              { trackId, date: today },
              { $inc: { reposts: 1 } },
              { upsert: true }
            );
            results.reposts += 1;
            break;
            
          case 'playlist_add':
            if (playlistId) {
              await Track.findByIdAndUpdate(trackId, { $inc: { playlistAdditions: 1 } });
              await DailyStats.findOneAndUpdate(
                { trackId, date: today },
                { $inc: { playlistAdditions: 1 } },
                { upsert: true }
              );
              results.playlistAdditions += 1;
            }
            break;
        }
      } catch (error) {
        results.errors.push({ event, error: error.message });
      }
    }
    
    res.json({
      success: true,
      results,
      processed: events.length
    });
  } catch (error) {
    console.error('Error bulk tracking engagement:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Helper function to update chart score for a single track
 */
async function updateChartScoreForTrack(trackId) {
  try {
    const track = await Track.findById(trackId);
    if (!track) return;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const dailyStat = await DailyStats.findOne({ trackId, date: today });
    
    const { calculateTrackScore } = require('../services/chartService');
    const scoreData = calculateTrackScore(track, dailyStat);
    
    await ChartScore.findOneAndUpdate(
      { trackId },
      {
        $set: {
          globalScore: scoreData.totalScore,
          totalPlays: scoreData.metrics.totalPlays,
          uniqueListeners: scoreData.metrics.uniqueListeners,
          likes: scoreData.metrics.likes,
          shares: scoreData.metrics.shares,
          reposts: track.reposts,
          playlistAdditions: scoreData.metrics.playlistAdditions,
          lastUpdated: new Date()
        }
      },
      { upsert: true }
    );
  } catch (error) {
    console.error('Error updating chart score:', error);
  }
}

module.exports = {
  trackShare,
  trackRepost,
  trackPlaylistAdd,
  bulkTrackEngagement
};
