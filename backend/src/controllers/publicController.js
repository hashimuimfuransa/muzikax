"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicCreatorStats = exports.getPublicCreatorProfile = exports.getPublicCreators = void 0;
const User_1 = require("../models/User");
const Track_1 = require("../models/Track");
/**
 * Get public creators (accessible to all users)
 * This endpoint is completely public and requires no authentication
 */
const getPublicCreators = async (req, res) => {
    try {
        const limit = parseInt(req.query['limit']) || 10;
        // Find users with role 'creator' and sort by followersCount descending
        const creators = await User_1.find({ role: 'creator' })
            .select('-password')
            .sort({ followersCount: -1, createdAt: -1 })
            .limit(limit);
        res.json({
            users: creators
        });
    }
    catch (error) {
        console.error('Error fetching public creators:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getPublicCreators = getPublicCreators;
/**
 * Get a specific creator's public profile by ID
 * This endpoint is completely public and requires no authentication
 */
const getPublicCreatorProfile = async (req, res) => {
    try {
        const creatorId = req.params['id'];
        console.log('Fetching creator profile for ID:', creatorId);
        
        if (!creatorId) {
            res.status(400).json({ message: 'Creator ID is required' });
            return;
        }
        
        let creator;
        
        // Check if the ID is a valid ObjectId format
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(creatorId);
        if (isValidObjectId) {
            // If it's a valid ObjectId, search by ID
            creator = await User_1.findById(creatorId).select('-password').maxTimeMS(5000);
        } else {
            // If it's not a valid ObjectId, search by name
            creator = await User_1.findOne({ name: creatorId }).select('-password').maxTimeMS(5000);
        }
        
        // Check if user exists and has creator role
        if (!creator || creator.role !== 'creator') {
            console.log('Creator not found or not a creator for ID:', creatorId);
            res.status(404).json({ message: 'Creator not found' });
            return;
        }
        console.log('Successfully fetched creator profile for ID:', creatorId);
        res.json(creator);
    }
    catch (error) {
        console.error('Error fetching public creator profile:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getPublicCreatorProfile = getPublicCreatorProfile;
/**
 * Get a specific creator's public statistics by ID
 * This endpoint is completely public and requires no authentication
 */
const getPublicCreatorStats = async (req, res) => {
    try {
        const creatorId = req.params['id'];
        console.log('Fetching creator stats for ID:', creatorId);
        
        if (!creatorId) {
            res.status(400).json({ message: 'Creator ID is required' });
            return;
        }
        
        let creator;
        
        // Check if the ID is a valid ObjectId format
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(creatorId);
        if (isValidObjectId) {
            // If it's a valid ObjectId, search by ID
            creator = await User_1.findById(creatorId).select('-password').maxTimeMS(5000);
        } else {
            // If it's not a valid ObjectId, search by name
            creator = await User_1.findOne({ name: creatorId }).select('-password').maxTimeMS(5000);
        }
        
        // Check if user exists and has creator role
        if (!creator || creator.role !== 'creator') {
            console.log('Creator not found or not a creator for ID:', creatorId);
            res.status(404).json({ message: 'Creator not found' });
            return;
        }
        // Get creator's tracks
        console.log('Fetching tracks for creator ID:', creatorId);
        const tracks = await Track_1.find({ creatorId: creator._id }).maxTimeMS(5000);
        console.log('Found', tracks.length, 'tracks for creator ID:', creatorId);
        // Calculate total plays
        const totalPlays = tracks.reduce((sum, track) => sum + track.plays, 0);
        // Calculate monthly plays (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        // For simplicity, we'll assume all plays happened evenly over time
        // In a real application, you'd have play records with timestamps
        const monthlyPlays = totalPlays; // Placeholder - would need actual play history
        console.log('Returning stats for creator ID:', creatorId, {
            totalPlays,
            monthlyPlays,
            totalTracks: tracks.length
        });
        res.json({
            totalPlays,
            monthlyPlays,
            totalTracks: tracks.length
        });
    }
    catch (error) {
        console.error('Error fetching public creator stats:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getPublicCreatorStats = getPublicCreatorStats;
//# sourceMappingURL=publicController.js.map