const mongoose = require('mongoose');
const Track = require('./backend/src/models/Track').default;
const User = require('./backend/src/models/User').default;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/muzikax', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testFavoriteLikes() {
  try {
    // Find a test track
    const track = await Track.findOne();
    if (!track) {
      console.log('No track found');
      return;
    }
    
    console.log('Initial track likes:', track.likes);
    
    // Simulate adding a favorite
    track.likes = (track.likes || 0) + 1;
    await track.save();
    
    console.log('Updated track likes:', track.likes);
    
    // Verify the update
    const updatedTrack = await Track.findById(track._id);
    console.log('Verified track likes:', updatedTrack.likes);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testFavoriteLikes();