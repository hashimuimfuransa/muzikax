const axios = require('axios');

// Test script to verify post interactions (like, comment, share)
async function testPostInteractions() {
  try {
    const baseURL = 'http://localhost:5000';
    
    // First, let's login to get a token
    console.log('Logging in...');
    const loginResponse = await axios.post(`${baseURL}/api/auth/login`, {
      email: 'test@example.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('Login successful. Token received.');
    
    // Create a new post
    console.log('Creating a new post...');
    const createPostResponse = await axios.post(
      `${baseURL}/api/posts`,
      { content: 'This is a test post for interaction testing.' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    const postId = createPostResponse.data.post.id;
    console.log('Post created successfully with ID:', postId);
    
    // Like the post
    console.log('Liking the post...');
    const likeResponse = await axios.post(
      `${baseURL}/api/posts/${postId}/like`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Like response:', likeResponse.data);
    
    // Add a comment to the post
    console.log('Adding a comment to the post...');
    const commentResponse = await axios.post(
      `${baseURL}/api/posts/${postId}/comment`,
      { comment: 'This is a test comment.' },
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Comment response:', commentResponse.data);
    
    // Share the post
    console.log('Sharing the post...');
    const shareResponse = await axios.post(
      `${baseURL}/api/posts/${postId}/share`,
      {},
      { headers: { Authorization: `Bearer ${token}` } }
    );
    
    console.log('Share response:', shareResponse.data);
    
    // Get updated post stats
    console.log('Getting updated post stats...');
    const statsResponse = await axios.get(`${baseURL}/api/posts/stats`);
    console.log('Post stats:', statsResponse.data);
    
    console.log('All tests completed successfully!');
  } catch (error) {
    console.error('Test failed:', error.response ? error.response.data : error.message);
  }
}

testPostInteractions();