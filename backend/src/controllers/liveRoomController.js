const LiveRoom = require('../models/LiveRoom');
const User = require('../models/User');

// Create a new live room
exports.createLiveRoom = async (req, res) => {
  try {
    const { title, description, scheduledStartTime, maxListeners, isPublic, genre, language, tags, coverImage } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!title || !scheduledStartTime) {
      return res.status(400).json({ message: 'Title and scheduled start time are required' });
    }

    // Validate start time
    const startTime = new Date(scheduledStartTime);
    if (startTime < new Date()) {
      return res.status(400).json({ message: 'Scheduled start time cannot be in the past' });
    }

    if (title.length > 100 || (description && description.length > 500)) {
      return res.status(400).json({ message: 'Title must be less than 100 characters and description less than 500 characters' });
    }

    // Get user details
    const user = await User.findById(userId).select('name avatar');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the live room
    const liveRoom = new LiveRoom({
      title: title.trim(),
      description: description ? description.trim() : '',
      hostId: userId,
      hostName: user.name,
      hostAvatar: user.avatar || '',
      scheduledStartTime: startTime,
      maxListeners: maxListeners || 1000,
      isPublic: isPublic !== undefined ? isPublic : true,
      genre,
      language: language || 'en',
      tags: tags || [],
      coverImage
    });

    const savedLiveRoom = await liveRoom.save();

    res.status(201).json({
      message: 'Live room created successfully',
      liveRoom: {
        id: savedLiveRoom._id,
        title: savedLiveRoom.title,
        description: savedLiveRoom.description,
        hostId: savedLiveRoom.hostId,
        hostName: savedLiveRoom.hostName,
        hostAvatar: savedLiveRoom.hostAvatar,
        isLive: savedLiveRoom.isLive,
        scheduledStartTime: savedLiveRoom.scheduledStartTime,
        actualStartTime: savedLiveRoom.actualStartTime,
        endTime: savedLiveRoom.endTime,
        maxListeners: savedLiveRoom.maxListeners,
        currentListeners: savedLiveRoom.currentListeners,
        speakers: savedLiveRoom.speakers,
        listeners: savedLiveRoom.listeners,
        isPublic: savedLiveRoom.isPublic,
        isVerified: savedLiveRoom.isVerified,
        genre: savedLiveRoom.genre,
        language: savedLiveRoom.language,
        tags: savedLiveRoom.tags,
        coverImage: savedLiveRoom.coverImage,
        createdAt: savedLiveRoom.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating live room:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all live rooms
exports.getLiveRooms = async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      sortBy = 'scheduledStartTime', 
      sortOrder = 'asc', 
      isLive, 
      isPublic, 
      hostId, 
      genre, 
      language, 
      tags,
      search
    } = req.query;

    // Build query
    const query = {};
    
    if (isLive !== undefined) query.isLive = isLive === 'true';
    if (isPublic !== undefined) query.isPublic = isPublic === 'true';
    if (hostId) query.hostId = hostId;
    if (genre) query.genre = genre;
    if (language) query.language = language;
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const liveRooms = await LiveRoom.find(query)
      .sort(sortOptions)
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('hostId', 'name avatar role creatorType');

    const total = await LiveRoom.countDocuments(query);

    res.json({
      liveRooms: liveRooms.map(room => ({
        id: room._id,
        title: room.title,
        description: room.description,
        hostId: room.hostId,
        hostName: room.hostName,
        hostAvatar: room.hostAvatar,
        isLive: room.isLive,
        scheduledStartTime: room.scheduledStartTime,
        actualStartTime: room.actualStartTime,
        endTime: room.endTime,
        maxListeners: room.maxListeners,
        currentListeners: room.currentListeners,
        speakers: room.speakers,
        listeners: room.listeners,
        isPublic: room.isPublic,
        isVerified: room.isVerified,
        genre: room.genre,
        language: room.language,
        tags: room.tags,
        coverImage: room.coverImage,
        createdAt: room.createdAt
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching live rooms:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get live room by ID
exports.getLiveRoomById = async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user ? req.user._id : null;

    const liveRoom = await LiveRoom.findById(roomId)
      .populate('hostId', 'name avatar role creatorType')
      .populate('speakers.userId', 'name avatar role creatorType')
      .populate('listeners.userId', 'name avatar role creatorType');

    if (!liveRoom) {
      return res.status(404).json({ message: 'Live room not found' });
    }

    // Check if user is a speaker or listener
    const isSpeaker = userId ? 
      liveRoom.speakers.some(speaker => speaker.userId._id.toString() === userId.toString()) : false;
    
    const isListener = userId ? 
      liveRoom.listeners.some(listener => listener.userId._id.toString() === userId.toString()) : false;

    res.json({
      liveRoom: {
        id: liveRoom._id,
        title: liveRoom.title,
        description: liveRoom.description,
        hostId: liveRoom.hostId,
        hostName: liveRoom.hostName,
        hostAvatar: liveRoom.hostAvatar,
        isLive: liveRoom.isLive,
        scheduledStartTime: liveRoom.scheduledStartTime,
        actualStartTime: liveRoom.actualStartTime,
        endTime: liveRoom.endTime,
        maxListeners: liveRoom.maxListeners,
        currentListeners: liveRoom.currentListeners,
        speakers: liveRoom.speakers,
        listeners: liveRoom.listeners,
        chatMessages: liveRoom.chatMessages,
        isPublic: liveRoom.isPublic,
        isVerified: liveRoom.isVerified,
        genre: liveRoom.genre,
        language: liveRoom.language,
        tags: liveRoom.tags,
        coverImage: liveRoom.coverImage,
        isSpeaker,
        isListener,
        createdAt: liveRoom.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching live room:', error);
    res.status(500).json({ message: error.message });
  }
};

// Join a live room
exports.joinLiveRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user._id;

    const liveRoom = await LiveRoom.findById(roomId);
    if (!liveRoom) {
      return res.status(404).json({ message: 'Live room not found' });
    }

    // Check if room is at capacity
    if (liveRoom.currentListeners >= liveRoom.maxListeners) {
      return res.status(400).json({ message: 'Live room is at maximum capacity' });
    }

    // Check if user is already in the room
    const isAlreadyInRoom = liveRoom.listeners.some(listener => 
      listener.userId.toString() === userId.toString()
    );

    if (isAlreadyInRoom) {
      return res.status(400).json({ message: 'You are already in this live room' });
    }

    // Add user to listeners
    liveRoom.listeners.push({
      userId,
      joinedAt: new Date()
    });
    liveRoom.currentListeners += 1;
    await liveRoom.save();

    res.json({
      message: 'Successfully joined the live room',
      currentListeners: liveRoom.currentListeners
    });
  } catch (error) {
    console.error('Error joining live room:', error);
    res.status(500).json({ message: error.message });
  }
};

// Leave a live room
exports.leaveLiveRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user._id;

    const liveRoom = await LiveRoom.findById(roomId);
    if (!liveRoom) {
      return res.status(404).json({ message: 'Live room not found' });
    }

    // Remove user from listeners
    const initialCount = liveRoom.currentListeners;
    liveRoom.listeners = liveRoom.listeners.filter(listener => 
      listener.userId.toString() !== userId.toString()
    );
    
    // Update listener count
    liveRoom.currentListeners = Math.max(0, liveRoom.currentListeners - 1);
    await liveRoom.save();

    res.json({
      message: 'Successfully left the live room',
      currentListeners: liveRoom.currentListeners
    });
  } catch (error) {
    console.error('Error leaving live room:', error);
    res.status(500).json({ message: error.message });
  }
};

// Start live room (host only)
exports.startLiveRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user._id;

    const liveRoom = await LiveRoom.findById(roomId);
    if (!liveRoom) {
      return res.status(404).json({ message: 'Live room not found' });
    }

    // Check if user is the host
    if (liveRoom.hostId.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Only the host can start the live room' });
    }

    // Check if room is already live
    if (liveRoom.isLive) {
      return res.status(400).json({ message: 'Live room is already active' });
    }

    // Start the live room
    liveRoom.isLive = true;
    liveRoom.actualStartTime = new Date();
    await liveRoom.save();

    res.json({
      message: 'Live room started successfully',
      isLive: liveRoom.isLive,
      actualStartTime: liveRoom.actualStartTime
    });
  } catch (error) {
    console.error('Error starting live room:', error);
    res.status(500).json({ message: error.message });
  }
};

// End live room (host only)
exports.endLiveRoom = async (req, res) => {
  try {
    const roomId = req.params.id;
    const userId = req.user._id;

    const liveRoom = await LiveRoom.findById(roomId);
    if (!liveRoom) {
      return res.status(404).json({ message: 'Live room not found' });
    }

    // Check if user is the host
    if (liveRoom.hostId.toString() !== userId.toString()) {
      return res.status(401).json({ message: 'Only the host can end the live room' });
    }

    // End the live room
    liveRoom.isLive = false;
    liveRoom.endTime = new Date();
    await liveRoom.save();

    res.json({
      message: 'Live room ended successfully',
      isLive: liveRoom.isLive,
      endTime: liveRoom.endTime
    });
  } catch (error) {
    console.error('Error ending live room:', error);
    res.status(500).json({ message: error.message });
  }
};

// Send chat message in live room
exports.sendChatMessage = async (req, res) => {
  try {
    const roomId = req.params.id;
    const { text } = req.body;
    const userId = req.user._id;

    // Validate message
    if (!text || text.trim().length === 0) {
      return res.status(400).json({ message: 'Chat message is required' });
    }

    if (text.length > 500) {
      return res.status(400).json({ message: 'Chat message must be less than 500 characters' });
    }

    const liveRoom = await LiveRoom.findById(roomId);
    if (!liveRoom) {
      return res.status(404).json({ message: 'Live room not found' });
    }

    // Check if user is in the room
    const isInRoom = liveRoom.listeners.some(listener => 
      listener.userId.toString() === userId.toString()
    ) || liveRoom.speakers.some(speaker => 
      speaker.userId.toString() === userId.toString()
    );

    if (!isInRoom) {
      return res.status(400).json({ message: 'You must join the live room before sending messages' });
    }

    // Get user details for the message
    const user = await User.findById(userId).select('name');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Add message to chat
    const message = {
      userId,
      userName: user.name,
      text: text.trim(),
      timestamp: new Date()
    };

    liveRoom.chatMessages.push(message);
    await liveRoom.save();

    // Return the created message
    res.status(201).json({
      message: 'Chat message sent successfully',
      chatMessage: {
        id: message._id,
        userId: message.userId,
        userName: message.userName,
        text: message.text,
        timestamp: message.timestamp
      }
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get live rooms for a specific host
exports.getHostLiveRooms = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc' } = req.query;

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const liveRooms = await LiveRoom.find({ hostId: userId })
      .sort(sortOptions)
      .skip(parseInt(offset))
      .limit(parseInt(limit));

    const total = await LiveRoom.countDocuments({ hostId: userId });

    res.json({
      liveRooms: liveRooms.map(room => ({
        id: room._id,
        title: room.title,
        description: room.description,
        hostId: room.hostId,
        hostName: room.hostName,
        hostAvatar: room.hostAvatar,
        isLive: room.isLive,
        scheduledStartTime: room.scheduledStartTime,
        actualStartTime: room.actualStartTime,
        endTime: room.endTime,
        maxListeners: room.maxListeners,
        currentListeners: room.currentListeners,
        speakers: room.speakers,
        listeners: room.listeners,
        isPublic: room.isPublic,
        isVerified: room.isVerified,
        genre: room.genre,
        language: room.language,
        tags: room.tags,
        coverImage: room.coverImage,
        createdAt: room.createdAt
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching host live rooms:', error);
    res.status(500).json({ message: error.message });
  }
};