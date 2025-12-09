import mongoose, { Document, Schema } from 'mongoose';

export interface ITrack extends Document {
  creatorId: mongoose.Types.ObjectId;
  creatorType: 'artist' | 'dj' | 'producer';
  title: string;
  description: string;
  audioURL: string;
  coverURL: string;
  genre: string;
  type: 'song' | 'beat' | 'mix';
  plays: number;
  likes: number;
  comments: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const TrackSchema: Schema = new Schema({
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
  plays: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  comments: [{
    type: Schema.Types.ObjectId,
    ref: 'Comment'
  }]
}, {
  timestamps: true
});

// Indexes for better query performance
TrackSchema.index({ creatorId: 1 });
TrackSchema.index({ genre: 1 });
TrackSchema.index({ type: 1 });
TrackSchema.index({ createdAt: -1 }); // For sorting by newest

export default mongoose.model<ITrack>('Track', TrackSchema);