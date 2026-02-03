import * as express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  approveCreator,
  getCreatorAnalytics,
  getPublicCreators, // Add this import
  upgradeToCreator, // Add this import
  followCreator, // Add this import
} from '../controllers/userController';
import { protect, admin, creator } from '../utils/jwt';

console.log('USER ROUTES FILE LOADED');

const router = express.Router();

console.log('SETTING UP USER ROUTES');

// Add logging to see which routes are being hit
router.use((req, _res, next) => {
  console.log(`User routes middleware triggered: ${req.method} ${req.originalUrl}`);
  next();
});

// Test route
router.get('/test', (req, res) => {
  console.log('TEST ROUTE HIT - DIRECT LOG');
  console.log('Request headers:', req.headers);
  res.json({ message: 'User routes are working' });
});

// Simple test route without authentication
router.get('/simple-test', (_req, res) => {
  console.log('SIMPLE TEST ROUTE HIT');
  res.json({ message: 'Simple test route working' });
});

// Public routes for creators - explicitly without authentication
router.get('/public-creators', (req, res, next) => {
  console.log('Public creators route hit, no auth required');
  getPublicCreators(req, res).catch(next);
});

// Admin routes
router.route('/')
  .get(protect, admin, getUsers);

router.route('/:id')
  .get(protect, admin, getUserById)
  .put(protect, admin, updateUser)
  .delete(protect, admin, deleteUser);

router.route('/:id/approve')
  .put(protect, admin, approveCreator);

// Creator routes
router.route('/analytics')
  .get(protect, creator, getCreatorAnalytics);

// User route for upgrading to creator
router.route('/upgrade-to-creator')
  .put((req, res, next) => {
    console.log('Upgrade to creator route hit');
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

// User route for following a creator
router.route('/follow/:id')
  .post(protect, followCreator);

export default router;