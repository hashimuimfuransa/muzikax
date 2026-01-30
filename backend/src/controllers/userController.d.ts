import { Request, Response } from 'express';
export declare const getUsers: (req: Request, res: Response) => Promise<void>;
export declare const getPublicCreators: (req: Request, res: Response) => Promise<void>;
export declare const getUserById: (req: Request, res: Response) => Promise<void>;
export declare const updateUser: (req: Request, res: Response) => Promise<void>;
export declare const upgradeToCreator: (req: Request, res: Response) => Promise<void>;
export declare const deleteUser: (req: Request, res: Response) => Promise<void>;
export declare const approveCreator: (req: Request, res: Response) => Promise<void>;
export declare const getCreatorAnalytics: (req: Request, res: Response) => Promise<void>;
export declare const followCreator: (req: Request, res: Response) => Promise<void>;
//# sourceMappingURL=userController.d.ts.map