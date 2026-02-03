const mongoose = require('mongoose');

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/muzikax');

const trackSchema = new mongoose.Schema({
  creatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  creatorType: {
    type: String,
    enum: ['artist', 'dj', 'producer'],
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  audioURL: {
    type: String,
    required: true
  },
  coverURL: {
    type: String,
    default: ''
  },
  genre: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['song', 'beat', 'mix'],
    required: true
  },
  paymentType: {
    type: String,
    enum: ['free', 'paid'],
    default: 'free'
  },
  price: {
    type: Number,
    default: 0
  },
  currency: {
    type: String,
    default: 'RWF'
  },
  plays: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Comment'
  }],
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Album'
  },
  releaseDate: {
    type: Date,
    required: false
  },
  collaborators: [{
    type: String
  }],
  copyrightAccepted: {
    type: Boolean,
    required: true,
    default: false
  }
}, {
  timestamps: true
});

const Track = mongoose.model('Track', trackSchema);

async function updateMissingPaymentTypes() {
  try {
    console.log('Finding tracks with missing paymentType...');
    
    // Find all tracks where paymentType is null, undefined, or missing
    const tracksToUpdate = await Track.find({
      $or: [
        { paymentType: null },
        { paymentType: { $exists: false } },
        { paymentType: '' }
      ]
    });
    
    console.log(`Found ${tracksToUpdate.length} tracks with missing paymentType`);
    
    if (tracksToUpdate.length === 0) {
      console.log('No tracks need updating.');
      process.exit(0);
    }
    
    console.log('Updating tracks with default paymentType "free"...');
    
    // Update each track with default paymentType 'free'
    for (let i = 0; i < tracksToUpdate.length; i++) {
      const track = tracksToUpdate[i];
      console.log(`Updating track ${i + 1}/${tracksToUpdate.length}: ${track.title} (${track._id})`);
      
      await Track.updateOne(
        { _id: track._id },
        { $set: { paymentType: 'free' } }
      );
    }
    
    console.log('Successfully updated all tracks with missing paymentType to "free"');
    
    // Verify the update
    const remainingWithoutPaymentType = await Track.find({
      $or: [
        { paymentType: null },
        { paymentType: { $exists: false } },
        { paymentType: '' }
      ]
    });
    
    console.log(`Remaining tracks without paymentType: ${remainingWithoutPaymentType.length}`);
    
    if (remainingWithoutPaymentType.length === 0) {
      console.log('All tracks now have a paymentType value!');
    } else {
      console.log('Some tracks still have missing paymentType values');
    }
    
  } catch (error) {
    console.error('Error updating tracks:', error);
  } finally {
    mongoose.connection.close();
    console.log('Database connection closed');
  }
}

// Run the update function
updateMissingPaymentTypes();