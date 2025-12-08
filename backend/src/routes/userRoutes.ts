import * as express from 'express';
import {
  getUsers,
  getUserById,
  updateUser,
  deleteUser,
  approveCreator,
  getCreatorAnalytics,
  upgradeToCreator // Add this import
} from '../controllers/userController';
import { protect, admin, creator } from '../utils/jwt';

const router = express.Router();

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
  .put(protect, upgradeToCreator); // Users can upgrade themselves

export default router;