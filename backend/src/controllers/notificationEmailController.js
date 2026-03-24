const User = require('../models/User');
const Track = require('../models/Track');
const Playlist = require('../models/Playlist');
const { 
  sendNewTrackNotification,
  sendNewPlaylistNotification,
  sendTrendingOfWeekEmail,
  sendRecommendedArtistsEmail
} = require('../services/emailService');
const chartService = require('../services/chartService');

/**
 * Send new track notification to followers
 * @param {Object} options - Notification options
 * @param {string} options.trackId - Track ID
 * @param {string} options.artistId - Artist/Creator ID
 */
const sendNewTrackEmailToFollowers = async ({ trackId, artistId }) => {
  try {
    // Get track details
    const track = await Track.findById(trackId).populate('creatorId', 'name email avatar');
    
    if (!track || !track.creatorId) {
      console.error('Track or creator not found');
      return;
    }

    // Get artist's followers
    const followers = await User.find({ 
      following: artistId,
      'emailNotifications.newTrackFromFollowing': true 
    }).select('name email');

    console.log(`Sending new track emails to ${followers.length} followers`);

    // Send emails to followers
    const emailPromises = followers.map(async (follower) => {
      // Rate limiting: Don't send more than one email per hour to the same user
      const lastSent = follower.lastEmailSent?.newTrack;
      if (lastSent && (Date.now() - lastSent.getTime()) < 3600000) {
        return;
      }

      const result = await sendNewTrackNotification({
        to: follower.email,
        userName: follower.name,
        artistName: track.creatorId.name,
        trackTitle: track.title,
        trackUrl: `https://muzikax.com/track/${trackId}`,
        coverUrl: track.coverURL
      });

      if (result.success) {
        // Update last email sent time
        await User.findByIdAndUpdate(follower._id, {
          'lastEmailSent.newTrack': new Date()
        });
      }
    });

    await Promise.allSettled(emailPromises);
    console.log(`Completed sending ${followers.length} new track notification emails`);
  } catch (error) {
    console.error('Error sending new track emails:', error);
  }
};

/**
 * Send new playlist notification to users
 * @param {Object} options - Notification options
 * @param {string} options.playlistId - Playlist ID
 */
const sendNewPlaylistEmail = async ({ playlistId }) => {
  try {
    const playlist = await Playlist.findById(playlistId)
      .populate('userId', 'name email')
      .populate('tracks', 'title');
    
    if (!playlist || !playlist.userId) {
      console.error('Playlist or creator not found');
      return;
    }

    // Only send for public playlists
    if (!playlist.isPublic) {
      return;
    }

    // Get users who should receive playlist notifications
    const recipients = await User.find({
      'emailNotifications.newPlaylist': true
    }).select('name email').limit(100); // Limit to prevent spam

    console.log(`Sending playlist emails to ${recipients.length} users`);

    const emailPromises = recipients.map(async (recipient) => {
      const lastSent = recipient.lastEmailSent?.playlist;
      if (lastSent && (Date.now() - lastSent.getTime()) < 7200000) { // 2 hours
        return;
      }

      const result = await sendNewPlaylistNotification({
        to: recipient.email,
        userName: recipient.name,
        playlistName: playlist.name,
        curatorName: playlist.userId.name,
        trackCount: playlist.tracks.length,
        playlistUrl: `https://muzikax.com/playlist/${playlistId}`,
        description: playlist.description
      });

      if (result.success) {
        await User.findByIdAndUpdate(recipient._id, {
          'lastEmailSent.playlist': new Date()
        });
      }
    });

    await Promise.allSettled(emailPromises);
    console.log(`Completed sending ${recipients.length} playlist notification emails`);
  } catch (error) {
    console.error('Error sending playlist emails:', error);
  }
};

/**
 * Send weekly trending songs email
 * Runs every Monday at 9 AM
 */
