const express = require('express');
const router = express.Router();
const { 
  createLiveRoom,
  getLiveRooms,
  getLiveRoomById,
  joinLiveRoom,
  leaveLiveRoom,
  startLiveRoom,
  endLiveRoom,
  sendChatMessage,
  getHostLiveRooms
} = require('../controllers/liveRoomController');
const { protect } = require('../utils/jwt');

// Create a new live room (authenticated users only)
router.post('/', protect, createLiveRoom);

// Get all live rooms (publicly accessible)
router.get('/', getLiveRooms);

// Get live room by ID (publicly accessible)
router.get('/:id', getLiveRoomById);

// Get live rooms for a specific host (publicly accessible)
router.get('/host/:userId', getHostLiveRooms);

// Join a live room (authenticated users only)
router.post('/:id/join', protect, joinLiveRoom);

// Leave a live room (authenticated users only)
router.post('/:id/leave', protect, leaveLiveRoom);

// Start a live room (authenticated users only, must be host)
router.post('/:id/start', protect, startLiveRoom);

// End a live room (authenticated users only, must be host)
router.post('/:id/end', protect, endLiveRoom);

// Send chat message in live room (authenticated users only, must be in room)
router.post('/:id/chat', protect, sendChatMessage);

module.exports = router;