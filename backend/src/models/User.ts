import mongoose, { Document, Schema } from 'mongoose';

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  role: 'fan' | 'creator' | 'admin';
  creatorType: 'artist' | 'dj' | 'producer' | null;
  avatar: string;
  bio: string;
  genres: string[];
  socials: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
    soundcloud?: string;
  };
  followersCount: number;
  favorites: mongoose.Types.ObjectId[]; // Add favorites field
  playlists: mongoose.Types.ObjectId[]; // Add playlists field
  recentlyPlayed: {
    trackId: mongoose.Types.ObjectId;
    playedAt: Date;
  }[]; // Add recently played tracks field
  whatsappContact: string; // Add WhatsApp contact field
  googleId: string; // Add Google ID field
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema: Schema = new Schema({
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
    type: [Schema.Types.ObjectId],
    ref: 'Track',
    default: []
  },
  playlists: {
    type: [Schema.Types.ObjectId],
    ref: 'Playlist',
    default: []
  },
  recentlyPlayed: {
    type: [{
      trackId: {
        type: Schema.Types.ObjectId,
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
  },
  googleId: {
    type: String,
    default: ''
  }
}, {
  timestamps: true
});

// Index for email
UserSchema.index({ email: 1 });
// Index for googleId
UserSchema.index({ googleId: 1 });

export default mongoose.model<IUser>('User', UserSchema);