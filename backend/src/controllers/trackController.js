"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getTrendingTracks = exports.incrementPlayCount = exports.deleteTrack = exports.updateTrack = exports.getTracksByCreator = exports.getTrackById = exports.getAllTracks = exports.uploadTrack = void 0;
const Track_1 = __importDefault(require("../models/Track"));
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
        const track = await Track_1.default.create({
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
        const tracks = await Track_1.default.find()
            .populate('creatorId', 'name avatar')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Track_1.default.countDocuments();
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
        const track = await Track_1.default.findById(req.params['id'])
            .populate('creatorId', 'name avatar bio socials');
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
// Get tracks by creator
const getTracksByCreator = async (req, res) => {
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 10;
        const skip = (page - 1) * limit;
        const tracks = await Track_1.default.find({ creatorId: req.params['creatorId'] })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Track_1.default.countDocuments({ creatorId: req.params['creatorId'] });
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
// Update track
const updateTrack = async (req, res) => {
    try {
        const { title, genre, coverURL, description } = req.body;
        const track = await Track_1.default.findById(req.params['id']);
        if (!track) {
            res.status(404).json({ message: 'Track not found' });
            return;
        }
        // Check if user is the creator
        if (track.creatorId.toString() !== req.user._id.toString()) {
            res.status(401).json({ message: 'Not authorized' });
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
        const track = await Track_1.default.findById(req.params['id']);
        if (!track) {
            res.status(404).json({ message: 'Track not found' });
            return;
        }
        // Check if user is the creator or admin
        if (track.creatorId.toString() !== req.user._id.toString() &&
            req.user.role !== 'admin') {
            res.status(401).json({ message: 'Not authorized' });
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
        const track = await Track_1.default.findByIdAndUpdate(req.params['id'], { $inc: { plays: 1 } }, { new: true });
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
exports.incrementPlayCount = incrementPlayCount;
// Get trending tracks
const getTrendingTracks = async (req, res) => {
    try {
        const limit = parseInt(req.query['limit']) || 10;
        const tracks = await Track_1.default.find()
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
//# sourceMappingURL=trackController.js.map