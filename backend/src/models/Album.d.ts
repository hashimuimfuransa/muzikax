import mongoose, { Document } from 'mongoose';
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
declare const _default: mongoose.Model<IAlbum, {}, {}, {}, mongoose.Document<unknown, {}, IAlbum, {}, mongoose.DefaultSchemaOptions> & IAlbum & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IAlbum>;
export default _default;
//# sourceMappingURL=Album.d.ts.map