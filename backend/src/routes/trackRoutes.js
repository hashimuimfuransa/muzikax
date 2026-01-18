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
  getTracksByType,
  handleInvalidTrack
} = require('../controllers/trackController');
const { protect, creator } = require('../utils/jwt');

const router = express.Router();

// Public routes
router.route('/').get(getAllTracks);
router.route('/trending').get(getTrendingTracks);
router.route('/type').get(getTracksByType);
router.route('/:id').get(getTrackById);
router.route('/creator/:creatorId/simple').get(getTracksByCreatorSimple);
router.route('/creator/:creatorId').get(getTracksByCreator);

// Invalid track handling (public endpoint for frontend to report invalid tracks)
router.route('/:id/invalid').post(handleInvalidTrack);

// Protected routes
router.route('/upload').post(protect, creator, uploadTrack);
router.route('/creator').get(protect, creator, getTracksByAuthUser);
router.route('/:id/play').put(incrementPlayCount);
router.route('/:id')
  .put(protect, updateTrack)
  .delete(protect, deleteTrack);

module.exports = router;