const express = require('express');
const { 
  getRecommendedPlaylists,
  getPublicPlaylists,
  getPublicPlaylistById
} = require('../../controllers/publicPlaylistController');

const router = express.Router();

// Get recommended playlists for home page (public access)
router.get('/recommended', getRecommendedPlaylists);

// Get all public playlists for browse page (public access)
router.get('/', getPublicPlaylists);

// Get a single public playlist by ID
router.get('/:id', getPublicPlaylistById);

module.exports = router;