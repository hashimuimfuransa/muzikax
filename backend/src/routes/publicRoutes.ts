import * as express from 'express';
import { 
  getPublicCreators,
  getPublicCreatorProfile,
  getPublicCreatorStats,
  getPublicUserProfile
} from '../controllers/publicController';

console.log('PUBLIC ROUTES FILE LOADED');

const router = express.Router();

console.log('SETTING UP PUBLIC ROUTES');

// Add logging to see which routes are being hit
router.use((_req, _res, next) => {
  console.log(`PUBLIC ROUTES MIDDLEWARE TRIGGERED: ${_req.method} ${_req.originalUrl}`);
  next();
});

// Health check for public routes
router.get('/health', (_req, res) => {
  console.log('PUBLIC HEALTH CHECK ROUTE HIT');
  res.json({ message: 'Public routes are working' });
});

// Public endpoint for ANY user profile - no authentication required
router.get('/user/:id', (req, res, next) => {
  console.log('Public user profile route hit, no auth required');
  getPublicUserProfile(req, res).catch(next);
});

// Public endpoints for creators - no authentication required
router.get('/creators', (req, res, next) => {
  console.log('Public creators route hit, no auth required');
  getPublicCreators(req, res).catch(next);
});

router.get('/creators/:id', (req, res, next) => {
  console.log('Public creator profile route hit, no auth required');
  getPublicCreatorProfile(req, res).catch(next);
});

router.get('/creators/:id/stats', (req, res, next) => {
  console.log('Public creator stats route hit, no auth required');
  getPublicCreatorStats(req, res).catch(next);
});

export default router;