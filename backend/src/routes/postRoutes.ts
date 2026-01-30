import * as express from 'express';
import {
  createPost,
  getPosts,
  likePost,
  getPostStats
} from '../controllers/postController';
import { protect } from '../utils/jwt';

console.log('POST ROUTES FILE LOADED');

const router = express.Router();

console.log('SETTING UP POST ROUTES');

// Add logging to see which routes are being hit
router.use((req, _res, next) => {
  console.log(`Post routes middleware triggered: ${req.method} ${req.originalUrl}`);
  next();
});

// Create a new post (authenticated users only)
router.post('/', protect, (req, res, next) => {
  console.log('Create post route hit');
  createPost(req, res).catch(next);
});

// Get all posts (publicly accessible)
router.get('/', (req, res, next) => {
  console.log('Get posts route hit');
  getPosts(req, res).catch(next);
});

// Like/unlike a post (authenticated users only)
router.post('/:id/like', protect, (req, res, next) => {
  console.log('Like post route hit');
  likePost(req, res).catch(next);
});

// Get post statistics (publicly accessible)
router.get('/stats', (req, res, next) => {
  console.log('Get post stats route hit');
  getPostStats(req, res).catch(next);
});

console.log('Post routes registered successfully');

export default router;