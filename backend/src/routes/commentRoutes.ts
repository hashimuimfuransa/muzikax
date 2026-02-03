import * as express from 'express';
import { 
  addCommentToTrack, 
  getCommentsForTrack, 
  deleteComment 
} from '../controllers/commentController';
import { protect } from '../utils/jwt';

const router = express.Router();

// Protected routes - require authentication
router.route('/').post(protect, addCommentToTrack);
router.route('/track/:trackId').get(getCommentsForTrack);
router.route('/:id').delete(protect, deleteComment);

export default router;