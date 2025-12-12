"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const { 
  getPersonalizedRecommendations,
  getGeneralRecommendations,
  getSimilarTracks
} = require("../controllers/recommendationController");
const { protect } = require("../utils/jwt");

const router = express.Router();

// Personalized recommendations (requires authentication)
router.get('/personalized', protect, getPersonalizedRecommendations);

// General recommendations (public)
router.get('/general', getGeneralRecommendations);

// Similar tracks (public)
router.get('/similar/:trackId', getSimilarTracks);

module.exports = router;