/**
 * Migration Script: Backfill uniquePlays field
 * 
 * This script calculates unique plays for existing tracks based on PlayHistory
 * A unique play is counted once per day per unique listener (by IP or user ID)
 * 
 * Usage: node backend/migrate_unique_plays.js
 */

const mongoose = require('mongoose');
require('dotenv').config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/muzikax';

async function migrateUniquePlays() {
  try {
    // Connect to MongoDB
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    const Track = require('./src/models/Track');
    const PlayHistory = require('./src/models/PlayHistory');

    // Get all tracks
    const tracks = await Track.find({}).lean();
    console.log(`\n📊 Found ${tracks.length} tracks to process`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const track of tracks) {
      try {
        // Get all play history for this track
        const playHistoryRecords = await PlayHistory.find({
          trackId: track._id
        }).sort({ timestamp: 1 }).lean();

        if (playHistoryRecords.length === 0) {
          // No play history, keep uniquePlays at 0
          skippedCount++;
          continue;
        }

        // Group plays by date and unique identifier
        const dailyUniqueListeners = new Map();

        playHistoryRecords.forEach(record => {
          // Normalize the timestamp to start of day
          const playDate = new Date(record.timestamp);
          playDate.setHours(0, 0, 0, 0);
          const dateKey = playDate.toISOString();

          // Create unique identifier (user ID or IP)
          const uniqueId = record.userId 
            ? `user:${record.userId.toString()}` 
            : `ip:${record.ipAddress || 'unknown'}`;

          // Create composite key: date + uniqueId
          const compositeKey = `${dateKey}:${uniqueId}`;

          // Only count first occurrence per day per unique listener
          if (!dailyUniqueListeners.has(compositeKey)) {
            dailyUniqueListeners.set(compositeKey, {
              date: dateKey,
              uniqueId
            });
          }
        });

        // Count unique plays (one per unique listener per day)
        const uniquePlaysCount = dailyUniqueListeners.size;

        // Update the track with the calculated uniquePlays
        await Track.findByIdAndUpdate(track._id, {
          $set: { uniquePlays: uniquePlaysCount }
        });

        updatedCount++;
        
        if (updatedCount % 50 === 0) {
          console.log(`   Processed ${updatedCount}/${tracks.length} tracks...`);
        }

      } catch (error) {
        console.error(`❌ Error processing track ${track._id}:`, error.message);
        skippedCount++;
      }
    }

    console.log('\n✅ Migration completed!');
    console.log(`   - Tracks processed: ${updatedCount}`);
    console.log(`   - Tracks skipped (no plays): ${skippedCount}`);
    console.log(`   - Total tracks: ${tracks.length}`);

    // Verify a sample
    console.log('\n📋 Sample verification:');
    const sampleTracks = await Track.find({ uniquePlays: { $gt: 0 } })
      .select('title plays uniquePlays')
      .limit(5)
      .lean();
    
    sampleTracks.forEach(track => {
      console.log(`   "${track.title}" - Plays: ${track.plays}, Unique Plays: ${track.uniquePlays}`);
    });

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
  }
}

// Run migration
console.log('🚀 Starting unique plays migration...\n');
migrateUniquePlays();
