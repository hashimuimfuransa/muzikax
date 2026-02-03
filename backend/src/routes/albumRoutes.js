const express = require('express');
const {
  createAlbum,
  getAllAlbums,
  getAlbumById,
  getAlbumsByCreator,
  updateAlbum,
  deleteAlbum,
  incrementAlbumPlayCount
} = require('../controllers/albumController');
const { protect, creator } = require('../utils/jwt');

const router = express.Router();

// Public routes
router.route('/').get(getAllAlbums);
router.route('/:id').get(getAlbumById);
router.route('/creator/:creatorId').get(getAlbumsByCreator);

// Protected routes - only creators can create/update/delete albums
router.route('/').post(protect, creator, createAlbum);
router.route('/:id')
  .put(protect, updateAlbum)
  .delete(protect, deleteAlbum);

router.route('/:id/play').put(incrementAlbumPlayCount);

module.exports = router;