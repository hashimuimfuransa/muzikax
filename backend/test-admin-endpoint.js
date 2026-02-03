// Remove the require statement since fetch is built-in in Node.js v22
async function testAdminEndpoint() {
  try {
    // Test the admin analytics endpoint
    const response = await fetch('http://localhost:5000/api/admin/analytics');
    
    if (response.ok) {
      const data = await response.json();
      console.log('Admin analytics data:', JSON.stringify(data, null, 2));
    } else {
      console.error('Failed to fetch admin analytics:', response.status, await response.text());
    }
  } catch (error) {
    console.error('Error testing admin endpoint:', error);
  }
}

// Run the test
testAdminEndpoint();