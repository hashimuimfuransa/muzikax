const mongoose = require('mongoose');

const slideSchema = new mongoose.Schema({
  id: {
    type: Number,
    required: true,
    unique: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [1, 'Title cannot be empty']
  },
  subtitle: {
    type: String,
    required: [true, 'Subtitle is required'],
    trim: true,
    minlength: [1, 'Subtitle cannot be empty']
  },
  image: {
    type: String,
    required: [true, 'Image URL is required'],
    trim: true,
    match: [/^https?:\/\/.+/i, 'Please provide a valid URL starting with http:// or https://']
  },
  cta: {
    type: String,
    required: [true, 'CTA text is required'],
    trim: true,
    minlength: [1, 'CTA cannot be empty']
  },
  type: {
    type: String,
    enum: ['explore', 'upload', 'vibes', 'custom'],
    default: 'custom'
  },
  link: {
    type: String,
    default: '/',
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  order: {
    type: Number,
    default: 0
  }
}, { _id: false });

const homepageContentSchema = new mongoose.Schema({
  slides: [slideSchema],
  currentSlide: {
    type: Number,
    default: 0
  },
  autoPlayInterval: {
    type: Number,
    default: 5000 // 5 seconds
  },
  sections: {
    showForYou: {
      type: Boolean,
      default: true
    },
    showPopularBeats: {
      type: Boolean,
      default: true
    },
    showRecommendedPlaylists: {
      type: Boolean,
      default: true
    },
    showTrendingArtists: {
      type: Boolean,
      default: true
    },
    customSectionsOrder: [{
      section: {
        type: String,
        enum: ['forYou', 'popularBeats', 'recommendedPlaylists', 'trendingArtists']
      },
      order: Number
    }]
  }
}, {
  timestamps: true
});

// Ensure only one document exists
homepageContentSchema.index({ _id: 1 });

module.exports = mongoose.model('HomepageContent', homepageContentSchema);
