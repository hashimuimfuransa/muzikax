const geoip = require('geoip-lite');

// Configuration for fraud detection rules
const FRAUD_CONFIG = {
  // Max plays per IP per track per day
  maxPlaysPerIpPerDay: 5,
  
  // Max plays per hour from same subnet
  maxPlaysPerSubnetPerHour: 100,
  
  // Minimum play duration to count (seconds)
  minPlayDuration: 30,
  
  // Suspicious user agent patterns
  suspiciousUserAgents: [
    'bot',
    'crawler',
    'spider',
    'scraper',
    'curl',
    'wget',
    'python-requests'
  ],
  
  // Rate limiting windows (ms)
  rateLimitWindows: {
    minute: 60 * 1000,
    hour: 60 * 60 * 1000,
    day: 24 * 60 * 60 * 1000
  }
};

// In-memory cache for rate limiting (use Redis in production)
const rateLimitCache = new Map();

/**
 * Check if a user agent is suspicious (bot-like)
 * @param {string} userAgent - User agent string
 * @returns {boolean} True if suspicious
 */
function isSuspiciousUserAgent(userAgent) {
  if (!userAgent) return true; // No user agent is suspicious
  
  const lowerUA = userAgent.toLowerCase();
  return FRAUD_CONFIG.suspiciousUserAgents.some(pattern => 
    lowerUA.includes(pattern)
  );
}

/**
 * Get subnet from IP address (first two octets for /16 subnet)
 * @param {string} ipAddress - IP address
 * @returns {string} Subnet identifier
 */
function getSubnetFromIP(ipAddress) {
  const parts = ipAddress.split('.');
  if (parts.length === 4) {
    return `${parts[0]}.${parts[1]}.0.0/16`;
  }
  return ipAddress; // IPv6 or invalid
}

/**
 * Rate limit check for IP address
 * @param {string} ipAddress - IP to check
 * @param {string} trackId - Track being played
 * @param {string} window - Time window ('minute', 'hour', 'day')
 * @returns {Object} Rate limit status
 */
function checkRateLimit(ipAddress, trackId, window = 'hour') {
  const cacheKey = `${window}:${ipAddress}:${trackId}`;
  const now = Date.now();
  const windowMs = FRAUD_CONFIG.rateLimitWindows[window];
  
  const cached = rateLimitCache.get(cacheKey);
  
  if (!cached || (now - cached.timestamp) > windowMs) {
    // Cache expired or doesn't exist
    rateLimitCache.set(cacheKey, {
      count: 1,
      timestamp: now
    });
    return { allowed: true, count: 1 };
  }
  
  cached.count += 1;
  const limit = window === 'minute' ? 10 : 
                window === 'hour' ? FRAUD_CONFIG.maxPlaysPerSubnetPerHour : 
                FRAUD_CONFIG.maxPlaysPerIpPerDay;
  
  return {
    allowed: cached.count <= limit,
    count: cached.count,
    limit: limit
  };
}

/**
 * Validate play request for fraud
 * @param {Object} req - Express request object
 * @param {number} playDuration - Duration of play in seconds
 * @returns {Object} Validation result
 */
function validatePlay(req, playDuration = 0) {
  const ipAddress = req.ip || req.connection.remoteAddress || '';
  const cleanIP = ipAddress.replace('::ffff:', '');
  const userAgent = req.get('User-Agent');
  const userId = req.user?._id;
  
  const result = {
    isValid: true,
    isSuspicious: false,
    shouldCount: true,
    reason: '',
    ip: cleanIP,
    filtered: false
  };
  
  // Check 1: Bot detection
  if (isSuspiciousUserAgent(userAgent)) {
    result.isSuspicious = true;
    result.shouldCount = false;
    result.reason = 'Suspicious user agent';
    result.filtered = true;
    return result;
  }
  
  // Check 2: Minimum play duration
  if (playDuration > 0 && playDuration < FRAUD_CONFIG.minPlayDuration) {
    result.shouldCount = false;
    result.reason = `Play duration too short (${playDuration}s < ${FRAUD_CONFIG.minPlayDuration}s)`;
    return result;
  }
  
  // Check 3: Rate limiting per IP
  const minuteLimit = checkRateLimit(cleanIP, req.params.id, 'minute');
  if (!minuteLimit.allowed) {
    result.isSuspicious = true;
    result.shouldCount = false;
    result.reason = `Rate limit exceeded: ${minuteLimit.count}/${minuteLimit.limit} per minute`;
    result.filtered = true;
    return result;
  }
  
  // Check 4: Hourly rate limit
  const hourLimit = checkRateLimit(cleanIP, req.params.id, 'hour');
  if (!hourLimit.allowed) {
    result.isSuspicious = true;
    result.shouldCount = false;
    result.reason = `Rate limit exceeded: ${hourLimit.count}/${hourLimit.limit} per hour`;
    result.filtered = true;
    return result;
  }
  
  // Check 5: Geographic anomaly (optional - if user has history)
  // This would require user login and play history tracking
  
  return result;
}

