"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express = require("express");
const userController_1 = require("../controllers/userController");
const jwt_1 = require("../utils/jwt");

const router = express.Router();

// Get followed creators for authenticated user
router.route('/')
    .get(jwt_1.protect, userController_1.getFollowedCreators);

// Check if user is following a specific creator
router.route('/status/:id')
    .get(jwt_1.protect, userController_1.checkFollowStatus);

// Follow a creator
router.route('/follow/:id')
    .post(jwt_1.protect, userController_1.followCreator);

// Unfollow a creator
router.route('/unfollow/:id')
    .delete(jwt_1.protect, userController_1.unfollowCreator);

module.exports = router;