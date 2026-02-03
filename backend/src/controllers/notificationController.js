const Notification = require('../models/Notification');
const User = require('../models/User');
const Track = require('../models/Track');
const { sendPushNotification, sendTrackDeletionPush } = require('./pushNotificationController');

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
    const { page = 1, limit = 20, type } = req.query;

    let query = { recipientId: userId };
    if (type) {
      query.type = type;
    }

    const notifications = await Notification.find(query)
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('senderId', 'name email role');

    const total = await Notification.countDocuments(query);

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
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

// Get unread notification count
const getUnreadCount = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const count = await Notification.countDocuments({
      recipientId: userId,
      read: false
    });

    res.json({ count });
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
      senderId: adminId,
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

    // Send push notification
    const pushResult = await sendTrackDeletionPush(creatorId, track.title, reason);
    
    // Update notification with push status
    if (pushResult.success) {
      notification.pushSent = true;
      notification.pushDelivered = true;
      await notification.save();
    }

    console.log(`Notification created for creator ${creatorId} about track deletion. Push result:`, pushResult);
  } catch (error) {
    console.error('Error creating track deletion notification:', error);
  }
};

// Create notification for new track release
const createNewTrackNotification = async (trackId, creatorId, followerIds) => {
  try {
    const track = await Track.findById(trackId).populate('creatorId', 'name');
    
    if (!track) {
      console.error('Track not found for notification');
      return;
    }

    const creator = await User.findById(creatorId).select('name');
    
    if (!creator) {
      console.error('Creator not found for notification');
      return;
    }

    // Create notifications for all followers
    const notifications = await Promise.all(
      followerIds.map(async (followerId) => {
        const notification = await Notification.create({
          recipientId: followerId,
          senderId: creatorId,
          title: 'New Track Alert',
          message: `${creator.name} just released a new track: ${track.title}`,
          type: 'new_track',
          data: {
            trackId: track._id,
            trackTitle: track.title,
            creatorId: creatorId,
            creatorName: creator.name,
            releasedAt: new Date()
          }
        });

        // Send push notification
        const pushResult = await sendPushNotification(followerId, {
          title: 'New Track Alert',
          message: `${creator.name} just released a new track: ${track.title}`,
          type: 'new_track',
          data: {
            trackId: track._id,
            trackTitle: track.title,
            creatorId: creatorId,
            creatorName: creator.name
          }
        });

        // Update notification with push status
        if (pushResult.success) {
          notification.pushSent = true;
          notification.pushDelivered = true;
          await notification.save();
        }

        return notification;
      })
    );

    console.log(`Created ${notifications.length} new track notifications for followers of ${creator.name}`);
    return notifications;
  } catch (error) {
    console.error('Error creating new track notifications:', error);
  }
};

// Create playlist recommendation notification
const createPlaylistRecommendationNotification = async (userId, playlistData) => {
  try {
    const notification = await Notification.create({
      recipientId: userId,
      title: 'New Playlist Recommendation',
      message: `Check out "${playlistData.name}" with ${playlistData.trackCount} tracks just for you!`,
      type: 'playlist_recommendation',
      data: {
        playlistId: playlistData._id,
        playlistName: playlistData.name,
        trackCount: playlistData.trackCount,
        recommendedAt: new Date()
      }
    });

    // Send push notification
    const pushResult = await sendPushNotification(userId, {
      title: 'New Playlist Recommendation',
      message: `Check out "${playlistData.name}" with ${playlistData.trackCount} tracks just for you!`,
      type: 'playlist_recommendation',
      data: {
        playlistId: playlistData._id,
        playlistName: playlistData.name,
        trackCount: playlistData.trackCount
      }
    });

    // Update notification with push status
    if (pushResult.success) {
      notification.pushSent = true;
      notification.pushDelivered = true;
      await notification.save();
    }

    console.log(`Created playlist recommendation notification for user ${userId}`);
    return notification;
  } catch (error) {
    console.error('Error creating playlist recommendation notification:', error);
  }
};

