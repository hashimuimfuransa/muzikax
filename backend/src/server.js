"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });

const app_1 = __importDefault(require("./app"));
const connectDB = require('./config/db');
const pythonMlManager = require('./utils/pythonMlManager');

const startServer = async () => {
  try {
    await connectDB();
    
    // Start the Python ML recommendation process
    console.log('Starting Python ML recommendation process...');
    try {
      await pythonMlManager.startPythonMlProcess();
      console.log('Python ML recommendation process started successfully');
      
      // Wait a bit to ensure the Python ML API is fully ready
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Double-check the health of the Python ML service
      const healthStatus = await pythonMlManager.getMlHealthStatus();
      if (healthStatus.status === 'online') {
        console.log('Python ML API is healthy and ready');
      } else {
        console.warn('Python ML API may not be fully ready, but continuing with server startup...');
      }
    } catch (mlError) {
      console.error('Failed to start Python ML recommendation process:', mlError);
      console.log('Continuing with server startup...');
    }
    
    const PORT = process.env['PORT'] || 5000;
    
    app_1.default.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
      console.log(`Python ML API should be running on port 5001`);
    });
    
    // Handle graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\nReceived SIGINT, shutting down gracefully...');
      
      // Stop the Python ML process
      try {
        await pythonMlManager.stopPythonMlProcess();
        console.log('Python ML process stopped');
      } catch (error) {
        console.error('Error stopping Python ML process:', error);
      }
      
      process.exit(0);
    });
    
    process.on('SIGTERM', async () => {
      console.log('\nReceived SIGTERM, shutting down gracefully...');
      
      // Stop the Python ML process
      try {
        await pythonMlManager.stopPythonMlProcess();
        console.log('Python ML process stopped');
      } catch (error) {
        console.error('Error stopping Python ML process:', error);
      }
      
      process.exit(0);
    });
    
  } catch (error) {
    console.error('Failed to start server:', error);
    
    // Stop the Python ML process if server fails to start
    try {
      await pythonMlManager.stopPythonMlProcess();
    } catch (mlError) {
      console.error('Error stopping Python ML process during failure:', mlError);
    }
  }
};

startServer();
//# sourceMappingURL=server.js.map