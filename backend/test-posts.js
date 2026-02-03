const mongoose = require('mongoose');
const Post = require('./src/models/Post');
const User = require('./src/models/User').default;

// MongoDB connection
mongoose.connect('mongodb+srv://hashimuimfuransa:hashimu@cluster0.qzuhv97.mongodb.net/muzikax?retryWrites=true&w=majority&appName=Cluster0');

async function testPostFunctionality() {
  try {
    console.log('Testing Post functionality...');
    
    // Create a test user if one doesn't exist
    let user = await User.findOne({ email: 'test@example.com' });
    if (!user) {
      user = await User.create({
        name: 'Test User',
        email: 'test@example.com',
        password: 'password123',
        role: 'fan'
      });
      console.log('Created test user:', user.name);
    } else {
      console.log('Using existing user:', user.name);
    }
    
    // Test creating a post
    const post = new Post({
      userId: user._id,
      userName: user.name,
      userAvatar: '',
      userRole: user.role,
      content: 'This is a test post from our test script!'
    });
    await post.save();
    
    console.log('Created post:', post.content);
    
    // Test fetching posts
    const posts = await Post.find().sort({ createdAt: -1 }).limit(5);
    console.log('Fetched posts:', posts.length);
    
    // Test post statistics
    const totalPosts = await Post.countDocuments();
    console.log('Total posts:', totalPosts);
    
    console.log('All tests passed!');
  } catch (error) {
    console.error('Error:', error);
  } finally {
    mongoose.connection.close();
  }
}

testPostFunctionality();