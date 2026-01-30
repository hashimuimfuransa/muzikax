"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var express = require("express");
var profileController_1 = require("../controllers/profileController");
var jwt_1 = require("../utils/jwt");
console.log('PROFILE ROUTES FILE LOADED');
var router = express.Router();
console.log('SETTING UP PROFILE ROUTES');
// User route for updating own profile
router.route('/me')
    .put(jwt_1.protect, profileController_1.updateOwnProfile);
module.exports = router;