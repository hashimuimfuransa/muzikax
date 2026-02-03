// Test script to verify beat indicators and separation
async function testBeatIndicators() {
  try {
    console.log('Testing beat indicators and separation...\n');
    
    // Test 1: Check if beats are properly fetched in home page
    console.log('1. Testing beats fetching...');
    const beatsResponse = await fetch('http://localhost:5000/api/tracks?type=beat&limit=6');
    const beatsData = await beatsResponse.json();
    console.log(`✓ Found ${beatsData.tracks?.length || beatsData.length || 0} beats`);
    
    // Test 2: Check trending tracks to ensure beats are excluded
    console.log('\n2. Testing trending tracks exclusion...');
    const trendingResponse = await fetch('http://localhost:5000/api/tracks/trending?limit=20');
    const trendingData = await trendingResponse.json();
    
    const beatCountInTrending = trendingData.filter(track => track.type === 'beat').length;
    console.log(`✓ Found ${beatCountInTrending} beats in trending tracks (should be 0)`);
    
    // Test 3: Check if beats have payment type information
    console.log('\n3. Testing beat payment types...');
    if (beatsData.tracks && beatsData.tracks.length > 0) {
      const beatWithPayment = beatsData.tracks.find(track => track.paymentType);
      if (beatWithPayment) {
        console.log(`✓ Beat payment type: ${beatWithPayment.paymentType}`);
      } else {
        console.log('⚠ No beats with payment type found');
      }
    }
    
    // Test 4: Check if beats have creator WhatsApp info
    console.log('\n4. Testing beat creator info...');
    if (beatsData.tracks && beatsData.tracks.length > 0) {
      const beatWithCreator = beatsData.tracks.find(track => 
        track.creatorId && (track.creatorId.whatsappContact || track.creatorWhatsapp)
      );
      if (beatWithCreator) {
        console.log('✓ Beat creator WhatsApp info found');
      } else {
        console.log('⚠ No beats with creator WhatsApp info found');
      }
    }
    
    console.log('\n✅ Beat indicator tests completed!');
    console.log('\nExpected results:');
    console.log('- Beats should appear in dedicated "Popular Beats" section');
    console.log('- Beats should NOT appear in trending/recommendation sections');
    console.log('- Beat cards should show purple "BEAT" badge');
    console.log('- Beat cards should show payment type (FREE BEAT/PAID BEAT)');
    console.log('- Paid beats should show WhatsApp button');
    console.log('- Free beats should show Download button');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testBeatIndicators();