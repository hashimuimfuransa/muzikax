const express = require('express');
const router = express.Router();
const geminiAIService = require('../services/geminiAIService');
const Track = require('../models/Track');
const Playlist = require('../models/Playlist');
const { protect } = require('../utils/jwt');

/**
 * POST /api/ai/chat
 * Chat with AI music assistant (with memory)
 */
router.post('/chat', async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;
    const userId = req.user?._id; // From JWT if authenticated

    if (!message || typeof message !== 'string') {
      return res.status(400).json({ error: 'Message is required' });
    }

    console.log('🎵 AI Chat Request:', message);

    let aiResponse;
    
    // Try to get AI response from Gemini
    try {
      // Extract data from user message for memory
      const extractedData = await geminiAIService.extractConversationData(message, 'user');

      // Get AI response with memory context
      aiResponse = await geminiAIService.chatWithAI(
        message,
        conversationHistory || [],
        userId
      );

      console.log('🤖 AI Raw Response:', aiResponse);

      // Save to memory (if user is authenticated or guest session)
      if (userId) {
        await geminiAIService.saveConversationToMemory(userId, {
          role: 'user',
          content: message
        }, extractedData);

        // Also save AI response
        await geminiAIService.saveConversationToMemory(userId, {
          role: 'assistant',
          content: aiResponse.message
        }, {});
      }
    } catch (geminiError) {
      console.log('⚠️ Gemini API error, using fallback:', geminiError.message);
      
      // Fallback: Create a basic response with recommendations object
      aiResponse = {
        message: '🎵 I found some great music for you!',
        action: 'play',
        loginRequired: false,
        mood: 'neutral',
        confidence: 0.8,
        recommendations: {} // Initialize empty recommendations object
      };
    }

    // CRITICAL: Always search for tracks on music requests
    const isMusicRequest = message.toLowerCase().match(/play|song|track|music|listen|afrobeat|rwandan|genre|mood|vibe/i);
    
    if (isMusicRequest && (!aiResponse.recommendations?.foundTracks || aiResponse.recommendations.foundTracks.length === 0)) {
      console.log('🔍 Music request detected, searching for tracks...');
      
      // Try to extract search terms from user message
      const lowerMessage = message.toLowerCase();
      const searchTerms = [];
      
      // Check for specific genres/moods
      if (lowerMessage.includes('afrobeat') || lowerMessage.includes('afro')) searchTerms.push('Afrobeats');
      if (lowerMessage.includes('rwandan')) searchTerms.push('Rwandan');
      if (lowerMessage.includes('chill') || lowerMessage.includes('calm') || lowerMessage.includes('relax')) searchTerms.push('Chill');
      if (lowerMessage.includes('party') || lowerMessage.includes('dance') || lowerMessage.includes('upbeat')) searchTerms.push('Dance');
      if (lowerMessage.includes('evening') || lowerMessage.includes('night')) searchTerms.push('Night');
      if (lowerMessage.includes('morning')) searchTerms.push('Morning');
      if (lowerMessage.includes('workout') || lowerMessage.includes('gym') || lowerMessage.includes('exercise')) searchTerms.push('Workout');
      if (lowerMessage.includes('love') || lowerMessage.includes('romantic')) searchTerms.push('Love');
      
      // If no specific terms, use popular/trending
      if (searchTerms.length === 0) {
        searchTerms.push('Afrobeats', 'Popular');
      }
      
      console.log('Search terms:', searchTerms);
      
      // Build search query
      const searchQuery = {
        $or: searchTerms.map(term => ({
          $or: [
            { genre: { $regex: term, $options: 'i' } },
            { tags: { $regex: term, $options: 'i' } },
            { title: { $regex: term, $options: 'i' } }
          ]
        }))
      };
      
      const foundTracks = await Track.find(searchQuery)
        .populate('creatorId', 'name avatar coverArt')
        .limit(10)
        .sort({ plays: -1, createdAt: -1 });
      
      console.log(`Found ${foundTracks.length} tracks`);
      
      if (foundTracks.length > 0) {
        // Transform creatorId to artist for frontend compatibility
        aiResponse.recommendations.foundTracks = foundTracks.map(track => ({
          ...track.toObject(),
          artist: track.creatorId
        }));
        aiResponse.action = 'play';
        aiResponse.message = `🎵 I found ${foundTracks.length} great ${searchTerms.join('/')} tracks for you!`;
      } else {
        // Last resort: get any popular tracks
        const popularTracks = await Track.find({})
          .populate('creatorId', 'name avatar coverArt')
          .limit(10)
          .sort({ plays: -1 });
        
        if (popularTracks.length > 0) {
          // Ensure recommendations object exists
          if (!aiResponse.recommendations) {
            aiResponse.recommendations = {};
          }
          aiResponse.recommendations.foundTracks = popularTracks.map(track => ({
            ...track.toObject(),
            artist: track.creatorId
          }));
          aiResponse.action = 'play';
          aiResponse.message = '🎵 Here are some popular tracks you might enjoy!';
        }
      }
    }

    // If AI suggests specific tracks, search for them in database
    if (aiResponse.action === 'recommend' && aiResponse.recommendations?.tracks) {
      const searchPromises = aiResponse.recommendations.tracks.map(async (track) => {
        try {
          // Search by title and artist
          const query = {
            $or: [
              { title: { $regex: track.title, $options: 'i' } },
              { artist: { $regex: track.artist, $options: 'i' } }
            ]
          };
          
          const foundTracks = await Track.find(query)
            .populate('creatorId', 'name avatar coverArt')
            .limit(3);
          
          return foundTracks.map(t => ({
            ...t.toObject(),
            artist: t.creatorId
          }));
        } catch (error) {
          console.error('Error searching track:', error.message);
          return [];
        }
      });

      const results = await Promise.all(searchPromises);
      const foundTracks = results.flat().filter(Boolean);

      if (foundTracks.length > 0) {
        // Ensure recommendations object exists
        if (!aiResponse.recommendations) {
          aiResponse.recommendations = {};
        }
        aiResponse.recommendations.foundTracks = foundTracks;
        
        // Set action to 'play' if we found tracks to auto-play
        aiResponse.action = 'play';
      } else {
        // If no exact matches, do a broader search based on mood/genre from message
        const keywords = aiResponse.recommendations?.query || aiResponse.mood || 'Afrobeats';
        const broadQuery = {
          $or: [
            { title: { $regex: keywords, $options: 'i' } },
            { genre: { $regex: keywords, $options: 'i' } },
            { tags: { $regex: keywords, $options: 'i' } }
          ]
        };
        
        const broadResults = await Track.find(broadQuery)
          .populate('creatorId', 'name avatar coverArt')
          .limit(10);
        
        if (broadResults.length > 0) {
          // Ensure recommendations object exists
          if (!aiResponse.recommendations) {
            aiResponse.recommendations = {};
          }
          aiResponse.recommendations.foundTracks = broadResults.map(track => ({
            ...track.toObject(),
            artist: track.creatorId
          }));
          aiResponse.action = 'play';
        }
      }
    }

    console.log('Final Response:', {
      action: aiResponse.action,
      hasTracks: !!aiResponse.recommendations?.foundTracks,
      trackCount: aiResponse.recommendations?.foundTracks?.length
    });

    res.json(aiResponse);
  } catch (error) {
    console.error('Error in AI chat:', error);
    res.status(500).json({ 
      error: 'Failed to process AI request',
      message: error.message 
    });
  }
});

