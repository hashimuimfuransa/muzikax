// Comprehensive test script for WhatsApp contact functionality
const axios = require('axios');

// Configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';
const TEST_TOKEN = process.env.TEST_AUTH_TOKEN;

if (!TEST_TOKEN) {
  console.error('Error: TEST_AUTH_TOKEN environment variable is required');
  console.log('Please set it with a valid JWT token for testing');
  process.exit(1);
}

async function runComprehensiveTests() {
  console.log('Running comprehensive WhatsApp contact tests...\n');
  
  try {
    // Test 1: Set to valid value
    console.log('Test 1: Setting WhatsApp contact to valid value');
    const response1 = await axios.put(`${BASE_URL}/api/profile/me`, 
      { whatsappContact: '+1234567890' },
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    console.log('   Result:', response1.status, response1.statusText);
    console.log('   Value:', `"${response1.data.whatsappContact}"`);
    
    // Test 2: Set to empty string
    console.log('\nTest 2: Setting WhatsApp contact to empty string');
    const response2 = await axios.put(`${BASE_URL}/api/profile/me`, 
      { whatsappContact: '' },
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    console.log('   Result:', response2.status, response2.statusText);
    console.log('   Value:', `"${response2.data.whatsappContact}"`);
    
    // Test 3: Omit field entirely (should not change the value)
    console.log('\nTest 3: Omitting WhatsApp contact field (should preserve current value)');
    const response3 = await axios.put(`${BASE_URL}/api/profile/me`, 
      { name: 'Test User Updated' }, // Only update name
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    console.log('   Result:', response3.status, response3.statusText);
    console.log('   WhatsApp contact (should still be empty):', `"${response3.data.whatsappContact}"`);
    console.log('   Name updated to:', response3.data.name);
    
    // Test 4: Set to another valid value
    console.log('\nTest 4: Setting WhatsApp contact to another valid value');
    const response4 = await axios.put(`${BASE_URL}/api/profile/me`, 
      { whatsappContact: '+9876543210' },
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    console.log('   Result:', response4.status, response4.statusText);
    console.log('   Value:', `"${response4.data.whatsappContact}"`);
    
    // Test 5: Invalid type (should fail)
    console.log('\nTest 5: Attempting to set WhatsApp contact to invalid type (number)');
    try {
      const response5 = await axios.put(`${BASE_URL}/api/profile/me`, 
        { whatsappContact: 1234567890 }, // Number instead of string
        { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
      );
      console.log('   Unexpected success:', response5.status);
    } catch (error) {
      if (error.response && error.response.status === 400) {
        console.log('   Result: Correctly rejected with 400 status');
        console.log('   Error message:', error.response.data.message);
      } else {
        console.log('   Unexpected error:', error.message);
      }
    }
    
    // Final verification
    console.log('\nFinal verification: Getting current profile');
    const finalResponse = await axios.get(`${BASE_URL}/api/profile/me`,
      { headers: { Authorization: `Bearer ${TEST_TOKEN}` } }
    );
    console.log('   Final WhatsApp contact value:', `"${finalResponse.data.whatsappContact}"`);
    console.log('   Final user name:', finalResponse.data.name);
    
    console.log('\n✅ All tests completed!');
    
  } catch (error) {
    console.error('Test suite failed with error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

// Run the comprehensive tests
runComprehensiveTests();