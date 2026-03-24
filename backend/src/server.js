const app = require('./app');
const { initChartAggregator } = require('./jobs/chartAggregator');
const redisCache = require('./utils/redisCache');
const connectDB = require('./config/db'); // Import DB connection
const { Server } = require('socket.io');
const http = require('http');

const PORT = process.env.PORT || 5000;

// Create HTTP server with Socket.IO
const httpServer = http.createServer(app);
const io = new Server(httpServer, {
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Store io instance for use in other modules
app.io = io;

// Real-time chart updates
io.on('connection', (socket) => {
  console.log('🔌 Client connected:', socket.id);
  
  socket.on('join-charts', (room) => {
    socket.join(`charts:${room}`);
    console.log(`Client ${socket.id} joined charts:${room}`);
  });
  
  socket.on('disconnect', () => {
    console.log('🔌 Client disconnected:', socket.id);
  });
});

// Broadcast chart updates - moved to separate module to avoid circular dependency
const broadcastChartUpdate = (chartType, data) => {
  if (io) {
    io.to(`charts:${chartType}`).emit('chart-updated', {
      type: chartType,
      data,
      timestamp: new Date()
    });
  }
};

// Export for use in other modules
module.exports = { httpServer, io, broadcastChartUpdate };

httpServer.listen(PORT, async () => {
  console.log(`✅ Server running on port ${PORT}`);
  
  // Connect to MongoDB first
  try {
    await connectDB();
    console.log('✅ MongoDB connected successfully');
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
  }
  
  // Wait a bit to ensure MongoDB is fully ready
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  // Initialize Redis cache (non-blocking)
  redisCache.connect().catch(err => {
    console.log('📝 Running without Redis cache - all data will be fetched from database');
  });
  
  // Initialize chart aggregation cron jobs (delayed to ensure DB is connected)
  setTimeout(() => {
    initChartAggregator();
    console.log('✅ Chart aggregator initialized');
  }, 10000);  // Increased to 10 seconds to ensure MongoDB is fully ready
  
  // Log WebSocket status
  console.log('📡 WebSocket server ready for real-time updates');
});
