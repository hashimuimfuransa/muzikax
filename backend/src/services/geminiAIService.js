const { GoogleGenerativeAI } = require('@google/generative-ai');
const ConversationMemory = require('../models/ConversationMemory');
const redis = require('redis');

class GeminiAIService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('GEMINI_API_KEY not found in environment variables');
    }
    this.genAI = new GoogleGenerativeAI(this.apiKey);
    this.model = null;
    
    // Redis client for caching recent conversations
    this.redisClient = null;
    this.initializeRedis();
    
    // Initialize model if API key exists
    if (this.apiKey) {
      try {
        this.model = this.genAI.getGenerativeModel({ 
          model: 'gemini-2.5-flash',
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 1024,
          }
        });
        console.log('✓ Gemini AI initialized successfully');
      } catch (error) {
        console.error('Failed to initialize Gemini AI:', error.message);
      }
    }
  }

  /**
   * Initialize Redis connection
   */
  async initializeRedis() {
    try {
      const redisUrl = process.env.REDIS_URL;
      const redisToken = process.env.REDIS_TOKEN;
      
      if (redisUrl && redisToken) {
        this.redisClient = redis.createClient({
          url: redisUrl,
          password: redisToken,
          socket: {
            tls: true,
            rejectUnauthorized: false
          }
        });
        
        this.redisClient.on('error', (err) => console.error('Redis Client Error', err));
        
        await this.redisClient.connect();
        console.log('✓ Redis connected for conversation caching');
      }
    } catch (error) {
      console.warn('Redis not available, using database only:', error.message);
    }
  }

  /**
   * Get time-based greeting and mood context
   */
  getTimeContext() {
    const hour = new Date().getHours();
    let timeOfDay = 'evening';
    let moodSuggestion = 'relaxed';

    if (hour >= 5 && hour < 12) {
      timeOfDay = 'morning';
      moodSuggestion = 'energetic';
    } else if (hour >= 12 && hour < 17) {
      timeOfDay = 'afternoon';
      moodSuggestion = 'upbeat';
    } else if (hour >= 17 && hour < 21) {
      timeOfDay = 'evening';
      moodSuggestion = 'chill';
    } else {
      timeOfDay = 'night';
      moodSuggestion = 'calm';
    }

    return { timeOfDay, moodSuggestion, hour };
  }

  /**
   * Analyze user query for mood, genre, artist preferences
   */
  async analyzeMusicQuery(userQuery, userHistory = []) {
    if (!this.model) {
      throw new Error('Gemini AI not initialized - missing API key');
    }

    const timeContext = this.getTimeContext();
    
    const prompt = `You are an expert AI music assistant for MuzikaX, a Rwandan and African music streaming platform.
    
Current context:
- Time of day: ${timeContext.timeOfDay}
- Suggested mood: ${timeContext.moodSuggestion}

User's request: "${userQuery}"

Analyze this request and provide:
1. Detected mood (happy, sad, energetic, calm, romantic, gym, study, party, etc.)
2. Preferred genre (Afrobeats, Afrobeat, Amapiano, R&B, Hip Hop, Traditional, etc.)
3. Artist preferences if mentioned
4. Tempo preference (slow, medium, fast)
5. Time appropriateness
6. Similar artist recommendations

Respond in JSON format:
{
  "mood": "detected mood",
  "genre": "preferred genre",
  "artists": ["artist1", "artist2"],
  "tempo": "tempo preference",
  "timeAppropriate": true/false,
  "similarArtists": ["similar1", "similar2"],
  "searchKeywords": ["keyword1", "keyword2"],
  "greeting": "personalized greeting based on time and mood",
  "suggestion": "personalized music suggestion"
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // Extract JSON from response
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }
      
      throw new Error('Invalid response format from AI');
    } catch (error) {
      console.error('Error analyzing music query:', error.message);
      throw error;
    }
  }

  /**
   * Get personalized recommendations based on analysis
   */
  async getPersonalizedRecommendations(analysis, limit = 10) {
    const timeContext = this.getTimeContext();
    
    const baseQuery = {
      mood: analysis.mood || timeContext.moodSuggestion,
      genre: analysis.genre || 'Afrobeats',
      tempo: analysis.tempo || 'medium',
      timeOfDay: timeContext.timeOfDay,
      limit: limit
    };

    // Build search keywords
    const keywords = [
      ...analysis.searchKeywords || [],
      analysis.genre,
      analysis.mood,
      'Rwandan music',
      'African music'
    ].filter(Boolean).slice(0, 5);

    return {
      query: baseQuery,
      keywords: [...new Set(keywords)],
      artists: analysis.artists || [],
      similarArtists: analysis.similarArtists || [],
      greeting: analysis.greeting,
      suggestion: analysis.suggestion
    };
  }

  /**
   * Chat-based music recommendation with memory
   */
  async chatWithAI(userMessage, conversationHistory = [], userId = null) {
    if (!this.model) {
      throw new Error('Gemini AI not initialized');
    }

    const timeContext = this.getTimeContext();
    
    // Get personalized context if user is authenticated
    let personalizedContext = null;
    if (userId) {
      personalizedContext = await this.getPersonalizedContext(userId);
    }

    // Build conversation context
    const historyContext = conversationHistory.slice(-5).map(msg => 
      `${msg.role}: ${msg.content}`
    ).join('\n');

    // Add long-term memory context if available
    let memoryContext = '';
    if (personalizedContext?.longTermSummary) {
      memoryContext = `\n\nUser's Long-term Preferences:\n${personalizedContext.longTermSummary}`;
    }
    
    if (personalizedContext?.preferences?.favoriteGenres?.length > 0) {
      memoryContext += `\nFavorite Genres: ${personalizedContext.preferences.favoriteGenres.join(', ')}`;
    }
    
    if (personalizedContext?.preferences?.favoriteArtists?.length > 0) {
      memoryContext += `\nFavorite Artists: ${personalizedContext.preferences.favoriteArtists.join(', ')}`;
    }

    const prompt = `You are MuzikaX AI, a friendly music assistant specializing in Rwandan and African music.

Current time: ${timeContext.timeOfDay} (${new Date().getHours()}:00)

Conversation history:
${historyContext || 'No previous conversation'}
${memoryContext}

User: ${userMessage}

CRITICAL RULES:
1. You MUST include specific songs in the "tracks" array for EVERY music request
2. NEVER just talk about music - ALWAYS provide playable tracks
3. Use REAL Rwandan/African artists (The Ben, Knowless, Bruce Melody, King James, etc.)
4. Return ONLY valid JSON - no markdown, no explanations outside JSON

Example response when user asks for music:
{
  "message": "Here are some great tracks for you!",
  "action": "play",
  "loginRequired": false,
  "recommendations": {
    "tracks": [
      {"title": "Ntawamusimbura", "artist": "The Ben"},
      {"title": "Ibyishimo", "artist": "Knowless"}
    ]
  },
  "mood": "happy",
  "confidence": 0.9
}

Advanced features requiring login:
- Creating playlists
- Viewing statistics
- Following artists

Respond ONLY with valid JSON in this exact format:
{
  "message": "your conversational response",
  "action": "recommend|search|play|require_login|none",
  "loginRequired": true|false,
  "loginMessage": "optional message",
  "recommendations": {
    "tracks": [{"title": "song title", "artist": "artist name"}],
    "query": "search query if needed"
  },
  "mood": "detected mood",
  "confidence": 0.0-1.0
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      // More robust JSON extraction with better error handling
      let parsedJSON;
      
      // First, try to extract JSON from markdown code blocks
      const markdownJsonMatch = text.match(/```(?:json)?\s*\n([\s\S]*?)\n```/);
      let jsonMatch;
      
      if (markdownJsonMatch && markdownJsonMatch[1]) {
        // Found JSON in markdown code block
        jsonMatch = [markdownJsonMatch[1]];
      } else {
        // Try standard JSON pattern
        jsonMatch = text.match(/\{[\s\S]*\}/);
      }
      
      if (jsonMatch) {
        try {
          parsedJSON = JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('Failed to parse AI JSON response:', parseError.message);
          console.error('Raw AI response:', text);
          
          // Return a safe default response
          return {
            message: "I'm here to help you discover amazing music! What would you like to listen to?",
            action: 'none',
            loginRequired: false,
            mood: 'neutral',
            confidence: 0.5
          };
        }
      } else {
        console.warn('No JSON structure found in AI response:', text);
        return {
          message: text || "I'm ready to help you find great music!",
          action: 'none',
          loginRequired: false,
          mood: 'neutral',
          confidence: 0.5
        };
      }
      
      // Ensure all required fields exist
      return {
        message: parsedJSON.message || text,
        action: parsedJSON.action || 'none',
        loginRequired: parsedJSON.loginRequired || false,
        loginMessage: parsedJSON.loginMessage || '',
        recommendations: parsedJSON.recommendations || { tracks: [], query: '' },
        mood: parsedJSON.mood || 'neutral',
        confidence: parsedJSON.confidence || 0.5
      };
    } catch (error) {
      console.error('Error in AI chat:', error.message);
      throw error;
    }
  }

  /**
   * Detect mood from user behavior
   */
  async detectMoodFromBehavior(skipRate, likeRate, recentPlays) {
    if (!this.model) {
      // Fallback heuristic-based mood detection
      if (skipRate > 0.6) return 'restless';
      if (likeRate > 0.7) return 'happy';
      return 'neutral';
    }

    const prompt = `Analyze user listening behavior:
