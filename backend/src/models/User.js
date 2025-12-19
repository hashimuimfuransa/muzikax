"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var UserSchema = new mongoose_1.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true
    },
    password: {
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['fan', 'creator', 'admin'],
        default: 'fan'
    },
    creatorType: {
        type: String,
        enum: ['artist', 'dj', 'producer', null],
        default: null
    },
    avatar: {
        type: String,
        default: ''
    },
    bio: {
        type: String,
        default: ''
    },
    genres: {
        type: [String],
        default: []
    },
    socials: {
        facebook: String,
        twitter: String,
        instagram: String,
        youtube: String,
        soundcloud: String
    },
    followersCount: {
        type: Number,
        default: 0
    },
    favorites: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Track',
        default: []
    },
    playlists: {
        type: [mongoose_1.Schema.Types.ObjectId],
        ref: 'Playlist',
        default: []
    },
    recentlyPlayed: {
        type: [{
                trackId: {
                    type: mongoose_1.Schema.Types.ObjectId,
                    ref: 'Track',
                    required: true
                },
                playedAt: {
                    type: Date,
                    default: Date.now
                }
            }],
        default: []
    },
    whatsappContact: {
        type: String,
        default: ''
    }
}, {
    timestamps: true
});
// Index for email
UserSchema.index({ email: 1 });
module.exports = mongoose_1.default.model('User', UserSchema);
