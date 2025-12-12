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
  getTrendingTracks
} = require('../controllers/trackController');
const { protect, creator } = require('../utils/jwt');

const router = express.Router();

// Public routes
router.route('/').get(getAllTracks);
router.route('/trending').get(getTrendingTracks);
router.route('/:id').get(getTrackById);
router.route('/creator/:creatorId/simple').get(getTracksByCreatorSimple);
router.route('/creator/:creatorId').get(getTracksByCreator);

// Protected routes
router.route('/upload').post(protect, creator, uploadTrack);
router.route('/creator').get(protect, creator, getTracksByAuthUser);
router.route('/:id/play').put(incrementPlayCount);
router.route('/:id')
  .put(protect, updateTrack)
  .delete(protect, deleteTrack);

module.exports = router;