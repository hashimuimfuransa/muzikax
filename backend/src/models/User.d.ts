import mongoose, { Document } from 'mongoose';
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    role: 'fan' | 'creator' | 'admin';
    creatorType: 'artist' | 'dj' | 'producer' | null;
    avatar: string;
    bio: string;
    socials: {
        facebook?: string;
        twitter?: string;
        instagram?: string;
        youtube?: string;
        soundcloud?: string;
    };
    followersCount: number;
    createdAt: Date;
    updatedAt: Date;
}
declare const _default: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}, mongoose.DefaultSchemaOptions> & IUser & Required<{
    _id: mongoose.Types.ObjectId;
}> & {
    __v: number;
}, any, IUser>;
export default _default;
//# sourceMappingURL=User.d.ts.map