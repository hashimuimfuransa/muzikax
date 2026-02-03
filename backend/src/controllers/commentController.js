const Comment = require('../models/Comment');
const Track = require('../models/Track');

// Add a comment to a track
const addCommentToTrack = async (req, res) => {
  try {
    const { trackId, text } = req.body;
    const user = req.user;

    // Validate required fields
    if (!trackId || !text) {
      res.status(400).json({ message: 'Track ID and comment text are required' });
      return;
    }

    // Validate text length
    if (text.length > 500) {
      res.status(400).json({ message: 'Comment text must be less than 500 characters' });
      return;
    }

    // Create the comment
    const comment = new Comment({
      trackId,
      userId: user._id,
      text
    });
    
    await comment.save();

    // Add comment to track's comments array
    await Track.findByIdAndUpdate(trackId, {
      $push: { comments: comment._id }
    });

    // Populate the user info for the response
    await comment.populate('userId', 'name');

    res.status(201).json(comment);
  } catch (error) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get comments for a track
const getCommentsForTrack = async (req, res) => {
  try {
    const { trackId } = req.params;
    
    console.log('Fetching comments for track:', trackId);

    // Validate trackId
    if (!trackId) {
      console.log('No track ID provided');
      res.status(400).json({ message: 'Track ID is required' });
      return;
    }

    // Find comments for the track and populate user info
    console.log('Finding comments for track ID:', trackId);
    const comments = await Comment.find({ trackId })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });

    console.log('Found', comments.length, 'comments');
    res.json(comments);
  } catch (error) {
    console.error('Error fetching comments:', error);
    // Log more details about the error
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    res.status(500).json({ message: 'Internal server error', error: error.message });
  }
};

// Delete a comment
const deleteComment = async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Find the comment
    const comment = await Comment.findById(id);

    if (!comment) {
      res.status(404).json({ message: 'Comment not found' });
      return;
    }

    // Check if user is the owner of the comment or admin
    if (comment.userId.toString() !== user._id.toString() && user.role !== 'admin') {
      res.status(401).json({ message: 'Not authorized to delete this comment' });
      return;
    }

    // Remove comment from track's comments array
    await Track.findByIdAndUpdate(comment.trackId, {
      $pull: { comments: comment._id }
    });

    // Delete the comment
    await Comment.deleteOne({ _id: id });

    res.json({ message: 'Comment removed' });
  } catch (error) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  addCommentToTrack,
  getCommentsForTrack,
  deleteComment
};