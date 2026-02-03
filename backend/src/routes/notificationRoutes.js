const express = require('express');
const {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createAdminNotification,
  getAdminNotifications,
  replyToNotification
} = require('../controllers/notificationController');
const { protect, admin, creator } = require('../utils/jwt');

const router = express.Router();

// User notification routes (protected for logged-in users)
router.use(protect);

// Get user's notifications
router.get('/', getUserNotifications);

// Get unread notification count
router.get('/unread-count', getUnreadCount);

// Mark a notification as read
router.put('/:id/read', markAsRead);

// Mark all notifications as read
router.put('/mark-all-read', markAllAsRead);

// Delete a notification
router.delete('/:id', deleteNotification);

// Creator can reply to admin notifications
router.post('/:id/reply', creator, replyToNotification);

// Admin routes (protected for admin users)
router.use(protect, admin);

// Admin creates notification for specific user or all creators
router.post('/send', createAdminNotification);

// Admin gets all notifications sent by admins
router.get('/sent', getAdminNotifications);

module.exports = router;