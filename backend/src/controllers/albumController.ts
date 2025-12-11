import { Request, Response } from 'express';
import Album from '../models/Album';
import Track from '../models/Track';
import User from '../models/User';
import { protect } from '../utils/jwt';

// Create a new album
export const createAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, genre, coverURL, trackIds } = req.body;
    const user = (req as any).user;

    console.log('Create album request received:', { 
      title, 
      description, 
      genre, 
      coverURL,
      trackIds,
      userId: user._id,
      userRole: user.role
    });

    // Validate required fields
    if (!title || !trackIds || !Array.isArray(trackIds) || trackIds.length === 0) {
      res.status(400).json({ message: 'Title and at least one track ID are required' });
      return;
    }

    // Check if user is a creator
    if (user.role !== 'creator') {
      res.status(401).json({ message: 'Not authorized as creator' });
      return;
    }

    // Verify that all tracks belong to the creator
    const tracks = await Track.find({
      _id: { $in: trackIds },
      creatorId: user._id
    });

    if (tracks.length !== trackIds.length) {
      res.status(400).json({ message: 'Some tracks do not belong to you or do not exist' });
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

    const album = await Album.create({
      creatorId: user._id,
      creatorType: user.creatorType,
      title,
      description: description || '',
      genre: genre || 'afrobeat',
      coverURL: finalCoverURL || '',
      tracks: trackIds,
      releaseDate: new Date()
    });

    // Update tracks to reference this album
    await Track.updateMany(
      { _id: { $in: trackIds } },
      { $set: { albumId: album._id } }
    );

    console.log('Album created successfully:', album._id);
    res.status(201).json(album);
  } catch (error: any) {
    console.error('Error creating album:', error);
    res.status(500).json({ message: error.message || 'Failed to create album' });
  }
};

// Get all albums
export const getAllAlbums = async (req: Request, res: Response): Promise<void> => {
  try {
    const page = parseInt(req.query['page'] as string) || 1;
    const limit = parseInt(req.query['limit'] as string) || 10;
    const skip = (page - 1) * limit;

    const albums = await Album.find()
      .populate('creatorId', 'name avatar')
      .populate({ path: 'tracks', populate: { path: 'creatorId', select: 'name avatar' } })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    const total = await Album.countDocuments();

    res.json({
      albums,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get album by ID
export const getAlbumById = async (req: Request, res: Response): Promise<void> => {
  try {
    const album = await Album.findById(req.params['id'])
      .populate('creatorId', 'name avatar')
      .populate({ path: 'tracks', populate: { path: 'creatorId', select: 'name avatar' } });

    if (!album) {
      res.status(404).json({ message: 'Album not found' });
      return;
    }

    res.json(album);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Get albums by creator
export const getAlbumsByCreator = async (req: Request, res: Response): Promise<void> => {
  try {
    const creatorId = req.params['creatorId'];
    const query = { creatorId: creatorId } as any;
    const albums = await Album.find(query).lean()
      .populate({ path: 'tracks', populate: { path: 'creatorId', select: 'name avatar' } })
      .sort({ createdAt: -1 });

    res.json(albums);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Update album
export const updateAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description, genre, coverURL, trackIds } = req.body;
    const user = (req as any).user;

    let album = await Album.findById(req.params['id']);

    if (!album) {
      res.status(404).json({ message: 'Album not found' });
      return;
    }

    // Check if user owns this album
    if (album.creatorId.toString() !== user._id.toString()) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // If trackIds are provided, verify they belong to the creator
    if (trackIds && Array.isArray(trackIds) && trackIds.length > 0) {
      const tracks = await Track.find({
        _id: { $in: trackIds },
        creatorId: user._id
      });

      if (tracks.length !== trackIds.length) {
        res.status(400).json({ message: 'Some tracks do not belong to you or do not exist' });
        return;
      }

      album.tracks = trackIds;
    }

    // Update other fields if provided
    if (title) album.title = title;
    if (description !== undefined) album.description = description;
    if (genre) album.genre = genre;
    if (coverURL !== undefined) album.coverURL = coverURL;

    const updatedAlbum = await album.save();

    res.json(updatedAlbum);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete album
export const deleteAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const album = await Album.findById(req.params['id']);

    if (!album) {
      res.status(404).json({ message: 'Album not found' });
      return;
    }

    // Check if user owns this album
    if (album.creatorId.toString() !== user._id.toString()) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Remove album reference from tracks
    await Track.updateMany(
      { _id: { $in: album.tracks } },
      { $unset: { albumId: "" } }
    );

    await album.deleteOne();
    res.json({ message: 'Album removed' });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Increment album play count
export const incrementAlbumPlayCount = async (req: Request, res: Response): Promise<void> => {
  try {
    const album = await Album.findById(req.params['id']);

    if (!album) {
      res.status(404).json({ message: 'Album not found' });
      return;
    }

    album.plays += 1;
    await album.save();

    res.json({ message: 'Play count incremented', plays: album.plays });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Export middleware for route protection
export { protect };