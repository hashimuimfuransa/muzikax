"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRecentlyPlayed = exports.addRecentlyPlayed = void 0;
const User = require("../models/User");
const mongoose_1 = require("mongoose");

// Add track to recently played
const addRecentlyPlayed = async (req, res) => {
    try {
        const { trackId } = req.body;
        const userId = req.user?.id;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        if (!trackId || !mongoose_1.default.Types.ObjectId.isValid(trackId)) {
            res.status(400).json({ message: 'Invalid track ID' });
            return;
        }

        // Find the user and update their recently played tracks
        const user = await User.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Ensure user.recentlyPlayed is initialized as an array
        if (!user.recentlyPlayed) {
            user.recentlyPlayed = [];
        }

        // Remove the track if it already exists in recently played
        user.recentlyPlayed = user.recentlyPlayed.filter(
            item => !(item.trackId && item.trackId.equals && item.trackId.equals(trackId))
        );

        // Add the track to the beginning of the recently played array
        user.recentlyPlayed.unshift({
            trackId: new mongoose_1.default.Types.ObjectId(trackId),
            playedAt: new Date()
        });

        // Limit to 50 recently played tracks
        if (user.recentlyPlayed.length > 50) {
            user.recentlyPlayed = user.recentlyPlayed.slice(0, 50);
        }

        await user.save();

        res.status(200).json({ message: 'Track added to recently played' });
    } catch (error) {
        console.error('Error adding recently played track:', error);
        // Check if it's a MongoDB connection error
        if (error.name === 'MongoNetworkError' || (error.code === 'ECONNRESET')) {
            res.status(503).json({ message: 'Database connection temporarily unavailable' });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
exports.addRecentlyPlayed = addRecentlyPlayed;

// Get user's recently played tracks
const getRecentlyPlayed = async (req, res) => {
    try {
        const userId = req.user?.id;
        const limit = parseInt(req.query.limit) || 20;

        if (!userId) {
            res.status(401).json({ message: 'Unauthorized' });
            return;
        }

        // Find the user and populate their recently played tracks
        const user = await User.findById(userId).populate({
            path: 'recentlyPlayed.trackId',
            model: 'Track',
            populate: {
                path: 'creatorId',
                model: 'User',
                select: 'name'
            }
        });

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        // Ensure user.recentlyPlayed is initialized as an array
        if (!user.recentlyPlayed) {
            user.recentlyPlayed = [];
        }

        // Filter out any recently played entries where the track no longer exists
        const validRecentlyPlayed = user.recentlyPlayed.filter(
            item => item.trackId !== null
        );

        // Map to the desired format
        const tracks = validRecentlyPlayed.slice(0, limit).map(item => {
            const track = item.trackId;
            return {
                _id: track._id,
                title: track.title,
                audioURL: track.audioURL,
                coverURL: track.coverURL,
                genre: track.genre,
                type: track.type,
                plays: track.plays,
                likes: track.likes,
                creatorId: track.creatorId,
                createdAt: track.createdAt,
                playedAt: item.playedAt
            };
        });

        res.status(200).json({ tracks });
    } catch (error) {
        console.error('Error fetching recently played tracks:', error);
        // Check if it's a MongoDB connection error
        if (error.name === 'MongoNetworkError' || (error.code === 'ECONNRESET')) {
            res.status(503).json({ message: 'Database connection temporarily unavailable' });
        } else {
            res.status(500).json({ message: 'Internal server error' });
        }
    }
};
exports.getRecentlyPlayed = getRecentlyPlayed;