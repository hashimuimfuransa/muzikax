const express = require('express');
const { addRecentlyPlayed, getRecentlyPlayed } = require('../controllers/recentlyPlayedController');
const { protect } = require('../utils/jwt');

const router = express.Router();

// Add track to recently played
router.post('/', protect, addRecentlyPlayed);

// Get user's recently played tracks
router.get('/', protect, getRecentlyPlayed);

module.exports = router;