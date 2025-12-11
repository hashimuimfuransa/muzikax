import mongoose, { Document } from 'mongoose';
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
    albumId?: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<ITrack, {}, {}, {}, mongoose.Document<unknown, {}, ITrack, {}, mongoose.DefaultSchemaOptions> & ITrack & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, ITrack>;
export default _default;
//# sourceMappingURL=Track.d.ts.map