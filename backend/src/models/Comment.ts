import mongoose, { Document, Schema } from 'mongoose';

export interface IComment extends Document {
  trackId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  text: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommentSchema: Schema = new Schema({
  trackId: {
    type: Schema.Types.ObjectId,
    ref: 'Track',
    required: true
  },
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  text: {
    type: String,
    required: true,
    maxlength: 500
  }
}, {
  timestamps: true
});

// Indexes for better query performance
CommentSchema.index({ trackId: 1 });
CommentSchema.index({ userId: 1 });
CommentSchema.index({ createdAt: -1 }); // For sorting by newest

export default mongoose.model<IComment>('Comment', CommentSchema);