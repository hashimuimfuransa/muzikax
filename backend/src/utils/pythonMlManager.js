/**
 * Python ML Manager for Node.js
 * Manages the Python ML recommendation process from within the Node.js application
 */

const { spawn, exec } = require('child_process');
const path = require('path');
const fs = require('fs');

class PythonMlManager {
  constructor() {
    this.pythonProcess = null;
    this.isRunning = false;
    this.port = 5001; // Default port for ML API
    this.backendDir = path.join(__dirname, '..', '..'); // Go up to backend root
    this.mlApiPath = path.join(this.backendDir, 'ml_recommendation_api_enhanced.py');
    this.processLogFile = path.join(this.backendDir, 'logs', 'ml_process.log');
    
    // Ensure logs directory exists
    const logsDir = path.join(this.backendDir, 'logs');
    if (!fs.existsSync(logsDir)) {
      fs.mkdirSync(logsDir, { recursive: true });
    }
  }

  /**
   * Start the Python ML API process
   */
  startPythonMlProcess() {
    return new Promise((resolve, reject) => {
      if (this.isRunning) {
        console.log('Python ML process is already running');
        resolve(true);
        return;
      }

      console.log('Starting Python ML recommendation process...');
      
      // Check if the ML API file exists
      if (!fs.existsSync(this.mlApiPath)) {
        reject(new Error(`ML API file not found: ${this.mlApiPath}`));
        return;
      }

      // Spawn the Python process
      this.pythonProcess = spawn('python', [this.mlApiPath], {
        cwd: this.backendDir,
        stdio: ['pipe', 'pipe', 'pipe'],
        env: {
          ...process.env,
          PYTHONUNBUFFERED: 1
        }
      });

      // Handle process events
      this.pythonProcess.on('spawn', () => {
        console.log('Python ML process spawned successfully');
        this.isRunning = true;
      });

      this.pythonProcess.on('error', (err) => {
        console.error('Error starting Python ML process:', err);
        this.isRunning = false;
        reject(err);
      });

      this.pythonProcess.on('close', (code) => {
        console.log(`Python ML process closed with code ${code}`);
        this.isRunning = false;
        this.pythonProcess = null;
      });

      // Log output from Python process
      this.pythonProcess.stdout.on('data', (data) => {
        const logMessage = `[PYTHON-ML-STDOUT] ${data.toString()}`;
        console.log(logMessage.trim());
        
        // Write to log file
        this.writeToLog(logMessage);
      });

      this.pythonProcess.stderr.on('data', (data) => {
        const logMessage = `[PYTHON-ML-STDERR] ${data.toString()}`;
        console.error(logMessage.trim());
        
        // Write to log file
        this.writeToLog(logMessage);
      });

      // Wait a bit to ensure the server starts properly
      // Poll the health endpoint to confirm the server is running
      const checkInterval = setInterval(async () => {
        try {
          const response = await fetch(`http://localhost:${this.port}/health`);
          if (response.ok) {
            clearInterval(checkInterval);
            console.log(`Python ML API started successfully on port ${this.port}`);
            resolve(true);
          }
        } catch (error) {
          // Server not ready yet, continue waiting
        }
      }, 1000); // Check every second
      
      // Timeout after 15 seconds
      setTimeout(() => {
        clearInterval(checkInterval);
        if (this.isRunning) {
          console.log(`Python ML API likely started on port ${this.port}`);
          resolve(true);
        } else {
          reject(new Error('Python ML process failed to start properly within 15 seconds'));
        }
      }, 15000); // Wait up to 15 seconds for the server to start
    });
  }

  /**
   * Stop the Python ML process
   */
  stopPythonMlProcess() {
    return new Promise((resolve) => {
      if (!this.isRunning || !this.pythonProcess) {
        console.log('Python ML process is not running');
        resolve(true);
        return;
      }

      console.log('Stopping Python ML process...');
      
      // Kill the process gracefully
      this.pythonProcess.kill('SIGTERM');
      
      // Wait for the process to close
      setTimeout(() => {
        this.isRunning = false;
        this.pythonProcess = null;
        console.log('Python ML process stopped');
        resolve(true);
      }, 2000);
    });
  }

  /**
   * Restart the Python ML process
   */
  async restartPythonMlProcess() {
    console.log('Restarting Python ML process...');
    
    await this.stopPythonMlProcess();
    return this.startPythonMlProcess();
  }

  /**
   * Check if the Python ML process is running
   */
  isPythonMlRunning() {
    return this.isRunning && this.pythonProcess !== null;
  }

  /**
   * Write log messages to file
   */
  writeToLog(message) {
    const timestamp = new Date().toISOString();
    const logEntry = `[${timestamp}] ${message}`;
    
    try {
      fs.appendFileSync(this.processLogFile, logEntry + '\n');
    } catch (err) {
      console.error('Error writing to log file:', err);
    }
  }

  /**
   * Get health status of the ML service
   */
  async getMlHealthStatus() {
    if (!this.isRunning) {
      return {
        status: 'offline',
        message: 'Python ML process is not running'
      };
    }

    try {
      // Test the health endpoint of the Python ML API
      const response = await fetch(`http://localhost:${this.port}/health`);
      if (response.ok) {
        const healthData = await response.json();
        return {
          status: 'online',
          ...healthData
        };
      } else {
        return {
          status: 'error',
          message: `Health check failed with status: ${response.status}`
        };
      }
    } catch (error) {
      return {
        status: 'error',
        message: `Health check failed: ${error.message}`
      };
    }
  }

  /**
   * Get performance stats from the ML service
   */
  async getMlPerformanceStats() {
    if (!this.isRunning) {
      return {
        error: 'Python ML process is not running'
      };
    }

    try {
      const response = await fetch(`http://localhost:${this.port}/api/ml-recommendations/performance-stats`);
      if (response.ok) {
        return await response.json();
      } else {
        return {
          error: `Failed to get performance stats: ${response.status}`
        };
      }
    } catch (error) {
      return {
        error: `Failed to get performance stats: ${error.message}`
      };
    }
  }
}

// Create a singleton instance
const pythonMlManager = new PythonMlManager();

module.exports = pythonMlManager;