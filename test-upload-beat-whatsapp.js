// Test script for upload beat WhatsApp feature
const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const TEST_TOKEN = process.env.TEST_AUTH_TOKEN;

if (!TEST_TOKEN) {
  console.error('Error: TEST_AUTH_TOKEN environment variable is required');
  console.log('Please set it with a valid JWT token for testing');
  process.exit(1);
}

async function testUploadBeatWhatsAppFeature() {
  console.log('Testing upload beat WhatsApp feature...\n');
  
  try {
    // Test 1: Try to upload a beat without WhatsApp contact
    console.log('Test 1: Attempting to upload a beat without WhatsApp contact');
    try {
      const response = await axios.post(`${BASE_URL}/api/upload/track`,
        {
          title: 'Test Beat Without WhatsApp',
          description: 'Test beat without WhatsApp contact',
          genre: 'afrobeat',
          type: 'beat',
          audioURL: 'https://example.com/test-beat-no-whatsapp.mp3',
          coverURL: 'https://example.com/test-cover-no-whatsapp.jpg'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_TOKEN}`
          }
        }
      );
      
      console.log('   ❌ Unexpected success - beat upload should have been rejected');
      console.log('   Response status:', response.status);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   ✅ Correctly rejected beat upload without WhatsApp contact');
        console.log('   Error message:', error.response.data.message);
        if (error.response.data.redirectToProfile) {
          console.log('   Redirect to profile flag is set:', error.response.data.redirectToProfile);
        }
      } else {
        console.log('   ❌ Unexpected error:', error.message);
        if (error.response) {
          console.log('   Response status:', error.response.status);
          console.log('   Response data:', error.response.data);
        }
      }
    }
    
    // Test 2: Add WhatsApp contact to user profile
    console.log('\nTest 2: Adding WhatsApp contact to user profile');
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
    
    // Test 3: Try to upload a beat with WhatsApp contact
    console.log('\nTest 3: Attempting to upload a beat with WhatsApp contact');
    try {
      const response = await axios.post(`${BASE_URL}/api/upload/track`,
        {
          title: 'Test Beat With Contact',
          description: 'Test beat with WhatsApp contact',
          genre: 'afrobeat',
          type: 'beat',
          audioURL: 'https://example.com/test-beat-with-contact.mp3',
          coverURL: 'https://example.com/test-cover-with-contact.jpg'
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${TEST_TOKEN}`
          }
        }
      );
      
      console.log('   ✅ Successfully uploaded beat with WhatsApp contact');
      console.log('   Track ID:', response.data._id);
      console.log('   Track title:', response.data.title);
      console.log('   Track type:', response.data.type);
    } catch (error) {
      console.log('   ❌ Failed to upload beat with WhatsApp contact:', error.message);
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
testUploadBeatWhatsAppFeature();