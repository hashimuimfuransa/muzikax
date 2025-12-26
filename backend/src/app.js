const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const geoip = require('geoip-lite');
const connectDB = require('./config/db');
const authRoutes = require('./routes/authRoutes');
const trackRoutes = require('./routes/trackRoutes');
const userRoutes = require('./routes/userRoutes');
const adminRoutes = require('./routes/adminRoutes');
const upgradeRoutes = require('./routes/upgradeRoutes');
const uploadRoutes = require('./routes/uploadRoutes');
const creatorRoutes = require('./routes/creatorRoutes');
const albumRoutes = require('./routes/albumRoutes');
const commentRoutes = require('./routes/commentRoutes'); // Add comment routes
const eventRoutes = require('./routes/eventRoutes'); // Add event routes
const { protect } = require('./utils/jwt');
const { updateOwnProfile } = require('./controllers/profileController');
console.log('About to import public routes...');
const publicRoutes = require('./routes/publicRoutes');
console.log('Public routes imported successfully');

// Import the new feature routes
const favoriteRoutes = require('./routes/features/favoriteRoutes');
const playlistRoutes = require('./routes/features/playlistRoutes');
const recentlyPlayedRoutes = require('./routes/recentlyPlayedRoutes');
const recommendationRoutes = require('./routes/recommendationRoutes');
const postRoutes = require('./routes/postRoutes');

// Import WhatsApp routes
const whatsappRoutes = require('./routes/whatsappRoutes');

// Import search routes
const searchRoutes = require('./routes/searchRoutes');
console.log('ROUTES IMPORTED');

console.log('APP FILE LOADED');

// Load env vars
dotenv.config();

// Update geoip-lite database
try {
  geoip.reloadDataSync();
  console.log('GeoIP database updated successfully');
} catch (error) {
  console.error('Failed to update GeoIP database:', error);
}

// Create app first without connecting to database immediately
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

// Enable CORS for specific origins
const allowedOrigins = process.env.CORS_ORIGIN ? 
  process.env.CORS_ORIGIN.split(',').map(origin => origin.trim()) : 
  [
    'https://muzikax.vercel.app',  // Production frontend
    'http://localhost:3000',       // Local development
    'http://localhost:3001',       // Alternative local development
    'http://localhost:8080',       // Alternative local development
    'https://localhost:3000',      // HTTPS local development
    'https://localhost:3001',      // HTTPS alternative local development
  ];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200
};
app.use(cors(corsOptions));

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

// Register post routes early to avoid conflicts
app.use('/api/posts', postRoutes);
console.log('Post routes registered');

// Register the new feature routes
app.use('/api/favorites', favoriteRoutes);
console.log('Favorites routes registered');
app.use('/api/playlists', playlistRoutes);
console.log('Playlists routes registered');
app.use('/api/recently-played', recentlyPlayedRoutes);
console.log('Recently played routes registered');
app.use('/api/recommendations', recommendationRoutes);
console.log('Recommendations routes registered');

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

// Register comment routes
console.log('Attempting to register comment routes...');
try {
  console.log('Comment routes object:', commentRoutes);
  app.use('/api/comments', commentRoutes);
  console.log('Comment routes registered successfully');
} catch (error) {
  console.error('Error registering comment routes:', error);
}

// Register event routes
console.log('Attempting to register event routes...');
try {
  console.log('Event routes object:', eventRoutes);
  app.use('/api/events', eventRoutes);
  console.log('Event routes registered successfully');
} catch (error) {
  console.error('Error registering event routes:', error);
}

// Register WhatsApp routes
console.log('Attempting to register WhatsApp routes...');
try {
  app.use('/api/whatsapp', whatsappRoutes);
  console.log('WhatsApp routes registered successfully');
} catch (error) {
  console.error('Error registering WhatsApp routes:', error);
}

// Register search routes
console.log('Attempting to register search routes...');
try {
  app.use('/api/search', searchRoutes);
  console.log('Search routes registered successfully');
} catch (error) {
  console.error('Error registering search routes:', error);
}

// Directly implement profile update route in app.js to avoid 404 issues
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
  app._router.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`  ${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
    }
  });
}

// Specifically log auth routes
console.log('Auth routes specifically:');
const authRouter = require('./routes/authRoutes');
if (authRouter && authRouter.stack) {
  authRouter.stack.forEach((r) => {
    if (r.route && r.route.path) {
      console.log(`  AUTH: ${Object.keys(r.route.methods).join(', ').toUpperCase()} ${r.route.path}`);
    }
  });
}

// Health check
app.get('/health', (_req, res) => {
  console.log('HEALTH CHECK ROUTE HIT');
  res.status(200).json({ message: 'OK', timestamp: new Date().toISOString() });
});

// Simple test route
app.get('/test-direct', (_req, res) => {
  console.log('DIRECT TEST ROUTE HIT');
  res.json({ message: 'Direct test route working' });
});

// Error handler
app.use((err, _req, res, _next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === 'production' ? null : err.stack
  });
});

// 404 handler for unmatched routes
app.use((req, res) => {
  console.log(`404 - Route not found: ${req.method} ${req.originalUrl}`);
  res.status(404).json({ message: 'Route not found' });
});

module.exports = app;