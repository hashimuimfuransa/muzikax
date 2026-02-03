/**
 * Script to clean up tracks with invalid audio URLs from the database
 * This will check all tracks and remove those with inaccessible or invalid audio files
 */

const mongoose = require('mongoose');
const dotenv = require('dotenv');

// Load environment variables
dotenv.config();

// Import models
const Track = require('./src/models/Track');

// MongoDB connection
const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI || process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error('Database connection error:', error);
    process.exit(1);
  }
};

/**
 * Validate if an audio URL is accessible
 * @param {string} audioUrl - The audio URL to validate
 * @returns {Promise<boolean>} - True if valid, false if invalid
 */
const validateAudioUrl = async (audioUrl) => {
  if (!audioUrl) {
    return false;
  }

  try {
    // For HTTP/HTTPS URLs, make a HEAD request to check accessibility
    if (audioUrl.startsWith('http')) {
      // Simple validation - check if URL has proper format
      const urlPattern = /^https?:\/\/.+$/;
      if (!urlPattern.test(audioUrl)) {
        return false;
      }
      
      // For external URLs, make a HEAD request to verify accessibility
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 second timeout
        
        const response = await fetch(audioUrl, { 
          method: 'HEAD', 
          signal: controller.signal,
          headers: {
            'Accept': 'audio/*',
          }
        });
        clearTimeout(timeoutId);
        
        // Check if the response is successful and indicates a media file
        return response.ok;
      } catch (fetchError) {
        console.warn(`Warning: Could not validate audio URL ${audioUrl}:`, fetchError.message);
        // If we can't validate, assume it's valid to be safe
        return true;
      }
    } else {
      // For local/relative paths, check if they have reasonable length
      return audioUrl.length > 0 && audioUrl.length < 500; // Reasonable length check
    }
  } catch (error) {
    console.error(`Error validating URL ${audioUrl}:`, error.message);
    return false;
  }
};

/**
 * Clean up tracks with invalid audio URLs
 */
const cleanupInvalidTracks = async () => {
  try {
    console.log('Starting cleanup of invalid tracks...');
    
    // Get all tracks
    const tracks = await Track.find({});
    console.log(`Found ${tracks.length} tracks to check`);
    
    let invalidCount = 0;
    const invalidTracks = [];
    
    // Check each track
    for (const track of tracks) {
      const isValid = await validateAudioUrl(track.audioURL);
      
      if (!isValid) {
        invalidCount++;
        invalidTracks.push({
          id: track._id,
          title: track.title,
          audioURL: track.audioURL,
          creatorId: track.creatorId
        });
        
        console.log(`Invalid track found: ${track.title} (${track._id})`);
      }
    }
    
    console.log(`\nCleanup Summary:`);
    console.log(`Total tracks checked: ${tracks.length}`);
    console.log(`Invalid tracks found: ${invalidCount}`);
    
    if (invalidTracks.length > 0) {
      console.log('\nInvalid tracks:');
      invalidTracks.forEach(track => {
        console.log(`- ${track.title} (${track.id}) - URL: ${track.audioURL}`);
      });
      
      // Ask for confirmation before deletion
      console.log('\nWould you like to delete these invalid tracks? (y/N)');
      
      // For automated runs, you can set DELETE_INVALID_TRACKS=true in env
      if (process.env.DELETE_INVALID_TRACKS === 'true') {
        console.log('Deleting invalid tracks automatically...');
        const deleteResults = await Track.deleteMany({
          _id: { $in: invalidTracks.map(t => t.id) }
        });
        console.log(`Deleted ${deleteResults.deletedCount} invalid tracks`);
      } else {
        console.log('Skipping deletion. Set DELETE_INVALID_TRACKS=true to auto-delete.');
      }
    } else {
      console.log('No invalid tracks found!');
    }
    
  } catch (error) {
    console.error('Error during cleanup:', error);
  }
};

/**
 * Real-time validation when audio playback fails
 * This can be called from the audio player error handler
 */
const handlePlaybackError = async (trackId) => {
  try {
    console.log(`Handling playback error for track: ${trackId}`);
    
    // Find the track
    const track = await Track.findById(trackId);
    if (!track) {
      console.log(`Track ${trackId} not found`);
      return;
    }
    
    // Mark as potentially invalid
    const isValid = await validateAudioUrl(track.audioURL);
    
    // For playback errors, we should be more aggressive in removing tracks
    // even if the URL looks valid but causes playback errors
    if (!isValid) {
      console.log(`Track ${track.title} has invalid audio URL. Removing from database.`);
      
      // Delete the track
      await Track.findByIdAndDelete(trackId);
      console.log(`Successfully removed invalid track: ${track.title}`);
      
      return {
        success: true,
        message: 'Invalid track removed from database',
        trackTitle: track.title
      };
    } else {
      // Since user specifically requested to remove tracks with invalid players,
      // we'll remove tracks that cause playback errors even if URL appears valid
      console.log(`Removing track ${track.title} due to playback error despite valid URL.`);
      await Track.findByIdAndDelete(trackId);
      console.log(`Successfully removed track with playback error: ${track.title}`);
      
      return {
        success: true,
        message: 'Track removed due to playback error',
        trackTitle: track.title
      };
    }
  } catch (error) {
    console.error(`Error handling playback error for track ${trackId}:`, error);
    return {
      success: false,
      error: error.message
    };
  }
};

// Run cleanup if script is called directly
if (require.main === module) {
  const run = async () => {
    await connectDB();
    await cleanupInvalidTracks();
    process.exit(0);
  };
  
  run().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
}

module.exports = {
  cleanupInvalidTracks,
  handlePlaybackError,
  validateAudioUrl
};