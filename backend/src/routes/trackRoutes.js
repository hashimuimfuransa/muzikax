const express = require('express');
const {
  uploadTrack,
  getAllTracks,
  getTrackById,
  getTracksByCreator,
  getTracksByCreatorSimple,
  getTracksByAuthUser,
  updateTrack,
  deleteTrack,
  incrementPlayCount,
  getTrendingTracks,
  getMonthlyPopularTracks,
  getTracksByType,
  getTracksFromFollowedArtists,
  handleInvalidTrack
} = require('../controllers/trackController');
const { protect, creator } = require('../utils/jwt');
const {
  getTrackStems,
  streamStem,
  uploadWithStemSeparation,
  streamTrackAudio  // ← NEW
} = require('../controllers/stemController');

const router = express.Router();

// Specific routes MUST come before parameterized routes (/:id)

// Following route (must be before /:id)
router.route('/following').get(protect, getTracksFromFollowedArtists);

// Public specialized routes
router.route('/trending').get(getTrendingTracks);
router.route('/monthly-popular').get(getMonthlyPopularTracks);
router.route('/type').get(getTracksByType);

// Creator routes
router.route('/creator').get(protect, creator, getTracksByAuthUser);
router.route('/creator/:creatorId/simple').get(getTracksByCreatorSimple);
router.route('/creator/:creatorId').get(getTracksByCreator);

// Upload route
router.route('/upload').post(protect, creator, uploadTrack);
router.route('/upload-with-stems').post(protect, creator, uploadWithStemSeparation);

// Stem routes (MUST come before /:id)
router.route('/:id/stems').get(getTrackStems);
router.route('/:id/stems/:stemName').get(streamStem);

// NEW: Audio proxy route to bypass CORS
router.route('/:id/stream').get(streamTrackAudio);

// Track action routes
router.route('/:id/play').put(incrementPlayCount);
router.route('/:id/invalid').post(handleInvalidTrack);

// Generic track ID routes
router.route('/:id').get(getTrackById);
router.route('/:id')
  .put(protect, updateTrack)
  .delete(protect, deleteTrack);

// Root route
router.route('/').get(getAllTracks);

module.exports = router;
