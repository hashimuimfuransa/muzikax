// Test script to debug user search functionality
const http = require('http');

function makeRequest(options, postData) {
  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, data }));
    });
    
    req.on('error', reject);
    
    if (postData) {
      req.write(postData);
    }
    
    req.end();
  });
}

async function testUserSearch() {
  console.log('Testing User Search Functionality...\n');
  
  try {
    // Test the user search endpoint
    console.log('1. Testing user search endpoint...');
    
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/admin/users/search?limit=10',
      method: 'GET',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      }
    };
    
    const response = await makeRequest(options);
    console.log('Response status:', response.statusCode);
    console.log('Response data:', response.data);
    
    // Parse and display users if successful
    if (response.statusCode === 200) {
      try {
        const jsonData = JSON.parse(response.data);
        console.log('\nUsers found:', jsonData.users?.length || 0);
        if (jsonData.users && jsonData.users.length > 0) {
          console.log('Sample users:');
          jsonData.users.slice(0, 3).forEach((user, index) => {
            console.log(`  ${index + 1}. ${user.name} (${user.email}) - ${user.role}`);
          });
        }
      } catch (parseError) {
        console.log('Could not parse JSON response');
      }
    }
    
  } catch (error) {
    console.error('Test failed with error:', error.message);
  }
}

// Run the test
testUserSearch();