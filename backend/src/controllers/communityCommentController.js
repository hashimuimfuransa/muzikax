const CommunityComment = require('../models/CommunityComment');
const CommunityPost = require('../models/CommunityPost');
const User = require('../models/User');

// Add a comment to a community post
exports.addCommentToCommunityPost = async (req, res) => {
  try {
    const { postId, text, parentId } = req.body;
    const userId = req.user._id;

    // Validate required fields
    if (!postId || !text) {
      return res.status(400).json({ message: 'Post ID and comment text are required' });
    }

    if (text.length > 1000) {
      return res.status(400).json({ message: 'Comment text must be less than 1000 characters' });
    }

    // Check if post exists
    const post = await CommunityPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found' });
    }

    // If this is a reply, check if parent comment exists
    if (parentId) {
      const parentComment = await CommunityComment.findById(parentId);
      if (!parentComment || parentComment.postId.toString() !== postId.toString()) {
        return res.status(404).json({ message: 'Parent comment not found' });
      }
    }

    // Get user details
    const user = await User.findById(userId).select('name avatar role creatorType');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Create the comment
    const comment = new CommunityComment({
      postId,
      userId,
      userName: user.name,
      userAvatar: user.avatar || '',
      userRole: user.role === 'creator' ? (user.creatorType || 'Creator') : 'User',
      text: text.trim(),
      parentId
    });

    const savedComment = await comment.save();

    // Update post comment count
    await CommunityPost.findByIdAndUpdate(postId, {
      $inc: { comments: 1 }
    });

    // If this is a reply, update parent comment reply count
    if (parentId) {
      await CommunityComment.findByIdAndUpdate(parentId, {
        $inc: { replies: 1 }
      });
    }

    // Populate user info for response
    await savedComment.populate('userId', 'name avatar role creatorType');

    res.status(201).json({
      message: 'Comment added successfully',
      comment: {
        id: savedComment._id,
        postId: savedComment.postId,
        userId: savedComment.userId,
        userName: savedComment.userName,
        userAvatar: savedComment.userAvatar,
        userRole: savedComment.userRole,
        text: savedComment.text,
        likes: savedComment.likes,
        replies: savedComment.replies,
        parentId: savedComment.parentId,
        isVerified: savedComment.isVerified,
        language: savedComment.language,
        createdAt: savedComment.createdAt
      }
    });
  } catch (error) {
    console.error('Error adding comment to community post:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get comments for a community post
exports.getCommentsForCommunityPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { limit = 20, offset = 0, sortBy = 'createdAt', sortOrder = 'desc', includeReplies = 'true' } = req.query;

    // Build query
    let query = { postId, parentId: null }; // Top-level comments only initially
    
    // Sort options
    const sortOptions = {};
    sortOptions[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Get top-level comments
    const topLevelComments = await CommunityComment.find(query)
      .sort(sortOptions)
      .skip(parseInt(offset))
      .limit(parseInt(limit))
      .populate('userId', 'name avatar role creatorType');

    // If includeReplies is true, get replies for each top-level comment
    let commentsWithReplies = [];
    
    if (includeReplies === 'true') {
      for (const comment of topLevelComments) {
        // Get replies for this comment
        const replies = await CommunityComment.find({ parentId: comment._id })
          .sort({ createdAt: -1 })
          .populate('userId', 'name avatar role creatorType');
        
        commentsWithReplies.push({
          ...comment.toObject(),
          replies
        });
      }
    } else {
      commentsWithReplies = topLevelComments.map(comment => comment.toObject());
    }

    // Get total count
    const total = await CommunityComment.countDocuments({ postId, parentId: null });

    res.json({
      comments: commentsWithReplies,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
        hasMore: offset + limit < total
      }
    });
  } catch (error) {
    console.error('Error fetching comments for community post:', error);
    res.status(500).json({ message: error.message });
  }
};

// Like/unlike a comment
exports.likeCommunityComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;

    const comment = await CommunityComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    const alreadyLiked = comment.likedBy.includes(userId);
    
    if (alreadyLiked) {
      // Unlike the comment
      comment.likes = Math.max(0, comment.likes - 1);
      comment.likedBy = comment.likedBy.filter(id => id.toString() !== userId.toString());
    } else {
      // Like the comment
      comment.likes += 1;
      comment.likedBy.push(userId);
    }

    await comment.save();

    res.json({
      message: alreadyLiked ? 'Comment unliked' : 'Comment liked',
      likes: comment.likes,
      liked: !alreadyLiked
    });
  } catch (error) {
    console.error('Error liking community comment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Report a comment
exports.reportCommunityComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const { reason } = req.body;
    const userId = req.user._id;

    const comment = await CommunityComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user has already reported this comment
    const alreadyReported = comment.reportedBy.includes(userId);
    
    if (alreadyReported) {
      return res.status(400).json({ message: 'You have already reported this comment' });
    }

    // Mark as reported and add reporter
    comment.isReported = true;
    comment.reportedBy.push(userId);
    comment.reportedReason = reason;

    await comment.save();

    res.json({
      message: 'Comment reported successfully'
    });
  } catch (error) {
    console.error('Error reporting community comment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get comment by ID
exports.getCommunityCommentById = async (req, res) => {
  try {
    const commentId = req.params.id;

    const comment = await CommunityComment.findById(commentId)
      .populate('userId', 'name avatar role creatorType')
      .populate('postId', 'content postType');

    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    res.json({
      comment: {
        id: comment._id,
        postId: comment.postId,
        userId: comment.userId,
        userName: comment.userName,
        userAvatar: comment.userAvatar,
        userRole: comment.userRole,
        text: comment.text,
        likes: comment.likes,
        replies: comment.replies,
        parentId: comment.parentId,
        isVerified: comment.isVerified,
        language: comment.language,
        isReported: comment.isReported,
        createdAt: comment.createdAt
      }
    });
  } catch (error) {
    console.error('Error fetching community comment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a comment
exports.deleteCommunityComment = async (req, res) => {
  try {
    const commentId = req.params.id;
    const userId = req.user._id;

    // Find the comment
    const comment = await CommunityComment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: 'Comment not found' });
    }

    // Check if user is the owner of the comment or admin
    if (comment.userId.toString() !== userId.toString() && req.user.role !== 'admin') {
      return res.status(401).json({ message: 'Not authorized to delete this comment' });
    }

    // If this is a reply, update parent comment's reply count
    if (comment.parentId) {
      await CommunityComment.findByIdAndUpdate(comment.parentId, {
        $inc: { replies: -1 }
      });
    } else {
      // If this is a top-level comment, reduce the post's comment count
      await CommunityPost.findByIdAndUpdate(comment.postId, {
        $inc: { comments: -1 }
      });
    }

    // Delete the comment and all its replies
    await CommunityComment.deleteMany({
      $or: [
        { _id: commentId },
        { parentId: commentId }
      ]
    });

    res.json({ message: 'Comment and its replies removed' });
  } catch (error) {
    console.error('Error deleting community comment:', error);
    res.status(500).json({ message: error.message });
  }
};