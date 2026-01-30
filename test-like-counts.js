const mongoose = require('mongoose');
const Track = require('./backend/src/models/Track').default;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/muzikax', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testLikeCounts() {
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
    
    // Simulate removing a favorite
    updatedTrack.likes = Math.max(0, (updatedTrack.likes || 0) - 1);
    await updatedTrack.save();
    
    console.log('After removal track likes:', updatedTrack.likes);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testLikeCounts();