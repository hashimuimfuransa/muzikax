const express = require('express');
const {
  getAdminAnalytics,
  searchUsers,
  getPlatformStats,
  getUserStats,
  getContentStats,
  getUserById,
  updateUserRole,
  deleteUser,
  getGeographicDistribution,
  getPlayHistory,
  getHomepageContent,
  updateHomepageContent,
  reorderSlides,
  addSlide,
  updateSlide,
  deleteSlide
} = require('../controllers/adminController');

// Import admin playlist routes
const adminPlaylistRoutes = require('./admin/playlistRoutes');
const { protect, admin } = require('../utils/jwt');

console.log('Loading admin routes...');

const router = express.Router();

// Add detailed logging for route registration
console.log('Setting up admin middleware...');
router.use((_req, _res, next) => {
  console.log(`Admin route middleware triggered: ${_req.method} ${_req.originalUrl}`);
  next();
});

// Add logging for each route
console.log('Registering admin routes...');

// Get homepage content (PUBLIC - no auth required) - MUST be BEFORE protect middleware
router.route('/homepage')
  .get((_req, res) => {
    console.log('GET /api/admin/homepage route hit (public)');
    getHomepageContent(_req, res);
  });

// All other admin routes require authentication and admin role
console.log('Applying protect and admin middleware to protected routes...');
router.use(protect, (req, res, next) => {
  console.log('Protect middleware passed for protected routes');
  admin(req, res, next);
});

// Get admin dashboard analytics
router.route('/analytics')
  .get((_req, res) => {
    console.log('GET /api/admin/analytics route hit');
    getAdminAnalytics(_req, res);
  });

// Search users with filters
router.route('/users/search')
  .get((_req, res) => {
    console.log('GET /api/admin/users/search route hit');
    searchUsers(_req, res);
  });

// Get platform statistics
router.route('/platform-stats')
  .get((_req, res) => {
    console.log('GET /api/admin/platform-stats route hit');
    getPlatformStats(_req, res);
  });

// Get user statistics
router.route('/user-stats')
  .get((_req, res) => {
    console.log('GET /api/admin/user-stats route hit');
    getUserStats(_req, res);
  });

// Get content statistics
router.route('/content-stats')
  .get((_req, res) => {
    console.log('GET /api/admin/content-stats route hit');
    getContentStats(_req, res);
  });

// Get user by ID
router.route('/users/:id')
  .get((req, res) => {
    console.log(`GET /api/admin/users/${req.params.id} route hit`);
    getUserById(req, res);
  })
  .put((req, res) => {
    console.log(`PUT /api/admin/users/${req.params.id} route hit`);
    updateUserRole(req, res);
  })
  .delete((req, res) => {
    console.log(`DELETE /api/admin/users/${req.params.id} route hit`);
    deleteUser(req, res);
  });

// Get geographic distribution of listeners
router.route('/geographic-distribution')
  .get((req, res) => {
    console.log('GET /api/admin/geographic-distribution route hit');
    getGeographicDistribution(req, res);
  });

// Get play history over time
router.route('/play-history')
  .get((req, res) => {
    console.log('GET /api/admin/play-history route hit');
    getPlayHistory(req, res);
  });

// Homepage content management routes (protected - admin only)
router.route('/homepage')
  .put((req, res) => {
    console.log('PUT /api/admin/homepage route hit (admin only)');
    updateHomepageContent(req, res);
  });

router.route('/homepage/reorder')
  .put((req, res) => {
    console.log('PUT /api/admin/homepage/reorder route hit');
    reorderSlides(req, res);
  });

router.route('/homepage/slides')
  .post((req, res) => {
    console.log('POST /api/admin/homepage/slides route hit');
    addSlide(req, res);
  });

router.route('/homepage/slides/:slideId')
  .put((req, res) => {
    console.log(`PUT /api/admin/homepage/slides/${req.params.slideId} route hit`);
    updateSlide(req, res);
  })
  .delete((req, res) => {
    console.log(`DELETE /api/admin/homepage/slides/${req.params.slideId} route hit`);
    deleteSlide(req, res);
  });

// Admin playlist management routes
router.use('/playlists', adminPlaylistRoutes);

console.log('Admin routes registered successfully');

module.exports = router;