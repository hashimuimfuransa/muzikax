"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatorType = exports.creator = exports.admin = exports.protect = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
const jwt = __importStar(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
// Generate access token
const generateAccessToken = (user) => {
    const payload = {
        id: user._id,
        role: user.role,
        creatorType: user.creatorType
    };
    const secret = process.env['JWT_ACCESS_SECRET'] || 'access_secret';
    const options = {
        expiresIn: process.env['JWT_ACCESS_EXPIRE'] || '15m'
    };
    console.log('Generating access token with secret:', secret.substring(0, 10) + '...');
    return jwt.sign(payload, secret, options);
};
exports.generateAccessToken = generateAccessToken;
// Generate refresh token
const generateRefreshToken = (user) => {
    const payload = {
        id: user._id
    };
    const secret = process.env['JWT_REFRESH_SECRET'] || 'refresh_secret';
    const options = {
        expiresIn: process.env['JWT_REFRESH_EXPIRE'] || '7d'
    };
    console.log('Generating refresh token with secret:', secret.substring(0, 10) + '...');
    return jwt.sign(payload, secret, options);
};
exports.generateRefreshToken = generateRefreshToken;
// Verify access token
const verifyAccessToken = (token) => {
    try {
        const secret = process.env['JWT_ACCESS_SECRET'] || 'access_secret';
        console.log('Verifying access token with secret:', secret.substring(0, 10) + '...');
        const decoded = jwt.verify(token, secret);
        console.log('Token verified successfully');
        return decoded;
    }
    catch (error) {
        console.error('Token verification failed:', error);
        return null;
    }
};
exports.verifyAccessToken = verifyAccessToken;
// Verify refresh token
const verifyRefreshToken = (token) => {
    try {
        const secret = process.env['JWT_REFRESH_SECRET'] || 'refresh_secret';
        console.log('Verifying refresh token with secret:', secret.substring(0, 10) + '...');
        const decoded = jwt.verify(token, secret);
        console.log('Refresh token verified successfully');
        return decoded;
    }
    catch (error) {
        console.error('Refresh token verification failed:', error);
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
            // Log token info for debugging
            console.log('Token extracted from header:', token ? `${token.substring(0, 10)}...` : 'No token');
            if (!token) {
                res.status(401).json({ message: 'Not authorized, token missing' });
                return;
            }
            const decoded = (0, exports.verifyAccessToken)(token);
            // Log decoded token info (without sensitive data)
            console.log('Token verification result:', decoded ? 'Valid' : 'Invalid');
            if (!decoded) {
                res.status(401).json({ message: 'Not authorized, invalid or expired token' });
                return;
            }
            const user = await User_1.default.findById(decoded.id).select('-password');
            console.log('User found from token:', user ? user._id : 'Not found');
            if (!user) {
                res.status(401).json({ message: 'Not authorized, user not found' });
                return;
            }
            // Attach user to request object
            req.user = user;
            next();
        }
        catch (error) {
            console.error('Authentication error:', error);
            res.status(401).json({ message: 'Not authorized, token validation failed', error: error instanceof Error ? error.message : 'Unknown error' });
            return;
        }
    }
    if (!token) {
        res.status(401).json({ message: 'Not authorized, no token provided' });
        return;
    }
};
exports.protect = protect;
// Middleware for admin authorization
const admin = (req, res, next) => {
    console.log('ADMIN MIDDLEWARE CALLED');
    console.log('Request URL:', req.originalUrl);
    console.log('User in request:', req.user);
    if (req.user && req.user.role === 'admin') {
        console.log('Admin check passed');
        next();
    }
    else {
        console.log('Admin check failed - user role:', req.user?.role);
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