import * as express from 'express';
import { addFavorite, removeFavorite, getFavorites } from '../../controllers/favoritePlaylistController';
import { protect } from '../../utils/jwt';

console.log('FAVORITE ROUTES FILE LOADED');

const router = express.Router();

console.log('SETTING UP FAVORITE ROUTES');

// Add logging to see which routes are being hit
router.use((req, _res, next) => {
  console.log(`Favorite routes middleware triggered: ${req.method} ${req.originalUrl}`);
  next();
});

// User routes for favorites - accessible to authenticated users
router.route('/')
  .post(protect, addFavorite)
  .delete(protect, removeFavorite)
  .get(protect, getFavorites);

export default router;