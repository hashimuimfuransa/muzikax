"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.protect = exports.uploadTrack = void 0;
const Track_1 = require("../models/Track");
const User_1 = require("../models/User");
const { createNewTrackNotification } = require('./notificationController');
const jwt_1 = require("../utils/jwt");
Object.defineProperty(exports, "protect", { enumerable: true, get: function () { return jwt_1.protect; } });
// Upload track with cover image
const uploadTrack = async (req, res) => {
    try {
        const { title, description, genre, type, paymentType, price, currency, audioURL, coverURL, albumId } = req.body;
        const user = req.user;
        console.log('Upload track request received:', {
            title,
            description,
            genre,
            type,
            paymentType,
            price,
            currency,
            audioURL,
            coverURL,
            albumId,
            userId: user._id,
            userRole: user.role
        });
        // Validate required fields
        if (!title || !audioURL) {
            res.status(400).json({ message: 'Title and audio URL are required' });
            return;
        }
        // Check if user is a creator
        if (user.role !== 'creator') {
            res.status(401).json({ message: 'Not authorized as creator' });
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
        const trackData = {
            creatorId: user._id,
            creatorType: user.creatorType,
            title,
            description: description || '',
            genre: genre || 'afrobeat',
            type: type || 'song',
            paymentType: paymentType || 'free',
            price: price || 0,
            currency: currency || 'RWF',
            audioURL,
            coverURL: finalCoverURL || ''
        };
        // Add album reference if provided
        if (albumId) {
            trackData.albumId = albumId;
        }
        const track = await Track_1.create(trackData);
        console.log('Track created successfully:', track);
        
        // Send notifications to followers
        try {
          // Get followers of the creator
          const creator = await User_1.findById(user._id).populate('followers', '_id');
          if (creator && creator.followers && creator.followers.length > 0) {
            const followerIds = creator.followers.map(follower => follower._id);
            await createNewTrackNotification(track._id, user._id, followerIds);
            console.log(`Sent new track notifications to ${followerIds.length} followers`);
          }
        } catch (notificationError) {
          console.error('Error sending track notifications:', notificationError);
          // Don't fail the track upload if notifications fail
        }
        
        res.status(201).json(track);
    }
    catch (error) {
        console.error('Error uploading track:', error);
        res.status(500).json({ message: error.message || 'Failed to upload track' });
    }
};
exports.uploadTrack = uploadTrack;
//# sourceMappingURL=uploadController.js.map