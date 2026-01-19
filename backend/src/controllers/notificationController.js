const Notification = require('../models/Notification');
const User = require('../models/User');
const Track = require('../models/Track');

// Create a new notification
const createNotification = async (req, res) => {
  try {
    const { recipientId, title, message, type, data } = req.body;

    const notification = await Notification.create({
      recipientId,
      title,
      message,
      type,
      data
    });

    res.status(201).json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Get notifications for a user
const getUserNotifications = async (req, res) => {
  try {
    const userId = req.user._id;

    const notifications = await Notification.find({ recipientId: userId })
      .sort({ createdAt: -1 })
      .populate('recipientId', 'name email');

    res.json(notifications);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark notification as read
const markAsRead = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;

    const notification = await Notification.findOneAndUpdate(
      { _id: notificationId, recipientId: userId },
      { read: true },
      { new: true }
    ).exec();

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json(notification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mark all notifications as read for a user
const markAllAsRead = async (req, res) => {
  try {
    const userId = req.user._id;

    await Notification.updateMany(
      { recipientId: userId, read: false },
      { read: true }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Delete a notification
const deleteNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const userId = req.user._id;

    const notification = await Notification.findOneAndDelete({
      _id: notificationId,
      recipientId: userId
    }).exec();

    if (!notification) {
      res.status(404).json({ message: 'Notification not found' });
      return;
    }

    res.json({ message: 'Notification deleted' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Create a notification when a track is deleted
const createTrackDeletionNotification = async (
  trackId, 
  creatorId, 
  adminId, 
  reason
) => {
  try {
    const track = await Track.findById(trackId).populate('creatorId', 'name');
    const admin = await User.findById(adminId).select('name');

    if (!track) {
      console.error('Track not found for notification');
      return;
    }

    if (!admin) {
      console.error('Admin not found for notification');
      return;
    }

    const notification = await Notification.create({
      recipientId: creatorId,
      title: 'Track Deleted',
      message: `Your track "${track.title}" has been deleted by an administrator. Reason: ${reason}`,
      type: 'track_deleted',
      data: {
        trackId: track._id,
        trackTitle: track.title,
        adminName: admin.name,
        reason: reason,
        deletedAt: new Date()
      }
    });

    console.log(`Notification created for creator ${creatorId} about track deletion`);
  } catch (error) {
    console.error('Error creating track deletion notification:', error);
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  createTrackDeletionNotification
};