const Chat = require('../models/Chat');
const User = require('../models/User');
const Message = require('../models/Message');

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
      message,
      messageType,
      chatRoomId: chatId
    });

    // For direct chats, set recipientId; for group chats, leave it null
    if (chat.participants.length === 2) {
      // Direct chat - find the other participant
      const otherParticipant = chat.participants.find(p => p.userId.toString() !== senderId.toString());
      if (otherParticipant) {
        newMessage.recipientId = otherParticipant.userId;
      }
    } else {
      // Group chat - no specific recipient
      newMessage.recipientId = null;
    }
    
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

