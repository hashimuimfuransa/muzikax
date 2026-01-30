const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');
const Circle = require('../models/Circle');
const Track = require('../models/Track');
const Message = require('../models/Message');
const Chat = require('../models/Chat');

// Create a new community post
exports.createCommunityPost = async (req, res) => {
  try {
    const { content, postType, circleId, mediaUrl, language, location, genre, tags, relatedTrackId, relatedArtistId } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!content || content.trim().length === 0) {
      return res.status(400).json({ message: 'Post content is required' });
    }

    if (content.length > 2000) {
      return res.status(400).json({ message: 'Post content must be less than 2000 characters' });
    }

    // Get user details
    const user = await User.findById(userId).select('name avatar role creatorType');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Prepare post data
    const postData = {
      userId,
      userName: user.name,
      userAvatar: user.avatar || '',
      userRole: user.role === 'creator' ? (user.creatorType || 'Creator') : 'User',
      postType: postType || 'text',
      content: content.trim()
    };

    // Add optional fields if provided
    if (circleId) {
      const circle = await Circle.findById(circleId);
      if (!circle) {
        return res.status(404).json({ message: 'Circle not found' });
      }
      postData.circleId = circleId;
      postData.circleName = circle.name;
    }
    
    if (mediaUrl) postData.mediaUrl = mediaUrl;
    if (language) postData.language = language;
    if (location) postData.location = location;
    if (genre) postData.genre = genre;
    if (tags && Array.isArray(tags)) postData.tags = tags;
    if (relatedTrackId) postData.relatedTrackId = relatedTrackId;
    if (relatedArtistId) postData.relatedArtistId = relatedArtistId;

    // Create new post
    const post = new CommunityPost(postData);
    const savedPost = await post.save();

    res.status(201).json({
      message: 'Post created successfully',
      post: {
        id: savedPost._id,
        userId: savedPost.userId,
        userName: savedPost.userName,
        userAvatar: savedPost.userAvatar,
        userRole: savedPost.userRole,
        circleId: savedPost.circleId,
        circleName: savedPost.circleName,
        postType: savedPost.postType,
        content: savedPost.content,
        mediaUrl: savedPost.mediaUrl,
        mediaThumbnail: savedPost.mediaThumbnail,
        likes: savedPost.likes,
        comments: savedPost.comments,
        shares: savedPost.shares,
        views: savedPost.views,
        isPinned: savedPost.isPinned,
        isVerified: savedPost.isVerified,
        language: savedPost.language,
        location: savedPost.location,
        genre: savedPost.genre,
        tags: savedPost.tags,
        relatedTrackId: savedPost.relatedTrackId,
        relatedArtistId: savedPost.relatedArtistId,
        createdAt: savedPost.createdAt
      }
    });
  } catch (error) {
    console.error('Error creating community post:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all community posts with filters
exports.getCommunityPosts = async (req, res) => {
  try {
    const { 
      limit = 20, 
      offset = 0, 
      sortBy = 'createdAt', 
      sortOrder = 'desc', 
      circleId, 
      postType, 
      language, 
      location, 
      genre,
      userId,
      tags
    } = req.query;

    // Build query
    const query = {};
    
    if (circleId) query.circleId = circleId;
    if (postType) query.postType = postType;
    if (language) query.language = language;
    if (location) query.location = location;
    if (genre) query.genre = genre;
    if (userId) query.userId = userId;
    
    if (tags) {
      const tagArray = Array.isArray(tags) ? tags : [tags];
      query.tags = { $in: tagArray };
    }

    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const posts = await CommunityPost.find(query)
      .sort(sortOptions)
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('userId', 'name avatar role creatorType')
      .populate('circleId', 'name description type');

    const total = await CommunityPost.countDocuments(query);

    res.json({
      posts: posts.map(post => ({
        id: post._id,
        userId: post.userId,
        userName: post.userName,
        userAvatar: post.userAvatar,
        userRole: post.userRole,
        circleId: post.circleId,
        circleName: post.circleName,
        postType: post.postType,
        content: post.content,
        mediaUrl: post.mediaUrl,
        mediaThumbnail: post.mediaThumbnail,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        views: post.views,
        isPinned: post.isPinned,
        isVerified: post.isVerified,
        language: post.language,
        location: post.location,
        genre: post.genre,
        tags: post.tags,
        relatedTrackId: post.relatedTrackId,
        relatedArtistId: post.relatedArtistId,
        challengeId: post.challengeId,
        pollOptions: post.pollOptions,
        pollEndsAt: post.pollEndsAt,
        createdAt: post.createdAt
      })),
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching community posts:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get trending posts
exports.getTrendingPosts = async (req, res) => {
  try {
    const { period = 'week', limit = 10 } = req.query;
    
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch(period) {
      case 'day':
        startDate = new Date(now.setDate(now.getDate() - 1));
        break;
      case 'week':
        startDate = new Date(now.setDate(now.getDate() - 7));
        break;
      case 'month':
        startDate = new Date(now.setMonth(now.getMonth() - 1));
        break;
      default:
        startDate = new Date(now.setDate(now.getDate() - 7));
    }

    const posts = await CommunityPost.find({
      createdAt: { $gte: startDate }
    })
    .sort({ likes: -1, comments: -1, shares: -1 })
    .limit(parseInt(limit));

    res.json({
      posts: posts.map(post => ({
        id: post._id,
        userId: post.userId,
        userName: post.userName,
        userAvatar: post.userAvatar,
        userRole: post.userRole,
        circleId: post.circleId,
        circleName: post.circleName,
        postType: post.postType,
        content: post.content,
        mediaUrl: post.mediaUrl,
        mediaThumbnail: post.mediaThumbnail,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        views: post.views,
        isPinned: post.isPinned,
        isVerified: post.isVerified,
        language: post.language,
        location: post.location,
        genre: post.genre,
        tags: post.tags,
        relatedTrackId: post.relatedTrackId,
        relatedArtistId: post.relatedArtistId,
        createdAt: post.createdAt
      }))
    });
  } catch (error) {
    console.error('Error fetching trending posts:', error);
    res.status(500).json({ message: error.message });
  }
};

// Like/unlike a post
exports.likeCommunityPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    const alreadyLiked = post.likedBy.includes(userId);
    
    if (alreadyLiked) {
      // Unlike the post
      post.likes = Math.max(0, post.likes - 1);
      post.likedBy = post.likedBy.filter(id => id.toString() !== userId.toString());
    } else {
      // Like the post
      post.likes += 1;
      post.likedBy.push(userId);
    }

    await post.save();

    res.json({
      message: alreadyLiked ? 'Post unliked' : 'Post liked',
      likes: post.likes,
      liked: !alreadyLiked
    });
  } catch (error) {
    console.error('Error liking community post:', error);
    res.status(500).json({ message: error.message });
  }
};

// Share a post
exports.shareCommunityPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has already shared the post
    const alreadyShared = post.sharedBy.includes(userId);
    
    if (!alreadyShared) {
      post.shares += 1;
      post.sharedBy.push(userId);
      await post.save();
    }

    res.json({
      message: 'Post shared successfully',
      shares: post.shares,
      shared: true
    });
  } catch (error) {
    console.error('Error sharing community post:', error);
    res.status(500).json({ message: error.message });
  }
};

// View a post (increment view count)
exports.viewCommunityPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has already viewed the post
    const alreadyViewed = post.viewedBy.includes(userId);
    
    if (!alreadyViewed) {
      post.views += 1;
      post.viewedBy.push(userId);
      await post.save();
    }

    res.json({
      message: 'Post viewed',
      views: post.views
    });
  } catch (error) {
    console.error('Error viewing community post:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a poll
exports.createPoll = async (req, res) => {
  try {
    const postId = req.params.id;
    const { pollOptions, pollEndsAt } = req.body;
    const userId = req.user._id;

    // Verify user owns the post
    const post = await CommunityPost.findOne({ _id: postId, userId: userId });
    if (!post) {
      return res.status(404).json({ message: 'Post not found or unauthorized' });
    }

    // Validate poll options
    if (!pollOptions || !Array.isArray(pollOptions) || pollOptions.length < 2) {
      return res.status(400).json({ message: 'Poll must have at least 2 options' });
    }

    if (pollOptions.some(option => !option.trim())) {
      return res.status(400).json({ message: 'Poll options cannot be empty' });
    }

    // Set poll options
    post.pollOptions = pollOptions.map(option => ({
      option: option.trim(),
      votes: 0,
      voters: []
    }));

    if (pollEndsAt) {
      post.pollEndsAt = new Date(pollEndsAt);
    }

    await post.save();

    res.json({
      message: 'Poll created successfully',
      pollOptions: post.pollOptions,
      pollEndsAt: post.pollEndsAt
    });
  } catch (error) {
    console.error('Error creating poll:', error);
    res.status(500).json({ message: error.message });
  }
};

// Vote in a poll
exports.voteInPoll = async (req, res) => {
  try {
    const postId = req.params.id;
    const { optionIndex } = req.body;
    const userId = req.user._id;

    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    if (!post.pollOptions || !post.pollOptions.length) {
      return res.status(400).json({ message: 'This post does not have a poll' });
    }

    if (post.pollEndsAt && new Date() > new Date(post.pollEndsAt)) {
      return res.status(400).json({ message: 'This poll has ended' });
    }

    if (optionIndex < 0 || optionIndex >= post.pollOptions.length) {
      return res.status(400).json({ message: 'Invalid poll option' });
    }

    // Check if user has already voted
    const userHasVoted = post.pollOptions.some(option => 
      option.voters.some(voterId => voterId.toString() === userId.toString())
    );

    if (userHasVoted) {
      return res.status(400).json({ message: 'You have already voted in this poll' });
    }

    // Add vote
    post.pollOptions[optionIndex].votes += 1;
    post.pollOptions[optionIndex].voters.push(userId);

    await post.save();

    res.json({
      message: 'Vote recorded successfully',
      pollOptions: post.pollOptions
    });
  } catch (error) {
    console.error('Error voting in poll:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get post by ID
exports.getCommunityPostById = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user ? req.user._id : null;

    const post = await CommunityPost.findById(postId)
      .populate('userId', 'name avatar role creatorType')
      .populate('circleId', 'name description type');

    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if user has liked this post
    const userLiked = userId ? post.likedBy.includes(userId) : false;

    res.json({
      post: {
        id: post._id,
        userId: post.userId,
        userName: post.userName,
        userAvatar: post.userAvatar,
        userRole: post.userRole,
        circleId: post.circleId,
        circleName: post.circleName,
        postType: post.postType,
        content: post.content,
        mediaUrl: post.mediaUrl,
        mediaThumbnail: post.mediaThumbnail,
        likes: post.likes,
        comments: post.comments,
        shares: post.shares,
        views: post.views,
        isPinned: post.isPinned,
        isVerified: post.isVerified,
        language: post.language,
        location: post.location,
        genre: post.genre,
        tags: post.tags,
        relatedTrackId: post.relatedTrackId,
        relatedArtistId: post.relatedArtistId,
        challengeId: post.challengeId,
        pollOptions: post.pollOptions,
        pollEndsAt: post.pollEndsAt,
        liked: userLiked,
        createdAt: post.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching community post:', error);
    res.status(500).json({ message: error.message });
  }
};

// Send message to an artist
exports.sendMessageToArtist = async (req, res) => {
  try {
    const { artistId, message } = req.body;
    const senderId = req.user._id;
    
    // Validate required fields
    if (!artistId || !message) {
      return res.status(400).json({ message: 'Artist ID and message are required' });
    }
    
    if (message.length > 2000) {
      return res.status(400).json({ message: 'Message must be less than 2000 characters' });
    }
    
    // Check if the recipient is a valid user
    const recipientUser = await User.findById(artistId);
    if (!recipientUser) {
      return res.status(404).json({ message: 'Artist not found' });
    }
    
    // Find or create a chat between the sender and artist
    let chat = await Chat.findOne({
      chatType: 'artist_fan',
      participants: { $all: [senderId, artistId] }
    });
    
    if (!chat) {
      chat = new Chat({
        chatType: 'artist_fan',
        chatName: `Chat with ${recipientUser.name}`,
        participants: [
          { userId: senderId },
          { userId: artistId }
        ],
        admins: [artistId]
      });
      await chat.save();
    }
    
    // Create the message
    const newMessage = new Message({
      senderId,
      recipientId: artistId,
      message,
      messageType: 'artist_message',
      chatRoomId: chat._id
    });
    
    await newMessage.save();
    
    // Update chat with the last message
    chat.lastMessage = newMessage._id;
    await chat.save();
    
    // Update unread counts
    const unreadCountEntry = chat.unreadCounts.find(entry => entry.userId.toString() === artistId.toString());
    if (unreadCountEntry) {
      unreadCountEntry.count += 1;
    } else {
      chat.unreadCounts.push({ userId: artistId, count: 1 });
    }
    await chat.save();
    
    // Populate sender info for response
    await newMessage.populate('senderId', 'name avatar');
    
    res.status(200).json({ 
      message: 'Message sent successfully',
      data: {
        message: {
          _id: newMessage._id,
          senderId: newMessage.senderId._id,
          senderName: newMessage.senderId.name,
          senderAvatar: newMessage.senderId.avatar,
          message: newMessage.message,
          messageType: newMessage.messageType,
          read: newMessage.read,
          delivered: newMessage.delivered,
          createdAt: newMessage.createdAt
        },
        chatId: chat._id
      }
    });
  } catch (error) {
    console.error('Error sending message to artist:', error);
    res.status(500).json({ message: error.message });
  }
};

// Create a new chat
exports.createChat = async (req, res) => {
  try {
    const { recipientId, chatType, participants } = req.body;
    const userId = req.user._id;
    
    if (!recipientId && !participants) {
      return res.status(400).json({ message: 'Recipient ID or participants list is required' });
    }
    
    let chatParticipants = [];

    if (recipientId) {
      // Direct chat
      chatParticipants = [
        { userId: userId },
        { userId: recipientId }
      ];
      
      // Check if a direct chat already exists
      const existingChat = await Chat.findOne({
        chatType: 'direct',
        participants: { $size: 2, $all: [{ $elemMatch: { userId } }, { $elemMatch: { userId: recipientId } }] }
      });
      
      if (existingChat) {
        return res.status(200).json({
          message: 'Chat already exists',
          chat: existingChat
        });
      }
    } else if (participants) {
      // Group chat
      chatParticipants = participants.map(id => ({ userId: id }));
    }
    
    const chat = new Chat({
      chatType: chatType || 'direct',
      participants: chatParticipants,
      admins: [userId]
    });
    
    await chat.save();
    
    res.status(201).json({
      message: 'Chat created successfully',
      chat
    });
  } catch (error) {
    console.error('Error creating chat:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user chats
exports.getUserChats = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const chats = await Chat.find({
      'participants.userId': userId,
      isArchived: { $ne: true }
    })
    .populate('participants.userId', 'name avatar role')
    .populate('lastMessage', 'message messageType read createdAt')
    .sort({ updatedAt: -1 });
    
    res.status(200).json({
      message: 'Chats retrieved successfully',
      chats
    });
  } catch (error) {
    console.error('Error getting user chats:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get chat messages
exports.getChatMessages = async (req, res) => {
  try {
    const { chatId } = req.params;
    const { page = 1, limit = 20 } = req.query;
    const userId = req.user._id;
    
    // Verify user is part of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.userId': userId
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or you are not part of this chat' });
    }
    
    const messages = await Message.find({ chatRoomId: chatId })
      .populate('senderId', 'name avatar')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    // Update unread count for this user to 0
    const unreadIndex = chat.unreadCounts.findIndex(entry => 
      entry.userId.toString() === userId.toString()
    );
    if (unreadIndex !== -1) {
      chat.unreadCounts[unreadIndex].count = 0;
      await chat.save();
    }
    
    res.status(200).json({
      message: 'Messages retrieved successfully',
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: await Message.countDocuments({ chatRoomId: chatId })
      }
    });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({ message: error.message });
  }
};

// Send a chat message
exports.sendChatMessage = async (req, res) => {
  try {
    const { chatId, message, messageType = 'chat_message' } = req.body;
    const senderId = req.user._id;
    
    if (!chatId || !message) {
      return res.status(400).json({ message: 'Chat ID and message are required' });
    }
    
    if (message.length > 2000) {
      return res.status(400).json({ message: 'Message must be less than 2000 characters' });
    }
    
    // Verify user is part of the chat
    const chat = await Chat.findOne({
      _id: chatId,
      'participants.userId': senderId
    });
    
    if (!chat) {
      return res.status(404).json({ message: 'Chat not found or you are not part of this chat' });
    }
    
    // Create the message
    const newMessage = new Message({
      senderId,
      recipientId: chat.participants.find(p => p.userId.toString() !== senderId.toString()).userId,
      message,
      messageType,
      chatRoomId: chatId
    });
    
    await newMessage.save();
    
    // Update chat with the last message
    chat.lastMessage = newMessage._id;
    
    // Update unread counts for all recipients except sender
    for (const participant of chat.participants) {
      if (participant.userId.toString() !== senderId.toString()) {
        const unreadCountEntry = chat.unreadCounts.find(entry => 
          entry.userId.toString() === participant.userId.toString()
        );
        if (unreadCountEntry) {
          unreadCountEntry.count += 1;
        } else {
          chat.unreadCounts.push({ userId: participant.userId, count: 1 });
        }
      }
    }
    
    await chat.save();
    
    // Populate sender info for response
    await newMessage.populate('senderId', 'name avatar');
    
    res.status(200).json({
      message: 'Message sent successfully',
      data: {
        message: {
          _id: newMessage._id,
          senderId: newMessage.senderId._id,
          senderName: newMessage.senderId.name,
          senderAvatar: newMessage.senderId.avatar,
          message: newMessage.message,
          messageType: newMessage.messageType,
          read: newMessage.read,
          delivered: newMessage.delivered,
          createdAt: newMessage.createdAt
        }
      }
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a community post (only post owner can delete)
exports.deleteCommunityPost = async (req, res) => {
  try {
    const postId = req.params.id;
    const userId = req.user._id;

    // Validate the post ID
    if (!postId || postId === 'undefined') {
      return res.status(400).json({ message: 'Invalid post ID' });
    }

    // Find the post
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // Check if the user is the post owner
    if (post.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Unauthorized: You can only delete your own posts' });
    }

    // Delete the post
    await CommunityPost.findByIdAndDelete(postId);

    res.status(200).json({
      message: 'Post deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting community post:', error);
    res.status(500).json({ message: error.message });
  }
};
