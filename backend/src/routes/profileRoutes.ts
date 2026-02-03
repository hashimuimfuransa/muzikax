import * as express from 'express';
import * as profileController from '../controllers/profileController';
import { protect } from '../utils/jwt';

console.log('PROFILE ROUTES FILE LOADED');

const router = express.Router();

console.log('SETTING UP PROFILE ROUTES');

// User route for updating own profile
router.route('/me')
  .put(protect, profileController.updateOwnProfile);

export default router;