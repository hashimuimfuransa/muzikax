import mongoose, { Document, Schema } from 'mongoose';

export interface IListenerGeography extends Document {
  trackId: mongoose.Types.ObjectId;
  creatorId: mongoose.Types.ObjectId;
  ipAddress: string;
  country: string;
  region: string;
  city: string;
  latitude: number;
  longitude: number;
  timestamp: Date;
}

const ListenerGeographySchema: Schema = new Schema({
  trackId: {
    type: Schema.Types.ObjectId,
    ref: 'Track',
    required: true
  },
  creatorId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ipAddress: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true
  },
  region: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true
  },
  latitude: {
    type: Number,
    required: true
  },
  longitude: {
    type: Number,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Indexes for better query performance
ListenerGeographySchema.index({ trackId: 1 });
ListenerGeographySchema.index({ creatorId: 1 });
ListenerGeographySchema.index({ country: 1 });
ListenerGeographySchema.index({ timestamp: -1 });

export default mongoose.model<IListenerGeography>('ListenerGeography', ListenerGeographySchema);