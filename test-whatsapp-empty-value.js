// Test script to verify WhatsApp contact can be set to empty value
const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const TEST_TOKEN = process.env.TEST_AUTH_TOKEN;

if (!TEST_TOKEN) {
  console.error('Error: TEST_AUTH_TOKEN environment variable is required');
  console.log('Please set it with a valid JWT token for testing');
  process.exit(1);
}

async function testEmptyWhatsappContact() {
  console.log('Testing WhatsApp contact empty value handling...\n');
  
  try {
    // First, set a WhatsApp contact value
    console.log('1. Setting WhatsApp contact to a valid value...');
    const response1 = await axios.put(`${BASE_URL}/api/profile/me`, 
      { whatsappContact: '+1234567890' },
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    
    console.log('   Response:', response1.status, response1.statusText);
    console.log('   WhatsApp contact set to:', response1.data.whatsappContact);
    
    // Then, set it to an empty string
    console.log('\n2. Setting WhatsApp contact to empty string...');
    const response2 = await axios.put(`${BASE_URL}/api/profile/me`, 
      { whatsappContact: '' },
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    
    console.log('   Response:', response2.status, response2.statusText);
    console.log('   WhatsApp contact after empty update:', response2.data.whatsappContact);
    
    // Verify it's actually empty
    if (response2.data.whatsappContact === '') {
      console.log('\n✅ SUCCESS: Empty WhatsApp contact value is handled correctly');
    } else {
      console.log('\n❌ FAILURE: Empty WhatsApp contact value was not set correctly');
      console.log('   Expected: ""');
      console.log('   Got:', `"${response2.data.whatsappContact}"`);
    }
    
    // Finally, verify with a GET request
    console.log('\n3. Verifying with GET request...');
    const response3 = await axios.get(`${BASE_URL}/api/profile/me`,
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    
    console.log('   Current WhatsApp contact from GET:', `"${response3.data.whatsappContact}"`);
    
    if (response3.data.whatsappContact === '') {
      console.log('\n✅ VERIFICATION PASSED: WhatsApp contact is correctly empty');
    } else {
      console.log('\n❌ VERIFICATION FAILED: WhatsApp contact is not empty as expected');
    }
    
  } catch (error) {
    console.error('Test failed with error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the test
testEmptyWhatsappContact();