import { Request, Response } from 'express';
import Track from '../models/Track';
import User from '../models/User';
import { protect } from '../utils/jwt';

// Upload track with cover image
export const uploadTrack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, genre, type, audioURL, coverURL } = req.body;
    const user = (req as any).user;

    console.log('Upload track request received:', { 
      title, 
      description, 
      genre, 
      type, 
      audioURL, 
      coverURL,
      userId: user._id,
      userRole: user.role
    });

    // Validate required fields
    if (!title || !audioURL) {
      res.status(400).json({ message: 'Title and audio URL are required' });
      return;
    }

    // Check if user is a creator
    if (user.role !== 'creator') {
      res.status(401).json({ message: 'Not authorized as creator' });
      return;
    }

    // If no cover image provided, try to use user's avatar
    let finalCoverURL = coverURL;
    if (!finalCoverURL) {
      const userData = await User.findById(user._id);
      if (userData && userData.avatar) {
        finalCoverURL = userData.avatar;
        console.log('Using user avatar as cover image:', finalCoverURL);
      }
    }

    const track = await Track.create({
      creatorId: user._id,
      creatorType: user.creatorType,
      title,
      description: description || '',
      genre: genre || 'afrobeat',
      type: type || 'song',
      audioURL,
      coverURL: finalCoverURL || ''
    });

    console.log('Track created successfully:', track._id);
    res.status(201).json(track);
  } catch (error: any) {
    console.error('Error uploading track:', error);
    res.status(500).json({ message: error.message || 'Failed to upload track' });
  }
};

// Export middleware for route protection
export { protect };