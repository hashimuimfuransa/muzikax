const express = require('express');
const { 
  getAllPlaylists,
  createAdminPlaylist,
  updatePlaylist,
  deletePlaylist,
  searchTracks,
  getRecommendedPlaylists
} = require('../../controllers/adminPlaylistController');
const { protect, admin } = require('../../utils/jwt');

const router = express.Router();

// Public routes first
router.get('/recommended', getRecommendedPlaylists);

// Admin middleware for protected routes
router.use(protect, admin);

// Protected admin routes
router.get('/', getAllPlaylists);
router.get('/search-tracks', searchTracks);
router.post('/', createAdminPlaylist);
router.put('/:id', updatePlaylist);
router.delete('/:id', deletePlaylist);

module.exports = router;