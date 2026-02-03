import { Request, Response } from 'express';
import Track from '../models/Track';
import User from '../models/User';
import { JwtPayload } from 'jsonwebtoken';
import mongoose from 'mongoose';

// Extend the Request type to include user property
interface AuthRequest extends Request {
  user?: JwtPayload & { id: string };
}

/**
 * Get personalized recommendations based on user's recently played tracks and preferences
 */
export const getPersonalizedRecommendations = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const limit = parseInt(req.query['limit'] as string) || 5;
    const excludeTrackId = req.query['excludeTrackId'] as string;

    if (!userId) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    // Get user's recently played tracks
    const user = await User.findById(userId).populate({
      path: 'recentlyPlayed.trackId',
      model: 'Track',
      populate: {
        path: 'creatorId',
        model: 'User',
        select: 'name genres'
      }
    });

    if (!user) {
      res.status(404).json({ message: 'User not found' });
      return;
    }

    // Extract genres from recently played tracks
    const genrePreferences: Record<string, number> = {};
    const creatorPreferences: Record<string, number> = {};
    
    user.recentlyPlayed.forEach((item: any) => {
      if (item.trackId) {
        // Count genre preferences
        if (item.trackId.genre) {
          genrePreferences[item.trackId.genre] = (genrePreferences[item.trackId.genre] || 0) + 1;
        }
        
        // Count creator preferences
        if (item.trackId.creatorId) {
          const creatorId = item.trackId.creatorId._id.toString();
          creatorPreferences[creatorId] = (creatorPreferences[creatorId] || 0) + 1;
        }
      }
    });

    // Sort genres by preference score
    const sortedGenres = Object.entries(genrePreferences)
      .sort((a, b) => b[1] - a[1])
      .map(([genre]) => genre);

    // Sort creators by preference score
    const sortedCreators = Object.entries(creatorPreferences)
      .sort((a, b) => b[1] - a[1])
      .map(([creatorId]) => creatorId);

    // Build query for recommendations
    const query: any = {};
    
    // Exclude the current track if specified
    if (excludeTrackId) {
      query._id = { $ne: excludeTrackId };
    }

    // Prioritize tracks with preferred genres
    if (sortedGenres.length > 0) {
      query.$or = [
        { genre: { $in: sortedGenres.slice(0, 3) } }, // Top 3 preferred genres
        { creatorId: { $in: sortedCreators.slice(0, 2) } }, // Top 2 preferred creators
        { plays: { $gte: 100 } } // Popular tracks as fallback
      ];
    } else {
      // Fallback to popular tracks if no genre preferences
      query.plays = { $gte: 100 };
    }

    // Get recommended tracks
    const recommendedTracks = await Track.find(query)
      .populate({
        path: 'creatorId',
        model: 'User',
        select: 'name'
      })
      .sort({ plays: -1 }) // Sort by popularity
      .limit(limit * 2) // Get more tracks to filter and shuffle
      .lean();

    // Shuffle and limit results
    const shuffledTracks = recommendedTracks
      .sort(() => 0.5 - Math.random()) // Shuffle
      .slice(0, limit); // Limit to requested amount

    res.status(200).json({ tracks: shuffledTracks });
  } catch (error: any) {
    console.error('Error getting personalized recommendations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get general recommendations based on trending/popular tracks
 */
export const getGeneralRecommendations = async (req: Request, res: Response): Promise<void> => {
  try {
    const limit = parseInt(req.query['limit'] as string) || 5;
    const excludeTrackId = req.query['excludeTrackId'] as string;

    // Get trending tracks (sorted by plays)
    const query: any = {};
    if (excludeTrackId) {
      query._id = { $ne: excludeTrackId };
    }

    const tracks = await Track.find(query)
      .populate({
        path: 'creatorId',
        model: 'User',
        select: 'name'
      })
      .sort({ plays: -1 }) // Sort by popularity
      .limit(limit)
      .lean();

    res.status(200).json({ tracks });
  } catch (error: any) {
    console.error('Error getting general recommendations:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

/**
 * Get similar tracks based on a specific track's genre and creator
 */
export const getSimilarTracks = async (req: Request, res: Response): Promise<void> => {
  try {
    const trackId = req.params['trackId'];
    const limit = parseInt(req.query['limit'] as string) || 5;

    // Get the reference track
    const referenceTrack = await Track.findById(trackId);
    if (!referenceTrack) {
      res.status(404).json({ message: 'Track not found' });
      return;
    }

    // Build the query to find similar tracks
    const query: any = {
      _id: { $ne: new mongoose.Types.ObjectId(trackId) } // Exclude the reference track itself
    };

    // Add similarity conditions
    const orConditions = [];
    
    // Same genre
    if (referenceTrack.genre) {
      orConditions.push({ genre: referenceTrack.genre });
    }
    
    // Same creator
    if (referenceTrack.creatorId) {
      orConditions.push({ creatorId: referenceTrack.creatorId });
    }
    
    // Same type
    if (referenceTrack.type) {
      orConditions.push({ type: referenceTrack.type });
    }
    
    // Add conditions to query if any exist
    if (orConditions.length > 0) {
      query.$or = orConditions;
    }

    // Find similar tracks
    const similarTracks = await Track.find(query)
      .populate({
        path: 'creatorId',
        model: 'User',
        select: 'name'
      })
      .sort({ plays: -1 }) // Sort by popularity
      .limit(limit * 2) // Get more tracks to shuffle
      .lean();

    // Shuffle and limit results
    const shuffledTracks = similarTracks
      .sort(() => 0.5 - Math.random()) // Shuffle
      .slice(0, limit); // Limit to requested amount

    res.status(200).json({ tracks: shuffledTracks });
  } catch (error: any) {
    console.error('Error getting similar tracks:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};