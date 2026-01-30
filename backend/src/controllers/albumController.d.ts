import { Request, Response } from 'express';
import { protect } from '../utils/jwt';
export declare const createAlbum: (req: Request, res: Response) => Promise<void>;
export declare const getAllAlbums: (req: Request, res: Response) => Promise<void>;
export declare const getAlbumById: (req: Request, res: Response) => Promise<void>;
export declare const getAlbumsByCreator: (req: Request, res: Response) => Promise<void>;
export declare const updateAlbum: (req: Request, res: Response) => Promise<void>;
export declare const deleteAlbum: (req: Request, res: Response) => Promise<void>;
export declare const incrementAlbumPlayCount: (req: Request, res: Response) => Promise<void>;
export { protect };
//# sourceMappingURL=albumController.d.ts.map