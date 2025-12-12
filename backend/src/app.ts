import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import trackRoutes from './routes/trackRoutes';
import userRoutes from './routes/userRoutes';
import adminRoutes from './routes/adminRoutes';
import upgradeRoutes from './routes/upgradeRoutes';
import uploadRoutes from './routes/uploadRoutes';
import creatorRoutes from './routes/creatorRoutes';
import albumRoutes from './routes/albumRoutes';
import { protect } from './utils/jwt';
import { updateOwnProfile } from './controllers/profileController';
console.log('About to import public routes...');
import publicRoutes from './routes/publicRoutes';
console.log('Public routes imported successfully');

// Import the new feature routes
import favoriteRoutes from './routes/features/favoriteRoutes';
import playlistRoutes from './routes/features/playlistRoutes';
import recentlyPlayedRoutes from './routes/recentlyPlayedRoutes';

console.log('ROUTES IMPORTED');

console.log('APP FILE LOADED');

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

console.log('APP CREATED');

// Add request logging middleware
app.use((_req, _res, next) => {
  console.log(`APP MIDDLEWARE - Incoming request: ${_req.method} ${_req.originalUrl}`);
  console.log('Headers:', _req.headers);
  next();
});

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log routes registration
console.log('Registering routes...');

// Routes
app.use('/api/auth', authRoutes);
console.log('Auth routes registered');
app.use('/api/tracks', trackRoutes);
console.log('Tracks routes registered');
console.log('Registering user routes...');
app.use('/api/users', userRoutes);
console.log('Users routes registered');

// Register the new feature routes
app.use('/api/favorites', favoriteRoutes);
console.log('Favorites routes registered');
app.use('/api/playlists', playlistRoutes);
console.log('Playlists routes registered');
app.use('/api/recently-played', recentlyPlayedRoutes);
console.log('Recently played routes registered');

app.use('/api/upgrade', upgradeRoutes);
console.log('Upgrade routes registered');
app.use('/api/creator', creatorRoutes);
console.log('Creator routes registered');
// Register public routes - these are accessible to everyone
console.log('About to register public routes...');
console.log('Public routes object:', publicRoutes);
app.use('/api/public', publicRoutes);
console.log('Public routes registered');

// Add detailed logging for upload routes
console.log('Attempting to register upload routes...');
try {
  console.log('Upload routes object:', uploadRoutes);
  app.use('/api/upload', uploadRoutes);
  console.log('Upload routes registered successfully');
} catch (error) {
  console.error('Error registering upload routes:', error);
}

// Add detailed logging for admin routes
console.log('Attempting to register admin routes...');
try {
  app.use('/api/admin', adminRoutes);
  console.log('Admin routes registered successfully');
} catch (error) {
  console.error('Error registering admin routes:', error);
}

// Add detailed logging for album routes
console.log('Attempting to register album routes...');
try {
  console.log('Album routes object:', albumRoutes);
  app.use('/api/albums', albumRoutes);
  console.log('Album routes registered successfully');
} catch (error) {
  console.error('Error registering album routes:', error);
}

// Directly implement profile update route in app.ts to avoid 404 issues

// User route for updating own profile directly in app
app.put('/api/profile/me', protect, updateOwnProfile);

// Simple test route for tracks
app.get('/api/test-tracks', (_req, res) => {
  console.log('TEST TRACKS ROUTE HIT');
  res.json({ message: 'Test tracks route working' });
});

// Log all registered routes for debugging
console.log('Registered routes:');
if (app._router && app._router.stack) {
  app._router.stack.forEach((r: any) => {
    if (r.route && r.route.path) {
      console.log(`  ${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
    }
  });
}

// Health check
app.get('/health', (_req: express.Request, res: express.Response) => {
  console.log('HEALTH CHECK ROUTE HIT');
  res.status(200).json({ message: 'OK', timestamp: new Date().toISOString() });
});

// Simple test route
app.get('/test-direct', (_req, res) => {
  console.log('DIRECT TEST ROUTE HIT');
  res.json({ message: 'Direct test route working' });
});

// Error handler
app.use((err: any, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env['NODE_ENV'] === 'production' ? null : err.stack
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

export default app;