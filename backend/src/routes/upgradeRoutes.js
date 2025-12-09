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
const upgradeController_1 = require("../controllers/upgradeController");
const jwt_1 = require("../utils/jwt");
console.log('UPGRADE ROUTES FILE LOADED');
const router = express.Router();
console.log('SETTING UP UPGRADE ROUTES');
// Add logging to see which routes are being hit
router.use((_req, _res, next) => {
    console.log(`Upgrade routes middleware triggered: ${_req.method} ${_req.originalUrl}`);
    next();
});
// Simple test route without authentication
router.get('/test', (_req, res) => {
    console.log('UPGRADE TEST ROUTE HIT');
    res.json({ message: 'Upgrade routes are working' });
});
// User route for upgrading to creator (no admin required)
router.route('/to-creator')
    .put((req, res, next) => {
    console.log('Upgrade to creator route hit in upgradeRoutes');
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
        (0, upgradeController_1.upgradeToCreator)(req, res);
        // Return undefined to satisfy TypeScript
        return undefined;
    });
    // Return undefined to satisfy TypeScript
    return undefined;
}); // Users can upgrade themselves
exports.default = router;
//# sourceMappingURL=upgradeRoutes.js.map