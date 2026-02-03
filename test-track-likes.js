// Test script to verify track likes functionality
const mongoose = require('mongoose');
const Track = require('./backend/src/models/Track').default;
const User = require('./backend/src/models/User').default;

// MongoDB connection
mongoose.connect('mongodb://localhost:27017/muzikax', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

async function testTrackLikes() {
  try {
    // Find a test track and user
    const track = await Track.findOne();
    const user = await User.findOne();
    
    if (!track || !user) {
      console.log('No track or user found');
      return;
    }
    
    console.log('Initial track likes:', track.likes);
    console.log('User favorites before:', user.favorites.length);
    
    // Simulate adding to favorites (like)
    if (!user.favorites.includes(track._id)) {
      user.favorites.push(track._id);
      await user.save();
      
      // Increment the track's likes count
      track.likes = (track.likes || 0) + 1;
      await track.save();
    }
    
    console.log('Track likes after adding to favorites:', track.likes);
    console.log('User favorites after:', user.favorites.length);
    
    // Verify the update
    const updatedTrack = await Track.findById(track._id);
    const updatedUser = await User.findById(user._id);
    
    console.log('Verified track likes:', updatedTrack.likes);
    console.log('Verified user favorites:', updatedUser.favorites.length);
    
    // Simulate removing from favorites (unlike)
    const favoriteIndex = updatedUser.favorites.indexOf(track._id);
    if (favoriteIndex !== -1) {
      // Remove track from favorites
      updatedUser.favorites.splice(favoriteIndex, 1);
      await updatedUser.save();
      
      // Decrement the track's likes count (but not below 0)
      updatedTrack.likes = Math.max(0, (updatedTrack.likes || 0) - 1);
      await updatedTrack.save();
    }
    
    console.log('Final track likes:', updatedTrack.likes);
    console.log('Final user favorites:', updatedUser.favorites.length);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testTrackLikes();