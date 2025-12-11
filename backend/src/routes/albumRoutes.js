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
const albumController_1 = require("../controllers/albumController");
const jwt_1 = require("../utils/jwt");
const router = express.Router();
// Public routes
router.route('/').get(albumController_1.getAllAlbums);
router.route('/:id').get(albumController_1.getAlbumById);
router.route('/creator/:creatorId').get(albumController_1.getAlbumsByCreator);
// Protected routes - only creators can create/update/delete albums
router.route('/').post(jwt_1.protect, jwt_1.creator, albumController_1.createAlbum);
router.route('/:id')
    .put(jwt_1.protect, albumController_1.updateAlbum)
    .delete(jwt_1.protect, albumController_1.deleteAlbum);
router.route('/:id/play').put(albumController_1.incrementAlbumPlayCount);
exports.default = router;
//# sourceMappingURL=albumRoutes.js.map