const sendWeeklyTrendingEmail = async () => {
  try {
    console.log('Starting weekly trending email job...');

    // Get trending tracks from chart service
    const trendingTracks = await chartService.getCountryCharts('US', 'weekly', 10);
    
    if (!trendingTracks || trendingTracks.length === 0) {
      console.log('No trending tracks found for this week');
      return;
    }

    // Format tracks for email
    const formattedTracks = trendingTracks.map(track => ({
      title: track.title,
      artistName: typeof track.creatorId === 'object' ? track.creatorId.name : 'Unknown Artist',
      plays: track.plays || 0,
      url: `https://muzikax.com/track/${track._id}`,
      coverUrl: track.coverURL
    }));

    // Get users who want trending emails
    const recipients = await User.find({
      'emailNotifications.trendingOfWeek': true
    }).select('name email');

    console.log(`Sending weekly trending emails to ${recipients.length} users`);

    // Calculate week label
    const now = new Date();
    const weekLabel = `Week of ${now.toLocaleDateString('en-US', { 
      month: 'long', 
      day: 'numeric', 
      year: 'numeric' 
    })}`;

    const emailPromises = recipients.map(async (recipient) => {
      const lastSent = recipient.lastEmailSent?.trending;
      if (lastSent && (Date.now() - lastSent.getTime()) < 604800000) { // 1 week
        return;
      }

      const result = await sendTrendingOfWeekEmail({
        to: recipient.email,
        userName: recipient.name,
        trendingTracks: formattedTracks,
        weekLabel
      });

      if (result.success) {
        await User.findByIdAndUpdate(recipient._id, {
          'lastEmailSent.trending': new Date()
        });
      }
    });

    await Promise.allSettled(emailPromises);
    console.log(`✅ Completed weekly trending email job. Sent to ${recipients.length} users.`);
  } catch (error) {
    console.error('Error in weekly trending email job:', error);
  }
};

/**
 * Send recommended artists email
 * Runs bi-weekly on Wednesdays at 10 AM
 */
const sendRecommendedArtistsWeeklyEmail = async () => {
  try {
    console.log('Starting recommended artists email job...');

    // Get active users who want recommendations
    const recipients = await User.find({
      'emailNotifications.recommendedArtists': true
    }).select('name email genres following recentlyPlayed').limit(500);

    console.log(`Sending recommendation emails to ${recipients.length} users`);

    const emailPromises = recipients.map(async (recipient) => {
      const lastSent = recipient.lastEmailSent?.recommendations;
      if (lastSent && (Date.now() - lastSent.getTime()) < 1209600000) { // 2 weeks
        return;
      }

      // Simple recommendation logic based on followed artists and listening history
      let reason = 'Based on your music taste';
      let recommendedArtists = [];

      // Get artists similar to what user follows or listens to
      if (recipient.following && recipient.following.length > 0) {
        const followedArtists = await User.find({
          _id: { $in: recipient.following },
          role: 'creator'
        }).select('name genre bio avatar');

        if (followedArtists.length > 0) {
          const genres = followedArtists.map(a => a.genre).filter(Boolean);
          reason = `Because you follow artists in ${genres.join(', ')}`;

          // Find similar artists (not followed yet)
          const similarArtists = await User.find({
            role: 'creator',
            genre: { $in: genres },
            _id: { $nin: recipient.following }
          })
          .select('name genre bio avatar')
          .limit(5);

          recommendedArtists = similarArtists.map(artist => ({
            name: artist.name,
            genre: artist.genre,
            bio: artist.bio,
            avatarUrl: artist.avatar,
            profileUrl: `https://muzikax.com/artist/${artist._id}`
          }));
        }
      }

      // If no recommendations from following, suggest popular artists
      if (recommendedArtists.length === 0) {
        const popularArtists = await User.find({
          role: 'creator',
          followersCount: { $gt: 100 }
        })
        .select('name genre bio avatar')
        .limit(5);

        recommendedArtists = popularArtists.map(artist => ({
          name: artist.name,
          genre: artist.genre,
          bio: artist.bio,
          avatarUrl: artist.avatar,
          profileUrl: `https://muzikax.com/artist/${artist._id}`
        }));

        reason = 'Popular artists you might like';
      }

      if (recommendedArtists.length > 0) {
        const result = await sendRecommendedArtistsEmail({
          to: recipient.email,
          userName: recipient.name,
          recommendedArtists,
          reason
        });

        if (result.success) {
          await User.findByIdAndUpdate(recipient._id, {
            'lastEmailSent.recommendations': new Date()
          });
        }
      }
    });

    await Promise.allSettled(emailPromises);
    console.log(`✅ Completed recommended artists email job.`);
  } catch (error) {
    console.error('Error in recommended artists email job:', error);
  }
};

/**
 * Trigger notification when a new track is uploaded
 * This should be called from the track upload controller
 */
const notifyNewTrackUpload = async (trackId, artistId) => {
  try {
    console.log(`Triggering new track notification for track ${trackId}`);
    
    // Send immediately but with rate limiting
    await sendNewTrackEmailToFollowers({ trackId, artistId });
  } catch (error) {
    console.error('Error notifying new track upload:', error);
  }
};

module.exports = {
  sendNewTrackEmailToFollowers,
  sendNewPlaylistEmail,
  sendWeeklyTrendingEmail,
  sendRecommendedArtistsWeeklyEmail,
  notifyNewTrackUpload
};
