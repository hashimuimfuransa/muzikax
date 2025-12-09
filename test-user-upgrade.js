async function testUserUpgrade() {
  try {
    // Generate a unique email for testing
    const uniqueEmail = `test-${Date.now()}@example.com`;
    console.log('Using email:', uniqueEmail);
    
    // First, register a new user
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        name: 'Test User',
        email: uniqueEmail,
        password: 'password123',
        role: 'fan'
      }),
    });

    const registerData = await registerResponse.json();
    console.log('Register response:', registerData);

    if (!registerResponse.ok) {
      console.log('Registration failed');
      return;
    }

    // Extract the access token
    const accessToken = registerData.accessToken;
    console.log('Access token:', accessToken);

    // Now try to upgrade the user to creator
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

testUserUpgrade();