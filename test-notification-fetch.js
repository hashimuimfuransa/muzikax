const fetch = require('node-fetch');

async function testNotificationFetch() {
  console.log('Testing notification fetch...\n');
  
  try {
    // First, let's login to get a token
    console.log('1. Logging in to get access token...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'testpassword123'
      })
    });
    
    if (!loginResponse.ok) {
      console.log('Login failed, trying to create test user...');
      
      // Create a test user
      const signupResponse = await fetch('http://localhost:5000/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: 'Test User',
          email: 'test@example.com',
          password: 'testpassword123',
          role: 'fan'
        })
      });
      
      if (!signupResponse.ok) {
        console.error('Failed to create test user:', await signupResponse.text());
        return;
      }
      
      console.log('Test user created successfully');
      
      // Login again
      const loginResponse2 = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          email: 'test@example.com',
          password: 'testpassword123'
        })
      });
      
      if (!loginResponse2.ok) {
        console.error('Login failed after user creation:', await loginResponse2.text());
        return;
      }
      
      const loginData = await loginResponse2.json();
      var token = loginData.accessToken;
    } else {
      const loginData = await loginResponse.json();
      var token = loginData.accessToken;
    }
    
    console.log('Login successful, token received');
    
    // Test fetching notifications
    console.log('\n2. Testing notification fetch...');
    const notificationResponse = await fetch('http://localhost:5000/api/notifications', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`Notification endpoint status: ${notificationResponse.status}`);
    
    if (notificationResponse.ok) {
      const notifications = await notificationResponse.json();
      console.log('Notifications fetched successfully:');
      console.log(`Total notifications: ${notifications.total}`);
      console.log(`Current page: ${notifications.currentPage}`);
      console.log(`Total pages: ${notifications.totalPages}`);
      console.log('Notifications:', notifications.notifications);
    } else {
      const errorText = await notificationResponse.text();
      console.error('Failed to fetch notifications:', errorText);
    }
    
    // Test creating an admin notification
    console.log('\n3. Testing admin notification creation...');
    
    // First, we need to get an admin token
    // For now, let's just test if the endpoint exists
    const adminNotificationResponse = await fetch('http://localhost:5000/api/notifications/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        title: 'Test Admin Notification',
        message: 'This is a test notification from admin',
        type: 'info'
      })
    });
    
    console.log(`Admin notification endpoint status: ${adminNotificationResponse.status}`);
    
    if (adminNotificationResponse.status === 403) {
      console.log('✓ Admin notification endpoint exists but requires admin privileges');
    } else if (adminNotificationResponse.status === 401) {
      console.log('✓ Admin notification endpoint exists but requires authentication');
    } else {
      const responseText = await adminNotificationResponse.text();
      console.log('Admin notification response:', responseText);
    }
    
  } catch (error) {
    console.error('Error during test:', error.message);
  }
}

testNotificationFetch();