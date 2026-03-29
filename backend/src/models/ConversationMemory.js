const mongoose = require('mongoose');

const conversationMemorySchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  
  // Recent conversation turns (short-term memory)
  recentMessages: [{
    role: { type: String, enum: ['user', 'assistant'] },
    content: String,
    timestamp: { type: Date, default: Date.now },
    // Extracted entities for better retrieval
    extractedData: {
      mood: String,
      genre: String,
      artists: [String],
      actionType: String // 'recommendation', 'playlist', 'search', etc.
    }
  }],
  
  // Summarized long-term memory (AI-generated summary)
  longTermSummary: {
    type: String,
    default: '',
    lastUpdated: Date
  },
  
  // Structured user preferences (extracted from conversations)
  preferences: {
    favoriteGenres: [{ type: String }],
    favoriteArtists: [{ type: String }],
    preferredMoods: [{ type: String }],
    listeningContext: {
      morning: { type: String, default: '' },
      afternoon: { type: String, default: '' },
      evening: { type: String, default: '' },
      night: { type: String, default: '' }
    },
    dislikedGenres: [{ type: String }],
    tempoPreference: { type: String, enum: ['slow', 'medium', 'fast', 'mixed'], default: 'mixed' }
  },
  
  // Statistics
  conversationCount: { type: Number, default: 0 },
  lastInteraction: { type: Date, default: Date.now },
  
  // Memory management
  isSummarized: { type: Boolean, default: false },
  summaryVersion: { type: Number, default: 1 }
}, {
  timestamps: true
});

// Index for quick lookups
conversationMemorySchema.index({ user: 1, lastInteraction: -1 });

// Method to add a message
conversationMemorySchema.methods.addMessage = async function(message, extractedData = {}) {
  this.recentMessages.push({
    role: message.role,
    content: message.content,
    extractedData
  });
  
  // Keep only last 20 messages in short-term memory
  if (this.recentMessages.length > 20) {
    this.recentMessages = this.recentMessages.slice(-20);
  }
  
  this.lastInteraction = new Date();
  this.conversationCount += 1;
};

// Method to update preferences based on conversation
conversationMemorySchema.methods.updatePreferences = function(extractedPrefs) {
  if (extractedPrefs.genres) {
    extractedPrefs.genres.forEach(genre => {
      if (!this.preferences.favoriteGenres.includes(genre)) {
        this.preferences.favoriteGenres.push(genre);
      }
    });
  }
  
  if (extractedPrefs.artists) {
    extractedPrefs.artists.forEach(artist => {
      if (!this.preferences.favoriteArtists.includes(artist)) {
        this.preferences.favoriteArtists.push(artist);
      }
    });
  }
  
  if (extractedPrefs.moods) {
    extractedPrefs.moods.forEach(mood => {
      if (!this.preferences.preferredMoods.includes(mood)) {
        this.preferences.preferredMoods.push(mood);
      }
    });
  }
};

// Static method to get or create user memory
conversationMemorySchema.statics.getUserMemory = async function(userId) {
  let memory = await this.findOne({ user: userId }).populate('user', 'name email');
  
  if (!memory) {
    memory = await this.create({
      user: userId,
      recentMessages: [],
      preferences: {
        favoriteGenres: [],
        favoriteArtists: [],
        preferredMoods: [],
        listeningContext: {},
        dislikedGenres: [],
        tempoPreference: 'mixed'
      }
    });
  }
  
  return memory;
};

module.exports = mongoose.model('ConversationMemory', conversationMemorySchema);
