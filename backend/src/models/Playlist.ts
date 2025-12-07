import mongoose, { Document, Schema } from 'mongoose';

export interface IPlaylist extends Document {
  name: string;
  description: string;
  userId: mongoose.Types.ObjectId;
  tracks: mongoose.Types.ObjectId[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const PlaylistSchema: Schema = new Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  tracks: [{
    type: Schema.Types.ObjectId,
    ref: 'Track'
  }],
  isPublic: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

// Indexes for better query performance
PlaylistSchema.index({ userId: 1 });
PlaylistSchema.index({ isPublic: 1 });

export default mongoose.model<IPlaylist>('Playlist', PlaylistSchema);