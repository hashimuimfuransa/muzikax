import { Request, Response } from 'express';
import Comment from '../models/Comment';
import Track from '../models/Track';
import mongoose from 'mongoose';
// Add a comment to a track
export const addCommentToTrack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trackId, text } = req.body;
    const user = (req as any).user;

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
    const comment = await Comment.create({
      trackId,
      userId: user._id,
      text
    });

    // Add comment to track's comments array
    await Track.findByIdAndUpdate(trackId, {
      $push: { comments: comment._id }
    });

    // Populate the user info for the response
    await comment.populate('userId', 'name');

    res.status(201).json(comment);
  } catch (error: any) {
    console.error('Error adding comment:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get comments for a track
export const getCommentsForTrack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { trackId } = req.params;

    // Find comments for the track and populate user info
    const comments = await Comment.find({ trackId: new mongoose.Types.ObjectId(trackId) })
      .populate('userId', 'name')
      .sort({ createdAt: -1 });
    res.json(comments);
  } catch (error: any) {
    console.error('Error fetching comments:', error);
    res.status(500).json({ message: error.message });
  }
};

// Delete a comment
export const deleteComment = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const user = (req as any).user;

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
    await comment.deleteOne();

    res.json({ message: 'Comment removed' });
  } catch (error: any) {
    console.error('Error deleting comment:', error);
    res.status(500).json({ message: error.message });
  }
};