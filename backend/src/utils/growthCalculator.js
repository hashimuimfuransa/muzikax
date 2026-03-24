/**
 * Calculate the velocity of plays (plays per day)
 * @param {Object} dailyStats - Daily statistics object
 * @returns {number} Velocity value
 */
function calculateVelocity(dailyStats) {
  if (!dailyStats || !dailyStats.plays) {
    return 0;
  }
  
  const days = dailyStats.days || 1;
  return dailyStats.plays / days;
}

/**
 * Calculate growth rate percentage
 * @param {Object} track - Track with current and historical data
 * @returns {number} Growth rate percentage
 */
function calculateGrowthRate(track) {
  // If we have historical chart score data
  if (track.previousScore && track.chartScore) {
    if (track.previousScore === 0) {
      return track.chartScore > 0 ? 100 : 0;
    }
    return ((track.chartScore - track.previousScore) / track.previousScore) * 100;
  }
  
  // Fallback: estimate based on recent activity
  const now = new Date();
  const createdAt = new Date(track.createdAt);
  const daysSinceCreation = (now - createdAt) / (1000 * 60 * 60 * 24);
  
  if (daysSinceCreation < 1) {
    // Very new track - high growth potential
    return Math.min(100, track.plays * 10);
  }
  
  const dailyAverage = track.plays / daysSinceCreation;
  const recentPerformance = track.plays / Math.max(1, daysSinceCreation * 0.5); // Last half period
  
  if (dailyAverage === 0) return 0;
  
  return ((recentPerformance - dailyAverage) / dailyAverage) * 100;
}

/**
 * Detect sudden spikes in popularity
 * @param {Array} historicalData - Array of daily stats
 * @returns {Object} Spike detection results
 */
function detectSpike(historicalData) {
  if (!historicalData || historicalData.length < 2) {
    return { hasSpike: false, spikeFactor: 0 };
  }
  
  // Sort by date
  const sorted = [...historicalData].sort((a, b) => 
    new Date(b.date) - new Date(a.date)
  );
  
  const latest = sorted[0];
  const previous = sorted[1];
  
  if (!previous || previous.plays === 0) {
    return { hasSpike: latest.plays > 10, spikeFactor: latest.plays > 10 ? 2 : 0 };
  }
  
  const growthFactor = latest.plays / previous.plays;
  const hasSpike = growthFactor > 2; // More than 2x growth
  
  return {
    hasSpike,
    spikeFactor: hasSpike ? growthFactor : 0,
    percentageIncrease: ((growthFactor - 1) * 100)
  };
}

/**
 * Calculate trending score boost for rapidly growing tracks
 * @param {Object} track - Track data
 * @param {number} daysOld - Age of track in days
 * @returns {number} Trending boost multiplier
 */
function calculateTrendingBoost(track, daysOld) {
  // Newer tracks get more boost
  let recencyMultiplier = 1.0;
  
  if (daysOld <= 1) {
    recencyMultiplier = 2.0; // Brand new (0-1 days)
  } else if (daysOld <= 3) {
    recencyMultiplier = 1.8; // Very recent (1-3 days)
  } else if (daysOld <= 7) {
    recencyMultiplier = 1.5; // Recent (3-7 days)
  } else if (daysOld <= 14) {
    recencyMultiplier = 1.2; // Somewhat recent (7-14 days)
  } else if (daysOld <= 30) {
    recencyMultiplier = 1.0; // Normal (14-30 days)
  } else {
    recencyMultiplier = 0.8; // Older tracks (30+ days)
  }
  
  // Combine with growth rate
  const growthRate = calculateGrowthRate(track);
  const growthMultiplier = 1 + (Math.min(growthRate, 100) / 100); // Cap at 2x
  
  return recencyMultiplier * growthMultiplier;
}

/**
 * Predict future chart position based on current trajectory
 * @param {Object} track - Current track data
 * @param {number} daysAhead - Days to predict
 * @returns {Object} Prediction results
 */
function predictChartPosition(track, daysAhead = 7) {
  const currentVelocity = calculateVelocity(track);
  const growthRate = calculateGrowthRate(track);
  
  // Simple linear projection
  const projectedPlays = track.plays + (currentVelocity * daysAhead);
  const projectedGrowth = growthRate > 0 
    ? track.plays * Math.pow(1 + growthRate / 100, daysAhead)
    : projectedPlays;
  
  const conservativeProjection = projectedPlays;
  const optimisticProjection = Math.max(projectedPlays, projectedGrowth);
  
  return {
    currentPlays: track.plays,
    projectedPlays: Math.round(conservativeProjection),
    optimisticProjection: Math.round(optimisticProjection),
    confidence: growthRate > 0 ? 'high' : growthRate < -20 ? 'low' : 'medium',
    trajectory: growthRate > 10 ? 'rising' : growthRate < -10 ? 'falling' : 'stable'
  };
}

module.exports = {
  calculateVelocity,
  calculateGrowthRate,
  detectSpike,
  calculateTrendingBoost,
  predictChartPosition
};