/**
 * POST /api/ai/create-playlist
 * Create a playlist based on AI recommendations (requires login)
 */
router.post('/create-playlist', protect, async (req, res) => {
  try {
    const { name, description, mood, genre } = req.body;
    const userId = req.user._id;

    // Get AI recommendations for playlist
    const analysis = await geminiAIService.analyzeMusicQuery(
      `Create a ${mood || ''} ${genre || ''} playlist: ${description || name}`,
      []
    );

    const recommendations = await geminiAIService.getPersonalizedRecommendations(analysis, 20);

    // Search for matching tracks
    const searchQuery = {};
    if (recommendations.query.mood) {
      searchQuery.tags = { $regex: recommendations.query.mood, $options: 'i' };
    }
    if (recommendations.query.genre) {
      searchQuery.genre = { $regex: recommendations.query.genre, $options: 'i' };
    }

    const tracks = await Track.find(searchQuery)
      .sort({ plays: -1, createdAt: -1 })
      .limit(20)
      .populate('artist', 'name avatar');

    // Create playlist
    const playlist = await Playlist.create({
      user: userId,
      name: name || `${mood || 'Custom'} Mix`,
      description: description || recommendations.suggestion || '',
      tracks: tracks.map(t => t._id),
      isPublic: true,
      tags: [mood, genre, 'AI Generated'].filter(Boolean)
    });

    const populatedPlaylist = await Playlist.findById(playlist._id)
      .populate('tracks', 'title artist duration coverArt')
      .populate('user', 'name avatar');

    res.json({
      success: true,
      playlist: populatedPlaylist,
      message: `✨ Created "${playlist.name}" with ${tracks.length} tracks!`
    });
  } catch (error) {
    console.error('Error creating playlist:', error);
    res.status(500).json({
      error: 'Failed to create playlist',
      message: error.message
    });
  }
});

