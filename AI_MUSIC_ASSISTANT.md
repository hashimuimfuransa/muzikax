# 🎵 AI Music Assistant - MuzikaX

## Overview

The MuzikaX AI Music Assistant is an intelligent, chat-based music recommendation system powered by **Gemini 2.5 Flash AI**. It provides users with personalized music discovery through natural conversation, voice commands, and smart mood detection.

## ✨ Features Implemented

### 🎧 A. Smart Music Assistant (Chat-based AI)

**Users can type or talk:**
- "Play calm Rwandan songs for studying"
- "Give me trending Afrobeat in Kigali"
- "Find songs like The Ben but faster"

**AI responds + plays instantly**

**Modern feel:**
- ✅ Chat UI (like WhatsApp or ChatGPT)
- ✅ Voice input 🎤
- ✅ Instant playback cards
- ✅ Real-time conversation history

### 🎧 B. Hyper-Personalized Recommendations

**Not basic playlists — deep AI personalization:**
- ✅ Mood detection (happy, sad, gym, study)
- ✅ Time-based recommendations (morning, night)
- ✅ Behavior learning (what user skips/likes)

**Example:**
> "Good evening, here's your chill Afro mix"

**Advanced features:**
- ✅ Detect mood from typing or listening patterns
- ✅ Time-aware suggestions (morning energy vs. night chill)
- ✅ Genre preferences based on listening history

### 🚀 C. User-Friendly Onboarding

**Attractive Music-Friendly Popup:**
- ✅ Appears on first visit (after 2 seconds)
- ✅ Beautiful gradient design with animations
- ✅ Clear feature explanations
- ✅ Example prompts to get started
- ✅ One-click activation

### 🎨 D. Modern Design Elements

**Floating Action Button:**
- ✅ Gradient purple-to-pink design
- ✅ Animated pulse indicator (green dot = active)
- ✅ Hover effect with tooltip
- ✅ Smooth transitions and scaling

**Chat Interface:**
- ✅ WhatsApp/ChatGPT-style messaging
- ✅ Message bubbles (user vs. assistant)
- ✅ Track recommendation cards with click-to-play
- ✅ Loading indicators (animated dots)
- ✅ Quick action buttons
- ✅ Voice input with visual feedback

## 📁 Files Created/Modified

### Backend Files

1. **`backend/src/services/geminiAIService.js`**
   - Gemini AI initialization
   - Query analysis (mood, genre, artist detection)
   - Time-based context awareness
   - Behavior-based mood detection
   - Chat conversation handling

2. **`backend/src/routes/aiRoutes.js`**
   - `POST /api/ai/chat` - Chat with AI assistant
   - `POST /api/ai/recommend` - Get personalized recommendations
   - `POST /api/ai/analyze-mood` - Detect user mood from behavior
   - `GET /api/ai/status` - Check AI service status

3. **`backend/src/app.js`**
   - Added AI routes registration
   - Integrated Gemini AI service

4. **`backend/.env`**
   - Added `GEMINI_API_KEY` configuration

### Frontend Files

1. **`frontend/src/components/AIMusicAssistant.tsx`**
   - Main chat interface component
   - Voice input functionality (Speech Recognition API)
   - Message handling and display
   - Track recommendation cards
   - Quick action buttons

2. **`frontend/src/components/AIPopup.tsx`**
   - Onboarding popup component
   - Feature showcase
   - Example prompts
   - Call-to-action buttons

3. **`frontend/src/contexts/AIAssistantContext.tsx`**
   - Global state management for AI assistant
   - Open/close/toggle functionality
   - Context provider for component tree

4. **`frontend/src/app/layout.tsx`**
   - Integrated AI components
   - Added AIAssistantProvider wrapper
   - Removed old contact floating button

## 🔧 Setup Instructions

### 1. Install Backend Dependencies

```bash
cd backend
npm install @google/generative-ai
```

### 2. Configure Gemini API Key

