"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = exports.incrementAlbumPlayCount = exports.deleteAlbum = exports.updateAlbum = exports.getAlbumsByCreator = exports.getAlbumById = exports.getAllAlbums = exports.createAlbum = void 0;
const Album_1 = require("../models/Album");
const Track_1 = require("../models/Track");
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
Object.defineProperty(exports, "protect", { enumerable: true, get: function () { return jwt_1.protect; } });
// Create a new album
const createAlbum = async (req, res) => {
    try {
        const { title, description, genre, coverURL, trackIds } = req.body;
        const user = req.user;
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
        const tracks = await Track_1.find({
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
            const userData = await User_1.findById(user._id);
            if (userData && userData.avatar) {
                finalCoverURL = userData.avatar;
                console.log('Using user avatar as cover image:', finalCoverURL);
            }
        }
        const album = await Album_1.create({
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
        await Track_1.updateMany({ _id: { $in: trackIds } }, { $set: { albumId: album._id } });
        console.log('Album created successfully:', album._id);
        res.status(201).json(album);
    }
    catch (error) {
        console.error('Error creating album:', error);
        res.status(500).json({ message: error.message || 'Failed to create album' });
    }
};
exports.createAlbum = createAlbum;
// Get all albums
const getAllAlbums = async (req, res) => {
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 10;
        const skip = (page - 1) * limit;
        const albums = await Album_1.find()
            .populate('creatorId', 'name avatar')
            .populate({ path: 'tracks', populate: { path: 'creatorId', select: 'name avatar' } })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await Album_1.countDocuments();
        res.json({
            albums,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit)
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAllAlbums = getAllAlbums;
// Get album by ID
const getAlbumById = async (req, res) => {
    try {
        const album = await Album_1.findById(req.params['id'])
            .populate('creatorId', 'name avatar')
            .populate({ path: 'tracks', populate: { path: 'creatorId', select: 'name avatar' } });
        if (!album) {
            res.status(404).json({ message: 'Album not found' });
            return;
        }
        res.json(album);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAlbumById = getAlbumById;
// Get albums by creator
const getAlbumsByCreator = async (req, res) => {
    try {
        const creatorId = req.params['creatorId'];
        const query = { creatorId: creatorId };
        const albums = await Album_1.find(query).lean()
            .populate({ path: 'tracks', populate: { path: 'creatorId', select: 'name avatar' } })
            .sort({ createdAt: -1 });
        res.json(albums);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getAlbumsByCreator = getAlbumsByCreator;
// Update album
const updateAlbum = async (req, res) => {
    try {
        const { title, description, genre, coverURL, trackIds } = req.body;
        const user = req.user;
        let album = await Album_1.findById(req.params['id']);
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
            const tracks = await Track_1.find({
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
        if (title)
            album.title = title;
        if (description !== undefined)
            album.description = description;
        if (genre)
            album.genre = genre;
        if (coverURL !== undefined)
            album.coverURL = coverURL;
        const updatedAlbum = await album.save();
        res.json(updatedAlbum);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateAlbum = updateAlbum;
// Delete album
const deleteAlbum = async (req, res) => {
    try {
        const user = req.user;
        const album = await Album_1.findById(req.params['id']);
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
        await Track_1.updateMany({ _id: { $in: album.tracks } }, { $unset: { albumId: "" } });
        await album.deleteOne();
        res.json({ message: 'Album removed' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteAlbum = deleteAlbum;
// Increment album play count
const incrementAlbumPlayCount = async (req, res) => {
    try {
        const album = await Album_1.findById(req.params['id']);
        if (!album) {
            res.status(404).json({ message: 'Album not found' });
            return;
        }
        album.plays += 1;
        await album.save();
        res.json({ message: 'Play count incremented', plays: album.plays });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.incrementAlbumPlayCount = incrementAlbumPlayCount;
//# sourceMappingURL=albumController.js.map