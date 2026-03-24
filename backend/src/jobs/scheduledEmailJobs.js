const cron = require('node-cron');
const {
  sendWeeklyTrendingEmail,
  sendRecommendedArtistsWeeklyEmail
} = require('../controllers/notificationEmailController');
const OTP = require('../models/OTP');

/**
 * Initialize scheduled jobs for email notifications
 */
const initializeScheduledJobs = () => {
  console.log('📅 Initializing scheduled email jobs...');

  // Job 1: Send weekly trending songs every Monday at 9:00 AM
  cron.schedule('0 9 * * 1', async () => {
    console.log('⏰ Running weekly trending email job...');
    try {
      await sendWeeklyTrendingEmail();
    } catch (error) {
      console.error('Error in weekly trending email job:', error);
    }
  }, {
    timezone: 'UTC'
  });
  console.log('✅ Weekly trending email scheduled: Every Monday at 9:00 AM UTC');

  // Job 2: Send recommended artists every Wednesday at 10:00 AM
  cron.schedule('0 10 * * 3', async () => {
    console.log('⏰ Running recommended artists email job...');
    try {
      await sendRecommendedArtistsWeeklyEmail();
    } catch (error) {
      console.error('Error in recommended artists email job:', error);
    }
  }, {
    timezone: 'UTC'
  });
  console.log('✅ Recommended artists email scheduled: Every Wednesday at 10:00 AM UTC');

  // Job 3: Clean up expired OTPs every hour
  cron.schedule('0 * * * *', async () => {
    try {
      const deletedCount = await OTP.cleanupExpired();
      if (deletedCount > 0) {
        console.log(`🧹 Cleaned up ${deletedCount} expired OTPs`);
      }
    } catch (error) {
      console.error('Error cleaning up expired OTPs:', error);
    }
  }, {
    timezone: 'UTC'
  });
  console.log('✅ OTP cleanup scheduled: Every hour');

  console.log('🎉 All scheduled jobs initialized successfully!');
};

/**
 * Manual trigger functions for testing
 */
const manualTriggerWeeklyTrending = async () => {
  console.log('🔧 Manually triggering weekly trending email...');
  await sendWeeklyTrendingEmail();
};

const manualTriggerRecommendations = async () => {
  console.log('🔧 Manually triggering recommended artists email...');
  await sendRecommendedArtistsWeeklyEmail();
};

module.exports = {
  initializeScheduledJobs,
  manualTriggerWeeklyTrending,
  manualTriggerRecommendations
};
