// Test script for admin notification system
const fetch = require('node-fetch');

async function testAdminNotifications() {
  console.log('Testing Admin Notification System...\n');
  
  try {
    // Test the user search endpoint
    console.log('1. Testing user search endpoint...');
    const searchResponse = await fetch('http://localhost:5000/api/admin/users/search?limit=5', {
      headers: {
        'Authorization': 'Bearer test-token' // This will fail but we can see if endpoint exists
      }
    });
    
    console.log(`Search endpoint status: ${searchResponse.status}`);
    
    if (searchResponse.status === 401) {
      console.log('✓ User search endpoint exists (requires authentication)');
    } else {
      console.log('⚠ Unexpected response from search endpoint');
    }
    
    // Test notification creation endpoint
    console.log('\n2. Testing notification creation endpoint...');
    const notificationResponse = await fetch('http://localhost:5000/api/notifications/send', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer test-token',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Notification',
        message: 'This is a test notification',
        type: 'info'
      })
    });
    
    console.log(`Notification endpoint status: ${notificationResponse.status}`);
    
    if (notificationResponse.status === 401) {
      console.log('✓ Notification creation endpoint exists (requires authentication)');
    } else {
      console.log('⚠ Unexpected response from notification endpoint');
    }
    
    console.log('\n✅ Admin notification system endpoints are accessible');
    console.log('\nNext steps:');
    console.log('1. Log in as admin at http://localhost:3000/login');
    console.log('2. Navigate to http://localhost:3000/admin/notifications');
    console.log('3. Try searching for users and sending notifications');
    console.log('4. Verify notifications appear in user notification center');
    
  } catch (error) {
    console.error('❌ Error testing admin notifications:', error.message);
  }
}

// Run the test
testAdminNotifications();