import * as express from 'express';
import { createPlaylist, addTrackToPlaylist, getPlaylists } from '../../controllers/userController';
import { protect } from '../../utils/jwt';

console.log('PLAYLIST ROUTES FILE LOADED');

const router = express.Router();

console.log('SETTING UP PLAYLIST ROUTES');

// Add logging to see which routes are being hit
router.use((req, _res, next) => {
  console.log(`Playlist routes middleware triggered: ${req.method} ${req.originalUrl}`);
  next();
});

// User routes for playlists - accessible to authenticated users
router.route('/')
  .post(protect, createPlaylist)
  .get(protect, getPlaylists);

router.route('/add-track')
  .post(protect, addTrackToPlaylist);

export default router;