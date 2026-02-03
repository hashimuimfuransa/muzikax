// Test script to verify like functionality across different views
console.log('Testing like functionality across different views...');

// Simulate adding a track to favorites
const simulateLike = (trackId, trackTitle) => {
  console.log(`Liking track: ${trackTitle} (ID: ${trackId})`);
  
  // Dispatch the trackUpdated event as the AudioPlayerContext would
  const event = new CustomEvent('trackUpdated', {
    detail: {
      trackId: trackId,
      likes: 42, // Updated like count
      isFavorite: true
    }
  });
  
  window.dispatchEvent(event);
  console.log(`Dispatched trackUpdated event for ${trackTitle}`);
};

// Simulate removing a track from favorites
const simulateUnlike = (trackId, trackTitle) => {
  console.log(`Unliking track: ${trackTitle} (ID: ${trackId})`);
  
  // Dispatch the trackUpdated event as the AudioPlayerContext would
  const event = new CustomEvent('trackUpdated', {
    detail: {
      trackId: trackId,
      likes: 40, // Updated like count
      isFavorite: false
    }
  });
  
  window.dispatchEvent(event);
  console.log(`Dispatched trackUpdated event for ${trackTitle}`);
};

// Test with sample data
simulateLike('track-001', 'Sample Track 1');
simulateUnlike('track-001', 'Sample Track 1');

console.log('Test completed.');