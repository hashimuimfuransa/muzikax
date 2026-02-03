const express = require('express');
const { createPlaylist, addTrackToPlaylist, getPlaylists, removeTrackFromPlaylist, updatePlaylist, deletePlaylist, updatePlaylistMetadata } = require('../../controllers/favoritePlaylistController');
const { protect } = require('../../utils/jwt');

console.log('PLAYLIST ROUTES FILE LOADED');

const router = express.Router();

console.log('SETTING UP PLAYLIST ROUTES');

// Add logging to see which routes are being hit
router.use((req, _res, next) => {
  console.log(`Playlist routes middleware triggered: ${req.method} ${req.originalUrl}`);
  next();
});

// User routes for playlists - accessible to authenticated users
router.route('/')
  .post(protect, createPlaylist)
  .get(protect, getPlaylists);

router.route('/add-track')
  .post(protect, addTrackToPlaylist);

router.route('/remove-track')
  .post(protect, removeTrackFromPlaylist);

router.route('/update')
  .put(protect, updatePlaylist);

router.route('/:id')
  .patch(protect, updatePlaylistMetadata)
  .delete(protect, deletePlaylist);

module.exports = router;