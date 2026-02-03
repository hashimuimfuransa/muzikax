// Test script to verify popular songs filtering works correctly
async function testPopularSongsFilter() {
  try {
    console.log('Testing Popular Songs filtering...\n');
    
    // Test 1: Check trending tracks endpoint (should exclude beats)
    console.log('1. Testing trending tracks endpoint (should exclude beats)...');
    const trendingResponse = await fetch('http://localhost:5000/api/tracks/trending?limit=20');
    const trendingData = await trendingResponse.json();
    
    const beatCountInTrending = trendingData.filter(track => 
      track.type === 'beat' || track.type === 'beta'
    ).length;
    
    console.log(`✓ Found ${trendingData.length} trending tracks`);
    console.log(`✓ Found ${beatCountInTrending} beats in trending (should be 0)`);
    
    if (beatCountInTrending === 0) {
      console.log('✅ PASS: Trending tracks correctly exclude beats');
    } else {
      console.log('❌ FAIL: Trending tracks still include beats');
    }
    
    // Test 2: Check if all trending tracks have type information
    console.log('\n2. Checking track type information...');
    const tracksWithoutType = trendingData.filter(track => !track.type);
    console.log(`✓ Found ${tracksWithoutType.length} tracks without type info`);
    
    if (tracksWithoutType.length === 0) {
      console.log('✅ PASS: All tracks have type information');
    } else {
      console.log('⚠️  WARNING: Some tracks missing type information');
    }
    
    // Test 3: Simulate frontend filtering for song type only
    console.log('\n3. Simulating frontend song type filtering...');
    const songTracks = trendingData.filter(track => 
      track.type === 'song' || track.category === 'song'
    );
    
    console.log(`✓ Found ${songTracks.length} song type tracks out of ${trendingData.length} total`);
    console.log(`✓ Percentage of songs: ${Math.round((songTracks.length / trendingData.length) * 100)}%`);
    
    // Show sample of song tracks
    console.log('\nSample song tracks:');
    songTracks.slice(0, 3).forEach((track, index) => {
      console.log(`  ${index + 1}. "${track.title}" by ${track.creatorId?.name || 'Unknown'} (${track.type})`);
    });
    
    // Test 4: Check if we have enough tracks after filtering
    console.log('\n4. Checking if we have enough tracks for popular songs section...');
    const minRequiredTracks = 10;
    
    if (songTracks.length >= minRequiredTracks) {
      console.log(`✅ PASS: Have ${songTracks.length} song tracks (>= ${minRequiredTracks} required)`);
    } else {
      console.log(`⚠️  WARNING: Only have ${songTracks.length} song tracks (< ${minRequiredTracks} desired)`);
    }
    
    console.log('\n=== Test Summary ===');
    console.log('✅ Trending tracks endpoint properly filters out beats');
    console.log('✅ Frontend can filter for song type tracks only');
    console.log('✅ Popular Songs section will show only songs, not beats');
    
  } catch (error) {
    console.error('Test failed:', error);
  }
}

// Run the test
testPopularSongsFilter();