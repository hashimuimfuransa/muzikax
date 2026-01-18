"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrendingTracks = exports.incrementPlayCount = exports.deleteTrack = exports.updateTrack = exports.getTracksByAuthUser = exports.getTracksByCreator = exports.getTracksByCreatorSimple = exports.getTrackById = exports.getAllTracks = exports.uploadTrack = void 0;
const Track_1 = require("../models/Track");
const ListenerGeography_1 = require("../models/ListenerGeography");
const User_1 = require("../models/User");
const geoip = require('geoip-lite');
// import User from '../models/User'; // Not used in this controller
// Upload track
const uploadTrack = async (req, res) => {
    try {
        const { title, description, genre, type, audioURL, coverURL } = req.body;
        const user = req.user;
        // Validate required fields
        if (!title || !audioURL) {
            res.status(400).json({ message: 'Title and audio URL are required' });
            return;
        }
        const track = await Track_1.create({
            creatorId: user._id,
            creatorType: user.creatorType,
            title,
            description: description || '',
            genre: genre || 'afrobeat',
            type: type || 'song',
            audioURL,
            coverURL: coverURL || ''
        });
        res.status(201).json(track);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.uploadTrack = uploadTrack;
// Get all tracks
const getAllTracks = async (req, res) => {
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 10;
        const skip = (page - 1) * limit;
        const tracks = await Track_1.find()
            .populate('creatorId', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Track_1.countDocuments();
        res.json({
            tracks,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllTracks = getAllTracks;
// Get track by ID
const getTrackById = async (req, res) => {
    try {
        const track = await Track_1.findById(req.params['id'])
            .populate('creatorId', 'name avatar whatsappContact');
        if (!track) {
            res.status(404).json({ message: 'Track not found' });
            return;
        }
        res.json(track);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTrackById = getTrackById;
// Get all tracks by creator (without pagination)
const getTracksByCreatorSimple = async (req, res) => {
    try {
        const creatorId = req.params['creatorId'];
        
        if (!creatorId) {
            res.status(400).json({ message: 'Creator ID is required' });
            return;
        }
        
        let actualCreatorId;
        
        // Check if the ID is a valid ObjectId format
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(creatorId);
        if (isValidObjectId) {
            // If it's a valid ObjectId, use it directly
            actualCreatorId = creatorId;
        } else {
            // If it's not a valid ObjectId, search for the user by name to get their ObjectId
            const user = await User_1.findOne({ name: creatorId });
            if (!user) {
                res.status(404).json({ message: 'Creator not found' });
                return;
            }
            actualCreatorId = user._id;
        }
        
        const tracks = await Track_1.find({ creatorId: actualCreatorId })
            .sort({ createdAt: -1 })
            .populate('creatorId', 'name avatar');
        res.json(tracks);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTracksByCreatorSimple = getTracksByCreatorSimple;
// Get tracks by creator
const getTracksByCreator = async (req, res) => {
    try {
        const creatorId = req.params['creatorId'];
        
        if (!creatorId) {
            res.status(400).json({ message: 'Creator ID is required' });
            return;
        }
        
        let actualCreatorId;
        
        // Check if the ID is a valid ObjectId format
        const isValidObjectId = /^[0-9a-fA-F]{24}$/.test(creatorId);
        if (isValidObjectId) {
            // If it's a valid ObjectId, use it directly
            actualCreatorId = creatorId;
        } else {
            // If it's not a valid ObjectId, search for the user by name to get their ObjectId
            const user = await User_1.findOne({ name: creatorId });
            if (!user) {
                res.status(404).json({ message: 'Creator not found' });
                return;
            }
            actualCreatorId = user._id;
        }
        
        // Check if pagination parameters are provided
        const pageParam = req.query['page'];
        const limitParam = req.query['limit'];
        // If no pagination parameters, return all tracks
        if (pageParam === undefined && limitParam === undefined) {
            const tracks = await Track_1.find({ creatorId: actualCreatorId })
                .sort({ createdAt: -1 })
                .populate('creatorId', 'name avatar');
            res.json(tracks);
            return;
        }
        // Otherwise, use pagination
        const page = parseInt(pageParam) || 1;
        const limit = parseInt(limitParam) || 10;
        const skip = (page - 1) * limit;
        const tracks = await Track_1.find({ creatorId: actualCreatorId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('creatorId', 'name avatar');
        const total = await Track_1.countDocuments({ creatorId: actualCreatorId });
        res.json({
            tracks,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTracksByCreator = getTracksByCreator;
// Get tracks by authenticated user (for profile page)
const getTracksByAuthUser = async (req, res) => {
    try {
        // Check if pagination parameters are provided
        const pageParam = req.query['page'];
        const limitParam = req.query['limit'];
        // Get creator ID from authenticated user
        const creatorId = req.user._id;
        // If no pagination parameters, return all tracks
        if (pageParam === undefined && limitParam === undefined) {
            const tracks = await Track_1.find({ creatorId })
                .sort({ createdAt: -1 })
                .populate('creatorId', 'name avatar');
            res.json(tracks);
            return;
        }
        // Otherwise, use pagination
        const page = parseInt(pageParam) || 1;
        const limit = parseInt(limitParam) || 10;
        const skip = (page - 1) * limit;
        const tracks = await Track_1.find({ creatorId })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit)
            .populate('creatorId', 'name avatar');
        const total = await Track_1.countDocuments({ creatorId });
        res.json({
            tracks,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTracksByAuthUser = getTracksByAuthUser;
// Update track
const updateTrack = async (req, res) => {
    try {
        const { title, genre, coverURL, description } = req.body;
        const track = await Track_1.findById(req.params['id']);
        if (!track) {
            res.status(404).json({ message: 'Track not found' });
            return;
        }
        // Check if user is the creator
        // Handle both cases: when creatorId is populated (object) or not (ObjectId)
        const trackOwnerId = track.creatorId && typeof track.creatorId === 'object' && '_id' in track.creatorId ? 
            track.creatorId._id.toString() : 
            track.creatorId.toString();
        
        if (trackOwnerId !== req.user._id.toString()) {
            res.status(401).json({ 
                message: 'You are not authorized to edit this track.',
                trackOwnerId,
                userId: req.user._id.toString()
            });
            return;
        }
        // Update fields if provided
        if (title !== undefined)
            track.title = title;
        if (genre !== undefined)
            track.genre = genre;
        if (coverURL !== undefined)
            track.coverURL = coverURL;
        if (description !== undefined)
            track.description = description;
        const updatedTrack = await track.save();
        res.json(updatedTrack);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateTrack = updateTrack;
// Delete track
const deleteTrack = async (req, res) => {
    try {
        const track = await Track_1.findById(req.params['id']);
        if (!track) {
            res.status(404).json({ message: 'Track not found' });
            return;
        }
        // Check if user is the creator or admin
        // Handle both cases: when creatorId is populated (object) or not (ObjectId)
        const trackOwnerId = track.creatorId && typeof track.creatorId === 'object' && '_id' in track.creatorId ? 
            track.creatorId._id.toString() : 
            track.creatorId.toString();
        
        if (trackOwnerId !== req.user._id.toString() &&
            req.user.role !== 'admin') {
            res.status(401).json({ 
                message: 'You are not authorized to delete this track.',
                trackOwnerId,
                userId: req.user._id.toString()
            });
            return;
        }
        await track.deleteOne();
        res.json({ message: 'Track removed' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteTrack = deleteTrack;
// Increment play count
const incrementPlayCount = async (req, res) => {
    try {
        const track = await Track_1.findByIdAndUpdate(req.params['id'], { $inc: { plays: 1 } }, { new: true });
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
                await ListenerGeography_1.create({
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
    }
    catch (error) {
        console.error('Error incrementing play count:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.incrementPlayCount = incrementPlayCount;
// Get trending tracks
const getTrendingTracks = async (req, res) => {
        try {
            const limit = parseInt(req.query['limit']) || 10;
            // Filter out beat and beta type tracks from trending (case-insensitive)
            const tracks = await Track_1.find({
                type: { $nin: ['beat', 'BEAT', 'Beat', 'beta', 'BETA', 'Beta'] }  // Case-insensitive exclusion of types
            })
                .sort({ plays: -1, createdAt: -1 })
                .limit(limit)
                .populate('creatorId', 'name avatar');
            res.json(tracks);
        }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTrendingTracks = getTrendingTracks;

// Get tracks by type (for specific type sections like beats)
const getTracksByType = async (req, res) => {
    try {
        const type = req.query.type;
        const limit = parseInt(req.query.limit) || 10;
        
        if (!type) {
            res.status(400).json({ message: 'Type parameter is required' });
            return;
        }
        
        // Handle the case where 'beat' should return both 'beat' and 'beta' types
        let query = {};
        if (type.toLowerCase() === 'beat') {
            query = { type: { $in: ['beat', 'beta'] } };
        } else {
            query = { type: type.toLowerCase() }; // Exact match
        }
        
        const tracks = await Track_1.find(query)
            .sort({ plays: -1, createdAt: -1 })
            .limit(limit)
            .populate('creatorId', 'name avatar whatsappContact');
            
        res.json(tracks);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getTracksByType = getTracksByType;

//# sourceMappingURL=trackController.js.map