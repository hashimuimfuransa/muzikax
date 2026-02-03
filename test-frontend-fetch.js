// Test script to check if the frontend fetch works
async function testFrontendFetch() {
  try {
    console.log('Testing frontend fetch...');
    
    const response = await fetch('http://localhost:5000/api/public/creators?limit=5');
    
    if (!response.ok) {
      throw new Error(`Failed to fetch popular creators: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    console.log('Data received:', data);
    
    // This is what the frontend service does
    const creators = data.users;
    console.log('Creators extracted:', creators);
    
    console.log('Test completed successfully!');
  } catch (error) {
    console.error('Error:', error);
  }
}

testFrontendFetch();