"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.upgradeToCreator = void 0;
const User_1 = require("../models/User");
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
//# sourceMappingURL=upgradeController.js.map