import * as express from 'express';
import {
  getAdminAnalytics,
  searchUsers,
  getPlatformStats,
  getUserStats,
  getContentStats,
  getUserById,
  updateUserRole,
  deleteUser
} from '../controllers/adminController';
import { protect, admin } from '../utils/jwt';

console.log('Loading admin routes...');

const router = express.Router();

// Add detailed logging for route registration
console.log('Setting up admin middleware...');
router.use((req, res, next) => {
  console.log(`Admin route middleware triggered: ${req.method} ${req.originalUrl}`);
  next();
});

// All admin routes require authentication and admin role
console.log('Applying protect and admin middleware...');
router.use(protect, (req, res, next) => {
  console.log('Protect middleware passed');
  admin(req, res, next);
});

// Add logging for each route
console.log('Registering admin routes...');

// Get admin dashboard analytics
router.route('/analytics')
  .get((req, res, next) => {
    console.log('GET /api/admin/analytics route hit');
    getAdminAnalytics(req, res);
  });

// Search users with filters
router.route('/users/search')
  .get((req, res, next) => {
    console.log('GET /api/admin/users/search route hit');
    searchUsers(req, res);
  });

// Get platform statistics
router.route('/platform-stats')
  .get((req, res, next) => {
    console.log('GET /api/admin/platform-stats route hit');
    getPlatformStats(req, res);
  });

// Get user statistics
router.route('/user-stats')
  .get((req, res, next) => {
    console.log('GET /api/admin/user-stats route hit');
    getUserStats(req, res);
  });

// Get content statistics
router.route('/content-stats')
  .get((req, res, next) => {
    console.log('GET /api/admin/content-stats route hit');
    getContentStats(req, res);
  });

// Get user by ID
router.route('/users/:id')
  .get((req, res, next) => {
    console.log(`GET /api/admin/users/${req.params.id} route hit`);
    getUserById(req, res);
  })
  .put((req, res, next) => {
    console.log(`PUT /api/admin/users/${req.params.id} route hit`);
    updateUserRole(req, res);
  })
  .delete((req, res, next) => {
    console.log(`DELETE /api/admin/users/${req.params.id} route hit`);
    deleteUser(req, res);
  });

console.log('Admin routes registered successfully');

export default router;