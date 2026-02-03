import { Request, Response } from 'express';
export declare const uploadTrack: (req: Request, res: Response) => Promise<void>;
export declare const getAllTracks: (req: Request, res: Response) => Promise<void>;
export declare const getTrackById: (req: Request, res: Response) => Promise<void>;
export declare const getTracksByCreatorSimple: (req: Request, res: Response) => Promise<void>;
export declare const getTracksByCreator: (req: Request, res: Response) => Promise<void>;
export declare const getTracksByAuthUser: (req: Request, res: Response) => Promise<void>;
export declare const updateTrack: (req: Request, res: Response) => Promise<void>;
export declare const deleteTrack: (req: Request, res: Response) => Promise<void>;
export declare const incrementPlayCount: (req: Request, res: Response) => Promise<void>;
export declare const getTrendingTracks: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=trackController.d.ts.map