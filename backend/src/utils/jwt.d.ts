import { Request, Response, NextFunction } from 'express';
import { IUser } from '../models/User';
interface JwtPayload {
    id: string;
    role: string;
    creatorType: string | null;
}
export declare const generateAccessToken: (user: IUser) => string;
export declare const generateRefreshToken: (user: IUser) => string;
export declare const verifyAccessToken: (token: string) => JwtPayload | null;
export declare const verifyRefreshToken: (token: string) => JwtPayload | null;
export declare const protect: (req: Request, res: Response, next: NextFunction) => Promise<void>;
export declare const admin: (req: Request, res: Response, next: NextFunction) => void;
export declare const creator: (req: Request, res: Response, next: NextFunction) => void;
export declare const creatorType: (types: string[]) => (req: Request, res: Response, next: NextFunction) => void;
export {};
//# sourceMappingURL=jwt.d.ts.map