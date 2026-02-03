const express = require('express');
const router = express.Router();
const { 
  createCommunityPost, 
  getCommunityPosts, 
  getTrendingPosts, 
  likeCommunityPost, 
  shareCommunityPost, 
  viewCommunityPost, 
  createPoll, 
  voteInPoll,
  getCommunityPostById,
  sendMessageToArtist,
  deleteCommunityPost
} = require('../controllers/communityPostController');
const { protect } = require('../utils/jwt');

// Create a new community post (authenticated users only)
router.post('/', protect, createCommunityPost);

// Get all community posts (publicly accessible with optional authentication for personalization)
router.get('/', getCommunityPosts);

// Get trending posts
router.get('/trending', getTrendingPosts);

// Get post by ID
router.get('/:id', getCommunityPostById);

// Like/unlike a post (authenticated users only)
router.post('/:id/like', protect, likeCommunityPost);

// Share a post (authenticated users only)
router.post('/:id/share', protect, shareCommunityPost);

// View a post (authenticated users only)
router.post('/:id/view', protect, viewCommunityPost);

// Create a poll for a post (authenticated users only, must be post owner)
router.post('/:id/poll', protect, createPoll);

// Vote in a poll (authenticated users only)
router.post('/:id/vote', protect, voteInPoll);

// Send message to an artist (authenticated users only)
router.post('/message-artist', protect, sendMessageToArtist);

// Delete a post (authenticated users only, must be post owner)
router.delete('/:id', protect, deleteCommunityPost);

module.exports = router;