/**
 * POST /api/ai/recommend
 * Get personalized music recommendations with memory
 */
router.post('/recommend', async (req, res) => {
  try {
    const { query, mood, genre, timeOfDay, userId } = req.body;

    // Analyze the query using AI
    const analysis = await geminiAIService.analyzeMusicQuery(
      query || `Recommend ${mood || 'good'} ${genre || 'Afrobeats'} songs`,
      []
    );

    // Get personalized recommendations
    const recommendations = await geminiAIService.getPersonalizedRecommendations(analysis);

    // Search for matching tracks
    const searchQuery = {};
    
    if (recommendations.query.mood) {
      searchQuery.tags = { $regex: recommendations.query.mood, $options: 'i' };
    }
    
    if (recommendations.query.genre) {
      searchQuery.genre = { $regex: recommendations.query.genre, $options: 'i' };
    }

    const tracks = await Track.find(searchQuery)
      .sort({ plays: -1, createdAt: -1 })
      .limit(recommendations.query.limit)
      .populate('artist', 'name avatar');

    res.json({
      greeting: recommendations.greeting,
      suggestion: recommendations.suggestion,
      tracks,
      keywords: recommendations.keywords,
      mood: analysis.mood,
      genre: analysis.genre
    });
  } catch (error) {
    console.error('Error getting recommendations:', error);
    
    // Fallback to basic search
    const fallbackQuery = {};
    if (genre) fallbackQuery.genre = { $regex: genre, $options: 'i' };
    if (mood) fallbackQuery.tags = { $regex: mood, $options: 'i' };

    const tracks = await Track.find(fallbackQuery)
      .sort({ plays: -1 })
      .limit(10)
      .populate('artist', 'name avatar');

    res.json({
      greeting: 'Here are some recommendations for you',
      tracks,
      fallback: true
    });
  }
});

/**
 * POST /api/ai/analyze-mood
 * Detect user's current mood from behavior
 */
router.post('/analyze-mood', async (req, res) => {
  try {
    const { skipRate, likeRate, recentPlays, listeningHistory } = req.body;

    const mood = await geminiAIService.detectMoodFromBehavior(
      skipRate || 0.3,
      likeRate || 0.5,
      recentPlays || 0
    );

    const timeContext = geminiAIService.getTimeContext();

    res.json({
      mood,
      timeOfDay: timeContext.timeOfDay,
      suggestedGenre: timeContext.moodSuggestion,
      message: `Based on your listening, you seem to be in a ${mood} mood`
    });
  } catch (error) {
    console.error('Error analyzing mood:', error);
    res.status(500).json({ error: 'Failed to analyze mood' });
  }
});

/**
 * GET /api/ai/status
 * Check AI service status
 */
router.get('/status', (req, res) => {
  const isInitialized = !!geminiAIService.model;
  
  res.json({
    status: isInitialized ? 'active' : 'inactive',
    model: isInitialized ? 'gemini-2.5-flash' : null,
    message: isInitialized 
      ? 'AI Music Assistant is ready' 
      : 'AI Music Assistant not configured (missing API key)'
  });
});

module.exports = router;
