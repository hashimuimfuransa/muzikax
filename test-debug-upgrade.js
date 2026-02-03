async function debugUserUpgrade() {
  try {
    console.log('Starting debug test...');
    
    // First, try to login with an existing user
    console.log('Attempting to login...');
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: 'test@example.com',
        password: 'password123'
      }),
    });

    const loginData = await loginResponse.json();
    console.log('Login response status:', loginResponse.status);
    console.log('Login response:', loginData);

    if (!loginResponse.ok) {
      console.log('Login failed');
      return;
    }

    // Extract the access token
    const accessToken = loginData.accessToken;
    console.log('Access token:', accessToken);
    console.log('Token length:', accessToken ? accessToken.length : 'No token');

    // Now try to upgrade the user to creator
    console.log('Attempting to upgrade user to creator...');
    const upgradeResponse = await fetch('http://localhost:5000/api/users/upgrade-to-creator', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${accessToken}`
      },
      body: JSON.stringify({
        creatorType: 'artist'
      }),
    });

    const upgradeData = await upgradeResponse.json();
    console.log('Upgrade response status:', upgradeResponse.status);
    console.log('Upgrade response:', upgradeData);

    if (upgradeResponse.ok) {
      console.log('User upgrade successful!');
    } else {
      console.log('User upgrade failed:', upgradeData.message);
    }
  } catch (error) {
    console.error('Test error:', error);
  }
}

debugUserUpgrade();