1. Get your Gemini API key from [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to your `.env` file:

```env
# Gemini AI Configuration
GEMINI_API_KEY=your_actual_api_key_here
```

### 3. Restart Backend Server

```bash
cd backend
npm run dev
```

You should see:
```
✓ Gemini AI initialized successfully
AI music assistant routes registered
```

### 4. Test the AI Assistant

1. Open your frontend (http://localhost:3000)
2. Wait 2 seconds for the onboarding popup
3. Click "Try It Now! 🚀"
4. Start chatting! 🎵

## 🎯 API Endpoints

### POST `/api/ai/chat`

Chat with the AI music assistant.

**Request Body:**
```json
{
  "message": "Play calm Rwandan songs for studying",
  "conversationHistory": [
    { "role": "user", "content": "Previous message" },
    { "role": "assistant", "content": "Previous response" }
  ]
}
```

**Response:**
```json
{
  "message": "I found some perfect study tracks for you!",
  "action": "recommend",
  "recommendations": {
    "tracks": [
      { "title": "Peaceful Night", "artist": "The Ben" }
    ],
    "foundTracks": [...]
  },
  "mood": "calm",
  "confidence": 0.95
}
```

### POST `/api/ai/recommend`

Get personalized music recommendations.

**Request Body:**
```json
{
  "query": "trending Afrobeat in Kigali",
  "mood": "energetic",
  "genre": "Afrobeats",
  "userId": "user123"
}
```

**Response:**
```json
{
  "greeting": "Good afternoon! Here are trending Afrobeats...",
  "suggestion": "These hot tracks are taking over Kigali right now!",
  "tracks": [...],
  "keywords": ["afrobeats", "kigali", "trending"],
  "mood": "energetic",
  "genre": "Afrobeats"
}
```

### POST `/api/ai/analyze-mood`

Detect user's current mood from listening behavior.

**Request Body:**
```json
{
  "skipRate": 0.3,
  "likeRate": 0.7,
  "recentPlays": 15,
  "listeningHistory": [...]
}
```

**Response:**
```json
{
  "mood": "happy",
  "timeOfDay": "afternoon",
  "suggestedGenre": "upbeat",
  "message": "Based on your listening, you seem to be in a happy mood"
}
```

## 🎨 UI Components

### Floating Action Button

- **Location**: Bottom-right corner (fixed position)
- **Design**: Purple-to-pink gradient circle
- **Size**: 64px × 64px
- **Icon**: Computer/Music icon
- **Indicator**: Green pulsing dot (active status)
- **Hover**: Scales to 110%, shows tooltip

### Chat Window

- **Size**: 384px (width) × 600px (max-height)
- **Position**: Fixed, bottom-right, above FAB
- **Design**: Dark theme with gradient header
- **Features**:
  - Scrollable message area
  - Quick action buttons
  - Voice input button
  - Text input with send button

### Onboarding Popup

- **Trigger**: First visit (2-second delay)
- **Storage**: localStorage (`aiAssistantPopupSeen`)
- **Design**: Full-screen overlay with centered modal
- **Animations**: Fade-in, scale-up, floating music notes
- **Content**:
  - Animated AI icon with blur effects
  - 4 feature highlights
  - Example prompts section
  - CTA buttons ("Maybe Later" / "Try It Now!")

## 🎯 Quick Actions

Pre-defined prompts for easy access:

1. **📚 Study Music** → "Play calm Rwandan songs for studying"
2. **🔥 Trending Now** → "Give me trending Afrobeat in Kigali"
3. **🎤 Similar Artists** → "Find songs like The Ben but faster"

## 🎤 Voice Input

**Browser Support:**
- Chrome ✅
- Edge ✅
- Safari (limited) ⚠️
- Firefox ❌

**Usage:**
1. Click microphone button
2. Speak your request
3. Auto-submits after recognition
4. Visual feedback (red pulse while listening)

**Error Handling:**
- Falls back to text input if unsupported
- Shows alert message
- Logs errors to console

## 🧠 AI Capabilities

### Mood Detection

Analyzes:
- User query language
- Skip rate (>60% = restless)
- Like rate (>70% = happy)
- Time of day
- Listening patterns

### Time Awareness

Automatically adjusts recommendations based on time:

| Time Range | Period | Suggested Mood |
|------------|--------|----------------|
| 5AM - 12PM | Morning | Energetic |
| 12PM - 5PM | Afternoon | Upbeat |
| 5PM - 9PM | Evening | Chill |
| 9PM - 5AM | Night | Calm |

### Conversation Memory

- Remembers last 5 messages
- Contextual follow-up responses
- Maintains conversation flow

## 🔒 Privacy & Security

- Conversations stored temporarily in memory
- No permanent storage of chat history
- User can clear history by refreshing page
- API calls use secure HTTPS
- API key stored server-side only

## 🐛 Troubleshooting

### AI Not Responding

**Check:**
1. Backend server running? (`npm run dev`)
2. Gemini API key configured?
3. CORS settings correct?
4. Console for error messages?

### Voice Input Not Working

**Solutions:**
1. Use Chrome or Edge browser
2. Allow microphone permissions
3. Check browser speech recognition support
4. Try manual text input instead

### Popup Not Showing

**Reasons:**
- Already seen (stored in localStorage)
- JavaScript disabled
- Ad blocker interfering

**Fix:**
```javascript
localStorage.removeItem('aiAssistantPopupSeen');
location.reload();
```

### Tracks Not Playing

**Check:**
1. AudioPlayerContext loaded?
2. Track data available in database?
3. Network connectivity?
4. Browser autoplay policies?

## 📊 Performance Optimization

### Implemented:
- Lazy loading of chat window
- Debounced API calls
- Efficient re-renders (React.memo ready)
- Minimal state updates
- Optimistic UI updates

### Future Improvements:
- Cache AI responses
- Preload common recommendations
- Service worker for offline mode
- Streaming responses

## 🚀 Future Enhancements

### Planned Features:

1. **Multi-language Support**
   - Kinyarwanda
   - French
   - Swahili

2. **Advanced Personalization**
   - User profile integration
   - Long-term preference learning
   - Social recommendations

3. **Enhanced Voice**
   - Wake word detection
   - Multi-turn voice conversation
   - Voice emotion detection

4. **Visual Enhancements**
   - Artist images in recommendations
   - Album cover previews
   - Animated visualizations

5. **Integration**
   - Spotify/Apple Music sync
   - Social sharing
   - Playlist export

## 📝 Testing Checklist

- [x] Backend API endpoints working
- [x] Gemini AI responding correctly
- [x] Frontend components rendering
- [x] Voice input functional
- [x] Popup appears on first load
- [x] Chat messages sending/receiving
- [x] Track recommendations displaying
- [x] Click-to-play working
- [x] Quick actions functioning
- [x] Responsive design (mobile/desktop)
- [x] Error handling in place
- [ ] Load testing with multiple users
- [ ] Performance profiling
- [ ] Cross-browser testing

## 🎉 Success Metrics

Track these to measure success:

- **Engagement**: % of users who open AI assistant
- **Conversion**: % who play recommended tracks
- **Retention**: Repeat usage per week
- **Satisfaction**: User feedback/ratings
- **Performance**: Average response time

## 📞 Support

For issues or questions:
- Check console logs
- Review API documentation
- Test endpoints directly
- Contact development team

---

**Built with ❤️ for MuzikaX**
**Powered by Google Gemini AI 2.5 Flash**
