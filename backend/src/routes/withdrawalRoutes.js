const express = require('express');
const {
  requestWithdrawal,
  getArtistEarnings,
  getAllWithdrawals,
  approveWithdrawal,
  rejectWithdrawal,
  markWithdrawalAsPaid,
  getEarningsDashboard
} = require('../controllers/withdrawalController');
const { protect, admin } = require('../utils/jwt');

const router = express.Router();

// Artist routes (protected)
router.use(protect);

// POST /api/withdrawals/request - Artist requests a withdrawal
router.post('/request', requestWithdrawal);

// GET /api/withdrawals/earnings - Artist views their earnings
router.get('/earnings', getArtistEarnings);

// Admin routes
router.use(admin);

// GET /api/withdrawals/dashboard/earnings - Admin earnings dashboard (must come before /:withdrawalId)
router.get('/dashboard/earnings', getEarningsDashboard);

// GET /api/withdrawals - Get all withdrawal requests (admin only)
router.get('/', getAllWithdrawals);

// POST /api/withdrawals/:withdrawalId/approve - Approve withdrawal (admin)
router.post('/:withdrawalId/approve', approveWithdrawal);

// POST /api/withdrawals/:withdrawalId/reject - Reject withdrawal (admin)
router.post('/:withdrawalId/reject', rejectWithdrawal);

// POST /api/withdrawals/:withdrawalId/mark-paid - Mark as paid (admin)
router.post('/:withdrawalId/mark-paid', markWithdrawalAsPaid);

module.exports = router;
