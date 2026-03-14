import * as express from 'express';
import * as multer from 'multer';
import { uploadTrack, protect } from '../controllers/uploadController';
import { creator } from '../utils/jwt';
import { getSignedUrl, proxyUpload } from '../controllers/s3UploadController';

const router = express.Router();

// Multer storage for proxy uploads (memory storage)
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// Get signed URL for S3 upload
router.route('/signed-url').post(protect, getSignedUrl);

// Proxy upload for S3 Express (bypass CORS)
router.route('/proxy-upload').post(protect, upload.single('file'), proxyUpload);

// Protected routes - only creators can upload tracks
router.route('/track').post(protect, creator, uploadTrack);

export default router;