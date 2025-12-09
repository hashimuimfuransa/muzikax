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

// Load env vars
dotenv.config();

// Connect to database
connectDB();

const app = express();

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
app.use('/api/users', userRoutes);
console.log('Users routes registered');

// Add detailed logging for admin routes
console.log('Attempting to register admin routes...');
try {
  app.use('/api/admin', adminRoutes);
  console.log('Admin routes registered successfully');
} catch (error) {
  console.error('Error registering admin routes:', error);
}

// Health check
app.get('/health', (_req: express.Request, res: express.Response) => {
  res.status(200).json({ message: 'OK', timestamp: new Date().toISOString() });
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