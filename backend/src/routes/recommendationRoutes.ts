import express from 'express';
import { 
  getPersonalizedRecommendations, 
  getGeneralRecommendations,
  getSimilarTracks
} from '../controllers/recommendationController';
import { protect } from '../utils/jwt';

const router = express.Router();

// Personalized recommendations (requires authentication)
router.get('/personalized', protect, getPersonalizedRecommendations);

// General recommendations (public)
router.get('/general', getGeneralRecommendations);

// Similar tracks (public)
router.get('/similar/:trackId', getSimilarTracks);

export default router;