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
const trackController_1 = require("../controllers/trackController");
const jwt_1 = require("../utils/jwt");
const router = express.Router();
// Public routes
router.route('/').get(trackController_1.getAllTracks);
router.route('/trending').get(trackController_1.getTrendingTracks);
router.route('/:id').get(trackController_1.getTrackById);
router.route('/creator/:creatorId').get(trackController_1.getTracksByCreator);
// Protected routes
router.route('/upload').post(jwt_1.protect, jwt_1.creator, trackController_1.uploadTrack);
router.route('/:id/play').put(trackController_1.incrementPlayCount);
router.route('/:id')
    .put(jwt_1.protect, trackController_1.updateTrack)
    .delete(jwt_1.protect, trackController_1.deleteTrack);
exports.default = router;
//# sourceMappingURL=trackRoutes.js.map