import { Request, Response } from 'express';
import Track from '../models/Track';

/**
 * Get creator analytics data
 * This is an independent controller for creator-specific functionality
 */
export const getCreatorAnalytics = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log the incoming request for debugging
    console.log('Creator Analytics - getCreatorAnalytics called');
    console.log('User in request:', (req as any).user);
    
    // Check if user is authenticated
    if (!(req as any).user) {
      console.log('Creator Analytics - No user found in request');
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const creatorId = (req as any).user._id;
    console.log('Creator Analytics - Creator ID:', creatorId);
    
    // Check if user is a creator
    if ((req as any).user.role !== 'creator') {
      console.log('Creator Analytics - User is not a creator, role:', (req as any).user.role);
      res.status(401).json({ message: 'Not authorized as creator' });
      return;
    }

    // Get total tracks
    const totalTracks = await Track.countDocuments({ creatorId });
    console.log('Creator Analytics - Total tracks:', totalTracks);

    // Get total plays for all tracks
    const tracks = await Track.find({ creatorId });
    const totalPlays = tracks.reduce((sum, track) => sum + track.plays, 0);
    console.log('Creator Analytics - Total plays:', totalPlays);

    // Get total likes for all tracks
    const totalLikes = tracks.reduce((sum, track) => sum + track.likes, 0);
    console.log('Creator Analytics - Total likes:', totalLikes);

    const response = {
      totalTracks,
      totalPlays,
      totalLikes,
      tracks: tracks.length
    };
    
    console.log('Creator Analytics - Response:', response);
    res.json(response);
  } catch (error: any) {
    console.error('Creator Analytics - Error in getCreatorAnalytics:', error);
    res.status(500).json({ message: error.message });
  }
};

/**
 * Get creator tracks
 * This is an independent controller for fetching creator's tracks
 */
export const getCreatorTracks = async (req: Request, res: Response): Promise<void> => {
  try {
    // Log the incoming request for debugging
    console.log('Creator Tracks - getCreatorTracks called');
    console.log('User in request:', (req as any).user);
    
    // Check if user is authenticated
    if (!(req as any).user) {
      console.log('Creator Tracks - No user found in request');
      res.status(401).json({ message: 'Not authorized, no user found' });
      return;
    }

    const creatorId = (req as any).user._id;
    console.log('Creator Tracks - Creator ID:', creatorId);
    
    // Check if user is a creator
    if ((req as any).user.role !== 'creator') {
      console.log('Creator Tracks - User is not a creator, role:', (req as any).user.role);
      res.status(401).json({ message: 'Not authorized as creator' });
      return;
    }

    // Parse query parameters
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const skip = (page - 1) * limit;
    
    console.log('Creator Tracks - Page:', page, 'Limit:', limit, 'Skip:', skip);

    // Get tracks for this creator with populated creator information including WhatsApp contact
    const tracks = await Track.find({ creatorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creatorId', 'name avatar whatsappContact');
      
    const total = await Track.countDocuments({ creatorId });

    const response = {
      tracks,
      page,
      pages: Math.ceil(total / limit),
      total
    };
    
    console.log('Creator Tracks - Response:', response);
    res.json(response);
  } catch (error: any) {
    console.error('Creator Tracks - Error in getCreatorTracks:', error);
    res.status(500).json({ message: error.message });
  }
};