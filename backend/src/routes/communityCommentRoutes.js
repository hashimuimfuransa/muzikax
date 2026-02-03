const express = require('express');
const router = express.Router();
const { 
  addCommentToCommunityPost,
  getCommentsForCommunityPost,
  likeCommunityComment,
  reportCommunityComment,
  getCommunityCommentById,
  deleteCommunityComment
} = require('../controllers/communityCommentController');
const { protect } = require('../utils/jwt');

// Add a comment to a community post (authenticated users only)
router.post('/', protect, addCommentToCommunityPost);

// Get comments for a community post (publicly accessible)
router.get('/post/:postId', getCommentsForCommunityPost);

// Get comment by ID (publicly accessible)
router.get('/:id', getCommunityCommentById);

// Like/unlike a comment (authenticated users only)
router.post('/:id/like', protect, likeCommunityComment);

// Report a comment (authenticated users only)
router.post('/:id/report', protect, reportCommunityComment);

// Delete a comment (authenticated users only, must be comment owner or admin)
router.delete('/:id', protect, deleteCommunityComment);

module.exports = router;