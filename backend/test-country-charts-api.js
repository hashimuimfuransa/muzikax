/**
 * Test script to verify country charts endpoint works
 * Run: node test-country-charts-api.js
 */

const axios = require('axios');

async function testCountryCharts() {
  try {
    const baseUrl = process.env.BACKEND_URL || 'http://localhost:5000';
    
    console.log(`🧪 Testing country charts endpoint for Rwanda (RW)\n`);
    console.log(`Base URL: ${baseUrl}\n`);

    // Test 1: Weekly charts
    console.log('📊 Test 1: Weekly charts');
    const weeklyResponse = await axios.get(`${baseUrl}/api/charts/RW?timeWindow=weekly&limit=10`);
    console.log(`Status: ${weeklyResponse.status}`);
    console.log(`Response size: ${JSON.stringify(weeklyResponse.data).length} bytes`);
    console.log(`Tracks returned: ${weeklyResponse.data.charts?.length || 0}`);
    
    if (weeklyResponse.data.charts && weeklyResponse.data.charts.length > 0) {
      console.log('\n✅ SUCCESS! Sample track:');
      const firstTrack = weeklyResponse.data.charts[0];
      console.log(`  Title: ${firstTrack.title}`);
      console.log(`  Country Score: ${firstTrack.countryScore}`);
      console.log(`  Country Plays: ${firstTrack.countryPlays}`);
      console.log(`  Country: ${firstTrack.country}`);
    } else {
      console.log('\n❌ No tracks returned');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 2: Daily charts
    console.log('📊 Test 2: Daily charts');
    const dailyResponse = await axios.get(`${baseUrl}/api/charts/RW?timeWindow=daily&limit=10`);
    console.log(`Status: ${dailyResponse.status}`);
    console.log(`Tracks returned: ${dailyResponse.data.charts?.length || 0}`);

    if (dailyResponse.data.charts && dailyResponse.data.charts.length > 0) {
      console.log('\n✅ Daily charts also working!');
    }

    console.log('\n' + '='.repeat(50) + '\n');

    // Test 3: Check cache status
    console.log('💾 Test 3: Cache behavior');
    console.log('Making second request (should be cached)...');
    const cachedResponse = await axios.get(`${baseUrl}/api/charts/RW?timeWindow=weekly&limit=10`);
    console.log(`Cached: ${cachedResponse.data.cached || false}`);
    console.log(`Timestamp: ${cachedResponse.data.timestamp ? new Date(cachedResponse.data.timestamp).toLocaleTimeString() : 'N/A'}`);

    console.log('\n✅ All tests complete!\n');

  } catch (error) {
    console.error('❌ Test failed:', error.message);
    if (error.response) {
      console.error(`Status: ${error.response.status}`);
      console.error(`Data: ${JSON.stringify(error.response.data)}`);
    } else if (error.request) {
      console.error('No response received - is the backend server running?');
      console.error(`Tried to connect to: ${error.config?.url || 'unknown'}`);
    }
  }
}

testCountryCharts();
