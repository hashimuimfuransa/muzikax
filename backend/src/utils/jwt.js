"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.creatorType = exports.creator = exports.admin = exports.protect = exports.verifyRefreshToken = exports.verifyAccessToken = exports.generateRefreshToken = exports.generateAccessToken = void 0;
var jwt = require("jsonwebtoken");
var User_1 = require("../models/User");
// Generate access token
var generateAccessToken = function (user) {
    var payload = {
        id: user._id,
        role: user.role,
        creatorType: user.creatorType
    };
    var secret = process.env['JWT_ACCESS_SECRET'] || 'access_secret';
    var options = {
        expiresIn: process.env['JWT_ACCESS_EXPIRE'] || '15m'
    };
    console.log('Generating access token with secret:', secret.substring(0, 10) + '...');
    return jwt.sign(payload, secret, options);
};
exports.generateAccessToken = generateAccessToken;
// Generate refresh token
var generateRefreshToken = function (user) {
    var payload = {
        id: user._id
    };
    var secret = process.env['JWT_REFRESH_SECRET'] || 'refresh_secret';
    var options = {
        expiresIn: process.env['JWT_REFRESH_EXPIRE'] || '7d'
    };
    console.log('Generating refresh token with secret:', secret.substring(0, 10) + '...');
    return jwt.sign(payload, secret, options);
};
exports.generateRefreshToken = generateRefreshToken;
// Verify access token
var verifyAccessToken = function (token) {
    try {
        var secret = process.env['JWT_ACCESS_SECRET'] || 'access_secret';
        console.log('Verifying access token with secret:', secret.substring(0, 10) + '...');
        var decoded = jwt.verify(token, secret);
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
var verifyRefreshToken = function (token) {
    try {
        var secret = process.env['JWT_REFRESH_SECRET'] || 'refresh_secret';
        console.log('Verifying refresh token with secret:', secret.substring(0, 10) + '...');
        var decoded = jwt.verify(token, secret);
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
var protect = function (req, res, next) { return __awaiter(void 0, void 0, void 0, function () {
    var token, decoded, user, error_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!(req.headers.authorization && req.headers.authorization.startsWith('Bearer'))) return [3 /*break*/, 4];
                _a.label = 1;
            case 1:
                _a.trys.push([1, 3, , 4]);
                token = req.headers.authorization.split(' ')[1];
                // Log token info for debugging
                console.log('Token extracted from header:', token ? "".concat(token.substring(0, 10), "...") : 'No token');
                if (!token) {
                    res.status(401).json({ message: 'Not authorized, token missing' });
                    return [2 /*return*/];
                }
                decoded = (0, exports.verifyAccessToken)(token);
                // Log decoded token info (without sensitive data)
                console.log('Token verification result:', decoded ? 'Valid' : 'Invalid');
                if (!decoded) {
                    res.status(401).json({ message: 'Not authorized, invalid or expired token' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, User_1.findById(decoded.id).select('-password')];
            case 2:
                user = _a.sent();
                console.log('User found from token:', user ? user._id : 'Not found');
                if (!user) {
                    res.status(401).json({ message: 'Not authorized, user not found' });
                    return [2 /*return*/];
                }
                // Attach user to request object
                req.user = user;
                next();
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('Authentication error:', error_1);
                res.status(401).json({ message: 'Not authorized, token validation failed', error: error_1 instanceof Error ? error_1.message : 'Unknown error' });
                return [2 /*return*/];
            case 4:
                if (!token) {
                    res.status(401).json({ message: 'Not authorized, no token provided' });
                    return [2 /*return*/];
                }
                return [2 /*return*/];
        }
    });
}); };
exports.protect = protect;
// Middleware for admin authorization
var admin = function (req, res, next) {
    var _a;
    console.log('ADMIN MIDDLEWARE CALLED');
    console.log('Request URL:', req.originalUrl);
    console.log('User in request:', req.user);
    if (req.user && req.user.role === 'admin') {
        console.log('Admin check passed');
        next();
    }
    else {
        console.log('Admin check failed - user role:', (_a = req.user) === null || _a === void 0 ? void 0 : _a.role);
        res.status(401).json({ message: 'Not authorized as admin' });
        return;
    }
};
exports.admin = admin;
// Middleware for creator authorization
var creator = function (req, res, next) {
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
var creatorType = function (types) {
    return function (req, res, next) {
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
