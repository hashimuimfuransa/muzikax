"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreatorTracks = exports.getCreatorAnalytics = void 0;
const Track_1 = __importDefault(require("../models/Track"));
/**
 * Get creator analytics data
 * This is an independent controller for creator-specific functionality
 */
const getCreatorAnalytics = async (req, res) => {
    try {
        // Log the incoming request for debugging
        console.log('Creator Analytics - getCreatorAnalytics called');
        console.log('User in request:', req.user);
        // Check if user is authenticated
        if (!req.user) {
            console.log('Creator Analytics - No user found in request');
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }
        const creatorId = req.user._id;
        console.log('Creator Analytics - Creator ID:', creatorId);
        // Check if user is a creator
        if (req.user.role !== 'creator') {
            console.log('Creator Analytics - User is not a creator, role:', req.user.role);
            res.status(401).json({ message: 'Not authorized as creator' });
            return;
        }
        // Get total tracks
        const totalTracks = await Track_1.default.countDocuments({ creatorId });
        console.log('Creator Analytics - Total tracks:', totalTracks);
        // Get total plays for all tracks
        const tracks = await Track_1.default.find({ creatorId });
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
    }
    catch (error) {
        console.error('Creator Analytics - Error in getCreatorAnalytics:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getCreatorAnalytics = getCreatorAnalytics;
/**
 * Get creator tracks
 * This is an independent controller for fetching creator's tracks
 */
const getCreatorTracks = async (req, res) => {
    try {
        // Log the incoming request for debugging
        console.log('Creator Tracks - getCreatorTracks called');
        console.log('User in request:', req.user);
        // Check if user is authenticated
        if (!req.user) {
            console.log('Creator Tracks - No user found in request');
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }
        const creatorId = req.user._id;
        console.log('Creator Tracks - Creator ID:', creatorId);
        // Check if user is a creator
        if (req.user.role !== 'creator') {
            console.log('Creator Tracks - User is not a creator, role:', req.user.role);
            res.status(401).json({ message: 'Not authorized as creator' });
            return;
        }
        // Parse query parameters
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 10;
        const skip = (page - 1) * limit;
        console.log('Creator Tracks - Page:', page, 'Limit:', limit, 'Skip:', skip);
        // Get tracks for this creator
        const tracks = await Track_1.default.find({ creatorId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Track_1.default.countDocuments({ creatorId });
        const response = {
            tracks,
            page,
            pages: Math.ceil(total / limit),
            total
        };
        console.log('Creator Tracks - Response:', response);
        res.json(response);
    }
    catch (error) {
        console.error('Creator Tracks - Error in getCreatorTracks:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getCreatorTracks = getCreatorTracks;
//# sourceMappingURL=creatorController.js.map