import * as express from 'express';
import {
  register,
  login,
  refreshToken,
  getUserProfile,
  updateUserProfile
} from '../controllers/authController';
import { googleLogin } from '../controllers/googleAuthController';
import { 
  requestOTP, 
  verifyOTPAndLogin, 
  resendOTP, 
  enable2FA, 
  get2FAStatus 
} from '../controllers/twoFAController';
import { protect } from '../utils/jwt';

const router = express.Router();

router.route('/register').post(register);
router.route('/login').post(login);
router.route('/google').post(googleLogin);
router.route('/refresh-token').post(refreshToken);

// 2FA routes for artists
router.route('/2fa/request').post(requestOTP);
router.route('/2fa/verify').post(verifyOTPAndLogin);
router.route('/2fa/resend').post(resendOTP);
router.route('/2fa/enable').put(protect, enable2FA);
router.route('/2fa/status').get(protect, get2FAStatus);

router.route('/profile')
  .get(protect, getUserProfile)
  .put(protect, updateUserProfile);

// Add the missing /me endpoint
router.route('/me')
  .get(protect, getUserProfile);

export default router;