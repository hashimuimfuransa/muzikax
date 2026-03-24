import { Request, Response } from 'express';
import Album from '../models/Album';
import Track from '../models/Track';
import User from '../models/User';
import { deleteFromS3, signAlbumUrls } from '../utils/s3';
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
    
    // Sign album URLs
    const signedAlbum = await signAlbumUrls(album);
    
    res.status(201).json(signedAlbum);
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

    // Sign album URLs
    const signedAlbums = await Promise.all(
      albums.map(album => signAlbumUrls(album))
    );

    res.json({
      albums: signedAlbums,
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

    // Sign album URLs
    const signedAlbum = await signAlbumUrls(album);

    res.json(signedAlbum);
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

    // Sign album URLs
    const signedAlbums = await Promise.all(
      albums.map(album => signAlbumUrls(album))
    );

    res.json(signedAlbums);
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

    // Sign album URLs
    const signedAlbum = await signAlbumUrls(updatedAlbum);

    res.json(signedAlbum);
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};

// Delete album
export const deleteAlbum = async (req: Request, res: Response): Promise<void> => {
  try {
    const user = (req as any).user;
    const album = await Album.findById(req.params['id'])
      .populate('creatorId', 'email name');

    if (!album) {
      res.status(404).json({ message: 'Album not found' });
      return;
    }

    // Check if user is admin OR owns this album
    const isAdmin = user.role === 'admin';
    const isOwner = album.creatorId && (album.creatorId as any)._id.toString() === user._id.toString();
    
    if (!isAdmin && !isOwner) {
      res.status(401).json({ message: 'Not authorized' });
      return;
    }

    // Get deletion reason from query params
    const reason = req.query.reason as string || 'No reason provided';

    // Remove album reference from tracks
    await Track.updateMany(
      { _id: { $in: album.tracks } },
      { $unset: { albumId: "" } }
    );

    // Delete album cover from S3 if it exists
    if (album.coverURL) {
      await deleteFromS3(album.coverURL);
    }

    await album.deleteOne();

    // Send email notification to the artist if admin deleted it
    if (isAdmin && !isOwner && album.creatorId && (album.creatorId as any).email) {
      try {
        const emailService = require('../services/emailService');
        const artistEmail = (album.creatorId as any).email;
        const artistName = (album.creatorId as any).name || 'Artist';
        
        const emailHtml = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #FF4D67 0%, #FFCB2B 100%); padding: 30px; text-align: center;">
              <h1 style="color: white; margin: 0; font-size: 28px;">Album Removal Notice</h1>
            </div>
            
            <div style="padding: 30px; background-color: #f9f9f9;">
              <p style="font-size: 16px; color: #333;">Dear ${artistName},</p>
              
              <p style="font-size: 16px; color: #555; line-height: 1.6;">
                We regret to inform you that your album <strong>"${album.title}"</strong> has been removed from the MuzikaX platform by our administration team.
              </p>
              
              <div style="background-color: #fff; padding: 20px; border-left: 4px solid #FF4D67; margin: 20px 0;">
                <p style="font-size: 14px; color: #666; margin: 0;"><strong>Reason for removal:</strong></p>
                <p style="font-size: 15px; color: #333; margin: 10px 0 0 0;">${reason}</p>
              </div>
              
              <p style="font-size: 16px; color: #555; line-height: 1.6;">
                If you have any questions or concerns about this decision, please don't hesitate to contact our support team.
              </p>
              
              <p style="font-size: 16px; color: #555;">
                Best regards,<br>
                <strong>The MuzikaX Team</strong>
              </p>
            </div>
            
            <div style="background-color: #333; padding: 20px; text-align: center; color: #999; font-size: 14px;">
              <p style="margin: 0;">© ${new Date().getFullYear()} MuzikaX. All rights reserved.</p>
              <p style="margin: 10px 0 0 0;">Rwanda & African Artists Music Platform</p>
            </div>
          </div>
        `;
        
        await emailService.sendEmail({
          to: artistEmail,
          subject: 'Album Removal Notice - MuzikaX',
          html: emailHtml
        });
        
        console.log(`✅ Email notification sent to ${artistEmail} about album deletion`);
      } catch (emailError) {
        console.error('❌ Failed to send email notification:', emailError);
        // Don't fail the request if email fails
      }
    }

    res.json({ 
      message: 'Album removed successfully',
      notifiedArtist: isAdmin && !isOwner
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message || 'Failed to delete album' });
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