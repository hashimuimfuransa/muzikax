"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatorType = exports.creator = exports.admin = exports.protect = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Generate access token
const generateAccessToken = (user) => {
    const payload = {
        id: user._id,
        role: user.role,
        creatorType: user.creatorType
    };
    const secret = process.env.JWT_ACCESS_SECRET || 'access_secret';
    const options = {
        expiresIn: process.env.JWT_ACCESS_EXPIRE ? process.env.JWT_ACCESS_EXPIRE : '15m'
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateAccessToken = generateAccessToken;
// Generate refresh token
const generateRefreshToken = (user) => {
    const payload = {
        id: user._id
    };
    const secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
    const options = {
        expiresIn: process.env.JWT_REFRESH_EXPIRE ? process.env.JWT_REFRESH_EXPIRE : '7d'
    };
    return jsonwebtoken_1.default.sign(payload, secret, options);
};
exports.generateRefreshToken = generateRefreshToken;
// Verify access token
const verifyAccessToken = (token) => {
    try {
        const secret = process.env.JWT_ACCESS_SECRET || 'access_secret';
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
// Verify refresh token
const verifyRefreshToken = (token) => {
    try {
        const secret = process.env.JWT_REFRESH_SECRET || 'refresh_secret';
        return jsonwebtoken_1.default.verify(token, secret);
    }
    catch (error) {
        return null;
    }
};
exports.verifyRefreshToken = verifyRefreshToken;
// Middleware to protect routes
const protect = async (req, res, next) => {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            if (!token) {
                res.status(401).json({ message: 'Not authorized, token failed' });
                return;
            }
            const decoded = (0, exports.verifyAccessToken)(token);
            if (!decoded) {
                res.status(401).json({ message: 'Not authorized, token failed' });
                return;
            }
            const user = await User_1.default.findById(decoded.id).select('-password');
            if (!user) {
                res.status(401).json({ message: 'Not authorized, user not found' });
                return;
            }
            req.user = user;
            next();
        }
        catch (error) {
            res.status(401).json({ message: 'Not authorized, token failed' });
            return;
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token' });
        return;
    }
};
exports.protect = protect;
// Middleware for admin authorization
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next();
    }
    else {
        res.status(401).json({ message: 'Not authorized as admin' });
        return;
    }
};
exports.admin = admin;
// Middleware for creator authorization
const creator = (req, res, next) => {
    if (req.user && req.user.role === 'creator') {
        next();
    }
    else {
        res.status(401).json({ message: 'Not authorized as creator' });
        return;
    }
};
exports.creator = creator;
// Middleware for specific creator types
const creatorType = (types) => {
    return (req, res, next) => {
        if (req.user &&
            req.user.role === 'creator' &&
            req.user.creatorType &&
            types.includes(req.user.creatorType)) {
            next();
        }
        else {
            res.status(401).json({ message: 'Not authorized for this creator type' });
            return;
        }
    };
};
exports.creatorType = creatorType;
//# sourceMappingURL=jwt.js.map