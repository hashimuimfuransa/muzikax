const express = require('express');
const { uploadTrack, protect } = require('../controllers/uploadController');
const { creator } = require('../utils/jwt');

const router = express.Router();

// Protected routes - only creators can upload tracks
router.route('/track').post(protect, creator, uploadTrack);

module.exports = router;