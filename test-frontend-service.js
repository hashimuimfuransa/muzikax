// Test script to check if the frontend service function works
async function testFrontendService() {
  try {
    // Mock the environment variable
    process.env.NEXT_PUBLIC_API_URL = 'http://localhost:5000';
    
    // Import the service function
    const { fetchPopularCreators } = require('./frontend/src/services/trackService.ts');
    
    console.log('Testing frontend service function...');
    
    const creators = await fetchPopularCreators(5);
    console.log('Creators fetched successfully:', creators);
  } catch (error) {
    console.error('Error:', error);
  }
}

testFrontendService();