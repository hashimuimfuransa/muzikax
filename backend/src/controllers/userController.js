"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateOwnProfile = exports.followCreator = exports.getCreatorAnalytics = exports.approveCreator = exports.deleteUser = exports.upgradeToCreator = exports.updateUser = exports.getUserById = exports.getPublicCreators = exports.getUsers = void 0;
const User_1 = require("../models/User");
const Track_1 = require("../models/Track");
const bcryptjs_1 = require("bcryptjs");
// Get all users (admin only)
const getUsers = async (req, res) => {
    try {
        const page = parseInt(req.query['page']) || 1;
        const limit = parseInt(req.query['limit']) || 10;
        const skip = (page - 1) * limit;
        const users = await User_1.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);
        const total = await User_1.countDocuments();
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
// Get public creators (accessible to all users)
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
// Get user by ID
const getUserById = async (req, res) => {
    try {
        const user = await User_1.findById(req.params['id']).select('-password');
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
        const user = await User_1.findById(req.params['id']);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { name, email, role, creatorType, bio, genres, socials, avatar, password } = req.body;
        user.name = name || user.name;
        user.email = email || user.email;
        user.role = role || user.role;
        user.creatorType = creatorType || user.creatorType;
        user.bio = bio || user.bio;
        user.genres = genres || user.genres;
        user.socials = socials || user.socials;
        user.avatar = avatar || user.avatar;
        // Only allow password update if provided
        if (password) {
            const salt = await bcryptjs_1.genSalt(10);
            user.password = await bcryptjs_1.hash(password, salt);
        }
        const updatedUser = await user.save();
        // Calculate following count from the following array
        const followingCount = updatedUser.following ? updatedUser.following.length : 0;
        
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
            followingCount: followingCount, // Add following count
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
        const user = await User_1.findById(userId);
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
        const user = await User_1.findById(req.params['id']);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        // Also delete all tracks by this user
        await Track_1.deleteMany({ creatorId: user._id });
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
        const user = await User_1.findById(req.params['id']);
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
        // Log the incoming request for debugging
        console.log('getCreatorAnalytics called');
        console.log('User in request:', req.user);
        // Check if user is authenticated
        if (!req.user) {
            console.log('No user found in request');
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }
        const creatorId = req.user._id;
        console.log('Creator ID:', creatorId);
        // Check if user is a creator
        if (req.user.role !== 'creator') {
            console.log('User is not a creator, role:', req.user.role);
            res.status(401).json({ message: 'Not authorized as creator' });
            return;
        }
        // Get total tracks
        const totalTracks = await Track_1.countDocuments({ creatorId });
        console.log('Total tracks:', totalTracks);
        // Get total plays for all tracks
        const tracks = await Track_1.find({ creatorId });
        const totalPlays = tracks.reduce((sum, track) => sum + track.plays, 0);
        console.log('Total plays:', totalPlays);
        // Get total likes for all tracks
        const totalLikes = tracks.reduce((sum, track) => sum + track.likes, 0);
        console.log('Total likes:', totalLikes);
        const response = {
            totalTracks,
            totalPlays,
            totalLikes,
            tracks: tracks.length
        };
        console.log('Analytics response:', response);
        res.json(response);
    }
    catch (error) {
        console.error('Error in getCreatorAnalytics:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getCreatorAnalytics = getCreatorAnalytics;
// Follow a creator
const followCreator = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }
        const userId = req.user._id;
        const creatorId = req.params['id'];
        // Validate creatorId
        if (!creatorId) {
            res.status(400).json({ message: 'Creator ID is required' });
            return;
        }
        // Check if trying to follow self
        if (userId.toString() === creatorId) {
            res.status(400).json({ message: 'You cannot follow yourself' });
            return;
        }
        // Find the user and the creator
        const [user, creator] = await Promise.all([
            User_1.findById(userId),
            User_1.findById(creatorId)
        ]);
        
        if (!creator) {
            res.status(404).json({ message: 'Creator not found' });
            return;
        }
        
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        
        // Check if user is already following this creator
        const isAlreadyFollowing = user.following.includes(creatorId);
        if (isAlreadyFollowing) {
            res.status(200).json({ 
                message: 'Already following this creator',
                followersCount: creator.followersCount
            });
            return;
        }
        
        // Add creator to user's following list
        user.following.push(creatorId);
        
        // Increment the creator's followers count
        creator.followersCount = (creator.followersCount || 0) + 1;
        
        // Save both documents
        await Promise.all([user.save(), creator.save()]);
        
        // Calculate updated following count
        const updatedFollowingCount = user.following ? user.following.length : 0;
        
        res.json({
            message: 'Successfully followed creator',
            followersCount: creator.followersCount,
            followingCount: updatedFollowingCount
        });
    }
    catch (error) {
        console.error('Error in followCreator:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.followCreator = followCreator;

// Unfollow a creator
const unfollowCreator = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }
        
        const userId = req.user._id;
        const creatorId = req.params['id'];
        
        // Validate creatorId
        if (!creatorId) {
            res.status(400).json({ message: 'Creator ID is required' });
            return;
        }
        
        // Check if trying to unfollow self
        if (userId.toString() === creatorId) {
            res.status(400).json({ message: 'You cannot unfollow yourself' });
            return;
        }
        
        // Find the user and the creator
        const [user, creator] = await Promise.all([
            User_1.findById(userId),
            User_1.findById(creatorId)
        ]);
        
        if (!creator) {
            res.status(404).json({ message: 'Creator not found' });
            return;
        }
        
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        
        // Check if user is actually following this creator
        const isFollowing = user.following.includes(creatorId);
        if (!isFollowing) {
            res.status(400).json({ message: 'You are not following this creator' });
            return;
        }
        
        // Remove creator from user's following list
        user.following = user.following.filter(id => id.toString() !== creatorId);
        
        // Decrement the creator's followers count, ensuring it doesn't go below 0
        creator.followersCount = Math.max(0, (creator.followersCount || 0) - 1);
        
        // Save both documents
        await Promise.all([user.save(), creator.save()]);
        
        // Calculate updated following count
        const updatedFollowingCount = user.following ? user.following.length : 0;
        
        res.json({
            message: 'Successfully unfollowed creator',
            followersCount: creator.followersCount,
            followingCount: updatedFollowingCount
        });
    }
    catch (error) {
        console.error('Error in unfollowCreator:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.unfollowCreator = unfollowCreator;

// Check if user is following a creator
const checkFollowStatus = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }
        
        const userId = req.user._id;
        const creatorId = req.params['id'];
        
        // Validate creatorId
        if (!creatorId) {
            res.status(400).json({ message: 'Creator ID is required' });
            return;
        }
        
        // Find the user
        const user = await User_1.findById(userId);
        
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        
        // Check if the user is following this creator
        const isFollowing = user.following.includes(creatorId);
        
        res.json({
            isFollowing: isFollowing
        });
    }
    catch (error) {
        console.error('Error in checkFollowStatus:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.checkFollowStatus = checkFollowStatus;

// Get followed creators for a user
const getFollowedCreators = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }

        const userId = req.user._id;

        // Find the user and populate the following field
        const user = await User_1.findById(userId).populate('following', 'name avatar bio followersCount creatorType');

        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }

        res.json({ 
            creators: user.following,
            count: user.following.length
        });
    } catch (error) {
        console.error('Error in getFollowedCreators:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getFollowedCreators = getFollowedCreators;

// Update user's own profile
const updateOwnProfile = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }
        const userId = req.user._id;
        const user = await User_1.findById(userId).select('+password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        const { name, email, bio, genres, socials, avatar, password, currentPassword } = req.body;
        // Only allow users to update their own fields
        if (name)
            user.name = name;
        if (email)
            user.email = email;
        if (bio !== undefined)
            user.bio = bio;
        if (genres)
            user.genres = genres;
        if (socials)
            user.socials = socials;
        if (avatar)
            user.avatar = avatar;
        // Only allow password update if provided and current password is verified
        if (password) {
            // Require current password to change password
            if (!currentPassword) {
                res.status(400).json({ message: 'Current password is required to change password' });
                return;
            }
            // Verify current password
            const isMatch = await bcryptjs_1.compare(currentPassword, user.password);
            if (!isMatch) {
                res.status(400).json({ message: 'Current password is incorrect' });
                return;
            }
            // Hash and set new password
            const salt = await bcryptjs_1.genSalt(10);
            user.password = await bcryptjs_1.hash(password, salt);
        }
        const updatedUser = await user.save();
        // Calculate following count from the following array
        const followingCount = updatedUser.following ? updatedUser.following.length : 0;
        
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
            followingCount: followingCount, // Add following count
            socials: updatedUser.socials,
            createdAt: updatedUser.createdAt
        });
    }
    catch (error) {
        res.status(500).json({ message: error.message });
    }
};
exports.updateOwnProfile = updateOwnProfile;

// Get all users except the current user (authenticated users only)
const getAllUsers = async (req, res) => {
    try {
        // Check if user is authenticated
        if (!req.user) {
            res.status(401).json({ message: 'Not authorized, no user found' });
            return;
        }

        const currentUserId = req.user._id;

        // Get all users except the current user
        const users = await User_1.find({ 
            _id: { $ne: currentUserId } 
        }).select('-password');

        res.json({
            users
        });
    } catch (error) {
        console.error('Error in getAllUsers:', error);
        res.status(500).json({ message: error.message });
    }
};

exports.getAllUsers = getAllUsers;
//# sourceMappingURL=userController.js.map