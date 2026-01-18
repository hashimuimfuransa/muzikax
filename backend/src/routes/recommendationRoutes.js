"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const { 
  getPersonalizedRecommendations,
  getGeneralRecommendations,
  getSimilarTracks
} = require("../controllers/recommendationController");
const { protect } = require("../utils/jwt");
const { 
  getMlPersonalizedRecommendations,
  getMlGeneralRecommendations,
  getMlSimilarTracks,
  mlRecommendationHealthCheck
} = require("../controllers/mlRecommendationController");

const router = express.Router();

// ML-powered recommendation endpoints with fallback to traditional methods
// Personalized recommendations (requires authentication)
router.get('/ml-recommendations/personalized', protect, getMlPersonalizedRecommendations);

// General recommendations (public)
router.get('/ml-recommendations/general', getMlGeneralRecommendations);

// Similar tracks (public)
router.get('/ml-recommendations/similar/:trackId', getMlSimilarTracks);

// ML recommendation health check
router.get('/ml-recommendations/health', mlRecommendationHealthCheck);

// Traditional recommendations as fallback (maintaining backward compatibility)
// Personalized recommendations (requires authentication)
router.get('/personalized', protect, getPersonalizedRecommendations);

// General recommendations (public)
router.get('/general', getGeneralRecommendations);

// Similar tracks (public)
router.get('/similar/:trackId', getSimilarTracks);

module.exports = router;