/**
 * Helper script to create stem completion notifications
 * Called from Python stem_separator.py after processing completes
 */

const mongoose = require('mongoose');
const { createStemCompletionNotification } = require('./src/controllers/notificationController');
const Track = require('./src/models/Track');

// Load environment variables
require('dotenv').config();

async function notifyStemCompletion(trackId, hasStems) {
  try {
    console.log(`🔔 Creating stem completion notification for track ${trackId}...`);
    
    // Connect to MongoDB
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error('MONGO_URI not found in environment variables');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
    
    // Get track creator ID
    const track = await Track.findById(trackId).select('creatorId');
    if (!track) {
      throw new Error(`Track ${trackId} not found`);
    }
    
    const creatorId = track.creatorId.toString();
    console.log(`📧 Found creator: ${creatorId}`);
    
    // Create notification
    await createStemCompletionNotification(trackId, creatorId, hasStems);
    console.log('✅ Notification created successfully!');
    
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB');
    
    return { success: true };
  } catch (error) {
    console.error('❌ Error creating notification:', error.message);
    process.exit(1);
  }
}

// Parse command line arguments
const trackId = process.argv[2];
const hasStems = process.argv[3] === 'true';

if (!trackId) {
  console.error('Usage: node create_stem_notification.js <trackId> <hasStems>');
  process.exit(1);
}

console.log(`\n📬 Stem Completion Notification`);
console.log(`================================`);
console.log(`Track ID: ${trackId}`);
console.log(`Has Stems: ${hasStems}`);
console.log(`================================\n`);

notifyStemCompletion(trackId, hasStems);
