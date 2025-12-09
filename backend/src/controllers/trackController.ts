import { Request, Response } from 'express';
import Track from '../models/Track';
// import User from '../models/User'; // Not used in this controller

// Upload track
export const uploadTrack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, genre, type, audioURL, coverURL } = req.body;
    const user = (req as any).user;

    const track = await Track.create({
      creatorId: user._id,
      creatorType: user.creatorType,
      title,
      genre,
      type,
      audioURL,
      coverURL
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
      .populate('creatorId', 'name avatar')
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
    const track = await Track.findById(req.params['id'])
      .populate('creatorId', 'name avatar bio socials');

    if (!track) {
      res.status(404).json({ message: 'Track not found' });
      return;
    }

    res.json(track);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get tracks by creator
export const getTracksByCreator = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const skip = (page - 1) * limit;

    const tracks = await Track.find({ creatorId: req.params['creatorId'] as string })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

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

// Update track
export const updateTrack = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, genre, coverURL } = req.body;

    const track = await Track.findById(req.params['id']);

    if (!track) {
      res.status(404).json({ message: 'Track not found' });
      return;
    }

    // Check if user is the creator
    if (track.creatorId.toString() !== (req as any).user._id.toString()) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    track.title = title || track.title;
    track.genre = genre || track.genre;
    track.coverURL = coverURL || track.coverURL;

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
    if (
      track.creatorId.toString() !== (req as any).user._id.toString() &&
      (req as any).user.role !== 'admin'
    ) {
      res.status(401).json({ message: 'Not authorized' });
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

    res.json(track);
  } catch (error: any) {
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
      .populate('creatorId', 'name avatar');

    res.json(tracks);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};