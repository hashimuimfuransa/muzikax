import { Request, Response } from 'express';

export declare const addFavorite: (req: Request, res: Response) => Promise<void>;
export declare const removeFavorite: (req: Request, res: Response) => Promise<void>;
export declare const getFavorites: (req: Request, res: Response) => Promise<void>;
export declare const createPlaylist: (req: Request, res: Response) => Promise<void>;
export declare const addTrackToPlaylist: (req: Request, res: Response) => Promise<void>;
export declare const getPlaylists: (req: Request, res: Response) => Promise<void>;