import mongoose, { Document } from 'mongoose';
export interface IPlaylist extends Document {
    name: string;
    description: string;
    userId: mongoose.Types.ObjectId;
    tracks: mongoose.Types.ObjectId[];
    isPublic: boolean;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IPlaylist, {}, {}, {}, mongoose.Document<unknown, {}, IPlaylist, {}, mongoose.DefaultSchemaOptions> & IPlaylist & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IPlaylist>;
export default _default;
//# sourceMappingURL=Playlist.d.ts.map