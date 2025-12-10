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
const publicController_1 = require("../controllers/publicController");
console.log('PUBLIC ROUTES FILE LOADED');
const router = express.Router();
console.log('SETTING UP PUBLIC ROUTES');
// Add logging to see which routes are being hit
router.use((_req, _res, next) => {
    console.log(`PUBLIC ROUTES MIDDLEWARE TRIGGERED: ${_req.method} ${_req.originalUrl}`);
    next();
});
// Health check for public routes
router.get('/health', (_req, res) => {
    console.log('PUBLIC HEALTH CHECK ROUTE HIT');
    res.json({ message: 'Public routes are working' });
});
// Public endpoints for creators - no authentication required
router.get('/creators', (req, res, next) => {
    console.log('Public creators route hit, no auth required');
    (0, publicController_1.getPublicCreators)(req, res).catch(next);
});
router.get('/creators/:id', (req, res, next) => {
    console.log('Public creator profile route hit, no auth required');
    (0, publicController_1.getPublicCreatorProfile)(req, res).catch(next);
});
exports.default = router;
//# sourceMappingURL=publicRoutes.js.map