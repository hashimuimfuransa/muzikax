const axios = require('axios');

// Test configuration
const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

// Sample test data
const sampleUserData = {
  email: 'testuser@example.com',
  password: 'testpassword123'
};

const samplePostData = {
  content: 'This is a test community post!',
  postType: 'text',
  language: 'en',
  tags: ['test', 'community', 'muzikax']
};

async function testCommunityAPI() {
  console.log('🧪 Starting Community API Tests...\n');

  let token = null;

  try {
    // Step 1: Login to get token
    console.log('🔐 Attempting to login with test user...');
    try {
      const loginResponse = await axios.post(`${BASE_URL}/auth/login`, {
        email: process.env.TEST_USER_EMAIL || sampleUserData.email,
        password: process.env.TEST_USER_PASSWORD || sampleUserData.password
      });
      
      token = loginResponse.data.token;
      console.log('✅ Login successful, token obtained\n');
    } catch (error) {
      console.log('❌ Login failed. Please ensure test user exists and environment variables are set.\n');
      console.log('💡 Hint: Set TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables\n');
      return;
    }

    // Step 2: Test getting community posts
    console.log('📚 Testing GET /community/posts...');
    try {
      const postsResponse = await axios.get(`${BASE_URL}/community/posts`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Successfully fetched ${postsResponse.data.posts?.length || 0} posts\n`);
    } catch (error) {
      console.log('❌ Failed to fetch posts:', error.response?.data?.message || error.message, '\n');
    }

    // Step 3: Test creating a community post
    console.log('📝 Testing POST /community/posts...');
    try {
      const createResponse = await axios.post(`${BASE_URL}/community/posts`, samplePostData, {
        headers: { 
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      console.log('✅ Successfully created post:', createResponse.data.post.id, '\n');
      
      const postId = createResponse.data.post.id;

      // Step 4: Test liking the post
      console.log('❤️ Testing POST /community/posts/:id/like...');
      try {
        const likeResponse = await axios.post(`${BASE_URL}/community/posts/${postId}/like`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log('✅ Successfully liked post\n');
      } catch (error) {
        console.log('❌ Failed to like post:', error.response?.data?.message || error.message, '\n');
      }

      // Step 5: Test getting trending posts
      console.log('🔥 Testing GET /community/posts/trending...');
      try {
        const trendingResponse = await axios.get(`${BASE_URL}/community/posts/trending`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        console.log(`✅ Successfully fetched ${trendingResponse.data.posts?.length || 0} trending posts\n`);
      } catch (error) {
        console.log('❌ Failed to fetch trending posts:', error.response?.data?.message || error.message, '\n');
      }

    } catch (error) {
      console.log('❌ Failed to create post:', error.response?.data?.message || error.message, '\n');
    }

    // Step 6: Test getting circles
    console.log('👥 Testing GET /community/circles...');
    try {
      const circlesResponse = await axios.get(`${BASE_URL}/community/circles`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Successfully fetched ${circlesResponse.data.circles?.length || 0} circles\n`);
    } catch (error) {
      console.log('❌ Failed to fetch circles:', error.response?.data?.message || error.message, '\n');
    }

    // Step 7: Test getting challenges
    console.log('🏆 Testing GET /community/challenges...');
    try {
      const challengesResponse = await axios.get(`${BASE_URL}/community/challenges`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Successfully fetched ${challengesResponse.data.challenges?.length || 0} challenges\n`);
    } catch (error) {
      console.log('❌ Failed to fetch challenges:', error.response?.data?.message || error.message, '\n');
    }

    // Step 8: Test getting live rooms
    console.log('🎤 Testing GET /community/liverooms...');
    try {
      const liveRoomsResponse = await axios.get(`${BASE_URL}/community/liverooms`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log(`✅ Successfully fetched ${liveRoomsResponse.data.liveRooms?.length || 0} live rooms\n`);
    } catch (error) {
      console.log('❌ Failed to fetch live rooms:', error.response?.data?.message || error.message, '\n');
    }

    console.log('🎉 Community API tests completed successfully!');

  } catch (error) {
    console.error('💥 Unexpected error during tests:', error.message);
  }
}

// Run the tests
testCommunityAPI();