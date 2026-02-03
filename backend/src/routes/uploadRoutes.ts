import * as express from 'express';
import { uploadTrack, protect } from '../controllers/uploadController';
import { creator } from '../utils/jwt';

const router = express.Router();

// Protected routes - only creators can upload tracks
router.route('/track').post(protect, creator, uploadTrack);

export default router;