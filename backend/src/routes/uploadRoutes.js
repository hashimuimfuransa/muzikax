const express = require('express');
const multer = require('multer');
const { uploadTrack, protect } = require('../controllers/uploadController');
const { creator } = require('../utils/jwt');
const { getSignedUrl, proxyUpload } = require('../controllers/s3UploadController');
const { uploadFile } = require('../controllers/uploadCloudFrontController');

const router = express.Router();

// Multer storage for proxy uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get signed URL for S3 upload
router.route('/signed-url').post(protect, getSignedUrl);

// Proxy upload for S3 Express (bypass CORS)
router.route('/proxy-upload').post(protect, upload.single('file'), proxyUpload);

// New CloudFront upload route
router.route('/upload-cloudfront').post(upload.single('file'), uploadFile);

// Protected routes - only creators can upload tracks
router.route('/track').post(protect, creator, uploadTrack);

module.exports = router;