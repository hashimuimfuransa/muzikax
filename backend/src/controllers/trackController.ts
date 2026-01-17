import { Request, Response } from 'express';
import Track from '../models/Track';
import ListenerGeography from '../models/ListenerGeography';
import geoip from 'geoip-lite';
// import User from '../models/User'; // Not used in this controller

// Upload track
export const uploadTrack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, genre, type, paymentType, audioURL, coverURL } = req.body;
    const user = (req as any).user;

    // Validate required fields
    if (!title || !audioURL) {
      res.status(400).json({ message: 'Title and audio URL are required' });
      return;
    }

    const track = await Track.create({
      creatorId: user._id,
      creatorType: user.creatorType,
      title,
      description: description || '',
      genre: genre || 'afrobeat',
      type: type || 'song',
      paymentType: paymentType || 'free', // Default to free if not specified
      audioURL,
      coverURL: coverURL || ''
    });

    res.status(201).json(track);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tracks
export const getAllTracks = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const skip = (page - 1) * limit;

    const tracks = await Track.find()
      .populate('creatorId', 'name avatar whatsappContact')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Track.countDocuments();

    res.json({
      tracks,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get track by ID
export const getTrackById = async (req: Request, res: Response): Promise<void> => {
  try {
    // For edit track functionality, we don't want to populate the creatorId
    // as it makes authorization checks more complex
    const track = await Track.findById(req.params['id']);

    if (!track) {
      res.status(404).json({ message: 'Track not found' });
      return;
    }

    res.json(track);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get all tracks by creator (without pagination)
export const getTracksByCreatorSimple = async (req: Request, res: Response): Promise<void> => {
  try {
    const tracks = await Track.find({ creatorId: req.params['creatorId'] as string })
      .sort({ createdAt: -1 })
      .populate('creatorId', 'name avatar whatsappContact');

    res.json(tracks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get tracks by creator
export const getTracksByCreator = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if pagination parameters are provided
    const pageParam = req.query['page'];
    const limitParam = req.query['limit'];
    
    // If no pagination parameters, return all tracks
    if (pageParam === undefined && limitParam === undefined) {
      const tracks = await Track.find({ creatorId: req.params['creatorId'] as string })
        .sort({ createdAt: -1 })
        .populate('creatorId', 'name avatar whatsappContact');
      
      res.json(tracks);
      return;
    }
    
    // Otherwise, use pagination
    const page = parseInt(pageParam as string) || 1;
    const limit = parseInt(limitParam as string) || 10;
    const skip = (page - 1) * limit;

    const tracks = await Track.find({ creatorId: req.params['creatorId'] as string })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creatorId', 'name avatar whatsappContact');

    const total = await Track.countDocuments({ creatorId: req.params['creatorId'] as string });

    res.json({
      tracks,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get tracks by authenticated user (for profile page)
export const getTracksByAuthUser = async (req: Request, res: Response): Promise<void> => {
  try {
    // Check if pagination parameters are provided
    const pageParam = req.query['page'];
    const limitParam = req.query['limit'];
    
    // Get creator ID from authenticated user
    const creatorId = (req as any).user._id;
    
    // If no pagination parameters, return all tracks
    if (pageParam === undefined && limitParam === undefined) {
      const tracks = await Track.find({ creatorId })
        .sort({ createdAt: -1 })
        .populate('creatorId', 'name avatar whatsappContact');
      
      res.json(tracks);
      return;
    }
    
    // Otherwise, use pagination
    const page = parseInt(pageParam as string) || 1;
    const limit = parseInt(limitParam as string) || 10;
    const skip = (page - 1) * limit;

    const tracks = await Track.find({ creatorId })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('creatorId', 'name avatar whatsappContact');

    const total = await Track.countDocuments({ creatorId });

    res.json({
      tracks,
      page,
      pages: Math.ceil(total / limit),
      total
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update track
export const updateTrack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, genre, coverURL, description, paymentType } = req.body;

    const track = await Track.findById(req.params['id']);

    if (!track) {
      res.status(404).json({ message: 'Track not found' });
      return;
    }

    // Check if user is the creator
    // Handle both cases: when creatorId is populated (object) or not (ObjectId)
    const trackOwnerId = track.creatorId && typeof track.creatorId === 'object' && '_id' in track.creatorId ? 
      (track.creatorId._id as any).toString() : 
      (track.creatorId as any).toString();
      
    if (trackOwnerId !== (req as any).user._id.toString()) {
      res.status(401).json({ 
        message: 'You are not authorized to edit this track.',
        trackOwnerId,
        userId: (req as any).user._id.toString()
      });
      return;
    }

    // Update fields if provided
    if (title !== undefined) track.title = title;
    if (genre !== undefined) track.genre = genre;
    if (coverURL !== undefined) track.coverURL = coverURL;
    if (description !== undefined) track.description = description;
    if (paymentType !== undefined) track.paymentType = paymentType;

    const updatedTrack = await track.save();

    res.json(updatedTrack);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete track
export const deleteTrack = async (req: Request, res: Response): Promise<void> => {
  try {
    const track = await Track.findById(req.params['id']);

    if (!track) {
      res.status(404).json({ message: 'Track not found' });
      return;
    }

    // Check if user is the creator or admin
    // Handle both cases: when creatorId is populated (object) or not (ObjectId)
    const trackOwnerId = track.creatorId && typeof track.creatorId === 'object' && '_id' in track.creatorId ? 
      (track.creatorId._id as any).toString() : 
      (track.creatorId as any).toString();
      
    if (
      trackOwnerId !== (req as any).user._id.toString() &&
      (req as any).user.role !== 'admin'
    ) {
      res.status(401).json({ 
        message: 'You are not authorized to delete this track.',
        trackOwnerId,
        userId: (req as any).user._id.toString()
      });
      return;
    }

    await track.deleteOne();
    res.json({ message: 'Track removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Increment play count
export const incrementPlayCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const track = await Track.findByIdAndUpdate(
      req.params['id'],
      { $inc: { plays: 1 } },
      { new: true }
    );

    if (!track) {
      res.status(404).json({ message: 'Track not found' });
      return;
    }

    // Capture IP address and store geography data
    const ipAddress = req.ip || req.connection.remoteAddress || '';
    if (ipAddress) {
      // Remove IPv6 prefix if present
      const cleanIpAddress = ipAddress.replace('::ffff:', '');
      
      // Get geography data from IP
      const geo = geoip.lookup(cleanIpAddress);
      
      if (geo) {
        // Store geography data
        await ListenerGeography.create({
          trackId: track._id,
          creatorId: track.creatorId,
          ipAddress: cleanIpAddress,
          country: geo.country,
          region: geo.region,
          city: geo.city,
          latitude: geo.ll[0],
          longitude: geo.ll[1],
          timestamp: new Date()
        });
      }
    }

    res.json(track);
  } catch (error: any) {
    console.error('Error incrementing play count:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get trending tracks
export const getTrendingTracks = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query['limit'] as string) || 10;

    const tracks = await Track.find()
      .sort({ plays: -1, createdAt: -1 })
      .limit(limit)
      .populate('creatorId', 'name avatar whatsappContact');

    res.json(tracks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};