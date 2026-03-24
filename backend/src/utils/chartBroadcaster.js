// Lazy load server to avoid circular dependency
let io = null;
const getIo = () => {
  if (!io) {
    const server = require('../server');
    io = server.io;
  }
  return io;
};

/**
 * Broadcast chart updates to connected clients
 * @param {string} chartType - Type of chart (daily, weekly, monthly, trending)
 * @param {any} data - Chart data to broadcast
 */
const broadcastChartUpdate = (chartType, data) => {
  const io = getIo();
  
  if (io) {
    io.to(`charts:${chartType}`).emit('chart-updated', {
      type: chartType,
      data,
      timestamp: new Date()
    });
    console.log(`📡 Broadcasted ${chartType} chart update to ${`charts:${chartType}`} room`);
  } else {
    console.warn('⚠️ Socket.IO instance not available, cannot broadcast chart update');
  }
};

module.exports = { broadcastChartUpdate };
