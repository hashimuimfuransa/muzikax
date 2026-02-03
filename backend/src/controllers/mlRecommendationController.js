/**
 * ML Recommendation Controller
 * Handles requests to the ML recommendation endpoints with fallback to traditional methods
 */

const pythonMlManager = require('../utils/pythonMlManager');
const { 
  getPersonalizedRecommendations,
  getGeneralRecommendations,
  getSimilarTracks
} = require('./recommendationController');

/**
 * Proxy request to Python ML API with fallback to traditional recommendations
 */
const proxyToPythonMl = async (req, res, traditionalHandler) => {
  try {
    // Check if Python ML is available
    if (!pythonMlManager.isPythonMlRunning()) {
      console.log('Python ML process not running, starting it...');
      try {
        await pythonMlManager.startPythonMlProcess();
        // Give it a moment to become responsive
        await new Promise(resolve => setTimeout(resolve, 2000));
      } catch (startError) {
        console.error('Failed to start Python ML process:', startError.message);
      }
    }

    // Try to communicate with Python ML API
    const pythonMlUrl = `http://localhost:5001${req.baseUrl}${req.url}`;
    
    const options = {
      method: req.method,
      headers: {
        'Content-Type': 'application/json',
        ...req.headers
      }
    };

    if (req.body && (req.method === 'POST' || req.method === 'PUT')) {
      options.body = JSON.stringify(req.body);
    }

    const mlResponse = await fetch(pythonMlUrl, options);
    
    if (mlResponse.ok) {
      const responseData = await mlResponse.json();
      return res.status(mlResponse.status).json(responseData);
    } else {
      console.log(`Python ML API responded with ${mlResponse.status}, falling back to traditional recommendations`);
      // Fall through to traditional method
    }
  } catch (error) {
    console.error('Error communicating with Python ML API:', error.message);
    // Fall through to traditional method
  }

  // Fallback to traditional recommendation method
  if (traditionalHandler) {
    // Create mock req object with original params and query
    const mockReq = {
      ...req,
      originalUrl: req.originalUrl.replace('/ml-recommendations', ''), // Remove ml-recommendations prefix
    };
    
    // Call the traditional handler
    return traditionalHandler(mockReq, res);
  }

  // If no traditional handler provided, return error
  res.status(500).json({
    error: 'Both Python ML and traditional recommendation services unavailable'
  });
};

/**
 * Get ML-powered personalized recommendations with fallback
 */
const getMlPersonalizedRecommendations = async (req, res) => {
  // Extract the original endpoint path (e.g., if url is /ml-recommendations/personalized?param=value, 
  // we want to call the personalized endpoint)
  await proxyToPythonMl(req, res, getPersonalizedRecommendations);
};

/**
 * Get ML-powered general recommendations with fallback
 */
const getMlGeneralRecommendations = async (req, res) => {
  await proxyToPythonMl(req, res, getGeneralRecommendations);
};

/**
 * Get ML-powered similar tracks with fallback
 */
const getMlSimilarTracks = async (req, res) => {
  // For similar tracks, we need to handle the dynamic route
  await proxyToPythonMl(req, res, (mockReq, mockRes) => {
    // Extract trackId from the original URL
    const trackId = req.url.match(/\/ml-recommendations\/similar\/([^?]+)/)?.[1];
    if (trackId) {
      // Create a new request object with the trackId
      const adjustedReq = {
        ...mockReq,
        params: { trackId },
        originalUrl: mockReq.originalUrl.replace('/ml-recommendations', '')
      };
      return getSimilarTracks(adjustedReq, mockRes);
    } else {
      return getSimilarTracks(mockReq, mockRes);
    }
  });
};

/**
 * Health check for the ML recommendation system
 */
const mlRecommendationHealthCheck = async (req, res) => {
  try {
    const healthStatus = await pythonMlManager.getMlHealthStatus();
    const pythonMlRunning = pythonMlManager.isPythonMlRunning();
    
    res.json({
      status: 'ok',
      pythonMlRunning,
      pythonMlHealth: healthStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
};

module.exports = {
  getMlPersonalizedRecommendations,
  getMlGeneralRecommendations,
  getMlSimilarTracks,
  mlRecommendationHealthCheck
};