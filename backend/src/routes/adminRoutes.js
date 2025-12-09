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
const adminController_1 = require("../controllers/adminController");
const jwt_1 = require("../utils/jwt");
console.log('Loading admin routes...');
const router = express.Router();
// Add detailed logging for route registration
console.log('Setting up admin middleware...');
router.use((_req, _res, next) => {
    console.log(`Admin route middleware triggered: ${_req.method} ${_req.originalUrl}`);
    next();
});
// All admin routes require authentication and admin role
console.log('Applying protect and admin middleware...');
router.use(jwt_1.protect, (req, res, next) => {
    console.log('Protect middleware passed');
    (0, jwt_1.admin)(req, res, next);
});
// Add logging for each route
console.log('Registering admin routes...');
// Get admin dashboard analytics
router.route('/analytics')
    .get((_req, res) => {
    console.log('GET /api/admin/analytics route hit');
    (0, adminController_1.getAdminAnalytics)(_req, res);
});
// Search users with filters
router.route('/users/search')
    .get((_req, res) => {
    console.log('GET /api/admin/users/search route hit');
    (0, adminController_1.searchUsers)(_req, res);
});
// Get platform statistics
router.route('/platform-stats')
    .get((_req, res) => {
    console.log('GET /api/admin/platform-stats route hit');
    (0, adminController_1.getPlatformStats)(_req, res);
});
// Get user statistics
router.route('/user-stats')
    .get((_req, res) => {
    console.log('GET /api/admin/user-stats route hit');
    (0, adminController_1.getUserStats)(_req, res);
});
// Get content statistics
router.route('/content-stats')
    .get((_req, res) => {
    console.log('GET /api/admin/content-stats route hit');
    (0, adminController_1.getContentStats)(_req, res);
});
// Get user by ID
router.route('/users/:id')
    .get((req, res) => {
    console.log(`GET /api/admin/users/${req.params.id} route hit`);
    (0, adminController_1.getUserById)(req, res);
})
    .put((req, res) => {
    console.log(`PUT /api/admin/users/${req.params.id} route hit`);
    (0, adminController_1.updateUserRole)(req, res);
})
    .delete((req, res) => {
    console.log(`DELETE /api/admin/users/${req.params.id} route hit`);
    (0, adminController_1.deleteUser)(req, res);
});
console.log('Admin routes registered successfully');
exports.default = router;
//# sourceMappingURL=adminRoutes.js.map