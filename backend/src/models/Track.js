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
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importStar(require("mongoose"));
const TrackSchema = new mongoose_1.Schema({
    creatorId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    creatorType: {
        type: String,
        enum: ['artist', 'dj', 'producer'],
        required: true
    },
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        default: ''
    },
    audioURL: {
        type: String,
        required: true
    },
    coverURL: {
        type: String,
        default: ''
    },
    genre: {
        type: String,
        required: true
    },
    type: {
        type: String,
        enum: ['song', 'beat', 'mix'],
        required: true
    },
    paymentType: {
        type: String,
        enum: ['free', 'paid'],
        default: 'free'
    },
    price: {
        type: Number,
        default: 0
    },
    currency: {
        type: String,
        default: 'RWF'
    },
    plays: {
        type: Number,
        default: 0
    },
    likes: {
        type: Number,
        default: 0
    },
    comments: [{
            type: mongoose_1.Schema.Types.ObjectId,
            ref: 'Comment'
        }],
    albumId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'Album'
    },
    releaseDate: {
        type: Date,
        required: false
    },
    collaborators: [{
        type: String
    }],
    copyrightAccepted: {
        type: Boolean,
        required: true,
        default: false
    }
}, {
    timestamps: true
});
// Indexes for better query performance
TrackSchema.index({ creatorId: 1 });
TrackSchema.index({ genre: 1 });
TrackSchema.index({ type: 1 });
TrackSchema.index({ albumId: 1 });
TrackSchema.index({ createdAt: -1 }); // For sorting by newest

const TrackModel = mongoose_1.default.model('Track', TrackSchema);
module.exports = TrackModel;