// Admin creates notification for specific user or all creators
const createAdminNotification = async (req, res) => {
  try {
    const { recipientId, title, message, type = 'info', sendToAllCreators = false, sendToAllUsers = false } = req.body;
    const adminId = req.user._id;

    if (sendToAllUsers) {
      // Send to all users (fans and creators)
      const users = await User.find({ role: { $in: ['fan', 'creator'] } }).select('_id');
      
      const notifications = await Promise.all(
        users.map(user => 
          Notification.create({
            recipientId: user._id,
            senderId: adminId,
            title,
            message,
            type,
            data: { sentByAdmin: true }
          })
        )
      );

      res.status(201).json({ 
        message: `Notification sent to ${notifications.length} users`,
        notifications: notifications.slice(0, 5) // Return first 5 as sample
      });
    } else if (sendToAllCreators) {
      // Send to all creators
      const creators = await User.find({ role: 'creator' }).select('_id');
      
      const notifications = await Promise.all(
        creators.map(creator => 
          Notification.create({
            recipientId: creator._id,
            senderId: adminId,
            title,
            message,
            type,
            data: { sentByAdmin: true }
          })
        )
      );

      res.status(201).json({ 
        message: `Notification sent to ${notifications.length} creators`,
        notifications: notifications.slice(0, 5) // Return first 5 as sample
      });
    } else {
      // Send to specific user
      if (!recipientId) {
        return res.status(400).json({ message: 'Recipient ID is required' });
      }

      // Verify user exists
      const recipientUser = await User.findById(recipientId);
      if (!recipientUser) {
        return res.status(404).json({ message: 'Recipient user not found' });
      }

      const notification = await Notification.create({
        recipientId,
        senderId: adminId,
        title,
        message,
        type,
        data: { sentByAdmin: true }
      });

      // Try to send push notification (won't fail if user hasn't subscribed)
      try {
        const pushResult = await sendPushNotification(recipientId, {
          title,
          message,
          type,
          data: { sentByAdmin: true }
        });
        
        if (pushResult.success) {
          notification.pushSent = true;
          notification.pushDelivered = true;
          await notification.save();
        }
      } catch (pushError) {
        // Push notification failed, but database notification still created
        console.log(`Push notification failed for user ${recipientId}, but database notification created`);
      }

      res.status(201).json(notification);
    }
  } catch (error) {
    console.error('Error in createAdminNotification:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get all notifications sent by admins
const getAdminNotifications = async (req, res) => {
  try {
    const adminId = req.user._id;
    const { page = 1, limit = 20 } = req.query;

    const notifications = await Notification.find({ senderId: adminId })
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .populate('recipientId', 'name email role');

    const total = await Notification.countDocuments({ senderId: adminId });

    res.json({
      notifications,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      total
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Creator replies to admin notification
const replyToNotification = async (req, res) => {
  try {
    const notificationId = req.params.id;
    const { replyMessage } = req.body;
    const creatorId = req.user._id;

    if (!replyMessage) {
      return res.status(400).json({ message: 'Reply message is required' });
    }

    // Find the original notification
    const originalNotification = await Notification.findById(notificationId);
    
    if (!originalNotification) {
      return res.status(404).json({ message: 'Notification not found' });
    }

    if (originalNotification.recipientId.toString() !== creatorId.toString()) {
      return res.status(403).json({ message: 'Not authorized to reply to this notification' });
    }

    // Create reply notification to admin
    const replyNotification = await Notification.create({
      recipientId: originalNotification.senderId, // Send reply to original sender (admin)
      senderId: creatorId,
      title: `Reply to: ${originalNotification.title}`,
      message: replyMessage,
      type: 'reply',
      data: {
        originalNotificationId: notificationId,
        isReply: true
      }
    });

    // Mark original notification as replied
    originalNotification.data = {
      ...originalNotification.data,
      replied: true,
      repliedAt: new Date(),
      replyNotificationId: replyNotification._id
    };
    await originalNotification.save();

    res.status(201).json(replyNotification);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createNotification,
  getUserNotifications,
  markAsRead,
  markAllAsRead,
  deleteNotification,
  getUnreadCount,
  createAdminNotification,
  getAdminNotifications,
  replyToNotification,
  createTrackDeletionNotification,
  createNewTrackNotification,
  createPlaylistRecommendationNotification
};