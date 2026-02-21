const fetch = require('node-fetch');

async function testMonthlyTracks() {
  try {
    console.log('Testing monthly popular tracks endpoint...');
    
    const response = await fetch('http://localhost:5000/api/tracks/monthly-popular?limit=10');
    
    console.log('Response status:', response.status);
    console.log('Response headers:', response.headers.raw());
    
    if (!response.ok) {
      const errorText = await response.text();
      console.error('Error response:', errorText);
      return;
    }
    
    const data = await response.json();
    console.log('Number of tracks returned:', data.length);
    
    if (data.length > 0) {
      console.log('\nFirst track details:');
      console.log('Title:', data[0].title);
      console.log('Artist:', data[0].creatorId?.name || 'Unknown');
      console.log('Monthly Plays:', data[0].monthlyPlays);
      console.log('Overall Plays:', data[0].plays);
      console.log('Score:', data[0].score);
      console.log('Days Old:', data[0].daysOld);
      console.log('Created At:', data[0].createdAt);
    }
    
    console.log('\nAll tracks:');
    data.forEach((track, index) => {
      console.log(`${index + 1}. ${track.title} by ${track.creatorId?.name || 'Unknown'} - Score: ${track.score}, Monthly: ${track.monthlyPlays}, Total: ${track.plays}`);
    });
    
  } catch (error) {
    console.error('Test failed:', error.message);
  }
}

testMonthlyTracks();