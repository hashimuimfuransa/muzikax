const express = require('express');
const { 
  requestToPay, 
  checkPaymentStatus, 
  getUserPayments, 
  getSellerEarnings,
  handleIPN
} = require('../controllers/paymentController');
const { protect, creator } = require('../utils/jwt');

const router = express.Router();

// Protected routes for buyers
router.use(protect);

// POST /api/payments/request - Initiate MTN MoMo payment
router.post('/request', requestToPay);

// GET /api/payments/status/:referenceId - Check payment status
router.get('/status/:referenceId', checkPaymentStatus);

// GET /api/payments/history - Get user's payment history
router.get('/history', getUserPayments);

// Protected routes for sellers (creators)
router.use('/earnings', creator);

// GET /api/payments/earnings - Get seller's earnings
router.get('/earnings', getSellerEarnings);

// POST /api/payments/ipn - Handle PesaPal IPN notifications (public endpoint)
router.get('/ipn', handleIPN);

module.exports = router;