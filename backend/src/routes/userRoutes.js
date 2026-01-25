"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
const express = __importStar(require("express"));
const userController_1 = require("../controllers/userController");
const jwt_1 = require("../utils/jwt");
console.log('USER ROUTES FILE LOADED');
const router = express.Router();
console.log('SETTING UP USER ROUTES');
// Add logging to see which routes are being hit
router.use((_req, _res, next) => {
    console.log(`User routes middleware triggered: ${_req.method} ${_req.originalUrl}`);
    next();
});
// Test route
router.get('/test', (req, res) => {
    console.log('TEST ROUTE HIT - DIRECT LOG');
    console.log('Request headers:', req.headers);
    res.json({ message: 'User routes are working' });
});
// Simple test route without authentication
router.get('/simple-test', (_req, res) => {
    console.log('SIMPLE TEST ROUTE HIT');
    res.json({ message: 'Simple test route working' });
});
// Public routes for creators - explicitly without authentication
router.get('/public-creators', (req, res, next) => {
    console.log('Public creators route hit, no auth required');
    (0, userController_1.getPublicCreators)(req, res).catch(next);
});
// Admin routes
router.route('/')
    .get(jwt_1.protect, jwt_1.admin, userController_1.getUsers);
router.route('/:id')
    .get(jwt_1.protect, jwt_1.admin, userController_1.getUserById)
    .put(jwt_1.protect, jwt_1.admin, userController_1.updateUser)
    .delete(jwt_1.protect, jwt_1.admin, userController_1.deleteUser);
router.route('/:id/approve')
    .put(jwt_1.protect, jwt_1.admin, userController_1.approveCreator);
// Creator routes
router.route('/analytics')
    .get(jwt_1.protect, jwt_1.creator, userController_1.getCreatorAnalytics);
// User route for upgrading to creator
router.route('/upgrade-to-creator')
    .put((req, res, next) => {
    console.log('Upgrade to creator route hit');
    console.log('Request headers:', req.headers);
    // Check if authorization header exists
    if (!req.headers.authorization) {
        console.log('No authorization header found');
        return res.status(401).json({ message: 'Authorization header missing' });
    }
    (0, jwt_1.protect)(req, res, (err) => {
        if (err) {
            console.log('Protect middleware error:', err);
            return next(err);
        }
        console.log('Protect middleware passed, calling upgradeToCreator');
        console.log('User in request:', req.user);
        (0, userController_1.upgradeToCreator)(req, res);
        // Return undefined to satisfy TypeScript
        return undefined;
    });
    // Return undefined to satisfy TypeScript
    return undefined;
}); // Users can upgrade themselves
// User route for updating own profile
router.route('/me')
    .put(jwt_1.protect, userController_1.updateOwnProfile);

// User route for following a creator
router.route('/follow/:id')
    .post(jwt_1.protect, userController_1.followCreator);

// User route for unfollowing a creator
router.route('/unfollow/:id')
    .delete(jwt_1.protect, userController_1.unfollowCreator);

// Route to get all users except current user
router.get('/all', jwt_1.protect, userController_1.getAllUsers);

module.exports = router;
//# sourceMappingURL=userRoutes.js.map