"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

Object.defineProperty(exports, "__esModule", { value: true });
exports.getSimilarTracks = exports.getGeneralRecommendations = exports.getPersonalizedRecommendations = void 0;

const Track = require("../models/Track");
const User = require("../models/User");
const mongoose_1 = require("mongoose");/**
 * Get personalized recommendations based on user's recently played tracks and preferences
 */
const getPersonalizedRecommendations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Personalized recommendations route hit');
        const userId = req.user && req.user.id;
        const limit = parseInt(req.query['limit']) || 5;
        const excludeTrackId = req.query['excludeTrackId'];

        console.log('User ID:', userId);
        console.log('Limit:', limit);
        console.log('Exclude Track ID:', excludeTrackId);

        if (!userId) {
            console.log('No user ID found, returning 401');
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Get user's recently played tracks
        const user = yield User.findById(userId).populate({            path: 'recentlyPlayed.trackId',
            model: 'Track',
            populate: {
                path: 'creatorId',
                model: 'User',
                select: 'name genres'
            }
        });

        if (!user) {
            console.log('User not found, returning 404');
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Extract genres from recently played tracks
        const genrePreferences = {};
        const creatorPreferences = {};

        user.recentlyPlayed.forEach((item) => {
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
        const query = {};

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

        console.log('Query:', query);

        // Get sort option from query parameters
        const sortBy = req.query.sortBy || 'popular'; // Default to popular
        let sortOption = { plays: -1 }; // Default sort by popularity
        
        if (sortBy === 'recent') {
            sortOption = { createdAt: -1 }; // Sort by newest first
        } else if (sortBy === 'views') {
            sortOption = { plays: -1 }; // Sort by most viewed
        } else if (sortBy === 'new_and_popular') {
            sortOption = { createdAt: -1, plays: -1 }; // Sort by newest first, then by most viewed
        }

        // Get recommended tracks
        const recommendedTracks = yield Track.find(query)
            .populate({
                path: 'creatorId',
                model: 'User',
                select: 'name'
            })
            .sort(sortOption) // Sort based on selected option
            .limit(limit * 2) // Get more tracks to filter and shuffle
            .lean();        console.log('Found tracks:', recommendedTracks.length);

        // Shuffle and limit results
        const shuffledTracks = recommendedTracks
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, limit); // Limit to requested amount

        res.status(200).json({ tracks: shuffledTracks });
    } catch (error) {
        console.error('Error getting personalized recommendations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getPersonalizedRecommendations = getPersonalizedRecommendations;

/**
 * Get general recommendations based on trending/popular tracks
 */
const getGeneralRecommendations = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('General recommendations route hit');
        const limit = parseInt(req.query['limit']) || 5;
        const excludeTrackId = req.query['excludeTrackId'];

        console.log('Limit:', limit);
        console.log('Exclude Track ID:', excludeTrackId);

        // Get trending tracks (sorted by plays)
        const query = {};
        if (excludeTrackId) {
            query._id = { $ne: excludeTrackId };
        }
        
        // Exclude specific track types if requested
        const excludeType = req.query['excludeType'];
        if (excludeType) {
            query.type = { $ne: excludeType };
        }

        // Get sort option from query parameters
        const sortBy = req.query.sortBy || 'popular'; // Default to popular
        let sortOption = { plays: -1 }; // Default sort by popularity
        
        if (sortBy === 'recent') {
            sortOption = { createdAt: -1 }; // Sort by newest first
        } else if (sortBy === 'views') {
            sortOption = { plays: -1 }; // Sort by most viewed
        } else if (sortBy === 'new_and_popular') {
            sortOption = { createdAt: -1, plays: -1 }; // Sort by newest first, then by most viewed
        }

        console.log('Query:', query);
        console.log('Sort by:', sortBy);

        const tracks = yield Track.find(query)
            .populate({
                path: 'creatorId',
                model: 'User',
                select: 'name'
            })
            .sort(sortOption) // Sort based on selected option
            .limit(limit)
            .lean();

        console.log('Found tracks:', tracks.length);

        res.status(200).json({ tracks });
    } catch (error) {
        console.error('Error getting general recommendations:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getGeneralRecommendations = getGeneralRecommendations;

/**
 * Get similar tracks based on a specific track's genre and creator
 */
const getSimilarTracks = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        console.log('Similar tracks route hit');
        const trackId = req.params['trackId'];
        const limit = parseInt(req.query['limit']) || 5;

        console.log('Track ID:', trackId);
        console.log('Limit:', limit);

        // Get the reference track
        const referenceTrack = yield Track.findById(trackId);
        if (!referenceTrack) {
            console.log('Track not found, returning 404');
            res.status(404).json({ message: 'Track not found' });
            return;
        }

        // Build the query to find similar tracks
        const query = {
            _id: { $ne: new mongoose_1.default.Types.ObjectId(trackId) } // Exclude the reference track itself
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

        // Get sort option from query parameters
        const sortBy = req.query.sortBy || 'popular'; // Default to popular
        let sortOption = { plays: -1 }; // Default sort by popularity
        
        if (sortBy === 'recent') {
            sortOption = { createdAt: -1 }; // Sort by newest first
        } else if (sortBy === 'views') {
            sortOption = { plays: -1 }; // Sort by most viewed
        } else if (sortBy === 'new_and_popular') {
            sortOption = { createdAt: -1, plays: -1 }; // Sort by newest first, then by most viewed
        }

        console.log('Query:', query);
        console.log('Sort by:', sortBy);

        // Find similar tracks
        const similarTracks = yield Track.find(query)
            .populate({
                path: 'creatorId',
                model: 'User',
                select: 'name'
            })
            .sort(sortOption) // Sort based on selected option
            .limit(limit * 2) // Get more tracks to shuffle
            .lean();

        console.log('Found tracks:', similarTracks.length);

        // Shuffle and limit results
        const shuffledTracks = similarTracks
            .sort(() => 0.5 - Math.random()) // Shuffle
            .slice(0, limit); // Limit to requested amount

        res.status(200).json({ tracks: shuffledTracks });
    } catch (error) {
        console.error('Error getting similar tracks:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});
exports.getSimilarTracks = getSimilarTracks;