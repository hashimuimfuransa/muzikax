"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteUser = exports.updateUserRole = exports.getUserById = exports.getContentStats = exports.getUserStats = exports.getPlatformStats = exports.searchUsers = exports.getAdminAnalytics = void 0;
const User_1 = require("../models/User");
const Track_1 = require("../models/Track");
const mongoose_1 = require("mongoose");
// Get admin dashboard analytics
const getAdminAnalytics = async (_req, res) => {
    try {
        // Get total users
        const totalUsers = await User_1.countDocuments();
        // Get total creators
        const totalCreators = await User_1.countDocuments({ role: 'creator' });
        // Get total admins
        const totalAdmins = await User_1.countDocuments({ role: 'admin' });
        // Get total tracks
        const totalTracks = await Track_1.countDocuments();
        // Get total plays
        const allTracks = await Track_1.find({}, 'plays');
        const totalPlays = allTracks.reduce((sum, track) => sum + track.plays, 0);
        // Get trending tracks
        const trendingTracks = await Track_1.find()
            .sort({ plays: -1 })
            .limit(5)
            .populate('creatorId', 'name');
        // Get recent users
        const recentUsers = await User_1.find()
            .select('-password')
            .sort({ createdAt: -1 })
            .limit(5);
        res.json({
            totalUsers,
            totalCreators,
            totalAdmins,
            totalTracks,
            totalPlays,
            trendingTracks: trendingTracks.map(track => ({
                id: track._id,
                title: track.title,
                creatorId: track.creatorId,
                plays: track.plays,
                likes: track.likes,
                createdAt: track.createdAt
            })),
            recentUsers: recentUsers.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                creatorType: user.creatorType,
                createdAt: user.createdAt
            }))
        });
    }
    catch (error) {
        console.error('Error in getAdminAnalytics:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getAdminAnalytics = getAdminAnalytics;
// Search users with filters
const searchUsers = async (req, res) => {
    try {
        const { query, role, page = 1, limit = 10 } = req.query;
        const skip = (Number(page) - 1) * Number(limit);
        // Build search criteria
        const searchCriteria = {};
        if (query) {
            searchCriteria.$or = [
                { name: { $regex: query, $options: 'i' } },
                { email: { $regex: query, $options: 'i' } }
            ];
        }
        if (role && role !== 'all') {
            searchCriteria.role = role;
        }
        const users = await User_1.find(searchCriteria)
            .select('-password')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(Number(limit));
        const total = await User_1.countDocuments(searchCriteria);
        res.json({
            users: users.map(user => ({
                _id: user._id,
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                creatorType: user.creatorType,
                createdAt: user.createdAt
            })),
            page: Number(page),
            pages: Math.ceil(total / Number(limit)),
            total
        });
    }
    catch (error) {
        console.error('Error in searchUsers:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.searchUsers = searchUsers;
// Get platform statistics
const getPlatformStats = async (_req, res) => {
    try {
        // Get user growth data (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const userGrowth = await User_1.aggregate([
            {
                $match: {
                    createdAt: { $gte: thirtyDaysAgo }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        // Get content statistics by type
        const contentStats = await Track_1.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 },
                    totalPlays: { $sum: "$plays" }
                }
            }
        ]);
        // Get top creators by play count
        const topCreators = await Track_1.aggregate([
            {
                $group: {
                    _id: "$creatorId",
                    totalPlays: { $sum: "$plays" },
                    trackCount: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "creator"
                }
            },
            {
                $unwind: "$creator"
            },
            {
                $project: {
                    _id: "$creator._id",
                    name: "$creator.name",
                    totalPlays: 1,
                    trackCount: 1
                }
            },
            {
                $sort: { totalPlays: -1 }
            },
            {
                $limit: 10
            }
        ]);
        res.json({
            userGrowth,
            contentStats,
            topCreators
        });
    }
    catch (error) {
        console.error('Error in getPlatformStats:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getPlatformStats = getPlatformStats;
// Get detailed user statistics
const getUserStats = async (_req, res) => {
    try {
        // Count users by role
        const userRoles = await User_1.aggregate([
            {
                $group: {
                    _id: "$role",
                    count: { $sum: 1 }
                }
            }
        ]);
        // Count creators by type
        const creatorTypes = await User_1.aggregate([
            {
                $match: { role: "creator" }
            },
            {
                $group: {
                    _id: "$creatorType",
                    count: { $sum: 1 }
                }
            }
        ]);
        // Recently joined users
        const recentUsers = await User_1.find()
            .select('name email role creatorType createdAt')
            .sort({ createdAt: -1 })
            .limit(10);
        res.json({
            userRoles,
            creatorTypes,
            recentUsers: recentUsers.map(user => ({
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                creatorType: user.creatorType,
                createdAt: user.createdAt
            }))
        });
    }
    catch (error) {
        console.error('Error in getUserStats:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getUserStats = getUserStats;
// Get content statistics
const getContentStats = async (_req, res) => {
    try {
        // Total tracks
        const totalTracks = await Track_1.countDocuments();
        // Tracks by type
        const tracksByType = await Track_1.aggregate([
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            }
        ]);
        // Tracks by genre
        const tracksByGenre = await Track_1.aggregate([
            {
                $group: {
                    _id: "$genre",
                    count: { $sum: 1 }
                }
            },
            {
                $sort: { count: -1 }
            },
            {
                $limit: 10
            }
        ]);
        // Most played tracks
        const mostPlayedTracks = await Track_1.find()
            .sort({ plays: -1 })
            .limit(10)
            .populate('creatorId', 'name');
        res.json({
            totalTracks,
            tracksByType,
            tracksByGenre,
            mostPlayedTracks: mostPlayedTracks.map(track => ({
                id: track._id,
                title: track.title,
                creator: track.creatorId ? track.creatorId.name : 'Unknown',
                plays: track.plays,
                uniquePlays: track.uniquePlays || 0,
                likes: track.likes
            }))
        });
    }
    catch (error) {
        console.error('Error in getContentStats:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getContentStats = getContentStats;
// Get user details by ID
const getUserById = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate that id exists and is valid
        if (!id || typeof id !== 'string' || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }
        const user = await User_1.findById(id).select('-password');
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            creatorType: user.creatorType,
            avatar: user.avatar,
            bio: user.bio,
            socials: user.socials,
            followersCount: user.followersCount,
            createdAt: user.createdAt
        });
    }
    catch (error) {
        console.error('Error in getUserById:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getUserById = getUserById;
// Update user role
const updateUserRole = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, creatorType } = req.body;
        // Validate that id exists and is valid
        if (!id || typeof id !== 'string' || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }
        // Validate role
        const validRoles = ['fan', 'creator', 'admin'];
        if (!validRoles.includes(role)) {
            res.status(400).json({ message: 'Invalid role' });
            return;
        }
        // Validate creatorType if role is creator
        if (role === 'creator') {
            const validCreatorTypes = ['artist', 'dj', 'producer'];
            if (!creatorType || !validCreatorTypes.includes(creatorType)) {
                res.status(400).json({ message: 'Valid creatorType is required for creator role' });
                return;
            }
        }
        const updateData = { role };
        if (role === 'creator') {
            updateData.creatorType = creatorType;
        }
        else {
            updateData.creatorType = null;
        }
        const user = await User_1.findByIdAndUpdate(id, updateData, { new: true, select: '-password' });
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        res.json({
            id: user._id,
            name: user.name,
            email: user.email,
            role: user.role,
            creatorType: user.creatorType,
            createdAt: user.createdAt
        });
    }
    catch (error) {
        console.error('Error in updateUserRole:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateUserRole = updateUserRole;
// Delete user
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        // Validate that id exists and is valid
        if (!id || typeof id !== 'string' || !mongoose_1.default.Types.ObjectId.isValid(id)) {
            res.status(400).json({ message: 'Invalid user ID' });
            return;
        }
        // Prevent deleting admin users
        const user = await User_1.findById(id);
        if (!user) {
            res.status(404).json({ message: 'User not found' });
            return;
        }
        if (user.role === 'admin') {
            res.status(400).json({ message: 'Cannot delete admin users' });
            return;
        }
        // Delete user
        await User_1.findByIdAndDelete(id);
        // TODO: Also delete associated content (tracks, playlists, etc.)
        res.json({ message: 'User deleted successfully' });
    }
    catch (error) {
        console.error('Error in deleteUser:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.deleteUser = deleteUser;

// Get homepage content (public)
const getHomepageContent = async (_req, res) => {
    try {
        let homepageContent = await require('../models/HomepageContent').findOne();
        
        // If no content exists, create default content
        if (!homepageContent) {
            const HomepageContent = require('../models/HomepageContent');
            homepageContent = await HomepageContent.create({
                slides: [
                    {
                        id: 1,
                        title: 'Discover Rwandan Music',
                        subtitle: 'Explore the vibrant sounds of Rwanda',
                        image: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                        cta: 'Explore Music',
                        type: 'explore',
                        link: '/explore',
                        isActive: true,
                        order: 0
                    },
                    {
                        id: 2,
                        title: 'Share Your Talent',
                        subtitle: 'Upload and connect with fans',
                        image: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                        cta: 'Upload Track',
                        type: 'upload',
                        link: '/upload',
                        isActive: true,
                        order: 1
                    },
                    {
                        id: 3,
                        title: 'Connect With Community',
                        subtitle: 'Share thoughts and trending vibes',
                        image: 'https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80',
                        cta: 'View Vibes',
                        type: 'vibes',
                        link: '/community',
                        isActive: true,
                        order: 2
                    }
                ],
                currentSlide: 0,
                autoPlayInterval: 5000,
                sections: {
                    showForYou: true,
                    showPopularBeats: true,
                    showRecommendedPlaylists: true,
                    showTrendingArtists: true
                }
            });
        }
        
        // Only return active slides, sorted by order
        const activeSlides = homepageContent.slides
            .filter(slide => slide.isActive)
            .sort((a, b) => a.order - b.order);
        
        res.json({
            slides: activeSlides,
            currentSlide: homepageContent.currentSlide,
            autoPlayInterval: homepageContent.autoPlayInterval,
            sections: homepageContent.sections
        });
    }
    catch (error) {
        console.error('Error in getHomepageContent:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getHomepageContent = getHomepageContent;

// Update homepage content (admin only)
const updateHomepageContent = async (req, res) => {
    try {
        const { slides, currentSlide, autoPlayInterval, sections } = req.body;
        
        let homepageContent = await require('../models/HomepageContent').findOne();
        
        if (!homepageContent) {
            const HomepageContent = require('../models/HomepageContent');
            homepageContent = new HomepageContent({
                slides: slides || [],
                currentSlide: currentSlide || 0,
                autoPlayInterval: autoPlayInterval || 5000,
                sections: sections || {}
            });
        } else {
            if (slides) homepageContent.slides = slides;
            if (currentSlide !== undefined) homepageContent.currentSlide = currentSlide;
            if (autoPlayInterval !== undefined) homepageContent.autoPlayInterval = autoPlayInterval;
            if (sections) homepageContent.sections = sections;
        }
        
        await homepageContent.save();
        
        res.json({
            message: 'Homepage content updated successfully',
            slides: homepageContent.slides,
            currentSlide: homepageContent.currentSlide,
            autoPlayInterval: homepageContent.autoPlayInterval,
            sections: homepageContent.sections
        });
    }
    catch (error) {
        console.error('Error in updateHomepageContent:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateHomepageContent = updateHomepageContent;

// Reorder slides (admin only)
const reorderSlides = async (req, res) => {
    try {
        const { slideIds } = req.body; // Array of slide IDs in new order
        
        if (!Array.isArray(slideIds)) {
            return res.status(400).json({ message: 'slideIds must be an array' });
        }
        
        const homepageContent = await require('../models/HomepageContent').findOne();
        
        if (!homepageContent) {
            return res.status(404).json({ message: 'Homepage content not found' });
        }
        
        // Update order based on new arrangement
        slideIds.forEach((id, index) => {
            const slide = homepageContent.slides.find(s => s.id === id);
            if (slide) {
                slide.order = index;
            }
        });
        
        await homepageContent.save();
        
        res.json({
            message: 'Slides reordered successfully',
            slides: homepageContent.slides.sort((a, b) => a.order - b.order)
        });
    }
    catch (error) {
        console.error('Error in reorderSlides:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.reorderSlides = reorderSlides;

// Add new slide (admin only)
const addSlide = async (req, res) => {
    try {
        const slideData = req.body;
        
        const homepageContent = await require('../models/HomepageContent').findOne();
        
        if (!homepageContent) {
            return res.status(404).json({ message: 'Homepage content not found' });
        }
        
        // Generate new ID
        const maxId = homepageContent.slides.reduce((max, slide) => Math.max(max, slide.id), 0);
        slideData.id = maxId + 1;
        slideData.order = homepageContent.slides.length;
        slideData.isActive = slideData.isActive !== undefined ? slideData.isActive : true;
        
        homepageContent.slides.push(slideData);
        await homepageContent.save();
        
        res.json({
            message: 'Slide added successfully',
            slides: homepageContent.slides.sort((a, b) => a.order - b.order)
        });
    }
    catch (error) {
        console.error('Error in addSlide:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.addSlide = addSlide;

// Update slide (admin only)
const updateSlide = async (req, res) => {
    try {
        const { slideId } = req.params;
        const updateData = req.body;
        
        const homepageContent = await require('../models/HomepageContent').findOne();
        
        if (!homepageContent) {
            return res.status(404).json({ message: 'Homepage content not found' });
        }
        
        const slide = homepageContent.slides.find(s => s.id === parseInt(slideId));
        
        if (!slide) {
            return res.status(404).json({ message: 'Slide not found' });
        }
        
        // Validate that required fields are not being set to empty
        const requiredFields = ['title', 'subtitle', 'image', 'cta'];
        const missingFields = [];
        
        requiredFields.forEach(field => {
            if (updateData.hasOwnProperty(field)) {
                if (!updateData[field] || (typeof updateData[field] === 'string' && !updateData[field].trim())) {
                    missingFields.push(field);
                }
            }
        });
        
        if (missingFields.length > 0) {
            return res.status(400).json({
                message: `Missing or empty required fields: ${missingFields.join(', ')}`,
                requiredFields
            });
        }
        
        // Update slide properties - only update fields that are provided
        Object.keys(updateData).forEach(key => {
            if (key !== 'id' && key !== '_id') {
                slide[key] = updateData[key];
            }
        });
        
        // Save with validation only on modified paths
        await homepageContent.save({ validateModifiedOnly: true });
        
        res.json({
            message: 'Slide updated successfully',
            slides: homepageContent.slides.sort((a, b) => a.order - b.order)
        });
    }
    catch (error) {
        console.error('Error in updateSlide:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.updateSlide = updateSlide;

// Delete slide (admin only)
const deleteSlide = async (req, res) => {
    try {
        const { slideId } = req.params;
        
        const homepageContent = await require('../models/HomepageContent').findOne();
        
        if (!homepageContent) {
            return res.status(404).json({ message: 'Homepage content not found' });
        }
        
        const initialLength = homepageContent.slides.length;
        homepageContent.slides = homepageContent.slides.filter(s => s.id !== parseInt(slideId));
        
        if (homepageContent.slides.length === initialLength) {
            return res.status(404).json({ message: 'Slide not found' });
        }
        
        // Reorder remaining slides
        homepageContent.slides.forEach((slide, index) => {
            slide.order = index;
        });
        
        await homepageContent.save();
        
        res.json({
            message: 'Slide deleted successfully',
            slides: homepageContent.slides
        });
    }
    catch (error) {
        console.error('Error in deleteSlide:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.deleteSlide = deleteSlide;

// Get geographic distribution of listeners
const getGeographicDistribution = async (_req, res) => {
    try {
        // Import ListenerGeography model
        const ListenerGeography = require('../models/ListenerGeography');
        
        // Get top countries by play count
        const countryStats = await ListenerGeography.aggregate([
            {
                $group: {
                    _id: "$country",
                    playCount: { $sum: 1 },
                    uniqueListeners: { $addToSet: "$ipAddress" }
                }
            },
            {
                $project: {
                    _id: 1,
                    playCount: 1,
                    uniqueListeners: { $size: "$uniqueListeners" }
                }
            },
            {
                $sort: { playCount: -1 }
            },
            {
                $limit: 10
            }
        ]);
        
        // Get total play count by country for percentage calculation
        const totalPlays = countryStats.reduce((sum, stat) => sum + stat.playCount, 0);
        
        // Format the data to include percentages
        const formattedCountryStats = countryStats.map(stat => ({
            country: stat._id,
            playCount: stat.playCount,
            uniqueListeners: stat.uniqueListeners,
            percentage: totalPlays > 0 ? parseFloat(((stat.playCount / totalPlays) * 100).toFixed(2)) : 0
        }));
        
        res.json({
            countryStats: formattedCountryStats,
            totalPlays
        });
    }
    catch (error) {
        console.error('Error in getGeographicDistribution:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getGeographicDistribution = getGeographicDistribution;

// Get play history over time
const getPlayHistory = async (req, res) => {
    try {
        const days = parseInt(req.query['days']) || 30;
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - days);
        
        // Aggregate plays by date using Track model's plays field
        // Since we don't have listenergeographies collection yet, we'll use track creation dates
        const playHistory = await Track_1.aggregate([
            {
                $match: {
                    createdAt: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
                    },
                    plays: { $sum: "$plays" },
                    uniquePlays: { $sum: "$uniquePlays" }
                }
            },
            {
                $sort: { _id: 1 }
            }
        ]);
        
        // If no data from aggregate, return empty array with proper format
        if (!playHistory || playHistory.length === 0) {
            return res.json([]);
        }
        
        // Format the response
        const formattedHistory = playHistory.map(item => ({
            date: item._id,
            plays: item.plays || 0,
            uniquePlays: item.uniquePlays || 0
        }));
        
        res.json(formattedHistory);
    }
    catch (error) {
        console.error('Error in getPlayHistory:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getPlayHistory = getPlayHistory;

//# sourceMappingURL=adminController.js.map