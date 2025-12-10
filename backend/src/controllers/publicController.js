"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getPublicCreatorProfile = exports.getPublicCreators = void 0;
const User_1 = __importDefault(require("../models/User"));
/**
 * Get public creators (accessible to all users)
 * This endpoint is completely public and requires no authentication
 */
const getPublicCreators = async (req, res) => {
    try {
        const limit = parseInt(req.query['limit']) || 10;
        // Find users with role 'creator' and sort by followersCount descending
        const creators = await User_1.default.find({ role: 'creator' })
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
        // Find user with role 'creator' by ID
        const creator = await User_1.default.findOne({ _id: creatorId, role: 'creator' })
            .select('-password');
        if (!creator) {
            res.status(404).json({ message: 'Creator not found' });
            return;
        }
        res.json(creator);
    }
    catch (error) {
        console.error('Error fetching public creator profile:', error);
        res.status(500).json({ message: error.message });
    }
};
exports.getPublicCreatorProfile = getPublicCreatorProfile;
//# sourceMappingURL=publicController.js.map