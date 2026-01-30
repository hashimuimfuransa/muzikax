const express = require('express');
const { 
  addCommentToTrack, 
  getCommentsForTrack, 
  deleteComment 
} = require('../controllers/commentController');
const { protect } = require('../utils/jwt');

const router = express.Router();

// Protected routes - require authentication
router.route('/').post(protect, addCommentToTrack);
router.route('/track/:trackId').get(getCommentsForTrack);
router.route('/:id').delete(protect, deleteComment);

module.exports = router;