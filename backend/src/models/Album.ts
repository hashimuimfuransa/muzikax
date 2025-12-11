import mongoose, { Document, Schema } from 'mongoose';

export interface IAlbum extends Document {
  creatorId: mongoose.Types.ObjectId;
  creatorType: 'artist' | 'dj' | 'producer';
  title: string;
  description: string;
  coverURL: string;
  genre: string;
  type: 'album';
  releaseDate: Date;
  tracks: mongoose.Types.ObjectId[];
  plays: number;
  likes: number;
  createdAt: Date;
  updatedAt: Date;
}

const AlbumSchema: Schema = new Schema({
  creatorId: {
    type: Schema.Types.ObjectId,
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
    enum: ['album'],
    default: 'album'
  },
  releaseDate: {
    type: Date,
    default: Date.now
  },
  tracks: [{
    type: Schema.Types.ObjectId,
    ref: 'Track'
  }],
  plays: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
});

// Indexes for better query performance
AlbumSchema.index({ creatorId: 1 });
AlbumSchema.index({ genre: 1 });
AlbumSchema.index({ createdAt: -1 }); // For sorting by newest

export default mongoose.model<IAlbum>('Album', AlbumSchema);