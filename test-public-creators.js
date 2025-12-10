// Test script to check if the public creators endpoint works
async function testPublicCreatorsEndpoint() {
  try {
    console.log('Testing public creators endpoint...');
    
    const response = await fetch('http://localhost:5000/api/public/creators?limit=5', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log('Status:', response.status);
    console.log('Status Text:', response.statusText);
    
    if (response.ok) {
      const data = await response.json();
      console.log('Response:', JSON.stringify(data, null, 2));
    } else {
      console.log('Error response text:', await response.text());
    }
  } catch (error) {
    console.error('Error:', error);
  }
}

testPublicCreatorsEndpoint();