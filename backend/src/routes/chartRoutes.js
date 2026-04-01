const express = require('express');
const {
  getGlobalCharts,
  getCountryCharts,
  getGenreCharts,
  getTrendingCharts,
  getChartMetadata,
  debugCharts
} = require('../controllers/chartController');
const {
  trackShare,
  trackRepost,
  trackPlaylistAdd,
  bulkTrackEngagement
} = require('../controllers/engagementController');
const { protect } = require('../utils/jwt');

const router = express.Router();

// Chart routes
router.get('/global', getGlobalCharts);
router.get('/trending', getTrendingCharts);
router.get('/metadata', getChartMetadata);
router.get('/debug', debugCharts); // Debug endpoint for performance monitoring
router.get('/:countryCode', getCountryCharts);
router.get('/genre/:genre', getGenreCharts);

// Engagement tracking routes (optional authentication for better analytics)
router.post('/share', trackShare);
router.post('/repost', trackRepost);
router.post('/playlist', trackPlaylistAdd);
router.post('/bulk', bulkTrackEngagement);

module.exports = router;
