const express = require('express');
const router = express.Router();
const { 
  createCircle,
  getCircles,
  getCircleById,
  joinCircle,
  leaveCircle,
  getCirclePosts,
  addModeratorToCircle,
  removeModeratorFromCircle
} = require('../controllers/circleController');
const { protect } = require('../utils/jwt');

// Create a new circle (authenticated users only)
router.post('/', protect, createCircle);

// Get all circles (publicly accessible)
router.get('/', getCircles);

// Get circle by ID (publicly accessible)
router.get('/:id', getCircleById);

// Join a circle (authenticated users only)
router.post('/:id/join', protect, joinCircle);

// Leave a circle (authenticated users only)
router.post('/:id/leave', protect, leaveCircle);

// Get posts in a circle (publicly accessible)
router.get('/:id/posts', getCirclePosts);

// Add moderator to circle (authenticated users only, must be circle owner)
router.post('/:id/moderator', protect, addModeratorToCircle);

// Remove moderator from circle (authenticated users only, must be circle owner)
router.delete('/:id/moderator', protect, removeModeratorFromCircle);

module.exports = router;