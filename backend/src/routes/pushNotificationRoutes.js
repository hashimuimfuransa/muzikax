const express = require('express');
const {
  subscribeToPush,
  unsubscribeFromPush,
  getUserSubscriptions,
  sendPushNotification
} = require('../controllers/pushNotificationController');
const { protect } = require('../utils/jwt');

const router = express.Router();

// All routes require authentication
router.use(protect);

// Subscribe to push notifications
router.post('/subscribe', subscribeToPush);

// Unsubscribe from push notifications
router.post('/unsubscribe', unsubscribeFromPush);

// Get user's active subscriptions
router.get('/subscriptions', getUserSubscriptions);

module.exports = router;