/**
 * Analyze play patterns for suspicious activity
 * @param {Array} plays - Array of play records
 * @returns {Object} Analysis results
 */
function analyzePlayPatterns(plays) {
  const ipCounts = {};
  const subnetCounts = {};
  const timeDistribution = {};
  
  plays.forEach(play => {
    const ip = play.ipAddress || 'unknown';
    const subnet = getSubnetFromIP(ip);
    const hour = new Date(play.timestamp).getHours();
    
    // Count by IP
    ipCounts[ip] = (ipCounts[ip] || 0) + 1;
    
    // Count by subnet
    subnetCounts[subnet] = (subnetCounts[subnet] || 0) + 1;
    
    // Time distribution
    timeDistribution[hour] = (timeDistribution[hour] || 0) + 1;
  });
  
  // Detect anomalies
  const suspiciousIPs = Object.entries(ipCounts)
    .filter(([_, count]) => count > FRAUD_CONFIG.maxPlaysPerIpPerDay)
    .map(([ip, count]) => ({ ip, count }));
  
  const suspiciousSubnets = Object.entries(subnetCounts)
    .filter(([_, count]) => count > FRAUD_CONFIG.maxPlaysPerSubnetPerHour)
    .map(([subnet, count]) => ({ subnet, count }));
  
  // Check for unnatural time distribution (bots often play at regular intervals)
  const hoursWithActivity = Object.keys(timeDistribution).length;
  const avgPlaysPerHour = plays.length / Math.max(1, hoursWithActivity);
  const variance = Object.values(timeDistribution).reduce((acc, val) => {
    return acc + Math.pow(val - avgPlaysPerHour, 2);
  }, 0) / Math.max(1, hoursWithActivity);
  
  const isUnnaturalDistribution = variance > avgPlaysPerHour * 2;
  
  return {
    totalPlays: plays.length,
    uniqueIPs: Object.keys(ipCounts).length,
    suspiciousIPs,
    suspiciousSubnets,
    isUnnaturalDistribution,
    variance,
    fraudScore: calculateFraudScore(suspiciousIPs, suspiciousSubnets, isUnnaturalDistribution)
  };
}

/**
 * Calculate overall fraud score (0-100)
 * @param {Array} suspiciousIPs - List of suspicious IPs
 * @param {Array} suspiciousSubnets - List of suspicious subnets
 * @param {boolean} unnaturalDistribution - Whether time distribution is unnatural
 * @returns {number} Fraud score (higher = more suspicious)
 */
function calculateFraudScore(suspiciousIPs, suspiciousSubnets, unnaturalDistribution) {
  let score = 0;
  
  // Each suspicious IP adds points
  score += Math.min(suspiciousIPs.length * 10, 40);
  
  // Each suspicious subnet adds points
  score += Math.min(suspiciousSubnets.length * 15, 30);
  
  // Unnatural distribution adds points
  if (unnaturalDistribution) {
    score += 20;
  }
  
  return Math.min(score, 100);
}

/**
 * Filter out fraudulent plays from statistics
 * @param {Array} plays - Array of play records
 * @returns {Object} Filtered statistics
 */
function filterFraudulentPlays(plays) {
  const analysis = analyzePlayPatterns(plays);
  
  // Remove plays from suspicious IPs
  const suspiciousIPSet = new Set(analysis.suspiciousIPs.map(s => s.ip));
  const validPlays = plays.filter(play => !suspiciousIPSet.has(play.ipAddress));
  
  return {
    totalPlays: plays.length,
    validPlays: validPlays.length,
    filteredPlays: plays.length - validPlays.length,
    fraudPercentage: ((plays.length - validPlays.length) / plays.length) * 100,
    validPlaysData: validPlays,
    analysis
  };
}

/**
 * Clean up old rate limit cache entries
 */
function cleanupRateLimitCache() {
  const now = Date.now();
  const maxAge = FRAUD_CONFIG.rateLimitWindows.day;
  
  rateLimitCache.forEach((value, key) => {
    if ((now - value.timestamp) > maxAge) {
      rateLimitCache.delete(key);
    }
  });
}

// Run cleanup every hour
setInterval(cleanupRateLimitCache, FRAUD_CONFIG.rateLimitWindows.hour);

module.exports = {
  validatePlay,
  analyzePlayPatterns,
  filterFraudulentPlays,
  isSuspiciousUserAgent,
  checkRateLimit,
  getSubnetFromIP,
  FRAUD_CONFIG
};
