const webpush = require('web-push');
const PushSubscription = require('../models/PushSubscription');
const Notification = require('../models/Notification');

// Configure web-push with VAPID keys
// In production, these should be stored in environment variables
const vapidKeys = {
  publicKey: process.env.VAPID_PUBLIC_KEY || 'YOUR_VAPID_PUBLIC_KEY_HERE',
  privateKey: process.env.VAPID_PRIVATE_KEY || 'YOUR_VAPID_PRIVATE_KEY_HERE'
};

webpush.setVapidDetails(
  'mailto:admin@muzikax.com',
  vapidKeys.publicKey,
  vapidKeys.privateKey
);

// Subscribe user to push notifications
const subscribeToPush = async (req, res) => {
  try {
    const { subscription } = req.body;
    const userId = req.user._id;

    if (!subscription || !subscription.endpoint) {
      return res.status(400).json({ message: 'Invalid subscription data' });
    }

    // Check if subscription already exists
    const existingSubscription = await PushSubscription.findOne({
      endpoint: subscription.endpoint
    });

    if (existingSubscription) {
      // Update existing subscription
      existingSubscription.userId = userId;
      existingSubscription.keys = subscription.keys;
      existingSubscription.deviceInfo = {
        userAgent: req.headers['user-agent'],
        platform: req.headers['sec-ch-ua-platform'] || 'unknown',
        browser: req.headers['sec-ch-ua'] || 'unknown'
      };
      existingSubscription.active = true;
      await existingSubscription.save();
      
      return res.json({ 
        message: 'Subscription updated successfully',
        subscription: existingSubscription 
      });
    }

    // Create new subscription
    const newSubscription = new PushSubscription({
      userId,
      endpoint: subscription.endpoint,
      keys: subscription.keys,
      deviceInfo: {
        userAgent: req.headers['user-agent'],
        platform: req.headers['sec-ch-ua-platform'] || 'unknown',
        browser: req.headers['sec-ch-ua'] || 'unknown'
      }
    });

    await newSubscription.save();

    res.status(201).json({ 
      message: 'Subscribed to push notifications successfully',
      subscription: newSubscription 
    });
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    res.status(500).json({ message: error.message });
  }
};

// Unsubscribe from push notifications
const unsubscribeFromPush = async (req, res) => {
  try {
    const { endpoint } = req.body;
    const userId = req.user._id;

    const subscription = await PushSubscription.findOne({ endpoint });

    if (!subscription) {
      return res.status(404).json({ message: 'Subscription not found' });
    }

    if (subscription.userId.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to unsubscribe this endpoint' });
    }

    // Mark as inactive instead of deleting
    subscription.active = false;
    await subscription.save();

    res.json({ message: 'Unsubscribed from push notifications successfully' });
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    res.status(500).json({ message: error.message });
  }
};

// Get user's push subscriptions
const getUserSubscriptions = async (req, res) => {
  try {
    const userId = req.user._id;
    
    const subscriptions = await PushSubscription.find({ 
      userId,
      active: true 
    }).select('-keys.auth');

    res.json({ subscriptions });
  } catch (error) {
    console.error('Error fetching user subscriptions:', error);
    res.status(500).json({ message: error.message });
  }
};

// Send push notification to a specific user
const sendPushNotification = async (userId, notificationData) => {
  try {
    const subscriptions = await PushSubscription.find({ 
      userId,
      active: true 
    });

    if (subscriptions.length === 0) {
      console.log(`No active subscriptions found for user ${userId}`);
      return { success: false, message: 'No active subscriptions' };
    }

    const payload = JSON.stringify({
      title: notificationData.title,
      body: notificationData.message,
      icon: '/android-chrome-192x192.png',
      badge: '/favicon-32x32.png',
      data: {
        ...notificationData.data,
        notificationType: notificationData.type
      },
      timestamp: Date.now()
    });

    const results = await Promise.allSettled(
      subscriptions.map(subscription => 
        webpush.sendNotification(
          {
            endpoint: subscription.endpoint,
            keys: subscription.keys
          },
          payload
        ).catch(error => {
          console.error(`Failed to send push to ${subscription.endpoint}:`, error);
          // If subscription is invalid, mark it as inactive
          if (error.statusCode === 410 || error.statusCode === 404) {
            subscription.active = false;
            subscription.save().catch(err => console.error('Error deactivating subscription:', err));
          }
          throw error;
        })
      )
    );

    const successful = results.filter(result => result.status === 'fulfilled').length;
    const failed = results.filter(result => result.status === 'rejected').length;

    console.log(`Push notification results - Success: ${successful}, Failed: ${failed}`);

    return {
      success: successful > 0,
      successful,
      failed,
      total: subscriptions.length
    };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return { success: false, message: error.message };
  }
};

// Send push notification for track deletion
const sendTrackDeletionPush = async (creatorId, trackTitle, reason) => {
  const notificationData = {
    title: 'Track Deleted',
    message: `Your track "${trackTitle}" has been deleted. Reason: ${reason}`,
    type: 'track_deleted',
    data: {
      trackTitle,
      reason
    }
  };

  return await sendPushNotification(creatorId, notificationData);
};

// Send push notification for new track release
const sendNewTrackPush = async (followerIds, creatorName, trackTitle) => {
  const notificationData = {
    title: 'New Track Alert',
    message: `${creatorName} just released a new track: ${trackTitle}`,
    type: 'new_track',
    data: {
      creatorName,
      trackTitle
    }
  };

  // Send to all followers
  const results = await Promise.all(
    followerIds.map(userId => sendPushNotification(userId, notificationData))
  );

  return results;
};

// Send push notification for playlist recommendations
const sendPlaylistRecommendationPush = async (userId, playlistName, trackCount) => {
  const notificationData = {
    title: 'New Playlist Recommendation',
    message: `Check out "${playlistName}" with ${trackCount} tracks just for you!`,
    type: 'playlist_recommendation',
    data: {
      playlistName,
      trackCount
    }
  };

  return await sendPushNotification(userId, notificationData);
};

// Bulk send push notifications
const sendBulkPushNotifications = async (userIds, notificationData) => {
  const results = await Promise.all(
    userIds.map(userId => sendPushNotification(userId, notificationData))
  );

  const successful = results.filter(result => result.success).length;
  const total = results.length;

  return {
    successful,
    total,
    results
  };
};

module.exports = {
  subscribeToPush,
  unsubscribeFromPush,
  getUserSubscriptions,
  sendPushNotification,
  sendTrackDeletionPush,
  sendNewTrackPush,
  sendPlaylistRecommendationPush,
  sendBulkPushNotifications
};