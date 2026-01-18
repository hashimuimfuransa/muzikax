/**
 * Middleware to handle Python ML API requests
 * Routes ML recommendation requests to the Python ML process
 */

const pythonMlManager = require('../utils/pythonMlManager');

const pythonMlMiddleware = async (req, res, next) => {
  // Check if the Python ML process is running
  if (!pythonMlManager.isPythonMlRunning()) {
    console.warn('Python ML process is not running, using fallback recommendations');
    req.pythonMlAvailable = false;
    return next();
  }

  // Health check the ML service
  try {
    const healthStatus = await pythonMlManager.getMlHealthStatus();
    if (healthStatus.status !== 'online') {
      console.warn('Python ML service is not healthy, using fallback recommendations');
      req.pythonMlAvailable = false;
      return next();
    }
  } catch (error) {
    console.warn('Error checking Python ML service health, using fallback recommendations:', error.message);
    req.pythonMlAvailable = false;
    return next();
  }

  // Python ML is available
  req.pythonMlAvailable = true;
  next();
};

/**
 * Forward ML recommendation requests to Python ML API
 */
const forwardToPythonMl = async (req, res, next) => {
  // Check if Python ML is available, and if not, try to start it
  if (!req.pythonMlAvailable) {
    try {
      // Attempt to start the Python ML process
      await pythonMlManager.startPythonMlProcess();
      req.pythonMlAvailable = true;
      console.log('Started Python ML process on demand');
      
      // Wait a bit to ensure the service is ready
      await new Promise(resolve => setTimeout(resolve, 1000));
    } catch (startError) {
      console.error('Failed to start Python ML process:', startError.message);
      // Pass control to next middleware (traditional recommendations)
      return next();
    }
  }

  try {
    // Give a brief moment for the service to become responsive
    await new Promise(resolve => setTimeout(resolve, 200));
    
    // Construct the target URL for the Python ML API
    const pythonMlUrl = `http://localhost:5001${req.url}`;
    
    // Prepare request options
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    };

    // Add body for POST/PUT requests
    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      options.body = JSON.stringify(req.body);
    }

    // Make request to Python ML API
    const mlResponse = await fetch(pythonMlUrl, options);
    
    if (!mlResponse.ok) {
      // If there's an error from Python ML API, pass control to next middleware
      console.warn(`Python ML API responded with status ${mlResponse.status}, using fallback`);
      return next();
    }

    // Get response data
    const responseData = await mlResponse.json();
    
    // Send the response back to the client
    res.status(mlResponse.status).json(responseData);
  } catch (error) {
    console.error('Error forwarding request to Python ML API:', error);
    // Pass control to next middleware (traditional recommendations)
    next();
  }
};

module.exports = {
  pythonMlMiddleware,
  forwardToPythonMl
};