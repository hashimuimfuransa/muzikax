"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOwnProfile = void 0;
const User_1 = require("../models/User");
const bcrypt = require("bcryptjs");
const mongoose_1 = require("mongoose");
// Validate email format
const isValidEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
};
// Update user's own profile
const updateOwnProfile = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }
        const userId = req.user._id;
        // Validate user ID
        if (!(0, mongoose_1.isValidObjectId)(userId)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }
        const user = await User_1.findById(userId).select('+password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { name, email, bio, genres, socials, avatar, password, currentPassword } = req.body;
        // Validate input data
        if (name !== undefined && (typeof name !== 'string' || name.trim().length === 0)) {
            res.status(400).json({ message: 'Name must be a non-empty string' });
            return;
        }
        if (email !== undefined && (typeof email !== 'string' || !isValidEmail(email))) {
            res.status(400).json({ message: 'Valid email is required' });
            return;
        }
        if (bio !== undefined && typeof bio !== 'string') {
            res.status(400).json({ message: 'Bio must be a string' });
            return;
        }
        if (genres !== undefined) {
            if (!Array.isArray(genres)) {
                res.status(400).json({ message: 'Genres must be an array' });
                return;
            }
            // Validate each genre
            for (const genre of genres) {
                if (typeof genre !== 'string' || genre.trim().length === 0) {
                    res.status(400).json({ message: 'Each genre must be a non-empty string' });
                    return;
                }
            }
        }
        // Check if email is already in use by another user
        if (email && email !== user.email) {
            const existingUser = await User_1.findOne({ email });
            if (existingUser) {
                res.status(400).json({ message: 'Email is already in use by another account' });
                return;
            }
            user.email = email;
        }
        // Update fields only if provided
        if (name !== undefined)
            user.name = name;
        if (bio !== undefined)
            user.bio = bio;
        if (genres !== undefined)
            user.genres = genres;
        if (socials !== undefined)
            user.socials = socials;
        if (avatar !== undefined)
            user.avatar = avatar;
        // Only allow password update if provided and current password is verified
        if (password) {
            // Require current password to change password
            if (!currentPassword) {
                res.status(400).json({ message: 'Current password is required to change password' });
                return;
            }
            // Validate password strength
            if (typeof password !== 'string' || password.length < 6) {
                res.status(400).json({ message: 'Password must be at least 6 characters long' });
                return;
            }
            const isMatch = await bcrypt.compare(currentPassword, user.password);
            if (!isMatch) {
                res.status(400).json({ message: 'Current password is incorrect' });
                return;
            }
            // Hash and set new password
            const salt = await bcrypt.genSalt(10);
            user.password = await bcrypt.hash(password, salt);
        }
        const updatedUser = await user.save();
        res.json({
            _id: updatedUser._id,
            name: updatedUser.name,
            email: updatedUser.email,
            role: updatedUser.role,
            creatorType: updatedUser.creatorType,
            avatar: updatedUser.avatar,
            bio: updatedUser.bio,
            genres: updatedUser.genres,
            followersCount: updatedUser.followersCount,
            socials: updatedUser.socials,
            createdAt: updatedUser.createdAt
        });
    }
    catch (error) {
        console.error('Profile update error:', error);
        // Handle MongoDB duplicate key error
        if (error.code === 11000) {
            res.status(400).json({ message: 'Email is already in use by another account' });
            return;
        }
        // Handle validation errors
        if (error.name === 'ValidationError') {
            const messages = Object.values(error.errors).map((err) => err.message);
            res.status(400).json({ message: messages.join(', ') });
            return;
        }
        res.status(500).json({ message: error.message || 'Server error during profile update' });
    }
};
exports.updateOwnProfile = updateOwnProfile;
