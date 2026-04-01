/**
 * Chart Data Freshness Validator
 * Validates that chart data is recent and not stale
 */

/**
 * Check if chart data is fresh enough
 * @param {Date} lastUpdated - Last update time of chart data
 * @param {string} timeWindow - 'daily', 'weekly', or 'monthly'
 * @returns {Object} Freshness status and age in minutes
 */
function validateChartFreshness(lastUpdated, timeWindow = 'weekly') {
  if (!lastUpdated) {
    return {
      isFresh: false,
      isStale: true,
      ageMinutes: Infinity,
      maxAgeMinutes: 0,
      warning: 'No lastUpdated timestamp available'
    };
  }

  const now = new Date();
  const ageMs = now - new Date(lastUpdated);
  const ageMinutes = Math.floor(ageMs / (1000 * 60));

  // Define maximum acceptable age based on time window
  const maxAgeByWindow = {
    daily: 30,      // 30 minutes for daily charts
    weekly: 15,     // 15 minutes for weekly charts
    monthly: 30     // 30 minutes for monthly charts
  };

  const maxAgeMinutes = maxAgeByWindow[timeWindow] || 15;
  const staleThreshold = maxAgeMinutes * 2; // Consider stale after 2x the max age

  return {
    isFresh: ageMinutes <= maxAgeMinutes,
    isStale: ageMinutes > staleThreshold,
    ageMinutes,
    maxAgeMinutes,
    stalenessRatio: ageMinutes / maxAgeMinutes,
    message: ageMinutes <= maxAgeMinutes 
      ? 'Data is fresh' 
      : `Data is ${ageMinutes} minutes old (max recommended: ${maxAgeMinutes} minutes)`
  };
}

/**
 * Validate multiple chart entries and return summary
 * @param {Array} charts - Array of chart objects with lastUpdated field
 * @param {string} timeWindow - Time window type
 * @returns {Object} Validation summary
 */
function validateChartsBulk(charts, timeWindow = 'weekly') {
  if (!charts || charts.length === 0) {
    return {
      totalCharts: 0,
      freshCharts: 0,
      staleCharts: 0,
      averageAgeMinutes: 0,
      oldestChart: null,
      newestChart: null,
      overallStatus: 'empty'
    };
  }

  const validations = charts.map(chart => validateChartFreshness(chart.lastUpdated, timeWindow));
  
  const freshCharts = validations.filter(v => v.isFresh).length;
  const staleCharts = validations.filter(v => v.isStale).length;
  const totalAge = validations.reduce((sum, v) => sum + (v.ageMinutes === Infinity ? 0 : v.ageMinutes), 0);
  const avgAge = Math.round(totalAge / validations.length);

  const ages = validations.map(v => v.ageMinutes === Infinity ? 0 : v.ageMinutes);
  const oldestChart = charts[ages.indexOf(Math.max(...ages))];
  const newestChart = charts[ages.indexOf(Math.min(...ages))];

  let overallStatus = 'healthy';
  if (staleCharts > charts.length * 0.5) {
    overallStatus = 'critical';
  } else if (freshCharts < charts.length * 0.8) {
    overallStatus = 'warning';
  }

  return {
    totalCharts: charts.length,
    freshCharts,
    staleCharts,
    averageAgeMinutes: avgAge,
    oldestChart: oldestChart?.lastUpdated,
    newestChart: newestChart?.lastUpdated,
    overallStatus,
    recommendations: getRecommendations(overallStatus, staleCharts, charts.length)
  };
}

/**
 * Get recommendations based on validation results
 */
function getRecommendations(status, staleCount, totalCount) {
  const recommendations = [];

  if (status === 'critical') {
    recommendations.push('URGENT: More than 50% of charts are stale. Trigger manual recalculation.');
    recommendations.push('Check if chart aggregator job is running properly.');
  } else if (status === 'warning') {
    recommendations.push('Consider reducing aggregation interval from current setting.');
    recommendations.push(`Review ${staleCount}/${totalCount} stale charts for potential issues.`);
  }

  if (staleCount > 0) {
    recommendations.push('Verify MongoDB indexes are properly created for performance.');
    recommendations.push('Check Redis cache TTL settings - may need to reduce further.');
  }

  return recommendations;
}

module.exports = {
  validateChartFreshness,
  validateChartsBulk
};
