import * as express from 'express';
import {
  register,
  login,
  refreshToken,
  getUserProfile,
  updateUserProfile
} from '../controllers/authController';
import { googleLogin } from '../controllers/googleAuthController';
import { protect } from '../utils/jwt';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/google').post(googleLogin);
router.route('/refresh-token').post(refreshToken);
router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Add the missing /me endpoint
router.route('/me')
  .get(protect, getUserProfile);

export default router;