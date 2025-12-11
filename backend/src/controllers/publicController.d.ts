import { Request, Response } from 'express';
/**
 * Get public creators (accessible to all users)
 * This endpoint is completely public and requires no authentication
 */
export declare const getPublicCreators: (req: Request, res: Response) => Promise<void>;
/**
 * Get a specific creator's public profile by ID
 * This endpoint is completely public and requires no authentication
 */
export declare const getPublicCreatorProfile: (req: Request, res: Response) => Promise<void>;
/**
 * Get a specific creator's public statistics by ID
 * This endpoint is completely public and requires no authentication
 */
export declare const getPublicCreatorStats: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=publicController.d.ts.map