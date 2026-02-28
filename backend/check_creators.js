const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./src/models/User');

dotenv.config();

const checkCreators = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const creators = await User.find({ role: 'creator' });
    console.log(`Found ${creators.length} creators`);
    
    if (creators.length > 0) {
      creators.forEach(c => {
        console.log(`- ${c.name} (${c.email}), role: ${c.role}, followersCount: ${c.followersCount}`);
      });
    } else {
      console.log('No creators found. Checking all users...');
      const allUsers = await User.find({});
      console.log(`Total users: ${allUsers.length}`);
      allUsers.forEach(u => {
        console.log(`- ${u.name} (${u.email}), role: ${u.role}`);
      });
    }

    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
};

checkCreators();
