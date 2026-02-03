import * as express from 'express';
import { upgradeToCreator } from '../controllers/upgradeController';
import { protect } from '../utils/jwt';

console.log('UPGRADE ROUTES FILE LOADED');

const router = express.Router();

console.log('SETTING UP UPGRADE ROUTES');

// Add logging to see which routes are being hit
router.use((_req, _res, next) => {
  console.log(`Upgrade routes middleware triggered: ${_req.method} ${_req.originalUrl}`);
  next();
});

// Simple test route without authentication
router.get('/test', (_req, res) => {
  console.log('UPGRADE TEST ROUTE HIT');
  res.json({ message: 'Upgrade routes are working' });
});

// User route for upgrading to creator (no admin required)
router.route('/to-creator')
  .put((req, res, next) => {
    console.log('Upgrade to creator route hit in upgradeRoutes');
    console.log('Request headers:', req.headers);
    
    // Check if authorization header exists
    if (!req.headers.authorization) {
      console.log('No authorization header found');
      return res.status(401).json({ message: 'Authorization header missing' });
    }
    
    protect(req, res, (err) => {
      if (err) {
        console.log('Protect middleware error:', err);
        return next(err);
      }
      console.log('Protect middleware passed, calling upgradeToCreator');
      console.log('User in request:', (req as any).user);
      upgradeToCreator(req, res);
      // Return undefined to satisfy TypeScript
      return undefined;
    });
    // Return undefined to satisfy TypeScript
    return undefined;
  }); // Users can upgrade themselves

export default router;