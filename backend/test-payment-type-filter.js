const mongoose = require('mongoose');

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect('mongodb://localhost:27017/muzikax', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

async function testPaymentTypeFilter() {
  try {
    await connectDB();
    
    // Import Track model
    const Track = require('./backend/src/models/Track');
    
    console.log('Testing payment type filter...\n');
    
    // Get all beat tracks
    const beatTracks = await Track.find({ type: 'beat' }).limit(10);
    
    console.log(`Found ${beatTracks.length} beat tracks:`);
    
    beatTracks.forEach((track, index) => {
      console.log(`${index + 1}. ${track.title}`);
      console.log(`   Payment Type: ${track.paymentType || 'undefined'}`);
      console.log(`   Type: ${track.type}`);
      console.log(`   Genre: ${track.genre}`);
      console.log('---');
    });
    
    // Test filtering logic
    console.log('\nTesting filter logic:');
    
    const allFilter = beatTracks.filter(track => {
      return true; // all filter
    });
    
    const freeFilter = beatTracks.filter(track => {
      return track.paymentType === 'free';
    });
    
    const paidFilter = beatTracks.filter(track => {
      return track.paymentType === 'paid';
    });
    
    console.log(`All beats: ${allFilter.length}`);
    console.log(`Free beats: ${freeFilter.length}`);
    console.log(`Paid beats: ${paidFilter.length}`);
    
    // Check if paymentType field exists in schema
    console.log('\nChecking Track schema:');
    const trackSchema = Track.schema.obj;
    console.log('paymentType field in schema:', trackSchema.paymentType);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.connection.close();
    console.log('Database connection closed');
  }
}

testPaymentTypeFilter();