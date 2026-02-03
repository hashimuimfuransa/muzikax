const express = require('express');
const router = express.Router();
const { 
  createChallenge,
  getChallenges,
  getChallengeById,
  participateInChallenge,
  voteInChallenge,
  getChallengeParticipants,
  getTrendingChallenges
} = require('../controllers/challengeController');
const { protect } = require('../utils/jwt');

// Create a new challenge (authenticated users only)
router.post('/', protect, createChallenge);

// Get all challenges (publicly accessible)
router.get('/', getChallenges);

// Get trending challenges (publicly accessible)
router.get('/trending', getTrendingChallenges);

// Get challenge by ID (publicly accessible)
router.get('/:id', getChallengeById);

// Participate in a challenge (authenticated users only)
router.post('/:id/participate', protect, participateInChallenge);

// Vote in a challenge (authenticated users only)
router.post('/:id/vote', protect, voteInChallenge);

// Get challenge participants (publicly accessible)
router.get('/:id/participants', getChallengeParticipants);

module.exports = router;