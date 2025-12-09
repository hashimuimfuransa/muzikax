"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getCreatorAnalytics = exports.approveCreator = exports.deleteUser = exports.upgradeToCreator = exports.updateUser = exports.getUserById = exports.getUsers = void 0;
const User_1 = __importDefault(require("../models/User"));
const Track_1 = __importDefault(require("../models/Track"));
// Get all users (admin only)
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 10;
        const skip = (page - 1) * limit;
        const users = await User_1.default.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await User_1.default.countDocuments();
        res.json({
            users,
            page,
            pages: Math.ceil(total / limit),
            total
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUsers = getUsers;
// Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params['id']).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUserById = getUserById;
// Update user (admin only)
const updateUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params['id']);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { name, email, role, creatorType, bio, socials, avatar } = req.body;
        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.creatorType = creatorType || user.creatorType;
        user.bio = bio || user.bio;
        user.socials = socials || user.socials;
        user.avatar = avatar || user.avatar;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            creatorType: updatedUser.creatorType,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            followersCount: updatedUser.followersCount,
            socials: updatedUser.socials,
            createdAt: updatedUser.createdAt
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateUser = updateUser;
// Upgrade user to creator (user can upgrade themselves)
const upgradeToCreator = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }
        const userId = req.user._id;
        const { creatorType } = req.body;
        // Validate creatorType
        const validCreatorTypes = ['artist', 'dj', 'producer'];
        if (!creatorType || !validCreatorTypes.includes(creatorType)) {
            res.status(400).json({ message: 'Valid creatorType is required: artist, dj, or producer' });
            return;
        }
        const user = await User_1.default.findById(userId);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Update user role and creatorType
        user.role = 'creator';
        user.creatorType = creatorType;
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            creatorType: updatedUser.creatorType,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            followersCount: updatedUser.followersCount,
            socials: updatedUser.socials,
            createdAt: updatedUser.createdAt
        });
    }
    catch (error) {
        console.error('Error in upgradeToCreator:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.upgradeToCreator = upgradeToCreator;
// Delete user (admin only)
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params['id']);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Also delete all tracks by this user
        await Track_1.default.deleteMany({ creatorId: user._id });
        await user.deleteOne();
        res.json({ message: 'User removed' });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.deleteUser = deleteUser;
// Approve creator (admin only)
const approveCreator = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params['id']);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (user.role !== 'creator') {
            res.status(400).json({ message: 'User is not a creator' });
            return;
        }
        // Here you could implement additional approval logic
        // For now, we'll just confirm the creator is approved
        res.json({
            message: 'Creator approved',
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                creatorType: user.creatorType,
                avatar: user.avatar,
                bio: user.bio,
                followersCount: user.followersCount
            }
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.approveCreator = approveCreator;
// Get creator analytics (creator only)
const getCreatorAnalytics = async (req, res) => {
    try {
        const creatorId = req.user._id;
        // Get total tracks
        const totalTracks = await Track_1.default.countDocuments({ creatorId });
        // Get total plays for all tracks
        const tracks = await Track_1.default.find({ creatorId });
        const totalPlays = tracks.reduce((sum, track) => sum + track.plays, 0);
        // Get total likes for all tracks
        const totalLikes = tracks.reduce((sum, track) => sum + track.likes, 0);
        res.json({
            totalTracks,
            totalPlays,
            totalLikes,
            tracks: tracks.length
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getCreatorAnalytics = getCreatorAnalytics;
//# sourceMappingURL=userController.js.map