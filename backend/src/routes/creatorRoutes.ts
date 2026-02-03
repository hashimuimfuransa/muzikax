import * as express from 'express';
import { getCreatorAnalytics, getCreatorTracks } from '../controllers/creatorController';
import { protect, creator } from '../utils/jwt';

console.log('CREATOR ROUTES FILE LOADED');

const router = express.Router();

console.log('SETTING UP CREATOR ROUTES');

// Add logging to see which routes are being hit
router.use((req, _res, next) => {
  console.log(`Creator routes middleware triggered: ${req.method} ${req.originalUrl}`);
  next();
});

// Test route
router.get('/test', (req, res) => {
  console.log('CREATOR TEST ROUTE HIT - DIRECT LOG');
  console.log('Request headers:', req.headers);
  res.json({ message: 'Creator routes are working' });
});

// Creator-specific routes - protected by creator middleware
router.route('/analytics')
  .get(protect, creator, getCreatorAnalytics);

router.route('/tracks')
  .get(protect, creator, getCreatorTracks);

export default router;