- Skip rate: ${skipRate * 100}%
- Like rate: ${likeRate * 100}%
- Recent plays count: ${recentPlays}

What mood best describes this user? Choose from: happy, sad, energetic, calm, focused, restless, nostalgic, romantic

Respond with just the mood name.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim().toLowerCase();
    } catch (error) {
      // Fallback
      if (skipRate > 0.6) return 'restless';
      if (likeRate > 0.7) return 'happy';
      return 'neutral';
    }
  }

  /**
   * Extract structured data from conversation for memory storage
   */
  async extractConversationData(message, role) {
    if (!this.model || role !== 'user') {
      return {};
    }

    const prompt = `Extract structured information from this user message: "${message}"

Provide JSON output:
{
  "mood": "detected mood or null",
  "genre": "mentioned music genre or null",
  "artists": ["artist1", "artist2"],
  "actionType": "recommendation|playlist|search|question|casual",
  "preferences": {
    "tempo": "slow|medium|fast|null",
    "context": "morning|afternoon|evening|night|null"
  },
  "requiresLogin": true|false
}`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      const jsonMatch = text.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (parseError) {
          console.error('Failed to parse extracted data JSON:', parseError.message);
          return {};
        }
      }
      return {};
    } catch (error) {
      console.error('Error extracting conversation data:', error.message);
      return {};
    }
  }

  /**
   * Summarize long-term memory from recent conversations
   */
  async summarizeMemory(recentMessages, existingSummary = '') {
    if (!this.model) {
      return existingSummary || 'User enjoys diverse African and Rwandan music.';
    }

    const messagesText = recentMessages.map(m => `${m.role}: ${m.content}`).join('\n');

    const prompt = `Summarize this user's music preferences and conversation patterns into a concise paragraph (max 150 words):

${messagesText}

Focus on:
1. Favorite genres and artists
2. Typical moods and listening contexts
3. Music discovery patterns
4. Any specific preferences mentioned

Create a summary that can help personalize future recommendations.`;

    try {
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      return response.text().trim();
    } catch (error) {
      console.error('Error summarizing memory:', error.message);
      return existingSummary || 'User enjoys diverse African and Rwandan music.';
    }
  }

  /**
   * Get user's conversation history with smart memory retrieval
   */
  async getUserConversationHistory(userId) {
    try {
      // Try Redis cache first (most recent)
      if (this.redisClient) {
        const cached = await this.redisClient.get(`conversation:${userId}`);
        if (cached) {
          return JSON.parse(cached);
        }
      }

      // Fall back to database
      const memory = await ConversationMemory.getUserMemory(userId);
      
      // Cache in Redis for 1 hour
      if (this.redisClient && memory) {
        await this.redisClient.setEx(
          `conversation:${userId}`,
          3600, // 1 hour TTL
          JSON.stringify({
            recentMessages: memory.recentMessages,
            longTermSummary: memory.longTermSummary,
            preferences: memory.preferences
          })
        );
      }

      return memory ? {
        recentMessages: memory.recentMessages,
        longTermSummary: memory.longTermSummary,
        preferences: memory.preferences
      } : null;
    } catch (error) {
      console.error('Error getting conversation history:', error.message);
      return null;
    }
  }

  /**
   * Save conversation to memory with intelligent storage
   */
  async saveConversationToMemory(userId, message, extractedData = {}) {
    try {
      const memory = await ConversationMemory.getUserMemory(userId);
      
      // Add message to recent conversations
      await memory.addMessage(message, extractedData);
      
      // Update preferences if extracted
      if (extractedData.preferences || extractedData.genres || extractedData.artists) {
        memory.updatePreferences({
          genres: extractedData.genres || [],
          artists: extractedData.artists || [],
          moods: extractedData.mood ? [extractedData.mood] : [],
          ...extractedData.preferences
        });
      }

      // Check if we should summarize (every 10 conversations)
      if (memory.conversationCount % 10 === 0) {
        const newSummary = await this.summarizeMemory(
          memory.recentMessages,
          memory.longTermSummary
        );
        memory.longTermSummary = newSummary;
        memory.isSummarized = true;
        memory.summaryVersion += 1;
        memory.longTermSummaryLastUpdated = new Date();
      }

      await memory.save();

      // Update Redis cache
      if (this.redisClient) {
        await this.redisClient.setEx(
          `conversation:${userId}`,
          3600,
          JSON.stringify({
            recentMessages: memory.recentMessages,
            longTermSummary: memory.longTermSummary,
            preferences: memory.preferences
          })
        );
      }

      return true;
    } catch (error) {
      console.error('Error saving conversation memory:', error.message);
      return false;
    }
  }

  /**
   * Get personalized context for AI responses
   */
  async getPersonalizedContext(userId) {
    const history = await this.getUserConversationHistory(userId);
    
    if (!history) {
      return { timeContext: this.getTimeContext() };
    }

    return {
      timeContext: this.getTimeContext(),
      longTermSummary: history.longTermSummary,
      preferences: history.preferences,
      recentInteractions: history.recentMessages.slice(-5)
    };
  }
}

module.exports = new GeminiAIService();
