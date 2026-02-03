const express = require('express');
const { 
  getRecommendedPlaylists,
  getPublicPlaylists
} = require('../../controllers/publicPlaylistController');

const router = express.Router();

// Get recommended playlists for home page (public access)
router.get('/recommended', getRecommendedPlaylists);

// Get all public playlists for browse page (public access)
router.get('/', getPublicPlaylists);

module.exports = router;