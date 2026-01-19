const express = require('express');
const router = express.Router();
const { createReport, getReports, getReport, updateReportStatus } = require('../controllers/reportController');
const { protect, admin } = require('../utils/jwt');

// Public route for creating reports
router.post('/', protect, createReport);

// Admin routes for managing reports
router.get('/', protect, admin, getReports);
router.get('/:id', protect, admin, getReport);
router.put('/:id', protect, admin, updateReportStatus);

module.exports = router;