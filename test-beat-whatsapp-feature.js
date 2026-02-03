// Test script for beat WhatsApp feature
const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const TEST_TOKEN = process.env.TEST_AUTH_TOKEN;
const TEST_CREATOR_ID = process.env.TEST_CREATOR_ID;

if (!TEST_TOKEN) {
  console.error('Error: TEST_AUTH_TOKEN environment variable is required');
  console.log('Please set it with a valid JWT token for testing');
  process.exit(1);
}

if (!TEST_CREATOR_ID) {
  console.error('Error: TEST_CREATOR_ID environment variable is required');
  console.log('Please set it with a valid creator user ID for testing');
  process.exit(1);
}

async function testBeatWhatsAppFeature() {
  console.log('Testing beat WhatsApp feature...\n');
  
  try {
    // Test 1: Add WhatsApp contact to user profile
    console.log('Test 1: Adding WhatsApp contact to user profile');
    try {
      const response = await axios.put(`${BASE_URL}/api/profile/me`,
        {
          whatsappContact: '+1234567890'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_TOKEN}`
          }
        }
      );
      
      console.log('   ✅ Successfully updated WhatsApp contact');
      console.log('   New WhatsApp contact:', response.data.whatsappContact);
    } catch (error) {
      console.log('   ❌ Failed to update WhatsApp contact:', error.message);
      if (error.response) {
        console.log('   Response status:', error.response.status);
        console.log('   Response data:', error.response.data);
      }
      return;
    }
    
    // Test 2: Upload a beat track
    console.log('\nTest 2: Uploading a beat track');
    let beatTrackId = null;
    try {
      const response = await axios.post(`${BASE_URL}/api/upload/track`,
        {
          title: 'Test Beat With WhatsApp',
          description: 'Test beat with WhatsApp contact',
          genre: 'afrobeat',
          type: 'beat',
          audioURL: 'https://example.com/test-beat-whatsapp.mp3',
          coverURL: 'https://example.com/test-cover-whatsapp.jpg'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_TOKEN}`
          }
        }
      );
      
      console.log('   ✅ Successfully uploaded beat track');
      console.log('   Track ID:', response.data._id);
      console.log('   Track title:', response.data.title);
      console.log('   Track type:', response.data.type);
      beatTrackId = response.data._id;
    } catch (error) {
      console.log('   ❌ Failed to upload beat track:', error.message);
      if (error.response) {
        console.log('   Response status:', error.response.status);
        console.log('   Response data:', error.response.data);
      }
      return;
    }
    
    // Test 3: Fetch the beat track and verify WhatsApp contact is included
    console.log('\nTest 3: Fetching beat track to verify WhatsApp contact');
    try {
      const response = await axios.get(`${BASE_URL}/api/tracks/${beatTrackId}`);
      
      console.log('   ✅ Successfully fetched beat track');
      console.log('   Track ID:', response.data._id);
      console.log('   Track title:', response.data.title);
      console.log('   Track type:', response.data.type);
      
      // Check if creator information is populated
      if (response.data.creatorId) {
        console.log('   Creator name:', response.data.creatorId.name);
        console.log('   Creator WhatsApp:', response.data.creatorId.whatsappContact || 'Not provided');
      } else {
        console.log('   ❌ Creator information not populated');
      }
    } catch (error) {
      console.log('   ❌ Failed to fetch beat track:', error.message);
      if (error.response) {
        console.log('   Response status:', error.response.status);
        console.log('   Response data:', error.response.data);
      }
    }
    
    // Test 4: Fetch trending tracks and verify WhatsApp contact is included
    console.log('\nTest 4: Fetching trending tracks to verify WhatsApp contact');
    try {
      const response = await axios.get(`${BASE_URL}/api/tracks/trending?limit=5`);
      
      console.log('   ✅ Successfully fetched trending tracks');
      console.log('   Number of tracks:', response.data.length);
      
      // Check if any tracks have creator information with WhatsApp contact
      const beatTracks = response.data.filter(track => track.type === 'beat');
      console.log('   Number of beat tracks:', beatTracks.length);
      
      if (beatTracks.length > 0) {
        const track = beatTracks[0];
        console.log('   Sample beat track title:', track.title);
        if (track.creatorId) {
          console.log('   Creator name:', track.creatorId.name);
          console.log('   Creator WhatsApp:', track.creatorId.whatsappContact || 'Not provided');
        } else {
          console.log('   ❌ Creator information not populated for beat track');
        }
      }
    } catch (error) {
      console.log('   ❌ Failed to fetch trending tracks:', error.message);
      if (error.response) {
        console.log('   Response status:', error.response.status);
        console.log('   Response data:', error.response.data);
      }
    }
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('Test suite failed with error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the tests
testBeatWhatsAppFeature();