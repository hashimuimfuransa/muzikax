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
exports.getWhatsAppContact = exports.updateWhatsAppContact = void 0;
var User_1 = require("../models/User");
var mongoose_1 = require("mongoose");
// Update user's WhatsApp contact
var updateWhatsAppContact = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user, whatsappContact, updatedUser, error_1, messages;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 3, , 4]);
                // Check if user is authenticated
                if (!req.user) {
                    res.status(401).json({ message: 'Not authorized, no user found' });
                    return [2 /*return*/];
                }
                userId = req.user._id;
                // Validate user ID
                if (!(0, mongoose_1.isValidObjectId)(userId)) {
                    res.status(400).json({ message: 'Invalid user ID' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, User_1.findById(userId).select('+password')];
            case 1:
                user = _a.sent();
                if (!user) {
                    res.status(404).json({ message: 'User not found' });
                    return [2 /*return*/];
                }
                whatsappContact = req.body.whatsappContact;
                // Validate input data
                if (whatsappContact !== undefined && typeof whatsappContact !== 'string') {
                    res.status(400).json({ message: 'WhatsApp contact must be a string' });
                    return [2 /*return*/];
                }
                // Update WhatsApp contact field only if provided
                if (whatsappContact !== undefined) {
                    user.whatsappContact = whatsappContact;
                }
                return [4 /*yield*/, user.save()];
            case 2:
                updatedUser = _a.sent();
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
                    whatsappContact: updatedUser.whatsappContact,
                    createdAt: updatedUser.createdAt
                });
                return [3 /*break*/, 4];
            case 3:
                error_1 = _a.sent();
                console.error('WhatsApp contact update error:', error_1);
                // Handle MongoDB duplicate key error
                if (error_1.code === 11000) {
                    res.status(400).json({ message: 'Email is already in use by another account' });
                    return [2 /*return*/];
                }
                // Handle validation errors
                if (error_1.name === 'ValidationError') {
                    messages = Object.values(error_1.errors).map(function (err) { return err.message; });
                    res.status(400).json({ message: messages.join(', ') });
                    return [2 /*return*/];
                }
                res.status(500).json({ message: error_1.message || 'Server error during WhatsApp contact update' });
                return [3 /*break*/, 4];
            case 4: return [2 /*return*/];
        }
    });
}); };
exports.updateWhatsAppContact = updateWhatsAppContact;
// Get user's WhatsApp contact
var getWhatsAppContact = function (req, res) { return __awaiter(void 0, void 0, void 0, function () {
    var userId, user, error_2;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _a.trys.push([0, 2, , 3]);
                // Check if user is authenticated
                if (!req.user) {
                    res.status(401).json({ message: 'Not authorized, no user found' });
                    return [2 /*return*/];
                }
                userId = req.user._id;
                // Validate user ID
                if (!(0, mongoose_1.isValidObjectId)(userId)) {
                    res.status(400).json({ message: 'Invalid user ID' });
                    return [2 /*return*/];
                }
                return [4 /*yield*/, User_1.findById(userId)];
            case 1:
                user = _a.sent();
                if (!user) {
                    res.status(404).json({ message: 'User not found' });
                    return [2 /*return*/];
                }
                res.json({
                    whatsappContact: user.whatsappContact || ''
                });
                return [3 /*break*/, 3];
            case 2:
                error_2 = _a.sent();
                console.error('Error fetching WhatsApp contact:', error_2);
                res.status(500).json({ message: error_2.message || 'Server error fetching WhatsApp contact' });
                return [3 /*break*/, 3];
            case 3: return [2 /*return*/];
        }
    });
}); };
exports.getWhatsAppContact = getWhatsAppContact;
