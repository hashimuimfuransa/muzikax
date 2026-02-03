// Test script to check if the new creator endpoint works
async function testCreatorEndpoint() {
  try {
    // You'll need to replace this with a valid creator's access token
    const accessToken = 'YOUR_ACCESS_TOKEN_HERE';
    
    console.log('Testing new creator analytics endpoint...');
    
    const response = await fetch('http://localhost:5000/api/creator/analytics', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    const data = await response.json();
    console.log('Response:', data);
  } catch (error) {
    console.error('Error:', error);
  }
}

testCreatorEndpoint();