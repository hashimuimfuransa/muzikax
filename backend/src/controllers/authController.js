"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateUserProfile = exports.getUserProfile = exports.refreshToken = exports.login = exports.register = void 0;
const bcryptjs_1 = require("bcryptjs");
const User_1 = require("../models/User");
const jwt_1 = require("../utils/jwt");
// Register user
const register = async (req, res) => {
    try {
        const { name, email, password, role, creatorType } = req.body;
        // Check if user exists
        const userExists = await User_1.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }
        // Hash password
        const salt = await bcryptjs_1.genSalt(10);
        const hashedPassword = await bcryptjs_1.hash(password, salt);
        // Create user
        const user = await User_1.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'fan',
            creatorType: role === 'creator' ? creatorType : null
        });
        // Generate tokens
        const accessToken = (0, jwt_1.generateAccessToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user);
        res.status(201).json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            creatorType: user.creatorType,
            avatar: user.avatar,
            bio: user.bio,
            followersCount: user.followersCount,
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.register = register;
// Login user
const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        // Find user
        const user = await User_1.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Check password
        const isMatch = await bcryptjs_1.compare(password, user.password);
        if (!isMatch) {
            res.status(401).json({ message: 'Invalid email or password' });
            return;
        }
        // Generate tokens
        const accessToken = (0, jwt_1.generateAccessToken)(user);
        const refreshToken = (0, jwt_1.generateRefreshToken)(user);
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            creatorType: user.creatorType,
            avatar: user.avatar,
            bio: user.bio,
            followersCount: user.followersCount,
            accessToken,
            refreshToken
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.login = login;
// Refresh token
const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;
        if (!refreshToken) {
            res.status(401).json({ message: 'No refresh token provided' });
            return;
        }
        // Verify refresh token using our utility function
        const decoded = (0, jwt_1.verifyRefreshToken)(refreshToken);
        if (!decoded) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        const user = await User_1.findById(decoded.id);
        if (!user) {
            res.status(401).json({ message: 'Invalid refresh token' });
            return;
        }
        // Generate new tokens
        const newAccessToken = (0, jwt_1.generateAccessToken)(user);
        const newRefreshToken = (0, jwt_1.generateRefreshToken)(user);
        res.json({
            accessToken: newAccessToken,
            refreshToken: newRefreshToken
        });
    }
    catch (error) {
        res.status(401).json({ message: 'Invalid refresh token' });
    }
};
exports.refreshToken = refreshToken;
// Get user profile
const getUserProfile = async (req, res) => {
    try {
        // Get user without sensitive fields
        const user = await User_1.findById(req.user._id).select('-favorites -playlists -recentlyPlayed -password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Calculate following count from the following array
        const followingCount = user.following ? user.following.length : 0;
        
        res.json({
            _id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            creatorType: user.creatorType,
            avatar: user.avatar,
            bio: user.bio,
            genres: user.genres,
            followersCount: user.followersCount,
            followingCount: followingCount, // Add following count
            socials: user.socials,
            whatsappContact: user.whatsappContact,
            createdAt: user.createdAt
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.getUserProfile = getUserProfile;
// Update user profile
const updateUserProfile = async (req, res) => {
    try {
        const user = await User_1.findById(req.user._id).select('+password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { name, bio, socials, avatar } = req.body;
        user.name = name || user.name;
        user.bio = bio || user.bio;
        user.avatar = avatar || user.avatar;
        user.socials = socials || user.socials;
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
exports.updateUserProfile = updateUserProfile;
//# sourceMappingURL=authController.js.map