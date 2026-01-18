// Simple API test to check track data structure
async function testTrackData() {
  try {
    const response = await fetch('http://localhost:5000/api/tracks/type?type=beat&limit=10');
    
    if (!response.ok) {
      console.error('Failed to fetch tracks:', response.status, response.statusText);
      return;
    }
    
    const data = await response.json();
    console.log('=== TRACK DATA STRUCTURE TEST ===');
    console.log('Response type:', typeof data);
    console.log('Data length:', Array.isArray(data) ? data.length : 'Not an array');
    
    if (Array.isArray(data) && data.length > 0) {
      console.log('\nFirst track structure:');
      console.log(JSON.stringify(data[0], null, 2));
      
      console.log('\nPayment type values:');
      data.forEach((track, index) => {
        console.log(`${index + 1}. ${track.title}: paymentType = ${track.paymentType || 'UNDEFINED'}`);
      });
      
      const freeTracks = data.filter(t => t.paymentType === 'free');
      const paidTracks = data.filter(t => t.paymentType === 'paid');
      const noTypeTracks = data.filter(t => !t.paymentType);
      
      console.log('\n=== SUMMARY ===');
      console.log(`Total tracks: ${data.length}`);
      console.log(`Free tracks: ${freeTracks.length}`);
      console.log(`Paid tracks: ${paidTracks.length}`);
      console.log(`No type tracks: ${noTypeTracks.length}`);
    } else {
      console.log('No tracks found or invalid response format');
    }
  } catch (error) {
    console.error('API test failed:', error);
  }
}

// Run the test
testTrackData();