const express = require('express');
const router = express.Router();
const { 
  createChat,
  getUserChats,
  getChatMessages,
  sendChatMessage
} = require('../controllers/chatController');
const { protect } = require('../utils/jwt');

// Chat routes
router.post('/', protect, createChat);
router.get('/', protect, getUserChats);
router.get('/:chatId/messages', protect, getChatMessages);
router.post('/:chatId/messages', protect, sendChatMessage);

module.exports = router;