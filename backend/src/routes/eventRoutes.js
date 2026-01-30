const express = require('express');
const router = express.Router();
const { protect } = require('../utils/jwt');
const { getUpcomingEvents, createEvent } = require('../controllers/eventController');

// Public routes
router.get('/upcoming', getUpcomingEvents);

// Protected routes
router.post('/', protect, createEvent);

module.exports = router;