/**
 * Test script for Followers & Following API endpoints
 * Tests viewing your own and other users' followers/following lists
 */

const API_BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000';

// Colors for console output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

async function testFollowEndpoints() {
  console.log(`${colors.blue}=== Testing Followers & Following API ===${colors.reset}\n`);

  // Step 1: Login as first user
  console.log('Step 1: Logging in as User 1...');
  const loginResponse1 = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test1@muzikax.com',
      password: 'password123'
    })
  });

  if (!loginResponse1.ok) {
    console.error(`${colors.red}Failed to login User 1${colors.reset}`);
    return;
  }

  const userData1 = await loginResponse1.json();
  const token1 = userData1.accessToken || userData1.token;
  const userId1 = userData1.user?._id || userData1.user?.id;
  
  console.log(`${colors.green}✓ User 1 logged in successfully${colors.reset}`);
  console.log(`  User ID: ${userId1}`);
  console.log(`  Token: ${token1.substring(0, 20)}...\n`);

  // Step 2: Login as second user
  console.log('Step 2: Logging in as User 2...');
  const loginResponse2 = await fetch(`${API_BASE_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      email: 'test2@muzikax.com',
      password: 'password123'
    })
  });

  if (!loginResponse2.ok) {
    console.error(`${colors.red}Failed to login User 2${colors.reset}`);
    return;
  }

  const userData2 = await loginResponse2.json();
  const token2 = userData2.accessToken || userData2.token;
  const userId2 = userData2.user?._id || userData2.user?.id;
  
  console.log(`${colors.green}✓ User 2 logged in successfully${colors.reset}`);
  console.log(`  User ID: ${userId2}`);
  console.log(`  Token: ${token2.substring(0, 20)}...\n`);

  // Step 3: User 2 follows User 1
  console.log('Step 3: User 2 follows User 1...');
  const followResponse = await fetch(`${API_BASE_URL}/api/users/follow/${userId1}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token2}`,
      'Content-Type': 'application/json'
    }
  });

  const followData = await followResponse.json();
  console.log(`${colors.green}✓ Follow response:${colors.reset}`, followData);

  // Step 4: Get User 1's followers (should include User 2)
  console.log('\nStep 4: Getting User 1\'s followers...');
  const followersResponse = await fetch(`${API_BASE_URL}/api/users/${userId1}/followers`, {
    headers: {
      'Authorization': `Bearer ${token1}`
    }
  });

  if (followersResponse.ok) {
    const followersData = await followersResponse.json();
    console.log(`${colors.green}✓ User 1 followers count: ${followersData.followers.length}${colors.reset}`);
    if (followersData.followers.length > 0) {
      console.log(`  Follower: ${followersData.followers[0].name} (${followersData.followers[0].email})`);
    }
  } else {
    console.error(`${colors.red}✗ Failed to get followers${colors.reset}`);
    console.error(await followersResponse.text());
  }

  // Step 5: Get User 2's following (should include User 1)
  console.log('\nStep 5: Getting User 2\'s following...');
  const followingResponse = await fetch(`${API_BASE_URL}/api/users/my-following`, {
    headers: {
      'Authorization': `Bearer ${token2}`
    }
  });

  if (followingResponse.ok) {
    const followingData = await followingResponse.json();
    console.log(`${colors.green}✓ User 2 following count: ${followingData.following.length}${colors.reset}`);
    if (followingData.following.length > 0) {
      console.log(`  Following: ${followingData.following[0].name} (${followingData.following[0].email})`);
    }
  } else {
    console.error(`${colors.red}✗ Failed to get following${colors.reset}`);
    console.error(await followingResponse.text());
  }

  // Step 6: View another user's followers/following (public access)
  console.log('\nStep 6: Testing public access to followers/following...');
  
  // User 1 can view User 2's followers
  const publicFollowersResponse = await fetch(`${API_BASE_URL}/api/users/${userId2}/followers`, {
    headers: {
      'Authorization': `Bearer ${token1}`
    }
  });

  if (publicFollowersResponse.ok) {
    const publicFollowersData = await publicFollowersResponse.json();
    console.log(`${colors.green}✓ Can view other users' followers (count: ${publicFollowersData.followers.length})${colors.reset}`);
  } else {
    console.error(`${colors.red}✗ Cannot view other users' followers${colors.reset}`);
  }

  // User 1 can view User 2's following
  const publicFollowingResponse = await fetch(`${API_BASE_URL}/api/users/${userId2}/following`, {
    headers: {
      'Authorization': `Bearer ${token1}`
    }
  });

  if (publicFollowingResponse.ok) {
    const publicFollowingData = await publicFollowingResponse.json();
    console.log(`${colors.green}✓ Can view other users' following (count: ${publicFollowingData.following.length})${colors.reset}`);
  } else {
    console.error(`${colors.red}✗ Cannot view other users' following${colors.reset}`);
  }

  // Step 7: Unfollow test
  console.log('\nStep 7: User 2 unfollows User 1...');
  const unfollowResponse = await fetch(`${API_BASE_URL}/api/users/unfollow/${userId1}`, {
    method: 'DELETE',
    headers: {
      'Authorization': `Bearer ${token2}`,
      'Content-Type': 'application/json'
    }
  });

  const unfollowData = await unfollowResponse.json();
  console.log(`${colors.green}✓ Unfollow response:${colors.reset}`, unfollowData);

  // Verify followers count decreased
  const finalFollowersResponse = await fetch(`${API_BASE_URL}/api/users/${userId1}/followers`, {
    headers: {
      'Authorization': `Bearer ${token1}`
    }
  });

  if (finalFollowersResponse.ok) {
    const finalFollowersData = await finalFollowersResponse.json();
    console.log(`${colors.green}✓ User 1 final followers count: ${finalFollowersData.followers.length}${colors.reset}`);
  }

  console.log('\n' + '='.repeat(50));
  console.log(`${colors.green}All tests completed!${colors.reset}`);
  console.log('='.repeat(50));
}

// Run the tests
testFollowEndpoints().catch(error => {
  console.error('Test execution error:', error);
});
