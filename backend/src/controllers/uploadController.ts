import { Request, Response } from 'express';
import Track from '../models/Track';
import User from '../models/User';
import { protect } from '../utils/jwt';

// Helper function to check if user has WhatsApp contact
const checkUserHasWhatsApp = async (userId: string): Promise<boolean> => {
  try {
    const user = await User.findById(userId);
    return user ? !!user.whatsappContact && user.whatsappContact.trim().length > 0 : false;
  } catch (error) {
    console.error('Error checking user WhatsApp contact:', error);
    return false;
  }
};

// Upload track with cover image
export const uploadTrack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, genre, type, paymentType, price, audioURL, coverURL, albumId } = req.body;
    const user = (req as any).user;

    console.log('Upload track request received:', { 
      title, 
      description, 
      genre, 
      type, 
      paymentType,
      price,
      audioURL, 
      coverURL,
      albumId,
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

    // If track is a beat, validate that creator has WhatsApp contact
    if (type === 'beat') {
      const hasWhatsApp = await checkUserHasWhatsApp(user._id);
      if (!hasWhatsApp) {
        res.status(400).json({ 
          message: 'Beats require a WhatsApp contact number. Please add your WhatsApp number in your profile before uploading beats.',
          redirectToProfile: true
        });
        return;
      }
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

    const trackData: any = {
      creatorId: user._id,
      creatorType: user.creatorType,
      title,
      description: description || '',
      genre: genre || 'afrobeat',
      type: type || 'song',
      paymentType: paymentType || 'free',
      price: price || 0,
      audioURL,
      coverURL: finalCoverURL || ''
    };

    // Add album reference if provided
    if (albumId) {
      trackData.albumId = albumId;
    }

    const track = await Track.create(trackData);

    console.log('Track created successfully:', track);
    res.status(201).json(track);
  } catch (error: any) {
    console.error('Error uploading track:', error);
    res.status(500).json({ message: error.message || 'Failed to upload track' });
  }
};

// Export middleware for route protection
export { protect };